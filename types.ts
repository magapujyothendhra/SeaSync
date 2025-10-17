export type PollutionType = 
  | 'plastic' 
  | 'oil-spill' 
  | 'debris' 
  | 'chemical' 
  | 'sewage' 
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type BadgeType = 
  | 'first_report'
  | 'eco_warrior'
  | 'cleanup_hero'
  | 'accuracy_expert'
  | 'mission_complete'
  | 'streak_master';

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  points: number;
  level: number;
  badges: Badge[];
  reportsCount: number;
  cleanupMissionsCompleted: number;
  streak: number;
  joinedAt: number;
}

export interface PollutionReport {
  id: string;
  type: PollutionType;
  description: string;
  photoUrl?: string;
  photoBase64?: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  synced: boolean;
  userId?: string;
  severity?: SeverityLevel;
  aiClassification?: {
    suggestedType: PollutionType;
    confidence: number;
    detectedItems?: string[];
  };
  verified?: boolean;
  verifiedBy?: string[];
  impactArea?: number;
}

export interface OfflineReport extends Omit<PollutionReport, 'id' | 'synced'> {
  localId: string;
}

export interface CleanupMission {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  latitude: number;
  longitude: number;
  radius: number;
  startDate: number;
  endDate?: number;
  targetReportIds: string[];
  participantCount: number;
  status: 'active' | 'completed' | 'cancelled';
  pointsReward: number;
  photoUrls?: string[];
  createdAt: number;
}
