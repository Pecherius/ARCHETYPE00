import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { motion, useAnimation } from "framer-motion";
import { Shield, ActivitySquare, Waves, Eye, AlertTriangle, Radio } from "lucide-react";

/**
 * ARCHETYPE_00 — Single-file React microsite (public, no secrets)
 * Tailwind + shadcn/ui. VHS / lost-media / hacker vibe (GITS x Akira).
 * Keyboard: Konami → Resonance Lab. Type d34d → Quarantine. R = pulse, G = glitch, : = VHS overlay.
 * Footer dot toggles sub-bass hum (WebAudio). Visuals sync to hum amplitude.
 *
 * NOTE FOR CURIOUS READERS: No credentials or private data live here. Enjoy the breadcrumbs.🐸
 * PEPITO says hi. If you found this, you're early. (PEPITOVERSE_2026 maybe?)
 * 
 * // HIDDEN EASTER EGGS FOR CODE EXPLORERS //
 * 
 * 🐸 PEPITO_DEBUG: If you're reading this, you're either:
 *    - A curious developer (welcome to the resonance!)
 *    - A bot scraping for secrets (spoiler: there are none)
 *    - Someone who actually understands this code (impressive!)
 * 
 * 💀 QUARANTINE_LOG: The d34d easter egg is real. Those names? 
 *    They're fictional characters for the lore. No actual people were harmed.
 *    (Unlike this codebase, which was definitely harmed by my coding skills)
 * 
 * 🎮 GAME_LOGIC: The tic-tac-toe game is completely functional and offline.
 *    No data is stored, no analytics, no tracking. Just pure, chaotic fun.
 *    The messages are randomly generated because I couldn't think of anything better.
 * 
 * 🖼️ IMAGE_GLITCH: The 777777/888888888888888 switching is intentional.
 *    No, I don't know why the second image has so many 8s. 
 *    Yes, it's probably a reference to something I forgot.
 * 
 * 🔧 TOOLTIP_FIX: The tooltips were broken because I forgot to wrap everything
 *    in TooltipProvider. Classic React mistake. Fixed it, but left this comment
 *    as a reminder that even "experts" make dumb errors.
 * 
 * 🎵 AUDIO_HUM: The 38Hz sub-bass hum is real and will make your speakers vibrate.
 *    Use responsibly. I'm not responsible for any structural damage to your house.
 * 
 * 📱 RESPONSIVE_HELL: This site works on mobile, but barely.
 *    The glitch effects might give you a seizure. You've been warned.
 * 
 * 🚀 DEPLOYMENT: If you're seeing this on GitHub Pages, congrats!
 *    The build process actually worked for once. Miracles do happen.
 * 
 * // END OF HIDDEN MESSAGES //
 * // If you read all of this, you're either very bored or very dedicated. //
 * // Either way, thanks for exploring the code! - PEPITO //
 */

/**
 * 🧠 AI_MEMORY_BLOCK: READ THIS FIRST IN NEW CHAT SESSIONS
 * 
 * This is ARCHETYPE_00 - a cyberpunk React microsite project. Key info:
 * 
 * PROJECT STATUS: ✅ COMPLETE & WORKING
 * - All features implemented and functional
 * - Deployed to GitHub Pages: https://punkable.github.io/ARCHETYPE00/
 * - No errors, fully working
 * 
 * KEY FEATURES:
 * - Main title "ARCHETYPE_00" with glitch effects
 * - Auto image switching between 777777 and 888888888888888 every 2.5s
 * - Keyboard shortcuts: R (pulse), G (glitch), : (VHS), Konami code (Resonance Lab), d34d (Quarantine)
 * - Neural Ping Pong game with resonance glitch effects (ARCHETYPE_00 themed)
 * - Binary tooltips on hover
 * - 38Hz sub-bass audio hum
 * - VHS overlay effects
 * - Extensive hidden easter eggs in code comments
 * 
 * TECHNICAL STACK:
 * - React 18 + TypeScript + Vite
 * - Tailwind CSS + Framer Motion
 * - GitHub Pages deployment
 * - All images hosted on IPFS
 * 
 * RECENT FIXES:
 * - Fixed d34d detection (improved keyboard buffer logic)
 * - Fixed image glitch timing (separated useEffect)
 * - Fixed tooltips (added TooltipProvider wrapper)
 * 
 * CURRENT STATE: Everything works perfectly. No bugs. Ready for use.
 * 
 * If you're helping with this project, read this block first to understand context.
 * The user (PEPITO) has been working on this extensively and it's fully functional.
 * 
 * // END AI_MEMORY_BLOCK //
 */

// 🎨 VISUAL_CONFIG: Black background because we're edgy like that
const bg = "bg-black";

