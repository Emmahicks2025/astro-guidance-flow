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
      api_keys: {
        Row: {
          id: string
          key_name: string
          key_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key_name: string
          key_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key_name?: string
          key_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      consultations: {
        Row: {
          amount_charged: number | null
          concern: string | null
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          feedback: string | null
          id: string
          jotshi_id: string
          rating: number | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_charged?: number | null
          concern?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          feedback?: string | null
          id?: string
          jotshi_id: string
          rating?: number | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_charged?: number | null
          concern?: string | null
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          feedback?: string | null
          id?: string
          jotshi_id?: string
          rating?: number | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_memories: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          key_points: Json
          last_call_at: string | null
          summary: string | null
          total_calls: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          key_points?: Json
          last_call_at?: string | null
          summary?: string | null
          total_calls?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          key_points?: Json
          last_call_at?: string | null
          summary?: string | null
          total_calls?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_balances: {
        Row: {
          balance: number
          id: string
          lifetime_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          lifetime_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          lifetime_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jotshi_profiles: {
        Row: {
          ai_personality: string | null
          approval_status: string
          approved_at: string | null
          avatar_url: string | null
          bio: string | null
          category: string | null
          created_at: string
          display_name: string | null
          experience_years: number | null
          first_message: string | null
          greeting_message: string | null
          hourly_rate: number | null
          id: string
          is_online: boolean | null
          languages: string[] | null
          rating: number | null
          specialty: string | null
          total_earnings: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string | null
          verified: boolean | null
          voice_id: string | null
        }
        Insert: {
          ai_personality?: string | null
          approval_status?: string
          approved_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          first_message?: string | null
          greeting_message?: string | null
          hourly_rate?: number | null
          id?: string
          is_online?: boolean | null
          languages?: string[] | null
          rating?: number | null
          specialty?: string | null
          total_earnings?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          voice_id?: string | null
        }
        Update: {
          ai_personality?: string | null
          approval_status?: string
          approved_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          display_name?: string | null
          experience_years?: number | null
          first_message?: string | null
          greeting_message?: string | null
          hourly_rate?: number | null
          id?: string
          is_online?: boolean | null
          languages?: string[] | null
          rating?: number | null
          specialty?: string | null
          total_earnings?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean | null
          voice_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_time_exactness: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          kundli_analysis_text: string | null
          major_concern: string | null
          palm_analysis_text: string | null
          partner_dob: string | null
          partner_name: string | null
          partner_place_of_birth: string | null
          partner_time_of_birth: string | null
          place_of_birth: string | null
          relationship_status: string | null
          role: string
          time_of_birth: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_time_exactness?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          kundli_analysis_text?: string | null
          major_concern?: string | null
          palm_analysis_text?: string | null
          partner_dob?: string | null
          partner_name?: string | null
          partner_place_of_birth?: string | null
          partner_time_of_birth?: string | null
          place_of_birth?: string | null
          relationship_status?: string | null
          role?: string
          time_of_birth?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_time_exactness?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          kundli_analysis_text?: string | null
          major_concern?: string | null
          palm_analysis_text?: string | null
          partner_dob?: string | null
          partner_name?: string | null
          partner_place_of_birth?: string | null
          partner_time_of_birth?: string | null
          place_of_birth?: string | null
          relationship_status?: string | null
          role?: string
          time_of_birth?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          apple_product_id: string
          call_credit_per_min: number
          chat_credit_per_1k_tokens: number
          created_at: string
          features: Json
          id: string
          is_active: boolean
          monthly_credits: number
          name: string
          price_usd: number
        }
        Insert: {
          apple_product_id: string
          call_credit_per_min?: number
          chat_credit_per_1k_tokens?: number
          created_at?: string
          features?: Json
          id: string
          is_active?: boolean
          monthly_credits?: number
          name: string
          price_usd?: number
        }
        Update: {
          apple_product_id?: string
          call_credit_per_min?: number
          chat_credit_per_1k_tokens?: number
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          monthly_credits?: number
          name?: string
          price_usd?: number
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          amount_requested: number | null
          created_at: string
          description: string | null
          id: string
          payment_details: string | null
          payment_method: string | null
          status: string
          subject: string
          ticket_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_requested?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_details?: string | null
          payment_method?: string | null
          status?: string
          subject: string
          ticket_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_requested?: number | null
          created_at?: string
          description?: string | null
          id?: string
          payment_details?: string | null
          payment_method?: string | null
          status?: string
          subject?: string
          ticket_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topup_packs: {
        Row: {
          apple_product_id: string
          bonus_credits: number
          created_at: string
          credits: number
          id: string
          is_active: boolean
          price_usd: number
        }
        Insert: {
          apple_product_id: string
          bonus_credits?: number
          created_at?: string
          credits: number
          id: string
          is_active?: boolean
          price_usd: number
        }
        Update: {
          apple_product_id?: string
          bonus_credits?: number
          created_at?: string
          credits?: number
          id?: string
          is_active?: boolean
          price_usd?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          apple_original_transaction_id: string | null
          apple_transaction_id: string | null
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apple_original_transaction_id?: string | null
          apple_transaction_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          apple_transaction_id: string | null
          consultation_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          apple_transaction_id?: string | null
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          apple_transaction_id?: string | null
          consultation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
