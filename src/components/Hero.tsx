/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Target, Users, Landmark, BadgeCheck, AlertCircle } from 'lucide-react';

interface HeroProps {
  totalCollected: number;
  verifiedCollected: number;
  totalContributors: number;
  targetAmount: number;
}

export default function Hero({
  totalCollected,
  verifiedCollected,
  totalContributors,
  targetAmount,
}: HeroProps) {
  // Animated progress percentage
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const rawPercent = targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
  const verifiedRawPercent = targetAmount > 0 ? (verifiedCollected / targetAmount) * 100 : 0;
  const displayPercent = Math.min(Math.round(rawPercent), 100);
  const displayVerifiedPercent = Math.min(Math.round(verifiedRawPercent), 100);

  useEffect(() => {
    // Smooth transition from 0 to real percent on mount or value change
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(rawPercent, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [rawPercent]);

  const amountRemaining = Math.max(0, targetAmount - totalCollected);

  return (
    <div id="hero-section" className="w-full bg-[#fcf8f8] border-b border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Card */}
        <div className="bg-gradient-to-br from-[#8B0000] to-[#5a0000] rounded-2xl text-white p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden mb-10 transition-all duration-300">
          
          {/* Subtle design elements */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,white_30%,transparent_70%)]"></div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>

          <div className="max-w-3xl relative z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-[#8B0000] mb-4 tracking-wider uppercase font-mono shadow-sm">
              Official Pool
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
              Amity Back Exam Fund
            </h2>
            <p className="text-[15px] font-bold text-red-100 mb-6 leading-relaxed whitespace-pre-line">
              {"Dost,\n\nZindagi ne ek aur imtihaan liya. Aur main... fail ho gaya. 😔\n\nBack paper aaya hai. Fees bharna hai. Account mein sirf self-respect hai aur woh bhi zyada nahi bachi. 🪦\n\nBus ₹100 chahiye. Ek baar. Last baar. (Pakka last baar is baar.)\n\nAgar tune nahi diya toh main phir bhi theek rahunga BUT I will remember. 👀\n\nTera dost jo padhai mein thoda weak hai lekin dosti mein solid hai, 🫡"}
            </p>

            {/* Progress Container */}
            <div className="bg-black/20 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-amber-300">
                  Fundraising Progress
                </span>
                <span className="text-xs font-mono font-bold text-white px-2 py-0.5 bg-white/10 rounded-md">
                  {displayPercent}% Collected
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden p-[2px] shadow-inner">
                <div
                  className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 h-full rounded-full transition-all duration-1000 ease-out shadow flex justify-end items-center px-1"
                  style={{ width: `${animatedProgress}%` }}
                >
                  {displayPercent > 10 && (
                    <span className="text-[9px] font-sans font-black text-[#8B0000] text-center select-none truncate">
                      ₹{totalCollected.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Verified Portion Bar & Info */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-y-2 text-xs text-red-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-400 to-amber-300"></span>
                  <span>Total Submitted: <strong className="text-white">₹{totalCollected.toLocaleString('en-IN')}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                  <span>Verified Contributions: <strong className="text-emerald-300">₹{verifiedCollected.toLocaleString('en-IN')} ({displayVerifiedPercent}%)</strong></span>
                </div>
                <div className="text-[11px] italic font-light ml-auto">
                  Target: ₹{targetAmount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Box 1: Total Collected */}
          <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-[#8B0000] rounded-xl">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Submitted</p>
              <h3 className="text-xl font-bold text-gray-900 font-mono mt-0.5">
                ₹{totalCollected.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5" style={{ backgroundColor: '#efebeb', color: '#ebeef3', fontSize: '0px' }}>
                ₹{verifiedCollected.toLocaleString('en-IN')} verified
              </p>
            </div>
          </div>

          {/* Box 2: Total Contributors */}
          <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contributors</p>
              <h3 className="text-xl font-bold text-gray-900 font-mono mt-0.5">
                {totalContributors}
              </h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5">
                Active students registered
              </p>
            </div>
          </div>

          {/* Box 3: Target Amount */}
          <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Target Goal</p>
              <h3 className="text-xl font-bold text-gray-900 font-mono mt-0.5">
                ₹{targetAmount.toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5">
                Set by coordinator
              </p>
            </div>
          </div>

          {/* Box 4: Amount Remaining */}
          <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${amountRemaining > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
              {amountRemaining > 0 ? <AlertCircle className="h-6 w-6 animate-pulse" /> : <BadgeCheck className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fees Remaining</p>
              <h3 className="text-xl font-bold text-gray-900 font-mono mt-0.5">
                {amountRemaining > 0 ? `₹${amountRemaining.toLocaleString('en-IN')}` : "Goal Met! 🎉"}
              </h3>
              <p className="text-[10px] text-gray-400 font-light mt-0.5">
                {amountRemaining > 0 ? "Remaining gap to fill" : "All fees covered!"}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
