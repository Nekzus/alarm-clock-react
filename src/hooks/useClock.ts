import { useEffect, useState } from 'react';
import type { ClockState } from '../types';

export const useClock = () => {
    const [clockState, setClockState] = useState<ClockState>({
        currentTime: '--:--:--',
        currentDate: new Date(),
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-ES', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            setClockState({
                currentTime: timeString,
                currentDate: now,
            });
        };

        // Actualizar inmediatamente
        updateTime();

        // Configurar intervalo para actualizar cada segundo
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return clockState;
};
