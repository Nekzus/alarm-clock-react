import React, { useCallback, useRef, useState } from "react";
import type { AlarmConfig, AnticipationUnit } from "../types";

export const useAlarmForm = (onSetAlarm: (config: AlarmConfig) => boolean) => {
  const onSetAlarmRef = useRef(onSetAlarm);

  // Update ref only when onSetAlarm changes
  React.useEffect(() => {
    onSetAlarmRef.current = onSetAlarm;
  }, [onSetAlarm]);
  const [formData, setFormData] = useState({
    targetHour: "",
    targetMinute: "",
    targetSecond: "",
    timeType: "anticipation" as "anticipation" | "posterior",
    timeValue: "",
    timeUnit: "seconds" as AnticipationUnit,
    isRepetitive: false,
    repetitiveMinutes: [] as number[],
  });

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, isRepetitive: checked }));
  }, []);

  const handleUnitChange = useCallback((unit: string) => {
    setFormData((prev) => ({
      ...prev,
      timeUnit: unit as AnticipationUnit,
      timeValue: "1",
    }));
  }, []);

  const handleHourSelection = useCallback((hour: number) => {
    setFormData((prev) => {
      const currentHours = prev.repetitiveMinutes;
      const isSelected = currentHours.includes(hour);
      const newHours = isSelected
        ? currentHours.filter((h) => h !== hour)
        : [...currentHours, hour];
      return { ...prev, repetitiveMinutes: newHours };
    });
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form submission logic naturally has high complexity
    setFormData((currentFormData) => {
      const config: AlarmConfig = {
        targetTime: {
          hour: parseInt(currentFormData.targetHour, 10),
          minute: parseInt(currentFormData.targetMinute, 10),
          second: parseInt(currentFormData.targetSecond, 10),
        },
        anticipationValue:
          currentFormData.timeType === "anticipation" ? parseInt(currentFormData.timeValue, 10) : 0,
        anticipationUnit:
          currentFormData.timeType === "anticipation" ? currentFormData.timeUnit : "seconds",
        posteriorValue:
          currentFormData.timeType === "posterior"
            ? parseInt(currentFormData.timeValue, 10)
            : undefined,
        posteriorUnit:
          currentFormData.timeType === "posterior" ? currentFormData.timeUnit : undefined,
        isRepetitive: currentFormData.isRepetitive,
        repetitiveMinutes: currentFormData.isRepetitive
          ? currentFormData.repetitiveMinutes
          : undefined,
      };

      const success = onSetAlarmRef.current(config);
      if (success) {
        return {
          targetHour: "",
          targetMinute: "",
          targetSecond: "",
          timeType: "anticipation",
          timeValue: "",
          timeUnit: "seconds",
          isRepetitive: false,
          repetitiveMinutes: [],
        };
      }
      return currentFormData;
    });
  }, []);

  return {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleUnitChange,
    handleHourSelection,
    handleSubmit,
  };
};
