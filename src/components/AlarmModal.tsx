import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";
import { AlarmClock, Bell, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTime: Date | null;
  alarmType?: "anticipation" | "posterior";
}

export const AlarmModal = ({ isOpen, onClose, targetTime, alarmType }: AlarmModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reproducir sonido de alarma una sola vez
      playAlarmSound();
    }
  }, [isOpen]);

  const playAlarmSound = () => {
    try {
      setIsPlaying(true);
      
      // Crear un contexto de audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Crear un oscilador para generar el sonido
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Conectar los nodos
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar el sonido de alarma (frecuencia más aguda y distintiva)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
      
      // Configurar el volumen
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      // Configurar el tipo de onda
      oscillator.type = 'sine';
      
      // Reproducir el sonido
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Limpiar después de que termine
      setTimeout(() => {
        setIsPlaying(false);
        audioContext.close();
      }, 500);
      
    } catch (error) {
      console.warn('Error reproduciendo sonido de alarma:', error);
      setIsPlaying(false);
    }
  };

  const getAlarmMessage = () => {
    if (!targetTime) return "¡Alarma activada!";
    
    const timeString = targetTime.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    
    if (alarmType === "anticipation") {
      return `¡Alarma de anticipación! El tiempo objetivo (${timeString}) se acerca.`;
    } else if (alarmType === "posterior") {
      return `¡Alarma posterior! El tiempo objetivo (${timeString}) ya pasó.`;
    }
    
    return `¡Alarma activada! Tiempo objetivo: ${timeString}`;
  };

  const getAlarmDescription = () => {
    if (alarmType === "anticipation") {
      return "Te notificamos antes del tiempo objetivo para que estés preparado.";
    } else if (alarmType === "posterior") {
      return "El tiempo objetivo ya ha pasado. ¿Necesitas hacer algo?";
    }
    
    return "Tu alarma se ha activado según la configuración establecida.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 shadow-2xl">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Bell className="w-16 h-16 text-red-600 dark:text-red-400 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-red-800 dark:text-red-200 flex items-center justify-center gap-2">
            <AlarmClock className="w-6 h-6" />
            ¡ALARMA ACTIVADA!
          </DialogTitle>
          <DialogDescription className="text-lg text-red-700 dark:text-red-300 font-medium mt-4">
            {getAlarmMessage()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-600 dark:text-red-300 text-center">
              {getAlarmDescription()}
            </p>
          </div>
          
          {isPlaying && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Reproduciendo sonido de alarma...
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
