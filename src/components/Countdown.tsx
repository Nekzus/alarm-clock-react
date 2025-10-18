import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Timer } from "lucide-react";
import type React from "react";
import type { AlarmState } from "../types";

interface CountdownProps {
	alarmState: AlarmState;
}

export const Countdown: React.FC<CountdownProps> = ({ alarmState }) => {
	if (!alarmState.isActive || !alarmState.countdown) {
		return null;
	}

	const { hours, minutes, seconds } = alarmState.countdown;

	// Validar que los valores sean números válidos
	if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
		console.warn("Countdown values are NaN:", { hours, minutes, seconds });
		return null;
	}

	return (
		<Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 shadow-lg relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-red-200/30 via-orange-200/30 to-yellow-200/30 dark:from-red-800/20 dark:via-orange-800/20 dark:to-yellow-800/20 animate-pulse"></div>
			<CardContent className="p-4 sm:p-6 text-center relative z-10">
				<div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
					<Timer className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
					<h3 className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-300">
						Cuenta regresiva
					</h3>
				</div>
				<div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-red-800 dark:text-red-200 mb-4 drop-shadow-sm tracking-wider">
					{hours.toString().padStart(2, "0")}:
					{minutes.toString().padStart(2, "0")}:
					{seconds.toString().padStart(2, "0")}
				</div>
				<Badge
					variant="secondary"
					className="bg-red-100/80 dark:bg-red-900/80 text-red-700 dark:text-red-200 border-red-200 dark:border-red-700 hover:bg-red-200/80 dark:hover:bg-red-800/80 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg"
				>
					Hacia las{" "}
					{alarmState.targetTime?.toLocaleTimeString("es-ES", {
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					})}
				</Badge>
			</CardContent>
		</Card>
	);
};
