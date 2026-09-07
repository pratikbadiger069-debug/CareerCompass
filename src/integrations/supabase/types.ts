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
  public: {
    Tables: {
      career_recommendations: {
        Row: {
          career_title: string
          created_at: string
          description: string | null
          growth_outlook: string | null
          id: string
          is_dismissed: boolean
          is_saved: boolean
          match_score: number | null
          related_fields: string[]
          required_skills: string[]
          salary_range: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_title: string
          created_at?: string
          description?: string | null
          growth_outlook?: string | null
          id?: string
          is_dismissed?: boolean
          is_saved?: boolean
          match_score?: number | null
          related_fields?: string[]
          required_skills?: string[]
          salary_range?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          career_title?: string
          created_at?: string
          description?: string | null
          growth_outlook?: string | null
          id?: string
          is_dismissed?: boolean
          is_saved?: boolean
          match_score?: number | null
          related_fields?: string[]
          required_skills?: string[]
          salary_range?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmap_milestones: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          order_index: number
          recommendation_id: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          recommendation_id?: string | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          recommendation_id?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_milestones_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "career_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_colleges: {
        Row: {
          application_deadline: string | null
          city: string | null
          college_name: string
          country: string | null
          created_at: string
          id: string
          notes: string | null
          program: string | null
          tuition_estimate: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          application_deadline?: string | null
          city?: string | null
          college_name: string
          country?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          program?: string | null
          tuition_estimate?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Update: {
          application_deadline?: string | null
          city?: string | null
          college_name?: string
          country?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          program?: string | null
          tuition_estimate?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          budget_range: string | null
          career_goal: string | null
          career_goals: string | null
          created_at: string
          current_grade: string | null
          current_marks: string | null
          current_skills: string[]
          education_level: string | null
          education_stage: string | null
          extra_context: string | null
          field_of_interest: string | null
          full_name: string | null
          goal_type: string | null
          id: string
          institution_name: string | null
          interests: string[]
          onboarding_completed: boolean
          stream: string | null
          target_country: string | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          budget_range?: string | null
          career_goal?: string | null
          career_goals?: string | null
          created_at?: string
          current_grade?: string | null
          current_marks?: string | null
          current_skills?: string[]
          education_level?: string | null
          education_stage?: string | null
          extra_context?: string | null
          field_of_interest?: string | null
          full_name?: string | null
          goal_type?: string | null
          id?: string
          institution_name?: string | null
          interests?: string[]
          onboarding_completed?: boolean
          stream?: string | null
          target_country?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          avatar_url?: string | null
          budget_range?: string | null
          career_goal?: string | null
          career_goals?: string | null
          created_at?: string
          current_grade?: string | null
          current_marks?: string | null
          current_skills?: string[]
          education_level?: string | null
          education_stage?: string | null
          extra_context?: string | null
          field_of_interest?: string | null
          full_name?: string | null
          goal_type?: string | null
          id?: string
          institution_name?: string | null
          interests?: string[]
          onboarding_completed?: boolean
          stream?: string | null
          target_country?: string | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
