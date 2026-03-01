import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import ConfiguracoesLayout from "@/components/ConfiguracoesLayout";
import Dashboard from "./pages/Dashboard";
import Processos from "./pages/Processos";
import Triagem from "./pages/Triagem";
import Distribuicao from "./pages/Distribuicao";
import Analise from "./pages/Analise";
import Precificacao from "./pages/Precificacao";
import Comercial from "./pages/Comercial";
import Negocios from "./pages/Negocios";
import NegocioDetalhe from "./pages/NegocioDetalhe";
import Pessoas from "./pages/Pessoas";
import Equipes from "./pages/Equipes";
import UsuariosPage from "./pages/Usuarios";
import Chat from "./pages/Chat";
import ConfiguracoesGeral from "./pages/ConfiguracoesGeral";
import CamposAnalise from "./pages/CamposAnalise";
import ConfigPipelines from "./pages/ConfigPipelines";
import Notificacoes from "./pages/Notificacoes";
import Integracoes from "./pages/Integracoes";
import ProcessoDetalhe from "./pages/ProcessoDetalhe";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/processos/:id" element={<ProcessoDetalhe />} />
              <Route path="/triagem" element={<Triagem />} />
              <Route path="/distribuicao" element={<Distribuicao />} />
              <Route path="/analise" element={<Analise />} />
              <Route path="/precificacao" element={<Precificacao />} />
              <Route path="/comercial" element={<Comercial />} />
              <Route path="/negocios" element={<Negocios />} />
              <Route path="/negocios/:id" element={<NegocioDetalhe />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/configuracoes" element={<ConfiguracoesLayout />}>
                <Route index element={<ConfiguracoesGeral />} />
                <Route path="pessoas" element={<Pessoas />} />
                <Route path="equipes" element={<Equipes />} />
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="campos-analise" element={<CamposAnalise />} />
                <Route path="pipelines" element={<ConfigPipelines />} />
                <Route path="notificacoes" element={<Notificacoes />} />
                <Route path="integracoes" element={<Integracoes />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
