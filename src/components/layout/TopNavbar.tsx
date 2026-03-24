import { useState } from "react";
import { Menu, Bell, ChevronDown, Sun, Moon } from "lucide-react";
import { currentUser } from "@/data/dummyData";
import { Button } from "@/components/ui/button";

interface Props { onMenuToggle: () => void; }

export function TopNavbar({ onMenuToggle }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-sm font-heading font-semibold text-foreground">Welcome, {currentUser.name.split(" ")[0]}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors">
            <img src={currentUser.avatar} alt={currentUser.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-border" />
            <span className="hidden md:block text-sm font-medium text-foreground">{currentUser.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl p-1.5 z-50 shadow-lg animate-fade-in">
                <a href="/dashboard/settings" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Settings</a>
                <hr className="my-1 border-border" />
                <a href="/login" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted text-destructive transition-colors">Logout</a>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
