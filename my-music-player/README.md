# Neurid Music Player (Tauri + React + Rust)

Este es un reproductor de música de escritorio con arquitectura limpia (sin plugins de terceros), utilizando **Tauri v2**, **React**, **TypeScript**, **Vite** y **Tailwind CSS**. Implementa un motor de audio nativo en Rust con estado sincronizado vía Zustand.

## Comandos de Inicialización Utilizados

Para cumplir con tu requerimiento original, aquí están los comandos que se utilizaron para generar e inicializar la estructura base de este proyecto:

```bash
# 1. Crear el proyecto Tauri (Frontend + Backend skeleton)
npm create tauri-app@latest my-music-player -- --manager npm --template react-ts

# 2. Navegar al proyecto e instalar dependencias del frontend
cd my-music-player
npm install

# 3. Instalar Tailwind CSS y configurar PostCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Instalar librerías de estado e iconos
npm install zustand lucide-react

# 5. Instalar dependencias de IA Local (opcional para el asistente)
npm install @xenova/transformers

# 6. Añadir dependencias en Rust (en my-music-player/src-tauri/Cargo.toml)
# rodio = "0.19"
# walkdir = "2.4"
# lofty = "0.21"
# tiny_http = "0.12"
```

## Estructura de Carpetas

La arquitectura implementada divide claramente el Motor de Audio (Backend/Rust) del Estado y la UI (Frontend/React):

```text
my-music-player/
├── src-tauri/                 # 🦀 BACKEND (Rust - Motor de Audio)
│   ├── src/
│   │   ├── main.rs            # Punto de entrada de Tauri. Registra los comandos IPC.
│   │   ├── audio.rs           # Core del motor de audio (rodio), manejo de cola, volumen y estado.
│   │   ├── scanner.rs         # Escaneo de archivos locales (walkdir) y metadatos (lofty).
│   │   └── oauth.rs           # Servidor temporal (tiny_http) para autenticación con Spotify.
│   ├── capabilities/          # Permisos explícitos de IPC en Tauri v2.
│   ├── tauri.conf.json        # Configuración principal de la ventana y aplicación Tauri.
│   └── Cargo.toml             # Dependencias de Rust.
│
├── src/                       # ⚛️ FRONTEND (React/TS - UI & Estado)
│   ├── store/
│   │   └── playerStore.ts     # Estado global (Zustand) que maneja la UI y llama a los comandos Rust.
│   ├── components/
│   │   ├── Sidebar.tsx        # Navegación lateral.
│   │   ├── PlayerControls.tsx # Barra de reproducción, volumen, controles.
│   │   ├── Library.tsx        # Vista de biblioteca local.
│   │   └── AiAssistant.tsx    # Asistente local con Transformers.js.
│   ├── App.tsx                # Layout principal de la aplicación.
│   ├── main.tsx               # Punto de entrada de React.
│   └── index.css              # Configuración de Tailwind CSS.
│
├── package.json               # Dependencias de Node.js.
├── tailwind.config.js         # Configuración de Tailwind.
└── vite.config.ts             # Configuración de Vite.
```

## Cómo ejecutar el proyecto en tu máquina (Local)

Cuando llegues a casa y descargues este repositorio, necesitarás tener instalado **Node.js** y **Rust**. Para ejecutarlo en modo escritorio:

1. Instala las dependencias del sistema (en Linux/Ubuntu):
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libasound2-dev
   ```
2. Instala los paquetes de Node:
   ```bash
   npm install
   ```
3. Inicia la aplicación en modo desarrollo (Tauri compilará Rust y abrirá la ventana):
   ```bash
   npm run tauri dev
   ```

---
¡El reproductor está listo para que lo pruebes y sigas expandiéndolo!
