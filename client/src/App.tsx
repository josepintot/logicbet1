import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PlatformsPage from "@/pages/Platforms";
import PlatformEditPage from "@/pages/PlatformEdit";
import Players from "./pages/Players";
import BuscarJugador from "./pages/players/BuscarJugador";
import MasApostadores from "./pages/players/MasApostadores";
import MasGanadores from "./pages/players/MasGanadores";
import JugadoresActivos from "./pages/players/JugadoresActivos";
import ApuestasPage from "./pages/Apuestas";
import EncuentrosPage from "./pages/Encuentros";
import ReporteGeneral from "./pages/reportes/ReporteGeneral";
import ReportesPorJugador from "./pages/reportes/ReportesPorJugador";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/plataformas/editar" component={PlatformEditPage} />
      <Route path="/plataformas" component={PlatformsPage} />
      <Route path="/players" component={Players} />
      <Route path="/players/buscar-jugador" component={BuscarJugador} />
      <Route path="/players/mas-apostadores" component={MasApostadores} />
      <Route path="/players/mas-ganadores" component={MasGanadores} />
      <Route path="/players/jugadores-activos" component={JugadoresActivos} />
      <Route path="/apuestas" component={ApuestasPage} />
      <Route path="/encuentros" component={EncuentrosPage} />
      <Route path="/reportes/general" component={ReporteGeneral} />
      <Route path="/reportes/por-jugador" component={ReportesPorJugador} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
