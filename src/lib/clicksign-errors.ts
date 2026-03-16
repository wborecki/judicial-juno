/**
 * Parses ClickSign API errors into user-friendly Portuguese messages.
 */
export function parseClickSignError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  // Token/auth issues
  if (
    msg.includes("401") ||
    msg.includes("unauthorized") ||
    msg.includes("Access Token inválido") ||
    msg.includes("CLICKSIGN_ACCESS_TOKEN not configured")
  ) {
    return "A integração com ClickSign não está configurada ou o token de acesso é inválido. Verifique em Configurações → Integrações.";
  }

  // Forbidden
  if (msg.includes("403") || msg.includes("forbidden")) {
    return "Sem permissão para acessar este recurso no ClickSign. Verifique as permissões do token.";
  }

  // Not found
  if (msg.includes("404") || msg.includes("not found")) {
    return "Recurso não encontrado no ClickSign. Verifique se o envelope ou template ainda existe.";
  }

  // Rate limit
  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many")) {
    return "Muitas requisições ao ClickSign. Aguarde alguns segundos e tente novamente.";
  }

  // Network / timeout
  if (msg.includes("fetch") || msg.includes("network") || msg.includes("timeout") || msg.includes("ECONNREFUSED")) {
    return "Não foi possível conectar ao ClickSign. Verifique sua conexão e tente novamente.";
  }

  // Validation errors from ClickSign
  if (msg.includes("422") || msg.includes("unprocessable")) {
    return "Dados inválidos enviados ao ClickSign. Verifique os campos e tente novamente.";
  }

  // Server error
  if (msg.includes("500") || msg.includes("internal server")) {
    return "Erro interno no serviço do ClickSign. Tente novamente em alguns minutos.";
  }

  // Edge function generic
  if (msg.includes("Edge function") || msg.includes("non-2xx")) {
    return "Erro ao comunicar com o serviço de assinaturas. Verifique se a integração ClickSign está configurada corretamente.";
  }

  // Fallback: return cleaned message
  return msg || "Erro desconhecido ao comunicar com ClickSign.";
}
