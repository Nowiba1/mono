import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { BoardCenterArt, BoardThemeType, getThemeBoardStyles } from '../assets/ThemeBackgrounds';
import { CharacterArt } from '../assets/CharacterArt';
import { LandmarkIcon } from '../assets/BoardSpaceArt';
import { BuildingArt } from '../assets/BuildingArt';
import { PawnToken } from '../assets/PawnToken';
import { AuctionGavelIcon, CurrencyBadge, DiceFaceSvg, PardonPassBadge, VictoryTrophyIcon } from '../assets/UIObjects';
import { BOARD_SPACES, DISTRICT_COLORS, DISTRICT_NAMES } from '../config/board.data';
import { CHARACTERS } from '../config/characters.data';
import { DEFAULT_GAME_SETTINGS, SPEED_GAME_SETTINGS } from '../config/rules.config';
import { AudioEngine } from '../engines/AudioEngine';
import { BoardEngine } from '../engines/BoardEngine';
import { Dice3dPhysics, Dice3dTransform } from '../engines/Dice3dPhysics';
import { EconomyEngine } from '../engines/EconomyEngine';
import { gameEvents } from '../engines/EventBus';
import { RulesEngine } from '../engines/RulesEngine';
import { SaveEngine } from '../engines/SaveEngine';
import {
  BoardSpace,
  BotDifficulty,
  CharacterEmote,
  CharacterId,
  DistrictColor,
  GameState,
  Player,
  PlayerAction,
  TradeOffer,
} from '../engines/types';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { LocalAdapter } from '../network/LocalAdapter';
import { LanAdapter } from '../network/LanAdapter';
import { FirebaseAdapter } from '../network/FirebaseAdapter';
import { NetworkAdapter } from '../network/NetworkAdapter';
import { BoardRenderer } from './board/BoardRenderer';
import { BoardThemeKey } from './board/theme.types';
import { fitBoard } from './board/geometry';

type AppScreen = 'menu' | 'setup' | 'lobby' | 'game' | 'rules' | 'settings';

interface FloatingNotice {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
  timestamp: number;
}

