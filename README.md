# 🚀 Habit21: Sistema de Gestión de Tiempo y Hábitos

**Habit21** es una aplicación web de alto rendimiento diseñada para la formación de hábitos mediante el método de **Time Blocking**. El sistema automatiza la rutina de lunes a viernes y permite flexibilidad total los fines de semana, buscando la consolidación de hábitos en ciclos de 21 días.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React (Vite) + TypeScript.
- **Backend:** Node.js + Express + TypeScript.
- **Base de Datos:** PostgreSQL (Relacional).
- **UI/UX:** - **Tailwind CSS:** Estilos atómicos y responsivos.
  - **Shadcn/ui:** Componentes de interfaz (Calendarios, Checkboxes).
  - **Lucide React:** Iconografía minimalista.

---

## 📋 Funcionalidades del MVP (Fase 1)

### A. Generador de Horario Inteligente
* **Esquema Semanal:** Interfaz espejo para definir actividades fijas de lunes a viernes.
* **Flexibilidad:** Editor independiente para excepciones de sábado y domingo.
* **Categorización:** Clasificación visual por colores (Sueño, Trabajo, Descanso, Ejercicio).

### B. Sistema de Seguimiento (Daily Checklist)
* **Modo Cumplimiento:** Lista dinámica generada según el bloque horario actual.
* **Marcado Real-time:** Validación inmediata de cumplimiento de tareas.

### C. Gamificación: La Racha de 21 Días
* **Contador Visual:** Widget de progreso "Día X de 21".
* **Lógica de Racha:** - El contador avanza si el cumplimiento diario es **> 80%**.
    - Si no se alcanza el umbral, la racha se reinicia o se estanca (según configuración).

### D. Dashboard de Productividad
* **Análisis de Tiempo:** Gráficos de distribución de horas por categoría.
* **Reporte Plan vs. Real:** Comparativa detallada de ejecución frente a lo planeado.

---

## 🤖 Roles de IA (Referencia AGENTS.md)
Este proyecto se desarrolla bajo la supervisión de tres agentes especializados:
1. **Arquitecto Fullstack:** Estructura y API.
2. **Especialista UI/UX:** Interfaz y componentes Shadcn.
3. **Ingeniero de Lógica:** Algoritmos de gamificación y racha.
