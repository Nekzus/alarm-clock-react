import { CheckCircle, PauseCircle } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AlarmState } from "../types";

interface AlarmStatusProps {
  alarmState: AlarmState;
}

export const AlarmStatus: React.FC<AlarmStatusProps> = ({ alarmState }) => {
  const getStatusInfo = () => {
    if (alarmState.isActive) {
      return {
        text: "Alarma activa",
        variant: "default" as const,
        icon: <CheckCircle className="w-5 h-5" />,
        className:
          "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/50 dark:to-green-900/50 border-2 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 shadow-lg",
      };
    } else {
      return {
        text: "Alarma inactiva",
        variant: "secondary" as const,
        icon: <PauseCircle className="w-5 h-5" />,
        className:
          "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 shadow-lg",
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`${statusInfo.className} border-2`}>
      <CardContent className="p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {statusInfo.icon}
          <Badge variant={statusInfo.variant} className="text-xs sm:text-sm font-medium">
            {statusInfo.text}
          </Badge>
        </div>

        {alarmState.isActive && alarmState.targetTime && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              Objetivo:{" "}
              {alarmState.targetTime.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </Badge>

            {alarmState.isRepetitive && alarmState.alarmTimes.length > 0 && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <div className="font-medium mb-1">🔄 Alarma repetitiva activa</div>
                <div>
                  Alarma {alarmState.currentAlarmIndex + 1} de {alarmState.alarmTimes.length}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Próxima:{" "}
                  {alarmState.alarmTimes[alarmState.currentAlarmIndex + 1]?.toLocaleTimeString(
                    "es-ES",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }
                  ) || "N/A"}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
