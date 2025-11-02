import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logic Bet" className="h-16 w-auto object-contain" data-testid="img-logo-dashboard" />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24">
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-tight">
            This is my dashboard
          </h1>
        </div>
      </main>
    </div>
  );
}
