import { DocumentData, Timestamp } from '@firebase/firestore';

export interface CategoryDocumentData extends DocumentData {
  uid: string;
  label: string;
  color: string;
  order: number;
}

export interface CategoryDoc {
  id: string;
  data: CategoryDocumentData;
}

export interface OngoingRecord {
  aid: string;
  start: Timestamp;
  recStart: Timestamp;
  curStart?: Timestamp;
  memo?: string;
  subs?: { start: Timestamp; end: Timestamp }[];
}

export interface UserDocumentData extends DocumentData {
  displayName: string;
  email: string;
  ongoing?: OngoingRecord;
}

export interface ActivityDocumentData extends DocumentData {
  uid: string;
  label: string;
  cid?: string;
  progress?: {
    progressMax?: number;
    progressUnit?: string;
  };
  updated: Timestamp;
  cache?: {
    progressNow?: number;
    elapsedTime?: number;
    numRecords?: number;
    recentRecords?: {
      start: Timestamp;
      end: Timestamp;
      duration: number;
      whatsDone?: string;
      progressFrom?: number;
      progressTo?: number;
    }[];
  };
}

export interface ActivityDoc {
  id: string;
  data: ActivityDocumentData;
}

export interface ActivityChange {
  label?: string;
  cid?: string;
  updated?: Timestamp;
}

export interface RecordDocumentData extends DocumentData {
  uid: string;
  aid?: string;
  start: Timestamp;
  end: Timestamp;
  duration: number;
  subs?: { start: Timestamp; end: Timestamp }[];
  memo?: string;
  progressFrom?: number;
  progressTo?: number;
}

export interface RecordDoc {
  id: string;
  data: RecordDocumentData;
}

export interface RecordChange {
  aid?: string;
  start?: Timestamp;
  end?: Timestamp;
  duration?: number;
  memo?: string;
}

// This might be necesary to reduce document reads.
export interface WeekCacheDocumentData extends DocumentData {
  uid: string;
  start: Timestamp;
  cache: RecordDocumentData[];
}
