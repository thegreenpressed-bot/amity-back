/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PaymentMethod = 'UPI';

export type ContributionStatus = 'Pending Verification' | 'Verified';

export interface Contribution {
  id: string; // e.g. ABEF-0001
  studentName: string;
  enrollmentNumber: string;
  branch: string;
  semester: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // UPI transaction ID or Bank Reference
  status: ContributionStatus;
  timestamp: string; // ISO string or formatted date
}

export interface FundSettings {
  targetAmount: number;
  coordinatorName: string;
}
