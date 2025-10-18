import { useCallback, useEffect, useRef, useState } from "react";
import type { AlarmConfig, AlarmState, TimeInput, ValidationError } from "../types";

export const useAlarm = () => {
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isActive: false,
    alarmTime: null,
    alarmTimes: [],
    targetTime: null,
    countdown: null,
    isRepetitive: false,
    currentAlarmIndex: 0,
  });

  const [error, setError] = useState<ValidationError | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [alarmType, setAlarmType] = useState<"anticipation" | "posterior" | undefined>(undefined);
  const [lastAlarmConfig, setLastAlarmConfig] = useState<AlarmConfig | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    try {
      audioContextRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    } catch {
      console.warn("Audio context no disponible");
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const validateTimeInput = useCallback((time: TimeInput): ValidationError | null => {
    if (time.hour < 0 || time.hour > 23) {
      return { field: "hour", message: "La hora debe estar entre 0 y 23" };
    }
    if (time.minute < 0 || time.minute > 59) {
      return { field: "minute", message: "Los minutos deben estar entre 0 y 59" };
    }
    if (time.second < 0 || time.second > 59) {
      return { field: "second", message: "Los segundos deben estar entre 0 y 59" };
    }
    return null;
  }, []);

  const calculateAlarmTime = useCallback((config: AlarmConfig): Date => {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(
      config.targetTime.hour,
      config.targetTime.minute,
      config.targetTime.second,
      0
    );

    // Si la hora objetivo ya pasó hoy, configurar para mañana
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Calcular tiempo de anticipación o posterior en milisegundos
    let timeMs = 0;

    if (config.anticipationValue > 0) {
      // Tiempo de anticipación
      timeMs = config.anticipationValue;
      switch (config.anticipationUnit) {
        case "seconds":
          timeMs *= 1000;
          break;
        case "minutes":
          timeMs *= 60 * 1000;
          break;
        case "hours":
          timeMs *= 60 * 60 * 1000;
          break;
      }
      return new Date(targetDate.getTime() - timeMs);
    } else if (config.posteriorValue && config.posteriorValue > 0) {
      // Tiempo posterior
      timeMs = config.posteriorValue;
      switch (config.posteriorUnit) {
        case "seconds":
          timeMs *= 1000;
          break;
        case "minutes":
          timeMs *= 60 * 1000;
          break;
        case "hours":
          timeMs *= 60 * 60 * 1000;
          break;
      }
      return new Date(targetDate.getTime() + timeMs);
    }

    // Fallback: si no hay tiempo configurado, usar la hora objetivo
    return targetDate;
  }, []);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Repetitive alarm calculation logic naturally has high complexity
  const calculateRepetitiveAlarmTimes = useCallback((config: AlarmConfig): Date[] => {
    const now = new Date();
    const alarmTimes: Date[] = [];

    // Calcular tiempo de anticipación o posterior en milisegundos
    let timeMs = 0;

    if (config.anticipationValue > 0) {
      // Tiempo de anticipación
      timeMs = config.anticipationValue;
      switch (config.anticipationUnit) {
        case "seconds":
          timeMs *= 1000;
          break;
        case "minutes":
          timeMs *= 60 * 1000;
          break;
        case "hours":
          timeMs *= 60 * 60 * 1000;
          break;
      }
    } else if (config.posteriorValue && config.posteriorValue > 0) {
      // Tiempo posterior
      timeMs = config.posteriorValue;
      switch (config.posteriorUnit) {
        case "seconds":
          timeMs *= 1000;
          break;
        case "minutes":
          timeMs *= 60 * 1000;
          break;
        case "hours":
          timeMs *= 60 * 60 * 1000;
          break;
      }
    }

    // Si hay horas específicas seleccionadas, usar solo esas
    const hoursToUse =
      config.repetitiveMinutes && config.repetitiveMinutes.length > 0
        ? config.repetitiveMinutes
        : Array.from({ length: 24 }, (_, i) => i);

    // Calcular alarmas para las próximas 24 horas
    for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
      for (const hour of hoursToUse) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);
        targetDate.setHours(hour, config.targetTime.minute, config.targetTime.second, 0);

        let alarmTime: Date;
        if (config.anticipationValue > 0) {
          // Tiempo de anticipación: alarma antes del tiempo objetivo
          alarmTime = new Date(targetDate.getTime() - timeMs);
        } else if (config.posteriorValue && config.posteriorValue > 0) {
          // Tiempo posterior: alarma después del tiempo objetivo
          alarmTime = new Date(targetDate.getTime() + timeMs);
        } else {
          // Fallback: usar la hora objetivo
          alarmTime = targetDate;
        }

        // Solo agregar alarmas futuras
        if (alarmTime > now) {
          alarmTimes.push(alarmTime);
        }
      }
    }

    // Ordenar por tiempo y tomar solo las próximas 24 alarmas
    return alarmTimes.sort((a, b) => a.getTime() - b.getTime()).slice(0, 24);
  }, []);

  const stopAlarm = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setAlarmState({
      isActive: false,
      alarmTime: null,
      alarmTimes: [],
      targetTime: null,
      countdown: null,
      isRepetitive: false,
      currentAlarmIndex: 0,
    });

    setError(null);
  }, []);

  const triggerAlarm = useCallback(() => {
    // Mostrar modal de alarma primero
    setShowAlarmModal(true);
    setAlarmType("anticipation");

    setAlarmState((prev) => {
      const hasMoreAlarms =
        prev.isRepetitive && prev.alarmTimes.length > prev.currentAlarmIndex + 1;

      if (hasMoreAlarms) {
        const nextIndex = prev.currentAlarmIndex + 1;
        const nextAlarmTime = prev.alarmTimes[nextIndex];
        const isLastAlarm = nextIndex >= prev.alarmTimes.length - 1;

        if (isLastAlarm && countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }

        return {
          ...prev,
          alarmTime: nextAlarmTime,
          currentAlarmIndex: nextIndex,
          countdown: null,
        };
      }

      // No hay más alarmas, pausar completamente
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      return {
        ...prev,
        isActive: false,
        countdown: null,
      };
    });
  }, []);

  const updateCountdown = useCallback(() => {
    setAlarmState((prev) => {
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
        countdown: { hours, minutes, seconds },
      };
    });
  }, [triggerAlarm]);

  const setAlarm = useCallback(
    (config: AlarmConfig) => {
      setError(null);

      // Validar entrada
      const validationError = validateTimeInput(config.targetTime);
      if (validationError) {
        setError(validationError);
        return false;
      }

      // Validar que al menos uno de los tiempos (anticipación o posterior) sea mayor a 0
      if (config.anticipationValue <= 0 && (!config.posteriorValue || config.posteriorValue <= 0)) {
        setError({
          field: "anticipation",
          message: "El tiempo de anticipación o posterior debe ser mayor a 0",
        });
        return false;
      }

      // Calcular tiempo de alarma
      let alarmTime: Date;
      let alarmTimes: Date[] = [];
      let isRepetitive = false;

      if (config.isRepetitive) {
        // Para alarmas repetitivas, calcular múltiples tiempos
        alarmTimes = calculateRepetitiveAlarmTimes(config);
        if (alarmTimes.length === 0) {
          setError({
            field: "time",
            message: "No hay alarmas futuras disponibles con la configuración repetitiva.",
          });
          return false;
        }
        alarmTime = alarmTimes[0]; // Usar la primera alarma para el countdown
        isRepetitive = true;
      } else {
        // Para alarmas normales
        alarmTime = calculateAlarmTime(config);
      }

      const now = new Date();

      // Verificar que la alarma no sea en el pasado
      if (alarmTime <= now) {
        setError({
          field: "time",
          message: "La alarma configurada ya pasó. Intenta con una hora futura.",
        });
        return false;
      }

      // Crear fecha objetivo para mostrar
      const targetDate = new Date();
      targetDate.setHours(
        config.targetTime.hour,
        config.targetTime.minute,
        config.targetTime.second,
        0
      );
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      setAlarmState({
        isActive: true,
        alarmTime,
        alarmTimes,
        targetTime: targetDate,
        countdown: null,
        isRepetitive,
        currentAlarmIndex: 0,
      });

      // Guardar la configuración para poder repetirla
      setLastAlarmConfig(config);

      return true;
    },
    [validateTimeInput, calculateAlarmTime, calculateRepetitiveAlarmTimes]
  );

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

  const repeatLastAlarm = useCallback(() => {
    if (lastAlarmConfig) {
      return setAlarm(lastAlarmConfig);
    }
    return false;
  }, [lastAlarmConfig, setAlarm]);

  return {
    alarmState,
    error,
    setAlarm,
    stopAlarm,
    showAlarmModal,
    alarmType,
    closeAlarmModal,
    lastAlarmConfig,
    repeatLastAlarm,
  };
};
