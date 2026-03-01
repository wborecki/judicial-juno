import { ProcessoLead, Pessoa, Equipe, Usuario, Negocio } from "./types";

export const mockPessoas: Pessoa[] = [
  { id: "p1", nome: "Maria Silva Santos", cpfCnpj: "123.456.789-00", email: "maria@email.com", telefone: "(11) 99999-1234", cidade: "São Paulo", uf: "SP", tipo: "autor", dataCadastro: "2026-01-15" },
  { id: "p2", nome: "João Pedro Oliveira", cpfCnpj: "234.567.890-11", email: "joao@email.com", telefone: "(21) 98888-5678", cidade: "Rio de Janeiro", uf: "RJ", tipo: "autor", dataCadastro: "2026-01-20" },
  { id: "p3", nome: "Ana Carolina Lima", cpfCnpj: "345.678.901-22", email: "ana@email.com", telefone: "(31) 97777-9012", cidade: "Belo Horizonte", uf: "MG", tipo: "autor", dataCadastro: "2026-02-01" },
  { id: "p4", nome: "Carlos Eduardo Ferreira", cpfCnpj: "456.789.012-33", email: "carlos@email.com", telefone: "(61) 96666-3456", cidade: "Brasília", uf: "DF", tipo: "autor", dataCadastro: "2026-02-05" },
  { id: "p5", nome: "Fernanda Souza Costa", cpfCnpj: "567.890.123-44", email: "fernanda@email.com", telefone: "(21) 95555-7890", cidade: "Rio de Janeiro", uf: "RJ", tipo: "autor", dataCadastro: "2026-02-10" },
  { id: "p6", nome: "Roberto Alves Mendes", cpfCnpj: "678.901.234-55", email: "roberto@email.com", telefone: "(51) 94444-1234", cidade: "Porto Alegre", uf: "RS", tipo: "autor", dataCadastro: "2026-02-12" },
  { id: "p7", nome: "Luciana Martins", cpfCnpj: "789.012.345-66", telefone: "(21) 93333-5678", cidade: "Niterói", uf: "RJ", tipo: "autor", dataCadastro: "2026-02-15" },
  { id: "p8", nome: "Pedro Henrique Dias", cpfCnpj: "890.123.456-77", email: "pedro@email.com", telefone: "(31) 92222-9012", cidade: "Belo Horizonte", uf: "MG", tipo: "autor", dataCadastro: "2026-02-18" },
  { id: "p9", nome: "Empresa ABC Ltda", cpfCnpj: "12.345.678/0001-99", email: "contato@abc.com.br", telefone: "(81) 91111-3456", cidade: "Recife", uf: "PE", tipo: "autor", dataCadastro: "2026-02-20" },
  { id: "p10", nome: "Mariana Rocha", cpfCnpj: "901.234.567-88", email: "mariana@email.com", telefone: "(51) 90000-7890", cidade: "Porto Alegre", uf: "RS", tipo: "autor", dataCadastro: "2026-02-22" },
];

export const mockEquipes: Equipe[] = [
  { id: "eq1", nome: "Análise RPV", tipo: "analise_rpv", membros: ["u2", "u3"], ativa: true },
  { id: "eq2", nome: "Análise Precatório", tipo: "analise_precatorio", membros: ["u4", "u5"], ativa: true },
  { id: "eq3", nome: "Financeiro", tipo: "financeiro", membros: ["u6"], ativa: true },
  { id: "eq4", nome: "Comercial", tipo: "comercial", membros: ["u7", "u8"], ativa: true },
  { id: "eq5", nome: "Jurídico", tipo: "juridico", membros: ["u9"], ativa: true },
];

export const mockUsuarios: Usuario[] = [
  { id: "u1", nome: "Admin", email: "admin@megatec.com", cargo: "Administrador", ativo: true },
  { id: "u2", nome: "Lucas Pereira", email: "lucas@megatec.com", equipeId: "eq1", cargo: "Analista RPV", ativo: true },
  { id: "u3", nome: "Camila Rodrigues", email: "camila@megatec.com", equipeId: "eq1", cargo: "Analista RPV", ativo: true },
  { id: "u4", nome: "Rafael Souza", email: "rafael@megatec.com", equipeId: "eq2", cargo: "Analista Precatório", ativo: true },
  { id: "u5", nome: "Juliana Costa", email: "juliana@megatec.com", equipeId: "eq2", cargo: "Analista Precatório", ativo: true },
  { id: "u6", nome: "Marcos Oliveira", email: "marcos@megatec.com", equipeId: "eq3", cargo: "Analista Financeiro", ativo: true },
  { id: "u7", nome: "Patrícia Lima", email: "patricia@megatec.com", equipeId: "eq4", cargo: "Comercial", ativo: true },
  { id: "u8", nome: "Bruno Santos", email: "bruno@megatec.com", equipeId: "eq4", cargo: "Comercial", ativo: true },
  { id: "u9", nome: "Adriana Ferreira", email: "adriana@megatec.com", equipeId: "eq5", cargo: "Jurídico", ativo: true },
];

