import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

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
			const numValue = parseInt(newValue);
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
		const numValue = parseInt(inputValue);
		if (inputValue !== "" && !isNaN(numValue)) {
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
	};

	return (
		<div className={`space-y-2 ${className}`}>
			<Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
				{label}
			</Label>
			<Input
				type="text"
				value={inputValue}
				onChange={handleChange}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={`text-center text-sm sm:text-base font-mono transition-all duration-200 ${
					isValid
						? "border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
						: "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-700"
				}`}
				maxLength={2}
			/>
			{!isValid && (
				<p className="text-xs text-red-500 animate-pulse">
					Debe ser un número entre {min} y {max}
				</p>
			)}
		</div>
	);
};
