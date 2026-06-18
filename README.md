# AI Build Challenge — Guía de Facilitador
### Edición 2026 · Documento de Uso Interno

---

## 📊 Ficha Técnica del Challenge

* **Duración:** 4h 30 min
* **Participantes:** 25 – 30 personas
* **Equipos:** 5 – 6 equipos de 5 personas cada uno
* **Perfil:** Técnico Senior (Multi-empresa)
* **Acelerador Principal:** FRIDA SDLC
* **URL Votación: https://lky143fc3x9c.space.minimax.io/#/qr 

---

## 🏗️ 1. Visión General

El **AI Build Challenge** reúne a líderes técnicos, arquitectos, desarrolladores senior y líderes QA de distintas empresas para construir una aplicación web funcional en 4 horas usando **FRIDA SDLC** como acelerador principal. No es un taller de ideación ni una demo de producto; es construcción real, con código real, evaluada con criterios objetivos.

> 💡 **Principio Clave:** "El reto no es aprender a programar con IA, es aprender a *dirigir* a la IA para producir más, más rápido y con mejor calidad que a la manera tradicional."

### Perfil de Participante
* **Arquitecto de Software**
* **Desarrollador Sr / Expert**
* **Líder QA**
* **Líder Técnico**

> ⚠️ **Nota para el Facilitador:** Los perfiles senior dominan el código; el verdadero aprendizaje es soltar el control y confiar en FRIDA SDLC como copiloto. La tentación de "hacerlo a su manera" es el principal obstáculo a superar.

### Principios de Diseño
1.  **Reto único, ejecuciones distintas:** Todos construyen el mismo tipo de app, el diferenciador es la calidad técnica, las decisiones de arquitectura y la eficiencia con FRIDA SDLC.
2.  **FRIDA SDLC como copiloto, no como sustituto:** El equipo dirige, valida y decide; FRIDA SDLC ejecuta y propone. Los mejores resultados vienen de quien mejor sabe instruir.
3.  **Criterios objetivos, sin subjetividad:** Code review automatizado, checklist de funcionalidad, eficiencia por token. El ganador se determina con datos, no con opiniones.

### Resultados Esperados (al finalizar las 4 horas)
* Una aplicación web funcional corriendo en el navegador.
* Código revisado automáticamente con score de calidad.
* Métricas de eficiencia: tokens consumidos vs. features entregados.
* Una demo de 5 minutos con la app funcionando en vivo.
* Una perspectiva propia sobre cómo FRIDA SDLC cambia su flujo de trabajo habitual.

---

## 🏎️ 2. Dinámica de Equipos: La Mecánica del Volante

Cada equipo cuenta con 5 participantes. No hay roles fijos: todos son pilotos. Como en las carreras de resistencia: un solo auto, cinco pilotos, turnos cronometrados. Cada participante estará al frente del build operando la computadora durante **30 minutos** y luego pasará el relevo.

| Rol de Turno | Responsabilidades y Reglas |
| :--- | :--- |
| **Piloto al Volante** *(30 min)* | • Es el único que toca la computadora durante su turno.<br>• Usa FRIDA SDLC para avanzar en el foco asignado.<br>• Puede pedir sugerencias, pero él decide.<br>• Al finalizar, hace el traspaso en 2 minutos (estado, faltantes, consideraciones). |
| **Copilotos** *(Fuera del volante)* | • Observan, toman notas y sugieren, sin tocar la máquina.<br>• Preparan insumos para el siguiente turno: datos, prompts, diseños en papel.<br>• Prueban la app en sus dispositivos para detectar bugs prematuros.<br>• Construyen el guión de la demo final sobre la marcha. |

> 🛠️ **Criterio de Formación de Equipos:** Se debe evitar que dos personas de la misma empresa queden en el mismo equipo. Se deben mezclar especialidades (arquitecto, developer, QA) para maximizar la diversidad de perspectivas. El orden de los pilotos lo define el equipo en la Fase 1: se recomienda que el perfil más técnico sea el Piloto 1 (configuración de entorno) y el que tenga más claridad comunicativa sea el Piloto 5 (cierre y demo).

---

