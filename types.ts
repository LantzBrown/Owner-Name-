export interface BusinessRow {
  id: string; // Internal ID for React keys
  business_name: string;
  website: string;
  google_my_business_url: string;
  phone_number: string;
  email: string;
  owner_name?: string; // The target field
  confidence?: string; // Low, Medium, High
  source?: string; // Where it was found
  [key: string]: any; // Allow other columns
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProcessingStats {
  total: number;
  processed: number;
  found: number;
}