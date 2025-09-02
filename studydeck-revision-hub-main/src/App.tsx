import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DayPickerProvider } from "react-day-picker";

import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import AddNote from "./pages/AddNote";
import RevisionQueue from "./pages/RevisionQueue";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NoteDetail from "./pages/NoteDetail";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DayPickerProvider initialProps={{
        mode: 'single',
        selected: undefined,
        defaultMonth: new Date()
      }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {isAuthenticated && <Navbar />}
            <Routes>
              {!isAuthenticated ? (
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/revision-queue" element={<RevisionQueue />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notes/:id" element={<NoteDetail />} />
                  <Route path="/login" element={<Navigate to="/dashboard" />} />
                  <Route path="/signup" element={<Navigate to="/dashboard" />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DayPickerProvider>
    </QueryClientProvider>
  );
};

export default App;
