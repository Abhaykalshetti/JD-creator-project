export interface FormData {
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  jobType: string;
  workMode: string;
  salaryRange: string;
  department: string;
  responsibilities: string;
  qualifications: string;
}

export interface JDVariant {
  label: string;
  jd: string;
}

export interface QualityResult {
  score: number;
  grade: string;
  suggestions: string[];
}

export interface SavedJD {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
  jobType: string;
  workMode: string;
  qualityScore: number;
  skills: string[];
  createdAt: string;
}

export interface SavedJDDetail extends SavedJD {
  generatedJD: string;
  responsibilities: string;
  qualifications: string;
  salaryRange: string;
  department: string;
  qualitySuggestions: string[];
}

export type TabType = 'create' | 'saved';
export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}
