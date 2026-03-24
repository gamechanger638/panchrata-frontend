import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar, NavbarMenuItem } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, UserCheck, Shield, Menu, User as UserIcon, Heart, Search, FileText } from 'lucide-react';

export const RoleBasedLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getRoleConfig = () => {
    const role = user?.role || 'ward_volunteer';
    
    const baseItems: NavbarMenuItem[] = [
      { icon: LayoutDashboard, label: 'डैशबोर्ड (Dashboard)', path: `/${role.replace('_', '-')}` },
      { icon: Users, label: 'परिवार (Families)', path: `/${role.replace('_', '-')}/families` },
      { icon: UserCheck, label: 'सदस्य (Members)', path: `/${role.replace('_', '-')}/members` },
    ];

    const extraItems: NavbarMenuItem[] = [
        { icon: Heart, label: 'मैचमेकिंग (Matching)', path: `/${role.replace('_', '-')}/matching` },
        { icon: Search, label: 'निर्देशिका (Directory)', path: `/${role.replace('_', '-')}/directory` },
        { icon: FileText, label: 'रिपोर्ट्स (Reports)', path: `/${role.replace('_', '-')}/reports` },
    ];

    const adminItem: NavbarMenuItem = { icon: Shield, label: 'एडमिन पैनल (Admin Panel)', path: `/${role.replace('_', '-')}/panel` };

    let menuItems = [...baseItems, ...extraItems];
    
    // Everyone except ward_volunteer gets the Admin Panel for their level
    if (role !== 'ward_volunteer') {
        menuItems.splice(3, 0, adminItem); 
    }

    const portalNames: Record<string, string> = {
        'super_admin': 'सुपर एडमिन (Super Admin)',
        'state_admin': 'राज्य एडमिन (State Admin)',
        'district_admin': 'ज़िला एडमिन (District Admin)',
        'zone_admin': 'ज़ोन एडमिन (Zone Admin)',
        'vidhansabha_admin': 'विधानसभा एडमिन (Vidhansabha Admin)',
        'ward_volunteer': 'वार्ड स्वयंसेवक (Volunteer)',
    };

    return {
        menuItems,
        portalName: portalNames[role] || 'Panchratna Portal'
    };
  };

  const { menuItems, portalName } = getRoleConfig();

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar
        menuItems={menuItems}
        portalName={portalName}
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
            <h1 className="font-heading font-semibold text-lg hidden sm:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
                {portalName}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
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
