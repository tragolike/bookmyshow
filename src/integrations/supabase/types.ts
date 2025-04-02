export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string | null
          booking_status: string
          created_at: string | null
          event_id: string | null
          id: string
          movie_id: string | null
          payment_status: string
          seat_layout_id: string | null
          seat_numbers: string[]
          total_amount: number
          user_id: string
        }
        Insert: {
          booking_date?: string | null
          booking_status?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          movie_id?: string | null
          payment_status?: string
          seat_layout_id?: string | null
          seat_numbers: string[]
          total_amount: number
          user_id: string
        }
        Update: {
          booking_date?: string | null
          booking_status?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          movie_id?: string | null
          payment_status?: string
          seat_layout_id?: string | null
          seat_numbers?: string[]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_seat_layout_id_fkey"
            columns: ["seat_layout_id"]
            isOneToOne: false
            referencedRelation: "seat_layouts"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_settings: {
        Row: {
          favicon_url: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          site_name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          site_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          site_name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country_id: number | null
          id: number
          name: string
        }
        Insert: {
          country_id?: number | null
          id?: never
          name: string
        }
        Update: {
          country_id?: number | null
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          city: string
          created_at: string | null
          date: string
          id: string
          image: string
          interested: number | null
          price: number
          status: string
          time: string
          title: string
          venue: string
        }
        Insert: {
          category: string
          city: string
          created_at?: string | null
          date: string
          id?: string
          image: string
          interested?: number | null
          price: number
          status?: string
          time: string
          title: string
          venue: string
        }
        Update: {
          category?: string
          city?: string
          created_at?: string | null
          date?: string
          id?: string
          image?: string
          interested?: number | null
          price?: number
          status?: string
          time?: string
          title?: string
          venue?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          created_at: string | null
          format: string | null
          genre: string
          id: string
          image: string
          language: string
          rating: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          format?: string | null
          genre: string
          id?: string
          image: string
          language: string
          rating?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          format?: string | null
          genre?: string
          id?: string
          image?: string
          language?: string
          rating?: number | null
          title?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          id: string
          payment_instructions: string | null
          qr_code_url: string | null
          updated_at: string | null
          updated_by: string | null
          upi_id: string
        }
        Insert: {
          id?: string
          payment_instructions?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          upi_id: string
        }
        Update: {
          id?: string
          payment_instructions?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
          updated_by?: string | null
          upi_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      seat_categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          color?: string
          created_at?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      seat_layouts: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          layout_data: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          layout_data: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          layout_data?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seat_layouts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          base_price: number
          category: string
          color: string | null
          created_at: string | null
          id: string
          surge_price: number | null
        }
        Insert: {
          base_price: number
          category: string
          color?: string | null
          created_at?: string | null
          id?: string
          surge_price?: number | null
        }
        Update: {
          base_price?: number
          category?: string
          color?: string | null
          created_at?: string | null
          id?: string
          surge_price?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
