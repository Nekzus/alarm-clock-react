import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 hover:scale-110 transition-all duration-300 shadow-lg"
    >
      {theme === "light" ? (
        <div className="flex items-center gap-1 sm:gap-2">
          <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs sm:text-sm">Modo Oscuro</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-xs sm:text-sm">Modo Claro</span>
        </div>
      )}
    </Button>
  );
};
