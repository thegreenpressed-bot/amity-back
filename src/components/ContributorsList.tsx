/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Filter, Calendar, CreditCard, User, History, CheckCircle, Clock } from 'lucide-react';
import { Contribution } from '../types';

interface ContributorsListProps {
  contributions: Contribution[];
}

export default function ContributorsList({ contributions }: ContributorsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Pending Verification'>('All');

  // Format Date gracefully
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  // Filter records
  const filteredContributions = contributions.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.enrollmentNumber.includes(searchTerm) ||
      item.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
      
      {/* List Header & Controls */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/70">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <History className="h-5 w-5 text-[#8B0000]" />
              <span>Student Contributions Ledger</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredContributions.length} of {contributions.length} recorded contributions
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex space-x-2.5">
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-[#8B0000]/5 text-[#8B0000] rounded-full text-xs font-semibold border border-[#8B0000]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000]"></span>
              <span>Total: {contributions.length}</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Verified: {contributions.filter(c => c.status === 'Verified').length}</span>
            </span>
          </div>
        </div>

        {/* Filters and Search Tools */}
        <div id="filters-container" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Name, ID, Enrollment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 transition-all font-sans"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 transition-all cursor-pointer font-sans appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending Verification">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        {filteredContributions.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="text-gray-300 mb-2 flex justify-center">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No matching contributions found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Student Information</th>
                <th className="py-3.5 px-5">Academic Coordinates</th>
                <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                <th className="py-3.5 px-5">Payment / Reference</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredContributions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition duration-150">
                  
                  {/* Contribution ID */}
                  <td className="py-4 px-5 align-middle">
                    <span className="font-mono text-xs font-bold text-red-900 bg-red-50/40 border border-red-100 px-2 py-1 rounded-md">
                      {item.id}
                    </span>
                  </td>

                  {/* Student Info */}
                  <td className="py-4 px-5 align-middle">
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center space-x-1">
                        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{item.studentName}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        Enroll: {item.enrollmentNumber}
                      </div>
                    </div>
                  </td>

                  {/* Academic Coordinates */}
                  <td className="py-4 px-5 align-middle">
                    <div>
                      <div className="font-medium text-gray-800 text-xs line-clamp-1">
                        {item.branch}
                      </div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-amber-700 font-semibold mt-0.5">
                        Semester {item.semester}
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-5 align-middle text-right">
                    <span className="font-mono font-bold text-gray-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Payment Info */}
                  <td className="py-4 px-5 align-middle">
                    <div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {item.paymentMethod}
                      </span>
                      {item.referenceNumber && (
                        <div className="text-[10px] text-gray-500 font-mono tracking-tight mt-1 truncate max-w-[150px]" title={item.referenceNumber}>
                          Ref: {item.referenceNumber}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="py-4 px-5 align-middle text-center">
                    {item.status === 'Verified' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>

                  {/* Date Submitted */}
                  <td className="py-4 px-5 align-middle text-gray-500 text-xs font-mono">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
