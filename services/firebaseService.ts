import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore targeting the assigned databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path,
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface CosponsorshipAgreementRecord {
  id: string;
  activityName: string;
  narrative: string;
  status: string;
  agreedToProvisions: boolean;
  nonProfitStatement: boolean;
  participantFeesClause: boolean;
  totalBudget: number;
  owner: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface MercuryDispatchRecord {
  id: string;
  businessName: string;
  bankProvider: string;
  accountType: string;
  target1Tag: string;
  target1Amount: number;
  target2Tag: string;
  target2Amount: number;
  totalAmount: number;
  status: string;
  krakenOtcPreLiquidationLock: boolean;
  traceId: string;
  timestamp: string;
  rawYamlSource?: string;
}

export async function saveCosponsorshipAgreement(agreement: CosponsorshipAgreementRecord): Promise<void> {
  const path = `cosponsorship_agreements/${agreement.id}`;
  try {
    const docRef = doc(db, 'cosponsorship_agreements', agreement.id);
    await setDoc(docRef, agreement);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getCosponsorshipAgreements(): Promise<CosponsorshipAgreementRecord[]> {
  const path = 'cosponsorship_agreements';
  try {
    const colRef = collection(db, 'cosponsorship_agreements');
    const snap = await getDocs(query(colRef, limit(20)));
    return snap.docs.map((d) => d.data() as CosponsorshipAgreementRecord);
  } catch (err) {
    console.warn('Could not read remote agreements, falling back to local memory store', err);
    return [];
  }
}

export async function saveMercuryDispatch(dispatch: MercuryDispatchRecord): Promise<void> {
  const path = `mercury_dispatches/${dispatch.id}`;
  try {
    const docRef = doc(db, 'mercury_dispatches', dispatch.id);
    await setDoc(docRef, dispatch);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getMercuryDispatches(): Promise<MercuryDispatchRecord[]> {
  const path = 'mercury_dispatches';
  try {
    const colRef = collection(db, 'mercury_dispatches');
    const snap = await getDocs(query(colRef, limit(20)));
    return snap.docs.map((d) => d.data() as MercuryDispatchRecord);
  } catch (err) {
    console.warn('Could not read remote dispatches, falling back to local memory store', err);
    return [];
  }
}
