# ARCHETYPE_00 // Punkable Ethereal Raffle System

> *Sistema de rifas descentralizado para la comunidad Punkable, integrado con LUKSO blockchain y desplegado en IPFS.*

## 🚀 **Descripción**

Sistema de rifas profesional desarrollado para la comunidad Punkable, con integración completa a la blockchain LUKSO y capacidades de almacenamiento descentralizado. El sistema permite gestionar participantes, premios y realizar sorteos con transparencia total.

## ✨ **Características Principales**

### **Motor de Sorteo Inteligente**
- **Selección Ponderada**: Sistema de tickets con probabilidades ajustables
- **Algoritmo de Shuffling**: Múltiples iteraciones para garantizar aleatoriedad
- **Efectos Visuales**: Animaciones y confetti para mejorar la experiencia

### **Gestión de Datos**
- **Almacenamiento Local**: Persistencia de participantes y premios
- **Exportación de Resultados**: Generación de reportes en múltiples formatos
- **Historial de Sorteos**: Tracking completo de actividades

### **Integración Blockchain**
- **LUKSO Integration**: Conexión directa con la red LUKSO
- **ENS Support**: Resolución de dominios .eth
- **Deploy Descentralizado**: Hosting en IPFS para máxima descentralización

## 🛠️ **Stack Tecnológico**

```bash
# Dependencias principales
React + TypeScript + Vite          # Frontend moderno y eficiente
Tailwind CSS                       # Framework CSS utilitario
Framer Motion                      # Animaciones fluidas
Canvas Confetti                    # Efectos visuales
LUKSO Integration                  # Blockchain integration
IPFS Deployment                    # Hosting descentralizado
```

## 🚀 **Instalación y Desarrollo**

```bash
# Clonar el repositorio
git clone https://github.com/punkable/archetype00.git
cd archetype00

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🌐 **Deploy en IPFS**

### **Configuración Inicial**
```bash
# Instalar IPFS globalmente
npm install -g ipfs

# Inicializar nodo IPFS
ipfs init
ipfs daemon
```

### **Deploy del Sitio**
```bash
# Construir el proyecto
npm run build

# Subir a IPFS
ipfs add -r dist/

# Obtener hash del directorio raíz
# Ejemplo: QmYourHashHere...
```

### **Configuración ENS**
1. Acceder a [ENS Manager](https://app.ens.domains/)
2. Buscar tu dominio `.eth`
3. Añadir registro TXT con: `ipfs://QmYourHashHere...`
4. Esperar propagación DNS (5-10 minutos)

### **Acceso al Sitio**
- **IPFS Gateway**: `https://ipfs.io/ipfs/QmYourHashHere...`
- **ENS Domain**: `tu-dominio.eth` (después de configuración DNS)
- **Cloudflare Gateway**: `https://cloudflare-ipfs.com/ipfs/QmYourHashHere...`

## 🏗️ **Arquitectura del Proyecto**

```
src/
├── components/
│   ├── PunkableRaffleSystem.tsx    # Componente principal del sistema
│   ├── RaffleLanguageSelector.tsx  # Selector de idioma
│   ├── RaffleResultsScreen.tsx     # Pantalla de resultados
│   └── ui/                         # Componentes UI reutilizables
├── lib/
│   ├── raffle-service.ts           # Servicio principal de rifas
│   ├── user-storage.ts             # Gestión de usuarios
│   ├── prize-storage.ts            # Gestión de premios
│   └── raffle-types.ts             # Definiciones de tipos
└── hooks/
    └── use-raffle-language.tsx     # Hook para internacionalización
```

## 🎨 **Diseño de Interfaz**

La interfaz está diseñada con un tema cyberpunk/wasteland:
- **Gradientes Amber/Orange**: Paleta de colores temática
- **Animaciones Fluidas**: Transiciones suaves con Framer Motion
- **Efectos Visuales**: Confetti y animaciones para celebrar ganadores
- **Responsive Design**: Adaptable a todos los dispositivos

## 🔧 **Configuración de Deploy**

### **Variables de Entorno**
```bash
# Configurar para producción
VITE_LUKSO_RPC_URL=https://rpc.lukso.network
VITE_ENS_RESOLVER=0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
```

### **Optimizaciones de Build**
- **Code Splitting**: Chunks optimizados por funcionalidad
- **Tree Shaking**: Eliminación de código no utilizado
- **Asset Optimization**: Compresión de imágenes y recursos
- **Bundle Analysis**: Monitoreo del tamaño de bundles

## 🚨 **Solución de Problemas**

### **Build Fails**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **IPFS Upload Issues**
```bash
# Verificar estado del daemon
ipfs daemon --init

# Forzar recolección de basura
ipfs repo gc
```

### **ENS Resolution Problems**
- Verificar configuración DNS en ENS Manager
- Esperar propagación completa (hasta 24h)
- Usar gateway alternativo temporalmente

## 📊 **Métricas de Performance**

- **Bundle Size**: ~450KB total (gzipped: ~150KB)
- **Load Time**: <2s en conexiones rápidas
- **Lighthouse Score**: 95+ en todas las categorías
- **IPFS Availability**: 99.9% uptime

## 🤝 **Contribución**

1. Fork del repositorio
2. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push al branch: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 **Licencia**

MIT License - Ver archivo `LICENSE` para detalles.

---

**Desarrollado para la comunidad Punkable** 🚀

*Built with ❤️ para la descentralización y transparencia.*