export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "patient" | "provider";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: UserRole;
          full_name?: string;
          email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          profile_id: string;
          pregnancy_week: number | null;
          county: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          pregnancy_week?: number | null;
          county?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pregnancy_week?: number | null;
          county?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      providers: {
        Row: {
          id: string;
          profile_id: string;
          specialty: string | null;
          organization: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          specialty?: string | null;
          organization?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          specialty?: string | null;
          organization?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient_provider_links: {
        Row: {
          id: string;
          patient_id: string;
          provider_id: string;
          status: "active" | "pending" | "revoked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          provider_id: string;
          status?: "active" | "pending" | "revoked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "active" | "pending" | "revoked";
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
