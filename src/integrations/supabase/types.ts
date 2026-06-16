export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_logs: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          prompt_summary: string | null
          response_content: string | null
          tokens_estimated: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          prompt_summary?: string | null
          response_content?: string | null
          tokens_estimated?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          prompt_summary?: string | null
          response_content?: string | null
          tokens_estimated?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_stats: {
        Row: {
          message_count: number
          usage_date: string
          user_id: string
        }
        Insert: {
          message_count?: number
          usage_date?: string
          user_id: string
        }
        Update: {
          message_count?: number
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          answers: Json
          assessment_type: string | null
          completed_at: string | null
          created_at: string
          id: string
          results: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_type?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          results?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_type?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          results?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      big_five_assessments: {
        Row: {
          agreeableness: number | null
          completed_at: string
          conscientiousness: number | null
          created_at: string
          extraversion: number | null
          facet_scores: Json
          id: string
          item_responses: Json
          neuroticism: number | null
          openness: number | null
          student_id: string
          time_taken_secs: number | null
          updated_at: string
          version: string
        }
        Insert: {
          agreeableness?: number | null
          completed_at?: string
          conscientiousness?: number | null
          created_at?: string
          extraversion?: number | null
          facet_scores?: Json
          id?: string
          item_responses?: Json
          neuroticism?: number | null
          openness?: number | null
          student_id: string
          time_taken_secs?: number | null
          updated_at?: string
          version?: string
        }
        Update: {
          agreeableness?: number | null
          completed_at?: string
          conscientiousness?: number | null
          created_at?: string
          extraversion?: number | null
          facet_scores?: Json
          id?: string
          item_responses?: Json
          neuroticism?: number | null
          openness?: number | null
          student_id?: string
          time_taken_secs?: number | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      caas_assessments: {
        Row: {
          completed_at: string
          concern: number | null
          confidence: number | null
          control: number | null
          created_at: string
          curiosity: number | null
          id: string
          item_responses: Json
          percentile: number | null
          student_id: string
          time_taken_secs: number | null
          total_score: number | null
          updated_at: string
          version: string
        }
        Insert: {
          completed_at?: string
          concern?: number | null
          confidence?: number | null
          control?: number | null
          created_at?: string
          curiosity?: number | null
          id?: string
          item_responses?: Json
          percentile?: number | null
          student_id: string
          time_taken_secs?: number | null
          total_score?: number | null
          updated_at?: string
          version?: string
        }
        Update: {
          completed_at?: string
          concern?: number | null
          confidence?: number | null
          control?: number | null
          created_at?: string
          curiosity?: number | null
          id?: string
          item_responses?: Json
          percentile?: number | null
          student_id?: string
          time_taken_secs?: number | null
          total_score?: number | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      career_exposure_activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          counselor_comment: string | null
          created_at: string
          description: string | null
          evidence_url: string | null
          id: string
          reflection: string | null
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          counselor_comment?: string | null
          created_at?: string
          description?: string | null
          evidence_url?: string | null
          id?: string
          reflection?: string | null
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          counselor_comment?: string | null
          created_at?: string
          description?: string | null
          evidence_url?: string | null
          id?: string
          reflection?: string | null
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_assignments: {
        Row: {
          active: boolean
          assigned_by: string | null
          counselor_id: string
          created_at: string
          id: string
          school_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          assigned_by?: string | null
          counselor_id: string
          created_at?: string
          id?: string
          school_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          assigned_by?: string | null
          counselor_id?: string
          created_at?: string
          id?: string
          school_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counselor_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      counselor_follow_ups: {
        Row: {
          counselor_id: string
          created_at: string
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["follow_up_status"]
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_meetings: {
        Row: {
          counselor_id: string
          created_at: string
          duration_mins: number | null
          id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          duration_mins?: number | null
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          duration_mins?: number | null
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_notes: {
        Row: {
          content: string
          counselor_id: string
          created_at: string
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          content: string
          counselor_id: string
          created_at?: string
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          counselor_id?: string
          created_at?: string
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_schools: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          school_id: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          school_id: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "counselor_schools_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      counselor_students: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      employability_skills: {
        Row: {
          id: string
          last_updated: string
          skill_category: Database["public"]["Enums"]["skill_category"]
          status: Database["public"]["Enums"]["skill_status"]
          student_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          skill_category: Database["public"]["Enums"]["skill_category"]
          status?: Database["public"]["Enums"]["skill_status"]
          student_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          skill_category?: Database["public"]["Enums"]["skill_category"]
          status?: Database["public"]["Enums"]["skill_status"]
          student_id?: string
        }
        Relationships: []
      }
      employer_encounters: {
        Row: {
          created_at: string
          created_by: string | null
          duration_mins: number | null
          employer_name: string
          encounter_date: string
          encounter_type: string
          gatsby_benchmark: number | null
          id: string
          industry_sector: string | null
          school_id: string
          skills_covered: string[] | null
          title: string
          updated_at: string
          year_groups: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_mins?: number | null
          employer_name: string
          encounter_date: string
          encounter_type: string
          gatsby_benchmark?: number | null
          id?: string
          industry_sector?: string | null
          school_id: string
          skills_covered?: string[] | null
          title: string
          updated_at?: string
          year_groups?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_mins?: number | null
          employer_name?: string
          encounter_date?: string
          encounter_type?: string
          gatsby_benchmark?: number | null
          id?: string
          industry_sector?: string | null
          school_id?: string
          skills_covered?: string[] | null
          title?: string
          updated_at?: string
          year_groups?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_encounters_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      encounter_attendees: {
        Row: {
          attended: boolean
          created_at: string
          encounter_id: string
          notes: string | null
          rating: number | null
          student_id: string
        }
        Insert: {
          attended?: boolean
          created_at?: string
          encounter_id: string
          notes?: string | null
          rating?: number | null
          student_id: string
        }
        Update: {
          attended?: boolean
          created_at?: string
          encounter_id?: string
          notes?: string | null
          rating?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "encounter_attendees_encounter_id_fkey"
            columns: ["encounter_id"]
            isOneToOne: false
            referencedRelation: "employer_encounters"
            referencedColumns: ["id"]
          },
        ]
      }
      gatsby_benchmarks: {
        Row: {
          category: string
          description: string
          id: number
          title: string
        }
        Insert: {
          category: string
          description: string
          id: number
          title: string
        }
        Update: {
          category?: string
          description?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      knowledge_resources: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          target_role: Database["public"]["Enums"]["target_role_enum"]
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          target_role?: Database["public"]["Enums"]["target_role_enum"]
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          target_role?: Database["public"]["Enums"]["target_role_enum"]
          title?: string
        }
        Relationships: []
      }
      onet_cache: {
        Row: {
          cache_key: string
          cache_type: string
          data_json: Json
          fetched_at: string | null
          id: string
          occupation_code: string | null
        }
        Insert: {
          cache_key: string
          cache_type?: string
          data_json: Json
          fetched_at?: string | null
          id?: string
          occupation_code?: string | null
        }
        Update: {
          cache_key?: string
          cache_type?: string
          data_json?: Json
          fetched_at?: string | null
          id?: string
          occupation_code?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          application_url: string | null
          company_name: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Insert: {
          application_url?: string | null
          company_name: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          title: string
          type: Database["public"]["Enums"]["opportunity_type"]
        }
        Update: {
          application_url?: string | null
          company_name?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      pre_boarding: {
        Row: {
          assigned_counselor_email: string | null
          assigned_grade: string | null
          assigned_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          email: string
          full_name: string | null
          preferred_language: string | null
          target_school_name: string | null
          temp_password: string | null
        }
        Insert: {
          assigned_counselor_email?: string | null
          assigned_grade?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          email: string
          full_name?: string | null
          preferred_language?: string | null
          target_school_name?: string | null
          temp_password?: string | null
        }
        Update: {
          assigned_counselor_email?: string | null
          assigned_grade?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          email?: string
          full_name?: string | null
          preferred_language?: string | null
          target_school_name?: string | null
          temp_password?: string | null
        }
        Relationships: []
      }
      pre_boarding_links: {
        Row: {
          created_at: string
          id: string
          parent_email: string
          student_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_email: string
          student_email: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_email?: string
          student_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          grade: string | null
          id: string
          is_archived: boolean | null
          preferred_language: string | null
          school_class: string | null
          school_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          grade?: string | null
          id: string
          is_archived?: boolean | null
          preferred_language?: string | null
          school_class?: string | null
          school_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          grade?: string | null
          id?: string
          is_archived?: boolean | null
          preferred_language?: string | null
          school_class?: string | null
          school_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          prompt: string
          response: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          prompt: string
          response: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_pathways: {
        Row: {
          created_at: string
          id: string
          title: string
          type: Database["public"]["Enums"]["saved_item_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          type: Database["public"]["Enums"]["saved_item_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["saved_item_type"]
          user_id?: string
        }
        Relationships: []
      }
      school_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          id: string
          target_audience: Database["public"]["Enums"]["event_audience"]
          title: string
          type: Database["public"]["Enums"]["event_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          id?: string
          target_audience?: Database["public"]["Enums"]["event_audience"]
          title: string
          type?: Database["public"]["Enums"]["event_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          id?: string
          target_audience?: Database["public"]["Enums"]["event_audience"]
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
        }
        Relationships: []
      }
      school_gatsby_progress: {
        Row: {
          academic_year: string
          attainment_level: number
          benchmark_id: number
          created_at: string
          evidence_notes: string | null
          id: string
          last_reviewed_at: string | null
          reviewed_by: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          attainment_level?: number
          benchmark_id: number
          created_at?: string
          evidence_notes?: string | null
          id?: string
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          attainment_level?: number
          benchmark_id?: number
          created_at?: string
          evidence_notes?: string | null
          id?: string
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_gatsby_progress_benchmark_id_fkey"
            columns: ["benchmark_id"]
            isOneToOne: false
            referencedRelation: "gatsby_benchmarks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_gatsby_progress_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      skills_gap_analyses: {
        Row: {
          analysed_at: string
          created_at: string
          gap_results: Json
          id: string
          occupation_code: string
          occupation_title: string
          overall_readiness: number | null
          skills_matched: number | null
          skills_to_develop: number | null
          student_id: string
        }
        Insert: {
          analysed_at?: string
          created_at?: string
          gap_results?: Json
          id?: string
          occupation_code: string
          occupation_title: string
          overall_readiness?: number | null
          skills_matched?: number | null
          skills_to_develop?: number | null
          student_id: string
        }
        Update: {
          analysed_at?: string
          created_at?: string
          gap_results?: Json
          id?: string
          occupation_code?: string
          occupation_title?: string
          overall_readiness?: number | null
          skills_matched?: number | null
          skills_to_develop?: number | null
          student_id?: string
        }
        Relationships: []
      }
      student_action_plans: {
        Row: {
          assigned_by: string | null
          assigned_by_role: string | null
          category: string
          completion_reflection: string | null
          created_at: string
          due_date: string | null
          id: string
          related_report_section: string | null
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_by_role?: string | null
          category: string
          completion_reflection?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          related_report_section?: string | null
          status?: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          assigned_by_role?: string | null
          category?: string
          completion_reflection?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          related_report_section?: string | null
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_career_pathways: {
        Row: {
          career_id: string | null
          created_at: string | null
          higher_ed_goal: string | null
          id: string
          is_primary: boolean | null
          skills_to_develop: string[] | null
          status: string
          student_id: string
          subjects: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          career_id?: string | null
          created_at?: string | null
          higher_ed_goal?: string | null
          id?: string
          is_primary?: boolean | null
          skills_to_develop?: string[] | null
          status?: string
          student_id: string
          subjects?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          career_id?: string | null
          created_at?: string | null
          higher_ed_goal?: string | null
          id?: string
          is_primary?: boolean | null
          skills_to_develop?: string[] | null
          status?: string
          student_id?: string
          subjects?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_skill_snapshots: {
        Row: {
          created_at: string
          id: string
          skills: Json
          snapshot_at: string
          source: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skills?: Json
          snapshot_at?: string
          source?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skills?: Json
          snapshot_at?: string
          source?: string
          student_id?: string
        }
        Relationships: []
      }
      student_subject_plans: {
        Row: {
          academic_year: string
          counselor_feedback: string | null
          created_at: string | null
          id: string
          rationale: string | null
          status: string
          student_id: string
          subjects: Json
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          counselor_feedback?: string | null
          created_at?: string | null
          id?: string
          rationale?: string | null
          status?: string
          student_id: string
          subjects?: Json
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          counselor_feedback?: string | null
          created_at?: string | null
          id?: string
          rationale?: string | null
          status?: string
          student_id?: string
          subjects?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_values_assessments: {
        Row: {
          achievement: number | null
          completed_at: string
          created_at: string
          id: string
          independence: number | null
          item_responses: Json
          recognition: number | null
          relationships: number | null
          student_id: string
          support: number | null
          updated_at: string
          version: string
          working_conditions: number | null
        }
        Insert: {
          achievement?: number | null
          completed_at?: string
          created_at?: string
          id?: string
          independence?: number | null
          item_responses?: Json
          recognition?: number | null
          relationships?: number | null
          student_id: string
          support?: number | null
          updated_at?: string
          version?: string
          working_conditions?: number | null
        }
        Update: {
          achievement?: number | null
          completed_at?: string
          created_at?: string
          id?: string
          independence?: number | null
          item_responses?: Json
          recognition?: number | null
          relationships?: number | null
          student_id?: string
          support?: number | null
          updated_at?: string
          version?: string
          working_conditions?: number | null
        }
        Relationships: []
      }
      workplace_experiences: {
        Row: {
          approved_by: string | null
          counselor_approved: boolean | null
          created_at: string
          duration_days: number | null
          employer_contact: string | null
          employer_name: string
          employer_sign_off: boolean | null
          end_date: string
          experience_type: string
          gatsby_benchmark: number | null
          id: string
          industry_sector: string | null
          occupation_code: string | null
          school_id: string
          skills_developed: string[] | null
          start_date: string
          student_id: string
          student_reflection: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          counselor_approved?: boolean | null
          created_at?: string
          duration_days?: number | null
          employer_contact?: string | null
          employer_name: string
          employer_sign_off?: boolean | null
          end_date: string
          experience_type: string
          gatsby_benchmark?: number | null
          id?: string
          industry_sector?: string | null
          occupation_code?: string | null
          school_id: string
          skills_developed?: string[] | null
          start_date: string
          student_id: string
          student_reflection?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          counselor_approved?: boolean | null
          created_at?: string
          duration_days?: number | null
          employer_contact?: string | null
          employer_name?: string
          employer_sign_off?: boolean | null
          end_date?: string
          experience_type?: string
          gatsby_benchmark?: number | null
          id?: string
          industry_sector?: string | null
          occupation_code?: string | null
          school_id?: string
          skills_developed?: string[] | null
          start_date?: string
          student_id?: string
          student_reflection?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workplace_experiences_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_student_assessment: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      can_access_student_record: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      check_and_increment_ai_usage: {
        Args: { _daily_limit: number; _user_id: string }
        Returns: boolean
      }
      decrypt_note:
        | { Args: { encrypted_content: string }; Returns: string }
        | {
            Args: { encrypted_content: string; secret: string }
            Returns: string
          }
      delete_user: { Args: { target_user_id: string }; Returns: undefined }
      encrypt_note:
        | { Args: { content: string }; Returns: string }
        | { Args: { content: string; secret: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_assigned_counselor: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      is_parent_of_student: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      is_school_admin_for_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_self: { Args: { user_uid: string }; Returns: boolean }
      request_self_deletion: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "student" | "parent" | "counselor" | "admin"
      event_audience: "all" | "students" | "parents"
      event_type: "webinar" | "workshop" | "deadline" | "notice"
      follow_up_status: "pending" | "completed"
      goal_status: "not_started" | "in_progress" | "completed"
      meeting_status: "scheduled" | "completed" | "cancelled"
      opportunity_type:
        | "internship"
        | "shadowing"
        | "career_fair"
        | "mentorship"
      saved_item_type: "subject" | "pathway" | "profession" | "career_family"
      skill_category: "resume" | "interview" | "networking" | "financial_lit"
      skill_status: "not_started" | "in_progress" | "verified"
      target_role_enum: "student" | "parent" | "counselor" | "all"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["student", "parent", "counselor", "admin"],
      event_audience: ["all", "students", "parents"],
      event_type: ["webinar", "workshop", "deadline", "notice"],
      follow_up_status: ["pending", "completed"],
      goal_status: ["not_started", "in_progress", "completed"],
      meeting_status: ["scheduled", "completed", "cancelled"],
      opportunity_type: [
        "internship",
        "shadowing",
        "career_fair",
        "mentorship",
      ],
      saved_item_type: ["subject", "pathway", "profession", "career_family"],
      skill_category: ["resume", "interview", "networking", "financial_lit"],
      skill_status: ["not_started", "in_progress", "verified"],
      target_role_enum: ["student", "parent", "counselor", "all"],
    },
  },
} as const
