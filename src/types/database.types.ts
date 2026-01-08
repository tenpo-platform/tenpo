export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      academies: {
        Row: {
          cover_image_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          email: string | null
          id: string
          is_verified: boolean
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          website: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          website?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      academy_admins: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_admins_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_guardians: {
        Row: {
          athlete_id: string
          can_book: boolean
          created_at: string
          guardian_id: string
          id: string
          is_primary: boolean
          relationship: string | null
        }
        Insert: {
          athlete_id: string
          can_book?: boolean
          created_at?: string
          guardian_id: string
          id?: string
          is_primary?: boolean
          relationship?: string | null
        }
        Update: {
          athlete_id?: string
          can_book?: boolean
          created_at?: string
          guardian_id?: string
          id?: string
          is_primary?: boolean
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_guardians_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_medical: {
        Row: {
          allergies: string[] | null
          athlete_id: string
          created_at: string
          emergency_contact: Json
          id: string
          medical_conditions: Json | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          athlete_id: string
          created_at?: string
          emergency_contact: Json
          id?: string
          medical_conditions?: Json | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          athlete_id?: string
          created_at?: string
          emergency_contact?: Json
          id?: string
          medical_conditions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_medical_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: true
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          birthdate: string
          created_at: string
          deleted_at: string | null
          first_name: string
          id: string
          last_name: string
          skill_level: string | null
          team: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birthdate: string
          created_at?: string
          deleted_at?: string | null
          first_name: string
          id?: string
          last_name: string
          skill_level?: string | null
          team?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birthdate?: string
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          skill_level?: string | null
          team?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_days: {
        Row: {
          created_at: string
          date: string
          end_time: string
          event_id: string
          id: string
          notes: string | null
          start_time: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          event_id: string
          id?: string
          notes?: string | null
          start_time: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          event_id?: string
          id?: string
          notes?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_days_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          athlete_id: string
          created_at: string
          currency: string
          discount_cents: number
          event_id: string
          event_ticket_id: string
          fees_cents: number
          id: string
          notes: string | null
          payment_id: string | null
          price_paid_cents: number
          promo_code_id: string | null
          registered_by: string
          status: Database["public"]["Enums"]["registration_status"]
          ticket_price_cents: number
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          currency?: string
          discount_cents?: number
          event_id: string
          event_ticket_id: string
          fees_cents?: number
          id?: string
          notes?: string | null
          payment_id?: string | null
          price_paid_cents: number
          promo_code_id?: string | null
          registered_by: string
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_price_cents: number
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          currency?: string
          discount_cents?: number
          event_id?: string
          event_ticket_id?: string
          fees_cents?: number
          id?: string
          notes?: string | null
          payment_id?: string | null
          price_paid_cents?: number
          promo_code_id?: string | null
          registered_by?: string
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_event_ticket_id_fkey"
            columns: ["event_ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registrations_payment"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          capacity: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          event_id: string
          id: string
          max_age: number | null
          min_age: number | null
          name: string
          price: number
          quantity_sold: number
          sales_end_at: string | null
          sales_start_at: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          name: string
          price: number
          quantity_sold?: number
          sales_end_at?: string | null
          sales_start_at?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          name?: string
          price?: number
          quantity_sold?: number
          sales_end_at?: string | null
          sales_start_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_waivers: {
        Row: {
          created_at: string
          event_id: string
          id: string
          is_required: boolean
          waiver_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          is_required?: boolean
          waiver_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          is_required?: boolean
          waiver_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_waivers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_waivers_waiver_id_fkey"
            columns: ["waiver_id"]
            isOneToOne: false
            referencedRelation: "waivers"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          academy_id: string
          cancellation_policy_hours: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          event_type: string
          id: string
          image_url: string | null
          is_virtual: boolean
          location_id: string | null
          max_age: number | null
          min_age: number | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          skill_levels: string[] | null
          slug: string
          sport_id: string
          status: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          cancellation_policy_hours?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean
          location_id?: string | null
          max_age?: number | null
          min_age?: number | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          skill_levels?: string[] | null
          slug: string
          sport_id: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone: string
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          cancellation_policy_hours?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean
          location_id?: string | null
          max_age?: number | null
          min_age?: number | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          skill_levels?: string[] | null
          slug?: string
          sport_id?: string
          status?: Database["public"]["Enums"]["event_status"]
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          amenities: string[] | null
          capacity: number | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          facility_type: string | null
          id: string
          is_indoor: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          photos: string[] | null
          postal_code: string | null
          state: string | null
          timezone: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["location_visibility"]
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_type?: string | null
          id?: string
          is_indoor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          photos?: string[] | null
          postal_code?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["location_visibility"]
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          amenities?: string[] | null
          capacity?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          facility_type?: string | null
          id?: string
          is_indoor?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          photos?: string[] | null
          postal_code?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["location_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          academy_id: string | null
          amount: number
          created_at: string
          currency: string
          event_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_source: Database["public"]["Enums"]["payment_source"]
          platform_fee: number
          receipt_email: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          amount: number
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_source?: Database["public"]["Enums"]["payment_source"]
          platform_fee?: number
          receipt_email?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_source?: Database["public"]["Enums"]["payment_source"]
          platform_fee?: number
          receipt_email?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          academy_id: string | null
          amount: number
          coach_id: string | null
          created_at: string
          currency: string
          event_id: string | null
          id: string
          payment_id: string | null
          platform_fee: number | null
          status: string
          stripe_balance_transaction_id: string | null
          stripe_transfer_id: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          amount: number
          coach_id?: string | null
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          payment_id?: string | null
          platform_fee?: number | null
          status: string
          stripe_balance_transaction_id?: string | null
          stripe_transfer_id: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          amount?: number
          coach_id?: string | null
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          payment_id?: string | null
          platform_fee?: number | null
          status?: string
          stripe_balance_transaction_id?: string | null
          stripe_transfer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          phone_number: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          registration_id: string | null
          requested_by: string
          status: Database["public"]["Enums"]["refund_status"]
          stripe_refund_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          registration_id?: string | null
          requested_by: string
          status?: Database["public"]["Enums"]["refund_status"]
          stripe_refund_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          registration_id?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["refund_status"]
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          created_at: string
          deleted_at: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          is_primary: boolean
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_primary?: boolean
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_primary?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waiver_signatures: {
        Row: {
          athlete_id: string
          document_url: string | null
          event_id: string | null
          id: string
          ip_address: string | null
          signature_method: string
          signed_at: string
          signed_by_user_id: string
          user_agent: string | null
          waiver_id: string
          waiver_version: number
        }
        Insert: {
          athlete_id: string
          document_url?: string | null
          event_id?: string | null
          id?: string
          ip_address?: string | null
          signature_method: string
          signed_at?: string
          signed_by_user_id: string
          user_agent?: string | null
          waiver_id: string
          waiver_version: number
        }
        Update: {
          athlete_id?: string
          document_url?: string | null
          event_id?: string | null
          id?: string
          ip_address?: string | null
          signature_method?: string
          signed_at?: string
          signed_by_user_id?: string
          user_agent?: string | null
          waiver_id?: string
          waiver_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "waiver_signatures_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_signatures_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_signatures_signed_by_user_id_fkey"
            columns: ["signed_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiver_signatures_waiver_id_fkey"
            columns: ["waiver_id"]
            isOneToOne: false
            referencedRelation: "waivers"
            referencedColumns: ["id"]
          },
        ]
      }
      waivers: {
        Row: {
          academy_id: string | null
          coach_id: string | null
          content: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          version: number
        }
        Insert: {
          academy_id?: string | null
          coach_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          version?: number
        }
        Update: {
          academy_id?: string | null
          coach_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "waivers_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waivers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reserve_ticket: { Args: { p_ticket_id: string }; Returns: string }
    }
    Enums: {
      event_status: "draft" | "published" | "canceled" | "completed"
      location_visibility: "public" | "private"
      payment_source: "stripe" | "free" | "comp"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      refund_status: "pending" | "approved" | "rejected" | "completed"
      registration_status:
        | "pending"
        | "confirmed"
        | "canceled"
        | "refunded"
        | "completed"
      user_role:
        | "PARENT"
        | "ATHLETE"
        | "COACH"
        | "ACADEMY_ADMIN"
        | "SUPER_ADMIN"
        | "STAFF"
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
      event_status: ["draft", "published", "canceled", "completed"],
      location_visibility: ["public", "private"],
      payment_source: ["stripe", "free", "comp"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      refund_status: ["pending", "approved", "rejected", "completed"],
      registration_status: [
        "pending",
        "confirmed",
        "canceled",
        "refunded",
        "completed",
      ],
      user_role: [
        "PARENT",
        "ATHLETE",
        "COACH",
        "ACADEMY_ADMIN",
        "SUPER_ADMIN",
        "STAFF",
      ],
    },
  },
} as const

