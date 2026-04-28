import React, { useEffect, useMemo, useState } from 'react';
import {
  Menu,
  LogOut,
  Home,
  Monitor,
  Users,
  DollarSign,
  BarChart2,
  ChevronDown,
  X,
  Trophy,
  Settings,
  Search,
  Globe,
  ShieldBan,
  Radio,
  Percent,
  ShieldCheck,
  FileText,
  UserRoundCog,
  ShieldAlert,
  SlidersHorizontal,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

interface SidebarMenuProps {
  onLogout?: () => void;
}

type SettingsItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlights: string[];
};

type SettingsSection = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: SettingsItem[];
  description?: string;
  highlights?: string[];
};

const settingsSections: SettingsSection[] = [
  {
    key: 'configuracion',
    label: 'Configuracion',
    icon: Settings,
    items: [
      {
        key: 'general',
        label: 'General',
        icon: Search,
        description: 'Configura parametros generales del operador, visibilidad y comportamiento base de la plataforma.',
        highlights: ['Zona horaria del panel', 'Formato de fecha', 'Idioma operativo'],
      },
      {
        key: 'divisa',
        label: 'Divisa',
        icon: Globe,
        description: 'Define la moneda principal, precision decimal y reglas visuales para cuotas y montos.',
        highlights: ['Moneda base USD', 'Separadores regionales', 'Redondeo de montos'],
      },
    ],
  },
  {
    key: 'bloqueos',
    label: 'Bloqueos',
    icon: ShieldBan,
    items: [
      {
        key: 'bloqueos-live',
        label: 'Live',
        icon: Radio,
        description: 'Administra bloqueos temporales y permanentes en mercados en vivo.',
        highlights: ['Bloqueo por evento', 'Bloqueo por mercado', 'Pausa operativa inmediata'],
      },
      {
        key: 'bloqueos-prematch',
        label: 'Prematch',
        icon: ShieldBan,
        description: 'Controla restricciones previas al inicio del encuentro para mercados prepartido.',
        highlights: ['Cierre anticipado', 'Limites por competencia', 'Mercados deshabilitados'],
      },
    ],
  },
  {
    key: 'modificar-cuotas',
    label: 'Modificar Cuotas',
    icon: Percent,
    items: [
      {
        key: 'cuotas-live',
        label: 'Live',
        icon: Radio,
        description: 'Ajusta multiplicadores y reglas de margen para encuentros en vivo.',
        highlights: ['Margen por deporte', 'Boost manual', 'Proteccion de volatilidad'],
      },
      {
        key: 'cuotas-prematch',
        label: 'Prematch',
        icon: Percent,
        description: 'Modifica cuotas base y factores prepartido antes de la publicacion.',
        highlights: ['Factor global', 'Overrides por liga', 'Ajuste por riesgo'],
      },
    ],
  },
  {
    key: 'control-riesgo',
    label: 'Control de Riesgo',
    icon: ShieldCheck,
    items: [
      {
        key: 'reglas-riesgo',
        label: 'Reglas de Control de Riesgo',
        icon: FileText,
        description: 'Centraliza las reglas automaticas que limitan exposicion, margen y patrones atipicos.',
        highlights: ['Alertas por concentracion', 'Topes por mercado', 'Disparadores automaticos'],
      },
      {
        key: 'jugadores-riesgo',
        label: 'Jugadores con Riesgo',
        icon: UserRoundCog,
        description: 'Consulta usuarios marcados, nivel de riesgo y restricciones aplicadas sobre la cuenta.',
        highlights: ['Score de riesgo', 'Revision manual', 'Historial de cambios'],
      },
      {
        key: 'riesgo-detallado',
        label: 'Riesgo Detallado',
        icon: ShieldAlert,
        description: 'Visualiza distribucion de exposicion por deporte, evento, mercado y jugador.',
        highlights: ['Mapa de exposicion', 'Riesgo por franja horaria', 'Detalle por segmento'],
      },
      {
        key: 'factores-riesgo',
        label: 'Factores de Riesgo',
        icon: SlidersHorizontal,
        description: 'Administra los factores que impactan el scoring automatico del motor de riesgo.',
        highlights: ['Peso por patron', 'Sensibilidad del motor', 'Revision por operador'],
      },
    ],
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: UsersRound,
    description: 'Gestiona roles, permisos y accesos del personal operativo dentro del panel administrativo.',
    highlights: ['Roles activos', 'Permisos por modulo', 'Auditoria de sesiones'],
  },
];

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingKey, setActiveSettingKey] = useState('general');
  const [settingsSearch, setSettingsSearch] = useState('');

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
    { icon: Trophy, label: "Encuentros", key: "encuentros", href: "/encuentros" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/';
    }
  };

  const activeSetting = useMemo(() => {
    for (const section of settingsSections) {
      if (section.key === activeSettingKey) {
        return {
          title: section.label,
          description: section.description ?? 'Configuracion de la plataforma.',
          highlights: section.highlights ?? [],
        };
      }

      const item = section.items?.find((entry) => entry.key === activeSettingKey);
      if (item) {
        return {
          title: item.label,
          description: item.description,
          highlights: item.highlights,
          section: section.label,
        };
      }
    }

    return {
      title: 'General',
      description: 'Configuracion de la plataforma.',
      highlights: [],
    };
  }, [activeSettingKey]);

  const filteredSettingsSections = useMemo(() => {
    const query = settingsSearch.trim().toLowerCase();

    if (!query) {
      return settingsSections;
    }

    return settingsSections
      .map((section) => {
        const sectionMatches = section.label.toLowerCase().includes(query);
        const matchingItems = section.items?.filter((item) => item.label.toLowerCase().includes(query));

        if (sectionMatches) {
          return section;
        }

        if (matchingItems?.length) {
          return {
            ...section,
            items: matchingItems,
          };
        }

        return null;
      })
      .filter((section): section is SettingsSection => Boolean(section));
  }, [settingsSearch]);

  useEffect(() => {
    if (!filteredSettingsSections.length) {
      return;
    }

    const stillVisible = filteredSettingsSections.some((section) => {
      if (section.key === activeSettingKey) {
        return true;
      }

      return section.items?.some((item) => item.key === activeSettingKey);
    });

    if (stillVisible) {
      return;
    }

    const firstSection = filteredSettingsSections[0];
    const nextKey = firstSection.items?.[0]?.key ?? firstSection.key;
    setActiveSettingKey(nextKey);
  }, [activeSettingKey, filteredSettingsSections]);

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
              onClick={() => setIsSettingsOpen(true)}
              data-testid="button-open-settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
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
          <div className="fixed left-0 top-0 bottom-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card shadow-lg">
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
            <nav className="flex-1 overflow-y-auto p-4 pb-6 space-y-2">
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
            <div className="border-t border-border p-4">
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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 p-0 sm:rounded-none [&>button]:hidden">
          <DialogTitle className="sr-only">Configuracion</DialogTitle>

          <div className="flex h-full flex-col bg-[#eef3fb]">
            <div className="flex items-center justify-between border-b border-[#d9e2f2] bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2a44]">Configuracion</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-full text-[#5f6f8f] hover:bg-[#edf3ff] hover:text-[#1f2a44]"
                data-testid="button-close-settings"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex h-[calc(100vh-65px)] min-h-0 flex-1">
              <aside className="h-full w-full max-w-[320px] border-r border-[#d9e2f2] bg-[#f7f9fd] px-5 py-5">
                <div className="sticky top-0 z-10 rounded-full border border-[#d9e2f2] bg-white px-4 py-3 shadow-sm">
                  <label className="flex items-center gap-3 text-[#6b7894]">
                    <Search className="h-4 w-4" />
                    <input
                      value={settingsSearch}
                      onChange={(event) => setSettingsSearch(event.target.value)}
                      placeholder="Buscar configuracion"
                      className="w-full bg-transparent text-sm text-[#1f2a44] outline-none placeholder:text-[#8b97ae]"
                      data-testid="input-settings-search"
                    />
                  </label>
                </div>

                <nav className="mt-5 h-[calc(100vh-180px)] max-h-[520px] overflow-y-auto overscroll-contain space-y-3 pb-6 pr-1">
                  {filteredSettingsSections.map((section) => {
                    const SectionIcon = section.icon;
                    const sectionIsSelected = activeSettingKey === section.key;

                    return (
                      <div key={section.key} className="rounded-[20px] bg-white/80 p-2 shadow-sm ring-1 ring-[#e2e9f5]">
                        <button
                          type="button"
                          onClick={() => {
                            if (!section.items?.length) {
                              setActiveSettingKey(section.key);
                            }
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${sectionIsSelected ? 'bg-[#edf3ff] text-[#2158d5]' : 'text-[#2f3d5c] hover:bg-[#f3f7ff]'}`}
                        >
                          <SectionIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{section.label}</span>
                        </button>

                        {section.items?.length ? (
                          <div className="mt-1 space-y-1 border-l border-[#cfe0ff] pl-4">
                            {section.items.map((item) => {
                              const ItemIcon = item.icon;
                              const itemIsSelected = activeSettingKey === item.key;

                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  onClick={() => setActiveSettingKey(item.key)}
                                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${itemIsSelected ? 'bg-[#edf3ff] text-[#2158d5] shadow-sm' : 'text-[#44516b] hover:bg-[#f3f7ff]'}`}
                                >
                                  <ItemIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-sm">{item.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}

                  {!filteredSettingsSections.length ? (
                    <div className="rounded-[20px] border border-dashed border-[#d3ddee] bg-white p-4 text-sm text-[#6b7894]">
                      No hay coincidencias para esa busqueda.
                    </div>
                  ) : null}
                </nav>
              </aside>

              <section className="min-w-0 flex-1 bg-white px-6 py-6 md:px-10 md:py-8">
                <div className="mx-auto h-[calc(100vh-130px)] max-h-[640px] max-w-5xl overflow-y-auto overscroll-contain space-y-6 pr-2">
                  <div className="rounded-[28px] border border-[#dfe8f8] bg-gradient-to-r from-[#eff5ff] via-white to-[#f5f8ff] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d7c98]">
                            {activeSetting.section ?? 'Configuracion del sistema'}
                          </p>
                          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1f2a44]">{activeSetting.title}</h2>
                        </div>
                        <p className="max-w-2xl text-sm leading-6 text-[#5f6f8f]">{activeSetting.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] border border-[#dfe8f8] bg-[#fbfcff] p-5 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d8ba5]">Estado</p>
                      <p className="mt-3 text-2xl font-bold text-[#1f2a44]">Activo</p>
                      <p className="mt-2 text-sm text-[#5f6f8f]">Modulo listo para configuracion manual.</p>
                    </div>
                    <div className="rounded-[24px] border border-[#dfe8f8] bg-[#fbfcff] p-5 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d8ba5]">Modo</p>
                      <p className="mt-3 text-2xl font-bold text-[#1f2a44]">Hardcoded UI</p>
                      <p className="mt-2 text-sm text-[#5f6f8f]">Solo frontend, sin persistencia ni backend conectado.</p>
                    </div>
                    <div className="rounded-[24px] border border-[#dfe8f8] bg-[#fbfcff] p-5 shadow-sm">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d8ba5]">Seccion</p>
                      <p className="mt-3 text-2xl font-bold text-[#1f2a44]">{activeSetting.title}</p>
                      <p className="mt-2 text-sm text-[#5f6f8f]">Navegacion lateral inspirada en Chrome.</p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
                    <div className="rounded-[28px] border border-[#dfe8f8] bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1f2a44]">Opciones disponibles</h3>
                          <p className="mt-1 text-sm text-[#5f6f8f]">Resumen visual de la configuracion seleccionada.</p>
                        </div>
                        <div className="rounded-full bg-[#edf3ff] px-3 py-1 text-xs font-semibold text-[#2158d5]">
                          Mock Data
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {activeSetting.highlights.map((highlight) => (
                          <div key={highlight} className="rounded-2xl border border-[#e5ecf8] bg-[#fbfcff] p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#2158d5]" />
                              <div>
                                <p className="text-sm font-semibold text-[#1f2a44]">{highlight}</p>
                                <p className="mt-1 text-sm text-[#5f6f8f]">Parametro visual preparado para futura integracion funcional.</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#dfe8f8] bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-[#1f2a44]">Actividad reciente</h3>
                      <div className="mt-5 space-y-4">
                        {['Actualizacion manual', 'Revision operativa', 'Validacion visual'].map((entry, index) => (
                          <div key={entry} className="flex gap-3 rounded-2xl bg-[#fbfcff] p-4 ring-1 ring-[#ebf0f8]">
                            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#edf3ff] font-semibold text-[#2158d5]">
                              0{index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#1f2a44]">{entry}</p>
                              <p className="mt-1 text-sm text-[#5f6f8f]">Interfaz preparada para extender configuraciones reales en esta seccion.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