export const mockNegocios: Negocio[] = [
  { id: "n1", processoId: "4", pessoaId: "p4", tipoServico: "compra_credito", status: "em_andamento", valorProposta: 38500, dataAbertura: "2026-02-26" },
  { id: "n2", processoId: "9", pessoaId: "p9", tipoServico: "compensacao_tributaria", status: "ganho", valorProposta: 180000, valorFechamento: 175000, dataAbertura: "2026-02-20", dataFechamento: "2026-02-26" },
];

export const mockProcessos: ProcessoLead[] = [
  { id: "1", numeroProcesso: "0001234-56.2024.8.26.0100", tribunal: "TJSP", natureza: "Cível", tipoPagamento: "Precatório", status: 3, transitoJulgado: true, parteAutora: "Maria Silva Santos", parteRe: "INSS", valorEstimado: 85000, dataDistribuicao: "2024-03-15", dataCaptacao: "2026-02-27", triagem: "pendente", pipelineStatus: "triagem", pessoaId: "p1" },
  { id: "2", numeroProcesso: "0005678-90.2023.5.02.0001", tribunal: "TRT2", natureza: "Trabalhista", tipoPagamento: "RPV", status: 4, transitoJulgado: true, parteAutora: "João Pedro Oliveira", parteRe: "União Federal", valorEstimado: 42000, dataDistribuicao: "2023-07-20", dataCaptacao: "2026-02-27", triagem: "pendente", pipelineStatus: "triagem", pessoaId: "p2" },
  { id: "3", numeroProcesso: "0009012-34.2022.4.01.3400", tribunal: "TRF1", natureza: "Previdenciário", tipoPagamento: "RPV", status: 3, transitoJulgado: false, parteAutora: "Ana Carolina Lima", parteRe: "INSS", valorEstimado: 28000, dataDistribuicao: "2022-11-08", dataCaptacao: "2026-02-26", triagem: "pendente", pipelineStatus: "triagem", pessoaId: "p3" },
  { id: "4", numeroProcesso: "0003456-78.2024.4.03.6100", tribunal: "JEF", natureza: "Federal", tipoPagamento: "RPV", status: 4, transitoJulgado: true, parteAutora: "Carlos Eduardo Ferreira", parteRe: "União Federal", valorEstimado: 55000, dataDistribuicao: "2024-01-12", dataCaptacao: "2026-02-26", triagem: "apto", pipelineStatus: "comercial", pessoaId: "p4", equipeId: "eq1", analistaId: "u2" },
  { id: "5", numeroProcesso: "0007890-12.2023.8.19.0001", tribunal: "TJRJ", natureza: "Cível", tipoPagamento: "Precatório", status: 2, transitoJulgado: false, parteAutora: "Fernanda Souza Costa", parteRe: "Estado do RJ", valorEstimado: 120000, dataDistribuicao: "2023-05-30", dataCaptacao: "2026-02-25", triagem: "descartado", pipelineStatus: "triagem", pessoaId: "p5" },
  { id: "6", numeroProcesso: "0002345-67.2024.5.04.0001", tribunal: "TRT4", natureza: "Trabalhista", tipoPagamento: "Precatório", status: 3, transitoJulgado: true, parteAutora: "Roberto Alves Mendes", parteRe: "Banco do Brasil", valorEstimado: 95000, dataDistribuicao: "2024-06-22", dataCaptacao: "2026-02-27", triagem: "pendente", pipelineStatus: "triagem", pessoaId: "p6" },
  { id: "7", numeroProcesso: "0006789-01.2023.4.02.5101", tribunal: "TRF2", natureza: "Previdenciário", tipoPagamento: "RPV", status: 1, transitoJulgado: false, parteAutora: "Luciana Martins", parteRe: "INSS", valorEstimado: 18000, dataDistribuicao: "2023-09-14", dataCaptacao: "2026-02-24", triagem: "descartado", pipelineStatus: "triagem", pessoaId: "p7" },
  { id: "8", numeroProcesso: "0004567-89.2024.8.13.0024", tribunal: "TJMG", natureza: "Cível", tipoPagamento: "Precatório", status: 3, transitoJulgado: true, parteAutora: "Pedro Henrique Dias", parteRe: "Estado de MG", valorEstimado: 67000, dataDistribuicao: "2024-02-28", dataCaptacao: "2026-02-27", triagem: "pendente", pipelineStatus: "triagem", pessoaId: "p8" },
  { id: "9", numeroProcesso: "0008901-23.2022.4.05.8300", tribunal: "TRF5", natureza: "Tributário", tipoPagamento: "Precatório", status: 4, transitoJulgado: true, parteAutora: "Empresa ABC Ltda", parteRe: "Fazenda Nacional", valorEstimado: 230000, dataDistribuicao: "2022-08-05", dataCaptacao: "2026-02-26", triagem: "apto", pipelineStatus: "comercial", pessoaId: "p9", equipeId: "eq2", analistaId: "u4" },
  { id: "10", numeroProcesso: "0001122-33.2024.8.21.0001", tribunal: "TJRS", natureza: "Previdenciário", tipoPagamento: "RPV", status: 3, transitoJulgado: false, parteAutora: "Mariana Rocha", parteRe: "INSS", valorEstimado: 32000, dataDistribuicao: "2024-04-10", dataCaptacao: "2026-02-27", triagem: "reanálise", pipelineStatus: "triagem", pessoaId: "p10" },
];
