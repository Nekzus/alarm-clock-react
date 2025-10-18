import { Clock, Wifi, WifiOff } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ClockState } from "../types";

interface ClockDisplayProps {
  clockState: ClockState;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ clockState }) => {
  const getSyncStatus = () => {
    if (!clockState.isOnline) {
      return {
        icon: <WifiOff className="w-3 h-3" />,
        text: "Sin conexión",
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        description: "Usando hora local",
      };
    }

    if (clockState.lastSync) {
      const timeSinceSync = Date.now() - clockState.lastSync.getTime();
      const secondsSinceSync = Math.floor(timeSinceSync / 1000);
      const minutesSinceSync = Math.floor(secondsSinceSync / 60);

      if (secondsSinceSync < 30) {
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: "Sincronizado",
          color: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/20",
          description: "Hora oficial argentina",
        };
      } else if (secondsSinceSync < 120) {
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: `Sync hace ${secondsSinceSync}s`,
          color: "text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
          description: "Re-sincronizando...",
        };
      } else {
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: `Sync hace ${minutesSinceSync}m`,
          color: "text-orange-500",
          bgColor: "bg-orange-100 dark:bg-orange-900/20",
          description: "Intentando reconectar",
        };
      }
    }

    return {
      icon: <Wifi className="w-3 h-3" />,
      text: "Sincronizando...",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Conectando con servidor",
    };
  };

  const syncStatus = getSyncStatus();

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg relative overflow-hidden hover-lift">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-200/30 via-slate-300/30 to-slate-400/30 dark:from-slate-600/20 dark:via-slate-500/20 dark:to-slate-400/20 animate-pulse"></div>
      <CardContent className="p-4 sm:p-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
          <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">
            Hora Argentina
          </h2>
        </div>
        <div className="relative mb-4">
          <div className="text-4xl sm:text-6xl lg:text-7xl font-mono font-bold text-slate-800 dark:text-slate-100 drop-shadow-lg tracking-wider">
            {clockState.currentTime}
          </div>
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg"
          >
            {clockState.currentDate.toLocaleDateString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>

          {/* Estado de sincronización */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${syncStatus.bgColor}`}
          >
            {syncStatus.icon}
            <span className={`font-medium ${syncStatus.color}`}>{syncStatus.text}</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {syncStatus.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
