import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  Menu, 
  Home, 
  Monitor, 
  Users, 
  Search, 
  TrendingUp,
  Trophy,
  UserCheck,
  DollarSign,
  Calendar,
  ChevronDown
} from "lucide-react";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

export default function Dashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState("07 Oct - 05 Nov");
  const [daysSelected, setDaysSelected] = useState(30);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const menuItems = [
    { icon: Home, label: "Home", key: "home" },
    { icon: Monitor, label: "Platforms", key: "platforms" },
    { icon: Users, label: "Players", key: "players" },
    { icon: Search, label: "Search Player", key: "search" },
    { icon: TrendingUp, label: "Top Bettors", key: "bettors" },
    { icon: Trophy, label: "Top Winners", key: "winners" },
    { icon: UserCheck, label: "Active Players", key: "active" },
    { icon: DollarSign, label: "Bets", key: "bets" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoImage} alt="Logic Bet" className="h-16 w-auto object-contain" data-testid="img-logo-dashboard" />
            
            {/* Navigation Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-menu-dropdown">
                  <Menu className="w-4 h-4" />
                  <span className="hidden sm:inline">Menu</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" data-testid="dropdown-menu-content">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuItems.map((item) => (
                  <DropdownMenuItem key={item.key} data-testid={`menu-item-${item.key}`}>
                    <item.icon className="w-4 h-4 mr-2" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Main Content */}
      <main className="flex-1 px-8 md:px-16 lg:px-24 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Date Range Selector */}
          <Card className="hover-elevate" data-testid="card-date-selector">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-medium" data-testid="text-date-range">{selectedDateRange}</p>
                  <p className="text-xs text-muted-foreground">{daysSelected} Days Selected</p>
                </div>
                <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Financial Report Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-primary flex items-center justify-center gap-3" data-testid="heading-financial-report">
              <TrendingUp className="w-8 h-8" />
              <span>Financial Report</span>
            </h1>
            <p className="text-muted-foreground">Metrics by Currency</p>
          </div>

          {/* Summary Section */}
          <Card data-testid="card-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Currencies */}
                <div className="text-center space-y-2" data-testid="metric-total-currencies">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Currencies</p>
                  <p className="text-4xl font-light" data-testid="value-total-currencies">6</p>
                </div>

                {/* Reported Months */}
                <div className="text-center space-y-2" data-testid="metric-reported-months">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Reported Months</p>
                  <p className="text-4xl font-light" data-testid="value-reported-months">2</p>
                </div>

                {/* Total Metrics */}
                <div className="text-center space-y-2" data-testid="metric-total-metrics">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Metrics</p>
                  <p className="text-4xl font-light text-green-600 dark:text-green-400 flex items-center justify-center gap-2" data-testid="value-total-metrics">
                    <TrendingUp className="w-6 h-6" />
                    Positive
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-elevate" data-testid="card-active-users">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Active Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-light" data-testid="value-active-players">1,234</p>
                <p className="text-sm text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-bets">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-light" data-testid="value-total-bets">$45,678</p>
                <p className="text-sm text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
