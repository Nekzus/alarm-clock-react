import { AlarmClock, Clock, Repeat, Settings, Timer } from "lucide-react";
import { useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlarmForm } from "../hooks/useAlarmForm";
import type { AlarmConfig, ValidationError } from "../types";
import { NumberInput } from "./NumberInput";
import { TimeInput } from "./TimeInput";

interface AlarmFormProps {
  onSetAlarm: (config: AlarmConfig) => boolean;
  onStopAlarm: () => void;
  onRepeatAlarm: () => boolean;
  isActive: boolean;
  error: ValidationError | null;
  lastAlarmConfig: AlarmConfig | null;
}

export const AlarmForm: React.FC<AlarmFormProps> = ({
  onSetAlarm,
  onStopAlarm,
  onRepeatAlarm,
  isActive,
  error,
  lastAlarmConfig,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form component naturally has high complexity
}) => {
  const anticipationId = useId();
  const posteriorId = useId();
  const repetitiveId = useId();

  const {
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleUnitChange,
    handleHourSelection,
    handleSubmit,
  } = useAlarmForm(onSetAlarm);

  return (
    <Card className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
        <CardTitle className="text-center text-lg sm:text-xl font-bold flex items-center justify-center gap-2 sm:gap-3">
          <AlarmClock className="w-5 h-5 sm:w-6 sm:h-6" />
          Configurar Alarma
        </CardTitle>

        {/* Indicador de configuración guardada */}
        {lastAlarmConfig && (
          <div className="mt-3 p-2 bg-white/20 rounded-lg border border-white/30">
            <div className="text-xs sm:text-sm text-center">
              <div className="font-medium mb-1">📋 Última configuración guardada:</div>
              <div className="text-white/90">
                {lastAlarmConfig.targetTime.hour.toString().padStart(2, "0")}:
                {lastAlarmConfig.targetTime.minute.toString().padStart(2, "0")}:
                {lastAlarmConfig.targetTime.second.toString().padStart(2, "0")}
                {lastAlarmConfig.anticipationValue > 0 && (
                  <span>
                    {" "}
                    - {lastAlarmConfig.anticipationValue} {lastAlarmConfig.anticipationUnit}
                  </span>
                )}
                {lastAlarmConfig.isRepetitive && <span className="ml-1">🔄</span>}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Hora objetivo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              <Label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                Hora objetivo
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <TimeInput
                label="Hora"
                value={formData.targetHour}
                onChange={(value) => handleInputChange("targetHour", value)}
                min={0}
                max={23}
                placeholder="HH"
              />
              <TimeInput
                label="Minutos"
                value={formData.targetMinute}
                onChange={(value) => handleInputChange("targetMinute", value)}
                min={0}
                max={59}
                placeholder="MM"
              />
              <TimeInput
                label="Segundos"
                value={formData.targetSecond}
                onChange={(value) => handleInputChange("targetSecond", value)}
                min={0}
                max={59}
                placeholder="SS"
              />
            </div>
          </div>

          {/* Selector de tipo de tiempo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              <Label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                Configuración de tiempo
              </Label>
            </div>

            {/* Radio buttons para seleccionar tipo */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={anticipationId}
                  name="timeType"
                  value="anticipation"
                  checked={formData.timeType === "anticipation"}
                  onChange={(e) => handleInputChange("timeType", e.target.value)}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <Label
                  htmlFor={anticipationId}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tiempo de anticipación
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={posteriorId}
                  name="timeType"
                  value="posterior"
                  checked={formData.timeType === "posterior"}
                  onChange={(e) => handleInputChange("timeType", e.target.value)}
                  className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                />
                <Label
                  htmlFor={posteriorId}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tiempo posterior
                </Label>
              </div>
            </div>

            {/* Campos de tiempo (se muestran según la selección) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <NumberInput
                value={formData.timeValue}
                onChange={(value) => handleInputChange("timeValue", value)}
                min={1}
                max={formData.timeUnit === "hours" ? 23 : 59}
                placeholder="Cantidad"
                required={formData.timeType === "anticipation"}
              />
              <Select value={formData.timeUnit} onValueChange={handleUnitChange}>
                <SelectTrigger className="text-center text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Segundos</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción del tipo seleccionado */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formData.timeType === "anticipation"
                ? "La alarma se activará antes del tiempo objetivo"
                : "La alarma se activará después del tiempo objetivo"}
            </div>
          </div>

          {/* Alarma repetitiva */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
              <Label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
                Alarma repetitiva
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={repetitiveId}
                checked={formData.isRepetitive}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                htmlFor={repetitiveId}
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-300"
              >
                Repetir cada hora usando los minutos y segundos de la hora objetivo
              </Label>
            </div>
            {formData.isRepetitive && (
              <div className="space-y-2">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <strong>Base de repetición:</strong>{" "}
                    {(formData.targetHour || "0").padStart(2, "0")}:
                    {(formData.targetMinute || "0").padStart(2, "0")}:
                    {(formData.targetSecond || "0").padStart(2, "0")}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    La alarma se repetirá cada hora a los{" "}
                    {(formData.targetMinute || "0").padStart(2, "0")}:
                    {(formData.targetSecond || "0").padStart(2, "0")} minutos
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Ejemplo: {(formData.targetHour || "0").padStart(2, "0")}:
                    {(formData.targetMinute || "0").padStart(2, "0")}:
                    {(formData.targetSecond || "0").padStart(2, "0")},{" "}
                    {(parseInt(formData.targetHour || "0", 10) + 1).toString().padStart(2, "0")}:
                    {(formData.targetMinute || "0").padStart(2, "0")}:
                    {(formData.targetSecond || "0").padStart(2, "0")}, etc.
                  </div>
                </div>

                {/* Selector de horas para repetir */}
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Seleccionar horas para repetir (opcional - si no selecciona ninguna, se repetirá
                    en todas las horas)
                  </Label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-1 sm:gap-2">
                    {Array.from({ length: 24 }, (_, i) => {
                      const isSelected = formData.repetitiveMinutes.includes(i);
                      return (
                        <button
                          // biome-ignore lint/suspicious/noArrayIndexKey: Hour buttons are static and don't change order
                          key={`hour-${i}`}
                          type="button"
                          onClick={() => handleHourSelection(i)}
                          className={`p-1 sm:p-2 text-xs rounded border transition-all duration-200 ${
                            isSelected
                              ? "bg-slate-600 text-white border-slate-600 shadow-md"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-sm"
                          }`}
                        >
                          {i.toString().padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                  {formData.repetitiveMinutes.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Horas seleccionadas: {formData.repetitiveMinutes.length} de 24
                    </div>
                  )}
                  {formData.repetitiveMinutes.length === 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Se repetirá en todas las horas del día
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 sm:gap-4 justify-center pt-4 sm:pt-6">
            {!isActive ? (
              <Button
                type="submit"
                size="sm"
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Configurar Alarma</span>
                <span className="sm:hidden">Configurar</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onStopAlarm}
                size="sm"
                variant="destructive"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full"
              >
                <AlarmClock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Detener Alarma</span>
                <span className="sm:hidden">Detener</span>
              </Button>
            )}

            {/* Botón de repetir última configuración */}
            {lastAlarmConfig && !isActive && (
              <Button
                type="button"
                onClick={onRepeatAlarm}
                size="sm"
                variant="outline"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full border-blue-400"
              >
                <Repeat className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Repetir Última Alarma</span>
                <span className="sm:hidden">Repetir</span>
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Exportación adicional para asegurar compatibilidad
export default AlarmForm;
