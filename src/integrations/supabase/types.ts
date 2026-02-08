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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_decisions: {
        Row: {
          accepted: boolean | null
          campaign_id: string | null
          confidence: number | null
          created_at: string
          decision_type: string
          id: string
          input_data: Json | null
          lead_id: string | null
          output_data: Json | null
          reasoning: string
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          campaign_id?: string | null
          confidence?: number | null
          created_at?: string
          decision_type: string
          id?: string
          input_data?: Json | null
          lead_id?: string | null
          output_data?: Json | null
          reasoning: string
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          campaign_id?: string | null
          confidence?: number | null
          created_at?: string
          decision_type?: string
          id?: string
          input_data?: Json | null
          lead_id?: string | null
          output_data?: Json | null
          reasoning?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decisions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_lead_profiles: {
        Row: {
          best_outreach_channel: string | null
          business_challenges: string[] | null
          company_description: string | null
          created_at: string
          enrichment_reasoning: string | null
          estimated_budget_range: string | null
          id: string
          lead_id: string
          pain_points: string[] | null
          potential_tech_stack: string[] | null
          recommended_tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_outreach_channel?: string | null
          business_challenges?: string[] | null
          company_description?: string | null
          created_at?: string
          enrichment_reasoning?: string | null
          estimated_budget_range?: string | null
          id?: string
          lead_id: string
          pain_points?: string[] | null
          potential_tech_stack?: string[] | null
          recommended_tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_outreach_channel?: string | null
          business_challenges?: string[] | null
          company_description?: string | null
          created_at?: string
          enrichment_reasoning?: string | null
          estimated_budget_range?: string | null
          id?: string
          lead_id?: string
          pain_points?: string[] | null
          potential_tech_stack?: string[] | null
          recommended_tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_lead_profiles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_snapshots: {
        Row: {
          ai_insights: string[] | null
          ai_recommendations: string[] | null
          created_at: string
          id: string
          metrics: Json
          period_end: string
          period_start: string
          snapshot_type: string
          user_id: string
        }
        Insert: {
          ai_insights?: string[] | null
          ai_recommendations?: string[] | null
          created_at?: string
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          snapshot_type: string
          user_id: string
        }
        Update: {
          ai_insights?: string[] | null
          ai_recommendations?: string[] | null
          created_at?: string
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          snapshot_type?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_leads: {
        Row: {
          campaign_id: string
          created_at: string
          current_step: number
          id: string
          last_contacted_at: string | null
          lead_id: string
          next_followup_at: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          current_step?: number
          id?: string
          last_contacted_at?: string | null
          lead_id: string
          next_followup_at?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          current_step?: number
          id?: string
          last_contacted_at?: string | null
          lead_id?: string
          next_followup_at?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_steps: {
        Row: {
          action_type: string
          ai_generated: boolean | null
          campaign_id: string
          channel: string
          condition_type: string | null
          created_at: string
          delay_days: number
          fallback_channel: string | null
          id: string
          message_template: string | null
          step_number: number
          subject_template: string | null
          updated_at: string
        }
        Insert: {
          action_type?: string
          ai_generated?: boolean | null
          campaign_id: string
          channel?: string
          condition_type?: string | null
          created_at?: string
          delay_days?: number
          fallback_channel?: string | null
          id?: string
          message_template?: string | null
          step_number?: number
          subject_template?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          ai_generated?: boolean | null
          campaign_id?: string
          channel?: string
          condition_type?: string | null
          created_at?: string
          delay_days?: number
          fallback_channel?: string | null
          id?: string
          message_template?: string | null
          step_number?: number
          subject_template?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_steps_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          body: string
          campaign_id: string
          channel: string
          created_at: string
          delay_days: number
          id: string
          is_ai_generated: boolean
          step_number: number
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          campaign_id: string
          channel?: string
          created_at?: string
          delay_days?: number
          id?: string
          is_ai_generated?: boolean
          step_number?: number
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          campaign_id?: string
          channel?: string
          created_at?: string
          delay_days?: number
          id?: string
          is_ai_generated?: boolean
          step_number?: number
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_templates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          current_step: number
          id: string
          leads_count: number
          name: string
          response_rate: number | null
          status: string
          steps: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          leads_count?: number
          name: string
          response_rate?: number | null
          status?: string
          steps?: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          leads_count?: number
          name?: string
          response_rate?: number | null
          status?: string
          steps?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          name: string
          subject: string
          tags: string[] | null
          updated_at: string
          use_count: number | null
          user_id: string
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name: string
          subject: string
          tags?: string[] | null
          updated_at?: string
          use_count?: number | null
          user_id: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          subject?: string
          tags?: string[] | null
          updated_at?: string
          use_count?: number | null
          user_id?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          message_log_id: string
          url: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          message_log_id: string
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          message_log_id?: string
          url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_message_log_id_fkey"
            columns: ["message_log_id"]
            isOneToOne: false
            referencedRelation: "message_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          channel: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          notes: string | null
          priority: string
          reminder_at: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          priority?: string
          reminder_at?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          priority?: string
          reminder_at?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ai_summary: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          is_starred: boolean
          last_activity: string | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          score: string
          score_value: number
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_starred?: boolean
          last_activity?: string | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          score?: string
          score_value?: number
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_starred?: boolean
          last_activity?: string | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          score?: string
          score_value?: number
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_logs: {
        Row: {
          ai_follow_up_recommendation: string | null
          body: string
          campaign_id: string | null
          channel: string
          clicks_count: number | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          external_id: string | null
          first_opened_at: string | null
          id: string
          lead_id: string | null
          opens_count: number | null
          outcome_sentiment: string | null
          read_at: string | null
          recipient: string
          responded_at: string | null
          sent_at: string
          status: string
          subject: string | null
          tracking_id: string | null
          updated_at: string
          user_confirmed_ignored: boolean | null
          user_confirmed_ignored_at: string | null
          user_confirmed_read: boolean | null
          user_confirmed_read_at: string | null
          user_confirmed_responded: boolean | null
          user_confirmed_responded_at: string | null
          user_confirmed_sent: boolean | null
          user_confirmed_sent_at: string | null
          user_id: string
        }
        Insert: {
          ai_follow_up_recommendation?: string | null
          body: string
          campaign_id?: string | null
          channel: string
          clicks_count?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          first_opened_at?: string | null
          id?: string
          lead_id?: string | null
          opens_count?: number | null
          outcome_sentiment?: string | null
          read_at?: string | null
          recipient: string
          responded_at?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          tracking_id?: string | null
          updated_at?: string
          user_confirmed_ignored?: boolean | null
          user_confirmed_ignored_at?: string | null
          user_confirmed_read?: boolean | null
          user_confirmed_read_at?: string | null
          user_confirmed_responded?: boolean | null
          user_confirmed_responded_at?: string | null
          user_confirmed_sent?: boolean | null
          user_confirmed_sent_at?: string | null
          user_id: string
        }
        Update: {
          ai_follow_up_recommendation?: string | null
          body?: string
          campaign_id?: string | null
          channel?: string
          clicks_count?: number | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          external_id?: string | null
          first_opened_at?: string | null
          id?: string
          lead_id?: string | null
          opens_count?: number | null
          outcome_sentiment?: string | null
          read_at?: string | null
          recipient?: string
          responded_at?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          tracking_id?: string | null
          updated_at?: string
          user_confirmed_ignored?: boolean | null
          user_confirmed_ignored_at?: string | null
          user_confirmed_read?: boolean | null
          user_confirmed_read_at?: string | null
          user_confirmed_responded?: boolean | null
          user_confirmed_responded_at?: string | null
          user_confirmed_sent?: boolean | null
          user_confirmed_sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          lead_id: string | null
          priority: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          lead_id?: string | null
          priority?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          lead_id?: string | null
          priority?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
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
