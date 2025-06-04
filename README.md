# 🎨 RAG Musache Frontend

Frontend moderno para el sistema RAG Musache con diseño glassmorphism y experiencia de usuario premium.

## 🌟 Características

- ✅ **Diseño Glassmorphism** - Interfaz moderna con efectos de cristal
- ✅ **Drag & Drop** - Subida de archivos intuitiva
- ✅ **Chat en Tiempo Real** - Interfaz de conversación fluida
- ✅ **Responsive Design** - Funciona en móvil, tablet y desktop
- ✅ **Animaciones Suaves** - Micro-interacciones pulidas
- ✅ **Notificaciones** - Sistema de feedback visual
- ✅ **Modo Debug** - Panel de desarrollo integrado

## 🚀 Despliegue Rápido

### Opción 1: GitHub Pages (Recomendado)

1. **Crear repositorio para el frontend:**
```bash
# Crear nuevo directorio
mkdir rag-musache-frontend
cd rag-musache-frontend

# Inicializar git
git init
git branch -M main
```

2. **Copiar todos los archivos:**
```bash
# Estructura de archivos
rag-musache-frontend/
├── index.html
├── css/
│   ├── style.css
│   └── animations.css
├── js/
│   ├── api.js
│   ├── ui.js
│   ├── chat.js
│   └── main.js
└── README.md
```

3. **Subir a GitHub:**
```bash
# Crear repositorio en GitHub: rag-musache-frontend
git add .
git commit -m "Initial frontend deploy"
git remote add origin https://github.com/tu-usuario/rag-musache-frontend.git
git push -u origin main
```

4. **Habilitar GitHub Pages:**
   - Ve a Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

5. **¡Listo!** Tu frontend estará en:
   `https://tu-usuario.github.io/rag-musache-frontend/`

### Opción 2: Netlify

1. **Crear cuenta en Netlify**
2. **Drag & drop** la carpeta del frontend
3. **Deploy automático** ✨

### Opción 3: Vercel

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd rag-musache-frontend
vercel --prod
```

## 🔧 Configuración

### API Endpoint

El frontend está configurado para conectarse a:
```javascript
// js/api.js línea 8
this.baseURL = 'https://rag-musache.onrender.com/api/v1';
```

Si cambias la URL de tu API, actualiza esta línea.

### CORS Configuration

Asegúrate de que tu API backend permita requests desde tu dominio frontend:

```python
# En tu backend FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-usuario.github.io",  # GitHub Pages
        "https://tu-app.netlify.app",    # Netlify
        "https://tu-app.vercel.app",     # Vercel
        "http://localhost:3000"          # Desarrollo local
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🎮 Uso

### 1. **Subir Documento**
- Arrastra un archivo PDF/TXT a la zona de subida
- O clickea para seleccionar archivo
- Espera a que se procese (30-60 segundos)

### 2. **Chatear**
- Una vez procesado, aparece la interfaz de chat
- Escribe preguntas sobre tu documento
- Usa las sugerencias rápidas
- Ve las fuentes consultadas en cada respuesta

### 3. **Funciones Avanzadas**
- **Ctrl+Shift+D**: Modo debug
- **Ctrl+Shift+R**: Reiniciar app
- **Click en respuestas**: Copiar texto
- **Historial**: Ver conversaciones anteriores

## 🛠️ Desarrollo Local

### Servidor Local Simple

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Luego abre: `http://localhost:8000`

### Live Server (VS Code)

1. Instala la extensión "Live Server"
2. Click derecho en `index.html`
3. "Open with Live Server"

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎨 Personalización

### Colores

Edita las variables CSS en `css/style.css`:

```css
:root {
    --primary: #6366f1;      /* Color principal */
    --secondary: #8b5cf6;    /* Color secundario */
    --accent: #06b6d4;       /* Color de acento */
    --success: #10b981;      /* Color de éxito */
    --error: #ef4444;        /* Color de error */
}
```

### Animaciones

Personaliza en `css/animations.css`:

```css
/* Deshabilitar animaciones */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## 🔍 Debug y Desarrollo

### Panel de Debug

Presiona **Ctrl+Shift+D** para abrir el panel de debug que incluye:

- ✅ Info de la aplicación
- ✅ Estado de componentes
- ✅ Health checks manuales
- ✅ Limpiar chat
- ✅ Reset UI

### Console Logging

```javascript
// Habilitar logs detallados
window.DEBUG_MODE = true;

// Ver info de la app
window.getAppInfo();

// Verificar componentes
console.log('UI:', window.ui);
console.log('Chat:', window.chat);
console.log('API:', window.api);
```

## 🐛 Troubleshooting

### Problema: No conecta con la API

**Síntomas:** Error de conexión, status "error"

**Soluciones:**
1. Verifica que la API esté desplegada: `https://rag-musache.onrender.com/api/v1/health`
2. Revisa CORS en el backend
3. Checkea la URL en `js/api.js`

### Problema: Archivos no se suben

**Síntomas:** Error 500 en upload

**Soluciones:**
1. Verifica formato de archivo (PDF/TXT)
2. Tamaño < 10MB
3. Server no dormido (Render free tier)

### Problema: Chat no funciona

**Síntomas:** Mensajes no se envían

**Soluciones:**
1. Documento debe estar procesado (`status: ready`)
2. Check console para errores JS
3. Verify API endpoints funcionando

## 📈 Rendimiento

### Optimizaciones Implementadas

- ✅ **Lazy Loading** - Componentes se cargan cuando se necesitan
- ✅ **Debouncing** - Inputs optimizados
- ✅ **Request Caching** - Menos requests redundantes
- ✅ **Animaciones Eficientes** - CSS transforms y GPU acceleration
- ✅ **Image Optimization** - SVG icons en lugar de PNGs

### Métricas Objetivo

- **First Paint**: < 1s
- **Time to Interactive**: < 2s
- **Core Web Vitals**: Green
- **Lighthouse Score**: > 90

## 🔒 Seguridad

### Medidas Implementadas

- ✅ **XSS Prevention** - Sanitización de inputs
- ✅ **HTTPS Only** - Todas las requests cifradas  
- ✅ **No Local Storage** - No datos sensibles en localStorage
- ✅ **Error Handling** - No exposición de datos internos

## 📦 Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Glassmorphism, Grid, Flexbox
- **Vanilla JavaScript** - Sin frameworks, máximo rendimiento
- **Font Awesome** - Iconografía
- **Google Fonts** - Tipografía (Inter)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] **Dark/Light Mode Toggle**
- [ ] **Multi-idioma** (i18n)
- [ ] **Export Conversations** (PDF, JSON)
- [ ] **Voice Input** (Speech-to-Text)
- [ ] **Collaborative Chat** (Multi-user)
- [ ] **Document Annotations** (Highlight sources)

### Mejoras Técnicas

- [ ] **Service Worker** (Offline support)
- [ ] **Web Components** (Reusable components)
- [ ] **TypeScript** (Type safety)
- [ ] **Unit Tests** (Jest/Vitest)
- [ ] **E2E Tests** (Playwright)

---

## 🚀 ¡Listo para usar!

Tu frontend RAG Musache está completo y listo para desplegarse. Con diseño moderno, experiencia fluida y integración perfecta con tu API backend.

**¿Necesitas ayuda?** Abre un issue en el repositorio.

**Demo:** [Ver demo en vivo](https://tu-usuario.github.io/rag-musache-frontend/)