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
      agenda_eventos: {
        Row: {
          cor: string | null
          created_at: string
          criado_por: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          dia_inteiro: boolean
          google_event_id: string | null
          id: string
          local: string | null
          negocio_id: string | null
          pessoa_id: string | null
          prioridade: string
          processo_id: string | null
          responsavel_id: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          dia_inteiro?: boolean
          google_event_id?: string | null
          id?: string
          local?: string | null
          negocio_id?: string | null
          pessoa_id?: string | null
          prioridade?: string
          processo_id?: string | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          dia_inteiro?: boolean
          google_event_id?: string | null
          id?: string
          local?: string | null
          negocio_id?: string | null
          pessoa_id?: string | null
          prioridade?: string
          processo_id?: string | null
          responsavel_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_eventos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      campos_analise: {
        Row: {
          ativo: boolean
          created_at: string
          entidade: string
          grupo: string
          id: string
          nome: string
          obrigatorio: boolean
          opcoes: Json | null
          ordem: number
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          entidade?: string
          grupo?: string
          id?: string
          nome: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          tipo?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          entidade?: string
          grupo?: string
          id?: string
          nome?: string
          obrigatorio?: boolean
          opcoes?: Json | null
          ordem?: number
          tipo?: string
        }
        Relationships: []
      }
      chat_conversas: {
        Row: {
          created_at: string
          criado_por: string | null
          deletado_em: string | null
          deletado_por: string | null
          fixado: boolean
          fixado_em: string | null
          id: string
          institucional: boolean
          nome: string | null
          tipo: string
          ultima_mensagem: string | null
          ultima_mensagem_em: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          fixado?: boolean
          fixado_em?: string | null
          id?: string
          institucional?: boolean
          nome?: string | null
          tipo?: string
          ultima_mensagem?: string | null
          ultima_mensagem_em?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          deletado_em?: string | null
          deletado_por?: string | null
          fixado?: boolean
          fixado_em?: string | null
          id?: string
          institucional?: boolean
          nome?: string | null
          tipo?: string
          ultima_mensagem?: string | null
          ultima_mensagem_em?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_mensagens: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          conteudo: string | null
          conversa_id: string
          created_at: string
          id: string
          referencia_id: string | null
          sender_id: string
          tipo: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo?: string | null
          conversa_id: string
          created_at?: string
          id?: string
          referencia_id?: string | null
          sender_id: string
          tipo?: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo?: string | null
          conversa_id?: string
          created_at?: string
          id?: string
          referencia_id?: string | null
          sender_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participantes: {
        Row: {
          conversa_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversa_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversa_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participantes_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_remetentes: {
        Row: {
          added_at: string
          conversa_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          conversa_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          conversa_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_remetentes_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          pessoa_id: string
          principal: boolean
          tipo: string
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          principal?: boolean
          tipo?: string
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          principal?: boolean
          tipo?: string
          valor?: string
        }
        Relationships: [
          {
            foreignKeyName: "contatos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_cessao: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          created_at: string
          data_assinatura: string | null
          data_homologacao: string | null
          data_registro: string | null
          id: string
          negocio_id: string
          observacoes: string | null
          processo_id: string | null
          status: string
          updated_at: string
          valor_cessao: number | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_homologacao?: string | null
          data_registro?: string | null
          id?: string
          negocio_id: string
          observacoes?: string | null
          processo_id?: string | null
          status?: string
          updated_at?: string
          valor_cessao?: number | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_homologacao?: string | null
          data_registro?: string | null
          id?: string
          negocio_id?: string
          observacoes?: string | null
          processo_id?: string | null
          status?: string
          updated_at?: string
          valor_cessao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cessao_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cessao_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_envio_signatarios: {
        Row: {
          assinado_em: string | null
          clicksign_signer_key: string | null
          cpf: string | null
          email: string
          envio_id: string
          id: string
          nome: string
          papel: string
          status: string
          telefone: string | null
        }
        Insert: {
          assinado_em?: string | null
          clicksign_signer_key?: string | null
          cpf?: string | null
          email: string
          envio_id: string
          id?: string
          nome: string
          papel?: string
          status?: string
          telefone?: string | null
        }
        Update: {
          assinado_em?: string | null
          clicksign_signer_key?: string | null
          cpf?: string | null
          email?: string
          envio_id?: string
          id?: string
          nome?: string
          papel?: string
          status?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documento_envio_signatarios_envio_id_fkey"
            columns: ["envio_id"]
            isOneToOne: false
            referencedRelation: "documento_envios"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_envios: {
        Row: {
          clicksign_document_key: string | null
          clicksign_envelope_id: string | null
          contrato_id: string | null
          created_at: string
          criado_por: string | null
          dados_variaveis: Json
          id: string
          modelo_id: string | null
          negocio_id: string | null
          processo_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          clicksign_document_key?: string | null
          clicksign_envelope_id?: string | null
          contrato_id?: string | null
          created_at?: string
          criado_por?: string | null
          dados_variaveis?: Json
          id?: string
          modelo_id?: string | null
          negocio_id?: string | null
          processo_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          clicksign_document_key?: string | null
          clicksign_envelope_id?: string | null
          contrato_id?: string | null
          created_at?: string
          criado_por?: string | null
          dados_variaveis?: Json
          id?: string
          modelo_id?: string | null
          negocio_id?: string | null
          processo_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documento_envios_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos_cessao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_envios_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "documento_modelos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_envios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documento_envios_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_modelos: {
        Row: {
          arquivo_url: string | null
          ativo: boolean
          clicksign_template_key: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          variaveis: Json
        }
        Insert: {
          arquivo_url?: string | null
          ativo?: boolean
          clicksign_template_key?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          variaveis?: Json
        }
        Update: {
          arquivo_url?: string | null
          ativo?: boolean
          clicksign_template_key?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          variaveis?: Json
        }
        Relationships: []
      }
      equipe_membros: {
        Row: {
          equipe_id: string
          id: string
          peso: number
          usuario_id: string
        }
        Insert: {
          equipe_id: string
          id?: string
          peso?: number
          usuario_id: string
        }
        Update: {
          equipe_id?: string
          id?: string
          peso?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_membros_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipe_membros_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ativa: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      google_tokens: {
        Row: {
          access_token: string
          calendar_id: string | null
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          sync_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          sync_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          sync_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      motivos_descarte: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      negocio_atividades: {
        Row: {
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          negocio_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          negocio_id: string
          tipo?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          negocio_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "negocio_atividades_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_campos_valores: {
        Row: {
          campo_id: string
          created_at: string
          id: string
          negocio_id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          campo_id: string
          created_at?: string
          id?: string
          negocio_id: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          campo_id?: string
          created_at?: string
          id?: string
          negocio_id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negocio_campos_valores_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_analise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocio_campos_valores_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_pipelines: {
        Row: {
          created_at: string
          etapas: Json
          id: string
          nome: string
          padrao: boolean
        }
        Insert: {
          created_at?: string
          etapas?: Json
          id?: string
          nome: string
          padrao?: boolean
        }
        Update: {
          created_at?: string
          etapas?: Json
          id?: string
          nome?: string
          padrao?: boolean
        }
        Relationships: []
      }
      negocios: {
        Row: {
          created_at: string
          data_abertura: string
          data_fechamento: string | null
          desagio_percentual: number | null
          id: string
          motivo_perda: string | null
          negocio_status: string
          observacoes: string | null
          ordem_kanban: number
          pessoa_id: string | null
          pipeline_etapa: string
          prazo_estimado_recebimento: number | null
          prioridade: string
          processo_id: string | null
          responsavel_id: string | null
          score_risco: string | null
          status_carteira: string | null
          tipo_servico: string | null
          titulo: string | null
          updated_at: string
          valor_face: number | null
          valor_fechamento: number | null
          valor_proposta: number | null
        }
        Insert: {
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          desagio_percentual?: number | null
          id?: string
          motivo_perda?: string | null
          negocio_status?: string
          observacoes?: string | null
          ordem_kanban?: number
          pessoa_id?: string | null
          pipeline_etapa?: string
          prazo_estimado_recebimento?: number | null
          prioridade?: string
          processo_id?: string | null
          responsavel_id?: string | null
          score_risco?: string | null
          status_carteira?: string | null
          tipo_servico?: string | null
          titulo?: string | null
          updated_at?: string
          valor_face?: number | null
          valor_fechamento?: number | null
          valor_proposta?: number | null
        }
        Update: {
          created_at?: string
          data_abertura?: string
          data_fechamento?: string | null
          desagio_percentual?: number | null
          id?: string
          motivo_perda?: string | null
          negocio_status?: string
          observacoes?: string | null
          ordem_kanban?: number
          pessoa_id?: string | null
          pipeline_etapa?: string
          prazo_estimado_recebimento?: number | null
          prioridade?: string
          processo_id?: string | null
          responsavel_id?: string | null
          score_risco?: string | null
          status_carteira?: string | null
          tipo_servico?: string | null
          titulo?: string | null
          updated_at?: string
          valor_face?: number | null
          valor_fechamento?: number | null
          valor_proposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "negocios_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          cidade: string | null
          cpf_cnpj: string
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          tipo: string
          uf: string | null
        }
        Insert: {
          cidade?: string | null
          cpf_cnpj: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          tipo?: string
          uf?: string | null
        }
        Update: {
          cidade?: string | null
          cpf_cnpj?: string
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          tipo?: string
          uf?: string | null
        }
        Relationships: []
      }
      processo_andamentos: {
        Row: {
          created_at: string
          criado_por: string | null
          data_andamento: string
          descricao: string | null
          documento_id: string | null
          id: string
          processo_id: string
          resumo: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          data_andamento?: string
          descricao?: string | null
          documento_id?: string | null
          id?: string
          processo_id: string
          resumo?: string | null
          tipo?: string
          titulo: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          data_andamento?: string
          descricao?: string | null
          documento_id?: string | null
          id?: string
          processo_id?: string
          resumo?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "processo_andamentos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "processo_documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_andamentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_campos_valores: {
        Row: {
          campo_id: string
          created_at: string
          id: string
          processo_id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          campo_id: string
          created_at?: string
          id?: string
          processo_id: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          campo_id?: string
          created_at?: string
          id?: string
          processo_id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processo_campos_valores_campo_id_fkey"
            columns: ["campo_id"]
            isOneToOne: false
            referencedRelation: "campos_analise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_campos_valores_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_documentos: {
        Row: {
          arquivo_nome: string
          arquivo_url: string
          created_at: string
          criado_por: string | null
          id: string
          nome: string
          processo_id: string
          tamanho: number | null
          tipo_documento: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_url: string
          created_at?: string
          criado_por?: string | null
          id?: string
          nome: string
          processo_id: string
          tamanho?: number | null
          tipo_documento?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_url?: string
          created_at?: string
          criado_por?: string | null
          id?: string
          nome?: string
          processo_id?: string
          tamanho?: number | null
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "processo_documentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_historico: {
        Row: {
          campo: string | null
          created_at: string
          descricao: string
          id: string
          metadata: Json | null
          processo_id: string
          tipo: string
          usuario_id: string | null
          usuario_nome: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          campo?: string | null
          created_at?: string
          descricao: string
          id?: string
          metadata?: Json | null
          processo_id: string
          tipo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          campo?: string | null
          created_at?: string
          descricao?: string
          id?: string
          metadata?: Json | null
          processo_id?: string
          tipo?: string
          usuario_id?: string | null
          usuario_nome?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processo_historico_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_notas: {
        Row: {
          anexos: Json | null
          conteudo: string
          created_at: string
          criado_por: string | null
          id: string
          processo_id: string
          updated_at: string
        }
        Insert: {
          anexos?: Json | null
          conteudo: string
          created_at?: string
          criado_por?: string | null
          id?: string
          processo_id: string
          updated_at?: string
        }
        Update: {
          anexos?: Json | null
          conteudo?: string
          created_at?: string
          criado_por?: string | null
          id?: string
          processo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processo_notas_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      processo_partes: {
        Row: {
          advogado_oab: string | null
          cpf_cnpj: string | null
          created_at: string
          id: string
          nome: string
          pessoa_id: string | null
          processo_id: string
          representado_id: string | null
          tipo: string
        }
        Insert: {
          advogado_oab?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          nome: string
          pessoa_id?: string | null
          processo_id: string
          representado_id?: string | null
          tipo?: string
        }
        Update: {
          advogado_oab?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          nome?: string
          pessoa_id?: string | null
          processo_id?: string
          representado_id?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "processo_partes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_partes_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processo_partes_representado_id_fkey"
            columns: ["representado_id"]
            isOneToOne: false
            referencedRelation: "processo_partes"
            referencedColumns: ["id"]
          },
        ]
      }
      processos: {
        Row: {
          analista_id: string | null
          area: string | null
          assunto: string | null
          classe_fase: string | null
          competencia: string | null
          created_at: string
          data_autuacao: string | null
          data_captacao: string
          data_distribuicao: string | null
          distribuido_em: string | null
          distribuido_por: string | null
          equipe_id: string | null
          foro: string | null
          id: string
          juiz: string | null
          jurisdicao: string | null
          motivo_descarte_id: string | null
          natureza: string
          natureza_credito: string | null
          numero_processo: string
          observacoes: string | null
          orgao_julgador: string | null
          parte_autora: string
          parte_re: string
          pessoa_id: string | null
          pipeline_status: string
          precificacao_data: string | null
          precificado_por: string | null
          status_processo: number
          tipo_pagamento: string
          transito_julgado: boolean
          triagem_data: string | null
          triagem_motivo_inaptidao: string | null
          triagem_observacoes: string | null
          triagem_por: string | null
          triagem_resultado: string | null
          tribunal: string
          updated_at: string
          valor_estimado: number | null
          valor_precificado: number | null
          vara_comarca: string | null
        }
        Insert: {
          analista_id?: string | null
          area?: string | null
          assunto?: string | null
          classe_fase?: string | null
          competencia?: string | null
          created_at?: string
          data_autuacao?: string | null
          data_captacao?: string
          data_distribuicao?: string | null
          distribuido_em?: string | null
          distribuido_por?: string | null
          equipe_id?: string | null
          foro?: string | null
          id?: string
          juiz?: string | null
          jurisdicao?: string | null
          motivo_descarte_id?: string | null
          natureza: string
          natureza_credito?: string | null
          numero_processo: string
          observacoes?: string | null
          orgao_julgador?: string | null
          parte_autora: string
          parte_re: string
          pessoa_id?: string | null
          pipeline_status?: string
          precificacao_data?: string | null
          precificado_por?: string | null
          status_processo?: number
          tipo_pagamento: string
          transito_julgado?: boolean
          triagem_data?: string | null
          triagem_motivo_inaptidao?: string | null
          triagem_observacoes?: string | null
          triagem_por?: string | null
          triagem_resultado?: string | null
          tribunal: string
          updated_at?: string
          valor_estimado?: number | null
          valor_precificado?: number | null
          vara_comarca?: string | null
        }
        Update: {
          analista_id?: string | null
          area?: string | null
          assunto?: string | null
          classe_fase?: string | null
          competencia?: string | null
          created_at?: string
          data_autuacao?: string | null
          data_captacao?: string
          data_distribuicao?: string | null
          distribuido_em?: string | null
          distribuido_por?: string | null
          equipe_id?: string | null
          foro?: string | null
          id?: string
          juiz?: string | null
          jurisdicao?: string | null
          motivo_descarte_id?: string | null
          natureza?: string
          natureza_credito?: string | null
          numero_processo?: string
          observacoes?: string | null
          orgao_julgador?: string | null
          parte_autora?: string
          parte_re?: string
          pessoa_id?: string | null
          pipeline_status?: string
          precificacao_data?: string | null
          precificado_por?: string | null
          status_processo?: number
          tipo_pagamento?: string
          transito_julgado?: boolean
          triagem_data?: string | null
          triagem_motivo_inaptidao?: string | null
          triagem_observacoes?: string | null
          triagem_por?: string | null
          triagem_resultado?: string | null
          tribunal?: string
          updated_at?: string
          valor_estimado?: number | null
          valor_precificado?: number | null
          vara_comarca?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processos_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_distribuido_por_fkey"
            columns: ["distribuido_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_motivo_descarte_id_fkey"
            columns: ["motivo_descarte_id"]
            isOneToOne: false
            referencedRelation: "motivos_descarte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_precificado_por_fkey"
            columns: ["precificado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_triagem_por_fkey"
            columns: ["triagem_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          id: string
          nome: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      regra_equipes: {
        Row: {
          created_at: string
          equipe_id: string
          id: string
          peso: number
          regra_id: string
        }
        Insert: {
          created_at?: string
          equipe_id: string
          id?: string
          peso?: number
          regra_id: string
        }
        Update: {
          created_at?: string
          equipe_id?: string
          id?: string
          peso?: number
          regra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "regra_equipes_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regra_equipes_regra_id_fkey"
            columns: ["regra_id"]
            isOneToOne: false
            referencedRelation: "regras_roteamento"
            referencedColumns: ["id"]
          },
        ]
      }
      regras_roteamento: {
        Row: {
          ativa: boolean
          created_at: string
          criterio_natureza: Json
          criterio_tipo_pagamento: Json
          criterio_tipo_servico: Json
          criterio_tribunal: Json
          criterio_valor_max: number | null
          criterio_valor_min: number | null
          entidade: string
          equipe_id: string
          id: string
          nome: string
          prioridade: number
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          criterio_natureza?: Json
          criterio_tipo_pagamento?: Json
          criterio_tipo_servico?: Json
          criterio_tribunal?: Json
          criterio_valor_max?: number | null
          criterio_valor_min?: number | null
          entidade?: string
          equipe_id: string
          id?: string
          nome: string
          prioridade?: number
        }
        Update: {
          ativa?: boolean
          created_at?: string
          criterio_natureza?: Json
          criterio_tipo_pagamento?: Json
          criterio_tipo_servico?: Json
          criterio_tribunal?: Json
          criterio_valor_max?: number | null
          criterio_valor_min?: number | null
          entidade?: string
          equipe_id?: string
          id?: string
          nome?: string
          prioridade?: number
        }
        Relationships: [
          {
            foreignKeyName: "regras_roteamento_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_atividade: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          entidade: string
          icone: string
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          entidade?: string
          icone?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          entidade?: string
          icone?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
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
      usuarios: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: string
          created_at: string
          email: string
          equipe_id: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string
          created_at?: string
          email: string
          equipe_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string
          created_at?: string
          email?: string
          equipe_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_usuario_id_for_auth: { Args: { _auth_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_participant: {
        Args: { _conversa_id: string; _user_id: string }
        Returns: boolean
      }
      sync_grupo_institucional: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "analista" | "usuario"
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
      app_role: ["admin", "analista", "usuario"],
    },
  },
} as const
