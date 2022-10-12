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
