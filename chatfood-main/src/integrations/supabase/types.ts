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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addons: {
        Row: {
          applies_to_type: Database["public"]["Enums"]["addon_applies_to"]
          applies_to_value: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          max_per_item: number | null
          price: number
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applies_to_type?: Database["public"]["Enums"]["addon_applies_to"]
          applies_to_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          max_per_item?: number | null
          price?: number
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applies_to_type?: Database["public"]["Enums"]["addon_applies_to"]
          applies_to_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          max_per_item?: number | null
          price?: number
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_email: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_impersonation_tokens: {
        Row: {
          created_at: string | null
          created_by: string
          created_by_email: string
          expires_at: string
          id: string
          revoked: boolean | null
          revoked_at: string | null
          single_use: boolean | null
          target_user_email: string
          target_user_id: string
          token: string
          used: boolean | null
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          created_by_email: string
          expires_at?: string
          id?: string
          revoked?: boolean | null
          revoked_at?: string | null
          single_use?: boolean | null
          target_user_email: string
          target_user_id: string
          token: string
          used?: boolean | null
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          created_by_email?: string
          expires_at?: string
          id?: string
          revoked?: boolean | null
          revoked_at?: string | null
          single_use?: boolean | null
          target_user_email?: string
          target_user_id?: string
          token?: string
          used?: boolean | null
          used_at?: string | null
        }
        Relationships: []
      }
      chatbot_menu_choices: {
        Row: {
          choice_index: number
          choice_label: string
          created_at: string
          id: string
          menu_id: string
          product_ids: string[]
        }
        Insert: {
          choice_index: number
          choice_label: string
          created_at?: string
          id?: string
          menu_id: string
          product_ids: string[]
        }
        Update: {
          choice_index?: number
          choice_label?: string
          created_at?: string
          id?: string
          menu_id?: string
          product_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_menu_choices_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "chatbot_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_menus: {
        Row: {
          available_days: string | null
          choice1_label: string | null
          choice1_productid: string[] | null
          choice2_label: string | null
          choice2_productid: string[] | null
          choice3_label: string | null
          choice3_productid: string[] | null
          choice4_label: string | null
          choice4_productid: string[] | null
          created_at: string
          end_time: string | null
          id: string
          is_active: boolean
          label: string
          menu_price: number
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_days?: string | null
          choice1_label?: string | null
          choice1_productid?: string[] | null
          choice2_label?: string | null
          choice2_productid?: string[] | null
          choice3_label?: string | null
          choice3_productid?: string[] | null
          choice4_label?: string | null
          choice4_productid?: string[] | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          label: string
          menu_price?: number
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_days?: string | null
          choice1_label?: string | null
          choice1_productid?: string[] | null
          choice2_label?: string | null
          choice2_productid?: string[] | null
          choice3_label?: string | null
          choice3_productid?: string[] | null
          choice4_label?: string | null
          choice4_productid?: string[] | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          label?: string
          menu_price?: number
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          body: string | null
          created_at: string
          customer_name: string | null
          from_number: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          status: string | null
          to_number: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_name?: string | null
          from_number: string
          id: string
          message_type?: Database["public"]["Enums"]["message_type"]
          status?: string | null
          to_number: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_name?: string | null
          from_number?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          status?: string | null
          to_number?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_orders: {
        Row: {
          commande_item: Json | null
          commande_type: string
          heure_de_commande: string
          horaire_recup: string | null
          id: string
          name: string | null
          note: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          phone: string
          platform_fee: number | null
          price_total: number
          review_message_id: string | null
          review_rating: number | null
          review_sent_at: string | null
          status: string
          stripe_fee: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          commande_item?: Json | null
          commande_type?: string
          heure_de_commande?: string
          horaire_recup?: string | null
          id?: string
          name?: string | null
          note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone: string
          platform_fee?: number | null
          price_total?: number
          review_message_id?: string | null
          review_rating?: number | null
          review_sent_at?: string | null
          status?: string
          stripe_fee?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          commande_item?: Json | null
          commande_type?: string
          heure_de_commande?: string
          horaire_recup?: string | null
          id?: string
          name?: string | null
          note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string
          platform_fee?: number | null
          price_total?: number
          review_message_id?: string | null
          review_rating?: number | null
          review_sent_at?: string | null
          status?: string
          stripe_fee?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_reservations: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          number_of_people: number
          reservation_datetime: string
          source: string | null
          source_message_id: string | null
          special_requests: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          number_of_people?: number
          reservation_datetime: string
          source?: string | null
          source_message_id?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          number_of_people?: number
          reservation_datetime?: string
          source?: string | null
          source_message_id?: string | null
          special_requests?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_reservations_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "chatbot_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          first_interaction_at: string
          id: string
          language: string | null
          last_interaction_at: string
          last_order_summary: Json | null
          name: string | null
          phone: string
          phone_normalized: string | null
          preferences: Json | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_interaction_at?: string
          id?: string
          language?: string | null
          last_interaction_at?: string
          last_order_summary?: Json | null
          name?: string | null
          phone: string
          phone_normalized?: string | null
          preferences?: Json | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_interaction_at?: string
          id?: string
          language?: string | null
          last_interaction_at?: string
          last_order_summary?: Json | null
          name?: string | null
          phone?: string
          phone_normalized?: string | null
          preferences?: Json | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_configurations: {
        Row: {
          created_at: string | null
          customizations: Json
          id: string
          is_active: boolean | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          section_id: string
          section_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customizations?: Json
          id?: string
          is_active?: boolean | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          section_id: string
          section_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customizations?: Json
          id?: string
          is_active?: boolean | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          section_id?: string
          section_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboard_metric_values: {
        Row: {
          fetched_at: string | null
          id: string
          section_id: string
          user_id: string
          value: string
        }
        Insert: {
          fetched_at?: string | null
          id?: string
          section_id: string
          user_id: string
          value: string
        }
        Update: {
          fetched_at?: string | null
          id?: string
          section_id?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          created_at: string
          email: string
          id: string
          ip_address: unknown
          success: boolean
        }
        Insert: {
          attempt_time?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown
          success?: boolean
        }
        Update: {
          attempt_time?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown
          success?: boolean
        }
        Relationships: []
      }
      order_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_phone: string | null
          id: string
          order_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          order_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_phone?: string | null
          id?: string
          order_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          allergens: string[] | null
          category: string
          created_at: string
          currency: string | null
          description: string | null
          id: string
          ingredient: string[] | null
          is_active: boolean
          name: string
          sort_order: number | null
          tags: string[] | null
          unit_price: number
          updated_at: string
          user_id: string
          vat_rate: number | null
        }
        Insert: {
          allergens?: string[] | null
          category: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          ingredient?: string[] | null
          is_active?: boolean
          name: string
          sort_order?: number | null
          tags?: string[] | null
          unit_price?: number
          updated_at?: string
          user_id: string
          vat_rate?: number | null
        }
        Update: {
          allergens?: string[] | null
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          ingredient?: string[] | null
          is_active?: boolean
          name?: string
          sort_order?: number | null
          tags?: string[] | null
          unit_price?: number
          updated_at?: string
          user_id?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_profile_views: {
        Row: {
          id: string
          referer: string | null
          session_id: string | null
          slug: string
          user_agent: string | null
          user_id: string
          viewed_at: string
          visitor_ip: unknown
        }
        Insert: {
          id?: string
          referer?: string | null
          session_id?: string | null
          slug: string
          user_agent?: string | null
          user_id: string
          viewed_at?: string
          visitor_ip?: unknown
        }
        Update: {
          id?: string
          referer?: string | null
          session_id?: string | null
          slug?: string
          user_agent?: string | null
          user_id?: string
          viewed_at?: string
          visitor_ip?: unknown
        }
        Relationships: []
      }
      restaurant_settings: {
        Row: {
          address_city: string | null
          address_postal_code: string | null
          address_street: string | null
          assets: Json
          category_order: string[] | null
          chatbot_active: boolean
          chatbot_name: string
          chatbot_prompt: string | null
          cover_image_url: string | null
          created_at: string
          currency: string | null
          customer_reviews_delay_hours: number | null
          customer_reviews_enabled: boolean | null
          customer_reviews_message: string | null
          daily_menu_config: Json | null
          daily_menu_enabled: boolean | null
          default_language: string | null
          disabled_ingredients: string[] | null
          featured_categories: string[] | null
          geog: unknown
          id: string
          latitude: number | null
          location: unknown
          longitude: number | null
          manual_order_confirmation: boolean | null
          onboarding_completed: boolean | null
          online_orders_enabled: boolean | null
          opening_hours: Json
          order_time_enabled: boolean | null
          order_time_minutes: number | null
          payments_enabled: boolean | null
          phone_number_id: string | null
          platform_fee_percent: number | null
          product_suggestions: Json | null
          reservations_webhook_url: string | null
          restaurant_name: string | null
          restaurant_name_norm: string | null
          siret: string | null
          slug: string | null
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_onboarded_at: string | null
          stripe_onboarding_status: string | null
          stripe_payouts_enabled: boolean | null
          theme_color: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          user_number: number
          whatsapp_access_token: string | null
          whatsapp_business_id: string | null
        }
        Insert: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          assets?: Json
          category_order?: string[] | null
          chatbot_active?: boolean
          chatbot_name?: string
          chatbot_prompt?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          customer_reviews_delay_hours?: number | null
          customer_reviews_enabled?: boolean | null
          customer_reviews_message?: string | null
          daily_menu_config?: Json | null
          daily_menu_enabled?: boolean | null
          default_language?: string | null
          disabled_ingredients?: string[] | null
          featured_categories?: string[] | null
          geog?: unknown
          id?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          manual_order_confirmation?: boolean | null
          onboarding_completed?: boolean | null
          online_orders_enabled?: boolean | null
          opening_hours?: Json
          order_time_enabled?: boolean | null
          order_time_minutes?: number | null
          payments_enabled?: boolean | null
          phone_number_id?: string | null
          platform_fee_percent?: number | null
          product_suggestions?: Json | null
          reservations_webhook_url?: string | null
          restaurant_name?: string | null
          restaurant_name_norm?: string | null
          siret?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarded_at?: string | null
          stripe_onboarding_status?: string | null
          stripe_payouts_enabled?: boolean | null
          theme_color?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          user_number?: number
          whatsapp_access_token?: string | null
          whatsapp_business_id?: string | null
        }
        Update: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          assets?: Json
          category_order?: string[] | null
          chatbot_active?: boolean
          chatbot_name?: string
          chatbot_prompt?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          customer_reviews_delay_hours?: number | null
          customer_reviews_enabled?: boolean | null
          customer_reviews_message?: string | null
          daily_menu_config?: Json | null
          daily_menu_enabled?: boolean | null
          default_language?: string | null
          disabled_ingredients?: string[] | null
          featured_categories?: string[] | null
          geog?: unknown
          id?: string
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          manual_order_confirmation?: boolean | null
          onboarding_completed?: boolean | null
          online_orders_enabled?: boolean | null
          opening_hours?: Json
          order_time_enabled?: boolean | null
          order_time_minutes?: number | null
          payments_enabled?: boolean | null
          phone_number_id?: string | null
          platform_fee_percent?: number | null
          product_suggestions?: Json | null
          reservations_webhook_url?: string | null
          restaurant_name?: string | null
          restaurant_name_norm?: string | null
          siret?: string | null
          slug?: string | null
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_onboarded_at?: string | null
          stripe_onboarding_status?: string | null
          stripe_payouts_enabled?: boolean | null
          theme_color?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          user_number?: number
          whatsapp_access_token?: string | null
          whatsapp_business_id?: string | null
        }
        Relationships: []
      }
      security_blocks: {
        Row: {
          block_type: string
          blocked_until: string
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          reason: string
        }
        Insert: {
          block_type: string
          blocked_until: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          reason?: string
        }
        Update: {
          block_type?: string
          blocked_until?: string
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          reason?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          awaiting_review: boolean | null
          created_at: string
          description: string
          id: string
          last_message_at: string | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          subject: string
          ticket_type: string
          updated_at: string
          user_email: string
          user_id: string
          user_plan: Database["public"]["Enums"]["subscription_plan"]
        }
        Insert: {
          admin_notes?: string | null
          awaiting_review?: boolean | null
          created_at?: string
          description: string
          id?: string
          last_message_at?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject: string
          ticket_type: string
          updated_at?: string
          user_email: string
          user_id: string
          user_plan: Database["public"]["Enums"]["subscription_plan"]
        }
        Update: {
          admin_notes?: string | null
          awaiting_review?: boolean | null
          created_at?: string
          description?: string
          id?: string
          last_message_at?: string | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          subject?: string
          ticket_type?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_plan?: Database["public"]["Enums"]["subscription_plan"]
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          ticket_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_reviews_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          started_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          started_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_integrations: {
        Row: {
          access_token: string
          business_id: string | null
          created_at: string | null
          display_phone_number: string | null
          id: string
          phone_number_id: string
          registration_pin: string | null
          registration_status: string | null
          status: string
          updated_at: string | null
          user_id: string
          verified_name: string | null
          waba_id: string
        }
        Insert: {
          access_token: string
          business_id?: string | null
          created_at?: string | null
          display_phone_number?: string | null
          id?: string
          phone_number_id: string
          registration_pin?: string | null
          registration_status?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verified_name?: string | null
          waba_id: string
        }
        Update: {
          access_token?: string
          business_id?: string | null
          created_at?: string | null
          display_phone_number?: string | null
          id?: string
          phone_number_id?: string
          registration_pin?: string | null
          registration_status?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verified_name?: string | null
          waba_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_restaurant_view: {
        Row: {
          address_city: string | null
          address_postal_code: string | null
          address_street: string | null
          assets: Json | null
          category_order: string[] | null
          chatbot_active: boolean | null
          cover_image_url: string | null
          currency: string | null
          daily_menu_config: Json | null
          daily_menu_enabled: boolean | null
          default_language: string | null
          featured_categories: string[] | null
          latitude: number | null
          longitude: number | null
          manual_order_confirmation: boolean | null
          online_orders_enabled: boolean | null
          opening_hours: Json | null
          order_time_enabled: boolean | null
          order_time_minutes: number | null
          product_suggestions: Json | null
          restaurant_name: string | null
          slug: string | null
          theme_color: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          assets?: Json | null
          category_order?: string[] | null
          chatbot_active?: boolean | null
          cover_image_url?: string | null
          currency?: string | null
          daily_menu_config?: Json | null
          daily_menu_enabled?: boolean | null
          default_language?: string | null
          featured_categories?: string[] | null
          latitude?: number | null
          longitude?: number | null
          manual_order_confirmation?: boolean | null
          online_orders_enabled?: boolean | null
          opening_hours?: Json | null
          order_time_enabled?: boolean | null
          order_time_minutes?: number | null
          product_suggestions?: Json | null
          restaurant_name?: string | null
          slug?: string | null
          theme_color?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          address_city?: string | null
          address_postal_code?: string | null
          address_street?: string | null
          assets?: Json | null
          category_order?: string[] | null
          chatbot_active?: boolean | null
          cover_image_url?: string | null
          currency?: string | null
          daily_menu_config?: Json | null
          daily_menu_enabled?: boolean | null
          default_language?: string | null
          featured_categories?: string[] | null
          latitude?: number | null
          longitude?: number | null
          manual_order_confirmation?: boolean | null
          online_orders_enabled?: boolean | null
          opening_hours?: Json | null
          order_time_enabled?: boolean | null
          order_time_minutes?: number | null
          product_suggestions?: Json | null
          restaurant_name?: string | null
          slug?: string | null
          theme_color?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_old_security_records: { Args: never; Returns: undefined }
      create_reservation: {
        Args: {
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone: string
          p_notes?: string
          p_number_of_people?: number
          p_reservation_datetime: string
          p_source?: string
          p_special_requests?: string
          p_user_id: string
        }
        Returns: Json
      }
      daitch_mokotoff: { Args: { "": string }; Returns: string[] }
      dmetaphone: { Args: { "": string }; Returns: string }
      dmetaphone_alt: { Args: { "": string }; Returns: string }
      generate_restaurant_slug: {
        Args: { current_user_id: string; name: string }
        Returns: string
      }
      get_addons: {
        Args: {
          p_category?: string
          p_product_id?: string
          p_restaurant_id: string
        }
        Returns: {
          applies_to_type: string
          applies_to_value: string
          id: string
          label: string
          max_per_item: number
          price: number
        }[]
      }
      get_profile_view_stats: {
        Args: { p_period?: string; p_user_id: string }
        Returns: {
          total_views: number
          unique_visitors: number
          views_by_day: Json
        }[]
      }
      get_setting: { Args: { key: string }; Returns: Json }
      get_user_plan: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["subscription_plan"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      immutable_unaccent: { Args: { value: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_blocked: {
        Args: { check_email?: string; check_ip?: unknown }
        Returns: {
          blocked: boolean
          blocked_until: string
          reason: string
        }[]
      }
      nearby_restaurants: {
        Args: { lat: number; limit_n?: number; long: number; radius_m?: number }
        Returns: {
          address_full: string
          chatbot_active: boolean
          dist_meters: number
          latitude: number
          longitude: number
          restaurant_name: string
          user_id: string
        }[]
      }
      normalize_restaurant_text: { Args: { value: string }; Returns: string }
      record_login_attempt: {
        Args: {
          attempt_email: string
          attempt_ip: unknown
          was_successful: boolean
        }
        Returns: {
          block_until: string
          should_block: boolean
        }[]
      }
      search_restaurants_by_location: {
        Args: {
          lat: number
          limit_n?: number
          lon: number
          max_distance_km?: number
        }
        Returns: {
          categories: string
          distance_km: number
          restaurant: Json
        }[]
      }
      search_restaurants_by_name: {
        Args: { limit_n?: number; preselect_n?: number; q: string }
        Returns: {
          categories: string
          lev: number
          query_normalized: string
          quick: number
          restaurant: Json
          score: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soundex: { Args: { "": string }; Returns: string }
      text_soundex: { Args: { "": string }; Returns: string }
      tokenize_restaurant_text: { Args: { value: string }; Returns: string[] }
      track_profile_view: {
        Args: {
          p_referer?: string
          p_session_id?: string
          p_slug: string
          p_user_agent?: string
          p_visitor_ip?: unknown
        }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_order_status: {
        Args: { p_order_id: string; p_status: string }
        Returns: Json
      }
      update_reservation_status: {
        Args: { p_reservation_id: string; p_status: string }
        Returns: Json
      }
    }
    Enums: {
      addon_applies_to: "product" | "category" | "global"
      message_direction: "inbound" | "outbound"
      message_type:
        | "text"
        | "audio"
        | "image"
        | "document"
        | "location"
        | "system"
      reservation_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      subscription_plan: "starter" | "pro" | "premium"
      user_role: "admin" | "user"
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
      addon_applies_to: ["product", "category", "global"],
      message_direction: ["inbound", "outbound"],
      message_type: [
        "text",
        "audio",
        "image",
        "document",
        "location",
        "system",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      subscription_plan: ["starter", "pro", "premium"],
      user_role: ["admin", "user"],
    },
  },
} as const
