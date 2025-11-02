import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";

const API_URL = "https://sports-admin-server.jbets.online";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/v1/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the auth token
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        // Redirect to dashboard
        window.location.href = '/';
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not connect to server",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logic Bet" className="h-16 w-auto object-contain" data-testid="img-logo-login" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24 py-12">
        <Card className="w-full max-w-md" data-testid="card-login">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight" data-testid="heading-login">
              Sign in to Logic Bet
            </CardTitle>
            <CardDescription data-testid="text-login-description">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" data-testid="label-username">Username</Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Enter your username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" data-testid="label-password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
