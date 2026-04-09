import React from "react";
import { Card } from "@/components/ui/card";

export interface Platform {
  userId: string;
  platformId: string;
  name: string;
  template: string;
  walletUrl: string;
  active: boolean;
}

interface PlatformsTableProps {
  platforms: Platform[];
  onEdit?: (platform: Platform) => void;
}

export const PlatformsTable: React.FC<PlatformsTableProps> = ({ platforms, onEdit }) => {
  return (
    <Card className="overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 font-semibold text-muted-foreground">USUARIO ID</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">PLATAFORMA ID</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">NOMBRE</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">TEMPLATE</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">WALLET URL</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">ACTIVO</th>
            <th className="px-4 py-2 font-semibold text-muted-foreground">OPCIONES</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((platform, idx) => (
            <tr key={platform.platformId || idx} className="border-b hover:bg-muted/40">
              <td className="px-4 py-2 whitespace-nowrap">{platform.userId ? platform.userId.slice(0, 8) + '...' : ''}</td>
              <td className="px-4 py-2 whitespace-nowrap">{platform.platformId ? platform.platformId.slice(0, 12) + '...' : ''}</td>
              <td className="px-4 py-2 whitespace-nowrap">{platform.name || ''}</td>
              <td className="px-4 py-2 whitespace-nowrap">{platform.template || ''}</td>
              <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate">
                {platform.walletUrl ? (
                  <a href={platform.walletUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {platform.walletUrl}
                  </a>
                ) : ''}
              </td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${platform.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {platform.active ? "true" : "false"}
                </span>
              </td>
              <td className="px-4 py-2">
                <button
                  className="px-3 py-1 rounded bg-muted border hover:bg-primary/10"
                  onClick={() => onEdit && onEdit(platform)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};