export default function App() {
  // App-level state
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [theme, setTheme] = useState<BoardThemeType>('classic');
  const [tilt3d, setTilt3d] = useState<boolean>(true);
  const [haptics, setHaptics] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sfxVol, setSfxVol] = useState<number>(0.8);
  const [musicVol, setMusicVol] = useState<number>(0.35);
  const [gameSpeed, setGameSpeed] = useState<'1x' | '2x' | '3x'>('1x');

  // Active game session
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [adapter, setAdapter] = useState<NetworkAdapter | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [showAssetManager, setShowAssetManager] = useState<boolean>(false);
  const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [floatingNotices, setFloatingNotices] = useState<FloatingNotice[]>([]);
  const [selectedTradePartnerId, setSelectedTradePartnerId] = useState<string | null>(null);
  const [tradeOfferCash, setTradeOfferCash] = useState<number>(0);
  const [tradeRequestCash, setTradeRequestCash] = useState<number>(0);
  const [tradeOfferProps, setTradeOfferProps] = useState<number[]>([]);
  const [tradeRequestProps, setTradeRequestProps] = useState<number[]>([]);

  // Setup options
  const [gameMode, setGameMode] = useState<'solo' | 'lan' | 'online'>('solo');
  const [isHost, setIsHost] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>('Grand Developer');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('thorne');
  const [botCount, setBotCount] = useState<number>(3);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('NORMAL');
  const [useFastRules, setUseFastRules] = useState<boolean>(false);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('EMP-777');
  const [lobbyPlayers, setLobbyPlayers] = useState<Player[]>([]);

  // 3D Dice physics overlay state
  const [isRollingDice, setIsRollingDice] = useState<boolean>(false);
  const [diceTransforms, setDiceTransforms] = useState<{ d1: Dice3dTransform; d2: Dice3dTransform }>({
    d1: { rotX: 0, rotY: 0, rotZ: 0 },
    d2: { rotX: 0, rotY: 0, rotZ: 0 },
  });

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);
  const isRtl = lang === 'ar';

  // Check for auto-save on startup
  const hasAutoSave = useMemo(() => Boolean(SaveEngine.loadAutoSave()), []);

  // Update HTML direction attribute for full RTL
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  // Helper to add floating toast notifications
  const addToast = useCallback((text: string, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setFloatingNotices((prev) => [...prev.slice(-3), { id, text, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setFloatingNotices((prev) => prev.filter((n) => n.id !== id));
    }, 2400);
  }, []);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#38bdf8', '#ec4899', '#fde047'],
      });
    } catch {
      // Ignore if canvas unavailable
    }
  }, []);

  // Wire up audio, haptics, and event bus subscribers
  useEffect(() => {
    const unsubDice = gameEvents.on('DICE_ROLLED', (ev) => {
      AudioEngine.playDiceRoll();
      const payload = ev.data as { sum?: number };
      if (payload?.sum) {
        addToast(`Rolled ${payload.sum}!`, 'neutral');
      }
    });

    const unsubStep = gameEvents.on('TOKEN_MOVED', () => {
      AudioEngine.playTokenStep();
    });

    const unsubCash = gameEvents.on('RENT_PAID', (ev) => {
      AudioEngine.playCashChime();
      const payload = ev.data as { amount?: number; propertyName?: string };
      if (payload?.amount) {
        addToast(`-$${payload.amount} Rent Paid`, 'negative');
      }
    });

    const unsubBuy = gameEvents.on('PROPERTY_BOUGHT', (ev) => {
      AudioEngine.playCashChime();
      const payload = ev.data as { price?: number };
      if (payload?.price) {
        addToast(`Deed Acquired (-$${payload.price})`, 'positive');
      }
    });

    const unsubBuild = gameEvents.on('HOUSE_BUILT', () => {
      AudioEngine.playBuildSound();
      addToast(`Building Erected! 🏗️`, 'positive');
    });

    const unsubCard = gameEvents.on('CARD_DRAWN', () => {
      AudioEngine.playCardFlip();
    });

    const unsubJail = gameEvents.on('SENT_TO_JAIL', () => {
      AudioEngine.playJailDoor();
      addToast(`Arrest Warrant Issued! 🚨`, 'negative');
    });

    const unsubAuction = gameEvents.on('AUCTION_BID', () => {
      AudioEngine.playAuctionGavel();
    });

    const unsubBankrupt = gameEvents.on('BANKRUPTCY', () => {
      AudioEngine.playBankruptcy();
      addToast(`Developer Liquidated! 💥`, 'negative');
    });

    const unsubVictory = gameEvents.on('VICTORY', () => {
      AudioEngine.playVictoryFanfare();
      triggerConfetti();
      addToast(`🏆 GRAND SOVEREIGN VICTORY!`, 'positive');
    });

    const unsubGo = gameEvents.on('GO_COLLECTED', (ev) => {
      AudioEngine.playCashChime();
      const payload = ev.data as { stipend?: number };
      addToast(`+$${payload?.stipend || 200} Salary`, 'positive');
    });

    return () => {
      unsubDice();
      unsubStep();
      unsubCash();
      unsubBuy();
      unsubBuild();
      unsubCard();
      unsubJail();
      unsubAuction();
      unsubBankrupt();
      unsubVictory();
      unsubGo();
    };
  }, [addToast, triggerConfetti]);

  // Auto-save on game state update
  useEffect(() => {
    if (gameState && gameState.phase !== 'GAME_OVER') {
      SaveEngine.autoSave(gameState);
    }
  }, [gameState]);

  // Launch a new Solo / Bot game
  const startSoloGame = useCallback(() => {
    AudioEngine.unlock();
    AudioEngine.startBackgroundMusic();

    const humanPlayer: Player = {
      id: 'player_human',
      name: playerName.trim() || 'Grand Developer',
      characterId: selectedChar,
      color: CHARACTERS.find((c) => c.id === selectedChar)?.color || '#3b82f6',
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      isBot: false,
      emote: 'idle',
    };

    const botCandidates = CHARACTERS.filter((c) => c.id !== selectedChar);
    const botPlayers: Player[] = [];

    for (let i = 0; i < botCount; i++) {
      const charConfig = botCandidates[i % botCandidates.length];
      botPlayers.push({
        id: `bot_${charConfig.id}_${i}`,
        name: charConfig.name,
        characterId: charConfig.id,
        color: charConfig.color,
        cash: 1500,
        position: 0,
        inJail: false,
        jailTurns: 0,
        getOutOfJailCards: 0,
        isBankrupt: false,
        isBot: true,
        difficulty: botDifficulty,
        personality: charConfig.defaultPersonality,
        emote: 'idle',
      });
    }

    const allPlayers = [humanPlayer, ...botPlayers];
    const settings = useFastRules ? SPEED_GAME_SETTINGS : DEFAULT_GAME_SETTINGS;
    const initial = RulesEngine.createInitialState(allPlayers, settings);

    const localAdapter = new LocalAdapter();
    localAdapter.connect('local_room', humanPlayer.id, true);
    localAdapter.broadcastState(initial);
    localAdapter.onState((s) => setGameState(s));

    setAdapter(localAdapter);
    setGameState(initial);
    setScreen('game');
  }, [botCount, botDifficulty, playerName, selectedChar, useFastRules]);

  // Launch Online Firebase Multiplayer
  const startOnlineMultiplayer = useCallback(async () => {
    AudioEngine.unlock();
    AudioEngine.startBackgroundMusic();

    const humanPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim() || 'Grand Developer',
      characterId: selectedChar,
      color: CHARACTERS.find((c) => c.id === selectedChar)?.color || '#3b82f6',
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      isBot: false,
      emote: 'idle',
    };

    const code = roomCodeInput.trim().toUpperCase() || 'EMP-777';
    const fbAdapter = new FirebaseAdapter();
    await fbAdapter.connect(code, humanPlayer.id, isHost);

    if (isHost) {
      // Add initial players with bots if requested
      const botCandidates = CHARACTERS.filter((c) => c.id !== selectedChar);
      const botPlayers: Player[] = [];
      for (let i = 0; i < botCount; i++) {
        const charConfig = botCandidates[i % botCandidates.length];
        botPlayers.push({
          id: `bot_${charConfig.id}_${i}`,
          name: charConfig.name,
          characterId: charConfig.id,
          color: charConfig.color,
          cash: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          getOutOfJailCards: 0,
          isBankrupt: false,
          isBot: true,
          difficulty: botDifficulty,
          personality: charConfig.defaultPersonality,
          emote: 'idle',
        });
      }

      const allPlayers = [humanPlayer, ...botPlayers];
      const settings = useFastRules ? SPEED_GAME_SETTINGS : DEFAULT_GAME_SETTINGS;
      const initial = RulesEngine.createInitialState(allPlayers, settings);

      await fbAdapter.broadcastState(initial);
      setGameState(initial);
    }

    fbAdapter.onState((s) => setGameState(s));
    setAdapter(fbAdapter);
    setScreen('game');
  }, [botCount, botDifficulty, isHost, playerName, roomCodeInput, selectedChar, useFastRules]);

  // Launch LAN WebRTC Multiplayer
  const startLanMultiplayer = useCallback(async () => {
    AudioEngine.unlock();
    AudioEngine.startBackgroundMusic();

    const humanPlayer: Player = {
      id: `player_lan_${Date.now()}`,
      name: playerName.trim() || 'Grand Developer',
      characterId: selectedChar,
      color: CHARACTERS.find((c) => c.id === selectedChar)?.color || '#3b82f6',
      cash: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: 0,
      isBankrupt: false,
      isBot: false,
      emote: 'idle',
    };

    const code = roomCodeInput.trim().toUpperCase() || 'LAN-100';
    const lanAdapter = new LanAdapter();
    await lanAdapter.connect(code, humanPlayer.id, isHost);

    if (isHost) {
      const botCandidates = CHARACTERS.filter((c) => c.id !== selectedChar);
      const botPlayers: Player[] = [];
      for (let i = 0; i < botCount; i++) {
        const charConfig = botCandidates[i % botCandidates.length];
        botPlayers.push({
          id: `bot_${charConfig.id}_${i}`,
          name: charConfig.name,
          characterId: charConfig.id,
          color: charConfig.color,
          cash: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          getOutOfJailCards: 0,
          isBankrupt: false,
          isBot: true,
          difficulty: botDifficulty,
          personality: charConfig.defaultPersonality,
          emote: 'idle',
        });
      }

      const allPlayers = [humanPlayer, ...botPlayers];
      const settings = useFastRules ? SPEED_GAME_SETTINGS : DEFAULT_GAME_SETTINGS;
      const initial = RulesEngine.createInitialState(allPlayers, settings);

      await lanAdapter.broadcastState(initial);
      setGameState(initial);
    }

    lanAdapter.onState((s) => setGameState(s));
    setAdapter(lanAdapter);
    setScreen('game');
  }, [botCount, botDifficulty, isHost, playerName, roomCodeInput, selectedChar, useFastRules]);

  // Resume game from autosave
  const resumeSavedGame = useCallback(() => {
    const saved = SaveEngine.loadAutoSave();
    if (!saved) return;

    AudioEngine.unlock();
    AudioEngine.startBackgroundMusic();

    const localAdapter = new LocalAdapter();
    localAdapter.connect('local_room', saved.players[0].id, true);
    localAdapter.broadcastState(saved);
    localAdapter.onState((s) => setGameState(s));

    setAdapter(localAdapter);
    setGameState(saved);
    setScreen('game');
  }, []);

  // Send action to network adapter / rules engine
  const dispatchAction = useCallback(
    async (action: PlayerAction) => {
      if (!adapter || !gameState) return;

      // If rolling dice, trigger dynamic 3D physics animation first
      if (action.type === 'ROLL_DICE') {
        setIsRollingDice(true);
        const targetD1 = Math.floor(Math.random() * 6) + 1;
        const targetD2 = Math.floor(Math.random() * 6) + 1;

        const anim1 = Dice3dPhysics.calculateTumbleAnimation(targetD1);
        const anim2 = Dice3dPhysics.calculateTumbleAnimation(targetD2);

        setDiceTransforms({ d1: anim1.midpoint, d2: anim2.midpoint });

        setTimeout(() => {
          setDiceTransforms({ d1: anim1.final, d2: anim2.final });
          setTimeout(() => {
            setIsRollingDice(false);
            adapter.sendAction(action);
          }, 350);
        }, 450);
        return;
      }

      await adapter.sendAction(action);
    },
    [adapter, gameState]
  );

  // Active player info
  const activePlayer = useMemo(() => {
    if (!gameState) return null;
    return gameState.players[gameState.activePlayerIndex] || null;
  }, [gameState]);

  const isMyTurn = useMemo(() => {
    if (!activePlayer) return false;
    return !activePlayer.isBot;
  }, [activePlayer]);

  const currentSpace = useMemo(() => {
    if (!activePlayer) return null;
    return BoardEngine.getSpace(activePlayer.position);
  }, [activePlayer]);

  // Theme board classes
  const themeClasses = useMemo(() => getThemeBoardStyles(theme), [theme]);

  // Handle Emoji reaction
  const handleEmojiReaction = useCallback(
    (emoji: string) => {
      AudioEngine.vibrate(25);
      addToast(`${activePlayer?.name || 'Player'}: ${emoji}`, 'neutral');
    },
    [activePlayer, addToast]
  );

  // ----------------------------------------------------
  // SCREEN: MAIN MENU
  // ----------------------------------------------------
  if (screen === 'menu') {
    return (
      <main className="w-full h-screen h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-radial from-slate-900 via-slate-950 to-black text-slate-100 overflow-y-auto">
        {/* Header Branding */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <div>
              <h1 className="font-display font-black text-xl sm:text-2xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                EMPIRE CITY
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider">{t.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextLang: SupportedLanguage = lang === 'en' ? 'ar' : lang === 'ar' ? 'fr' : 'en';
                setLang(nextLang);
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition"
              aria-label="Toggle language"
            >
              {lang.toUpperCase()}
            </button>
            <button
              onClick={() => setScreen('settings')}
              className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition"
              aria-label={t.settings}
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* Hero Character Showcase */}
        <section className="my-auto flex flex-col items-center justify-center text-center py-4">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative z-10 flex -space-x-4">
              <CharacterArt id="cloud" emote="happy" size={72} className="transform -rotate-6" />
              <CharacterArt id="thorne" emote="winner" size={92} className="z-20 transform scale-110" />
              <CharacterArt id="fox" emote="thinking" size={72} className="transform rotate-6" />
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide mt-2">
            {t.appName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1 px-4 leading-relaxed">
            Acquire 22 illustrated landmarks across 8 architectural districts. Build monopolies, negotiate trades, and conquer the high throne.
          </p>
        </section>

        {/* Primary Action Buttons */}
        <nav className="flex flex-col gap-2.5 max-w-md w-full mx-auto pb-4">
          {hasAutoSave && (
            <button
              onClick={resumeSavedGame}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm sm:text-base text-white shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <span>▶️</span>
              <span>{t.resumeGame}</span>
            </button>
          )}

          <button
            onClick={() => {
              setGameMode('solo');
              setScreen('setup');
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 font-bold text-sm sm:text-base text-slate-950 shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <span>👤</span>
            <span>{t.playSolo}</span>
          </button>

          <button
            onClick={() => {
              setGameMode('online');
              setScreen('setup');
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 font-bold text-sm text-slate-200 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <span>🌐</span>
            <span>{t.playOnline} (Realtime DB)</span>
          </button>

          <button
            onClick={() => {
              setGameMode('lan');
              setScreen('setup');
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 font-bold text-sm text-slate-200 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <span>📶</span>
            <span>{t.playLocal} (WebRTC)</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setScreen('rules')}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              📜 {t.rulesAndGuide}
            </button>
            <button
              onClick={() => setScreen('settings')}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              ⚙️ {t.settings}
            </button>
          </div>
        </nav>
      </main>
    );
  }

  // ----------------------------------------------------
  // SCREEN: SETUP (Player selection, bot count, difficulty)
  // ----------------------------------------------------
  if (screen === 'setup') {
    return (
      <main className="w-full h-screen h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-y-auto">
        <header className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={() => setScreen('menu')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>←</span>
            <span>{t.backToMenu}</span>
          </button>
          <h2 className="font-display font-bold text-lg text-amber-400">
            {gameMode === 'solo' ? t.playSolo : gameMode === 'lan' ? t.playLocal : t.playOnline}
          </h2>
          <div className="w-12" />
        </header>

        <section className="my-auto py-4 max-w-md w-full mx-auto space-y-4">
          {/* Online / LAN Host vs Join toggle */}
          {gameMode !== 'solo' && (
            <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setIsHost(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  isHost ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Host New Session
              </button>
              <button
                onClick={() => setIsHost(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  !isHost ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Join with Room Code
              </button>
            </div>
          )}

          {/* Player Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Developer Alias</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold focus:outline-none focus:border-amber-400"
              maxLength={20}
            />
          </div>

          {/* Character Carousel */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Choose Character</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {CHARACTERS.map((char) => {
                const isSelected = selectedChar === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedChar(char.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-md shadow-amber-950/60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CharacterArt id={char.id} emote={isSelected ? 'happy' : 'idle'} size={40} />
                    <span className="text-[10px] font-bold text-slate-300 mt-1 truncate max-w-[55px]">
                      {char.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <span className="font-bold text-amber-300">
                {CHARACTERS.find((c) => c.id === selectedChar)?.title}:
              </span>{' '}
              <span className="text-slate-400 italic">
                "{CHARACTERS.find((c) => c.id === selectedChar)?.quote}"
              </span>
            </div>
          </div>

          {/* Bot Count & Difficulty (Solo Mode or Host Mode) */}
          {(gameMode === 'solo' || isHost) && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>AI Rival Developers</span>
                  <span className="text-amber-400 font-bold">{botCount} Bots</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setBotCount(count)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                        botCount === count
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">AI Engine Intelligence</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['EASY', 'NORMAL', 'HARD'] as BotDifficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setBotDifficulty(diff)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        botDifficulty === diff
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {diff === 'EASY' ? t.easy : diff === 'NORMAL' ? t.normal : t.hard}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Local / Online Room Code Input */}
          {gameMode !== 'solo' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {isHost ? 'Room Session ID' : t.roomCode}
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono tracking-widest text-center uppercase font-bold text-amber-400"
                placeholder="EMP-777"
              />
            </div>
          )}

          {/* Fast Rules Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">Express Municipal Rules</div>
              <div className="text-[11px] text-slate-400">$2,000 Starting Cash, $300 GO, Double GO Bonus</div>
            </div>
            <input
              type="checkbox"
              checked={useFastRules}
              onChange={(e) => setUseFastRules(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded"
            />
          </div>
        </section>

        <footer className="pt-3 max-w-md w-full mx-auto pb-4">
          <button
            onClick={() => {
              if (gameMode === 'solo') {
                startSoloGame();
              } else if (gameMode === 'online') {
                startOnlineMultiplayer();
              } else {
                startLanMultiplayer();
              }
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 font-bold text-slate-950 text-sm sm:text-base shadow-lg shadow-amber-950/50 transition active:scale-[0.98]"
          >
            {t.startGame}
          </button>
        </footer>
      </main>
    );
  }

  // ----------------------------------------------------
  // SCREEN: SETTINGS & AUDIO MIXER
  // ----------------------------------------------------
  if (screen === 'settings') {
    return (
      <main className="w-full h-screen h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-y-auto">
        <header className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={() => setScreen(gameState ? 'game' : 'menu')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>←</span>
            <span>{gameState ? 'Back to Board' : t.backToMenu}</span>
          </button>
          <h2 className="font-display font-bold text-lg text-amber-400">{t.settings}</h2>
          <div className="w-12" />
        </header>

        <section className="my-auto py-4 max-w-md w-full mx-auto space-y-4">
          {/* Board Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">{t.boardTheme}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['classic', 'neon', 'ancient'] as BoardThemeType[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setTheme(thm)}
                  className={`py-2 text-xs font-bold rounded-lg border capitalize transition ${
                    theme === thm
                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Perspective Tilt Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">{t.tilt3d}</div>
              <div className="text-[11px] text-slate-400">Cinematic 24° isometric board tilt</div>
            </div>
            <button
              onClick={() => setTilt3d(!tilt3d)}
              className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                tilt3d ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">{t.haptics}</div>
              <div className="text-[11px] text-slate-400">Tactile pulse on rolls, purchases, and auctions</div>
            </div>
            <button
              onClick={() => {
                const state = AudioEngine.toggleHaptics();
                setHaptics(state);
              }}
              className={`w-12 h-6 rounded-full transition p-1 flex items-center ${
                haptics ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
            </button>
          </div>

          {/* Audio Mixer */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Audio Synthesis</span>
              <button
                onClick={() => {
                  const muted = AudioEngine.toggleMute();
                  setIsMuted(muted);
                }}
                className={`text-xs px-2.5 py-1 rounded font-bold transition ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{t.soundVolume}</span>
                <span>{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  AudioEngine.setVolumes(val, musicVol);
                }}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{t.musicVolume}</span>
                <span>{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setMusicVol(val);
                  AudioEngine.setVolumes(sfxVol, val);
                }}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Export / Import Save */}
          {gameState && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const json = SaveEngine.exportToJson(gameState);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `empire_city_save_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300 hover:bg-slate-800 transition"
              >
                💾 {t.exportSave}
              </button>
            </div>
          )}
        </section>

        <footer className="pt-3 max-w-md w-full mx-auto pb-4">
          <button
            onClick={() => setScreen(gameState ? 'game' : 'menu')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs uppercase tracking-wider text-slate-200 transition"
          >
            {t.close}
          </button>
        </footer>
      </main>
    );
  }

  // ----------------------------------------------------
  // SCREEN: RULES & TUTORIAL
  // ----------------------------------------------------
  if (screen === 'rules') {
    return (
      <main className="w-full h-screen h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-y-auto">
        <header className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            onClick={() => setScreen(gameState ? 'game' : 'menu')}
            className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
          >
            <span>←</span>
            <span>{t.backToMenu}</span>
          </button>
          <h2 className="font-display font-bold text-lg text-amber-400">{t.rulesAndGuide}</h2>
          <div className="w-12" />
        </header>

        <section className="my-auto py-4 max-w-lg w-full mx-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed overflow-y-auto max-h-[70vh] pr-2">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1">1. Object of the Game</h3>
            <p>
              Acquire prime district properties, build complete color monopolies, construct Eco-Villas and Grand Citadels, and collect rent from rival developers until all opponents face bankruptcy.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1">2. Movement & Doubles</h3>
            <p>
              Roll two 6-sided dice to advance. Rolling doubles grants an immediate extra turn! However, rolling <strong>three consecutive doubles</strong> triggers a municipal arrest warrant, marching you straight to City Detention.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1">3. Construction & Even-Building</h3>
            <p>
              You must own all properties in a color district before constructing. You must build evenly: each property must have 1 villa before any can receive a 2nd villa. 4 villas are exchanged for 1 Grand Citadel.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1">4. Municipal Auctions</h3>
            <p>
              If a developer declines to purchase an unowned property, it immediately goes to open auction where all players (including the decliner) can bid starting from $10.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-amber-300 text-sm mb-1">5. City Detention (Jail)</h3>
            <p>
              Escape by paying $50 bail, playing a Pardon Pass, or rolling doubles (up to 3 attempts). You still collect rent while detained!
            </p>
          </div>
        </section>

        <footer className="pt-3 max-w-md w-full mx-auto pb-4">
          <button
            onClick={() => setScreen(gameState ? 'game' : 'menu')}
            className="w-full py-3 rounded-xl bg-amber-500 font-bold text-slate-950 text-sm transition"
          >
            {t.close}
          </button>
        </footer>
      </main>
    );
  }

  // ----------------------------------------------------
  // SCREEN: IN-GAME BOARD VIEW
  // ----------------------------------------------------
  if (!gameState || !activePlayer) {
    return null;
  }

  // Calculate coordinates for 11x11 square board layout
  const getSpaceCoordinates = (index: number) => {
    if (index >= 0 && index <= 10) {
      return { col: 11 - index, row: 11 };
    } else if (index >= 11 && index <= 20) {
      return { col: 1, row: 11 - (index - 10) };
    } else if (index >= 21 && index <= 30) {
      return { col: 1 + (index - 20), row: 1 };
    } else {
      return { col: 11, row: 1 + (index - 30) };
    }
  };

  return (
    <div className="w-full h-screen h-[100dvh] flex flex-col justify-between bg-slate-950 text-slate-100 overflow-hidden select-none relative">
      {/* Floating Notices Toasts */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-none w-full max-w-xs px-2">
        {floatingNotices.map((n) => (
          <div
            key={n.id}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${
              n.type === 'positive'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60'
                : n.type === 'negative'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/60'
                : 'bg-slate-900/90 text-amber-300 border-amber-500/50'
            }`}
          >
            {n.text}
          </div>
        ))}
      </div>

      {/* 1. TOP BAR: Opponents Strip, Log toggle, Settings */}
      <header className="w-full px-2 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between z-30 shrink-0">
        {/* Opponents Mini Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65vw] py-0.5 scrollbar-none">
          {gameState.players.map((p, idx) => {
            const isTurn = idx === gameState.activePlayerIndex;
            const deedsCount = Object.values(gameState.properties).filter((own) => own.ownerId === p.id).length;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition ${
                  p.isBankrupt
                    ? 'opacity-40 bg-slate-950 border-slate-800'
                    : isTurn
                    ? 'bg-amber-500/20 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="relative">
                  <CharacterArt id={p.characterId} emote={p.emote} size={28} />
                  {isTurn && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </div>
                <div className="text-[10px] leading-tight">
                  <div className="font-bold truncate max-w-[60px]" style={{ color: p.color }}>
                    {p.name.split(' ')[0]}
                  </div>
                  <div className="font-mono text-emerald-300 font-semibold">${p.cash}</div>
                  <div className="text-[9px] text-slate-400">{deedsCount} deeds</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const nextSpd = gameSpeed === '1x' ? '2x' : gameSpeed === '2x' ? '3x' : '1x';
              setGameSpeed(nextSpd);
              addToast(`Game Speed: ${nextSpd}`, 'neutral');
            }}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-amber-400"
            title="Speed Toggle"
          >
            {gameSpeed}
          </button>
          <button
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
            title="Session Log"
          >
            📜
          </button>
          <button
            onClick={() => setScreen('settings')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
            title={t.settings}
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* 2. CENTER: RESPONSIVE 11x11 BOARD CONTAINER */}
      <section
        style={{ backgroundColor: '#000000' }}
        className="flex-1 w-full flex items-center justify-center relative p-1 sm:p-2 perspective-board overflow-hidden bg-black"
      >
        <BoardRenderer
          gameState={gameState}
          themeKey={theme as BoardThemeKey}
          boardSizePx={Math.min(
            typeof window !== 'undefined' ? Math.min(window.innerWidth - 16, (window.innerHeight - 150) * 0.95) : 360,
            680
          )}
          selectedSpaceId={selectedSpaceId}
          tiltEnabled={tilt3d}
          cameraMode="follow"
          onTileClick={(id) => setSelectedSpaceId(id)}
          onRollClick={() => {
            if (isMyTurn && gameState.phase === 'START_TURN') {
              dispatchAction({ type: 'ROLL_DICE' });
            }
          }}
        />
      </section>

      {/* 3. BOTTOM THUMB-FRIENDLY ACTION HUD */}
      <footer className="w-full bg-slate-950/95 border-t border-slate-800/80 p-2 sm:p-3 z-30 shrink-0">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Active Player Status Badge */}
          <div className="flex items-center gap-2">
            <CharacterArt id={activePlayer.characterId} emote={activePlayer.emote} size={42} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                  {activePlayer.name}
                </span>
                {activePlayer.inJail && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold">
                    JAIL
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <CurrencyBadge amount={activePlayer.cash} size="sm" />
                <PardonPassBadge count={activePlayer.getOutOfJailCards} />
              </div>
            </div>
          </div>

          {/* Primary Action Buttons (Responsive depending on turn phase) */}
          <div className="flex items-center gap-1.5">
            {/* Asset Manager Button */}
            <button
              onClick={() => setShowAssetManager(true)}
              className="px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold hover:bg-slate-800 text-slate-300 transition active:scale-95"
              title={t.manageAssets}
            >
              🏛️
            </button>

            {/* Trade Button */}
            <button
              onClick={() => setShowTradeModal(true)}
              className="px-2.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold hover:bg-slate-800 text-slate-300 transition active:scale-95"
              title={t.trade}
            >
              🤝
            </button>

            {/* Turn State Controls */}
            {isMyTurn && gameState.phase === 'START_TURN' && (
              <button
                onClick={() => dispatchAction({ type: 'ROLL_DICE' })}
                disabled={isRollingDice}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 font-bold text-xs sm:text-sm text-slate-950 shadow-md shadow-amber-950/60 transition active:scale-95 flex items-center gap-1.5"
              >
                <span>🎲</span>
                <span>{t.rollDice}</span>
              </button>
            )}

            {isMyTurn && gameState.phase === 'AWAITING_PURCHASE' && currentSpace && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => dispatchAction({ type: 'BUY_PROPERTY' })}
                  className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-md transition active:scale-95"
                >
                  Buy (${currentSpace.price})
                </button>
                <button
                  onClick={() => dispatchAction({ type: 'DECLINE_PURCHASE' })}
                  className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition active:scale-95"
                >
                  Auction
                </button>
              </div>
            )}

            {isMyTurn && gameState.phase === 'RESOLVING_SPACE' && gameState.currentCard && (
              <button
                onClick={() => dispatchAction({ type: 'RESOLVE_CARD' })}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md transition active:scale-95"
              >
                Acknowledge Card
              </button>
            )}

            {isMyTurn && gameState.phase === 'AWAITING_END_TURN' && (
              <button
                onClick={() => dispatchAction({ type: 'END_TURN' })}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-600 shadow-md transition active:scale-95"
              >
                {t.endTurn}
              </button>
            )}

            {/* Bot Turn Indicator */}
            {!isMyTurn && (
              <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-1.5 animate-pulse">
                <span>🤖</span>
                <span>Bot thinking...</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* 4. 3D DICE TUMBLE PHYSICS MODAL */}
      {isRollingDice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-8 dice-scene">
            {/* Die 1 */}
            <div
              className="dice-cube"
              style={{
                transform: `rotateX(${diceTransforms.d1.rotX}deg) rotateY(${diceTransforms.d1.rotY}deg) rotateZ(${diceTransforms.d1.rotZ}deg)`,
              }}
            >
              <div className="dice-face front"><div className="pip" /></div>
              <div className="dice-face right"><div className="pip" /><div className="pip" /></div>
              <div className="dice-face top"><div className="pip" /><div className="pip" /><div className="pip" /></div>
              <div className="dice-face bottom"><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /></div>
              <div className="dice-face left"><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /></div>
              <div className="dice-face back"><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /><div className="pip" /></div>
            </div>

            {/* Die 2 */}
            <div
              className="dice-cube"
              style={{
                transform: `rotateX(${diceTransforms.d2.rotX}deg) rotateY(${diceTransforms.d2.rotY}deg) rotateZ(${diceTransforms.d2.rotZ}deg)`,
              }}
            >
              <div className="dice-face front"><div className="pip pip-gold" /></div>
              <div className="dice-face right"><div className="pip pip-gold" /><div className="pip pip-gold" /></div>
              <div className="dice-face top"><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /></div>
              <div className="dice-face bottom"><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /></div>
              <div className="dice-face left"><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /></div>
              <div className="dice-face back"><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /><div className="pip pip-gold" /></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CARD REVEAL BOTTOM SHEET */}
      {gameState.phase === 'RESOLVING_SPACE' && gameState.currentCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-center space-y-3 animate-in slide-in-from-bottom">
            <div className="text-3xl">
              {gameState.currentCard.deck === 'DESTINY' ? '🌟' : '🏛️'}
            </div>
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
              {gameState.currentCard.deck === 'DESTINY' ? 'Destiny Beacon Card' : 'Municipal Vault Card'}
            </div>
            <h3 className="font-display font-bold text-lg text-slate-100">
              {gameState.currentCard.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed px-2">
              {gameState.currentCard.description}
            </p>
            <button
              onClick={() => dispatchAction({ type: 'RESOLVE_CARD' })}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* 6. MUNICIPAL AUCTION MODAL */}
      {gameState.phase === 'AUCTION' && gameState.auction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 z-50">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <AuctionGavelIcon size={24} />
                <h3 className="font-bold text-sm text-amber-400">Municipal Auction</h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Property #{gameState.auction.propertyId}
              </div>
            </div>

            <div className="text-center py-1">
              <div className="text-base font-bold text-slate-100">
                {BoardEngine.getSpace(gameState.auction.propertyId).name}
              </div>
              <div className="text-xs text-slate-400">
                Face Value: ${BoardEngine.getSpace(gameState.auction.propertyId).price}
              </div>
            </div>

            <div className="flex items-center justify-around p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-center">
                <div className="text-[10px] text-slate-400">{t.currentBid}</div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  ${gameState.auction.currentBid}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400">{t.highestBidder}</div>
                <div className="text-xs font-bold text-amber-300">
                  {gameState.auction.highestBidderId
                    ? gameState.players.find((p) => p.id === gameState.auction?.highestBidderId)?.name
                    : 'None yet'}
                </div>
              </div>
            </div>

            {/* Bidding Controls for Active Bidder */}
            {(() => {
              const currentBidderId = gameState.auction.activeBidderIds[gameState.auction.currentBidderIndex];
              const isMyTurnToBid = currentBidderId === activePlayer.id && !activePlayer.isBot;
              const nextMin = gameState.auction.currentBid + gameState.auction.minIncrement;

              return isMyTurnToBid ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => dispatchAction({ type: 'BID_AUCTION', amount: nextMin })}
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs text-slate-950 transition"
                  >
                    Bid ${nextMin}
                  </button>
                  <button
                    onClick={() => dispatchAction({ type: 'PASS_AUCTION' })}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-300 transition"
                  >
                    Pass
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-1 italic animate-pulse">
                  Waiting for bidder...
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. PROPERTY DETAIL BOTTOM SHEET */}
      {selectedSpaceId !== null && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 z-50"
          onClick={() => setSelectedSpaceId(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const sp = BoardEngine.getSpace(selectedSpaceId);
              const own = gameState.properties[selectedSpaceId];
              const spOwner = own ? gameState.players.find((p) => p.id === own.ownerId) : null;

              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LandmarkIcon landmarkKey={sp.landmarkKey} size={36} />
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-100">{sp.name}</h3>
                        <div className="text-[11px] text-slate-400">{sp.subtitle}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSpaceId(null)}
                      className="p-1 rounded-lg bg-slate-800 text-xs text-slate-400"
                    >
                      ✕
                    </button>
                  </div>

                  {sp.district && (
                    <div
                      className="w-full py-1 text-center text-xs font-bold rounded"
                      style={{
                        backgroundColor: DISTRICT_COLORS[sp.district].bg,
                        color: DISTRICT_COLORS[sp.district].text,
                      }}
                    >
                      {DISTRICT_NAMES[sp.district]} District
                    </div>
                  )}

                  {/* Rent Table */}
                  {sp.rent && (
                    <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex justify-between py-0.5 border-b border-slate-800 text-slate-400 font-semibold">
                        <span>Base Rent (Doubled with Monopoly)</span>
                        <span className="font-mono text-slate-200">${sp.rent[0]}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-slate-400">
                        <span>With 1 Eco-Villa</span>
                        <span className="font-mono text-slate-200">${sp.rent[1]}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-slate-400">
                        <span>With 2 Eco-Villas</span>
                        <span className="font-mono text-slate-200">${sp.rent[2]}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-slate-400">
                        <span>With 3 Eco-Villas</span>
                        <span className="font-mono text-slate-200">${sp.rent[3]}</span>
                      </div>
                      <div className="flex justify-between py-0.5 text-slate-400">
                        <span>With 4 Eco-Villas</span>
                        <span className="font-mono text-slate-200">${sp.rent[4]}</span>
                      </div>
                      <div className="flex justify-between py-0.5 font-bold text-amber-300">
                        <span>With Grand Citadel</span>
                        <span className="font-mono">${sp.rent[5]}</span>
                      </div>
                    </div>
                  )}

                  {/* Pricing Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {sp.price && (
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400">Deed Price: </span>
                        <span className="font-mono font-bold text-emerald-400">${sp.price}</span>
                      </div>
                    )}
                    {sp.houseCost && (
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400">Villa Cost: </span>
                        <span className="font-mono font-bold text-amber-400">${sp.houseCost}</span>
                      </div>
                    )}
                    {sp.mortgageValue && (
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400">Mortgage: </span>
                        <span className="font-mono font-bold text-rose-400">${sp.mortgageValue}</span>
                      </div>
                    )}
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Status: </span>
                      <span className="font-bold text-slate-200">
                        {spOwner ? spOwner.name : 'Unowned'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. ASSET MANAGER BOTTOM SHEET */}
      {showAssetManager && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 z-50"
          onClick={() => setShowAssetManager(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-2xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-amber-400">{t.manageAssets}</h3>
              <button
                onClick={() => setShowAssetManager(false)}
                className="p-1 rounded-lg bg-slate-800 text-xs text-slate-400"
              >
                ✕
              </button>
            </div>

            {(() => {
              const myDeedIds = Object.entries(gameState.properties)
                .filter(([_, own]) => own.ownerId === activePlayer.id)
                .map(([idStr]) => Number(idStr));

              if (myDeedIds.length === 0) {
                return (
                  <div className="text-center py-6 text-xs text-slate-500">
                    You do not currently own any deeds. Acquire unowned spaces or negotiate trades.
                  </div>
                );
              }

              return (
                <div className="space-y-2">
                  {myDeedIds.map((propId) => {
                    const sp = BoardEngine.getSpace(propId);
                    const own = gameState.properties[propId];
                    const canBuild = sp.district
                      ? BoardEngine.canBuildHouse(
                          propId,
                          activePlayer.id,
                          gameState.properties,
                          activePlayer.cash,
                          gameState.bankHouses,
                          gameState.bankHotels,
                          gameState.settings.evenBuildRule
                        ).allowed
                      : false;

                    const canSell = sp.district
                      ? BoardEngine.canSellHouse(
                          propId,
                          activePlayer.id,
                          gameState.properties,
                          gameState.settings.evenBuildRule
                        ).allowed
                      : false;

                    const canMort = BoardEngine.canMortgage(
                      propId,
                      activePlayer.id,
                      gameState.properties
                    ).allowed;

                    const canUnmort = BoardEngine.canUnmortgage(
                      propId,
                      activePlayer.id,
                      gameState.properties,
                      activePlayer.cash
                    ).allowed;

                    return (
                      <div
                        key={propId}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-200">{sp.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {own.isMortgaged
                              ? 'Mortgaged'
                              : own.houses === 5
                              ? 'Grand Citadel'
                              : `${own.houses} Eco-Villas`}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {canBuild && (
                            <button
                              onClick={() => dispatchAction({ type: 'BUILD_HOUSE', propertyId: propId })}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white"
                            >
                              + Villa
                            </button>
                          )}
                          {canSell && (
                            <button
                              onClick={() => dispatchAction({ type: 'SELL_HOUSE', propertyId: propId })}
                              className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[10px] font-bold text-white"
                            >
                              - Villa
                            </button>
                          )}
                          {canMort && (
                            <button
                              onClick={() => dispatchAction({ type: 'MORTGAGE_PROPERTY', propertyId: propId })}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-rose-300"
                            >
                              Mortgage
                            </button>
                          )}
                          {canUnmort && (
                            <button
                              onClick={() => dispatchAction({ type: 'UNMORTGAGE_PROPERTY', propertyId: propId })}
                              className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-500 text-[10px] font-bold text-white"
                            >
                              Unmortgage
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 9. NEGOTIATE TRADE MODAL */}
      {showTradeModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 z-50"
          onClick={() => setShowTradeModal(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-amber-400">{t.trade}</h3>
              <button
                onClick={() => setShowTradeModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-xs text-slate-400"
              >
                ✕
              </button>
            </div>

            {/* Choose Trading Partner */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Trade Partner</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gameState.players
                  .filter((p) => p.id !== activePlayer.id && !p.isBankrupt)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTradePartnerId(p.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition ${
                        selectedTradePartnerId === p.id
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <CharacterArt id={p.characterId} emote={p.emote} size={20} />
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  ))}
              </div>
            </div>

            {selectedTradePartnerId && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  {/* Your Offer */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-emerald-400">You Offer</div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Cash ($): {tradeOfferCash}</span>
                      <input
                        type="range"
                        min="0"
                        max={activePlayer.cash}
                        step="10"
                        value={tradeOfferCash}
                        onChange={(e) => setTradeOfferCash(parseInt(e.target.value) || 0)}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* You Request */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-amber-400">You Request</div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1">Cash ($): {tradeRequestCash}</span>
                      <input
                        type="range"
                        min="0"
                        max={gameState.players.find((p) => p.id === selectedTradePartnerId)?.cash || 500}
                        step="10"
                        value={tradeRequestCash}
                        onChange={(e) => setTradeRequestCash(parseInt(e.target.value) || 0)}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const trade: TradeOffer = {
                      fromPlayerId: activePlayer.id,
                      toPlayerId: selectedTradePartnerId,
                      offeredCash: tradeOfferCash,
                      offeredPropertyIds: tradeOfferProps,
                      offeredJailCards: 0,
                      requestedCash: tradeRequestCash,
                      requestedPropertyIds: tradeRequestProps,
                      requestedJailCards: 0,
                    };
                    dispatchAction({ type: 'PROPOSE_TRADE', trade });
                    setShowTradeModal(false);
                    addToast('Trade Proposal Sent!', 'positive');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-slate-950 text-xs shadow-md transition"
                >
                  Send Trade Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. COLLAPSIBLE LOG DRAWER */}
      {showLogDrawer && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 z-50"
          onClick={() => setShowLogDrawer(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 shadow-2xl space-y-3 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs text-slate-200">Municipal Session Log</h3>
              <button
                onClick={() => setShowLogDrawer(false)}
                className="p-1 rounded-lg bg-slate-800 text-xs text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              {gameState.logs.map((log) => (
                <div key={log.id} className="py-1 border-b border-slate-800/50">
                  <span className="text-[10px] text-amber-400 font-mono mr-1.5">[T{log.turn}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 11. VICTORY OVERLAY SCREEN */}
      {gameState.phase === 'GAME_OVER' && gameState.winnerId && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 text-center animate-in fade-in">
          <VictoryTrophyIcon size={72} className="mb-4 animate-bounce" />
          <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            {t.winnerTitle}
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-100 mb-2">
            {gameState.players.find((p) => p.id === gameState.winnerId)?.name}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            All rival developers have succumbed to municipal liquidation. The high throne of Empire City is yours.
          </p>
          <button
            onClick={() => setScreen('menu')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-slate-950 text-sm shadow-lg shadow-amber-950/60 transition active:scale-95"
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
}
