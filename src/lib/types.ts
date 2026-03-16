export type ProcessStatus = 1 | 2 | 3 | 4;
export type TriageResult = "pendente" | "apto" | "descartado" | "reanálise";
export type NaturezaProcesso = "Cível" | "Trabalhista" | "Federal" | "Previdenciário" | "Tributário";
export type TipoPagamento = "RPV" | "Precatório";

export type PipelineStatus =
  | "captado"
  | "triagem"
  | "distribuido"
  | "em_analise"
  | "precificado"
  | "comercial";

export type TipoServico =
  | "compra_credito"
  | "compensacao_tributaria"
  | "honorarios"
  | "cessao_direitos";

export type NegocioStatus = "em_andamento" | "ganho" | "perdido";

export interface ProcessoLead {
  id: string;
  numeroProcesso: string;
  tribunal: string;
  natureza: NaturezaProcesso;
  tipoPagamento: TipoPagamento;
  status: ProcessStatus;
  transitoJulgado: boolean;
  parteAutora: string;
  parteRe: string;
  valorEstimado?: number;
  dataDistribuicao: string;
  dataCaptacao: string;
  triagem: TriageResult;
  pipelineStatus: PipelineStatus;
  observacoes?: string;
  pessoaId?: string;
  equipeId?: string;
  analistaId?: string;
}

export interface Pessoa {
  id: string;
  nome: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  tipo: "credor" | "devedor" | "cedente" | "cessionario" | "advogado" | "terceiro";
  dataCadastro: string;
}

export interface Equipe {
  id: string;
  nome: string;
  tipo: "analise_rpv" | "analise_precatorio" | "financeiro" | "comercial" | "juridico";
  membros: string[];
  ativa: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  equipeId?: string;
  cargo: string;
  avatar?: string;
  ativo: boolean;
}

export interface Negocio {
  id: string;
  processoId: string;
  pessoaId: string;
  tipoServico: TipoServico;
  status: NegocioStatus;
  valorProposta?: number;
  valorFechamento?: number;
  dataAbertura: string;
  dataFechamento?: string;
  observacoes?: string;
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

export const PIPELINE_LABELS: Record<PipelineStatus, string> = {
  captado: "Captado",
  triagem: "Em Triagem",
  distribuido: "Distribuído",
  em_analise: "Em Análise",
  precificado: "Precificado",
  comercial: "Comercial",
};

export const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  compra_credito: "Compra de Crédito Judicial",
  compensacao_tributaria: "Compensação Tributária",
  honorarios: "Honorários",
  cessao_direitos: "Cessão de Direitos",
};

export const EQUIPE_TIPO_LABELS: Record<Equipe["tipo"], string> = {
  analise_rpv: "Análise RPV",
  analise_precatorio: "Análise Precatório",
  financeiro: "Financeiro",
  comercial: "Comercial",
  juridico: "Jurídico",
};

export const TRIBUNAIS = [
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJSC",
  "TJBA", "TJPE", "TJCE", "TJGO", "TJDF",
  "TRT1", "TRT2", "TRT3", "TRT4", "TRT5",
  "JEF",
];
