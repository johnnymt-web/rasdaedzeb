export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          user_id: string
          type: string | null
          assessment_type: string | null
          answers: Json
          results: Json | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: string | null
          assessment_type?: string | null
          answers?: Json
          results?: Json | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          assessment_type?: string | null
          answers?: Json
          results?: Json | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string
          target_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_type?: string
          target_id?: string | null
          details?: Json
          created_at?: string
        }
        Relationships: []
      }
      big_five_assessments: {
        Row: {
          id: string
          student_id: string
          item_responses: Json
          openness: number | null
          conscientiousness: number | null
          extraversion: number | null
          agreeableness: number | null
          neuroticism: number | null
          facet_scores: Json
          version: string
          completed_at: string
          time_taken_secs: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          item_responses?: Json
          openness?: number | null
          conscientiousness?: number | null
          extraversion?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          facet_scores?: Json
          version?: string
          completed_at?: string
          time_taken_secs?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          item_responses?: Json
          openness?: number | null
          conscientiousness?: number | null
          extraversion?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          facet_scores?: Json
          version?: string
          completed_at?: string
          time_taken_secs?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      caas_assessments: {
        Row: {
          id: string
          student_id: string
          item_responses: Json
          concern: number | null
          control: number | null
          curiosity: number | null
          confidence: number | null
          total_score: number | null
          percentile: number | null
          version: string
          completed_at: string
          time_taken_secs: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          item_responses?: Json
          concern?: number | null
          control?: number | null
          curiosity?: number | null
          confidence?: number | null
          total_score?: number | null
          percentile?: number | null
          version?: string
          completed_at?: string
          time_taken_secs?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          item_responses?: Json
          concern?: number | null
          control?: number | null
          curiosity?: number | null
          confidence?: number | null
          total_score?: number | null
          percentile?: number | null
          version?: string
          completed_at?: string
          time_taken_secs?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_follow_ups: {
        Row: {
          id: string
          counselor_id: string
          student_id: string
          title: string
          status: Database["public"]["Enums"]["follow_up_status"]
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          counselor_id: string
          student_id: string
          title: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          counselor_id?: string
          student_id?: string
          title?: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_meetings: {
        Row: {
          id: string
          counselor_id: string
          student_id: string
          scheduled_at: string
          duration_mins: number | null
          status: Database["public"]["Enums"]["meeting_status"]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          counselor_id: string
          student_id: string
          scheduled_at: string
          duration_mins?: number | null
          status?: Database["public"]["Enums"]["meeting_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          counselor_id?: string
          student_id?: string
          scheduled_at?: string
          duration_mins?: number | null
          status?: Database["public"]["Enums"]["meeting_status"]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_notes: {
        Row: {
          id: string
          counselor_id: string
          student_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          counselor_id: string
          student_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          counselor_id?: string
          student_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_schools: {
        Row: {
          id: string
          counselor_id: string
          school_id: string
          created_at: string
        }
        Insert: {
          id?: string
          counselor_id: string
          school_id: string
          created_at?: string
        }
        Update: {
          id?: string
          counselor_id?: string
          school_id?: string
          created_at?: string
        }
        Relationships: []
      }
      counselor_students: {
        Row: {
          id: string
          counselor_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          counselor_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          id?: string
          counselor_id?: string
          student_id?: string
          created_at?: string
        }
        Relationships: []
      }
      employability_skills: {
        Row: {
          id: string
          student_id: string
          skill_category: Database["public"]["Enums"]["skill_category"]
          status: Database["public"]["Enums"]["skill_status"]
          last_updated: string
        }
        Insert: {
          id?: string
          student_id: string
          skill_category: Database["public"]["Enums"]["skill_category"]
          status?: Database["public"]["Enums"]["skill_status"]
          last_updated?: string
        }
        Update: {
          id?: string
          student_id?: string
          skill_category?: Database["public"]["Enums"]["skill_category"]
          status?: Database["public"]["Enums"]["skill_status"]
          last_updated?: string
        }
        Relationships: []
      }
      knowledge_resources: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          target_role: Database["public"]["Enums"]["target_role_enum"]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          target_role?: Database["public"]["Enums"]["target_role_enum"]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          target_role?: Database["public"]["Enums"]["target_role_enum"]
          created_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          title: string
          company_name: string
          type: Database["public"]["Enums"]["opportunity_type"]
          description: string | null
          application_url: string | null
          deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          company_name: string
          type: Database["public"]["Enums"]["opportunity_type"]
          description?: string | null
          application_url?: string | null
          deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_name?: string
          type?: Database["public"]["Enums"]["opportunity_type"]
          description?: string | null
          application_url?: string | null
          deadline?: string | null
          created_at?: string
        }
        Relationships: []
      }
      onet_cache: {
        Row: {
          id: string
          cache_key: string
          data_json: Json
          fetched_at: string
        }
        Insert: {
          id?: string
          cache_key: string
          data_json: Json
          fetched_at?: string
        }
        Update: {
          id?: string
          cache_key?: string
          data_json?: Json
          fetched_at?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          id: string
          parent_id: string
          student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          student_id: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          student_id?: string
          created_at?: string
        }
        Relationships: []
      }
      pre_boarding: {
        Row: {
          email: string
          assigned_role: Database["public"]["Enums"]["app_role"]
          assigned_grade: string | null
          full_name: string | null
          target_school_name: string | null
          assigned_counselor_email: string | null
          created_at: string
        }
        Insert: {
          email: string
          assigned_role?: Database["public"]["Enums"]["app_role"]
          assigned_grade?: string | null
          full_name?: string | null
          target_school_name?: string | null
          assigned_counselor_email?: string | null
          created_at?: string
        }
        Update: {
          email?: string
          assigned_role?: Database["public"]["Enums"]["app_role"]
          assigned_grade?: string | null
          full_name?: string | null
          target_school_name?: string | null
          assigned_counselor_email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pre_boarding_links: {
        Row: {
          id: string
          parent_email: string
          student_email: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_email: string
          student_email: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_email?: string
          student_email?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          grade: string | null
          school_id: string | null
          preferred_language: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          grade?: string | null
          school_id?: string | null
          preferred_language?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          grade?: string | null
          school_id?: string | null
          preferred_language?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          id: string
          user_id: string
          assessment_id: string | null
          prompt: string
          response: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id?: string | null
          prompt: string
          response: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string | null
          prompt?: string
          response?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_pathways: {
        Row: {
          id: string
          user_id: string
          title: string
          type: Database["public"]["Enums"]["saved_item_type"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: Database["public"]["Enums"]["saved_item_type"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: Database["public"]["Enums"]["saved_item_type"]
          created_at?: string
        }
        Relationships: []
      }
      school_events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          type: Database["public"]["Enums"]["event_type"]
          target_audience: Database["public"]["Enums"]["event_audience"]
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          type?: Database["public"]["Enums"]["event_type"]
          target_audience?: Database["public"]["Enums"]["event_audience"]
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          type?: Database["public"]["Enums"]["event_type"]
          target_audience?: Database["public"]["Enums"]["event_audience"]
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          id: string
          name: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
      student_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          created_at?: string
          updated_at?: string
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
          id: string
          student_id: string
          item_responses: Json
          achievement: number | null
          independence: number | null
          recognition: number | null
          relationships: number | null
          support: number | null
          working_conditions: number | null
          version: string
          completed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          item_responses?: Json
          achievement?: number | null
          independence?: number | null
          recognition?: number | null
          relationships?: number | null
          support?: number | null
          working_conditions?: number | null
          version?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          item_responses?: Json
          achievement?: number | null
          independence?: number | null
          recognition?: number | null
          relationships?: number | null
          support?: number | null
          working_conditions?: number | null
          version?: string
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      delete_user: {
        Args: { target_user_id: string }
        Returns: void
      }
      check_and_increment_ai_usage: {
        Args: { _user_id: string; _daily_limit: number }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "parent" | "counselor" | "admin"
      goal_status: "not_started" | "in_progress" | "completed"
      saved_item_type: "subject" | "pathway" | "profession" | "career_family"
      meeting_status: "scheduled" | "completed" | "cancelled"
      follow_up_status: "pending" | "completed"
      event_type: "webinar" | "workshop" | "deadline" | "notice"
      event_audience: "all" | "students" | "parents"
      skill_category: "resume" | "interview" | "networking" | "financial_lit"
      skill_status: "not_started" | "in_progress" | "verified"
      target_role_enum: "student" | "parent" | "counselor" | "all"
      opportunity_type: "internship" | "shadowing" | "career_fair" | "mentorship"
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

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "parent", "counselor", "admin"],
    },
  },
} as const
