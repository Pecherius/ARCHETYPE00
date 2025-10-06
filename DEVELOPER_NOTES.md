# ARCHETYPE_00 - Developer Notes (PRIVATE)

## 🎯 Project Context
This is a cyberpunk/hacker-themed React microsite for ARCHETYPE_00, a fictional NFT project. The site is designed to look like a corrupted fragment with VHS aesthetics, glitch effects, and hidden easter eggs.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 18.2.0 + TypeScript
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.3.5
- **Animations**: Framer Motion 10.16.4
- **Icons**: Lucide React 0.292.0
- **Deployment**: GitHub Pages + GitHub Actions

### File Structure
```
src/
├── ArchetypeSite.tsx     # Main component (691 lines)
├── main.tsx             # Entry point
├── index.css            # Tailwind imports
└── components/ui/       # shadcn/ui components
    ├── dialog.tsx
    └── tooltip.tsx
```

## 🎨 Visual Design System

### Color Palette
- **Primary**: Zinc (grays) - #18181b to #f4f4f5
- **Accent**: Pink - #ec4899 (for glitch effects)
- **Background**: Black - #000000
- **Text**: Zinc-200 - #e4e4e7

### Typography
- **Font**: Monospace (ui-monospace, SFMono-Regular, Monaco, Consolas)
- **Main Title**: 4xl-7xl, bold, tracking-tight
- **Code Text**: text-xs, font-mono

### Visual Effects
- **VHS Overlay**: Repeating linear gradients with mix-blend-screen
- **Glitch Effects**: Text shadows, pulse animations, image switching
- **Code Rain**: Animated binary text falling in background
- **Audio Reactive**: Rings that pulse with 38Hz sub-bass

## ⌨️ Interactive Features

### Keyboard Shortcuts
```javascript
// Global key handler in useGlobalKeys hook
'R' -> pulse() // Triggers resonance rings
'G' -> toggleGlitch() // Toggles glitch effects
':' -> toggleVHS() // Toggles VHS overlay
'↑↑↓↓←→←→BA' -> setLabOpen(true) // Konami code
'd34d' -> setObitOpen(true) // Quarantine records
```

### State Management
```javascript
const [labOpen, setLabOpen] = useState(false);        // Resonance Lab
const [obitOpen, setObitOpen] = useState(false);      // Quarantine Records
const [glitch, setGlitch] = useState(true);           // Glitch effects
const [vhs, setVhs] = useState(true);                 // VHS overlay
const [pulseKey, setPulseKey] = useState(0);          // Pulse animation
const [showGlitchImage, setShowGlitchImage] = useState(false); // Image switching
```

## 🖼️ Image System

### Image URLs
```javascript
const ART_IMG = "https://bafybeibvwuxvi3hoxke7rtmlbr6metsldow7rbf7p4r67rjcqkuk2l2taa.ipfs.dweb.link/?filename=777777777777777777.png";
const GLITCH_IMG = "https://bafybeiggg5uigjiwqn3yebk6gdd456huk52s3dbq2j25cks4oxavtjqn54.ipfs.dweb.link?filename=888888888888888.png";
```

### Image Switching Logic
```javascript
// Every 2.5 seconds, switch to glitch image for 200ms
useInterval(() => {
  if (!glitch) return;
  setShowGlitchImage(true);
}, 2500);

useEffect(() => {
  if (showGlitchImage) {
    const timer = setTimeout(() => setShowGlitchImage(false), 200);
    return () => clearTimeout(timer);
  }
}, [showGlitchImage]);
```

## 🎮 Game Implementation

### Cryptic Tic-Tac-Toe
- **Location**: CrypticGame component
- **State**: board, isXNext, gameOver, winner, messages
- **Messages**: Array of PEPITOVERSE-themed system messages
- **Offline**: No data persistence, pure client-side

### Game Logic
```javascript
const checkWinner = (squares: (string | null)[]): string | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  // ... winner detection logic
};
```

## 🎵 Audio System

### Sub-bass Hum
- **Frequency**: 38Hz sine wave
- **Gain**: 0.02 (very low volume)
- **Visual Sync**: Rings pulse with audio amplitude
- **Toggle**: Footer button to enable/disable

### Audio Context Management
```javascript
const ctxRef = useRef<AudioContext | null>(null);
const oscRef = useRef<OscillatorNode | null>(null);
const gainRef = useRef<GainNode | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
```

## 🔧 Technical Implementation Details

### Vite Configuration
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/ARCHETYPE00/',  // GitHub Pages subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
```

### GitHub Actions Workflow
- **Trigger**: Push to main branch
- **Build**: npm ci + npm run build
- **Deploy**: Upload dist/ to GitHub Pages
- **Environment**: github-pages

### Tooltip System
- **Provider**: TooltipProvider wraps entire app
- **Component**: Custom Binary component with tooltip
- **Content**: Binary representation of text

## 🐛 Known Issues & Fixes

### Fixed Issues
1. **d34d Detection**: Was conflicting with other key handlers
   - **Fix**: Separated key handling logic, added regex filter
2. **Image Glitch Timing**: setTimeout in useInterval caused issues
   - **Fix**: Moved to separate useEffect
3. **Tooltips Not Working**: Missing TooltipProvider wrapper
   - **Fix**: Wrapped entire app with TooltipProvider

### Current Status
- ✅ All features working
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Build successful
- ✅ Deployed to GitHub Pages

## 🎭 Easter Eggs & Hidden Features

### Console Messages
```javascript
console.log("%c🐸 PEPITO_DEBUG: You found the console!", "color:#f0a");
console.log("%c💡 PRO_TIP: Press F12 to open dev tools", "color:#9f9");
console.log("%c🎮 GAME_HINT: The tic-tac-toe game is functional!", "color:#ff9");
console.log("%c🔧 CODE_QUALITY: This code is a mess, but it works", "color:#f99");
console.log("%c🚀 DEPLOYMENT_DEBUG: Site is working! GitHub Pages is live", "color:#0f0");
```

### Code Comments
- Extensive sarcastic comments throughout
- PEPITO_DEBUG messages in functions
- Humorous explanations of code decisions
- Hidden messages for code explorers

## 🚀 Deployment Process

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production Deployment
```bash
git add .
git commit -m "feat: description"
git push origin main
# GitHub Actions automatically builds and deploys
```

### URLs
- **Local**: http://localhost:5173/ARCHETYPE00/
- **Production**: https://punkable.github.io/ARCHETYPE00/

## 📝 Future Enhancements (if needed)

### Potential Improvements
1. **Mobile Optimization**: Better responsive design
2. **More Easter Eggs**: Additional hidden features
3. **Sound Effects**: More audio feedback
4. **Animations**: More complex glitch effects
5. **Performance**: Code splitting, lazy loading

### Maintenance Notes
- **Dependencies**: Keep updated for security
- **Build**: Monitor GitHub Actions for failures
- **Performance**: Check bundle size if adding features
- **Accessibility**: Consider adding ARIA labels

## 🔍 Debug Information

### Key Debug Points
1. **Console Logs**: Check for d34d detection
2. **Image Switching**: Verify showGlitchImage state
3. **Audio Context**: Check for browser autoplay policies
4. **Tooltips**: Verify TooltipProvider is wrapping content

### Common Issues
1. **Audio Not Working**: Browser autoplay restrictions
2. **Images Not Loading**: IPFS gateway issues
3. **Glitch Effects**: Check glitch state and timing
4. **Keyboard Shortcuts**: Verify event listeners are attached

---
*This document contains all technical details needed to understand and maintain the ARCHETYPE_00 project.*
*Last Updated: $(date)*
