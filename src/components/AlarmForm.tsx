import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AlarmClock, Clock, Repeat, Settings, Timer } from "lucide-react";
import { useState } from "react";
import type { AlarmConfig, AnticipationUnit, ValidationError } from "../types";
import { TimeInput } from "./TimeInput";

interface AlarmFormProps {
	onSetAlarm: (config: AlarmConfig) => boolean;
	onStopAlarm: () => void;
	isActive: boolean;
	error: ValidationError | null;
}

export const AlarmForm: React.FC<AlarmFormProps> = ({
	onSetAlarm,
	onStopAlarm,
	isActive,
	error,
}) => {
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

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const config: AlarmConfig = {
			targetTime: {
				hour: parseInt(formData.targetHour),
				minute: parseInt(formData.targetMinute),
				second: parseInt(formData.targetSecond),
			},
			anticipationValue:
				formData.timeType === "anticipation" ? parseInt(formData.timeValue) : 0,
			anticipationUnit:
				formData.timeType === "anticipation" ? formData.timeUnit : "seconds",
			posteriorValue:
				formData.timeType === "posterior"
					? parseInt(formData.timeValue)
					: undefined,
			posteriorUnit:
				formData.timeType === "posterior" ? formData.timeUnit : undefined,
			isRepetitive: formData.isRepetitive,
			repetitiveMinutes: formData.isRepetitive
				? formData.repetitiveMinutes
				: undefined,
		};

		const success = onSetAlarm(config);
		if (success) {
			// Limpiar formulario solo si la alarma se configuró correctamente
			setFormData({
				targetHour: "",
				targetMinute: "",
				targetSecond: "",
				timeType: "anticipation",
				timeValue: "",
				timeUnit: "seconds",
				isRepetitive: false,
				repetitiveMinutes: [],
			});
		}
	};

	return (
		<Card className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 shadow-lg">
			<CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
				<CardTitle className="text-center text-lg sm:text-xl font-bold flex items-center justify-center gap-2 sm:gap-3">
					<AlarmClock className="w-5 h-5 sm:w-6 sm:h-6" />
					Configurar Alarma
				</CardTitle>
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
									id="anticipation"
									name="timeType"
									value="anticipation"
									checked={formData.timeType === "anticipation"}
									onChange={(e) =>
										handleInputChange("timeType", e.target.value)
									}
									className="w-4 h-4 text-slate-600 focus:ring-slate-500"
								/>
								<Label
									htmlFor="anticipation"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Tiempo de anticipación
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<input
									type="radio"
									id="posterior"
									name="timeType"
									value="posterior"
									checked={formData.timeType === "posterior"}
									onChange={(e) =>
										handleInputChange("timeType", e.target.value)
									}
									className="w-4 h-4 text-slate-600 focus:ring-slate-500"
								/>
								<Label
									htmlFor="posterior"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Tiempo posterior
								</Label>
							</div>
						</div>

						{/* Campos de tiempo (se muestran según la selección) */}
						<div className="grid grid-cols-2 gap-2 sm:gap-3">
							<Input
								type="number"
								min="1"
								placeholder="Cantidad"
								value={formData.timeValue}
								onChange={(e) => handleInputChange("timeValue", e.target.value)}
								className="text-center text-sm sm:text-base"
								required={formData.timeType === "anticipation"}
							/>
							<Select
								value={formData.timeUnit}
								onValueChange={(unit) => handleInputChange("timeUnit", unit)}
							>
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
								id="repetitive"
								checked={formData.isRepetitive}
								onCheckedChange={(checked) =>
									handleInputChange("isRepetitive", checked.toString())
								}
							/>
							<Label
								htmlFor="repetitive"
								className="text-xs sm:text-sm text-slate-600 dark:text-slate-300"
							>
								Repetir cada hora usando los minutos y segundos de la hora
								objetivo
							</Label>
						</div>
						{formData.isRepetitive && (
							<div className="space-y-2">
								<div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
									<div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-2">
										<strong>Base de repetición:</strong>{" "}
										{formData.targetHour.padStart(2, "0")}:
										{formData.targetMinute.padStart(2, "0")}:
										{formData.targetSecond.padStart(2, "0")}
									</div>
									<div className="text-xs text-slate-500 dark:text-slate-400">
										La alarma se repetirá cada hora a los{" "}
										{formData.targetMinute.padStart(2, "0")}:
										{formData.targetSecond.padStart(2, "0")} minutos
									</div>
									<div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
										Ejemplo: {formData.targetHour.padStart(2, "0")}:
										{formData.targetMinute.padStart(2, "0")}:
										{formData.targetSecond.padStart(2, "0")},{" "}
										{(parseInt(formData.targetHour) + 1)
											.toString()
											.padStart(2, "0")}
										:{formData.targetMinute.padStart(2, "0")}:
										{formData.targetSecond.padStart(2, "0")}, etc.
									</div>
								</div>

								{/* Selector de horas para repetir */}
								<div className="space-y-2">
									<Label className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
										Seleccionar horas para repetir (opcional - si no selecciona
										ninguna, se repetirá en todas las horas)
									</Label>
									<div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-1 sm:gap-2">
										{Array.from({ length: 24 }, (_, i) => (
											<button
												key={i}
												type="button"
												onClick={() => {
													const hours = formData.repetitiveMinutes; // Reutilizamos este array para las horas
													const newHours = hours.includes(i)
														? hours.filter((h) => h !== i)
														: [...hours, i];
													handleInputChange(
														"repetitiveMinutes",
														JSON.stringify(newHours),
													);
												}}
												className={`p-1 sm:p-2 text-xs rounded border transition-all duration-200 ${
													formData.repetitiveMinutes.includes(i)
														? "bg-slate-600 text-white border-slate-600 shadow-md"
														: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-sm"
												}`}
											>
												{i.toString().padStart(2, "0")}
											</button>
										))}
									</div>
									{formData.repetitiveMinutes.length > 0 && (
										<div className="text-xs text-slate-500 dark:text-slate-400">
											Horas seleccionadas: {formData.repetitiveMinutes.length}{" "}
											de 24
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
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
