import { DocumentData, Timestamp } from '@firebase/firestore';

export interface UserDocumentData extends DocumentData {
  displayName: string;
  email: string;
  locale?: string;
}

export interface CategoryDocumentData extends DocumentData {
  uid: string;
  label: string;
  color: string;
  order: number;
}

export interface CategoryChange {
  label?: string;
  color?: string;
  order?: number;
}

export interface TimestampSection {
  start: Timestamp;
  end: Timestamp;
}

export interface OngoingDocumentData extends DocumentData {
  aid: string;
  cid: string;
  recStart: Timestamp;
  curStart?: Timestamp;
  memo?: string;
  subs?: TimestampSection[];
}

export interface ActivityDocumentData extends DocumentData {
  uid: string;
  label: string;
  cid: string;
  updated: Timestamp;
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
  aid: string;
  start: Timestamp;
  end: Timestamp;
  duration: number;
  subs?: TimestampSection[];
  memo?: string;
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
  subs?: TimestampSection[];
  memo?: string;
}

export interface CachedCategoryData {
  label: string;
  color: string;
  order: number;
}

export interface CachedCategory {
  id: string;
  data: CachedCategoryData;
}

export interface CachedActivityData {
  label: string;
  cid: string;
  duration: number;
  count: number;
  updated: Timestamp;
}

export interface CachedActivity {
  id: string;
  data: CachedActivityData;
}

export interface CacheDocumentData extends DocumentData {
  categories: {
    [key: string]: CachedCategoryData;
  };
  activities: {
    [key: string]: CachedActivityData;
  };
}
