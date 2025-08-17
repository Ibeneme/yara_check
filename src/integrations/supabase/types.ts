export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      anonymous_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          report_id: string
          report_type: string
          sender_contact: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          report_id: string
          report_type: string
          sender_contact?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          report_id?: string
          report_type?: string
          sender_contact?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reputation_reports: {
        Row: {
          business_type: string
          country_id: string | null
          description: string
          evidence: string | null
          id: string
          report_date: string
          reported_person_contact: string
          reported_person_name: string
          reporter_address: string | null
          reporter_email: string
          reporter_name: string
          reporter_phone: string
          reputation_status: string
          status: string
          tracking_code: string | null
          transaction_amount: string
          transaction_date: string
          user_id: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          visible: boolean | null
        }
        Insert: {
          business_type: string
          country_id?: string | null
          description: string
          evidence?: string | null
          id?: string
          report_date?: string
          reported_person_contact: string
          reported_person_name: string
          reporter_address?: string | null
          reporter_email: string
          reporter_name: string
          reporter_phone: string
          reputation_status: string
          status?: string
          tracking_code?: string | null
          transaction_amount: string
          transaction_date: string
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visible?: boolean | null
        }
        Update: {
          business_type?: string
          country_id?: string | null
          description?: string
          evidence?: string | null
          id?: string
          report_date?: string
          reported_person_contact?: string
          reported_person_name?: string
          reporter_address?: string | null
          reporter_email?: string
          reporter_name?: string
          reporter_phone?: string
          reputation_status?: string
          status?: string
          tracking_code?: string | null
          transaction_amount?: string
          transaction_date?: string
          user_id?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      company_assets: {
        Row: {
          assigned_to: string | null
          category: string
          condition: string
          created_at: string
          created_by: string
          current_value: number
          depreciation_rate: number | null
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          condition?: string
          created_at?: string
          created_by: string
          current_value: number
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          condition?: string
          created_at?: string
          created_by?: string
          current_value?: number
          depreciation_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: []
      }
      contact_logs: {
        Row: {
          contact_type: string
          contacted_by: string | null
          created_at: string
          id: string
          report_id: string
          report_type: string
        }
        Insert: {
          contact_type: string
          contacted_by?: string | null
          created_at?: string
          id?: string
          report_id: string
          report_type: string
        }
        Update: {
          contact_type?: string
          contacted_by?: string | null
          created_at?: string
          id?: string
          report_id?: string
          report_type?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          brand: string
          color: string
          contact: string
          country_id: string | null
          description: string | null
          id: string
          image_url: string | null
          imei: string
          location: string
          model: string
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          type: string
          user_id: string | null
          visible: boolean | null
        }
        Insert: {
          brand: string
          color: string
          contact: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei: string
          location: string
          model: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type: string
          user_id?: string | null
          visible?: boolean | null
        }
        Update: {
          brand?: string
          color?: string
          contact?: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei?: string
          location?: string
          model?: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type?: string
          user_id?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          created_at: string | null
          id: string
          record_date: string
          report_count: number | null
          revenue: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          record_date: string
          report_count?: number | null
          revenue?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          record_date?: string
          report_count?: number | null
          revenue?: number
        }
        Relationships: []
      }
      hacked_accounts: {
        Row: {
          account_identifier: string
          account_type: string
          contact: string
          country_id: string | null
          created_at: string | null
          date_compromised: string
          description: string
          id: string
          image_url: string | null
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          updated_at: string | null
          user_id: string | null
          visible: boolean | null
        }
        Insert: {
          account_identifier: string
          account_type: string
          contact: string
          country_id?: string | null
          created_at?: string | null
          date_compromised: string
          description: string
          id?: string
          image_url?: string | null
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          visible?: boolean | null
        }
        Update: {
          account_identifier?: string
          account_type?: string
          contact?: string
          country_id?: string | null
          created_at?: string | null
          date_compromised?: string
          description?: string
          id?: string
          image_url?: string | null
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          updated_at?: string | null
          user_id?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      household_items: {
        Row: {
          brand: string
          color: string
          contact: string
          country_id: string | null
          description: string | null
          id: string
          image_url: string | null
          imei: string
          location: string
          model: string
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          type: string
          user_id: string | null
          visible: boolean | null
          year: number
        }
        Insert: {
          brand: string
          color: string
          contact: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei: string
          location: string
          model: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type: string
          user_id?: string | null
          visible?: boolean | null
          year: number
        }
        Update: {
          brand?: string
          color?: string
          contact?: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei?: string
          location?: string
          model?: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type?: string
          user_id?: string | null
          visible?: boolean | null
          year?: number
        }
        Relationships: []
      }
      live_chat_messages: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_admin_reply: boolean | null
          message: string
          resolved_at: string | null
          resolved_by: string | null
          session_id: string
          status: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          session_id: string
          status?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string
          status?: string | null
          user_email?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_chat_messages_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_chat_messages_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string | null
          sender_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id?: string | null
          sender_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string | null
          sender_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_belongings: {
        Row: {
          brand: string
          color: string
          contact: string
          country_id: string | null
          description: string | null
          id: string
          image_url: string | null
          imei: string
          location: string
          model: string
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          type: string
          user_id: string | null
          visible: boolean | null
          year: number
        }
        Insert: {
          brand: string
          color: string
          contact: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei: string
          location: string
          model: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type: string
          user_id?: string | null
          visible?: boolean | null
          year: number
        }
        Update: {
          brand?: string
          color?: string
          contact?: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          imei?: string
          location?: string
          model?: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type?: string
          user_id?: string | null
          visible?: boolean | null
          year?: number
        }
        Relationships: []
      }
      persons: {
        Row: {
          age: number
          contact: string
          country_id: string | null
          date_missing: string
          description: string | null
          gender: string
          id: string
          image_url: string | null
          location: string
          name: string
          physical_attributes: string | null
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          user_id: string | null
          visible: boolean | null
        }
        Insert: {
          age: number
          contact: string
          country_id?: string | null
          date_missing: string
          description?: string | null
          gender: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          physical_attributes?: string | null
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          user_id?: string | null
          visible?: boolean | null
        }
        Update: {
          age?: number
          contact?: string
          country_id?: string | null
          date_missing?: string
          description?: string | null
          gender?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          physical_attributes?: string | null
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          user_id?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_role: Database["public"]["Enums"]["admin_role"] | null
          country_id: string | null
          created_at: string
          created_by: string | null
          email: string
          first_name: string | null
          geographic_access: Json | null
          id: string
          is_active: boolean | null
          last_name: string | null
          must_change_password: boolean | null
          permissions: Json | null
          phone: string | null
          province_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          admin_role?: Database["public"]["Enums"]["admin_role"] | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          first_name?: string | null
          geographic_access?: Json | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          permissions?: Json | null
          phone?: string | null
          province_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          admin_role?: Database["public"]["Enums"]["admin_role"] | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          first_name?: string | null
          geographic_access?: Json | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          permissions?: Json | null
          phone?: string | null
          province_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          country_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          country_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_distributions: {
        Row: {
          amount: number
          created_at: string | null
          distributed_by: string | null
          id: string
          notes: string | null
          percentage: number
          period_end: string
          period_start: string
          period_type: string
          shareholder_id: string | null
          updated_at: string | null
          withdrawal_enabled: boolean | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          distributed_by?: string | null
          id?: string
          notes?: string | null
          percentage: number
          period_end: string
          period_start: string
          period_type: string
          shareholder_id?: string | null
          updated_at?: string | null
          withdrawal_enabled?: boolean | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          distributed_by?: string | null
          id?: string
          notes?: string | null
          percentage?: number
          period_end?: string
          period_start?: string
          period_type?: string
          shareholder_id?: string | null
          updated_at?: string | null
          withdrawal_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "roi_distributions_distributed_by_fkey"
            columns: ["distributed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_distributions_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roi_withdrawal_requests: {
        Row: {
          amount: number
          distribution_id: string | null
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          shareholder_id: string | null
          status: string
        }
        Insert: {
          amount: number
          distribution_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          shareholder_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          distribution_id?: string | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          shareholder_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_withdrawal_requests_distribution_id_fkey"
            columns: ["distribution_id"]
            isOneToOne: false
            referencedRelation: "roi_distributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_withdrawal_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roi_withdrawal_requests_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_provider: string
          payment_reference: string
          paystack_reference: string | null
          report_data: Json
          report_type: string
          status: string
          stripe_session_id: string | null
          tracking_code: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_provider: string
          payment_reference: string
          paystack_reference?: string | null
          report_data: Json
          report_type: string
          status?: string
          stripe_session_id?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_provider?: string
          payment_reference?: string
          paystack_reference?: string | null
          report_data?: Json
          report_type?: string
          status?: string
          stripe_session_id?: string | null
          tracking_code?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_accounts: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          chassis: string
          color: string
          contact: string
          country_id: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string
          model: string
          report_date: string
          reporter_address: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          status: string
          tracking_code: string | null
          type: string
          user_id: string | null
          visible: boolean | null
          year: number
        }
        Insert: {
          brand: string
          chassis: string
          color: string
          contact: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location: string
          model: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type: string
          user_id?: string | null
          visible?: boolean | null
          year: number
        }
        Update: {
          brand?: string
          chassis?: string
          color?: string
          contact?: string
          country_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string
          model?: string
          report_date?: string
          reporter_address?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          status?: string
          tracking_code?: string | null
          type?: string
          user_id?: string | null
          visible?: boolean | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_profile_access: {
        Args: { profile_id: string }
        Returns: boolean
      }
      create_paystack_vehicle_payment: {
        Args: { p_amount?: number }
        Returns: {
          reference: string
          authorization_url: string
        }[]
      }
      detect_links: {
        Args: { text_content: string }
        Returns: string
      }
      generate_secure_temp_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_temp_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_reports_by_email: {
        Args: { user_email: string }
        Returns: {
          report_id: string
          report_type: string
          report_data: Json
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_admin_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_text: string; action_details?: Json }
        Returns: undefined
      }
      promote_to_super_admin: {
        Args: { email_address: string }
        Returns: string
      }
      search_by_tracking_code: {
        Args: { search_tracking_code: string }
        Returns: {
          report_id: string
          report_type: string
          report_data: Json
        }[]
      }
      search_items_public: {
        Args: { search_term: string }
        Returns: {
          item_id: string
          item_type: string
          item_data: Json
        }[]
      }
      search_persons_public: {
        Args: { search_term: string }
        Returns: {
          person_id: string
          person_data: Json
        }[]
      }
      update_report_status: {
        Args: {
          report_id_param: string
          report_type_param: string
          new_status: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "director"
        | "country_rep"
        | "province_manager"
        | "shareholder"
        | "customer_support_executive"
        | "investor"
      user_role: "user" | "admin" | "super_admin"
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
      admin_role: [
        "super_admin",
        "director",
        "country_rep",
        "province_manager",
        "shareholder",
        "customer_support_executive",
        "investor",
      ],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
