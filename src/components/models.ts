import { DocumentData } from 'firebase/firestore';

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
  color?: string;
}

export interface OngoingRecord {
  activity_id?: string;
  start: Date;
  breaks: { start: Date; end?: Date }[];
}

export interface UserDocumentData extends DocumentData {
  categories: CategoryData[];
  ongoing?: OngoingRecord;
}

export interface ActivityDocumentData extends DocumentData {
  uid: string;
  label: string;
  cid?: string;
  color?: string;
  desc?: string;
  progress?: {
    progress_max?: number;
    progress_unit?: string;
  };
  cache?: {
    progress_now?: number;
    elapsed_time?: number;
    recent_records?: {
      start: Date;
      end: Date;
      duration: number;
      whats_done?: string;
      progress_from?: number;
      progress_to?: number;
    }[];
  };
}

export interface RecordDocumentData extends DocumentData {
  uid: string;
  aid?: string;
  start: Date;
  end: Date;
  breaks: { start: Date; end: Date }[];
  duration?: number;
  whats_done?: string;
  progress_from?: number;
  progress_to?: number;
}

// This might be necesary to reduce document reads.
export interface WeekCacheDocumentData extends DocumentData {
  uid: string;
  start: Date;
  cache: RecordDocumentData[];
}
