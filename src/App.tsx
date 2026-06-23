/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldAlert, Heart, RefreshCw, Eye } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import ContributeForm from './components/ContributeForm';
import ContributorsList from './components/ContributorsList';
import AdminPanel from './components/AdminPanel';
import { Contribution, FundSettings } from './types';
import { SEED_CONTRIBUTIONS, DEFAULT_SETTINGS } from './seedData';
import { safeStorage } from './utils/storage';

interface SaveStructure {
  settings: FundSettings;
  contributions: Contribution[];
}

export default function App() {
  const [data, setData] = useState<SaveStructure>(() => {
    try {
      const persisted = safeStorage.getItem('amityBackExamFund');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed && parsed.settings && parsed.contributions) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load local storage data:", e);
    }
    
    // Fallback/Seed Data if none exists
    return {
      settings: DEFAULT_SETTINGS,
      contributions: SEED_CONTRIBUTIONS
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      safeStorage.setItem('amityBackExamFund', JSON.stringify(data));
    } catch (e) {
      console.error("Effect save failed:", e);
    }
  }, [data]);

  // Ensure the data is saved before the user leaves the page safely
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        safeStorage.setItem('amityBackExamFund', JSON.stringify(data));
      } catch (e) {
        console.error("Unload save failed:", e);
      }
    };
    try {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } catch (e) {
      console.warn("Could not register beforeunload event listener (sandboxed iframe constraints):", e);
    }
    return () => {
      try {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      } catch (e) {
        console.warn("Could not remove beforeunload event listener:", e);
      }
    };
  }, [data]);

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
  // Store the last used number in localStorage to ensure uniqueness across sessions.
  const generateContributionId = (): string => {
    const storedLastNumber = safeStorage.getItem('amityBackExamFund_LastID');
    let lastNumber = 0; // default initial value for a clean production database

    if (storedLastNumber) {
      const parsed = parseInt(storedLastNumber, 10);
      if (!isNaN(parsed)) {
        lastNumber = parsed;
      }
    } else {
      // Fallback calculation from any current items inside the database if state has content
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
      lastNumber = maxNum;
    }

    const nextNumber = lastNumber + 1;
    safeStorage.setItem('amityBackExamFund_LastID', String(nextNumber));
    return `ABEF-${String(nextNumber).padStart(4, '0')}`;
  };

  // Add new Contribution
  const handleAddContribution = (newVal: Omit<Contribution, 'id' | 'status' | 'timestamp'>) => {
    const nextId = generateContributionId();
    const entry: Contribution = {
      ...newVal,
      id: nextId,
      status: 'Pending Verification',
      timestamp: new Date().toISOString()
    };

    setData((prev) => ({
      ...prev,
      contributions: [entry, ...prev.contributions]
    }));

    triggerToast(
      "Submission Received! 🎉",
      `Your transaction ID ${nextId} is recorded and pending confirmation by the coordinator.`,
      'success'
    );
  };

  // Change contribution status (Verify/Unverify)
  const handleVerify = (id: string, newStatus: 'Pending Verification' | 'Verified') => {
    setData((prev) => ({
      ...prev,
      contributions: prev.contributions.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    }));

    triggerToast(
      newStatus === 'Verified' ? "Contribution Verified! ✅" : "Status Changed to Pending ⏳",
      `Record ${id} has been successfully updated.`,
      newStatus === 'Verified' ? 'success' : 'info'
    );
  };

  // Delete submission
  const handleDelete = (id: string) => {
    setData((prev) => ({
      ...prev,
      contributions: prev.contributions.filter((item) => item.id !== id)
    }));

    triggerToast(
      "Submission Record Deleted",
      `The contribution record ${id} has been pruned from the ledger.`,
      'deleted'
    );
  };

  // Change Campaign Parameters (Settings)
  const handleSaveSettings = (newSettings: FundSettings) => {
    setData((prev) => ({
      ...prev,
      settings: newSettings
    }));
    triggerToast(
      "Campaign Settings Applied ⚙️",
      `Target amount: ₹${newSettings.targetAmount.toLocaleString('en-IN')}`,
      'info'
    );
  };

  // Completely reset database back to seed template
  const handleResetSeedData = () => {
    setData({
      settings: DEFAULT_SETTINGS,
      contributions: SEED_CONTRIBUTIONS
    });
    setIsAdminUnlocked(false);
    setIsAdminPanelOpen(false);
    triggerToast(
      "Database Refreshed! 🔄",
      "Contributions reset back to standard tutorial seed values.",
      'info'
    );
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
            All submitted transaction reference IDs, student enrollment information, and contribution statistics are strictly stored in local browser environment space. Subject to college clearance.
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
