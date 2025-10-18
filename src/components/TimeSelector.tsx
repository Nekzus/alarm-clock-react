import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeSelectorProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  required?: boolean;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  icon,
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const getMinMax = () => {
    switch (unit) {
      case "seconds":
        return { min: 1, max: 59 };
      case "minutes":
        return { min: 1, max: 59 };
      case "hours":
        return { min: 1, max: 23 };
      default:
        return { min: 1, max: 59 };
    }
  };

  const { min, max } = getMinMax();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validar que sea un número
    if (newValue === "" || /^\d+$/.test(newValue)) {
      const numValue = parseInt(newValue, 10);
      if (newValue === "" || (numValue >= min && numValue <= max)) {
        setIsValid(true);
        onValueChange(newValue);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  };

  const handleBlur = () => {
    // Asegurar que el valor esté en el rango correcto
    const numValue = parseInt(inputValue, 10);
    if (inputValue !== "" && !Number.isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      setInputValue(clampedValue.toString());
      onValueChange(clampedValue.toString());
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir solo números, backspace, delete, tab, escape, enter
    if (
      !/[0-9]/.test(e.key) &&
      ![
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }

    // Manejar flechas arriba y abajo
    if (e.key === "ArrowUp") {
      e.preventDefault();
      increment();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      decrement();
    }
  };

  const increment = () => {
    const currentValue = parseInt(inputValue, 10) || min;
    const newValue = currentValue >= max ? min : currentValue + 1;
    setInputValue(newValue.toString());
    onValueChange(newValue.toString());
    setIsValid(true);
  };

  const decrement = () => {
    const currentValue = parseInt(inputValue, 10) || min;
    const newValue = currentValue <= min ? max : currentValue - 1;
    setInputValue(newValue.toString());
    onValueChange(newValue.toString());
    setIsValid(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <Label className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200">
          {label}
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Input con incrementadores */}
        <div className="relative">
          <Input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Cantidad"
            className={`text-center text-sm sm:text-base font-mono transition-all duration-200 pr-8 ${
              isValid
                ? "border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
                : "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-700"
            }`}
            required={required}
          />
          <div className="absolute right-1 top-0 h-full flex flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={increment}
              className="h-1/2 p-0 w-6 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none rounded-t-sm"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={decrement}
              className="h-1/2 p-0 w-6 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none rounded-b-sm"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Selector de unidad */}
        <Select value={unit} onValueChange={onUnitChange}>
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

      {/* Información del rango */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Rango: {min} - {max}{" "}
        {unit === "seconds" ? "segundos" : unit === "minutes" ? "minutos" : "horas"}
      </div>

      {!isValid && (
        <p className="text-xs text-red-500 animate-pulse">
          Debe ser un número entre {min} y {max}
        </p>
      )}
    </div>
  );
};
