// ============================================================
// Enums
// ============================================================

export type UserRole = 'user' | 'shelter' | 'volunteer';
export type DogStatus = 'walk' | 'adoption' | 'both' | 'adopted';
export type DogSize = 'small' | 'medium' | 'large';
export type WalkStatus = 'requested' | 'approved' | 'active' | 'completed' | 'cancelled';
export type AdoptionStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType =
  | 'walk_requested'
  | 'walk_approved'
  | 'walk_started'
  | 'walk_completed'
  | 'adoption_request'
  | 'adoption_approved'
  | 'leaderboard_change';

// ============================================================
// Table Row Types
// ============================================================

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  language: string;
  total_points: number;
  streak_count: number;
  last_streak_date: string | null;
  push_token: string | null;
  created_at: string;
}

export interface Dog {
  id: string;
  owner_id: string;
  name: string;
  breed: string;
  description: string | null;
  photo_url: string | null;
  status: DogStatus;
  size: DogSize;
  age: string | null;
  latitude: number | null;
  longitude: number | null;
  ar_model_url: string | null;
  created_at: string;
}

export interface Walk {
  id: string;
  walker_id: string;
  dog_id: string;
  status: WalkStatus;
  started_at: string | null;
  ended_at: string | null;
  distance_km: number | null;
  duration_mins: number | null;
  points_earned: number | null;
  multiplier: number;
  route_coordinates: Array<{ lat: number; lng: number; timestamp: number }> | null;
  selfie_url: string | null;
  created_at: string;
}

export interface AdoptionRequest {
  id: string;
  dog_id: string;
  adopter_id: string;
  status: AdoptionStatus;
  points_awarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  walker_id: string;
  owner_id: string;
  walk_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  related_entity_type: 'walk' | 'dog' | 'adoption_request' | null;
  related_entity_id: string | null;
  read: boolean;
  created_at: string;
}

// ============================================================
// RPC Return Types
// ============================================================

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  rank: number;
}

export interface StreakResult {
  new_streak: number;
  bonus_points: number;
}

// ============================================================
// Supabase Database Type
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'total_points' | 'streak_count' | 'created_at' | 'push_token'> & {
          total_points?: number;
          streak_count?: number;
          push_token?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      dogs: {
        Row: Dog;
        Insert: Omit<Dog, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Dog, 'id'>>;
        Relationships: [];
      };
      walks: {
        Row: Walk;
        Insert: Omit<Walk, 'id' | 'created_at' | 'multiplier'> & {
          id?: string;
          created_at?: string;
          multiplier?: number;
        };
        Update: Partial<Omit<Walk, 'id'>>;
        Relationships: [];
      };
      adoption_requests: {
        Row: AdoptionRequest;
        Insert: Omit<AdoptionRequest, 'id' | 'created_at' | 'updated_at' | 'points_awarded' | 'status'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          points_awarded?: boolean;
          status?: AdoptionStatus;
        };
        Update: Partial<Omit<AdoptionRequest, 'id'>>;
        Relationships: [];
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Review, 'id'>>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'read'> & {
          id?: string;
          created_at?: string;
          read?: boolean;
        };
        Update: Partial<Omit<Notification, 'id'>>;
        Relationships: [];
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Enums: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    CompositeTypes: {};
  };
}
