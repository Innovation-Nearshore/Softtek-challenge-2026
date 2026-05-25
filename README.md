# AI Build Challenge 2026
## Guía de Requisitos Técnicos para la Estación de Trabajo

Este documento detalla el stack tecnológico, las herramientas y las configuraciones obligatorias que deben estar instaladas y validadas en la máquina de cada participante antes del inicio del evento en formato **Hands On**.

---

### 1. Entorno de Desarrollo Core

* **Node.js (LTS):** Última versión estable de soporte a largo plazo instalada.
* **npm / npx:** Gestor de paquetes oficial de Node.js verificado y actualizado.
* **Visual Studio Code:** Editor de código (IDE) principal para el desarrollo del reto.

### 2. Stack de Aplicación

* **Frontend (UI):**
    * **React:** Biblioteca principal para la construcción de la interfaz de usuario.
    * **Tailwind CSS:** Framework de estilos para el diseño visual.
* **Backend & APIs:**
    * **Express.js:** Framework de Node.js seleccionado para la construcción de la API y lógica del servidor.

### 3. Extensiones de VS Code & Herramientas de IA

Asegúrese de contar con las siguientes extensiones instaladas y activas en Visual Studio Code:
* **FRIDA Code Copilot:** Copiloto de IA para la asistencia en la generación de código. *(Validar que esté funcionando correctamente dentro del IDE)*.
* **FridaPlanner:** Herramienta para la gestión y planeación del reto.
* **Live Server:** Para el despliegue rápido y previsualización en tiempo real del frontend.
* **Prettier / ESLint:** Para asegurar el correcto formateo y consistencia del código fuente.

> ⚠️ **IMPORTANTE (Acceso a FridaPlanner):** Es obligatorio gestionar con anticipación el permiso de uso enviando un correo electrónico a **onder.campos@softtek.com** para evitar bloqueos el día del evento.

### 4. Persistencia de Datos, Pruebas & Automatización

* **PostgreSQL:** Servidor de base de datos relacional local instalado y corriendo.
* **Insomnia:** Cliente de escritorio para el diseño, envío y depuración de peticiones a la API (GET, POST, etc.).
* **Playwright Framework:** Herramienta para la automatización de pruebas de extremo a extremo (E2E).
    * *Nota:* Posterior a la instalación del paquete, es requerido descargar los binarios de los navegadores ejecutando en la terminal:
        ```bash
        npx playwright install
        ```

### 5. Control de Versiones y Repositorio

* **Git:** Motor de control de versiones instalado y configurado globalmente con sus credenciales.
* **GitHub Desktop:** Cliente visual recomendado para facilitar el flujo de trabajo con Git.
* **Repositorio Oficial del Proyecto:** Clonar el siguiente repositorio en su máquina local antes del evento:
    ```bash
    git clone https://github.com/Innovation-Nearshore/Softtek-challenge-2026.git
    ```

### 6. Herramientas de Entorno Generales

* **Navegador Web:** Google Chrome o Microsoft Edge actualizado a la última versión.
* **Terminal de comandos:** Uso de Bash, Zsh o PowerShell con permisos suficientes para ejecutar scripts locales e instalar paquetes globales.

---
*SOFTTEK INNOVATION · 2026 · CONFIDENCIAL*