## 💻 3. Los Retos Tecnológicos

Todos los equipos construyen la misma aplicación base (elegida por votación al inicio). Las opciones tienen un stack tecnológico estándar: **REACT y NODE.JS**, asistidos por **FRIDA SDLC**, y almacenamiento persistente real.

### Opción A: Tracker de Iniciativas
* **Descripción:** Web app para registrar y hacer seguimiento de iniciativas o proyectos de un área.
* **Módulo 1:** Formulario de registro (Nombre, responsable, estado [Pendiente / En curso / Completado], fecha límite, prioridad y descripción).
* **Módulo 2:** Dashboard con tabla filtrable por estado/prioridad, contador de estados y vista de próximos vencimientos.
* **Feature Diferenciador:** Edición inline de estado con Drag & Drop entre columnas estilo Kanban.

### Opción B: Portal de Reportes de Área
* **Descripción:** Web app que permite cargar datos desde un CSV o formulario y genera automáticamente visualizaciones gráficos y métricas clave.
* **Módulo 1:** Carga de datos mediante upload de archivos CSV o ingreso manual estructurado por período.
* **Módulo 2:** Visualización con gráficas de barras y líneas (usando Chart.js), tarjetas de resumen analítico (totales, promedios, variaciones).
* **Feature Diferenciador:** Filtros dinámicos por período y exportación del reporte a PDF o imagen.

### Opción C: Gestor de Solicitudes Internas
* **Descripción:** Web app para crear, gestionar y hacer seguimiento de solicitudes internas de cualquier tipo (soporte, aprobaciones, requerimientos).
* **Módulo 1:** Formulario de solicitud (Tipo, urgencia [Alta/Media/Baja], descripción, solicitante y área).
* **Módulo 2:** Bandeja de solicitudes con tabla general, filtros avanzados y cambio de estado dinámico (Recibida / En revisión / Resuelta).
* **Feature Diferenciador:** Vista detallada de solicitud con historial de cambios de estado y marcas de tiempo (*timestamps*).

### 🧭 Guía de Selección y Persistencia
* **Tracker de Iniciativas:** Ideal si el equipo es más de negocio o con poca experiencia en visualización gráfica.
* **Portal de Reportes:** Recomendado si hay experiencia previa con librerías de gráficas. Brinda el mayor impacto visual en la demo.
* **Gestor de Solicitudes:** Recomendado para equipos que deseen priorizar flujos de trabajo avanzados y lógica estricta de estados.
* **🗄️ Persistencia de Datos (A elegir en Fase 1):**
    * **POSGRESQL:** Default recomendado. SQL estándar, sin servidor, almacena en un archivo local que FRIDA SDLC configura en minutos.
    
---

## 🔎 4. Modelo de Evaluación Objetiva

La evaluación no cuenta con un panel de jueces tradicional ni valoraciones subjetivas. Un **Evaluador Central** aplica los mismos criterios métricos a todos los repositorios. El **Coach** de cada equipo actúa únicamente como registrador de hechos en tiempo real (hora del MVP y cobertura del Canvas).

### Los 4 Criterios de Evaluación

1.  **Funcionalidad Verificable (35%):** Checklist binario por reto. Cada ítem completado suma puntos fijos (ej. ¿El formulario guarda en la DB?, ¿Los datos persisten al recargar?, ¿Funciona sin errores en la consola?).
2.  **Calidad de Código (30%):** Code review automatizado mediante herramientas (Kardex). Mide legibilidad, modularidad, manejo de errores y seguridad del código generado por la IA y guiado por el humano.
3.  **Velocidad de Entrega / Tiempo al MVP (10%):** Registrado por el Coach. Premia al equipo que declare y valide funcionalmente su Producto Mínimo Viable de forma más rápida.
4.  **Eficiencia en el Uso de Tokens (25%):** Relación matemática entre las funcionalidades entregadas y los tokens consumidos en las solicitudes a FRIDA SDLC. Premia la precisión en el *prompting* y la reducción del desperdicio de contexto.

---

## 📅 5. Agenda Detallada del Evento (Total: 4h 30min)

