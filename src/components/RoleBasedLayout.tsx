import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar, NavbarMenuItem } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, UserCheck, Shield, Menu, User as UserIcon, Heart, Search, FileText, Zap } from 'lucide-react';
import { PaymentDialog } from './PaymentDialog';

export const RoleBasedLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
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
    <div className="flex bg-background h-screen overflow-hidden">
      <Navbar
        menuItems={menuItems}
        portalName={portalName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300 h-screen overflow-hidden">
        <header className="h-16 flex-none border-b border-border/40 glass-card flex items-center justify-between px-3 md:px-6 sticky top-0 z-30 bg-background/80 backdrop-blur-md">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-semibold text-base md:text-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-[400px]">
                {portalName}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
                variant="outline" 
                size="icon"
                className="md:w-auto md:px-3 md:py-2 gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold md:flex shrink-0"
                onClick={() => setPaymentOpen(true)}
                title="Support Maintenance"
            >
                <Zap className="h-4 w-4 fill-primary" /> 
                <span className="hidden md:inline">मेंटेनेंस सपोर्ट (Support)</span>
            </Button>
            <div className="flex items-center gap-2 md:gap-4 ml-1 md:ml-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
        <PaymentDialog isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
      </div>
    </div>
  );
};
