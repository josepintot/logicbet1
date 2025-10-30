import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Shield } from "lucide-react";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logic Bet" className="h-16 w-auto object-contain" data-testid="img-logo" />
          </div>
          <Button 
            onClick={handleLogin}
            variant="default"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
              Sports Betting Data,
              <br />
              <span className="font-semibold">Simplified.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
              Access real-time odds and game data with our minimal, elegant dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="min-w-[200px]"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-medium">Real-Time Odds</h3>
            <p className="text-sm text-muted-foreground font-light">
              Track live betting odds across multiple sports and leagues.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-medium">Data Analytics</h3>
            <p className="text-sm text-muted-foreground font-light">
              Make informed decisions with comprehensive game statistics.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-lg bg-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-lg font-medium">Secure Access</h3>
            <p className="text-sm text-muted-foreground font-light">
              Your data is protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Logic Bet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
