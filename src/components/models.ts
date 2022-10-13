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
  id: number;
  name: string;
  color?: string;
  order?: number;
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
  title: string;
  description?: string;
  category_id?: string;
  color?: string;
  progress_max?: number;
}

export interface RecordDocumentData extends DocumentData {
  uid: string;
  activity_id?: string;
  start: Date;
  end: Date;
  breaks: { start: Date; end: Date }[];
  duration_seconds?: number;
  whats_done?: string;
  progress_from?: number;
  progress_to?: number;
}
