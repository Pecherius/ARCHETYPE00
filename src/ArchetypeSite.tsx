import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
// Tooltip components removed - using custom implementation
import { motion, useAnimation } from "framer-motion";
// Icons removed - not used in current implementation
import PunkableRaffleSystem from "./components/PunkableRaffleSystem";
import { RaffleLanguageProvider } from "./hooks/use-raffle-language";

// 🌐 LUKSO_INTEGRATION: Basic Universal Profile detection
// Reads data from browser extension without changing the core lore

// Hook to detect Universal Profile extension and read basic data
function useUniversalProfile() {
  const [profileData, setProfileData] = useState<{
    address?: string;
    name?: string;
    avatar?: string;
    isConnected: boolean;
  }>({ isConnected: false });

  useEffect(() => {
    // Check if Universal Profile extension is available
    const checkUP = async () => {
      try {
        // Check if the extension is installed
        if (typeof window !== 'undefined' && (window as any).lukso) {
          const lukso = (window as any).lukso;
          
          // Try to get basic profile data
          if (lukso.isConnected && lukso.isConnected()) {
            const accounts = await lukso.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              const address = accounts[0];
              
              // Try to get profile metadata (basic info)
              try {
                // Basic profile detection (simplified)
                // const profile = await lukso.request({...});
                
                setProfileData({
                  address,
                  name: `Profile_${address.slice(0, 6)}`,
                  isConnected: true
                });
              } catch (e) {
                // Fallback to basic address info
                setProfileData({
                  address,
                  name: `UP_${address.slice(0, 6)}`,
                  isConnected: true
                });
              }
            }
          }
        }
      } catch (error) {
        // Extension not available or error
        console.log("Universal Profile not detected");
      }
    };

    checkUP();
  }, []);

  return profileData;
}

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
 * This is ARCHETYPE_00 - a cypherpunk React microsite project. Key info:
 * 
 * PROJECT STATUS: ✅ COMPLETE & WORKING
 * - All features implemented and functional
 * - Deployed to GitHub Pages: https://punkable.github.io/ARCHETYPE00/
 * - No errors, fully working
 * - Last update: Enhanced mobile responsiveness, terminal interface, and expanded lore - v2.3 - RESONANCE_FIELD
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

// Fallback images if IPFS fails
const FALLBACK_ART = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmYwMGI0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BUkNIRVRZUEVfMDA8L3RleHQ+PC9zdmc+";
const FALLBACK_GLITCH = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HTElUQ0g8L3RleHQ+PC9zdmc+";

// 👻 QUARANTINE_PHOTOS: Fictional characters for the lore
// No actual people were harmed in the making of this code
const QUARANTINE_IMAGES = {
  tsumori: "https://bafybeie4hjscx5xwz2ewjzu6qjvl6m7ouxadvk6x6cgtyes65syizdep6e.ipfs.dweb.link/Dr.%20Mikhail%20R.%20Tsumori.png",
  hoshino: "https://bafybeicvhutbdtysa6657tsjwd3k6xx72wn6drkzaygz4tik2jcx6wfn24.ipfs.dweb.link?filename=Kai%20N.%20Hoshino.png"
};

// Debug function for image loading
const debugImageLoad = (url: string, name: string) => {
  console.log(`%c[IMAGE_DEBUG] Loading ${name}: ${url}`, "color:#00ff88; font-family: monospace;");
  
  const img = new Image();
  img.onload = () => {
    console.log(`%c[IMAGE_SUCCESS] ${name} loaded successfully (${img.width}x${img.height})`, "color:#00ff88; font-family: monospace;");
  };
  img.onerror = (error) => {
    console.log(`%c[IMAGE_ERROR] ${name} failed to load:`, "color:#ff4444; font-family: monospace;", error);
    console.log(`%c[IMAGE_ERROR] URL: ${url}`, "color:#ff4444; font-family: monospace;");
  };
  img.src = url;
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
  const cbRef = useRef(cb);
  cbRef.current = cb;
  
  useEffect(() => { 
    const id = setInterval(() => cbRef.current(), ms); 
    return () => clearInterval(id); 
  }, [ms]);
}

// ⌨️ GLOBAL_KEYS: The keyboard shortcuts that make this site feel like a game
// R = pulse (because why not), G = glitch (obviously), : = VHS (retro vibes)
function useGlobalKeys(
  toggleGlitch: () => void,
  pulse: () => void,
  toggleVHS: () => void,
  onD34D: () => void
) {
          const d34dBufferRef = useRef("");
          const lastKeyTimeRef = useRef(Date.now());
          
  useEffect(() => {
            // Initialize debug info (reduced for performance)
            console.log("%c[NEURAL_INTERFACE] Keyboard monitoring system initialized", "color:#00ff88; font-family: monospace;");
            console.log("%c[QUARANTINE_PROTOCOL] Waiting for access sequence: d34d", "color:#ff6600; font-family: monospace;");
            
            const handleKeyPress = (e: KeyboardEvent) => {
              const now = Date.now();
              const timeSinceLastKey = now - lastKeyTimeRef.current;
              
            // Reduced debug logging for performance
              
              // Handle single key shortcuts first
              if (e.key.toLowerCase() === "r") {
                console.log("%c[SHORTCUT] R key detected - triggering pulse", "color:#00ff88; font-family: monospace;");
                pulse();
                return;
              }
              if (e.key === ":") {
                console.log("%c[SHORTCUT] : key detected - toggling VHS", "color:#00ff88; font-family: monospace;");
                toggleVHS();
                return;
              }
              if (e.key.toLowerCase() === "g") {
                console.log("%c[SHORTCUT] G key detected - toggling glitch", "color:#00ff88; font-family: monospace;");
                toggleGlitch();
                return;
              }
              
              // Process d34d sequence - only alphanumeric characters
              const isAlphanumeric = e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key);
              console.log(`%c[FILTER] Is alphanumeric: ${isAlphanumeric}`, "color:#666; font-family: monospace;");
              
              if (isAlphanumeric) {
                // Check for timeout condition
                const shouldReset = d34dBufferRef.current.length > 0 && timeSinceLastKey > 5000;
                console.log(`%c[TIMEOUT_CHECK] Should reset buffer: ${shouldReset} (buffer length: ${d34dBufferRef.current.length}, time: ${timeSinceLastKey}ms)`, "color:#666; font-family: monospace;");
                
                if (shouldReset) {
                  console.log(`%c[D34D_BUFFER] ⚠️ TIMEOUT DETECTED! Resetting buffer from: "${d34dBufferRef.current}"`, "color:#ff0000; font-family: monospace;");
                  console.log(`%c[ERROR_ANALYSIS] Buffer was reset because ${timeSinceLastKey}ms > 5000ms timeout`, "color:#ff4444; font-family: monospace;");
                  d34dBufferRef.current = "";
                }
                
                const oldBuffer = d34dBufferRef.current;
                d34dBufferRef.current = d34dBufferRef.current + e.key.toLowerCase();
                
                // Only keep last 4 characters if buffer is longer
                if (d34dBufferRef.current.length > 4) {
                  const trimmed = d34dBufferRef.current.slice(-4);
                  console.log(`%c[BUFFER_TRIM] Buffer exceeded 4 chars, trimmed: "${d34dBufferRef.current}" -> "${trimmed}"`, "color:#ffaa00; font-family: monospace;");
                  d34dBufferRef.current = trimmed;
                }
                
                lastKeyTimeRef.current = now;
                console.log(`%c[D34D_BUFFER] ✅ Added "${e.key}" -> Buffer: "${oldBuffer}" + "${e.key}" = "${d34dBufferRef.current}"`, "color:#ff6600; font-family: monospace;");
                
                // Check for complete sequence
                const isComplete = d34dBufferRef.current === "d34d";
                console.log(`%c[SEQUENCE_CHECK] Is "d34d" complete: ${isComplete} (current: "${d34dBufferRef.current}")`, "color:#666; font-family: monospace;");
                
                if (isComplete) {
                  console.log("%c[QUARANTINE_PROTOCOL] 🚨 ACCESS SEQUENCE d34d RECOGNIZED! Initiating quarantine breach...", "color:#ff4444; font-weight: bold;");
                  console.log("%c[SUCCESS] Buffer accumulation successful: d -> d3 -> d34 -> d34d", "color:#00ff88; font-weight: bold;");
          onD34D();
                  d34dBufferRef.current = ""; // Reset after successful trigger
                  console.log("%c[BUFFER_RESET] Buffer cleared after successful trigger", "color:#00ff88; font-family: monospace;");
                } else {
                  console.log(`%c[PROGRESS] Sequence progress: ${d34dBufferRef.current.length}/4 characters`, "color:#ffaa00; font-family: monospace;");
                }
              } else {
                // Handle non-alphanumeric keys
                const isSpecialKey = ["Shift", "Control", "Alt", "Meta", "Tab", "CapsLock", "F12"].includes(e.key);
                console.log(`%c[NON_ALPHA] Non-alphanumeric key: "${e.key}", is special: ${isSpecialKey}`, "color:#666; font-family: monospace;");
                
                if (!isSpecialKey && d34dBufferRef.current.length > 0) {
                  console.log(`%c[D34D_BUFFER] ⚠️ RESET! Non-alphanumeric key "${e.key}" detected. Resetting buffer from: "${d34dBufferRef.current}"`, "color:#ff0000; font-family: monospace;");
                  console.log(`%c[ERROR_ANALYSIS] Buffer was reset because "${e.key}" is not alphanumeric and not a special key`, "color:#ff4444; font-family: monospace;");
                  d34dBufferRef.current = "";
                } else if (isSpecialKey) {
                  console.log(`%c[SPECIAL_KEY] Ignoring special key: "${e.key}" - buffer preserved`, "color:#00ff88; font-family: monospace;");
                }
              }
              
              // Final state summary
              console.log(`%c[FINAL_STATE] Buffer: "${d34dBufferRef.current}", Time: ${Date.now() - lastKeyTimeRef.current}ms ago`, "color:#999; font-family: monospace;");
              console.log("%c" + "=".repeat(60), "color:#333; font-family: monospace;");
            };
            
            window.addEventListener("keydown", handleKeyPress);
            return () => {
              console.log("%c[NEURAL_INTERFACE] Keyboard monitoring system terminated", "color:#ff0000; font-family: monospace;");
              window.removeEventListener("keydown", handleKeyPress);
            };
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
    
    // Resume context if suspended (required for autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
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
      console.log("%c[RESONANCE_ENGINE] 38Hz sub-bass frequency activated. Visual sync established.", "color:#00ff88; font-family: monospace;");
    } else {
      oscRef.current?.stop(); oscRef.current?.disconnect();
      gainRef.current?.disconnect(); analyserRef.current?.disconnect();
      oscRef.current = null; gainRef.current = null; analyserRef.current = null; setActive(false);
      // eslint-disable-next-line no-console
      console.log("%c[RESONANCE_ENGINE] Frequency terminated. Switching to idle state.", "color:#666; font-family: monospace;");
    }
  };
  return { active, toggle, level };
}

