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

// Interface para diferentes formatos de respuesta de servidores de tiempo
interface TimeServerResponse {
  datetime?: string;
  dateTime?: string;
  current_time?: string;
  time?: string;
  timestamp?: number;
  timezone?: string;
  utc_offset?: string;
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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout más largo para NTP

      try {
        const response = await fetch(serverUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "AlarmClock/1.0", // Identificar la aplicación
            "Cache-Control": "no-cache", // Evitar cache para obtener tiempo más preciso
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: TimeServerResponse = await response.json();

        // Manejar diferentes formatos de respuesta
        let datetime: string | null = null;

        if (data.datetime) {
          datetime = data.datetime;
        } else if (data.dateTime) {
          datetime = data.dateTime;
        } else if (data.current_time) {
          datetime = data.current_time;
        } else if (data.time) {
          datetime = data.time;
        } else if (data.timestamp) {
          // Convertir timestamp a ISO string
          datetime = new Date(data.timestamp * 1000).toISOString();
        }

        if (!datetime) {
          console.warn(`Servidor ${serverUrl} no devolvió datetime válido:`, data);
          return null;
        }

        const serverTime = new Date(datetime);

        // Validar que la fecha sea válida
        if (Number.isNaN(serverTime.getTime())) {
          console.warn(`Servidor ${serverUrl} devolvió fecha inválida: ${data.datetime}`);
          return null;
        }

        // Validar que la hora sea razonable (más estricto para NTP)
        const localTime = new Date();
        const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());
        const maxDiff = 5 * 60 * 1000; // 5 minutos máximo para NTP (más estricto)

        if (timeDiff > maxDiff) {
          console.warn(
            `Server time seems incorrect, difference: ${timeDiff}ms (max: ${maxDiff}ms)`
          );
          return null;
        }

        // Log de precisión para debugging
        console.log(
          `🕐 Tiempo del servidor: ${serverTime.toISOString()}, diferencia: ${timeDiff}ms`
        );

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
    const fetchServerTime = async (retries = 2): Promise<Date | null> => {
      // Usar servidores NTP públicos a través de APIs proxy para mayor precisión
      const servers = [
        // Servidores NTP públicos más precisos (Argentina) - Prioridad alta
        "https://timeapi.io/api/Time/current/zone?timeZone=America/Argentina/Buenos_Aires",
        "https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires",
        // Servidores NTP internacionales más precisos - Prioridad media
        "https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=America/Argentina/Buenos_Aires",
        "https://api.ipgeolocation.io/timezone?apiKey=free&tz=America/Argentina/Buenos_Aires",
        "https://timezoneapi.io/api/timezone/?America/Argentina/Buenos_Aires",
        // Servidores NTP alternativos para Argentina - Prioridad baja
        "https://api.timezonedb.com/v2.1/get-time-zone?key=demo&format=json&by=zone&zone=America/Argentina",
        "https://worldtimeapi.org/api/timezone/America/Argentina",
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

      console.warn("❌ Todos los servidores fallaron, usando hora local como fallback");
      if (isMounted) {
        setIsOnline(false);
        // Usar hora local como fallback
        const localTime = new Date();
        console.log(`🔄 Usando hora local como fallback: ${localTime.toISOString()}`);
        return localTime;
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

        if (offset === 0) {
          console.log(`✅ Usando hora local (offset: 0ms) - servidores NTP no disponibles`);
        } else {
          console.log(
            `✅ Sincronizado con NTP exitosamente. Offset: ${offset}ms (precisión: ±${Math.abs(offset)}ms)`
          );
        }

        // Actualizar estados de manera funcional
        setLastSync(new Date());
        setIsOnline(true);
      } else if (isMounted) {
        console.warn(`❌ Fallo en sincronización #${syncAttempts} - usando hora local`);
        setIsOnline(false);
        // Asegurar que usamos offset 0 si falla todo
        offset = 0;
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

    // Mostrar mensaje informativo sobre el estado de sincronización
    if (!isDevelopment) {
      console.log(
        "🕐 Reloj iniciado - sincronizando con servidores NTP públicos para máxima precisión..."
      );
    }

    // Configurar intervalo para actualizar cada segundo
    const timeInterval = setInterval(updateTime, 1000);

    // Configurar intervalo para sincronización periódica solo en producción
    let syncInterval: number | null = null;
    if (!isDevelopment) {
      syncInterval = setInterval(() => {
        // Solo sincronizar si no hay una sincronización reciente
        const timeSinceLastSync = Date.now() - lastServerSync;
        if (timeSinceLastSync > 1800000) {
          // Solo si han pasado más de 30 minutos
          console.log("🔄 Sincronización periódica programada");
          syncWithServer(false);
        } else {
          console.log("⏸️ Sincronización omitida - muy reciente");
        }
      }, 1800000); // Verificar cada 30 minutos para mejor balance
    }

    // Sistema de reconexión automática inteligente
    const smartReconnectionInterval = setInterval(
      () => {
        if (!isDevelopment && isMounted) {
          const timeSinceLastSync = Date.now() - lastServerSync;
          const hoursSinceSync = timeSinceLastSync / (1000 * 60 * 60);

          // Reconectar automáticamente si han pasado más de 2 horas
          if (hoursSinceSync > 2 && syncAttempts < 3) {
            console.log(
              `🔄 Reconexión automática - última sync hace ${Math.floor(hoursSinceSync)}h`
            );
            syncWithServer(false);
          }
        }
      },
      10 * 60 * 1000
    ); // Verificar cada 10 minutos

    // Resetear contador de intentos cada 30 minutos
    const resetInterval = setInterval(
      () => {
        syncAttempts = 0;
        console.log("🔄 Reseteando contador de intentos de sincronización");
      },
      30 * 60 * 1000
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
      clearInterval(smartReconnectionInterval);
      clearInterval(resetInterval);
    };
  }, []);

  return {
    ...clockState,
    isOnline,
    lastSync,
  };
};