[00:00 - 00:20] ── FASE 1: Alineación & Configuración (20 min)
[00:20 - 02:50] ── FASE 2: Ciclos de Build - Turnos 1 a 5 (150 min)
[02:50 - 03:50] ── FASE 3: Estabilización, QA & Cierre de Canvas (60 min)
[03:50 - 04:30] ── FASE 4: Demos & Resultados Finales (40 min)


### ⏱️ Desglose Técnico por Fases

#### FASE 1: Alineación y Configuración Territorial (20 min)
* **Acciones:** Explicación de reglas, votación del reto común y selección del motor de persistencia (SQLite/PocketBase). Cada equipo define su orden de pilotos y abre el AI Build Canvas.
* **Hito:** Prohibido tocar el teclado o inicializar el espacio de trabajo antes de terminar esta fase.

#### FASE 2: Ciclos de Build — Los Relevos (150 min)
* **Estructura:** 5 turnos consecutivos de 30 minutos estrictos cada uno.

Turno 1 (30 min) ── Focus: Setup del entorno, Arquitectura Base y Conexión DB.
Turno 2 (30 min) ── Focus: Módulo 1 (Formularios de Captura e Ingesta).
Turno 3 (30 min) ── Focus: Módulo 2 (Dashboard, Tablas, Lógica de Estados).
Turno 4 (30 min) ── Focus: Refinamiento UI/UX y Funcionalidades Core.
Turno 5 (30 min) ── Focus: Integración de Feature Diferenciador y Demo Prep.


* **Regla de Oro:** Cada cambio de turno obliga a un *handoff* verbal de 2 minutos sobre el estado del build.

#### FASE 3: Estabilización, QA & Cierre de Canvas (60 min)
* **Acciones:** Todo el equipo puede colaborar en las pruebas (sin romper la regla del volante si se requiere refactorizar). Se congela el código (*Code Freeze*), se ejecuta el code review automatizado y se entrega el AI Build Canvas completado al Coach.
* **Hito:** Envío de métricas de tokens y repositorio al Evaluador Central.

#### FASE 4: Showroom de Demos y Resultados (40 min)
* **Acciones:** Demos estrictas de 5 minutos por equipo en un entorno de producción en vivo o local. Presentación de la tabla de posiciones consolidada por el Evaluador Central y premiación de ganadores.

---

## 🛠️ 6. Matriz de Aceleradores Técnicos

Para cumplir con el tiempo límite de 4 horas, los equipos disponen de aceleradores preconfigurados que deben ser asignados de acuerdo al perfil del piloto en turno:

| Nombre del Acelerador | Tipo de Componente | Propósito / Beneficio Técnico | Usuario Ideal Recomendado |
| :--- | :--- | :--- | :--- |
| **FRIDA SDLC** | Core AI Assistant | Generación de componentes estructurados, resolución de bugs de lógica, optimización de consultas SQL y automatizaciones del despliegue. | *Todos los Pilotos* |
| **PosgreSQL** | Database Script | Script de inicialización de tablas relacionales comunes, configuración de conexión local mediante archivos planos sin dependencias de infraestructura. | *Piloto 1 · Arquitecto* |
| **Kardex Automator** | Testing & QA Tools | Suite local de análisis estático para validar calidad de código, modularidad y apego a buenas prácticas de forma automatizada previa a la evaluación final. | *Piloto 5 · Líder QA* |

---

## ⚙️ 7. Checklist de Setup Técnico Pre-Challenge
*(Responsabilidad del Organizador — Ejecutar el día anterior)*

- [ ] **FRIDA SDLC:** Verificar instalación y autenticación activa en las laptops corporativas de todos los Builders para mitigar bloqueos de permisos o proxies de red.
- [ ] **Plan B (Workspaces):** Tener listos entornos de respaldo en Replit configurados y validados desde una red externa a la corporativa.
- [ ] **Estrategia de Respaldo:** Mantener una versión pre-construida de cada reto al 60% de avance. Si el entorno o la demo de algún equipo colapsa por completo, el facilitador puede usar esta base para asegurar el aprendizaje.
- [ ] **Librerías Locales:** Asegurar la disponibilidad y descarga previa de paquetes (Chart.js
