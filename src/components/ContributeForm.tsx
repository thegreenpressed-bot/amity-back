/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, CreditCard, ShieldAlert, Copy, Check } from 'lucide-react';
import { PaymentMethod, Contribution } from '../types';

interface ContributeFormProps {
  onSubmit: (contribution: Omit<Contribution, 'id' | 'status' | 'timestamp'>) => void;
}

const POPULAR_BRANCHES = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Comm. Engineering",
  "Mechanical & Automation Eng.",
  "Business Administration (BBA)",
  "Biotechnology",
  "Other"
];

export default function ContributeForm({ onSubmit }: ContributeFormProps) {
  // Form values
  const [studentName, setStudentName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [branch, setBranch] = useState(POPULAR_BRANCHES[0]);
  const [customBranch, setCustomBranch] = useState('');
  const [semester, setSemester] = useState('1');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Copying state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.warn("Clipboard access blocked or failed:", err);
    }
  };

  // Validation feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};

    if (!studentName.trim()) {
      tempErrors.studentName = "Student Name is required.";
    }

    // Enrollment number must be of format A41105223212 (an optional letter like A, followed by 10-11 digits)
    const enrollClean = enrollmentNumber.trim();
    if (!enrollClean) {
      tempErrors.enrollmentNumber = "Enrollment Number is required.";
    } else if (!/^[A-Z0-9]{10,12}$/i.test(enrollClean)) {
      tempErrors.enrollmentNumber = "Enrollment number must be 10-12 alphanumeric characters (e.g., A41105223212).";
    }

    // Branch
    if (branch === 'Other' && !customBranch.trim()) {
      tempErrors.customBranch = "Please enter your custom program name.";
    }

    // Amount
    const amtNum = parseFloat(amount);
    if (!amount) {
      tempErrors.amount = "Contribution amount is required.";
    } else if (isNaN(amtNum) || amtNum <= 0) {
      tempErrors.amount = "Contribution amount must be a positive number.";
    }

    // Reference number (UPI or Bank Transfer conditional check)
    if (paymentMethod !== 'Cash') {
      if (!referenceNumber.trim()) {
        tempErrors.referenceNumber = `${paymentMethod === 'UPI' ? 'UPI Transaction ID' : 'Bank Reference Number'} is required.`;
      } else if (referenceNumber.trim().length < 4) {
        tempErrors.referenceNumber = "Reference details are too short to verify.";
      }
    }

    // Confirmed check
    if (!isConfirmed) {
      tempErrors.isConfirmed = "You must check the confirmation box to submit.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const branchToSubmit = branch === 'Other' ? customBranch.trim() : branch;
      onSubmit({
        studentName: studentName.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        branch: branchToSubmit,
        semester,
        amount: parseFloat(amount),
        paymentMethod,
        referenceNumber: paymentMethod !== 'Cash' ? referenceNumber.trim() : undefined,
      });

      // Reset form
      setStudentName('');
      setEnrollmentNumber('');
      setBranch(POPULAR_BRANCHES[0]);
      setCustomBranch('');
      setSemester('1');
      setAmount('');
      setPaymentMethod('UPI');
      setReferenceNumber('');
      setIsConfirmed(false);
      setErrors({});
      setShowThankYou(true);
    }
  };

  if (showThankYou) {
    return (
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-8 text-center space-y-6 animate-fade-in">
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="h-16 w-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center shadow-xs animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-extrabold text-[#8B0000]">Thank You! 🎉</h3>
          <p className="text-sm font-semibold text-gray-950">Your Contribution has been Registered Successfully!</p>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            We have recorded your details and your provided UPI Transaction ID.
            The coordinator will verify this transaction. Your submission status will update in the live ledger once approved.
          </p>
        </div>
        <div className="pt-2 border-t border-gray-100 flex justify-center">
          <button
            type="button"
            onClick={() => setShowThankYou(false)}
            className="px-6 py-2.5 bg-[#8B0000] hover:bg-[#700000] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-xs cursor-pointer"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 sm:p-8">
      
      {/* Form Header */}
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-[#8B0000]" />
          <span>Contribute to the Fund</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Provide your back-paper contribution details below. Feel free to pay with UPI, cash, or bank transfers.
        </p>
      </div>

      {/* Verification Warning Notice */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-6 flex items-start space-x-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-light">
          <strong>Note:</strong> All contributions are subject to verification by the coordinator before being marked as confirmed. Please make your transfer before submitting this form.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Row 1: Name and Enrollment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Priyanshu Malik"
              className={`w-full rounded-lg text-sm bg-gray-50 border px-3.5 py-2.5 outline-none transition-all duration-200 ${
                errors.studentName
                  ? "border-red-500 focus:border-red-500 text-red-900 focus:ring-1 focus:ring-red-100 placeholder-red-300"
                  : "border-gray-300 focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 focus:bg-white"
              }`}
            />
            {errors.studentName && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{errors.studentName}</p>
            )}
          </div>

          {/* Enrollment Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Enrollment Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={12}
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Structure: A41105223212"
              className={`w-full rounded-lg text-sm bg-gray-50 border px-3.5 py-2.5 outline-none transition-all duration-200 font-mono ${
                errors.enrollmentNumber
                  ? "border-red-500 focus:border-red-500 text-red-900 focus:ring-1 focus:ring-red-100 placeholder-red-300"
                  : "border-gray-300 focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 focus:bg-white"
              }`}
            />
            {errors.enrollmentNumber && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{errors.enrollmentNumber}</p>
            )}
          </div>
        </div>

        {/* Row 2: Branch and Semester */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Branch Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Branch / Program <span className="text-red-500">*</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 transition-all focus:bg-white"
            >
              {POPULAR_BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Current Semester <span className="text-red-500">*</span>
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-lg bg-gray-50 border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 transition-all focus:bg-white font-mono"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={String(sem)}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Custom Branch Input */}
        {branch === 'Other' && (
          <div className="animate-fade-in">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Specify Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              placeholder="e.g. Master of Computer Applications (MCA)"
              className={`w-full rounded-lg text-sm bg-gray-50 border px-3.5 py-2.5 outline-none transition-all duration-200 ${
                errors.customBranch
                  ? "border-red-500 focus:border-red-500 text-red-900 placeholders-red-300"
                  : "border-gray-300 focus:border-[#8B0000] focus:bg-white"
              }`}
            />
            {errors.customBranch && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{errors.customBranch}</p>
            )}
          </div>
        )}

        {/* Row 3: Amount and Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Amount field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Amount Contributing (INR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className={`w-full rounded-lg text-sm bg-gray-50 border pl-8 pr-3.5 py-2.5 outline-none transition-all duration-200 font-mono ${
                  errors.amount
                    ? "border-red-500 focus:border-red-500 text-red-900 placeholder-red-300"
                    : "border-gray-300 focus:border-[#8B0000] focus:ring-1 focus:ring-red-100 focus:bg-white"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 font-medium mt-1.5">{errors.amount}</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="w-full py-2.5 px-3.5 border border-[#8B0000] bg-red-50 text-[#8B0000] rounded-lg text-xs sm:text-sm font-bold text-center select-none shadow-xs uppercase tracking-wider">
              UPI Transfer (Active)
            </div>
          </div>
        </div>

        {/* Scan and Pay instructions */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-2 animate-fade-in text-xs text-amber-900">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[10px] sm:text-[11px] tracking-wider uppercase text-amber-800">Scan or Send to Coordinator UPI</span>
            <span className="bg-amber-400 text-[#8B0000] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">Active Address</span>
          </div>
          <div className="flex items-center justify-between bg-white border border-amber-100 rounded-lg p-2.5 shadow-xs">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">UPI Handle / ID</p>
              <p className="font-mono text-xs sm:text-sm font-bold text-gray-950">9084723415@ptaxis</p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard('9084723415@ptaxis', 'upi')}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[10px] transition cursor-pointer"
            >
              {copiedKey === 'upi' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 animate-pulse" />}
              <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[10px] text-amber-700/80 leading-relaxed font-light">
            Transfer matching backing exam contributions here, then fill the 12-digit transaction ID below.
          </p>
        </div>

        {/* UPI Reference / transaction field */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 animate-fade-in">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            UPI Transaction ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="e.g. UPI8523610934 or Ref No"
            className={`w-full rounded-lg text-xs bg-white border px-3 py-2 outline-none transition-all duration-200 font-mono uppercase ${
              errors.referenceNumber
                ? "border-red-500 focus:border-red-500 text-red-900 placeholder-red-300"
                : "border-gray-300 focus:border-[#8B0000]"
            }`}
          />
          <p className="text-[10px] text-gray-400">
            Please check your banking or transaction receipt history to locate the exact reference identifier.
          </p>
          {errors.referenceNumber && (
            <p className="text-xs text-red-500 font-medium mt-1">{errors.referenceNumber}</p>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="pt-2">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#8B0000] focus:ring-[#8B0000] transition cursor-pointer"
            />
            <span className={`text-xs select-none transition-all ${isConfirmed ? 'text-gray-900 font-normal' : 'text-gray-500 font-light group-hover:text-gray-800'}`}>
              I confirm I have made the payment and the above transaction credentials are completely accurate. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.isConfirmed && (
            <p className="text-xs text-red-500 font-medium mt-1.5 ml-7">{errors.isConfirmed}</p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#8B0000] hover:bg-[#700000] text-white py-3 rounded-lg text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Submit Contribution Reports</span>
        </button>

      </form>
    </div>
  );
}
