import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 59,
  placeholder = "00",
  className = "",
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validar que sea un número
    if (newValue === "" || /^\d+$/.test(newValue)) {
      const numValue = parseInt(newValue, 10);
      if (newValue === "" || (numValue >= min && numValue <= max)) {
        setIsValid(true);
        onChange(newValue);
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
      const paddedValue = clampedValue.toString().padStart(2, "0");
      setInputValue(paddedValue);
      onChange(paddedValue);
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
    const currentValue = parseInt(inputValue, 10) || 0;
    const newValue = currentValue >= max ? min : currentValue + 1;
    const paddedValue = newValue.toString().padStart(2, "0");
    setInputValue(paddedValue);
    onChange(paddedValue);
    setIsValid(true);
  };

  const decrement = () => {
    const currentValue = parseInt(inputValue, 10) || 0;
    const newValue = currentValue <= min ? max : currentValue - 1;
    const paddedValue = newValue.toString().padStart(2, "0");
    setInputValue(paddedValue);
    onChange(paddedValue);
    setIsValid(true);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </Label>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`text-center text-sm sm:text-base font-mono transition-all duration-200 pr-8 ${
            isValid
              ? "border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
              : "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-700"
          }`}
          maxLength={2}
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
      {!isValid && (
        <p className="text-xs text-red-500 animate-pulse">
          Debe ser un número entre {min} y {max}
        </p>
      )}
    </div>
  );
};
