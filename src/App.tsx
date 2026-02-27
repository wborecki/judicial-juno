import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Triagem from "./pages/Triagem";
import Captacao from "./pages/Captacao";
import Distribuicao from "./pages/Distribuicao";
import Analise from "./pages/Analise";
import Precificacao from "./pages/Precificacao";
import Comercial from "./pages/Comercial";
import Negocios from "./pages/Negocios";
import Pessoas from "./pages/Pessoas";
import Equipes from "./pages/Equipes";
import UsuariosPage from "./pages/Usuarios";
import Chat from "./pages/Chat";
import Configuracoes from "./pages/Configuracoes";
import ProcessoDetalhe from "./pages/ProcessoDetalhe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/triagem" element={<Triagem />} />
            <Route path="/captacao" element={<Captacao />} />
            <Route path="/distribuicao" element={<Distribuicao />} />
            <Route path="/analise" element={<Analise />} />
            <Route path="/precificacao" element={<Precificacao />} />
            <Route path="/comercial" element={<Comercial />} />
            <Route path="/negocios" element={<Negocios />} />
            <Route path="/pessoas" element={<Pessoas />} />
            <Route path="/equipes" element={<Equipes />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/processos/:id" element={<ProcessoDetalhe />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
