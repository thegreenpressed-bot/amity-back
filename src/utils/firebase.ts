import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC09iY7lmATHvxr6iEkS9ROU_u4WerDy8k",
  authDomain: "optimal-verbena-kmln4.firebaseapp.com",
  projectId: "optimal-verbena-kmln4",
  storageBucket: "optimal-verbena-kmln4.firebasestorage.app",
  messagingSenderId: "779410427554",
  appId: "1:779410427554:web:a076e9d1edc0f40c2851fb"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore specifying the database ID from config
export const db = getFirestore(app, "ai-studio-c9b1a2b2-1c29-4ec5-8361-d55172042908");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
}
