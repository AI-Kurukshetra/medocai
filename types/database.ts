export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          beds_count: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }
      user_profiles: {
        Row: {
          id: string
          organization_id: string | null
          full_name: string
          role: 'cdi_specialist' | 'physician' | 'admin' | 'coder'
          specialty: string | null
          employee_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      patients: {
        Row: {
          id: string
          organization_id: string
          mrn: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string | null
          insurance_type: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['patients']['Insert']>
      }
      encounters: {
        Row: {
          id: string
          patient_id: string
          organization_id: string
          attending_physician_id: string | null
          cdi_specialist_id: string | null
          encounter_type: string
          admission_date: string
          discharge_date: string | null
          status: string
          cdi_status: string
          principal_diagnosis_code: string | null
          admitting_diagnosis: string | null
          assigned_drg: string | null
          drg_description: string | null
          drg_weight: number | null
          base_reimbursement: number | null
          optimized_drg: string | null
          optimized_reimbursement: number | null
          revenue_impact: number | null
          ai_analysis_completed: boolean
          ai_risk_score: number | null
          documentation_gaps_count: number
          department: string | null
          ward: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['encounters']['Row'], 'id' | 'created_at' | 'updated_at' | 'revenue_impact'>
        Update: Partial<Database['public']['Tables']['encounters']['Insert']>
      }
      clinical_documents: {
        Row: {
          id: string
          encounter_id: string
          document_type: string
          title: string
          content: string
          author_id: string | null
          author_name: string | null
          document_date: string
          ai_processed: boolean
          ai_processed_at: string | null
          extracted_diagnoses: Json
          extracted_procedures: Json
          extracted_labs: Json
          documentation_gaps: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinical_documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clinical_documents']['Insert']>
      }
      encounter_diagnoses: {
        Row: {
          id: string
          encounter_id: string
          icd10_code: string
          icd10_description: string
          diagnosis_type: string
          cc_mcc_status: string | null
          source: string
          ai_confidence: number | null
          clinical_evidence: string | null
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['encounter_diagnoses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['encounter_diagnoses']['Insert']>
      }
      queries: {
        Row: {
          id: string
          encounter_id: string
          created_by: string
          assigned_to: string
          query_type: string
          subject: string
          body: string
          clinical_indicator: string | null
          suggested_options: Json
          status: string
          physician_response: string | null
          agreed_code: string | null
          agreed_description: string | null
          response_date: string | null
          priority: string
          due_date: string | null
          sent_at: string | null
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['queries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['queries']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
