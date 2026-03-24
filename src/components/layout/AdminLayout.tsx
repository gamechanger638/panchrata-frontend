import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <DashboardSidebar />
      </div>
      {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/40 glass-card flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg hidden sm:block">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.role?.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <UserIcon className="h-4 w-4" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
