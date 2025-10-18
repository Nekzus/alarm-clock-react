import { useCallback, useEffect, useRef, useState } from 'react';
import type { AlarmConfig, AlarmState, TimeInput, ValidationError } from '../types';

export const useAlarm = () => {
    const [alarmState, setAlarmState] = useState<AlarmState>({
        isActive: false,
        alarmTime: null,
        targetTime: null,
        countdown: null,
    });

    const [error, setError] = useState<ValidationError | null>(null);
    const [showAlarmModal, setShowAlarmModal] = useState(false);
    const [alarmType, setAlarmType] = useState<"anticipation" | "posterior" | undefined>(undefined);
    const audioContextRef = useRef<AudioContext | null>(null);
    const countdownIntervalRef = useRef<number | null>(null);

    // Inicializar AudioContext
    useEffect(() => {
        try {
            audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        } catch {
            console.warn('Audio context no disponible');
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Solicitar permisos de notificación
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const validateTimeInput = useCallback((time: TimeInput): ValidationError | null => {
        if (time.hour < 0 || time.hour > 23) {
            return { field: 'hour', message: 'La hora debe estar entre 0 y 23' };
        }
        if (time.minute < 0 || time.minute > 59) {
            return { field: 'minute', message: 'Los minutos deben estar entre 0 y 59' };
        }
        if (time.second < 0 || time.second > 59) {
            return { field: 'second', message: 'Los segundos deben estar entre 0 y 59' };
        }
        return null;
    }, []);

    const calculateAlarmTime = useCallback((config: AlarmConfig): Date => {
        const now = new Date();
        const targetDate = new Date();
        targetDate.setHours(config.targetTime.hour, config.targetTime.minute, config.targetTime.second, 0);

        // Si la hora objetivo ya pasó hoy, configurar para mañana
        if (targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        // Calcular tiempo de anticipación en milisegundos
        let anticipationMs = config.anticipationValue;
        switch (config.anticipationUnit) {
            case 'seconds':
                anticipationMs *= 1000;
                break;
            case 'minutes':
                anticipationMs *= 60 * 1000;
                break;
            case 'hours':
                anticipationMs *= 60 * 60 * 1000;
                break;
        }

        return new Date(targetDate.getTime() - anticipationMs);
    }, []);

    const playAlarmSound = useCallback(() => {
        if (!audioContextRef.current) return;

        try {
            const playBeep = (frequency: number, startTime: number) => {
                const audioContext = audioContextRef.current;
                if (!audioContext) return;

                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, startTime);
                oscillator.frequency.setValueAtTime(frequency + 200, startTime + 0.1);
                oscillator.frequency.setValueAtTime(frequency, startTime + 0.2);

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.5);
            };

            const audioContext = audioContextRef.current;
            if (!audioContext) return;

            const currentTime = audioContext.currentTime;

            // Reproducir 3 pitidos
            playBeep(800, currentTime);
            playBeep(800, currentTime + 0.6);
            playBeep(800, currentTime + 1.2);

        } catch (e) {
            console.warn('Error reproduciendo sonido:', e);
        }
    }, []);

    const showNotification = useCallback(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('¡Alarma!', {
                    body: '¡Es hora de tu alarma configurada!',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                });
            }
        }

        // Mostrar alerta visual como fallback
        alert('🚨 ¡ALARMA! 🚨\n\n¡Es hora de tu alarma configurada!');
    }, []);

    const stopAlarm = useCallback(() => {
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        setAlarmState({
            isActive: false,
            alarmTime: null,
            targetTime: null,
            countdown: null,
        });

        setError(null);
    }, []);

    const triggerAlarm = useCallback(() => {
        // Mostrar modal de alarma
        setShowAlarmModal(true);
        setAlarmType(alarmState.targetTime ? "anticipation" : "posterior");

        // Detener la alarma
        stopAlarm();
    }, [stopAlarm, alarmState.targetTime]);

    const updateCountdown = useCallback(() => {
        setAlarmState(prev => {
            if (!prev.alarmTime) return prev;

            const now = new Date();
            const timeDiff = prev.alarmTime.getTime() - now.getTime();

            if (timeDiff <= 0) {
                // Programar la activación de la alarma para el siguiente tick
                setTimeout(() => triggerAlarm(), 0);
                return prev;
            }

            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            return {
                ...prev,
                countdown: { hours, minutes, seconds }
            };
        });
    }, [triggerAlarm]);

    const setAlarm = useCallback((config: AlarmConfig) => {
        setError(null);

        // Validar entrada
        const validationError = validateTimeInput(config.targetTime);
        if (validationError) {
            setError(validationError);
            return false;
        }

        if (config.anticipationValue <= 0) {
            setError({ field: 'anticipation', message: 'El tiempo de anticipación debe ser mayor a 0' });
            return false;
        }

        // Calcular tiempo de alarma
        const alarmTime = calculateAlarmTime(config);
        const now = new Date();

        // Verificar que la alarma no sea en el pasado
        if (alarmTime <= now) {
            setError({ field: 'time', message: 'La alarma configurada ya pasó. Intenta con una hora futura.' });
            return false;
        }

        // Crear fecha objetivo para mostrar
        const targetDate = new Date();
        targetDate.setHours(config.targetTime.hour, config.targetTime.minute, config.targetTime.second, 0);
        if (targetDate <= now) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        setAlarmState({
            isActive: true,
            alarmTime,
            targetTime: targetDate,
            countdown: null,
        });

        return true;
    }, [validateTimeInput, calculateAlarmTime]);

    // Efecto para manejar la cuenta regresiva
    useEffect(() => {
        if (alarmState.isActive && alarmState.alarmTime) {
            updateCountdown();
            countdownIntervalRef.current = setInterval(updateCountdown, 1000);
        } else {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        }

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [alarmState.isActive, alarmState.alarmTime, updateCountdown]);

    const closeAlarmModal = useCallback(() => {
        setShowAlarmModal(false);
        setAlarmType(undefined);
    }, []);

    return {
        alarmState,
        error,
        setAlarm,
        stopAlarm,
        showAlarmModal,
        alarmType,
        closeAlarmModal,
    };
};
