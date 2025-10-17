import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type React from "react";
import type { ClockState } from "../types";

interface ClockDisplayProps {
	clockState: ClockState;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({ clockState }) => {
	return (
		<Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-2xl mb-8 relative overflow-hidden hover-lift">
			<div className="absolute inset-0 bg-gradient-to-r from-slate-200/30 via-slate-300/30 to-slate-400/30 dark:from-slate-600/20 dark:via-slate-500/20 dark:to-slate-400/20 animate-pulse"></div>
			<CardContent className="p-8 text-center relative z-10">
				<div className="flex items-center justify-center gap-3 mb-6">
					<Clock className="w-8 h-8 text-slate-600 dark:text-slate-300" />
					<h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
						Hora Actual
					</h2>
				</div>
				<div className="relative mb-6">
					<div className="text-8xl font-mono font-bold text-slate-800 dark:text-slate-100 drop-shadow-lg tracking-wider">
						{clockState.currentTime}
					</div>
					<div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
				</div>
				<div className="flex flex-col items-center gap-2">
					<Badge
						variant="secondary"
						className="bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-300/80 dark:hover:bg-slate-600/80 text-sm px-6 py-3 rounded-full shadow-lg"
					>
						{clockState.currentDate.toLocaleDateString("es-ES", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</Badge>
					<div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
						Actualizado en tiempo real
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
