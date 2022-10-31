export interface PortableCategory {
  id: string;
  label: string;
  color: string;
}

export interface PortableActivity {
  id: string;
  categoryId: string;
  label: string;
}

export interface PortableRecord {
  id: string;
  activityId: string;
  memo?: string;
  timeFrames: { start: Date; end: Date }[];
}

export interface PortableData {
  version: number;
  categories: PortableCategory[];
  activities: PortableActivity[];
  records: PortableRecord[];
}
