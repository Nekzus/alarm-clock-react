import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AlarmClock, Settings } from "lucide-react";
import { useState } from "react";
import type { AlarmConfig, AnticipationUnit, ValidationError } from "../types";

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
		anticipationValue: "",
		anticipationUnit: "seconds" as AnticipationUnit,
		posteriorValue: "",
		posteriorUnit: "seconds" as AnticipationUnit,
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
			anticipationValue: parseInt(formData.anticipationValue),
			anticipationUnit: formData.anticipationUnit,
			posteriorValue: formData.posteriorValue
				? parseInt(formData.posteriorValue)
				: undefined,
			posteriorUnit: formData.posteriorValue
				? formData.posteriorUnit
				: undefined,
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
				anticipationValue: "",
				anticipationUnit: "seconds",
				posteriorValue: "",
				posteriorUnit: "seconds",
				isRepetitive: false,
				repetitiveMinutes: [],
			});
		}
	};

	return (
		<Card className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-2 border-slate-200 dark:border-slate-600 shadow-xl">
			<CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-t-lg">
				<CardTitle className="text-center text-2xl font-bold flex items-center justify-center gap-3">
					<AlarmClock className="w-6 h-6" />
					Configurar Alarma
				</CardTitle>
			</CardHeader>
			<CardContent className="p-8">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Hora objetivo */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 mb-3">
							<Clock className="w-5 h-5 text-slate-600 dark:text-slate-300" />
							<Label className="text-base font-medium text-slate-700 dark:text-slate-200">
								Hora objetivo
							</Label>
						</div>
						<div className="grid grid-cols-3 gap-3">
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

					{/* Tiempo de anticipación */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 mb-3">
							<Timer className="w-5 h-5 text-slate-600 dark:text-slate-300" />
							<Label className="text-base font-medium text-slate-700 dark:text-slate-200">
								Tiempo de anticipación
							</Label>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Input
								type="number"
								min="1"
								placeholder="Cantidad"
								value={formData.anticipationValue}
								onChange={(e) =>
									handleInputChange("anticipationValue", e.target.value)
								}
								className="text-center text-lg"
								required
							/>
							<Select
								value={formData.anticipationUnit}
								onValueChange={(value) =>
									handleInputChange("anticipationUnit", value)
								}
							>
								<SelectTrigger className="text-center text-lg">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="seconds">Segundos</SelectItem>
									<SelectItem value="minutes">Minutos</SelectItem>
									<SelectItem value="hours">Horas</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Tiempo posterior */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 mb-3">
							<AlarmClock className="w-5 h-5 text-slate-600 dark:text-slate-300" />
							<Label className="text-base font-medium text-slate-700 dark:text-slate-200">
								Tiempo posterior (opcional)
							</Label>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<Input
								type="number"
								min="1"
								placeholder="Cantidad"
								value={formData.posteriorValue}
								onChange={(e) =>
									handleInputChange("posteriorValue", e.target.value)
								}
								className="text-center text-lg"
							/>
							<Select
								value={formData.posteriorUnit}
								onValueChange={(value) =>
									handleInputChange("posteriorUnit", value)
								}
							>
								<SelectTrigger className="text-center text-lg">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="seconds">Segundos</SelectItem>
									<SelectItem value="minutes">Minutos</SelectItem>
									<SelectItem value="hours">Horas</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Alarma repetitiva */}
					<div className="space-y-3">
						<div className="flex items-center gap-2 mb-3">
							<Repeat className="w-5 h-5 text-slate-600 dark:text-slate-300" />
							<Label className="text-base font-medium text-slate-700 dark:text-slate-200">
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
								className="text-sm text-slate-600 dark:text-slate-300"
							>
								Repetir cada hora en los minutos seleccionados
							</Label>
						</div>
						{formData.isRepetitive && (
							<div className="space-y-2">
								<Label className="text-sm text-slate-600 dark:text-slate-300">
									Seleccionar minutos (ej: 00:10, 01:10, 02:10...)
								</Label>
								<div className="grid grid-cols-6 gap-2">
									{Array.from({ length: 60 }, (_, i) => (
										<button
											key={i}
											type="button"
											onClick={() => {
												const minutes = formData.repetitiveMinutes;
												const newMinutes = minutes.includes(i)
													? minutes.filter((m) => m !== i)
													: [...minutes, i];
												handleInputChange(
													"repetitiveMinutes",
													JSON.stringify(newMinutes),
												);
											}}
											className={`p-2 text-xs rounded border ${
												formData.repetitiveMinutes.includes(i)
													? "bg-slate-600 text-white border-slate-600"
													: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600"
											}`}
										>
											{i.toString().padStart(2, "0")}
										</button>
									))}
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

					<div className="flex gap-4 justify-center pt-6">
						{!isActive ? (
							<Button
								type="submit"
								size="lg"
								className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 rounded-full"
							>
								<Settings className="w-5 h-5 mr-2" />
								Configurar Alarma
							</Button>
						) : (
							<Button
								type="button"
								onClick={onStopAlarm}
								size="lg"
								variant="destructive"
								className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 rounded-full"
							>
								<AlarmClock className="w-5 h-5 mr-2" />
								Detener Alarma
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
