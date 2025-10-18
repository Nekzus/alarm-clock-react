import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Optimización React 19: Usar createRoot con opciones de hidratación optimizadas
const root = createRoot(rootElement, {
  // React 19: Optimizaciones de hidratación
  identifierPrefix: "alarm-clock",
  onRecoverableError: (error) => {
    console.warn("React 19 recoverable error:", error);
  },
});

// React 19: Usar Suspense para mejor manejo de carga
root.render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Suspense>
  </StrictMode>
);
