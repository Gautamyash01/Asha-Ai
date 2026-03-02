import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import TriagePage from "./pages/TriagePage";
import NLPPage from "./pages/NLPPage";
import OutbreakPage from "./pages/OutbreakPage";
import ResourcePage from "./pages/ResourcePage";
import PriorityPage from "./pages/PriorityPage";
import ExplainablePage from "./pages/ExplainablePage";
import DeteriorationPage from "./pages/DeteriorationPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/triage" element={<TriagePage />} />
            <Route path="/nlp" element={<NLPPage />} />
            <Route path="/outbreaks" element={<OutbreakPage />} />
            <Route path="/resources" element={<ResourcePage />} />
            <Route path="/priority" element={<PriorityPage />} />
            <Route path="/explainable" element={<ExplainablePage />} />
            <Route path="/deterioration" element={<DeteriorationPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
