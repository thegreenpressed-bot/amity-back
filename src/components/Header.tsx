/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, ShieldCheck, Lock, Unlock } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onAdminToggle: () => void;
}

export default function Header({ isAdmin, onAdminToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#8B0000] text-white shadow-md border-b border-[#a81a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div id="brand-container" className="flex items-center space-x-3">
          <div className="bg-amber-400 p-2 rounded-lg text-[#8B0000] shadow-inner font-bold text-xs tracking-wider">
            AMITY
          </div>
          <div>
            <h1 id="app-title" className="font-sans font-bold tracking-tight text-white text-base sm:text-lg md:text-xl">
              Amity Back Exam Fund
            </h1>
            <p className="text-[10px] text-red-200 uppercase font-mono tracking-widest hidden sm:block">
              Exam Fee Collection Portal
            </p>
          </div>
        </div>

        {/* Action Button: Admin Status */}
        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-mono font-medium">
              <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
              <span>Admin Session</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-red-950/20 text-red-100 rounded-full text-xs font-mono font-medium">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Student View</span>
            </div>
          )}

          <button
            id="admin-lock-btn"
            onClick={onAdminToggle}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm ${
              isAdmin
                ? "bg-amber-500 hover:bg-amber-400 text-[#8B0000] active:scale-95"
                : "bg-black/20 hover:bg-black/40 border border-white/10 text-white active:scale-95"
            }`}
            title={isAdmin ? "Open Admin Dashboard" : "Authenticate as Admin"}
          >
            {isAdmin ? (
              <>
                <Unlock className="h-4 w-4" />
                <span className="text-xs font-semibold">Admin Panel</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span className="text-xs font-semibold">Admin Lock</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
