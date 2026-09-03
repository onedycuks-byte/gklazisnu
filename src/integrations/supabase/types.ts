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
      archives: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_size: number
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      discussions: {
        Row: {
          admin_reply: string | null
          author_name: string
          created_at: string
          id: string
          is_approved: boolean
          message: string
          replied_at: string | null
        }
        Insert: {
          admin_reply?: string | null
          author_name: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message: string
          replied_at?: string | null
        }
        Update: {
          admin_reply?: string | null
          author_name?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          message?: string
          replied_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          notes: string | null
          region_id: string | null
          status: string
          submitted_by: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          region_id?: string | null
          status?: string
          submitted_by?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          region_id?: string | null
          status?: string
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
        }
        Relationships: []
      }
      fundraiser_accounts: {
        Row: {
          address: string | null
          admin_notes: string | null
          created_at: string
          full_name: string
          id: string
          nik: string
          phone: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          created_at?: string
          full_name: string
          id?: string
          nik: string
          phone: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          created_at?: string
          full_name?: string
          id?: string
          nik?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fundraising_proposals: {
        Row: {
          admin_notes: string | null
          beneficiary: string | null
          category: string
          collected_amount: number
          created_at: string
          description: string
          fundraiser_id: string
          id: string
          image_url: string | null
          status: string
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          beneficiary?: string | null
          category?: string
          collected_amount?: number
          created_at?: string
          description: string
          fundraiser_id: string
          id?: string
          image_url?: string | null
          status?: string
          target_amount?: number
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          beneficiary?: string | null
          category?: string
          collected_amount?: number
          created_at?: string
          description?: string
          fundraiser_id?: string
          id?: string
          image_url?: string | null
          status?: string
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraising_proposals_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraiser_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orphan_registrations: {
        Row: {
          address: string
          admin_notes: string | null
          approved_at: string | null
          balance: number
          birth_date: string
          cause_of_orphan: string | null
          child_name: string
          created_at: string
          education: string | null
          father_name: string | null
          gender: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation: string | null
          id: string
          ktp_url: string | null
          mother_name: string | null
          school_name: string | null
          status: string
          unique_code: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          approved_at?: string | null
          balance?: number
          birth_date: string
          cause_of_orphan?: string | null
          child_name: string
          created_at?: string
          education?: string | null
          father_name?: string | null
          gender?: string | null
          guardian_name: string
          guardian_phone: string
          guardian_relation?: string | null
          id?: string
          ktp_url?: string | null
          mother_name?: string | null
          school_name?: string | null
          status?: string
          unique_code: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          approved_at?: string | null
          balance?: number
          birth_date?: string
          cause_of_orphan?: string | null
          child_name?: string
          created_at?: string
          education?: string | null
          father_name?: string | null
          gender?: string | null
          guardian_name?: string
          guardian_phone?: string
          guardian_relation?: string | null
          id?: string
          ktp_url?: string | null
          mother_name?: string | null
          school_name?: string | null
          status?: string
          unique_code?: string
        }
        Relationships: []
      }
      program_disbursements: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          program_id: string
          recipient_name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          program_id: string
          recipient_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          program_id?: string
          recipient_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_disbursements_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          collected_amount: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          qris_image_url: string | null
          target_amount: number
          title: string
          updated_at: string
        }
        Insert: {
          collected_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          qris_image_url?: string | null
          target_amount?: number
          title: string
          updated_at?: string
        }
        Update: {
          collected_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          qris_image_url?: string | null
          target_amount?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          coordinator: string
          created_at: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          coordinator: string
          created_at?: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          coordinator?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      santunan_disbursements: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          recipient_name: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          recipient_name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          recipient_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      santunan_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: []
      }
      site_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          page: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          page?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          page?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
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
      wallet_transactions: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          registration_id: string
          type: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          registration_id: string
          type?: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          registration_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "orphan_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_content_stats: {
        Args: never
        Returns: {
          page: string
          shares: number
          views: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_staff_role: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "bendahara"
        | "sekretaris"
        | "dokumentasi"
        | "koordinator"
        | "ketua"
        | "penyaluran"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "user",
        "bendahara",
        "sekretaris",
        "dokumentasi",
        "koordinator",
        "ketua",
        "penyaluran",
      ],
    },
  },
} as const
