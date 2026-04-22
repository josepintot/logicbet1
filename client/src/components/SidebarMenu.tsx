import React, { useState } from 'react';
import { Menu, LogOut, Home, Monitor, Users, DollarSign, BarChart2, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

interface SidebarMenuProps {
  onLogout?: () => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    { icon: Home, label: "Home", key: "home" },
    { icon: Monitor, label: "Platforms", key: "platforms" },
    { 
      icon: Users, 
      label: "Players", 
      key: "players",
      submenu: [
        { label: "Buscar Jugador", key: "buscar-jugador", href: "/players/buscar-jugador" },
        { label: "Más Apostadores", key: "mas-apostadores", href: "/players/mas-apostadores" },
        { label: "Más Ganadores", key: "mas-ganadores", href: "/players/mas-ganadores" },
        { label: "Jugadores Activos", key: "jugadores-activos", href: "/players/jugadores-activos" },
      ]
    },
    { icon: DollarSign, label: "Apuestas", key: "bets", href: "/apuestas" },
    {
      icon: BarChart2,
      label: "Reportes",
      key: "reportes",
      submenu: [
        { label: "Reporte General", key: "reporte-general", href: "/reportes/general" },
        { label: "Reportes por Jugador", key: "reportes-por-jugador", href: "/reportes/por-jugador" },
      ]
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-40">
        <div className="px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              data-testid="button-menu-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <img src={logoImage} alt="Logic Bet" className="h-12 w-auto object-contain" data-testid="img-logo-dashboard" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu - Popup */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 shadow-lg">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenu === item.key;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                
                return (
                  <div key={item.key}>
                    <button
                      data-testid={`menu-item-${item.key}`}
                      onClick={() => {
                        if (hasSubmenu) {
                          setExpandedMenu(isExpanded ? null : item.key);
                        } else {
                          setIsMenuOpen(false);
                          if (item.key === "platforms") {
                            window.location.href = "/plataformas";
                          } else if (item.key === "home") {
                            window.location.href = "/";
                          } else if ((item as any).href) {
                            window.location.href = (item as any).href;
                          }
                        }
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {hasSubmenu && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {hasSubmenu && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-primary/30 pl-4">
                        {item.submenu.map((subitem) => (
                          <button
                            key={subitem.key}
                            onClick={() => {
                              setIsMenuOpen(false);
                              window.location.href = subitem.href;
                            }}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {subitem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
