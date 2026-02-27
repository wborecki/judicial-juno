export type ProcessStatus = 1 | 2 | 3 | 4;
export type TriageResult = "pendente" | "apto" | "descartado" | "reanálise";
export type NaturezaProcesso = "Cível" | "Trabalhista" | "Federal" | "Previdenciário" | "Tributário";
export type TipoPagamento = "RPV" | "Precatório";

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
  observacoes?: string;
}

export const STATUS_LABELS: Record<ProcessStatus, string> = {
  1: "Não Ajuizado",
  2: "Fase de Conhecimento",
  3: "Cumprimento de Sentença",
  4: "Ofício Requisitório",
};

export const TRIBUNAIS = [
  "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TRF6",
  "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJSC",
  "TJBA", "TJPE", "TJCE", "TJGO", "TJDF",
  "TRT1", "TRT2", "TRT3", "TRT4", "TRT5",
  "JEF",
];
