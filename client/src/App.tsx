import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AdminPage from "@/pages/AdminPage";
import EventPage from "@/pages/EventPage";
import EnvExportPage from "@/pages/EnvExportPage";
import NotFound from "@/pages/not-found";
import { usePageTracking } from "@/hooks/usePageTracking";

function Router() {
  usePageTracking();
  
  return (
    <Switch>
      <Route path="/" component={EventPage} />
      <Route path="/mentoria" component={Home} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/env-export" component={EnvExportPage} />
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
