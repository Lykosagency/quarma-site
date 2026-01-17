#!/bin/bash

echo "🚀 Début de l'installation automatique des fichiers..."

# 1. Configuration PostCSS
echo "Création de postcss.config.js..."
cat <<EOF > postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 2. Configuration Tailwind
echo "Création de tailwind.config.js..."
cat <<EOF > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF

# 3. Styles CSS
echo "Création de src/index.css..."
mkdir -p src
cat <<EOF > src/index.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #000;
  color: white;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0a0a0a; 
}
::-webkit-scrollbar-thumb {
  background: #333; 
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #D4AF37; 
}
EOF

# 4. Point d'entrée Main
echo "Création de src/main.jsx..."
cat <<EOF > src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# 5. HTML Principal
echo "Création de index.html..."
cat <<EOF > index.html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quarma | Private Structuring</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

echo "✅ Installation de base terminée !"
