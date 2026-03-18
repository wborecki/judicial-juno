/**
 * Formula Engine — Safe recursive descent parser for calculated fields.
 * No eval() or new Function(). Only numeric operations and whitelisted functions.
 */

// ─── Types ───────────────────────────────────────────────────────────

type ASTNode =
  | { type: "number"; value: number }
  | { type: "ref"; name: string }
  | { type: "binop"; op: string; left: ASTNode; right: ASTNode }
  | { type: "unary"; op: string; operand: ASTNode }
  | { type: "call"; fn: string; args: ASTNode[] };

type Token =
  | { type: "number"; value: number }
  | { type: "ref"; name: string }
  | { type: "op"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" }
  | { type: "ident"; value: string };

// ─── Tokenizer ───────────────────────────────────────────────────────

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Reference: {field name}
    if (ch === "{") {
      const end = expr.indexOf("}", i + 1);
      if (end === -1) throw new Error("Referência não fechada: falta '}'");
      tokens.push({ type: "ref", name: expr.slice(i + 1, end).trim() });
      i = end + 1;
      continue;
    }

    // Number literal
    if (/[0-9]/.test(ch) || (ch === "." && i + 1 < expr.length && /[0-9]/.test(expr[i + 1]))) {
      let num = "";
      while (i < expr.length && (/[0-9]/.test(expr[i]) || expr[i] === ".")) {
        num += expr[i++];
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    // Multi-char operators
    if (ch === ">" || ch === "<" || ch === "=" || ch === "!") {
      if (i + 1 < expr.length && expr[i + 1] === "=") {
        tokens.push({ type: "op", value: ch + "=" });
        i += 2;
        continue;
      }
      if (ch === "=" && i + 1 < expr.length && expr[i + 1] === "=") {
        tokens.push({ type: "op", value: "==" });
        i += 2;
        continue;
      }
      if (ch === ">" || ch === "<") {
        tokens.push({ type: "op", value: ch });
        i++;
        continue;
      }
    }

    // Single-char operators
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    // Parens
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }

    // Comma
    if (ch === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }

    // Identifier (function names)
    if (/[A-Za-z_]/.test(ch)) {
      let id = "";
      while (i < expr.length && /[A-Za-z_0-9]/.test(expr[i])) {
        id += expr[i++];
      }
      tokens.push({ type: "ident", value: id.toUpperCase() });
      continue;
    }

    throw new Error(`Caractere inesperado: '${ch}'`);
  }
  return tokens;
}

// ─── Parser (recursive descent) ──────────────────────────────────────

