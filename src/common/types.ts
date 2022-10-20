import { DocumentData, Timestamp } from '@firebase/firestore';

export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface CategoryDocumentData extends DocumentData {
  name: string;
  color: string;
}

export interface CategoryData {
  id: string;
  label: string;
  color: string;
}

export interface OngoingRecord {
  aid: string;
  start: Timestamp;
  memo?: string;
  breaks?: { start: Timestamp; end?: Timestamp }[];
}

export interface UserDocumentData extends DocumentData {
  categories: CategoryData[];
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

export interface ActivityData {
  id: string;
  data: ActivityDocumentData;
}

export interface RecordDocumentData extends DocumentData {
  uid: string;
  aid?: string;
  start: Timestamp;
  end: Timestamp;
  breaks?: { start: Timestamp; end: Timestamp }[];
  duration?: number;
  memo?: string;
  progressFrom?: number;
  progressTo?: number;
}

export interface RecordData {
  id: string;
  data: RecordDocumentData;
}

// This might be necesary to reduce document reads.
export interface WeekCacheDocumentData extends DocumentData {
  uid: string;
  start: Timestamp;
  cache: RecordDocumentData[];
}
