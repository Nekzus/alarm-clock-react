import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Zap } from "lucide-react";
import { AlarmForm } from "./components/AlarmForm";
import { AlarmModal } from "./components/AlarmModal";
import { AlarmStatus } from "./components/AlarmStatus";
import { ClockDisplay } from "./components/ClockDisplay";
import { Countdown } from "./components/Countdown";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAlarm } from "./hooks/useAlarm";
import { useClock } from "./hooks/useClock";

function App() {
	const clockState = useClock();
	const {
		alarmState,
		error,
		setAlarm,
		stopAlarm,
		showAlarmModal,
		alarmType,
		closeAlarmModal,
		lastAlarmConfig,
		repeatLastAlarm,
	} = useAlarm();

	return (
		<div className="min-h-screen flex flex-col items-center justify-start p-2 sm:p-4 relative">
			<ThemeToggle />

			{/* Elementos decorativos de fondo */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-10 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
				<div className="absolute top-20 right-4 w-12 h-12 sm:w-20 sm:h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
				<div className="absolute bottom-20 left-1/4 w-20 h-20 sm:w-32 sm:h-32 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
				<div className="absolute bottom-32 right-1/3 w-14 h-14 sm:w-24 sm:h-24 bg-yellow-400/20 rounded-full blur-xl animate-pulse delay-3000"></div>
			</div>

			<div className="w-full max-w-2xl space-y-4 sm:space-y-6 relative z-10">
				<Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
					<CardHeader className="text-center pb-4 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
						<CardTitle className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-3 mb-3">
							<Bell className="w-6 h-6 sm:w-8 sm:h-8" />
							Cronómetro de Alertas
						</CardTitle>
						<div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
							<Badge
								variant="secondary"
								className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full"
							>
								<Zap className="w-3 h-3 mr-1" />
								<span className="hidden sm:inline">
									Funciona en segundo plano
								</span>
								<span className="sm:hidden">Segundo plano</span>
							</Badge>
							<Badge
								variant="secondary"
								className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full"
							>
								<Bell className="w-3 h-3 mr-1" />
								<span className="hidden sm:inline">
									Notificaciones disponibles
								</span>
								<span className="sm:hidden">Notificaciones</span>
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
						<ClockDisplay clockState={clockState} />

						<Countdown alarmState={alarmState} alarmConfig={lastAlarmConfig} />

						<AlarmForm
							onSetAlarm={setAlarm}
							onStopAlarm={stopAlarm}
							onRepeatAlarm={repeatLastAlarm}
							isActive={alarmState.isActive}
							error={error}
							lastAlarmConfig={lastAlarmConfig}
						/>

						<AlarmStatus alarmState={alarmState} />
					</CardContent>
				</Card>
			</div>

			{/* Pie de página */}
			<footer className="mt-6 sm:mt-8 w-full max-w-2xl">
				<div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 sm:p-4 text-center border border-slate-200 dark:border-slate-700">
					<div className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
						Desarrollado por{" "}
						<span className="font-bold text-slate-800 dark:text-slate-200">
							Nekzus Solutions
						</span>
					</div>
				</div>
			</footer>

			{/* Modal de alarma */}
			<AlarmModal
				isOpen={showAlarmModal}
				onClose={closeAlarmModal}
				targetTime={alarmState.targetTime}
				alarmType={alarmType}
			/>
		</div>
	);
}

export default App;
