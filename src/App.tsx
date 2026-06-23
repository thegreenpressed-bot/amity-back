/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Heart, RefreshCw, Eye } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './utils/firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import ContributeForm from './components/ContributeForm';
import ContributorsList from './components/ContributorsList';
import AdminPanel from './components/AdminPanel';
import { Contribution, FundSettings } from './types';
import { SEED_CONTRIBUTIONS, DEFAULT_SETTINGS } from './seedData';

interface SaveStructure {
  settings: FundSettings;
  contributions: Contribution[];
}

export default function App() {
  const [data, setData] = useState<SaveStructure>({
    settings: DEFAULT_SETTINGS,
    contributions: SEED_CONTRIBUTIONS
  });
  const [loading, setLoading] = useState(true);

  // Sync settings of Campaign from Firestore
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'main');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const settingsData = snapshot.data();
        const targetAmount = typeof settingsData?.targetAmount === 'number' && settingsData.targetAmount > 0 
          ? settingsData.targetAmount 
          : DEFAULT_SETTINGS.targetAmount;
        const coordinatorName = typeof settingsData?.coordinatorName === 'string' && settingsData.coordinatorName.trim() !== ''
          ? settingsData.coordinatorName
          : DEFAULT_SETTINGS.coordinatorName;

        setData((prev) => ({
          ...prev,
          settings: { targetAmount, coordinatorName }
        }));
      } else {
        // Initialize with DEFAULT_SETTINGS if not found on database side
        setDoc(settingsRef, DEFAULT_SETTINGS).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, 'settings/main');
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });
    return () => unsubscribe();
  }, []);

  // Sync contributions ledger list from Firestore in real-time
  useEffect(() => {
    const contributionsRef = collection(db, 'contributions');
    const unsubscribe = onSnapshot(contributionsRef, (snapshot) => {
      const contributionsList: Contribution[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data();
        if (docData) {
          contributionsList.push({
            id: docData.id || doc.id || '',
            studentName: docData.studentName || 'Anonymous',
            enrollmentNumber: docData.enrollmentNumber || 'N/A',
            branch: docData.branch || 'General',
            semester: typeof docData.semester === 'string' ? docData.semester : String(docData.semester || '1'),
            amount: typeof docData.amount === 'number' ? docData.amount : 0,
            paymentMethod: docData.paymentMethod || 'Other',
            referenceNumber: docData.referenceNumber || '',
            status: docData.status === 'Verified' || docData.status === 'Pending Verification' 
              ? docData.status 
              : 'Pending Verification',
            timestamp: docData.timestamp || new Date().toISOString()
          });
        }
      });
      // Sort by timestamp descending
      contributionsList.sort((a, b) => {
        const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tB - tA;
      });
      setData((prev) => ({
        ...prev,
        contributions: contributionsList
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contributions');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Admin visibility & security state
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    submessage?: string;
    type: 'success' | 'info' | 'deleted';
  }>({
    show: false,
    message: '',
    submessage: '',
    type: 'success'
  });

  const triggerToast = (message: string, submessage = '', type: 'success' | 'info' | 'deleted' = 'success') => {
    setToast({
      show: true,
      message,
      submessage,
      type
    });
  };

  // Automatically dismiss toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Generate a unique contribution ID for each submission.
  // The ID is in the format ABEF-XXXX, where XXXX is a sequential number.
  // Calculates the next sequential ID based on the globally synced database entries.
  const generateContributionId = (): string => {
    let maxNum = 0;
    data.contributions.forEach((item) => {
      const match = item.id.match(/ABEF-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNumber = maxNum + 1;
    return `ABEF-${String(nextNumber).padStart(4, '0')}`;
  };

  // Add new Contribution
  const handleAddContribution = async (newVal: Omit<Contribution, 'id' | 'status' | 'timestamp'>) => {
    const nextId = generateContributionId();
    const entry: Contribution = {
      ...newVal,
      id: nextId,
      status: 'Pending Verification',
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'contributions', nextId), entry);
      triggerToast(
        "Submission Received! 🎉",
        `Your transaction ID ${nextId} is recorded and pending confirmation by the coordinator.`,
        'success'
      );
    } catch (e) {
      console.error("Failed to add contribution in Firestore:", e);
      triggerToast(
        "Submission Error",
        "Could not save your contribution securely. Please retry.",
        'deleted'
      );
      handleFirestoreError(e, OperationType.CREATE, `contributions/${nextId}`);
    }
  };

  // Change contribution status (Verify/Unverify)
  const handleVerify = async (id: string, newStatus: 'Pending Verification' | 'Verified') => {
    try {
      await updateDoc(doc(db, 'contributions', id), { status: newStatus });
      triggerToast(
        newStatus === 'Verified' ? "Contribution Verified! ✅" : "Status Changed to Pending ⏳",
        `Record ${id} has been successfully updated.`,
        newStatus === 'Verified' ? 'success' : 'info'
      );
    } catch (e) {
      console.error("Failed to update status in Firestore:", e);
      handleFirestoreError(e, OperationType.UPDATE, `contributions/${id}`);
    }
  };

  // Delete submission
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contributions', id));
      triggerToast(
        "Submission Record Deleted",
        `The contribution record ${id} has been pruned from the ledger.`,
        'deleted'
      );
    } catch (e) {
      console.error("Failed to delete contribution in Firestore:", e);
      handleFirestoreError(e, OperationType.DELETE, `contributions/${id}`);
    }
  };

  // Change Campaign Parameters (Settings)
  const handleSaveSettings = async (newSettings: FundSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'main'), newSettings);
      triggerToast(
        "Campaign Settings Applied ⚙️",
        `Target amount: ₹${newSettings.targetAmount.toLocaleString('en-IN')}`,
        'info'
      );
    } catch (e) {
      console.error("Failed to save settings to Firestore:", e);
      handleFirestoreError(e, OperationType.WRITE, 'settings/main');
    }
  };

  // Completely reset database back to seed template in Firestore
  const handleResetSeedData = async () => {
    try {
      // Reset settings
      await setDoc(doc(db, 'settings', 'main'), DEFAULT_SETTINGS);

      // Clean all contributions
      const promises = data.contributions.map((item) => deleteDoc(doc(db, 'contributions', item.id)));
      await Promise.all(promises);

      setIsAdminUnlocked(false);
      setIsAdminPanelOpen(false);
      triggerToast(
        "Database Refreshed! 🔄",
        "Contributions reset back to standard tutorial seed values.",
        'info'
      );
    } catch (e) {
      console.error("Error refreshing Firebase database:", e);
      handleFirestoreError(e, OperationType.WRITE, 'reset_database');
    }
  };

  // Unlock Admin Security
  const handleUnlockAdmin = (password: string) => {
    if (password === 'amity2024') {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  // Log Out Admin Security
  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setIsAdminPanelOpen(false);
    triggerToast("Admin Session Terminated", "You have successfully logged out.", "info");
  };

  // Core Math Calculations
  const totalAmountSubmittedList = data.contributions;
  const totalCollectedSum = totalAmountSubmittedList.reduce((acc, c) => acc + c.amount, 0);
  const totalVerifiedSum = totalAmountSubmittedList
    .filter((c) => c.status === 'Verified')
    .reduce((acc, c) => acc + c.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
        <p className="mt-4 text-stone-600 font-sans font-medium text-sm">Synchronizing ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      
      {/* 1. Header Toolbar */}
      <Header
        isAdmin={isAdminUnlocked}
        onAdminToggle={() => {
          setIsAdminPanelOpen(true);
        }}
      />

      {/* 2. Main content pages */}
      <main className="flex-1 pb-16">
        
        {/* Hero Area + Summary Metrics */}
        <Hero
          totalCollected={totalCollectedSum}
          verifiedCollected={totalVerifiedSum}
          totalContributors={data.contributions.length}
          targetAmount={data.settings.targetAmount}
        />

        {/* Double Column content framework */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Section Selector & Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <ContributeForm onSubmit={handleAddContribution} />
            </div>

            {/* Live Ledger Table */}
            <div className="lg:col-span-7">
              <ContributorsList contributions={data.contributions} />
            </div>

          </div>
        </div>
      </main>

      {/* 3. Global Footer bar */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-sm font-semibold tracking-wide text-stone-300">
            {data.settings.coordinatorName} | Amity University
          </p>
          <p className="text-[11px] text-stone-500 font-light max-w-lg mx-auto leading-relaxed">
            All submitted transaction reference IDs, student enrollment information, and contribution statistics are securely synced onto a persistent cloud ledger. Subject to college clearance.
          </p>
          <div className="flex justify-center items-center space-x-2 text-[10px] text-stone-600 font-mono mt-4">
            <Heart className="h-3 w-3 text-red-700 fill-red-700 inline animate-pulse" />
            <span>Built for Amity Students</span>
            <span>•</span>
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="hover:text-amber-500 underline uppercase tracking-widest text-[9px] font-bold"
            >
              Access Admin Hub
            </button>
          </div>
        </div>
      </footer>

      {/* 4. Overlay Coordinator Control Panel Screen */}
      {isAdminPanelOpen && (
        <AdminPanel
          contributions={data.contributions}
          onVerify={handleVerify}
          onDelete={handleDelete}
          settings={data.settings}
          onSaveSettings={handleSaveSettings}
          onResetSeedData={handleResetSeedData}
          onClose={() => setIsAdminPanelOpen(false)}
          isUnlocked={isAdminUnlocked}
          onUnlock={handleUnlockAdmin}
          onLock={handleLockAdmin}
        />
      )}

      {/* 5. Custom Slide-up Toast Notifications */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 animate-slide-up flex gap-3.5 transition-all duration-300 transform">
          <div className="shrink-0 pt-0.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="h-6 w-6 text-emerald-400 font-bold" />
            )}
            {toast.type === 'info' && (
              <Sparkles className="h-6 w-6 text-amber-400" />
            )}
            {toast.type === 'deleted' && (
              <ShieldAlert className="h-6 w-6 text-red-500" />
            )}
          </div>
          
          <div className="flex-1">
            <h5 className="text-xs sm:text-sm font-bold text-slate-100">{toast.message}</h5>
            {toast.submessage && (
              <p className="text-[11px] text-slate-400 font-light mt-1 leading-relaxed">
                {toast.submessage}
              </p>
            )}
          </div>

          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-200 transition text-xs font-semibold focus:outline-none shrink-0"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