const ALLOWED_FUNCTIONS = new Set(["ROUND", "IF", "MIN", "MAX", "ABS", "PERCENT"]);

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: string, value?: string): Token {
    const t = this.consume();
    if (!t || t.type !== type || (value !== undefined && (t as any).value !== value)) {
      throw new Error(`Esperado ${type}${value ? ` '${value}'` : ""}, encontrado ${t ? `${t.type} '${(t as any).value}'` : "fim"}`);
    }
    return t;
  }

  parse(): ASTNode {
    const node = this.parseComparison();
    if (this.pos < this.tokens.length) {
      throw new Error(`Token inesperado: '${JSON.stringify(this.peek())}'`);
    }
    return node;
  }

  private parseComparison(): ASTNode {
    let left = this.parseAddSub();
    while (this.peek()?.type === "op" && [">", "<", ">=", "<=", "==", "!="].includes((this.peek() as any).value)) {
      const op = (this.consume() as any).value;
      const right = this.parseAddSub();
      left = { type: "binop", op, left, right };
    }
    return left;
  }

  private parseAddSub(): ASTNode {
    let left = this.parseMulDiv();
    while (this.peek()?.type === "op" && (this.peek() as any).value === "+" || this.peek()?.type === "op" && (this.peek() as any).value === "-") {
      const op = (this.consume() as any).value;
      const right = this.parseMulDiv();
      left = { type: "binop", op, left, right };
    }
    return left;
  }

  private parseMulDiv(): ASTNode {
    let left = this.parseUnary();
    while (this.peek()?.type === "op" && ((this.peek() as any).value === "*" || (this.peek() as any).value === "/")) {
      const op = (this.consume() as any).value;
      const right = this.parseUnary();
      left = { type: "binop", op, left, right };
    }
    return left;
  }

  private parseUnary(): ASTNode {
    if (this.peek()?.type === "op" && (this.peek() as any).value === "-") {
      this.consume();
      const operand = this.parsePrimary();
      return { type: "unary", op: "-", operand };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ASTNode {
    const t = this.peek();
    if (!t) throw new Error("Expressão incompleta");

    // Number
    if (t.type === "number") {
      this.consume();
      return { type: "number", value: t.value };
    }

    // Reference
    if (t.type === "ref") {
      this.consume();
      return { type: "ref", name: t.name };
    }

    // Function call
    if (t.type === "ident") {
      const fn = t.value;
      if (!ALLOWED_FUNCTIONS.has(fn)) {
        throw new Error(`Função não suportada: '${fn}'. Use: ${Array.from(ALLOWED_FUNCTIONS).join(", ")}`);
      }
      this.consume();
      this.expect("paren", "(");
      const args: ASTNode[] = [];
      if (!(this.peek()?.type === "paren" && (this.peek() as any).value === ")")) {
        args.push(this.parseComparison());
        while (this.peek()?.type === "comma") {
          this.consume();
          args.push(this.parseComparison());
        }
      }
      this.expect("paren", ")");
      return { type: "call", fn, args };
    }

    // Parenthesized expression
    if (t.type === "paren" && t.value === "(") {
      this.consume();
      const node = this.parseComparison();
      this.expect("paren", ")");
      return node;
    }

    throw new Error(`Token inesperado: '${JSON.stringify(t)}'`);
  }
}

// ─── Evaluator ───────────────────────────────────────────────────────

function evalAST(node: ASTNode, vars: Map<string, number>): number {
  switch (node.type) {
    case "number":
      return node.value;

    case "ref": {
      const v = vars.get(node.name);
      if (v === undefined || v === null || isNaN(v)) return 0;
      return v;
    }

    case "unary":
      return -evalAST(node.operand, vars);

    case "binop": {
      const l = evalAST(node.left, vars);
      const r = evalAST(node.right, vars);
      switch (node.op) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/": return r === 0 ? 0 : l / r;
        case ">": return l > r ? 1 : 0;
        case "<": return l < r ? 1 : 0;
        case ">=": return l >= r ? 1 : 0;
        case "<=": return l <= r ? 1 : 0;
        case "==": return l === r ? 1 : 0;
        case "!=": return l !== r ? 1 : 0;
        default: throw new Error(`Operador desconhecido: ${node.op}`);
      }
    }

    case "call": {
      const args = node.args.map(a => evalAST(a, vars));
      switch (node.fn) {
        case "ROUND": return Number((args[0] ?? 0).toFixed(args[1] ?? 0));
        case "IF": return args[0] ? (args[1] ?? 0) : (args[2] ?? 0);
        case "MIN": return Math.min(...args);
        case "MAX": return Math.max(...args);
        case "ABS": return Math.abs(args[0] ?? 0);
        case "PERCENT": return (args[1] ?? 0) === 0 ? 0 : ((args[0] ?? 0) / args[1]) * 100;
        default: throw new Error(`Função desconhecida: ${node.fn}`);
      }
    }
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export function parseFormula(expr: string): ASTNode {
  const tokens = tokenize(expr);
  if (tokens.length === 0) throw new Error("Fórmula vazia");
  return new Parser(tokens).parse();
}

export function evaluateFormula(expr: string, vars: Map<string, number>): number {
  const ast = parseFormula(expr);
  return evalAST(ast, vars);
}

/**
 * Validates a formula expression. Returns null if valid, error message if invalid.
 */
export function validateFormula(expr: string): string | null {
  try {
    parseFormula(expr);
    return null;
  } catch (e: any) {
    return e.message || "Fórmula inválida";
  }
}

/**
 * Extracts all field references from a formula expression.
 */
export function extractDependencies(expr: string): string[] {
  const deps: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    deps.push(match[1].trim());
  }
  return deps;
}

/**
 * Detects circular dependencies among formula fields.
 * Returns the names of fields involved in cycles, or empty array if no cycles.
 */
export function detectCycles(
  campos: Array<{ nome: string; tipo: string; formula?: string | null }>
): string[] {
  const formulaCampos = campos.filter(c => c.tipo === "formula" && c.formula);
  const depMap = new Map<string, string[]>();
  formulaCampos.forEach(c => {
    depMap.set(c.nome, extractDependencies(c.formula!));
  });

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const cyclic: string[] = [];

  function dfs(name: string): boolean {
    if (inStack.has(name)) return true;
    if (visited.has(name)) return false;
    visited.add(name);
    inStack.add(name);
    for (const dep of depMap.get(name) ?? []) {
      if (dfs(dep)) {
        cyclic.push(name);
        return true;
      }
    }
    inStack.delete(name);
    return false;
  }

  for (const name of depMap.keys()) {
    dfs(name);
  }

  return cyclic;
}

/**
 * Formats a formula result based on the specified format.
 */
export function formatFormulaResult(value: number, formato: string): string {
  if (!isFinite(value)) return "—";
  switch (formato) {
    case "moeda":
      return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    case "percentual":
      return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
    case "numero":
    default:
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  }
}

// Fixed field names mapped to processo columns
export const FIXED_FIELD_MAP: Record<string, string> = {
  "Valor da Causa": "valor_estimado",
  "Valor Estimado": "valor_estimado",
  "Valor Precificado": "valor_precificado",
};
