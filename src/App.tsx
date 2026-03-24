import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardHome from "./pages/DashboardHome";
import FamiliesPage from "./pages/families/FamiliesPage";
import MembersPage from "./pages/members/MembersPage";
import MemberProfile from "./pages/MemberProfile";
import FamilyTreePage from "./pages/FamilyTreePage";
import MarriageMatchingPage from "./pages/MarriageMatchingPage";
import CommunityDirectory from "./pages/CommunityDirectory";
import ReportsPage from "./pages/ReportsPage";
import AdminPanel from "./pages/admin/AdminPanel";
import NotFound from "./pages/NotFound";

// Layouts
import { RoleBasedLayout } from "./components/RoleBasedLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dynamic Role-Based Routes */}
            {['super_admin', 'state_admin', 'district_admin', 'zone_admin', 'vidhansabha_admin', 'ward_volunteer'].map((role) => (
              <Route
                key={role}
                path={`/${role.replace('_', '-')}`}
                element={
                  <ProtectedRoute allowedRoles={[role]}>
                    <RoleBasedLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="families" element={<FamiliesPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="panel" element={<AdminPanel />} />
                <Route path="members/:id" element={<MemberProfile />} />
                <Route path="family-tree" element={<FamilyTreePage />} />
                <Route path="matching" element={<MarriageMatchingPage />} />
                <Route path="directory" element={<CommunityDirectory />} />
                <Route path="reports" element={<ReportsPage />} />
              </Route>
            ))}

            {/* Legacy Redirects or fallback */}
            <Route path="/admin" element={<Navigate to="/super-admin" replace />} />
            <Route path="/volunteer" element={<Navigate to="/ward-volunteer" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
