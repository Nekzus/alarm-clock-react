import { useEffect, useState } from 'react';
import type { ClockState } from '../types';

interface TimeServerResponse {
    datetime: string;
    timezone: string;
    utc_offset: string;
}

export const useClock = () => {
    const [clockState, setClockState] = useState<ClockState>({
        currentTime: '--:--:--',
        currentDate: new Date(),
    });
    const [isOnline, setIsOnline] = useState(true);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    // Función para obtener la hora del servidor
    const fetchServerTime = async (): Promise<Date | null> => {
        try {
            const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Madrid', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TimeServerResponse = await response.json();
            const serverTime = new Date(data.datetime);
            setLastSync(new Date());
            setIsOnline(true);
            return serverTime;
        } catch (error) {
            console.warn('Error fetching server time, falling back to local time:', error);
            setIsOnline(false);
            return null;
        }
    };

    // Función para calcular el offset entre servidor y local
    const calculateOffset = (serverTime: Date, localTime: Date): number => {
        return serverTime.getTime() - localTime.getTime();
    };

    useEffect(() => {
        let offset = 0;
        let lastServerSync = 0;
        const SYNC_INTERVAL = 30000; // Sincronizar cada 30 segundos

        const updateTime = () => {
            const now = new Date();

            // Aplicar offset si tenemos uno válido
            const adjustedTime = new Date(now.getTime() + offset);

            const timeString = adjustedTime.toLocaleTimeString('es-ES', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            setClockState({
                currentTime: timeString,
                currentDate: adjustedTime,
            });
        };

        // Función de sincronización
        const syncWithServer = async () => {
            const serverTime = await fetchServerTime();
            if (serverTime) {
                const localTime = new Date();
                offset = calculateOffset(serverTime, localTime);
                lastServerSync = Date.now();
                console.log(`Sincronizado con servidor. Offset: ${offset}ms`);
            }
        };

        // Sincronización inicial
        syncWithServer();

        // Actualizar inmediatamente
        updateTime();

        // Configurar intervalo para actualizar cada segundo
        const timeInterval = setInterval(updateTime, 1000);

        // Configurar intervalo para sincronización periódica
        const syncInterval = setInterval(() => {
            const timeSinceLastSync = Date.now() - lastServerSync;
            if (timeSinceLastSync > SYNC_INTERVAL) {
                syncWithServer();
            }
        }, 10000); // Verificar cada 10 segundos

        return () => {
            clearInterval(timeInterval);
            clearInterval(syncInterval);
        };
    }, []);

    return {
        ...clockState,
        isOnline,
        lastSync,
    };
};
