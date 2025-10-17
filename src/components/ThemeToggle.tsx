import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			onClick={toggleTheme}
			variant="outline"
			size="sm"
			className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 hover:scale-110 transition-all duration-300 shadow-lg"
		>
			{theme === "light" ? (
				<div className="flex items-center gap-2">
					<Moon className="w-4 h-4" />
					<span className="hidden sm:inline">Modo Oscuro</span>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<Sun className="w-4 h-4" />
					<span className="hidden sm:inline">Modo Claro</span>
				</div>
			)}
		</Button>
	);
};
