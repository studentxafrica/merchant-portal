
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginForm } from "./components/LoginForm";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./state";
import ResetPassword from "./components/ResetPassword";
import ConfirmPasswordReset from "./components/ConfirmPasswordReset";

const queryClient = new QueryClient();

const App: React.FC = () => {
  // const navigate = useNavigate();
  

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth/user/confirm-reset-password" element={<ConfirmPasswordReset />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/*" element={<Index />} />
            <Route path="/404" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
