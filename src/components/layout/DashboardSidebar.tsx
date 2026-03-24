import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, UserCheck, GitBranch, Heart,
  BookOpen, BarChart3, Shield, Settings, LogOut, X, Hexagon
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Families", path: "/dashboard/families" },
  { icon: UserCheck, label: "Members", path: "/dashboard/members" },
  { icon: GitBranch, label: "Family Tree", path: "/dashboard/family-tree" },
  { icon: Heart, label: "Marriage Matching", path: "/dashboard/matching" },
  { icon: BookOpen, label: "Community Directory", path: "/dashboard/directory" },
  { icon: BarChart3, label: "Reports & Analytics", path: "/dashboard/reports" },
  { icon: Shield, label: "Admin Panel", path: "/dashboard/admin" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

interface Props { open: boolean; onClose: () => void; }

import { useAuth } from "../../context/AuthContext";

export function DashboardSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const filteredMenuItems = menuItems.filter(item => {
    if (item.path === "/dashboard/admin" && user?.role !== "super_admin") return false;
    if (item.path === "/dashboard/reports" && !['super_admin', 'state_admin', 'district_admin'].includes(user?.role || '')) return false;
    return true;
  });

  return (
    <motion.aside
      className={`fixed top-0 left-0 h-full w-64 z-50 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Hexagon className="h-7 w-7 text-sidebar-primary" />
          <div>
            <h1 className="text-base font-heading font-bold text-sidebar-foreground">Panchratna</h1>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Vishwakarma Census</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
