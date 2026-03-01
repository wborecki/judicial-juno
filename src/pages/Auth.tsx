import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MegaTecLogo } from "@/components/MegaTecLogo";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

type AuthView = "login" | "signup" | "forgot";

export default function Auth() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Por favor, confirme seu email antes de fazer login.");
      } else {
        toast.error("Email ou senha incorretos.");
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: nome },
      },
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar o cadastro.");
      setView("login");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setView("login");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Erro ao entrar com Google.");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-between p-12">
        <div>
          <MegaTecLogo size="lg" />
          <p className="text-sidebar-foreground/50 text-xs mt-2">Gestão de Ativos Judiciais</p>
        </div>

        <div className="space-y-8">
          <h2 className="text-3xl font-display font-bold leading-tight">
            Gerencie seus processos judiciais com{" "}
            <span className="text-sidebar-primary">inteligência</span> e{" "}
            <span className="text-sidebar-primary">eficiência</span>.
          </h2>
          <p className="text-sidebar-foreground/60 text-sm leading-relaxed max-w-md">
            Plataforma completa para captação, triagem, análise, precificação e comercialização de ativos judiciais. 
            Automatize seu pipeline e tome decisões com dados.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { value: "Pipeline", label: "Completo" },
              { value: "Triagem", label: "Inteligente" },
              { value: "Equipes", label: "Integradas" },
              { value: "Dados", label: "Em tempo real" },
            ].map((item) => (
              <div key={item.label} className="bg-sidebar-accent/50 rounded-lg p-3">
                <p className="text-sidebar-primary font-display font-bold text-sm">{item.value}</p>
                <p className="text-sidebar-foreground/50 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sidebar-foreground/30 text-xs">
          © 2026 MegaTec. Todos os direitos reservados.
        </p>
      </div>

      {/* Right side - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <MegaTecLogo size="md" />
          </div>

          {view === "login" && (
            <>
              <div>
                <h1 className="text-2xl font-display font-bold">Entrar na plataforma</h1>
                <p className="text-sm text-muted-foreground mt-1">Acesse sua conta para continuar</p>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 gap-2"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar com Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou com email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <button onClick={() => setView("signup")} className="text-primary font-medium hover:underline">
                  Criar conta
                </button>
              </p>
            </>
          )}

          {view === "signup" && (
            <>
              <div>
                <h1 className="text-2xl font-display font-bold">Criar sua conta</h1>
                <p className="text-sm text-muted-foreground mt-1">Preencha os dados para começar</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                  Entrar
                </button>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <div>
                <h1 className="text-2xl font-display font-bold">Recuperar senha</h1>
                <p className="text-sm text-muted-foreground mt-1">Enviaremos um link de redefinição para seu email</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar link de recuperação"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Lembrou a senha?{" "}
                <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                  Voltar ao login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
