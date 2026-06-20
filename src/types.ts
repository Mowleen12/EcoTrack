export type AppView = 'home' | 'about' | 'calculate' | 'reduce' | 'learn' | 'community' | 'dashboard' | 'profile';

export type CarbonCategory = 'Transport' | 'Energy' | 'Food' | 'Lifestyle' | 'Water';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type SustainabilityLabel = 'Beginner' | 'Aware' | 'Sustainable' | 'Eco Champion';

// ─── Core Calculator ───────────────────────────────────────────────────────────
export interface CalculatorState {
  transportMode: string;
  transportWeeklyDistance: number;
  publicTransportUse: string;
  electricityBill: number;
  heatingType: string;
  dietType: string;
  wasteRecycle: boolean;
  shoppingFrequency: string;
  waterUsageLitres: number;
  flightsPerYear: number;
}

export interface CalculatorResult {
  totalTonnes: number;
  breakdown: {
    transport: number;
    energy: number;
    food: number;
    lifestyle: number;
    water: number;
  };
  calculatedAt: string;
}

// ─── Sustainability Scoring ────────────────────────────────────────────────────
export interface SustainabilityScore {
  score: number;          // 0–100
  label: SustainabilityLabel;
  percentile: number;     // estimated % of population you outperform
}

// ─── Recommendation Engine ─────────────────────────────────────────────────────
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  whyItMatters: string;
  category: CarbonCategory;
  impactScore: number;          // 1–10
  co2ReductionKg: number;       // estimated kg CO₂ saved / year
  difficulty: DifficultyLevel;
  costEstimate: 'Free' | 'Low' | 'Medium' | 'High';
  timeframeDays: number;        // days to see impact
  priority: number;             // computed rank (lower = higher priority)
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export type GoalTarget = 'reduce_20' | 'reduce_50' | 'net_zero' | 'custom';

export interface UserGoal {
  id: string;
  label: string;
  target: GoalTarget;
  targetTonnes: number;
  currentTonnes: number;
  createdAt: string;
  primaryFocus: CarbonCategory;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export interface OnboardingData {
  name: string;
  goal: GoalTarget;
  primaryFocus: CarbonCategory;
  completedAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'milestone' | 'recommendation' | 'challenge' | 'streak' | 'goal';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionView?: AppView;
}

// ─── Community ────────────────────────────────────────────────────────────────
export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  role: string;
  timeAgo: string;
  content: string;
  likes: number;
  commentsCount: number;
  comments: string[];
  hasLiked?: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: string;
  avatar: string;
  change?: 'up' | 'down' | 'same';
}

// ─── Badges ───────────────────────────────────────────────────────────────────
export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  iconName: string;
  unlockedAt?: string;
}

// ─── Tips ─────────────────────────────────────────────────────────────────────
export interface TipItem {
  id: string;
  title: string;
  category: 'Home' | 'Transport' | 'Food' | 'Lifestyle';
  savingsEstimate: string;
  co2ReductionKg: number;
  description: string;
  whyItMatters: string;
  iconName: string;
  difficulty: DifficultyLevel;
  costEstimate: 'Free' | 'Low' | 'Medium' | 'High';
  timeframeDays: number;
  impactScore: number;
  isPersonalized?: boolean;
}
