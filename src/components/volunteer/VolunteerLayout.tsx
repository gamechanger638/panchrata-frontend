import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar, NavbarMenuItem } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, UserCheck, Menu, User as UserIcon } from 'lucide-react';

const menuItems: NavbarMenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/volunteer' },
  { icon: Users, label: 'Families', path: '/volunteer/families' },
  { icon: UserCheck, label: 'Members', path: '/volunteer/members' },
];

export const VolunteerLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar
        menuItems={menuItems}
        portalName="Volunteer Portal"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <header className="h-16 border-b border-border/40 glass-card flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-semibold text-lg hidden sm:block">Volunteer Workspace</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name || 'Volunteer'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.role?.replace('_', ' ')?.toUpperCase()}</p>
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
