# ⏰ Cronómetro de Alertas Sincronizado

Una aplicación React moderna para configurar alarmas que suenan antes de una
hora exacta, sincronizada con la hora del sistema.

## 🚀 Características

- **Reloj en tiempo real** que se actualiza cada segundo
- **Configuración de alarma** con hora objetivo (HH:MM:SS)
- **Tiempo de anticipación** configurable en segundos, minutos o horas
- **Cuenta regresiva en vivo** hacia el momento de la alarma
- **Sonido de alarma** generado con Web Audio API
- **Notificaciones del navegador** (con solicitud de permisos)
- **Validaciones completas** que impiden configurar horas pasadas
- **Funciona en segundo plano** (mantiene la alarma activa al cambiar de
  pestaña)
- **Diseño responsivo** con Tailwind CSS
- **TypeScript** para mejor desarrollo y mantenimiento

## 🛠️ Tecnologías

- **React 18** con hooks modernos
- **TypeScript** para tipado estático
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos modernos
- **Web Audio API** para sonidos personalizados
- **Notification API** para alertas del sistema

## 📦 Instalación

```bash
# Clonar o descargar el proyecto
cd alarm-clock-react

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🎯 Uso

1. **Abre la aplicación** en tu navegador
2. **Configura la hora objetivo** (ej: 14:30:00)
3. **Elige el tiempo de anticipación** (ej: 5 minutos antes)
4. **Haz clic en "Configurar Alarma"**
5. **Observa la cuenta regresiva** en tiempo real
6. **La alarma sonará** exactamente en el momento calculado

### Ejemplo de uso:

- Quieres que suene 3 segundos antes de las 00:10:00
- Configuras: Hora objetivo = 00:10:00, Anticipación = 3 segundos
- La alarma sonará a las 00:09:57

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── AlarmForm.tsx   # Formulario de configuración
│   ├── AlarmStatus.tsx # Estado de la alarma
│   ├── ClockDisplay.tsx # Reloj en tiempo real
│   └── Countdown.tsx   # Cuenta regresiva
├── hooks/              # Hooks personalizados
│   ├── useAlarm.ts     # Lógica de alarma
│   └── useClock.ts     # Lógica del reloj
├── types/              # Tipos TypeScript
│   └── index.ts        # Definiciones de tipos
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 🎨 Características de Diseño

- **Diseño minimalista** con gradientes suaves
- **Fuente Inter** para máxima legibilidad
- **Animaciones elegantes** con CSS y Tailwind
- **Responsive design** que se adapta a móviles
- **Colores suaves** y efectos visuales modernos

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa de la build
npm run lint         # Linter de código
```

## 🌟 Mejoras Futuras

- [ ] Múltiples alarmas simultáneas
- [ ] Diferentes tipos de sonidos
- [ ] Persistencia de alarmas (localStorage)
- [ ] Modo oscuro/claro
- [ ] Alarmas recurrentes
- [ ] Integración con calendario

## 📱 Compatibilidad

- ✅ Chrome/Chromium (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles

## 🚨 Notas Importantes

- La aplicación solicita permisos de notificación para mejor experiencia
- Funciona mejor en navegadores modernos con soporte para Web Audio API
- Las alarmas se mantienen activas incluso al cambiar de pestaña
- Se recomienda permitir notificaciones para no perder la alarma

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
