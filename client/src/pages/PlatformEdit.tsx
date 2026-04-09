import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Menu, Loader2 } from "lucide-react";
import { updatePlatform } from "@/lib/platformsApi";
import { useToast } from "@/hooks/use-toast";

interface PlatformEditData {
  userId?: string;
  platformId?: string;
  name?: string;
  template?: string;
  walletUrl?: string;
  active?: boolean;
}

const TEMPLATE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "altenro-premium", label: "Altenro Premium" },
  { value: "default", label: "Default" },
];

export default function PlatformEditPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const storedPlatform = useMemo<PlatformEditData>(() => {
    const raw = sessionStorage.getItem("platformToEdit") || localStorage.getItem("platformToEdit");
    if (!raw) return {};
    try {
      return JSON.parse(raw) as PlatformEditData;
    } catch {
      return {};
    }
  }, []);

  const [platformId, setPlatformId] = useState(storedPlatform.platformId || "");
  const [userId, setUserId] = useState(storedPlatform.userId || "");
  const [name, setName] = useState(storedPlatform.name || "");
  const [active, setActive] = useState(!!storedPlatform.active);
  const [template, setTemplate] = useState(storedPlatform.template || "admin");
  const [walletUrl, setWalletUrl] = useState(storedPlatform.walletUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!platformId) {
      toast({
        title: "Error",
        description: "Platform ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await updatePlatform(platformId, {
        userId,
        name,
        active,
        walletUrl,
        skinTemplate: template,
      });
      
      toast({
        title: "Guardado exitosamente",
      });
      
      // Navigate back to platforms list
      setLocation("/plataformas");
    } catch (error) {
      console.error("Error updating platform:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update platform",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-40">
        <div className="px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/plataformas")}> 
              <Menu className="w-5 h-5" />
            </Button>
            <span className="text-xl font-bold text-primary">Logic Bet</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Editar Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platformId">Id Plataforma</Label>
                <Input
                  id="platformId"
                  value={platformId}
                  readOnly
                  disabled
                  placeholder="Id Plataforma"
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Id Usuario</Label>
                <Input
                  id="userId"
                  value={userId}
                  readOnly
                  disabled
                  placeholder="Id Usuario"
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Estos IDs son de referencia y no se pueden modificar desde esta pantalla.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label>Activo</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={active} onCheckedChange={setActive} disabled={isSaving} />
                  <span className="text-sm text-muted-foreground">{active ? "Activo" : "Inactivo"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skin Template</Label>
                <Select value={template} onValueChange={setTemplate} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet</Label>
                <Input
                  id="wallet"
                  value={walletUrl}
                  onChange={(e) => setWalletUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={isSaving}
                />
              </div>

              {isSaving && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando cambios y sincronizando la plataforma...
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation("/plataformas")}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