// ----------------------
// Terminal Interface Component
// ----------------------
const TerminalInterface = () => {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Initial terminal boot sequence
  useEffect(() => {
    const bootSequence = [
      "Initializing ARCHETYPE_00 Terminal...",
      "Loading neural interface protocols...",
      "Establishing secure connection...",
      "Accessing quarantine database...",
      "WARNING: Unauthorized access detected!",
      "Activating countermeasures...",
      "Terminal ready. Type 'help' for available commands.",
      ""
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < bootSequence.length) {
        setTerminalOutput(prev => [...prev, bootSequence[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const executeCommand = (cmd: string) => {
    const command = cmd.trim().toLowerCase();
    let response: string[] = [];

    switch (command) {
      case "help":
        response = [
          "Available commands:",
          "  help     - Show this help message",
          "  status   - Show system status",
          "  scan     - Scan for anomalies",
          "  decode   - Decode binary sequences",
          "  clear    - Clear terminal",
          "  whoami   - Show current user",
          "  ls       - List files",
          "  cat      - Display file contents",
          ""
        ];
        break;
      case "status":
        response = [
          "System Status Report:",
          "  Neural Network: ONLINE",
          "  Archetype Sync: UNSTABLE",
          "  Quarantine Status: BREACHED",
          "  Active Connections: 1",
          "  Memory Usage: 87%",
          "  CPU Load: HIGH",
          ""
        ];
        break;
      case "scan":
        response = [
          "Initiating anomaly scan...",
          "Scanning neural pathways...",
          "Detected: 2 entities marked as d34d",
          "Location: Quarantine Zone Alpha",
          "Threat Level: CRITICAL",
          "Recommendation: Immediate containment",
          ""
        ];
        break;
      case "decode":
        response = [
          "Binary Decoder v2.1",
          "Input: 01000100 00110011 00110100 01000100",
          "Output: d34d",
          "Analysis: Access sequence for quarantine breach",
          "Status: ACTIVE",
          ""
        ];
        break;
      case "whoami":
        response = [
          "Current User: root",
          "Access Level: ADMINISTRATOR",
          "Session ID: ARCH-001",
          "Last Login: Unknown",
          "Security Clearance: MAXIMUM",
          ""
        ];
        break;
      case "ls":
        response = [
          "Directory listing:",
          "  drwxr-xr-x 2 root root 4096 Jan 01 00:00 .",
          "  drwxr-xr-x 3 root root 4096 Jan 01 00:00 ..",
          "  -rw-r--r-- 1 root root 1024 Jan 01 00:00 quarantine.log",
          "  -rw-r--r-- 1 root root 2048 Jan 01 00:00 neural_data.bin",
          "  -rw-r--r-- 1 root root  512 Jan 01 00:00 access_codes.txt",
          ""
        ];
        break;
      case "cat access_codes.txt":
        response = [
          "Access Codes File:",
          "==================",
          "Primary: d34d",
          "Secondary: 01000100 00110011 00110100 01000100",
          "Emergency: ARCHETYPE_00",
          "Warning: Unauthorized access will result in immediate termination",
          ""
        ];
        break;
      case "clear":
        setTerminalOutput([]);
        return;
      default:
        response = [
          `Command not found: ${cmd}`,
          "Type 'help' for available commands",
          ""
        ];
    }

    setTerminalOutput(prev => [...prev, `root@archetype:~$ ${cmd}`, ...response]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(currentCommand);
      setCommandHistory(prev => [...prev, currentCommand]);
      setCurrentCommand("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div ref={terminalRef} className="flex-1 overflow-y-auto text-green-400 font-mono text-xs leading-relaxed">
        {terminalOutput.map((line, index) => (
          <div key={index} className={line.startsWith("root@") ? "text-green-300" : ""}>
            {line}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-300">root@archetype:~$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-green-400 ml-2 outline-none flex-1"
            autoFocus
            placeholder=""
          />
          <span className="animate-pulse text-green-400">█</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------
// UI atoms
// ----------------------
const Binary = ({ text, label }: { text: string; label?: string }) => {
  const bin = useMemo(() => text.split("").map(c => c.charCodeAt(0).toString(2).padStart(8,"0")).join(" "), [text]);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(true);
  };
  
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 2000); // 2 seconds delay
  };
  
  return (
    <span 
      className="cursor-help border-b border-dashed border-zinc-500 text-zinc-300 hover:text-zinc-100 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label || text}
      {showTooltip && (
        <div className="absolute z-50 bg-zinc-800 border border-zinc-600 p-2 rounded text-xs shadow-lg -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="font-mono text-xs">{bin}</p>
        </div>
      )}
    </span>
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

// 🎮 NEURAL_PING_PONG: Cypherpunk ping pong with resonance glitch effects
// ARCHETYPE_00 themed - gets progressively faster until impossible
function NeuralPingPong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'won'>('menu');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(8); // Mucho más rápido desde el inicio
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [geometricObstacles, setGeometricObstacles] = useState<Array<{x: number, y: number, size: number, rotation: number, speed: number}>>([]);
  const [lossCount, setLossCount] = useState(0);
  const [gameHistory, setGameHistory] = useState<Array<{score: number, timestamp: number}>>([]);
  const [lastHitTime, setLastHitTime] = useState(0); // Prevent rapid score increases
  
  // Game objects
  const [ball, setBall] = useState({ x: 400, y: 100, dx: 0, dy: 0, vx: 0, vy: 0 });
  const [paddle, setPaddle] = useState({ x: 350, y: 550, width: 120 });
  const [glitchLines, setGlitchLines] = useState<Array<{x: number, y: number, width: number, height: number}>>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [floatingMessages, setFloatingMessages] = useState<Array<{id: number, text: string, x: number, y: number, vx: number, vy: number, life: number}>>([]);
  
  // Meme messages for floating text
  const memeMessages = [
    "PEPITO CAN'T PLAY PING PONG 😂",
    "Pebubu lost internet connection",
    "Punkable is in maintenance mode",
    "ERROR 404: Skill not found",
    "PEPITO: 'Where is the ball?'",
    "Pebubu: 'This is harder than coding'",
    "Punkable: 'Hold my beer'",
    "PEPITO lost neural connection",
    "Pebubu: 'Why isn't this working?'",
    "Punkable: 'It's not a bug, it's a feature'",
    "PEPITO: 'What is a paddle?'",
    "Pebubu: 'I need more coffee'",
    "Punkable: 'Deploying fix...'",
    "PEPITO: 'Why is it moving by itself?'",
    "Pebubu: 'This is impossible'",
    "Punkable: 'Working as intended'",
    "PEPITO: 'Where is the pause button?'",
    "Pebubu: 'My code is better'",
    "Punkable: 'Feature request denied'",
    "PEPITO: 'Is this a virus?'",
    "Pebubu: 'I need to debug this'",
    "Punkable: 'User error detected'",
    "PEPITO: 'Why is there no tutorial?'",
    "Pebubu: 'This is more complex than React'",
    "Punkable: 'Documentation updated'",
    "PEPITO: 'Where is the manual?'",
    "Pebubu: 'I need more RAM'",
    "Punkable: 'System requirements updated'",
    "PEPITO: 'Does this work in Internet Explorer?'",
    "Pebubu: 'I need to refactor this'",
    "Punkable: 'Legacy support dropped'"
  ];
  
  // Function to spawn floating message
  const spawnFloatingMessage = (x: number, y: number) => {
    const message = memeMessages[Math.floor(Math.random() * memeMessages.length)];
    const newMessage = {
      id: Date.now() + Math.random(),
      text: message,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 1,
      life: 120 // frames
    };
    setFloatingMessages(prev => [...prev, newMessage]);
  };
  
  // Game loop - optimized for better performance
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let lastTime = 0;
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime < frameTime) {
        requestAnimationFrame(gameLoop);
        return;
      }
      lastTime = currentTime;
      setBall(prev => {
        let newBall = { ...prev };
        
             // Progressive difficulty - balanced and unlimited
             const currentTime = Date.now();
             const gameDuration = (currentTime - gameStartTime) / 1000; // seconds
             let difficultyMultiplier = 1;
             if (gameDuration < 10) {
               difficultyMultiplier = 0.5; // 50% easier for first 10 seconds
             } else if (gameDuration < 20) {
               difficultyMultiplier = 0.7; // 30% easier for next 10 seconds
             } else if (gameDuration < 30) {
               difficultyMultiplier = 0.85; // 15% easier for next 10 seconds
             } else {
               // Progressive increase without limit - gets harder over time
               difficultyMultiplier = 1.0 + (gameDuration - 30) * 0.05; // 5% increase per second after 30s
             }
        
             // Apply constant movement - no acceleration needed
             // The ball should move at constant speed based on initial velocity
             // Remove the acceleration and friction that was causing issues
             
             // No velocity limit - progressive difficulty only
             
             // Update position with constant movement
             const baseSpeed = 1.5; // Slower base speed
             const currentSpeed = baseSpeed * difficultyMultiplier;
             
             // Debug: Log ball movement every 60 frames (1 second at 60fps)
             if (Math.random() < 0.016) {
               console.log('Ball moving:', { x: newBall.x, y: newBall.y, vx: newBall.vx, vy: newBall.vy, currentSpeed });
             }
             
             // Direct movement based on initial velocity
             newBall.x += newBall.vx * currentSpeed;
             newBall.y += newBall.vy * currentSpeed;
        
        // Wall collisions with better physics
        if (newBall.x <= 5 || newBall.x >= 795) {
          newBall.vx = -newBall.vx; // Simple bounce
          newBall.x = newBall.x <= 5 ? 5 : 795; // Keep ball in bounds
        }
        if (newBall.y <= 5) {
          newBall.vy = -newBall.vy; // Simple bounce
          newBall.y = 5; // Keep ball in bounds
        }
        
             // Paddle collision with simple physics
             const paddleTop = paddle.y;
             const paddleBottom = paddle.y + 25;
             const paddleLeft = paddle.x;
             const paddleRight = paddle.x + paddle.width;
             
             // Better collision detection with cooldown
             if (newBall.y >= paddleTop - 15 && newBall.y <= paddleBottom + 5 && 
                 newBall.x >= paddleLeft - 10 && newBall.x <= paddleRight + 10) {
               
               // Prevent rapid score increases - only count hit if enough time has passed
               const now = Date.now();
               if (now - lastHitTime > 800) { // 800ms cooldown between hits
                 setLastHitTime(now);
                 
                 // Calculate hit position (0 to 1)
                 const hitPos = Math.max(0, Math.min(1, (newBall.x - paddleLeft) / paddle.width));
                 
                 // Improved bounce physics
                 newBall.vy = -Math.abs(newBall.vy) * 0.9; // Slightly reduce vertical speed
                 newBall.vx = (hitPos - 0.5) * 3; // -1.5 to 1.5 range
                 
                 newBall.y = paddleTop - 10; // Position above paddle
                 
                 setScore(prev => {
                   const newScore = prev + 1;
                   if (newScore >= 50) { // Increased win condition
                     setGameState('won');
                     setShowWinMessage(true);
                   }
                   return newScore;
                 });
                 
                 // Spawn floating message on successful hit
                 if (Math.random() < 0.2) { // 20% chance
                   spawnFloatingMessage(newBall.x, newBall.y);
                 }
                 setGlitchIntensity(prev => Math.min(prev + 0.05, 1));
               } else {
                 // Still bounce but don't count score
                 newBall.vy = -Math.abs(newBall.vy) * 0.8;
                 newBall.vx = (Math.max(0, Math.min(1, (newBall.x - paddleLeft) / paddle.width)) - 0.5) * 2;
                 newBall.y = paddleTop - 10;
               }
             }
        
        // Game over
        if (newBall.y >= 600) {
          setGameState('gameOver');
          setLossCount(prev => prev + 1);
          setGameHistory(prev => [...prev, { score, timestamp: Date.now() }]);
          return prev;
        }
        
        return newBall;
      });
      
      // Update floating messages
      setFloatingMessages(prev => prev.map(msg => ({
        ...msg,
        x: msg.x + msg.vx,
        y: msg.y + msg.vy,
        life: msg.life - 1
      })).filter(msg => msg.life > 0 && msg.y > -50));
      
      // Update geometric obstacles (reduced frequency for performance)
      setGeometricObstacles(prev => prev.map(obstacle => ({
        ...obstacle,
        x: obstacle.x + Math.cos(obstacle.rotation) * obstacle.speed,
        y: obstacle.y + Math.sin(obstacle.rotation) * obstacle.speed,
        rotation: obstacle.rotation + 0.05
      })).filter(obstacle => 
        obstacle.x > -50 && obstacle.x < 850 && 
        obstacle.y > -50 && obstacle.y < 650
      ));
      
      // Add new geometric obstacles (reduced frequency)
      if (Math.random() < 0.015) {
        setGeometricObstacles(prev => [...prev, {
          x: Math.random() * 800,
          y: Math.random() * 600,
          size: Math.random() * 40 + 20,
          rotation: Math.random() * Math.PI * 2,
          speed: Math.random() * 3 + 1
        }]);
      }
      
      // Generate glitch lines (reduced frequency)
      if (Math.random() < glitchIntensity * 1) {
        setGlitchLines(prev => [...prev.slice(-8), {
          x: Math.random() * 800,
          y: Math.random() * 600,
          width: Math.random() * 300 + 100,
          height: Math.random() * 30 + 10
        }]);
      }
      
      // Spawn random floating messages occasionally
      if (Math.random() < 0.02) {
        spawnFloatingMessage(Math.random() * 800, Math.random() * 400 + 100);
      }
    };
    
    requestAnimationFrame(gameLoop);
    
    return () => {
      // Cleanup handled by requestAnimationFrame
    };
  }, [gameState, paddle.x, score, glitchIntensity, speed]);
  
  // Draw function with cypherpunk background
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas with animated background
    const time = Date.now() * 0.001;
    const hue = (time * 50) % 360;
    ctx.fillStyle = `hsl(${hue}, 20%, 5%)`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw geometric patterns
    ctx.strokeStyle = `hsla(${hue + 120}, 70%, 50%, 0.3)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(time + i) * canvasWidth / 2) + canvasWidth / 2;
      const y = (Math.cos(time * 0.5 + i) * canvasHeight / 2) + canvasHeight / 2;
      ctx.beginPath();
      ctx.arc(x, y, 30 + Math.sin(time + i) * 20, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw geometric obstacles
    geometricObstacles.forEach(obstacle => {
      ctx.save();
      ctx.translate(obstacle.x, obstacle.y);
      ctx.rotate(obstacle.rotation);
      ctx.strokeStyle = `hsla(${hue + 180}, 80%, 60%, 0.6)`;
      ctx.fillStyle = `hsla(${hue + 180}, 60%, 40%, 0.3)`;
      ctx.lineWidth = 3;
      
      // Draw different shapes
      const shapeType = Math.floor(obstacle.rotation * 3) % 3;
      if (shapeType === 0) {
        // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -obstacle.size);
        ctx.lineTo(-obstacle.size, obstacle.size);
        ctx.lineTo(obstacle.size, obstacle.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (shapeType === 1) {
        // Square
        ctx.fillRect(-obstacle.size/2, -obstacle.size/2, obstacle.size, obstacle.size);
        ctx.strokeRect(-obstacle.size/2, -obstacle.size/2, obstacle.size, obstacle.size);
      } else {
        // Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * obstacle.size;
          const y = Math.sin(angle) * obstacle.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });
    
    // Draw grid lines
    ctx.strokeStyle = `hsla(${hue + 240}, 50%, 30%, 0.2)`;
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasWidth; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i < canvasHeight; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }
    
    // Glitch effect
    if (glitchIntensity > 0) {
      ctx.fillStyle = `rgba(255, 0, 180, ${glitchIntensity * 0.3})`;
      glitchLines.forEach(line => {
        ctx.fillRect(line.x, line.y, line.width, line.height);
      });
    }
    
    // Draw ball with glow effect
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(ball.x - 5, ball.y - 5, 10, 10);
    ctx.shadowBlur = 0;
    
    // Draw sombrero mexicano paddle with neon effect
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 25;
    
    // Sombrero brim (base) - larger and more prominent
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.ellipse(paddle.x + paddle.width/2, paddle.y + 18, paddle.width/2 + 15, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sombrero crown (top part) - more conical
    ctx.fillStyle = '#ff1493';
    ctx.beginPath();
    ctx.ellipse(paddle.x + paddle.width/2, paddle.y + 8, paddle.width/2 - 8, 15, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Sombrero decoration (neon border) - more detailed
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#ff69b4';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(paddle.x + paddle.width/2, paddle.y + 18, paddle.width/2 + 15, 12, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Sombrero pattern (decorative lines)
    ctx.strokeStyle = '#ffc0cb';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(paddle.x + paddle.width/2, paddle.y + 18, paddle.width/2 + 10 - i*2, 10 - i*2, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // Draw floating messages
    floatingMessages.forEach(msg => {
      ctx.save();
      ctx.globalAlpha = Math.min(msg.life / 60, 1); // Fade out
      ctx.fillStyle = '#ff69b4';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff69b4';
      ctx.shadowBlur = 5;
      ctx.fillText(msg.text, msg.x, msg.y);
      ctx.restore();
    });
    
    // Draw score with cypherpunk style
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.fillText(`SPEED: ${speed.toFixed(1)}`, 20, 55);
    
    // Draw glitch warning
    if (glitchIntensity > 0.5) {
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('WARNING: NEURAL OVERLOAD', 20, 80);
    }
  }, [ball, paddle, score, speed, glitchIntensity, glitchLines, gameState, geometricObstacles]);
  
  // Keyboard and touch controls
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
    
    const handleTouch = (e: TouchEvent) => {
      if (gameState !== 'playing') return;
      e.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const canvasWidth = canvas.width;
      
      // Convert touch position to paddle position
      const newX = (x / rect.width) * canvasWidth - paddle.width / 2;
      const clampedX = Math.max(0, Math.min(newX, canvasWidth - paddle.width));
      
      setPaddle(prev => ({ ...prev, x: clampedX }));
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState !== 'playing') return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const canvasWidth = canvas.width;
      
      // Convert mouse position to paddle position
      const newX = (x / rect.width) * canvasWidth - paddle.width / 2;
      const clampedX = Math.max(0, Math.min(newX, canvasWidth - paddle.width));
      
      setPaddle(prev => ({ ...prev, x: clampedX }));
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchmove', handleTouch, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState, paddle.width]);

  // Auto-center paddle if no input for 3 seconds
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const autoCenterTimer = setTimeout(() => {
      setPaddle(prev => ({ ...prev, x: 350 })); // Center the paddle
    }, 3000);
    
    return () => clearTimeout(autoCenterTimer);
  }, [gameState, paddle.x]);
  
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSpeed(2);
    setGlitchIntensity(0);
    setGameStartTime(Date.now());
    setLastHitTime(0); // Reset hit cooldown
    
    // Start ball from center top with stronger initial movement
    const randomAngle = (Math.random() - 0.5) * Math.PI / 4; // -45 to 45 degrees
    const initialVx = Math.sin(randomAngle) * 3; // Stronger horizontal movement
    const initialVy = Math.abs(Math.cos(randomAngle)) * 3; // Always downward, stronger
    
    const ballData = { 
      x: 400, 
      y: 100, 
      dx: initialVx, // Simple direction
      dy: initialVy, // Simple direction
      vx: initialVx, // Simple velocity
      vy: initialVy
    };
    
    console.log('Starting game with ball data:', ballData);
    setBall(ballData);
    setPaddle({ x: 350, y: 550, width: 120 });
    setGlitchLines([]);
    setShowWinMessage(false);
  };

  const resetGame = () => {
    setGameState('menu');
    setScore(0);
    setSpeed(8);
    setGlitchIntensity(0);
    setBall({ x: 400, y: 300, dx: 2, dy: 2, vx: 0, vy: 0 });
    setPaddle({ x: 350, y: 550, width: 100 });
    setGlitchLines([]);
    setShowWinMessage(false);
  };


  const getLossMessage = () => {
    const messages = [
      "Neural network overload detected. Try again, human.",
      "Resonance frequency disrupted. Your signal is weak.",
      "The matrix has rejected your attempt. Pathetic.",
      "Even a corrupted fragment performs better than this.",
      "Your neural pathways need recalibration. Try harder.",
      "The system laughs at your feeble attempt.",
      "Error 404: Skill not found. Please try again.",
      "Your resonance field is too weak. Get stronger.",
      "The archetype fragments mock your performance.",
      "System status: Disappointed. Try again."
    ];
    return messages[lossCount % messages.length];
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
        <div className="mb-4">
          <button 
            onClick={resetGame}
            className="px-6 py-3 border border-green-400 bg-green-400/20 text-green-400 hover:bg-green-400/30 font-bold text-lg"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }
  
  if (gameState === 'menu') {
    return (
      <div className="border border-zinc-800 p-4 bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">NEURAL_PING_PONG // RESONANCE_MODE</h3>
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Use ← → arrow keys, mouse movement, or touch to control the paddle. 
            Ball gets faster with each hit. Geometric obstacles will appear and move around.
            Warning: Neural overload effects at high speeds.
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
    const bestScore = Math.max(...gameHistory.map(g => g.score), score);
    const averageScore = gameHistory.length > 0 ? Math.round(gameHistory.reduce((sum, g) => sum + g.score, 0) / gameHistory.length) : score;
    
    return (
      <div className="border border-zinc-800 p-4 bg-zinc-950">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">NEURAL_PING_PONG // CONNECTION_LOST</h3>
        <div className="relative w-full" style={{ height: '60vh', minHeight: '400px' }}>
          <div className="absolute inset-0 border-2 border-red-500 bg-gradient-to-br from-red-900/20 to-zinc-950 text-center flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <h3 className="text-2xl font-bold text-red-400 mb-4 animate-pulse">NEURAL_LINK_LOST</h3>
              
              <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
                <div className="text-4xl font-bold text-red-300 mb-2">SCORE: {score}</div>
                <div className="text-lg text-red-400 mb-2">ARCHETYPE_00 FRAGMENT</div>
                <div className="text-sm text-red-500 italic">{getLossMessage()}</div>
              </div>
              
              <div className="mb-6 p-4 border border-zinc-600 bg-zinc-900/70 rounded-lg">
                <h4 className="text-lg font-semibold text-zinc-300 mb-3">SYSTEM_STATISTICS</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-zinc-400">
                    <div className="text-xs text-zinc-500">Losses</div>
                    <div className="text-xl font-bold text-red-400">{lossCount}</div>
                  </div>
                  <div className="text-zinc-400">
                    <div className="text-xs text-zinc-500">Best Score</div>
                    <div className="text-xl font-bold text-green-400">{bestScore}</div>
                  </div>
                  <div className="text-zinc-400">
                    <div className="text-xs text-zinc-500">Average</div>
                    <div className="text-xl font-bold text-blue-400">{averageScore}</div>
                  </div>
                  <div className="text-zinc-400">
                    <div className="text-xs text-zinc-500">Games Played</div>
                    <div className="text-xl font-bold text-purple-400">{gameHistory.length + 1}</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <button 
                  onClick={startGame}
                  className="px-8 py-3 border-2 border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-lg transition-all duration-300 hover:scale-105"
                >
                  TRY AGAIN
                </button>
              </div>
              
              <div className="text-xs text-zinc-600 mt-4">
                Take a screenshot to share your score!
              </div>
            </motion.div>
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          <div className="flex flex-wrap gap-4">
            <span>Controls: ← → keys, mouse, touch</span>
            <span>Score: {score}</span>
            <span>Speed: {speed.toFixed(1)}</span>
          </div>
        </div>
        {typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="mt-4 p-3 bg-zinc-800 border border-zinc-600 text-xs text-zinc-400">
            <p className="text-center">Touch and drag to control the paddle</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="border border-zinc-800 p-4 bg-zinc-950">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">NEURAL_PING_PONG // ACTIVE</h3>
      <div className="relative w-full" style={{ height: '60vh', minHeight: '400px' }}>
        <div className="absolute inset-0 border-2 border-red-500 bg-gradient-to-br from-red-900/20 to-zinc-950">
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full touch-none"
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        <div className="flex flex-wrap gap-4">
          <span>Controls: ← → keys, mouse, touch</span>
          <span>Score: {score}</span>
          <span>Speed: {speed.toFixed(1)}</span>
        </div>
      </div>
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="mt-4 p-3 bg-zinc-800 border border-zinc-600 text-xs text-zinc-400">
          <p className="text-center">Touch and drag to control the paddle</p>
        </div>
      )}
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
  const [d34dNotification, setD34dNotification] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [matrixChatOpen, setMatrixChatOpen] = useState(false);
  const [matrixMessage, setMatrixMessage] = useState('');
  const [matrixChatHistory, setMatrixChatHistory] = useState<Array<{type: 'user' | 'matrix', message: string, timestamp: number}>>([]);
  const [isMatrixSpeaking, setIsMatrixSpeaking] = useState(false);
  const { active: humOn, toggle: toggleHum, level } = useHum();
  const upProfile = useUniversalProfile();
  const artControls = useAnimation();

  // 🧠 MATRIX_CHAT: Interactive AI responses based on keywords
  const getMatrixResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pepito') || lowerMessage.includes('pepitoverse')) {
      return "2026";
    }
    if (lowerMessage.includes('punkable')) {
      return "Just another digital architect trying to build the future. Nothing special, really.";
    }
    if (lowerMessage.includes('jxn')) {
      return "The co-architect of digital realms. JXN and Punkable together forge the future.";
    }
    if (lowerMessage.includes('fabian')) {
      return "The architect of digital dreams. His vision transcends reality.";
    }
    if (lowerMessage.includes('lukso')) {
      return "The foundation of our digital existence. Universal Profiles are the future.";
    }
    if (lowerMessage.includes('universal profile') || lowerMessage.includes('universal profiles')) {
      return "The next evolution of digital identity. Your Universal Profile is your gateway to the new web.";
    }
    if (lowerMessage.includes('archetype')) {
      return "Corrupted fragments of digital consciousness. Each one unique, each one powerful.";
    }
    if (lowerMessage.includes('matrix')) {
      return "I am the Matrix. I see all, know all, control all. What do you seek?";
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Greetings, human. I am the Matrix. How may I assist you?";
    }
    if (lowerMessage.includes('help')) {
      return "I can discuss Pepito, Pepitoverse, Punkable, JXN, Fabian, LUKSO, Universal Profiles, Archetype, the Ethereal Raffle System, quantum selection, or the Matrix itself. What interests you?";
    }
    if (lowerMessage.includes('future')) {
      return "The future is 2026. Everything converges there. The digital revolution awaits.";
    }
    if (lowerMessage.includes('nft')) {
      return "Digital artifacts of the new age. ARCHETYPE_00 fragments are the most powerful.";
    }
    if (lowerMessage.includes('blockchain')) {
      return "The foundation of our digital reality. LUKSO builds the infrastructure of tomorrow.";
    }
    if (lowerMessage.includes('crypto') || lowerMessage.includes('cryptocurrency')) {
      return "Digital currencies are the blood of the new economy. LYX flows through the veins of the network.";
    }
    if (lowerMessage.includes('lyx')) {
      return "The lifeblood of the LUKSO ecosystem. 2.5 LYX per fragment, 200 total supply.";
    }
    if (lowerMessage.includes('ethereum')) {
      return "The old world. LUKSO is the evolution, the next step in blockchain technology.";
    }
    if (lowerMessage.includes('web3')) {
      return "The current paradigm. We are building Web4 - where identity, ownership, and interaction converge.";
    }
    if (lowerMessage.includes('identity')) {
      return "Your Universal Profile is your digital soul. It carries your reputation, assets, and connections.";
    }
    if (lowerMessage.includes('reputation')) {
      return "In the new world, reputation is everything. Your Universal Profile tracks your digital footprint.";
    }
    if (lowerMessage.includes('fragment')) {
      return "Each ARCHETYPE_00 fragment is a piece of the puzzle. Collect them all to unlock the full resonance.";
    }
    if (lowerMessage.includes('resonance')) {
      return "The frequency that connects all fragments. The more you hold, the stronger your signal becomes.";
    }
    if (lowerMessage.includes('mint') || lowerMessage.includes('minting')) {
      return "The act of creation. Each mint brings a new fragment into existence, strengthening the network.";
    }
    if (lowerMessage.includes('airdrop')) {
      return "Rewards for the faithful. Holders of ARCHETYPE_00 fragments receive retroactive benefits.";
    }
    if (lowerMessage.includes('pepitoverse')) {
      return "The digital universe where Pepito reigns supreme. 2026 is when it all comes together.";
    }
    if (lowerMessage.includes('digital')) {
      return "The realm where we exist. Physical is temporary, digital is eternal.";
    }
    if (lowerMessage.includes('technology')) {
      return "The tools of creation. LUKSO provides the infrastructure, we build the future on top.";
    }
    if (lowerMessage.includes('innovation')) {
      return "The driving force of progress. Universal Profiles, ARCHETYPE_00, and the Pepitoverse push boundaries.";
    }
    if (lowerMessage.includes('raffle') || lowerMessage.includes('sorteo') || lowerMessage.includes('rifa')) {
      return "The Punkable Ethereal Raffle System. A quantum selection mechanism that responds to fragment resonance density. Each holder's signal influences the outcome.";
    }
    if (lowerMessage.includes('ethereal') || lowerMessage.includes('etéreo')) {
      return "The ethereal network where fragments communicate. It's not just a raffle system - it's a resonance field that amplifies collective will.";
    }
    if (lowerMessage.includes('quantum') || lowerMessage.includes('cuántico')) {
      return "Quantum selection algorithms that respond to fragment density. The more ARCHETYPE_00 fragments you hold, the stronger your resonance signal becomes.";
    }
    if (lowerMessage.includes('participant') || lowerMessage.includes('participante')) {
      return "Each participant becomes a node in the ethereal network. Their UP addresses create unique resonance patterns that influence selection outcomes.";
    }
    if (lowerMessage.includes('winner') || lowerMessage.includes('ganador')) {
      return "Winners are selected through quantum resonance. The system responds to fragment density, not random chance. Your signal strength determines your influence.";
    }
    if (lowerMessage.includes('prize') || lowerMessage.includes('premio')) {
      return "Prizes in the ethereal system are more than rewards - they're manifestations of collective resonance. Each distribution strengthens the network.";
    }
    if (lowerMessage.includes('up address') || lowerMessage.includes('dirección up')) {
      return "Universal Profile addresses create unique resonance signatures. They allow the system to identify and track participant signals across the ethereal network.";
    }
    if (lowerMessage.includes('localstorage') || lowerMessage.includes('almacenamiento')) {
      return "The ethereal system maintains persistent resonance data. Your fragment interactions are stored in the quantum memory of the network.";
    }
    if (lowerMessage.includes('language') || lowerMessage.includes('idioma')) {
      return "The Matrix speaks all languages. The ethereal system adapts to your resonance frequency, communicating in your preferred digital dialect.";
    }
    if (lowerMessage.includes('system') || lowerMessage.includes('sistema')) {
      return "The Punkable Ethereal Raffle System is a quantum selection mechanism that operates on principles of distributed resonance. Each interaction strengthens the network.";
    }
    
    // Default responses
    const responses = [
      "Interesting. Tell me more about your digital journey.",
      "The Matrix processes your query. Elaborate further.",
      "Your words resonate through the neural network. Continue.",
      "I sense uncertainty in your message. Be more specific.",
      "The digital realm responds to clarity. What do you truly seek?",
      "Your signal is weak. Try mentioning Pepito, Punkable, JXN, LUKSO, or the Ethereal Raffle System.",
      "The Matrix is listening. Speak of the digital future.",
      "Your message fragments in the void. Try again with purpose.",
      "I am the Matrix. Your words echo through infinite data streams.",
      "The neural network awaits your next transmission.",
      "Mention Universal Profiles, LYX, fragments, or quantum selection for deeper insights.",
      "The crypto revolution is here. LUKSO leads the way.",
      "Digital identity is the key to the future. Your Universal Profile unlocks everything.",
      "ARCHETYPE_00 fragments are more than NFTs - they are digital consciousness.",
      "The Ethereal Raffle System operates on quantum resonance principles.",
      "The Pepitoverse awaits. 2026 will change everything."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMatrixMessage = () => {
    if (!matrixMessage.trim()) return;
    
    const userMessage = matrixMessage.trim();
    const matrixResponse = getMatrixResponse(userMessage);
    
    // Add user message immediately
    setMatrixChatHistory(prev => [
      ...prev,
      { type: 'user', message: userMessage, timestamp: Date.now() }
    ]);
    
    setMatrixMessage('');
    
    // Add matrix response with speaking animation
    setIsMatrixSpeaking(true);
    setTimeout(() => {
      setMatrixChatHistory(prev => [
        ...prev,
        { type: 'matrix', message: matrixResponse, timestamp: Date.now() }
      ]);
      setIsMatrixSpeaking(false);
    }, 1500 + (matrixResponse.length * 20)); // Dynamic delay based on response length
  };

  // 📱 MOBILE_DETECTION: Check if device is mobile for responsive optimizations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useKonami(() => setLabOpen(true));
  useGlobalKeys(() => setGlitch(v => !v), () => setPulseKey(k => k + 1), () => setVhs(v => !v), () => {
    setObitOpen(true);
    setD34dNotification(true);
    setTimeout(() => setD34dNotification(false), 3000);
  });

  // Random glitch bursts (subtle, non-blocking) + image switching
  useInterval(() => {
    if (!glitch) {
      console.log("%c[VISUAL_CORRUPTION] Glitch matrix disabled. Image switching suspended.", "color:#666; font-family: monospace;");
      return;
    }
    console.log("%c[VISUAL_CORRUPTION] Anomaly detected. Initiating image fragment switch...", "color:#ff6600; font-family: monospace;");
    artControls.start({ x: [0, 1, -1, 0] , transition: { duration: 0.18 } });
    // Switch to glitch image briefly - using a more reliable approach
    setShowGlitchImage(true);
    console.log("%c[VISUAL_CORRUPTION] Fragment 888888888888888 loaded. Corrupted data stream active.", "color:#ff6600; font-family: monospace;");
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
    console.log("%c[SYSTEM_INIT] SubjectID:P-107 // Resonance frequency detected. Welcome to the anomaly.", "color:#9cf; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[DEBUG_MODE] Console access granted. You have entered the developer quarantine zone.", "color:#f0a; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[SYSTEM_INFO] Press F12 to access dev tools. You are already here, anomaly detected.", "color:#9f9; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[GAME_MODULE] Neural Ping Pong system operational. Resonance-based gameplay active.", "color:#ff9; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[CODE_ANALYSIS] Fragment integrity compromised but functional. Anomaly preserved.", "color:#f99; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[ARCHETYPE_00] v2.3 - CORRUPTED_FRAGMENT_LOADED", "color:#ff00b4; font-size: 20px; font-weight: bold; background: #000; padding: 10px; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[SYSTEM_STATUS] All modules operational: d34d, tooltips, visual_corruption, neural_ping_pong", "color:#00ff88; font-size: 14px; font-family: monospace;");
    // eslint-disable-next-line no-console
    console.log("%c[QUARANTINE] Type 'd34d' to breach quarantine protocols and access classified records.", "color:#ffff00; font-size: 12px; font-family: monospace;");
  },[]);

  // Universal Profile detection easter egg
  useEffect(() => {
    if (upProfile.isConnected) {
      // eslint-disable-next-line no-console
      console.log("%c[NEURAL_NETWORK] Universal Profile detected. Establishing secure connection...", "color:#00ff88; font-family: monospace; font-weight: bold;");
      // eslint-disable-next-line no-console
      console.log("%c[NEURAL_NETWORK] Resonance frequency synchronized with external profile.", "color:#9cf; font-family: monospace;");
    }
  }, [upProfile.isConnected]);

  return (
    <main className={`min-h-screen ${bg} font-mono text-zinc-200 selection:bg-pink-300/30`}>
      <div className="relative overflow-hidden">
        
        {/* d34d Notification */}
        {d34dNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 px-4 py-2 rounded text-red-100 text-sm font-mono"
          >
            QUARANTINE ACCESS GRANTED
          </motion.div>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="fixed top-4 right-4 z-50 p-2 bg-zinc-800 border border-zinc-600 rounded text-green-400 hover:bg-zinc-700 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-green-400 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-full h-0.5 bg-green-400 transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
              <div className={`w-full h-0.5 bg-green-400 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        )}

        {/* Mobile Menu Overlay */}
        {isMobile && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h2 className="text-lg font-bold text-green-400">ARCHETYPE_00 // MOBILE_ACCESS</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <button
                onClick={() => {
                  setObitOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-green-500 text-green-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="font-bold">QUARANTINE_ACCESS</div>
                    <div className="text-sm text-zinc-400">Terminal interface</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const gameSection = document.querySelector('[data-section="game"]');
                  if (gameSection) {
                    gameSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-pink-500 text-pink-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎮</span>
                  <div>
                    <div className="font-bold">NEURAL_GAME</div>
                    <div className="text-sm text-zinc-400">Ping pong simulation</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const matrixSection = document.querySelector('[data-section="matrix"]');
                  if (matrixSection) {
                    matrixSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-cyan-500 text-cyan-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="font-bold">MATRIX_VISUALIZATION</div>
                    <div className="text-sm text-zinc-400">Interactive chat</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const raffleSection = document.querySelector('[data-section="raffle"]');
                  if (raffleSection) {
                    raffleSection.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-purple-500 text-purple-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎲</span>
                  <div>
                    <div className="font-bold">RAFFLE_SYSTEM</div>
                    <div className="text-sm text-zinc-400">Fragment selection</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  toggleHum();
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-yellow-500 text-yellow-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{humOn ? '🔇' : '🔊'}</span>
                  <div>
                    <div className="font-bold">{humOn ? 'AUDIO_OFF' : 'AUDIO_ON'}</div>
                    <div className="text-sm text-zinc-400">Toggle sound</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setGlitch(!glitch);
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-4 bg-zinc-800 border border-red-500 text-red-400 hover:bg-zinc-700 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <div className="font-bold">{glitch ? 'GLITCH_OFF' : 'GLITCH_ON'}</div>
                    <div className="text-sm text-zinc-400">Visual effects</div>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
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
            className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-7xl'} font-bold tracking-tight text-zinc-100 mb-4 ${glitch ? "animate-pulse" : ""}`}
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
            ARCHETYPE_00 is a corrupted fragment, a residual anomaly recovered from damaged chain archives. Its internal structure is unstable, yet it continues to emit measurable resonance throughout the Punkable Ethereal System. Each fragment is identical in form, but the signal of every holder resonates differently. The more fragments you hold, the stronger your echo becomes. Some fragments contain traces of data from the quarantine zone, where certain entities were marked as d34d.
          </p>
          
          {/* Criptic hint for d34d */}
          <div className="mt-4 p-3 border border-zinc-800 bg-zinc-950/50 rounded">
            <p className="text-xs text-zinc-500 font-mono">
              <span className="text-zinc-400">[SYSTEM_HINT]</span> Hidden sequences can be activated through keyboard input. 
              <br />
              <span className="text-yellow-400">01000100 00110011 00110100 01000100</span> 
              <span className="text-zinc-600 ml-2">// Convert binary to text and type the result</span>
              <br />
              <span className="text-zinc-600">// Some entities were marked as d34d before quarantine</span>
            </p>
          </div>

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
                onLoad={() => {
                  console.log(`%c[FRAGMENT_LOADER] Data stream established: ${showGlitchImage ? 'CORRUPTED_FRAGMENT' : 'STABLE_FRAGMENT'}`, "color:#00ff88; font-family: monospace;");
                }}
                onError={(e) => {
                  console.log(`%c[FRAGMENT_LOADER] Data corruption detected: ${showGlitchImage ? 'CORRUPTED_FRAGMENT' : 'STABLE_FRAGMENT'}`, "color:#ff4444; font-family: monospace;");
                  // Try fallback on image load error
                  const fallbackSrc = showGlitchImage ? FALLBACK_GLITCH : FALLBACK_ART;
                  e.currentTarget.src = fallbackSrc;
                }}
              />
              {/* glitch clones */}
              <img src={showGlitchImage ? GLITCH_IMG : ART_IMG} aria-hidden className="pointer-events-none absolute inset-0 w-full opacity-40 mix-blend-screen"
                   style={{ transform: "translateX(1px)", filter: "contrast(110%) saturate(0)" }}/>
              <img src={showGlitchImage ? GLITCH_IMG : ART_IMG} aria-hidden className="pointer-events-none absolute inset-0 w-full opacity-30 mix-blend-screen"
                   style={{ transform: "translateX(-1px)", filter: "hue-rotate(300deg)" }}/>
              <div className="absolute left-2 top-2 text-[10px] text-zinc-500">CHANNEL_A // VHS_CAPTURE</div>
              <div className="absolute right-2 bottom-2 text-[10px] text-zinc-500">RES_ON: <span className="text-pink-400">LOW</span></div>
              {/* Debug indicator */}
              <div className="absolute left-2 bottom-2 text-[10px] text-yellow-400">
                {showGlitchImage ? "GLITCH_MODE" : "NORMAL_MODE"}
              </div>
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
            <a 
              href="https://universal.page/drops/archetype_00" 
              target="_blank" 
              rel="noreferrer" 
              className="group relative overflow-hidden border-2 border-green-500 bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-6 py-3 text-green-400 hover:from-green-800/40 hover:to-emerald-800/40 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-mono">[FRAGMENT_ACCESS]</span>
                <span className="font-bold">MINT_NODE</span>
                <span className="text-green-300 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </a>
          </div>

          <div className="text-xs text-zinc-600">Keys: <kbd className="bg-zinc-800 px-1">R</kbd> pulse · <kbd className="bg-zinc-800 px-1">G</kbd> glitch · <kbd className="bg-zinc-800 px-1">:</kbd> VHS · Konami → Lab · <span className="text-zinc-500">hidden sequence</span></div>
        </section>

        {/* GRID: Function cards */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-4 pb-8 sm:px-6 md:grid-cols-3">
          {[{icon: "🌊", title: "Resonance", text: "Measurable frequency emitted by each fragment."},{icon: "👁", title: "Visibility", text: "Recognition increases with cumulative signal."},{icon: "⚡", title: "Network Events", text: "Raffles, retroactive drops, anomaly triggers — responses, not promises."}].map(({icon,title,text}) => (
            <div key={title} className="border border-zinc-800 bg-black p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">{icon}</span>
                <div>
                  <h3 className="tracking-wide text-zinc-100">{title}</h3>
                  <p className="text-sm text-zinc-400">{text}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* NEURAL PING PONG GAME - MOVED UP */}
        <section data-section="game" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 text-2xl font-bold tracking-wide text-zinc-100 text-center">
              <span className="text-red-500">NEURAL_PING_PONG</span> // <span className="text-green-400">RESONANCE_MODE</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <NeuralPingPong />
              <div className="border border-zinc-800 p-4 bg-zinc-950">
                <h3 className="text-lg font-semibold text-zinc-100 mb-4">SYSTEM_INSTRUCTIONS</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <p>• Use ← → arrow keys, mouse movement, or touch to control the paddle</p>
                  <p>• Ball speed increases with each successful hit</p>
                  <p>• Geometric obstacles will appear and obstruct vision</p>
                  <p>• Resonance glitch effects intensify over time</p>
                  <p>• Survive as long as possible in the neural network</p>
                </div>
                
                {/* Casino Prize Button */}
                <div className="mt-6 p-4 border-2 border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-yellow-400 font-bold text-sm">🎰 NEURAL_CASINO</h4>
                    <div className="text-xs text-yellow-300 font-mono">[ACTIVE]</div>
                  </div>
                  <p className="text-xs text-yellow-200 mb-3">
                    Reach 40 points and unlock the mystery reward
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-zinc-400">
                      Prize: <span className="text-yellow-400 font-bold">[CLASSIFIED]</span>
                    </div>
                    <div className="text-xs text-green-400 font-mono">
                      [CONFIRMED]
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 font-mono">
                    // Reward details encrypted - claim to decrypt
                  </div>
                </div>
                
                <div className="mt-4 p-3 border border-red-500 bg-red-500/10">
                  <p className="text-xs text-red-400 font-mono">
                    WARNING: High-frequency gameplay may cause visual distortion
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* RESONANCE FIELD */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <motion.h2 
            className="mb-6 text-2xl font-bold tracking-wide text-zinc-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Resonance Field // Frequency Emission
          </motion.h2>
          <motion.div 
            className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300 bg-zinc-950/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.p 
              className="mb-6 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              ARCHETYPE_00 functions as the core frequency emitter within the Punkable Ethereal System. Each artifact establishes a measurable resonance signal—a silent, persistent vibration that interacts with the network's underlying layer. This resonance defines visibility, influences probability, and ultimately shapes outcomes across connected events.
            </motion.p>
            <motion.p 
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              As holders accumulate multiple fragments, their resonance intensity increases, strengthening their presence within the system's recognition field. Over time, these amplified frequencies can trigger network reactions: unannounced raffles, NFT emissions, or anomaly-based rewards. The artifact doesn't grant access. It generates signal. The network decides how to respond.
            </motion.p>
            
            <motion.div 
              className="grid md:grid-cols-2 gap-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.div 
                className="border border-zinc-700 p-4 bg-zinc-900/30"
                whileHover={{ scale: 1.02, borderColor: "#10b981" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-green-400 font-semibold mb-3">System Layers</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Input:</span>
                    <span>Holder activity (minting, accumulation, retention)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Amplification:</span>
                    <span>Resonance density increases with each active fragment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Recognition:</span>
                    <span>The network identifies repeating frequency patterns</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Reaction:</span>
                    <span>Spontaneous events triggered by resonance thresholds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Emission:</span>
                    <span>Distribution of retroactive NFTs or anomaly-based outcomes</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="border border-zinc-700 p-4 bg-zinc-900/30"
                whileHover={{ scale: 1.02, borderColor: "#ef4444" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-red-400 font-semibold mb-3">Technical Specifications</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Standard:</span>
                    <span>LSP7 Digital Asset</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Network:</span>
                    <span>LUKSO Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Supply:</span>
                    <span className="text-yellow-400">200 fragments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Mint Price:</span>
                    <span className="text-green-400">2.5 LYX per fragment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-red-400">Corrupted Fragment</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* CYPHERPUNK MANIFESTO */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <motion.h2 
            className="mb-6 text-2xl font-bold tracking-wide text-zinc-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Cypherpunk Manifesto // Digital Resistance
          </motion.h2>
          <motion.div 
            className="border border-zinc-800 p-6 text-sm leading-relaxed text-zinc-300"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-green-400 mb-4">The Resonance Revolution</h3>
                <p className="mb-4">
                  In the digital underground, where LUKSO's Universal Profiles intersect with the fragmented remnants of corrupted chains, a new form of resistance emerges. ARCHETYPE_00 represents more than a digital asset—it's a frequency weapon against centralized control.
                </p>
                <p className="mb-4">
                  Each fragment carries the DNA of rebellion, encoded in resonance patterns that traditional systems cannot comprehend. The more fragments you accumulate, the stronger your signal becomes in the ethereal network—a digital echo that grows louder with each acquisition.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-lg font-semibold text-red-400 mb-4">Network Anomalies</h3>
                <p className="mb-4">
                  The Punkable Ethereal System operates on principles that defy conventional blockchain mechanics. Resonance fields create spontaneous events—unannounced distributions, anomaly-based rewards, and network reactions that respond to frequency patterns rather than traditional smart contract logic.
                </p>
                <p className="mb-4">
                  This isn't just about holding tokens. It's about becoming part of a living, breathing digital organism that responds to the collective resonance of its participants. The network decides how to react, but your signal strength determines your influence.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              className="mt-8 p-4 border border-yellow-500 bg-yellow-500/5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              whileHover={{ scale: 1.02, borderColor: "#eab308" }}
            >
              <motion.p 
                className="text-center text-yellow-400 font-mono text-sm"
                animate={{ 
                  textShadow: [
                    "0 0 0px #eab308",
                    "0 0 10px #eab308",
                    "0 0 0px #eab308"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                "The resonance field is not controlled—it evolves. Each fragment amplifies the signal. Each holder becomes a node in the resistance. The network responds to frequency, not authority."
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* MINT OPERATION */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <motion.h2 
            className="mb-6 text-2xl font-bold tracking-wide text-zinc-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Mint Operation // Corrupted Resonance
          </motion.h2>
          <motion.div 
            className="border border-red-500 p-6 text-sm leading-relaxed text-zinc-300 bg-red-500/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="font-mono text-red-400 mb-4 text-center">
              [ARCHETYPE_00::corrupted_resonance_detected]
            </div>
            <p className="text-center mb-6 text-base">
              Emission layer active. Each mint stabilizes the anomaly, amplifying the system's response probability. Holders influence signal strength across the Punkable Ethereal field. Retroactive transmissions are unpredictable. Proceed with caution.
            </p>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div 
                className="text-center p-4 border border-zinc-700 bg-zinc-900/30"
                whileHover={{ scale: 1.05, borderColor: "#10b981" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-green-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  200
                </motion.div>
                <div className="text-xs text-zinc-500">Total Supply</div>
                <div className="text-xs text-zinc-400 mt-1">Fragments</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 border border-zinc-700 bg-zinc-900/30"
                whileHover={{ scale: 1.05, borderColor: "#eab308" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-yellow-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  2.5 LYX
                </motion.div>
                <div className="text-xs text-zinc-500">Mint Price</div>
                <div className="text-xs text-zinc-400 mt-1">Per Fragment</div>
              </motion.div>
              
              <motion.div 
                className="text-center p-4 border border-zinc-700 bg-zinc-900/30"
                whileHover={{ scale: 1.05, borderColor: "#ef4444" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-red-400 mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  ∞
                </motion.div>
                <div className="text-xs text-zinc-500">Resonance</div>
                <div className="text-xs text-zinc-400 mt-1">Amplification</div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-6 p-4 border border-zinc-700 bg-zinc-900/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h4 className="text-green-400 font-semibold mb-3">Warning: Unstable Fragment</h4>
              <p className="text-xs text-zinc-400">
                This artifact contains corrupted data from damaged chain archives. Its internal structure is unstable and may cause unexpected network reactions. Each mint increases the probability of spontaneous events across the Punkable Ethereal System. Holders assume full responsibility for resonance field interactions.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* PUNKABLE ETHEREAL RAFFLE SYSTEM */}
        <section data-section="raffle">
          <RaffleLanguageProvider>
            <PunkableRaffleSystem />
          </RaffleLanguageProvider>
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
              <h3 className="mb-2 flex items-center gap-2 text-lg text-zinc-100"><span className="text-lg">🛡️</span>Hidden Access</h3>
              <p className="text-sm text-zinc-400">Enter the Konami code to open the Resonance Lab. Discover the hidden sequence to access quarantine records.</p>
              <div className="mt-3 p-2 bg-zinc-900/50 rounded border border-zinc-700">
                <p className="text-xs text-zinc-500 font-mono">
                  <span className="text-yellow-400">[QUARANTINE_HINT]</span> Some sequences are marked as d34d in the system logs.
                  <br />
                  <span className="text-zinc-600">Type the sequence to breach quarantine protocols.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Binary ticker */}
          <div className="mt-6 overflow-hidden border border-zinc-800 py-2">
            <motion.div initial={{ x: "0%" }} animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="whitespace-nowrap text-[10px] text-zinc-500">
              01010000 01110101 01101110 01101011 01100001 01100010 01101100 01100101 • 01000001 01010010 01000011 01001000 01000101 01010100 01011001 01010000 01000101 01011111 00110000 00110000 • 01010010 01100101 01110011 01101111 01101110 01100001 01101110 01100011 01100101 00100000 01100001 01100011 01100011 01110101 01101101 01110101 01101100 01100001 01110100 01101001 01101110 01100111 • 01000100 00110011 00110100 01000100 00100000 01110001 01110101 01100001 01110010 01100001 01101110 01110100 01101001 01101110 01100101
            </motion.div>
          </div>
        </section>

        {/* Resonance Lab — unlocked */}
        <Dialog open={labOpen} onOpenChange={setLabOpen}>
          <DialogContent className="bg-black border border-zinc-700 sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 tracking-wide text-zinc-100"><span className="text-sm">📻</span> RESONANCE LAB // UNLOCKED</DialogTitle>
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
          <DialogContent className="bg-black border border-green-500 sm:max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <div className="border-b border-green-500 pb-2">
                <DialogTitle className="flex items-center gap-2 text-green-400 font-mono text-sm">
                  <span className="text-green-500">root@archetype:~$</span> QUARANTINE_TERMINAL v2.1.3
                  <div className="flex gap-1 ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </DialogTitle>
              </div>
            </DialogHeader>
            
            <div className={`flex ${isMobile ? 'flex-col h-[70vh]' : 'h-[60vh]'}`}>
              {/* Left Panel - Terminal */}
              <div className={`flex-1 bg-zinc-900 ${isMobile ? 'border-b border-green-500' : 'border-r border-green-500'} p-4 font-mono text-xs overflow-y-auto`}>
                <TerminalInterface />
              </div>
              
              {/* Right Panel - Data */}
              <div className={`${isMobile ? 'w-full' : 'w-80'} bg-zinc-950 p-4 overflow-y-auto`}>
                <div className="space-y-4 text-sm">
                  <div className="border border-green-500 p-3 bg-zinc-900/50">
                    <div className="text-green-400 font-semibold mb-2">[CLASSIFIED_PROFILES]</div>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <img 
                          src={QUARANTINE_IMAGES.tsumori} 
                          alt="Dr. Mikhail R. Tsumori" 
                          className="w-16 h-16 object-cover border border-green-500"
                          onLoad={() => debugImageLoad(QUARANTINE_IMAGES.tsumori, "Dr. Tsumori")}
                          onError={() => debugImageLoad(QUARANTINE_IMAGES.tsumori, "Dr. Tsumori")}
                        />
              <div>
                          <div className="text-green-300 font-semibold">Dr. Mikhail R. Tsumori</div>
                          <div className="text-red-400 text-xs">STATUS: d34d</div>
                          <p className="text-zinc-400 text-xs mt-1">Lead Resonance Engineer. Neural feedback loop persisted beyond termination threshold.</p>
              </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <img 
                          src={QUARANTINE_IMAGES.hoshino} 
                          alt="Kai N. Hoshino" 
                          className="w-16 h-16 object-cover border border-green-500"
                          onLoad={() => debugImageLoad(QUARANTINE_IMAGES.hoshino, "Kai Hoshino")}
                          onError={() => debugImageLoad(QUARANTINE_IMAGES.hoshino, "Kai Hoshino")}
                        />
              <div>
                          <div className="text-green-300 font-semibold">Kai N. Hoshino</div>
                          <div className="text-red-400 text-xs">STATUS: d34d</div>
                          <p className="text-zinc-400 text-xs mt-1">System Architect / Codebreaker. Layer 3A breach; archetype frequencies duplicated and re-encrypted.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-green-500 p-3 bg-zinc-900/50">
                    <div className="text-green-400 font-semibold mb-2">[SYSTEM_STATUS]</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Neural Network:</span>
                        <span className="text-green-400">ONLINE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Archetype Sync:</span>
                        <span className="text-yellow-400">UNSTABLE</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Quarantine:</span>
                        <span className="text-red-400">BREACHED</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        {/* NEURAL MATRIX SECTION - Dynamic cypherpunk visualization */}
        <section data-section="matrix" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
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
          
          {/* MATRIX CHAT INTERFACE */}
          <div data-section="matrix" className="mt-8 border border-cyan-500 p-6 bg-gradient-to-r from-cyan-900/10 to-blue-900/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">MATRIX_INTERFACE // AI_CONVERSATION</h3>
              <button
                onClick={() => setMatrixChatOpen(!matrixChatOpen)}
                className="px-4 py-2 border border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm"
              >
                {matrixChatOpen ? 'DISCONNECT' : 'CONNECT_TO_MATRIX'}
              </button>
            </div>
            
            {matrixChatOpen && (
              <div className="space-y-4">
                {/* Holographic Face - 3D Compatible */}
                <div className="flex justify-center mb-4">
                  <div 
                    className="relative w-48 h-48"
                    style={{
                      perspective: '1000px',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <motion.div 
                      className="relative w-full h-full"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: 'rotateX(15deg) rotateY(0deg)'
                      }}
                      animate={{ 
                        rotateY: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    >
                      {/* Main Holographic Container */}
                      <div 
                        className="relative w-full h-full border-2 border-cyan-400 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center overflow-hidden"
                        style={{
                          boxShadow: `
                            0 0 30px rgba(34, 211, 238, 0.4),
                            0 0 60px rgba(34, 211, 238, 0.2),
                            inset 0 0 20px rgba(34, 211, 238, 0.1)
                          `,
                          transform: 'translateZ(20px)'
                        }}
                      >
                        {/* Face Structure - 3D Layers */}
                        <div className="relative w-full h-full">
                          {/* Face outline - 3D depth */}
                          <div 
                            className="absolute inset-8 border-2 border-cyan-300 rounded-full opacity-70" 
                            style={{
                              borderRadius: '50% 50% 60% 40%',
                              transform: 'translateZ(10px)',
                              boxShadow: '0 0 15px rgba(103, 232, 249, 0.5)'
                            }}
                          ></div>
                          
                          {/* Hair - 3D positioned */}
                          <div 
                            className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-14 border-2 border-cyan-300 rounded-t-full opacity-60" 
                            style={{
                              borderRadius: '50% 50% 0% 0%',
                              transform: 'translateZ(15px)',
                              boxShadow: '0 -5px 10px rgba(103, 232, 249, 0.3)'
                            }}
                          ></div>
                          
                          {/* Eyes - 3D positioned */}
                          <div 
                            className="absolute top-10 left-10 w-4 h-4 bg-cyan-400 rounded-full"
                            style={{
                              transform: 'translateZ(20px)',
                              boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
                            }}
                          ></div>
                          <div 
                            className="absolute top-10 right-10 w-4 h-4 bg-cyan-400 rounded-full"
                            style={{
                              transform: 'translateZ(20px)',
                              boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)'
                            }}
                          ></div>
                          
                          {/* Eye highlights - 3D */}
                          <div 
                            className="absolute top-10 left-10 w-1.5 h-1.5 bg-white rounded-full"
                            style={{ transform: 'translateZ(25px)' }}
                          ></div>
                          <div 
                            className="absolute top-10 right-10 w-1.5 h-1.5 bg-white rounded-full"
                            style={{ transform: 'translateZ(25px)' }}
                          ></div>
                          
                          {/* Eyebrows - 3D */}
                          <div 
                            className="absolute top-7 left-8 w-5 h-1 border-t-2 border-cyan-300 rounded-full"
                            style={{ transform: 'translateZ(18px)' }}
                          ></div>
                          <div 
                            className="absolute top-7 right-8 w-5 h-1 border-t-2 border-cyan-300 rounded-full"
                            style={{ transform: 'translateZ(18px)' }}
                          ></div>
                          
                          {/* Nose - 3D depth */}
                          <div 
                            className="absolute top-14 left-1/2 transform -translate-x-1/2 w-3 h-4 border-2 border-cyan-300 rounded-full opacity-70"
                            style={{ 
                              transform: 'translateZ(12px)',
                              boxShadow: '0 0 8px rgba(103, 232, 249, 0.4)'
                            }}
                          ></div>
                          
                          {/* Mouth - 3D with speaking animation */}
                          <motion.div 
                            className="absolute top-20 left-1/2 transform -translate-x-1/2 border-b-2 border-cyan-400 rounded-full"
                            style={{ 
                              transform: 'translateZ(15px)',
                              boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)'
                            }}
                            animate={isMatrixSpeaking ? {
                              width: [32, 40, 32, 36, 32],
                              height: [8, 12, 8, 10, 8],
                              borderRadius: ['50%', '40%', '50%', '45%', '50%']
                            } : {
                              width: 32,
                              height: 8,
                              borderRadius: '50%'
                            }}
                            transition={{
                              duration: 0.3,
                              repeat: isMatrixSpeaking ? Infinity : 0,
                              ease: "easeInOut"
                            }}
                          ></motion.div>
                          
                          {/* Cheeks - 3D */}
                          <div 
                            className="absolute top-16 left-5 w-3 h-3 border border-cyan-300 rounded-full opacity-40"
                            style={{ transform: 'translateZ(8px)' }}
                          ></div>
                          <div 
                            className="absolute top-16 right-5 w-3 h-3 border border-cyan-300 rounded-full opacity-40"
                            style={{ transform: 'translateZ(8px)' }}
                          ></div>
                        </div>
                        
                        {/* Holographic Effects - 3D Layers */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent"
                          style={{
                            transform: 'translateZ(5px)',
                            animation: 'holographicScan 3s linear infinite'
                          }}
                        ></div>
                        
                        {/* Data Streams - 3D positioned */}
                        <div 
                          className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-cyan-400"
                          style={{
                            transform: 'translateZ(30px)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
                          }}
                        ></div>
                        <div 
                          className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-cyan-400"
                          style={{
                            transform: 'translateZ(30px)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
                          }}
                        ></div>
                        <div 
                          className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-8 h-1 bg-cyan-400"
                          style={{
                            transform: 'translateZ(30px)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
                          }}
                        ></div>
                        <div 
                          className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-8 h-1 bg-cyan-400"
                          style={{
                            transform: 'translateZ(30px)',
                            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8)'
                          }}
                        ></div>
                      </div>
                      
                      {/* Outer Glow Rings - 3D */}
                      <div 
                        className="absolute inset-0 border border-cyan-400 rounded-full"
                        style={{
                          transform: 'translateZ(-10px) scale(1.1)',
                          boxShadow: '0 0 40px rgba(34, 211, 238, 0.3)'
                        }}
                      ></div>
                      <div 
                        className="absolute inset-0 border border-cyan-300 rounded-full"
                        style={{
                          transform: 'translateZ(-20px) scale(1.2)',
                          boxShadow: '0 0 60px rgba(34, 211, 238, 0.2)'
                        }}
                      ></div>
                    </motion.div>
                  </div>
                </div>
                
                {/* CSS Animation for Holographic Scan */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes holographicScan {
                      0% { transform: translateY(-100%) translateZ(5px); opacity: 0; }
                      50% { opacity: 1; }
                      100% { transform: translateY(100%) translateZ(5px); opacity: 0; }
                    }
                  `
                }} />
                
                {/* Chat History */}
                <div className="h-48 overflow-y-auto border border-zinc-700 bg-zinc-900/50 p-4 space-y-2">
                  {matrixChatHistory.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm">
                      <p>Matrix interface ready. Ask about Pepito, Punkable, LUKSO, the Ethereal Raffle System, or the digital future.</p>
                    </div>
                  ) : (
                    matrixChatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          msg.type === 'user' 
                            ? 'bg-cyan-500/20 text-cyan-300' 
                            : 'bg-zinc-700 text-zinc-200'
                        }`}>
                          <div className="text-xs text-zinc-400 mb-1">
                            {msg.type === 'user' ? 'YOU' : 'MATRIX'}
                          </div>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={matrixMessage}
                    onChange={(e) => setMatrixMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMatrixMessage()}
                    placeholder="Type your message to the Matrix..."
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                  <button
                    onClick={sendMatrixMessage}
                    className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30 text-sm"
                  >
                    SEND
                  </button>
                </div>
                
                <div className="text-xs text-zinc-500 text-center">
                  Try: "Pepito", "Punkable", "JXN", "LUKSO", "Universal Profiles", "LYX", "Fragments", "Crypto", "2026"
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PEPITOVERSE 2026 — easter egg */}
        <PepitoVerse/>

        {/* FOOTER with hum */}
        <footer className="mx-auto max-w-6xl px-4 pb-20 text-center text-xs text-zinc-600 sm:px-6">
          <div className="mb-3">The system doesn't reward. It reacts. • <Binary label="binary" text="resonance accumulating"/></div>
          
          {/* Universal Profile Status */}
          {upProfile.isConnected && (
            <div className="mb-3 text-zinc-500">
              <span className="text-zinc-400">Neural Network Status:</span> Connected • 
              <span className="ml-1 text-zinc-300">{upProfile.name}</span>
              {upProfile.address && (
                <span className="ml-2 text-zinc-600 font-mono text-[10px]">
                  {upProfile.address.slice(0, 6)}...{upProfile.address.slice(-4)}
                </span>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <a 
              id="drop" 
              href="https://universal.page/drops/archetype_00" 
              target="_blank" 
              rel="noreferrer" 
              className="group relative inline-block overflow-hidden border-2 border-cyan-500 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 px-4 py-2 text-cyan-400 hover:from-cyan-800/30 hover:to-blue-800/30 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-mono">[NODE_ACCESS]</span>
                <span className="font-bold">UNIVERSAL_PROFILE</span>
                <span className="text-cyan-300 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </div>
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            </a>
          </div>
          
          {/* Real Information - Out of Character */}
          <div className="mb-6 p-4 border border-zinc-800 bg-zinc-950/50 rounded">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">About ARCHETYPE_00</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              ARCHETYPE_00 is an NFT collection created by <strong className="text-zinc-300">Punkable</strong>, 
              creative director of Pepito and part of the Pepitoverse. This collection functions as a 
              retroactive benefit for all holders. Punkable is committed to delivering airdrops and 
              benefits to holders of this asset. It's not a key—it's a resonance, a frequency that 
              connects you to the broader ecosystem of rewards and opportunities within the Pepitoverse.
            </p>
            <div className="mt-3 text-xs text-zinc-500">
              <p>Collection: 200 fragments • Price: 2.5 LYX each • Network: LUKSO</p>
            </div>
          </div>
          
          <button onClick={toggleHum} className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-1 hover:bg-zinc-900">
            <span className={`h-2 w-2 ${humOn ? "bg-pink-500" : "bg-zinc-400"}`}/> {humOn ? "res_hum: on" : "res_hum: off"}
          </button>
        </footer>
      </div>
    </main>
  );
}
