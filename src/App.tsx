import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Zap } from "lucide-react";
import { AlarmForm } from "./components/AlarmForm";
import { AlarmStatus } from "./components/AlarmStatus";
import { ClockDisplay } from "./components/ClockDisplay";
import { Countdown } from "./components/Countdown";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAlarm } from "./hooks/useAlarm";
import { useClock } from "./hooks/useClock";

function App() {
	const clockState = useClock();
	const { alarmState, error, setAlarm, stopAlarm } = useAlarm();

	return (
		<div className="min-h-screen flex items-center justify-center p-4 relative">
			<ThemeToggle />

			{/* Elementos decorativos de fondo */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
				<div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
				<div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
				<div className="absolute bottom-40 right-1/3 w-28 h-28 bg-yellow-400/20 rounded-full blur-xl animate-pulse delay-3000"></div>
			</div>

			<div className="w-full max-w-4xl space-y-8 relative z-10">
				<Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl rounded-3xl overflow-hidden">
					<CardHeader className="text-center pb-6 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
						<CardTitle className="text-4xl font-bold flex items-center justify-center gap-4 mb-4">
							<Bell className="w-10 h-10" />
							Cronómetro de Alertas
						</CardTitle>
						<div className="flex justify-center gap-3 flex-wrap">
							<Badge
								variant="secondary"
								className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2 rounded-full"
							>
								<Zap className="w-3 h-3 mr-1" />
								Funciona en segundo plano
							</Badge>
							<Badge
								variant="secondary"
								className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm px-4 py-2 rounded-full"
							>
								<Bell className="w-3 h-3 mr-1" />
								Notificaciones disponibles
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-8 space-y-8">
						<ClockDisplay clockState={clockState} />

						<Countdown alarmState={alarmState} />

						<AlarmForm
							onSetAlarm={setAlarm}
							onStopAlarm={stopAlarm}
							isActive={alarmState.isActive}
							error={error}
						/>

						<AlarmStatus alarmState={alarmState} />
					</CardContent>
				</Card>
			</div>

			{/* Pie de página */}
			<footer className="mt-8 text-center">
				<div className="text-sm text-slate-500 dark:text-slate-400">
					Desarrollado por{" "}
					<span className="font-semibold text-slate-700 dark:text-slate-300">
						Nekzus Solutions
					</span>
				</div>
			</footer>
		</div>
	);
}

export default App;
