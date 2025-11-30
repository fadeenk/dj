export type Json
  = | string
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
      djs: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          payment_links: Json | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          payment_links?: Json | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          payment_links?: Json | null
          username?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          dj_id: string
          end_time: string | null
          house_rules: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          start_time: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          dj_id: string
          end_time?: string | null
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          start_time: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          dj_id?: string
          end_time?: string | null
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_dj_id_fkey'
            columns: ['dj_id']
            isOneToOne: false
            referencedRelation: 'djs'
            referencedColumns: ['id']
          }
        ]
      }
      feedback: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          is_read: boolean | null
          message: string | null
          sentiment: Database['public']['Enums']['feedback_sentiment'] | null
          user_name: string | null
          user_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          sentiment?: Database['public']['Enums']['feedback_sentiment'] | null
          user_name?: string | null
          user_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          sentiment?: Database['public']['Enums']['feedback_sentiment'] | null
          user_name?: string | null
          user_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          }
        ]
      }
      requests: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          song_artist: string | null
          song_title: string
          status: Database['public']['Enums']['request_status'] | null
          upvotes: number | null
          user_comment: string | null
          user_name: string | null
          user_session_id: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          song_artist?: string | null
          song_title: string
          status?: Database['public']['Enums']['request_status'] | null
          upvotes?: number | null
          user_comment?: string | null
          user_name?: string | null
          user_session_id: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          song_artist?: string | null
          song_title?: string
          status?: Database['public']['Enums']['request_status'] | null
          upvotes?: number | null
          user_comment?: string | null
          user_name?: string | null
          user_session_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'requests_event_id_fkey'
            columns: ['event_id']
            isOneToOne: false
            referencedRelation: 'events'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_upvotes: { Args: { row_id: string }, Returns: undefined }
    }
    Enums: {
      feedback_sentiment: 'positive' | 'negative' | 'neutral'
      request_status: 'pending' | 'ready' | 'played' | 'ignored'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables']
    & DefaultSchema['Views'])
    ? (DefaultSchema['Tables']
      & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {}
  },
  public: {
    Enums: {
      feedback_sentiment: ['positive', 'negative', 'neutral'],
      request_status: ['pending', 'ready', 'played', 'ignored']
    }
  }
} as const
