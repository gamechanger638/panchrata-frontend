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
import { AdminLayout } from "./components/admin/AdminLayout";
import { VolunteerLayout } from "./components/volunteer/VolunteerLayout";

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

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
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

            {/* Volunteer Routes */}
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute allowedRoles={['state_admin', 'district_admin', 'zone_admin', 'vidhansabha_admin', 'ward_volunteer']}>
                  <VolunteerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="families" element={<FamiliesPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id" element={<MemberProfile />} />
              <Route path="family-tree" element={<FamilyTreePage />} />
              <Route path="matching" element={<MarriageMatchingPage />} />
              <Route path="directory" element={<CommunityDirectory />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
