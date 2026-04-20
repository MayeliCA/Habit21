# Habit21

## Convierte tus intenciones en hábitos reales

---

## El Problema

> "Quiero estudiar más, comer mejor, hacer ejercicio..."
> **Todos tenemos buenas intenciones. Pocas se convierten en hábito.**

- El **43%** de nuestras acciones diarias son automáticas — realizadas sin pensar. *(Wood et al., 2002)*
- La mayoría de las personas abandonan sus metas en las primeras dos semanas.
- No falta motivación. **Falta sistema.**

---

## La Ciencia detrás de los 21 Días

La idea de que se necesitan **21 días** para formar un hábito proviene del Dr. **Maxwell Maltz** (1960), cirujano plástico que observó que sus pacientes tardaban ~21 días en acostumbrarse a su nueva apariencia.

La investigación moderna confirma el principio:

- **Lally et al. (2010)**, *European Journal of Social Psychology*: Estudio con 96 participantes durante 12 semanas. Encontró que la **automaticidad** (comportamiento automático) requiere repetición consistente en un contexto estable para consolidarse.
- El promedio real fue **66 días**, pero la curva de adopción muestra que los primeros **21 días** representan la fase más crítica — donde el comportamiento pasa de consciente a semi-automático.
- **Los ganglios basales** (estructura cerebral) son los responsables de almacenar hábitos como respuestas automáticas. La repetición diaria refuerza estas rutas neuronales. *(Graybiel, 2008)*

### El modelo del ciclo del hábito *(Duhigg, 2012)*

```
Señal → Anhelo → Acción → Recompensa
```

**Habit21 usa este modelo:** La señal es tu horario diario, la acción es el check-in, y la recompensa es la racha visual.

---

## Qué es Habit21

Una aplicación web que te ayuda a construir hábitos usando dos herramientas científicamente validadas:

### 1. Generador de Horarios (Time Blocking)
Planifica tu día en bloques de tiempo organizados por 4 ejes:

| Eje | Filosofía | Ejemplo |
|-----|-----------|---------|
| **Académico** | Inversión | Estudiar, leer, trabajar |
| **Vital** | Mantenimiento | Dormir, comer, ejercicio |
| **Personal** | Recuperación | Meditar, hobbies, familia |
| **Escape** | Distacción | Redes sociales, series |

### 2. Rachas de 21 Días
Define hábitos (hasta 6 activos) y haz check-in diario. Si completas 21 días seguidos, el hábito se consolida.

---

## Cómo Funciona

```
┌─────────────────────────────────────────────────────┐
│                   DÍA A DÍA                         │
│                                                     │
│  1. Revisa tu horario planificado                   │
│  2. Marca actividades completadas en tu checklist   │
│  3. Haz check-in en tus rachas de hábito            │
│  4. Visualiza tu progreso en el dashboard           │
│                                                     │
│  → Repite durante 21 días                           │
│  → El comportamiento se vuelve automático           │
└─────────────────────────────────────────────────────┘
```

### Métrica clave: 80% de cumplimiento diario
Si completas al menos el 80% de tus actividades planificadas, el día cuenta como "exitoso". La app rastrea días consecutivos de cumplimiento.

---

## Funcionalidades Principales

### Dashboard Inteligente
- **Métrica de éxito**: Porcentaje global de cumplimiento con semáforo (verde ≥80%, ámbar ≥50%, rojo <50%)
- **Resumen ejecutivo**: Tu mejor día, promedio semanal, y tiempo de "escape" (distractions)
- **Gráficos por categoría**: Comparación planificado vs. completado (diario, semanal, mensual)
- **Gráficos de balance**: Distribución de tiempo entre los 4 ejes

### Horario Semanal
- Planifica actividades por día de la semana con hora de inicio y fin
- Hasta 18 actividades por día
- Colores por categoría para identificación visual rápida

### Checklist Diario
- Se genera automáticamente desde tu horario
- Toggle en tiempo real con actualización optimista
- Barra de cumplimiento con umbral del 80%

### Rachas de Hábitos
- Hasta 6 hábitos activos simultáneamente
- Widget de fuego con animaciones (gris → naranja brillante al completar)
- Barra de progreso: "Día X de 21"
- Celebración con confetti al completar los 21 días
- Auto-detección de rachas rotas con notificación
- Reinicio automático a medianoche si se pierde un día

---

## Diferenciadores

| | Otras apps de hábitos | **Habit21** |
|---|---|---|
| Enfoque | Solo rastreo | Planificación + rastreo |
| Base científica | Genérica | Modelo de automaticidad (Lally et al.) |
| Horario integrado | No | Time Blocking por categorías |
| Gamificación | Básica | Rachas + cumplimiento + analytics |
| Dashboard analítico | Simple | Diário, semanal, mensual con 4 ejes |

---

## Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS + Shadcn/ui |
| Backend | Express + TypeScript + PostgreSQL + Drizzle ORM |
| Auth | JWT + bcrypt |
| Monorepo | npm workspaces (client / server / shared) |
| Deploy | Docker |

---

## Demo: Flujo del Usuario

```
Registro → Crear horario semanal → Definir hábitos
                                          ↓
                              Check-in diario (checklist + rachas)
                                          ↓
                              Dashboard: ¿cómo voy? → Ajustar → Repetir
                                          ↓
                              Día 21 → Hábito consolidado
```

---

## Impacto Esperado

**Antes de Habit21:**
- "Quiero ser más productivo" → Intención vaga → Abandono en 1 semana

**Con Habit21:**
- "Voy a estudiar de 8-10am, hacer ejercicio de 6-7pm" → Plan concreto → Check-in diario → Racha de 21 días → **Comportamiento automático**

> No se trata de motivación. Se trata de **sistemas**.
> *— James Clear, Hábitos Atómicos*

---

## Próximos Pasos

- Notificaciones push para recordatorios
- Modo offline / PWA
- Integración con calendarios externos
- Comunidad y rachas compartidas

---

**Habit21 — 21 días para cambiar tu vida.**

*Referencias científicas: Lally et al. (2010), Wood et al. (2002), Graybiel (2008), Duhigg (2012), Maltz (1960)*
