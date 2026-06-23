/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Unlock, Check, Trash2, Eye, ShieldAlert, Download, Settings, RefreshCw, X } from 'lucide-react';
import { Contribution, FundSettings } from '../types';

interface AdminPanelProps {
  contributions: Contribution[];
  onVerify: (id: string, newStatus: 'Pending Verification' | 'Verified') => void;
  onDelete: (id: string) => void;
  settings: FundSettings;
  onSaveSettings: (settings: FundSettings) => void;
  onResetSeedData: () => void;
  onClose: () => void;
  isUnlocked: boolean;
  onUnlock: (password: string) => boolean;
  onLock: () => void;
}

export default function AdminPanel({
  contributions,
  onVerify,
  onDelete,
  settings,
  onSaveSettings,
  onResetSeedData,
  onClose,
  isUnlocked,
  onUnlock,
  onLock,
}: AdminPanelProps) {
  // Password state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Settings form states
  const [targetVal, setTargetVal] = useState(String(settings.targetAmount));
  const [coordVal, setCoordVal] = useState(settings.coordinatorName);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Custom visual confirmation states for iframe sandbox compliance
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [targetError, setTargetError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(passwordInput);
    if (success) {
      setPasswordInput('');
      setLoginError('');
      // Synchronize input fields with current config
      setTargetVal(String(settings.targetAmount));
      setCoordVal(settings.coordinatorName);
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetVal);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setTargetError("Please specify a valid dynamic target amount.");
      return;
    }
    setTargetError('');
    onSaveSettings({
      targetAmount: parsedTarget,
      coordinatorName: coordVal.trim() || "Back Exam Coordinator"
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = ["ID", "Student Name", "Enrollment Number", "Branch", "Semester", "Amount", "Payment Method", "Reference Number", "Status", "Timestamp"];
    
    const csvString = [
      headers.join(","),
      ...contributions.map(item => [
        item.id,
        `"${item.studentName.replace(/"/g, '""')}"`,
        item.enrollmentNumber,
        `"${item.branch.replace(/"/g, '""')}"`,
        item.semester,
        item.amount,
        item.paymentMethod,
        `"${(item.referenceNumber || '').replace(/"/g, '""')}"`,
        item.status,
        item.timestamp
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `amity_back_exam_contributions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-[#8B0000] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isUnlocked ? <Unlock className="h-5 w-5 text-amber-300" /> : <Lock className="h-5 w-5 text-amber-300" />}
            <span className="font-sans font-bold text-base tracking-wide">Coordinator Admin Center</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition duration-150 p-1 bg-white/10 hover:bg-white/20 rounded-lg"
            title="Close Admin Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isUnlocked ? (
            
            /* --- PASSWORD PROMPT SCREEN --- */
            <div className="max-w-md mx-auto py-12 text-center">
              <div className="mx-auto bg-red-50 text-[#8B0000] w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coordinator Passcode Required</h3>
              <p className="text-sm text-gray-500 mb-6 font-light">
                Please authenticate using your security coordinator password to configure settings, verify collections, or delete ledger records.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Enter Admin Password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-center px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 text-sm font-semibold tracking-wide"
                    autoFocus
                  />
                  {loginError && (
                    <p className="text-xs text-red-500 font-semibold mt-2.5">{loginError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel / Student View
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#8B0000] hover:bg-[#700000] text-white rounded-xl text-xs font-semibold shadow transition"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>

          ) : (

            /* --- FULL ADMIN INTERFACE --- */
            <div className="space-y-8">
              
              {/* Top Row: Quick actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h4 className="text-md font-bold text-gray-900">Live Management Console</h4>
                  <p className="text-xs text-gray-500 font-light">
                    As an authorized coordinator, you can review payments and verify them instantly in student lists.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  {/* Export CSV button */}
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV Report</span>
                  </button>

                  {/* Seed Restore button */}
                  {showResetConfirm ? (
                    <div className="flex items-center space-x-1 border border-amber-300 bg-amber-50 rounded-xl px-2 py-1 animate-fade-in text-xs">
                      <span className="text-[10px] text-amber-800 font-bold uppercase mr-1">Reset all data?</span>
                      <button
                        onClick={() => {
                          onResetSeedData();
                          setShowResetConfirm(false);
                        }}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[10px] font-bold transition active:scale-95"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-[10px] font-bold transition hover:bg-gray-50"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-semibold transition active:scale-95"
                      title="Restore default mock data"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Seed Data</span>
                    </button>
                  )}

                  <button
                    onClick={onLock}
                    className="px-3.5 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-semibold transition active:scale-95"
                  >
                    Logout Admin
                  </button>
                </div>
              </div>

              {/* Grid: 2 columns for Settings and Contributions approval */}
              <div id="admin-sections-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column A: Dynamic settings form */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-fit">
                  <h5 className="text-sm font-bold text-gray-800 flex items-center space-x-2 mb-4">
                    <Settings className="h-4 w-4 text-[#8B0000]" />
                    <span>Campaign Parameters</span>
                  </h5>

                  <form onSubmit={handleSettingsSave} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Coordinator Name
                      </label>
                      <input
                        type="text"
                        value={coordVal}
                        onChange={(e) => setCoordVal(e.target.value)}
                        placeholder="Coordinator Label in Footer"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#8B0000]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Target Amount (INR)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={targetVal}
                          onChange={(e) => setTargetVal(e.target.value)}
                          placeholder="e.g. 15000"
                          className={`w-full bg-white border rounded-xl pl-6.5 pr-3.5 py-2 text-xs font-bold font-mono text-gray-800 outline-none ${
                            targetError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#8B0000]'
                          }`}
                        />
                      </div>
                      {targetError && (
                        <p className="text-[9px] text-red-500 font-semibold mt-1 leading-tight">{targetError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Apply Parameters
                    </button>

                    {settingsSuccess && (
                      <p className="text-center text-[11px] text-emerald-600 font-bold bg-emerald-50 rounded-lg p-2 animate-fade-in">
                        Settings updated successfully!
                      </p>
                    )}
                  </form>
                </div>

                {/* Column B: Contributions Verifications List */}
                <div className="lg:col-span-2 border border-gray-200 rounded-2xl overflow-hidden flex flex-col bg-white">
                  
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-150">
                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Ledger Moderation Queue ({contributions.length})
                    </h5>
                  </div>

                  <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                    {contributions.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        No submissions recorded to manage yet.
                      </div>
                    ) : (
                      contributions.map((c) => (
                        <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[10px] font-black text-red-900 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                {c.id}
                              </span>
                              <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                                {c.studentName}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 font-normal">
                              Semester {c.semester} • {c.branch} • <strong className="text-slate-800 font-mono">₹{c.amount}</strong> via <span className="font-semibold text-slate-700">{c.paymentMethod}</span>
                            </div>

                            {c.referenceNumber && (
                              <div className="text-[10px] text-amber-800 font-mono bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded w-fit mt-1">
                                Ref: {c.referenceNumber}
                              </div>
                            )}
                          </div>

                          {/* Approval and delete buttons */}
                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                            {c.status !== 'Verified' ? (
                              <button
                                onClick={() => onVerify(c.id, 'Verified')}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-[#8B0000]/5 hover:text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition active:scale-95"
                                title="Approve Verification"
                              >
                                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span>Verify</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onVerify(c.id, 'Pending Verification')}
                                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300 rounded-lg text-[11px] font-medium transition active:scale-95 opacity-80"
                                title="Demote to Pending"
                              >
                                <span>Mark Pending</span>
                              </button>
                            )}

                            {deletingId === c.id ? (
                              <div className="flex items-center space-x-1.5 bg-red-50 border border-red-200 rounded-lg p-1 animate-fade-in text-xs">
                                <span className="text-[10px] text-red-700 font-bold uppercase px-1">Delete?</span>
                                <button
                                  onClick={() => {
                                    onDelete(c.id);
                                    setDeletingId(null);
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-[10px] font-medium transition hover:bg-gray-50"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(c.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition active:scale-95 animate-fade-in"
                                title="Delete Entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>
              
              {/* Notice in footer of modal */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start space-x-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-[#8B0000] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#8B0000] font-light leading-relaxed">
                  Remember to securely verify each bank reference ID or cash transfer against your official bank app or coordinator ledger book before toggling verifying flags.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
