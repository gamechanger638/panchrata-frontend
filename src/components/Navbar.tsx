import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, X, Hexagon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export interface NavbarMenuItem {
  icon: any;
  label: string;
  path: string;
  submenu?: { label: string; path: string; }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  menuItems: NavbarMenuItem[];
  portalName: string;
}

export function Navbar({ open, onClose, menuItems, portalName }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <motion.aside
      className={`fixed top-0 left-0 h-full w-64 z-50 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <Hexagon className="h-7 w-7 text-sidebar-primary" />
          <div>
            <h1 className="text-base font-heading font-bold text-sidebar-foreground">{portalName}</h1>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Soulmate Search</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
