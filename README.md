# Chatbot IA

Chatbot de inteligencia artificial con backend en Node.js/Express y frontend web, impulsado por la API de Claude (Anthropic).

## Requisitos

- Node.js 18+
- Una API key de Anthropic ([console.anthropic.com](https://console.anthropic.com))

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo de ejemplo y añade tu API key:

```bash
cp .env.example .env
```

Edita `.env`:

```
ANTHROPIC_API_KEY=tu_api_key_real
PORT=3000
```

## Uso

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador y empieza a chatear.

## Estructura del proyecto

```
├── server.js          # Servidor Express y endpoint /api/chat
├── public/
│   ├── index.html      # Interfaz del chat
│   ├── style.css        # Estilos
│   └── script.js         # Lógica del frontend
├── .env.example
└── package.json
```
