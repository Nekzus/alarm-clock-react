import { useEffect, useState } from "react";
import type { ClockState } from "../types";

interface TimeServerResponse {
  datetime: string;
  timezone: string;
  utc_offset: string;
}

export const useClock = () => {
  const [clockState, setClockState] = useState<ClockState>({
    currentTime: "--:--:--",
    currentDate: new Date(),
    isOnline: true,
    lastSync: null,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Función para obtener la hora del servidor con múltiples intentos
  const fetchServerTime = async (retries = 3): Promise<Date | null> => {
    const servers = [
      "https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires",
      "https://timeapi.io/api/Time/current/zone?timeZone=America/Argentina/Buenos_Aires",
      "https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=America/Argentina/Buenos_Aires",
    ];

    for (let attempt = 0; attempt < retries; attempt++) {
      for (const serverUrl of servers) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

          const response = await fetch(serverUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: TimeServerResponse = await response.json();
          const serverTime = new Date(data.datetime);

          // Validar que la hora sea razonable (no más de 1 hora de diferencia con local)
          const localTime = new Date();
          const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());
          const maxDiff = 60 * 60 * 1000; // 1 hora en milisegundos

          if (timeDiff > maxDiff) {
            console.warn(`Server time seems incorrect, difference: ${timeDiff}ms`);
            continue; // Probar siguiente servidor
          }

          setLastSync(new Date());
          setIsOnline(true);
          console.log(`✅ Sincronizado con servidor: ${serverUrl}`);
          return serverTime;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`❌ Error con servidor ${serverUrl}:`, errorMessage);
        }
      }

      // Esperar antes del siguiente intento
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    console.warn("❌ Todos los servidores fallaron, usando hora local");
    setIsOnline(false);
    return null;
  };

  // Función para calcular el offset entre servidor y local
  const calculateOffset = (serverTime: Date, localTime: Date): number => {
    return serverTime.getTime() - localTime.getTime();
  };

  useEffect(() => {
    let offset = 0;
    let lastServerSync = 0;
    let syncAttempts = 0;
    const SYNC_INTERVAL = 60000; // Sincronizar cada 60 segundos
    const MAX_SYNC_ATTEMPTS = 3;

    const updateTime = () => {
      const now = new Date();

      // Aplicar offset si tenemos uno válido
      const adjustedTime = new Date(now.getTime() + offset);

      const timeString = adjustedTime.toLocaleTimeString("es-AR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setClockState({
        currentTime: timeString,
        currentDate: adjustedTime,
        isOnline,
        lastSync,
      });
    };

    // Función de sincronización inteligente
    const syncWithServer = async (forceSync = false) => {
      const timeSinceLastSync = Date.now() - lastServerSync;

      // Solo sincronizar si es necesario o forzado
      if (!forceSync && timeSinceLastSync < SYNC_INTERVAL) {
        return;
      }

      // Evitar demasiados intentos consecutivos
      if (syncAttempts >= MAX_SYNC_ATTEMPTS && !forceSync) {
        console.log("⏸️ Pausando intentos de sincronización por demasiados fallos");
        return;
      }

      syncAttempts++;
      console.log(`🔄 Intento de sincronización #${syncAttempts}`);

      const serverTime = await fetchServerTime();
      if (serverTime) {
        const localTime = new Date();
        const newOffset = calculateOffset(serverTime, localTime);

        // Solo actualizar si el offset es razonable
        if (Math.abs(newOffset) < 24 * 60 * 60 * 1000) {
          // Menos de 24 horas
          offset = newOffset;
          lastServerSync = Date.now();
          syncAttempts = 0; // Resetear contador de intentos
          console.log(`✅ Sincronizado exitosamente. Offset: ${offset}ms`);
        } else {
          console.warn(`⚠️ Offset demasiado grande: ${newOffset}ms, manteniendo offset anterior`);
        }
      } else {
        console.warn(`❌ Fallo en sincronización #${syncAttempts}`);
      }
    };

    // Sincronización inicial
    syncWithServer(true);

    // Actualizar inmediatamente
    updateTime();

    // Configurar intervalo para actualizar cada segundo
    const timeInterval = setInterval(updateTime, 1000);

    // Configurar intervalo para sincronización periódica
    const syncInterval = setInterval(() => {
      syncWithServer(false);
    }, 30000); // Verificar cada 30 segundos

    // Resetear contador de intentos cada 5 minutos
    const resetInterval = setInterval(
      () => {
        syncAttempts = 0;
        console.log("🔄 Reseteando contador de intentos de sincronización");
      },
      5 * 60 * 1000
    );

    return () => {
      clearInterval(timeInterval);
      clearInterval(syncInterval);
      clearInterval(resetInterval);
    };
  }, [calculateOffset, fetchServerTime, isOnline, lastSync]);

  return {
    ...clockState,
    isOnline,
    lastSync,
  };
};
