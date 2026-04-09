import React, { useEffect, useState } from "react";
import { PlatformsTable } from "@/components/PlatformsTable";
import { fetchUserPlatforms, rememberPlatformForEdit } from "@/lib/platformsApi";
import { SidebarMenu } from "@/components/SidebarMenu";

const USER_ID = "67ad2a78849373c6e62620be";

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPlatforms(USER_ID)
      .then((data) => {
        setPlatforms(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error desconocido");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold mb-6 text-primary">Plataformas</h1>
          {loading && <div>Cargando plataformas...</div>}
          {error && <div className="text-red-500">Error cargando plataformas: {error}</div>}
          {platforms && (
            <PlatformsTable
              platforms={platforms}
              onEdit={(platform) => {
                rememberPlatformForEdit(platform);
                window.location.href = "/plataformas/editar";
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