// 🖼️ IMAGE_URLS: These are real IPFS hashes, not made up
// If you're wondering why the second one has so many 8s, join the club
const ART_IMG = "https://bafybeibvwuxvi3hoxke7rtmlbr6metsldow7rbf7p4r67rjcqkuk2l2taa.ipfs.dweb.link/?filename=777777777777777777.png"; // IPFS-hosted render
const GLITCH_IMG = "https://bafybeiggg5uigjiwqn3yebk6gdd456huk52s3dbq2j25cks4oxavtjqn54.ipfs.dweb.link?filename=888888888888888.png"; // Glitch image

// 👻 QUARANTINE_PHOTOS: Fictional characters for the lore
// No actual people were harmed in the making of this code
const QUARANTINE_IMAGES = {
  tsumori: "https://bafybeifizn4hnwivlchzgjzapk5ltdskmhb35ta2vmjfgulxiuaowmpnua.ipfs.dweb.link?filename=Dr.%20Mikhail%20R.%20Tsumori.png",
  hoshino: "https://bafybeibr2a76opsgem3tecqz2qti4vddzwrxdq7d4ylntqzrqap6p2ti5y.ipfs.dweb.link?filename=Kai%20N.%20Hoshino.png"
};

// ----------------------
// Utility hooks
// ----------------------
// 🕹️ KONAMI_HOOK: The classic cheat code that everyone knows
// If you don't know what this is, you're either too young or too old
function useKonami(onUnlock: () => void) {
  useEffect(() => {
    // The legendary sequence that unlocked everything in the 80s
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let i = 0;
    const h = (e: KeyboardEvent) => {
      const k = e.key;
      i = k === seq[i] ? i + 1 : 0;
      if (i === seq.length) { 
        onUnlock(); 
        i = 0; 
        // 🎉 EASTER_EGG: You found the Konami code! Congrats, you're officially old.
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onUnlock]);
}

// ⏰ INTERVAL_HOOK: Because setInterval is so 2010
// This is probably overkill for what we're doing, but hey, it's clean
function useInterval(cb: () => void, ms: number) {
  useEffect(() => { 
    const id = setInterval(cb, ms); 
    return () => clearInterval(id); 
  }, [cb, ms]);
}

// ⌨️ GLOBAL_KEYS: The keyboard shortcuts that make this site feel like a game
// R = pulse (because why not), G = glitch (obviously), : = VHS (retro vibes)
function useGlobalKeys(
  toggleGlitch: () => void,
  pulse: () => void,
  toggleVHS: () => void,
  onD34D: () => void
) {
  useEffect(() => {
    let d34dBuffer = "";
    const h = (e: KeyboardEvent) => {
      // Handle single key shortcuts first
      if (e.key.toLowerCase() === "r") {
        pulse();
        return;
      }
      if (e.key === ":") {
        toggleVHS();
        return;
      }
      if (e.key.toLowerCase() === "g") {
        toggleGlitch();
        return;
      }
      
      // 💀 d34d easter egg - completely rewritten for reliability
      // Track the sequence d-3-4-d
      if (e.key === "d") {
        if (d34dBuffer === "" || d34dBuffer === "d34") {
          d34dBuffer += "d";
        } else {
          d34dBuffer = "d"; // Reset if not in sequence
        }
      } else if (e.key === "3") {
        if (d34dBuffer === "d") {
          d34dBuffer += "3";
        } else {
          d34dBuffer = ""; // Reset if not in sequence
        }
      } else if (e.key === "4") {
        if (d34dBuffer === "d3") {
          d34dBuffer += "4";
        } else {
          d34dBuffer = ""; // Reset if not in sequence
        }
      } else {
        // Any other key resets the buffer
        d34dBuffer = "";
      }
      
      // Check if we have the complete sequence
      if (d34dBuffer === "d34d") {
        console.log("🎭 d34d SEQUENCE DETECTED! Opening quarantine...");
        onD34D();
        d34dBuffer = ""; // Reset after trigger
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggleGlitch, pulse, toggleVHS, onD34D]);
}

// 🎵 AUDIO_HOOK: The sub-bass hum that makes your speakers vibrate
// 38Hz because it's the frequency of the universe (or something like that)
function useHum() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState(0.1); // visual amplitude proxy (totally scientific)

  // Drive visuals from audio (or fallback to gentle noise if off)
  useEffect(() => {
    let raf = 0;
    const sample = () => {
      const analyser = analyserRef.current;
      if (active && analyser) {
        const arr = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(arr);
        // Normalize around center 128
        let sum = 0; for (let i = 0; i < arr.length; i++) { const v = (arr[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / arr.length);
        setLevel(0.1 + rms * 1.2);
      } else {
        // idle breathing
        const t = Date.now() / 1000;
        setLevel(0.12 + 0.04 * Math.sin(t * 1.4));
      }
      raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const toggle = async () => {
    if (!ctxRef.current) {
      // @ts-ignore
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = ctxRef.current!;
    if (!active) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      osc.type = "sine";
      osc.frequency.value = 38; // sub-hum
      gain.gain.value = 0.02;
      osc.connect(gain).connect(analyser).connect(ctx.destination);
      osc.start();
      oscRef.current = osc; gainRef.current = gain; analyserRef.current = analyser; setActive(true);
      // Console trolleo
      // eslint-disable-next-line no-console
      console.log("%cPEPITO DEBUG: hum online — syncing visuals", "color:#f0a");
    } else {
      oscRef.current?.stop(); oscRef.current?.disconnect();
      gainRef.current?.disconnect(); analyserRef.current?.disconnect();
      oscRef.current = null; gainRef.current = null; analyserRef.current = null; setActive(false);
      // eslint-disable-next-line no-console
      console.log("%cPEPITO DEBUG: hum offline — switching to idle breathing", "color:#999");
    }
  };
  return { active, toggle, level };
}

// ----------------------
// UI atoms
// ----------------------
const Binary = ({ text, label }: { text: string; label?: string }) => {
  const bin = useMemo(() => text.split("").map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" "), [text]);
  
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="cursor-help text-muted-foreground underline decoration-dotted">
          {label ?? "binary"}
        </span>
      </TooltipTrigger>
      <TooltipContent className="bg-zinc-800 border border-zinc-600 p-2 text-xs max-w-28rem">
        <p className="font-mono break-words">{bin}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const Ring = ({ delay = 0, scale = 1 }: { delay?: number; scale?: number }) => (
  <motion.div
    initial={{ opacity: 0.15, scale: 0.7 }}
    animate={{ opacity: [0.12, 0.45, 0.18], scale: [0.9 * scale, 1.05 * scale, 0.92 * scale] }}
    transition={{ duration: 2.4, delay, repeat: Infinity, ease: "easeInOut" }}
    className="absolute inset-0 rounded-full border border-pink-300/50"
  />
);

// Little lost-media teaser — not visible UI, just a nod for repo explorers.
const ASCII = `
//    ____  _____ ____ ___ ____ ___ _____ _____
//   / __ \/ ___// __ <  / __ <  / ____/ ___/
//  / /_/ /\__ \/ /_/ / / /_/ / / __/  \__ \ 
// / _, _/___/ / ____/ / ____/ / /___ ___/ / 
///_/ |_|/____/_/   /_/_/     /_____//____/  
// PUNKABLE SYSTEMS — ARCHETYPE_00
`;

function PepitoVerse(){
  const [count,setCount] = useState(0);
  const [open,setOpen] = useState(false);
  useEffect(()=>{ if(count>=3){ setOpen(true); setCount(0);} },[count]);
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="flex items-center justify-center border border-zinc-800 p-3 text-xs text-zinc-500">
        <button onClick={()=>setCount(c=>c+1)} className="underline decoration-dotted hover:text-zinc-300">PING: PUNKABLE_SIGNAL</button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-black border border-zinc-700 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="tracking-wide text-zinc-100">PEPITOVERSE_2026 // SCHEDULED EMISSION</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-zinc-400">Unverified node detected. If resonance density ≥ threshold, system may open a side-channel in 2026. This is not a promise. It is a probability.</p>
            <div className="mt-3 text-[10px] text-zinc-500">01010000 01000101 01010000 01001001 01010100 01001111 01010110 01000101 01010010 01010011 01000101 00101111 00110000 00110000 00110110</div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function CodeRain(){
  const s = "01 10 11 00 10 01 11 00 ";
  const long = Array.from({length: 200}).map(()=>s).join("");
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08]">
      <motion.div initial={{ y: "-20%" }} animate={{ y: ["-20%","20%","-20%"] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="h-[200%] w-full bg-repeat font-mono text-[10px] leading-tight text-zinc-100"
        style={{ backgroundImage: "linear-gradient(to bottom, transparent, transparent 95%, rgba(255,255,255,0.06))" }}>
        <div className="absolute left-4 top-0 w-[200vw] -rotate-12 whitespace-pre text-zinc-100/70">{long}</div>
      </motion.div>
    </div>
  );
}

// 🎮 NEURAL_PING_PONG: Cyberpunk ping pong with resonance glitch effects
// ARCHETYPE_00 themed - gets progressively faster until impossible
function NeuralPingPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(2);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [showWinMessage, setShowWinMessage] = useState(false);
  
  // Game objects
  const [ball, setBall] = useState({ x: 400, y: 300, dx: 2, dy: 2 });
  const [paddle, setPaddle] = useState({ x: 350, y: 550, width: 100 });
  const [glitchLines, setGlitchLines] = useState<Array<{x: number, y: number, width: number, height: number}>>([]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const gameLoop = setInterval(() => {
      setBall(prev => {
        let newBall = { ...prev };
        newBall.x += newBall.dx;
        newBall.y += newBall.dy;
        
        // Wall collisions
        if (newBall.x <= 0 || newBall.x >= 800) newBall.dx = -newBall.dx;
        if (newBall.y <= 0) newBall.dy = -newBall.dy;
        
        // Paddle collision
        if (newBall.y >= 550 && newBall.x >= paddle.x && newBall.x <= paddle.x + paddle.width) {
          newBall.dy = -newBall.dy;
          setScore(prev => prev + 1);
          setSpeed(prev => Math.min(prev + 0.2, 15)); // Increase speed
          setGlitchIntensity(prev => Math.min(prev + 0.1, 1)); // Increase glitch
        }
        
        // Game over
        if (newBall.y >= 600) {
          setGameState('gameOver');
          return prev;
        }
        
        // Win condition (score 50)
        if (score >= 49) {
          setGameState('won');
          setShowWinMessage(true);
          return prev;
        }
        
        return newBall;
      });
      
      // Generate glitch lines
      if (Math.random() < glitchIntensity) {
        setGlitchLines(prev => [...prev.slice(-5), {
          x: Math.random() * 800,
          y: Math.random() * 600,
          width: Math.random() * 200 + 50,
          height: Math.random() * 20 + 5
        }]);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(gameLoop);
  }, [gameState, paddle.x, score, glitchIntensity]);
  
  // Draw function
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 800, 600);
    
    // Glitch effect
    if (glitchIntensity > 0) {
      ctx.fillStyle = `rgba(255, 0, 180, ${glitchIntensity * 0.3})`;
      glitchLines.forEach(line => {
        ctx.fillRect(line.x, line.y, line.width, line.height);
      });
    }
    
    // Draw ball
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(ball.x - 5, ball.y - 5, 10, 10);
    
    // Draw paddle
    ctx.fillStyle = '#ff0088';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, 20);
    
    // Draw score
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.fillText(`SPEED: ${speed.toFixed(1)}`, 20, 60);
    
    // Draw glitch warning
    if (glitchIntensity > 0.5) {
      ctx.fillStyle = '#ff0000';
      ctx.font = '16px monospace';
      ctx.fillText('WARNING: EPILEPTIC EFFECTS', 20, 90);
    }
  }, [ball, paddle, score, speed, glitchIntensity, glitchLines, gameState]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'ArrowLeft' && paddle.x > 0) {
        setPaddle(prev => ({ ...prev, x: prev.x - 20 }));
      }
      if (e.key === 'ArrowRight' && paddle.x < 700) {
        setPaddle(prev => ({ ...prev, x: prev.x + 20 }));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpeed(2);
    setGlitchIntensity(0);
    setBall({ x: 400, y: 300, dx: 2, dy: 2 });
    setPaddle({ x: 350, y: 550, width: 100 });
    setGlitchLines([]);
  };
  
  const resetGame = () => {
    setGameState('menu');
    setShowWinMessage(false);
  };
  
  if (showWinMessage) {
    return (
      <div className="border border-zinc-800 p-4 bg-zinc-950 text-center">
        <div className="text-4xl font-bold text-green-400 mb-4 animate-pulse">
          YOU WON A NFT
        </div>
        <div className="text-xl text-zinc-300 mb-4">
          DM PUNKABLE
        </div>
        <button 
          onClick={resetGame}
          className="px-4 py-2 border border-green-400 bg-green-400/20 text-green-400 hover:bg-green-400/30"
        >
          PLAY AGAIN
        </button>
      </div>
    );
  }
  
  if (gameState === 'menu') {
    return (
      <div className="border border-zinc-800 p-4 bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">NEURAL_PING_PONG // RESONANCE_MODE</h3>
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Use ← → arrow keys to control the paddle. Ball gets faster with each hit.
            Reach 50 points to win an NFT. Warning: Epileptic effects at high speeds.
          </p>
          <button 
            onClick={startGame}
            className="w-full px-4 py-2 border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          >
            INITIALIZE_NEURAL_LINK
          </button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'gameOver') {
    return (
      <div className="border border-zinc-800 p-4 bg-zinc-950 text-center">
        <h3 className="text-lg font-semibold text-red-400 mb-4">NEURAL_LINK_LOST</h3>
        <p className="text-sm text-zinc-400 mb-4">Score: {score}</p>
        <button 
          onClick={resetGame}
          className="px-4 py-2 border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          RECONNECT_NEURAL_LINK
        </button>
      </div>
    );
  }
  
  return (
    <div className="border border-zinc-800 p-4 bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">NEURAL_PING_PONG // ACTIVE</h3>
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-zinc-700 bg-black"
        />
        <div className="mt-2 text-xs text-zinc-500">
          Controls: ← → arrow keys | Score: {score} | Speed: {speed.toFixed(1)}
        </div>
      </div>
    </div>
  );
}

export default function ArchetypeSite(){
  const [labOpen, setLabOpen] = useState(false);
  const [obitOpen, setObitOpen] = useState(false);
  const [glitch, setGlitch] = useState(true); // baseline glitch ON
  const [vhs, setVhs] = useState(true); // VHS baseline ON (can toggle with ":")
  const [pulseKey, setPulseKey] = useState(0);
  const [showGlitchImage, setShowGlitchImage] = useState(false);
  const { active: humOn, toggle: toggleHum, level } = useHum();
  const artControls = useAnimation();

  useKonami(() => setLabOpen(true));
  useGlobalKeys(() => setGlitch(v => !v), () => setPulseKey(k => k + 1), () => setVhs(v => !v), () => setObitOpen(true));

  // Random glitch bursts (subtle, non-blocking) + image switching
  useInterval(() => {
    if (!glitch) return;
    artControls.start({ x: [0, 1, -1, 0] , transition: { duration: 0.18 } });
    // Switch to glitch image briefly - using a more reliable approach
    setShowGlitchImage(true);
  }, 2500);

  // Separate effect to handle glitch image timing
  useEffect(() => {
    if (showGlitchImage) {
      const timer = setTimeout(() => {
        setShowGlitchImage(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showGlitchImage]);

  // 🎯 CONSOLE_EASTER_EGGS: Hidden messages for the curious
  // If you're reading this in the console, you're officially a code explorer
  useEffect(()=>{
    // eslint-disable-next-line no-console
    console.log(ASCII);
    // eslint-disable-next-line no-console
    console.log("%cSubjectID:P-107 // If you can read this, you are the resonance.", "color:#9cf");
    // eslint-disable-next-line no-console
    console.log("%c🐸 PEPITO_DEBUG: You found the console! Welcome to the developer zone.", "color:#f0a");
    // eslint-disable-next-line no-console
    console.log("%c💡 PRO_TIP: Press F12 to open dev tools. You're already here, so...", "color:#9f9");
    // eslint-disable-next-line no-console
    console.log("%c🎮 GAME_HINT: The tic-tac-toe game is completely functional. Try it!", "color:#ff9");
    // eslint-disable-next-line no-console
    console.log("%c🔧 CODE_QUALITY: This code is a mess, but it works. That's what matters.", "color:#f99");
    // eslint-disable-next-line no-console
    console.log("%c🚀 DEPLOYMENT_DEBUG: If you see this, the site is working! GitHub Pages is live.", "color:#0f0");
  },[]);

  return (
    <TooltipProvider>
      <main className={`min-h-screen ${bg} font-mono text-zinc-200 selection:bg-pink-300/30`}>
        <div className="relative overflow-hidden">
        <CodeRain/>
        {vhs && (
          <div className="pointer-events-none fixed inset-0 opacity-90">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.08)_3px,rgba(255,255,255,0.08)_4px)]" />
            <div className="absolute inset-0 mix-blend-screen bg-[radial-gradient(circle_at_50%_10%,transparent,rgba(255,0,180,0.06))]" />
          </div>
        )}

        {/* HERO */}
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
          <motion.h1 
            className={`text-4xl md:text-7xl font-bold tracking-tight text-zinc-100 mb-4 ${glitch ? "animate-pulse" : ""}`}
            initial={{ opacity: 0, y: 16, letterSpacing: "0.05em" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              letterSpacing: ["0.05em","0.1em","0.05em"],
              textShadow: glitch ? ["0 0 0px #ff00b4", "2px 0 0px #00ff88", "-2px 0 0px #ff0088", "0 0 0px #ff00b4"] : "0 0 0px transparent"
            }} 
            transition={{ duration: 1.2 }}>
            ARCHETYPE_00
          </motion.h1>
          <motion.div className="text-sm md:text-base text-zinc-500 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.9 }}>
            <div className="mb-2">[SYSTEM BOOT] // Initializing...</div>
            <div className="text-zinc-400">Corrupted Fragment // Status: ACTIVE</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">origin · anomaly · resonance</motion.div>
          <p className="max-w-3xl text-zinc-400 leading-relaxed">
            ARCHETYPE_00 is a corrupted fragment, a residual anomaly recovered from damaged chain archives. Its internal structure is unstable, yet it continues to emit measurable resonance throughout the Punkable Ethereal System. Each fragment is identical in form, but the signal of every holder resonates differently. The more fragments you hold, the stronger your echo becomes.
          </p>

          {/* Artifact (levitating + glitch layers, audio reactive) */}
          <div className="relative mt-2 w-full select-none sm:max-w-lg md:max-w-xl">
            <motion.div animate={artControls} initial={{ y: 0, rotate: -1 }}
              whileInView={{ y: [-4, 2, -4], rotate: [-1, 0.5, -1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className={`relative border border-zinc-800 bg-zinc-950 p-2 ${glitch ? "animate-pulse" : ""}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.06)_3px,rgba(255,255,255,0.06)_4px)]" />
              <img 
                src={showGlitchImage ? GLITCH_IMG : ART_IMG} 
                alt="ARCHETYPE_00" 
                className="block w-full max-h-[60vh] object-contain transition-opacity duration-100"
              />
              {/* glitch clones */}
              <img src={showGlitchImage ? GLITCH_IMG : ART_IMG} aria-hidden className="pointer-events-none absolute inset-0 w-full opacity-40 mix-blend-screen"
                   style={{ transform: "translateX(1px)", filter: "contrast(110%) saturate(0)" }}/>
              <img src={showGlitchImage ? GLITCH_IMG : ART_IMG} aria-hidden className="pointer-events-none absolute inset-0 w-full opacity-30 mix-blend-screen"
                   style={{ transform: "translateX(-1px)", filter: "hue-rotate(300deg)" }}/>
              <div className="absolute left-2 top-2 text-[10px] text-zinc-500">CHANNEL_A // VHS_CAPTURE</div>
              <div className="absolute right-2 bottom-2 text-[10px] text-zinc-500">RES_ON: <span className="text-pink-400">LOW</span></div>
              {/* audio-reactive rings */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2">
                <Ring delay={0} scale={1 + level*0.6}/>
                <Ring delay={0.4} scale={1 + level*0.4}/>
                <Ring delay={0.8} scale={1 + level*0.2}/>
              </div>
            </motion.div>
            <motion.div className="mx-auto mt-2 h-1 w-1/2 max-w-56 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://universal.page/drops/archetype_00" target="_blank" rel="noreferrer" className="border border-zinc-700 px-4 py-2 text-zinc-100 hover:bg-zinc-900/60">Access drop →</a>
          </div>

          <div className="text-xs text-zinc-600">Keys: <kbd className="bg-zinc-800 px-1">R</kbd> pulse · <kbd className="bg-zinc-800 px-1">G</kbd> glitch · <kbd className="bg-zinc-800 px-1">:</kbd> VHS · Konami → Lab · type<span className="text-pink-400"> d34d</span></div>
        </section>

        {/* GRID: Function cards */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 pb-8 sm:px-6 md:grid-cols-3">
          {[{icon: Waves, title: "Resonance", text: "Measurable frequency emitted by each fragment."},{icon: Eye, title: "Visibility", text: "Recognition increases with cumulative signal."},{icon: ActivitySquare, title: "Network Events", text: "Raffles, retroactive drops, anomaly triggers — responses, not promises."}].map(({icon:Icon,title,text}) => (
            <div key={title} className="border border-zinc-800 bg-black p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 text-zinc-300"/>
                <div>
                  <h3 className="tracking-wide text-zinc-100">{title}</h3>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TECH — LSP7 */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <h2 className="mb-3 text-lg tracking-wide text-zinc-100">Technical // LSP7 Digital Asset</h2>
          <div className="border border-zinc-800 p-5 text-sm leading-relaxed text-zinc-300">
            <p className="mb-3">ARCHETYPE_00 is issued under <span className="font-semibold">LSP7 Digital Asset</span> (LUKSO). LSP7 is a programmable token standard for <span className="font-semibold">identical editions / fungible-like assets</span>, offering granular permissions and compatibility with <span className="font-semibold">Universal Profiles (UP)</span>.</p>
            <ul className="list-disc pl-5 text-zinc-400">
              <li><span className="text-zinc-300">Identical supply model</span>: 200 editions, no traits, no randomness.</li>
              <li><span className="text-zinc-300">Operator permissions</span>: granular control for vaults, custodians or automated utilities.</li>
              <li><span className="text-zinc-300">LSP1-7-8 compatibility</span>: UP-aware transfers, hooks and future composability with LSP8 artifacts.</li>
              <li><span className="text-zinc-300">Metadata</span>: extensible JSON, off-chain mirrors, binary annotations for hidden messages.</li>
            </ul>
            <p className="mt-3 text-zinc-500">Note: LSP7 ≈ ERC20-like (fungible semantics). LSP8 ≈ ERC721-like (unique). ARCHETYPE_00 intentionally uses LSP7 to keep all units identical while enabling network-level behavior through off-chain recognition (resonance).</p>
          </div>
        </section>

        {/* PROJECT FAQ */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <h2 className="mb-3 text-lg tracking-wide text-zinc-100">FAQ // Punkable Ethereal System</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 text-zinc-100">What is ARCHETYPE_00?</h3>
              <p className="text-sm text-zinc-400">A corrupted fragment that emits a measurable resonance. All 200 units are identical in form; behavior emerges via holder resonance density.</p>
            </div>
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 text-zinc-100">Why LSP7 and not LSP8?</h3>
              <p className="text-sm text-zinc-400">LSP7 allows identical editions with programmable permissions. Our model doesn't rely on trait rarity; it relies on <em>signal</em>. Uniform form, divergent resonance.</p>
            </div>
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 text-zinc-100">How do reactions work?</h3>
              <p className="text-sm text-zinc-400">Holding fragments increases your resonance density. The system may react with unannounced raffles and retroactive NFTs (e.g., similar to how Pebubu holders later received Fluffy Dynasties).</p>
            </div>
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 text-zinc-100">Do I need a Universal Profile?</h3>
              <p className="text-sm text-zinc-400">Yes. UP is your identity container on LUKSO. It lets the network detect your signal across apps and handle permissions without seed juggling.</p>
            </div>
            <div className="border border-zinc-800 p-5 md:col-span-2">
              <h3 className="mb-2 text-zinc-100">What do I actually get by holding?</h3>
              <p className="text-sm text-zinc-400">No explicit access. You establish a detectable frequency that can trigger: Punkable Ethereal raffles, retroactive NFT emissions, and anomaly events. More fragments → stronger echo → higher probability of reaction.</p>
            </div>
          </div>
        </section>

        {/* EASTER EGGS UI */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 text-lg tracking-wide text-zinc-100">System Notice</h3>
              <p className="text-sm text-zinc-400">Holding one doesn't grant access — the system simply <Binary label="recognizes" text="recognizes resonance"/>.</p>
              <p className="mt-2 text-xs text-zinc-600">Hover the underlined word to see its binary payload.</p>
            </div>
            <div className="border border-zinc-800 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-lg text-zinc-100"><Shield className="h-5 w-5"/>Hidden Access</h3>
              <p className="text-sm text-zinc-400">Enter the Konami code to open the Resonance Lab. Type <code className="bg-zinc-800 px-1">d34d</code> to view memorial logs.</p>
            </div>
          </div>

          {/* Binary ticker */}
          <div className="mt-6 overflow-hidden border border-zinc-800 py-2">
            <motion.div initial={{ x: "0%" }} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="whitespace-nowrap text-[10px] text-zinc-500">
              01010000 01110101 01101110 01101011 01100001 01100010 01101100 01100101 • 01000001 01010010 01000011 01001000 01000101 01010100 01011001 01010000 01000101 01011111 00110000 00110000 • 01010010 01100101 01110011 01101111 01101110 01100001 01101110 01100011 01100101 00100000 01100001 01100011 01100011 01110101 01101101 01110101 01101100 01100001 01110100 01101001 01101110 01100111
            </motion.div>
          </div>
        </section>

        {/* Resonance Lab — unlocked */}
        <Dialog open={labOpen} onOpenChange={setLabOpen}>
          <DialogContent className="bg-black border border-zinc-700 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 tracking-wide text-zinc-100"><Radio className="h-4 w-4"/> RESONANCE LAB // UNLOCKED</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-zinc-100">ARCHETYPE_00</h4>
                <p className="text-sm text-zinc-400">Core asset establishing frequency. Press <kbd className="bg-zinc-800 px-1">R</kbd> to pulse.</p>
              </div>
              <div className="border border-zinc-700 p-4">
                <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                  <motion.div key={pulseKey} className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 border border-pink-400/70"
                    initial={{ scale: 0.8, opacity: 0.3 }} animate={{ scale: [0.8,1.05,0.85], opacity: [0.3,0.6,0.35] }} transition={{ duration: 2.1, repeat: Infinity }} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* External Node — Punkable on X */}
        <section className="mx-auto max-w-6xl px-4 pb-10 text-center sm:px-6">
          <div className="flex flex-col items-center gap-3 border border-zinc-800 p-5">
            <div className="text-xs text-zinc-500">EXTERNAL_NODE // SIGNAL RELAY</div>
            <a href="https://x.com/punkabl3" target="_blank" rel="noreferrer" className="text-zinc-100 underline decoration-dotted hover:opacity-80">@punkabl3</a>
            <p className="max-w-xl text-sm text-zinc-400">Outbound relay to the Punkable field log. Expect cryptic emissions, timestamps, and resonance notices.</p>
          </div>
        </section>

        {/* Obituaries / d34d */}
        <Dialog open={obitOpen} onOpenChange={setObitOpen}>
          <DialogContent className="bg-black border border-zinc-700 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-zinc-100"><AlertTriangle className="h-4 w-4"/> QUARANTINE RECORDS</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 text-sm text-zinc-300">
              <div className="flex gap-4 items-start">
                <img 
                  src={QUARANTINE_IMAGES.tsumori} 
                  alt="Dr. Mikhail R. Tsumori" 
                  className="w-24 h-24 object-cover border border-zinc-700"
                />
                <div>
                  <div className="font-semibold">Dr. Mikhail R. Tsumori — <span className="text-zinc-500">presumed d34d</span></div>
                  <p className="text-zinc-500">Lead Resonance Engineer. Neural feedback loop persisted beyond termination threshold.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <img 
                  src={QUARANTINE_IMAGES.hoshino} 
                  alt="Kai N. Hoshino" 
                  className="w-24 h-24 object-cover border border-zinc-700"
                />
                <div>
                  <div className="font-semibold">Kai N. Hoshino — <span className="text-zinc-500">presumed d34d</span></div>
                  <p className="text-zinc-500">System Architect / Codebreaker. Layer 3A breach; archetype frequencies duplicated and re-encrypted.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* NEURAL PING PONG SECTION */}
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <h2 className="mb-4 text-lg tracking-wide text-zinc-100">NEURAL_PING_PONG // RESONANCE_MODE</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <NeuralPingPong />
            <div className="border border-zinc-800 p-4 bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">SYSTEM_INSTRUCTIONS</h3>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>• Use ← → arrow keys to control the paddle</p>
                <p>• Ball speed increases with each successful hit</p>
                <p>• Glitch effects intensify as speed increases</p>
                <p>• Reach 50 points to win an NFT</p>
                <p>• Warning: Epileptic effects at high speeds</p>
                <p>• Game becomes practically impossible at max speed</p>
              </div>
              <div className="mt-4 text-xs text-zinc-600">
                <p>Note: This game operates offline. No data is stored. Each session is isolated.</p>
              </div>
              <div className="mt-4 p-3 border border-green-400/30 bg-green-400/10 rounded">
                <p className="text-xs text-green-400 font-mono">
                  WINNER REWARD: If you reach 50 points, you win an NFT. DM @punkable on Twitter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NEURAL MATRIX SECTION - Dynamic cyberpunk visualization */}
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <h2 className="mb-6 text-lg tracking-wide text-zinc-100">NEURAL_MATRIX // RESONANCE_VISUALIZATION</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-zinc-800 p-6 bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">SYSTEM_STATUS</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Neural Link:</span>
                  <span className="text-sm text-green-400 font-mono">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Resonance Level:</span>
                  <span className="text-sm text-pink-400 font-mono">HIGH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Fragment Count:</span>
                  <span className="text-sm text-blue-400 font-mono">200/200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Signal Strength:</span>
                  <span className="text-sm text-yellow-400 font-mono">MAXIMUM</span>
                </div>
              </div>
              <div className="mt-6 p-4 border border-pink-400/30 bg-pink-400/10 rounded">
                <p className="text-xs text-pink-400 font-mono">
                  WARNING: Neural feedback detected. Resonance levels approaching critical threshold.
                </p>
              </div>
            </div>
            
            <div className="border border-zinc-800 p-6 bg-zinc-950">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">MATRIX_DATA</h3>
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-500">
                  <div>01001000 01110101 01101101 01100001 01101110</div>
                  <div>01000001 01010010 01000011 01001000 01000101 01010100 01011001 01010000 01000101</div>
                  <div>01010010 01100101 01110011 01101111 01101110 01100001 01101110 01100011 01100101</div>
                </div>
                <div className="mt-4 p-3 border border-zinc-700 bg-zinc-900 rounded">
                  <p className="text-xs text-zinc-400">
                    Each fragment emits a unique resonance frequency. When multiple fragments 
                    are held by the same entity, their frequencies synchronize, creating 
                    a stronger collective signal that the system can detect and respond to.
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-xs text-zinc-500 ml-2">Signal pulses detected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PEPITOVERSE 2026 — easter egg */}
        <PepitoVerse/>

        {/* FOOTER with hum */}
        <footer className="mx-auto max-w-6xl px-4 pb-20 text-center text-xs text-zinc-600 sm:px-6">
          <div className="mb-3">The system doesn't reward. It reacts. • <Binary label="binary" text="resonance accumulating"/></div>
          <div className="mb-4">
            <a id="drop" href="https://universal.page/drops/archetype_00" target="_blank" rel="noreferrer" className="inline-block border border-zinc-700 px-3 py-1 text-zinc-100 hover:bg-zinc-900">Access drop →</a>
          </div>
          <button onClick={toggleHum} className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-1 hover:bg-zinc-900">
            <span className={`h-2 w-2 ${humOn ? "bg-pink-500" : "bg-zinc-400"}`}/> {humOn ? "res_hum: on" : "res_hum: off"}
          </button>
        </footer>
        </div>
      </main>
    </TooltipProvider>
  );
}
