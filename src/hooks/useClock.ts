import { useEffect, useState } from "react";
import type { ClockState } from "../types";

// Variable global para evitar múltiples inicializaciones
let globalInitialized = false;

// Detectar si estamos en modo desarrollo - usar múltiples métodos para mayor confiabilidad
const isDevelopment =
  import.meta.env.DEV ||
  import.meta.env.MODE === "development" ||
  (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost")));

console.log("🔍 Environment check:", {
  DEV: import.meta.env.DEV,
  MODE: import.meta.env.MODE,
  hostname: typeof window !== "undefined" ? window.location.hostname : "server",
  isDevelopment,
});

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

  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones después del desmontaje

    // Función para validar y procesar respuesta del servidor
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Server validation logic naturally has high complexity
    const processServerResponse = async (serverUrl: string): Promise<Date | null> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Timeout más largo

      try {
        const response = await fetch(serverUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "AlarmClock/1.0", // Identificar la aplicación
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TimeServerResponse = await response.json();

        // Validar que tenemos los datos necesarios
        if (!data.datetime) {
          console.warn(`Servidor ${serverUrl} no devolvió datetime válido`);
          return null;
        }

        const serverTime = new Date(data.datetime);

        // Validar que la fecha sea válida
        if (Number.isNaN(serverTime.getTime())) {
          console.warn(`Servidor ${serverUrl} devolvió fecha inválida: ${data.datetime}`);
          return null;
        }

        // Validar que la hora sea razonable
        const localTime = new Date();
        const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());
        const maxDiff = 2 * 60 * 60 * 1000; // 2 horas máximo

        if (timeDiff > maxDiff) {
          console.warn(`Server time seems incorrect, difference: ${timeDiff}ms`);
          return null;
        }

        if (isMounted) {
          setLastSync(new Date());
          setIsOnline(true);
        }
        console.log(`✅ Sincronizado con servidor: ${serverUrl}`);
        return serverTime;
      } catch (error) {
        clearTimeout(timeoutId);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`❌ Error con servidor ${serverUrl}:`, errorMessage);
        return null;
      }
    };

    // Función para obtener la hora del servidor con múltiples intentos
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Retry logic with multiple servers naturally has high complexity
    const fetchServerTime = async (retries = 1): Promise<Date | null> => {
      // Usar APIs más confiables y menos propensas al rate limiting
      const servers = [
        "https://timeapi.io/api/Time/current/zone?timeZone=America/Argentina/Buenos_Aires",
        "https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires",
        "https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=America/Argentina/Buenos_Aires",
      ];

      for (let attempt = 0; attempt < retries; attempt++) {
        for (const serverUrl of servers) {
          const serverTime = await processServerResponse(serverUrl);
          if (serverTime) return serverTime;
        }

        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      console.warn("❌ Todos los servidores fallaron, usando hora local");
      if (isMounted) {
        setIsOnline(false);
      }
      return null;
    };

    // Función para calcular el offset entre servidor y local
    const calculateOffset = (serverTime: Date, localTime: Date): number => {
      const offset = serverTime.getTime() - localTime.getTime();
      // Validar que el offset sea un número válido y razonable
      if (Number.isNaN(offset) || Math.abs(offset) > 24 * 60 * 60 * 1000) {
        console.warn(`⚠️ Offset inválido: ${offset}ms, usando 0`);
        return 0;
      }
      return offset;
    };
    let offset = 0;
    let lastServerSync = 0;
    let syncAttempts = 0;
    const SYNC_INTERVAL = 3600000; // Sincronizar cada 1 hora para evitar rate limiting
    const MAX_SYNC_ATTEMPTS = 1; // Solo un intento para evitar spam

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

      setClockState((prev) => ({
        currentTime: timeString,
        currentDate: adjustedTime,
        isOnline: prev.isOnline,
        lastSync: prev.lastSync,
      }));
    };

    // Función de sincronización inteligente
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Sync logic with multiple conditions naturally has high complexity
    const syncWithServer = async (forceSync = false) => {
      // Evitar múltiples inicializaciones usando variable global
      if (forceSync && globalInitialized) {
        console.log("⏸️ Sincronización inicial ya ejecutada globalmente, omitiendo");
        return;
      }

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
      if (serverTime && isMounted) {
        const localTime = new Date();
        const newOffset = calculateOffset(serverTime, localTime);

        // El calculateOffset ya valida el offset, así que podemos confiar en él
        offset = newOffset;
        lastServerSync = Date.now();
        syncAttempts = 0; // Resetear contador de intentos
        console.log(`✅ Sincronizado exitosamente. Offset: ${offset}ms`);

        // Actualizar estados de manera funcional
        setLastSync(new Date());
        setIsOnline(true);
      } else if (isMounted) {
        console.warn(`❌ Fallo en sincronización #${syncAttempts}`);
        setIsOnline(false);
      }

      // Marcar como inicializado globalmente si era una sincronización forzada
      if (forceSync) {
        globalInitialized = true;
      }
    };

    // Sincronización inicial solo en producción para evitar problemas en desarrollo
    let initialSyncTimeout: number | null = null;
    console.log("🔍 Sync decision:", { isDevelopment, willSync: !isDevelopment });
    if (!isDevelopment) {
      initialSyncTimeout = setTimeout(() => {
        if (isMounted) {
          syncWithServer(true);
        }
      }, 10000); // Delay de 10 segundos para evitar sincronización inmediata
    } else {
      console.log("🚫 Modo desarrollo: omitiendo sincronización inicial para evitar rate limiting");
    }

    // Actualizar inmediatamente
    updateTime();

    // Configurar intervalo para actualizar cada segundo
    const timeInterval = setInterval(updateTime, 1000);

    // Configurar intervalo para sincronización periódica solo en producción
    let syncInterval: number | null = null;
    if (!isDevelopment) {
      syncInterval = setInterval(() => {
        syncWithServer(false);
      }, 3600000); // Verificar cada 1 hora para evitar rate limiting
    }

    // Resetear contador de intentos cada 5 minutos
    const resetInterval = setInterval(
      () => {
        syncAttempts = 0;
        console.log("🔄 Reseteando contador de intentos de sincronización");
      },
      5 * 60 * 1000
    );

    return () => {
      isMounted = false;
      if (initialSyncTimeout) {
        clearTimeout(initialSyncTimeout);
      }
      clearInterval(timeInterval);
      if (syncInterval) {
        clearInterval(syncInterval);
      }
      clearInterval(resetInterval);
    };
  }, []);

  return {
    ...clockState,
    isOnline,
    lastSync,
  };
};
