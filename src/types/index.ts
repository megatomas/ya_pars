export interface Company {
  id: string;
  name: string;
  category: string;
  subcategories: string[];
  description: string;
  region: string;
  city: string;
  address: string;
  status: string;
  firstSeen: string;
  lastChecked: string;
  // Directory data
  directoryUrl: string;
  sourceId: string;
  rating: number;
  reviewCount: number;
  ratingCount: number;
  workingHours: string;
  dataReceivedDate: string;
  dataSource: string;
  // Contacts
  phone: string;
  additionalPhones: string[];
  email: string;
  website: string;
  vk: string;
  telegram: string;
  whatsapp: string;
  otherLinks: string[];
  contactForm: string;
  contactName: string;
  // Website analytics
  websiteStatus: WebsiteStatus;
  websiteUrl: string;
  websiteCheckDate: string;
  httpStatus: number | null;
  websiteAvailable: boolean;
  hasHttps: boolean;
  hasMobileVersion: boolean | null;
  classificationReason: string;
  confidenceLevel: number;
  // Commercial
  leadPriority: 'high' | 'medium' | 'low';
  selectionReason: string;
  potentialNeed: string;
  demoSiteUrl: string;
  demoSiteCreated: string;
  proposalSentDate: string;
  contactStatus: ContactStatus;
  comments: string;
  nextTask: string;
  nextActionDate: string;
  refusalReason: string;
  lastContactDate: string;
  // Internal
  excluded: boolean;
  isDuplicate: boolean;
  score: number;
}

export type WebsiteStatus = 
  | 'found'
  | 'not_found'
  | 'needs_review'
  | 'not_specified'
  | 'unavailable'
  | 'check_error';

export type ContactStatus = 
  | 'new'
  | 'verified'
  | 'priority'
  | 'demo_in_progress'
  | 'demo_ready'
  | 'proposal_prepared'
  | 'proposal_sent'
  | 'response_received'
  | 'negotiation'
  | 'client'
  | 'refused'
  | 'do_not_contact';

export interface CollectionJob {
  id: string;
  source: string;
  query: string;
  filters: Record<string, any>;
  startTime: string;
  endTime: string | null;
  status: JobStatus;
  foundCount: number;
  newCount: number;
  updatedCount: number;
  duplicateCount: number;
  errorCount: number;
  currentStage: string;
  errorMessage: string;
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'completed_with_errors' | 'stopped' | 'error';

export interface EmailCampaign {
  id: string;
  name: string;
  template: string;
  subject: string;
  companies: string[];
  status: 'draft' | 'sending' | 'completed' | 'paused';
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  module: string;
  message: string;
  details?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

export interface ScoringWeights {
  reviews50plus: number;
  reviews100plus: number;
  rating43plus: number;
  rating47plus: number;
  emailConfirmed: number;
  phonePresent: number;
  onlyCatalogProfile: number;
  noWebsiteConfirmed: number;
}

export interface WebsiteCheck {
  id: string;
  companyId: string;
  date: string;
  status: WebsiteStatus;
  url: string;
  httpStatus: number | null;
  reason: string;
  confidence: number;
}

export interface DemoSite {
  id: string;
  companyId: string;
  url: string;
  projectName: string;
  createdAt: string;
  status: 'active' | 'checking' | 'error';
  note: string;
}
