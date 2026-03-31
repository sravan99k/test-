import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Brain, Zap, CheckCircle, RotateCcw,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { LevelPathContainer, LevelNodeData } from './level-path';
import LevelSelectScaffold from './LevelSelectScaffold';
import { useLevelProgress } from './useLevelProgress';
import { UnifiedGameResults } from './shared/UnifiedGameResults';
import { InstructionalOverlay } from './shared/InstructionalOverlay';

// --- TYPES ---
type Direction = 'up' | 'down' | 'left' | 'right';
type TileType = 'normal' | 'bridge' | 'goal' | 'button' | 'border' | 'weak' | 'splitter';
type Pose = 'standing' | 'lyingX' | 'lyingZ';
type BlockState =
  | { kind: 'single'; x: number; z: number; pose: Pose }
  | { kind: 'split'; a: { x: number; z: number }; b: { x: number; z: number }; active: 'a' | 'b'; justSwapped: boolean };
type TileProperties = { id?: string; startActivated?: boolean; activating?: string; hard?: boolean; type?: 'toggle' | 'on' | 'off'; split1?: number; split2?: number };
type Tile = { id: number; type: TileType; x: number; z: number; color?: string; properties?: TileProperties };
type Level = { tileSize: number; tiles: Tile[]; byId: Map<number, Tile>; byPos: Map<string, Tile>; center?: { x: number; z: number } };
type GameState = { levelNumber: number; block: BlockState; activated: Record<string, boolean>; pressedButtons: Record<number, boolean>; win: boolean; dead: boolean };
type RollTransition = { from: BlockState; to: BlockState; dir: Direction; startedAt: number; durationMs: number };

// --- ENGINE LOGIC ---
const TILE_SIZE = 0.98;
const TILE_THICKNESS = 0.22;

function getSpawn(level: Level): { x: number; z: number } {
  const atOrigin = level.byPos.get('0,0');
  if (atOrigin) return { x: atOrigin.x, z: atOrigin.z };
  if (level.center) return { x: level.center.x, z: level.center.z };
  return level.tiles[0] ? { x: level.tiles[0].x, z: level.tiles[0].z } : { x: 0, z: 0 };
}

function createInitialState(levelNumber: number, level: Level): GameState {
  const activated: Record<string, boolean> = {};
  for (const tile of level.tiles) {
    if (tile.type !== 'bridge' || !tile.properties?.id) continue;
    let startVal = !!tile.properties.startActivated;
    if (levelNumber === 5 && tile.properties.id === 'bridgeA') startVal = false;
    if (startVal) activated[tile.properties.id] = true;
  }
  const spawn = getSpawn(level);
  return { levelNumber, block: { kind: 'single', x: spawn.x, z: spawn.z, pose: 'standing' }, activated, pressedButtons: {}, win: false, dead: false };
}

function getOccupiedCells(block: BlockState): Array<{ x: number; z: number }> {
  if (block.kind === 'split') return [block.a, block.b];
  if (block.pose === 'standing') return [{ x: block.x, z: block.z }];
  if (block.pose === 'lyingX') return [{ x: block.x, z: block.z }, { x: block.x + 1, z: block.z }];
  return [{ x: block.x, z: block.z }, { x: block.x, z: block.z + 1 }];
}

function moveEngine(state: GameState, level: Level, dir: Direction): GameState {
  if (state.win || state.dead) return state;
  let next: GameState;

  const nextPoseAndAnchor = (b: { x: number; z: number; pose: Pose }, d: Direction) => {
    const { x, z, pose } = b;
    if (pose === 'standing') {
      if (d === 'right') return { x: x + 1, z, pose: 'lyingX' as Pose };
      if (d === 'left') return { x: x - 2, z, pose: 'lyingX' as Pose };
      if (d === 'up') return { x, z: z - 2, pose: 'lyingZ' as Pose };
      return { x, z: z + 1, pose: 'lyingZ' as Pose };
    }
    if (pose === 'lyingX') {
      if (d === 'right') return { x: x + 2, z, pose: 'standing' as Pose };
      if (d === 'left') return { x: x - 1, z, pose: 'standing' as Pose };
      if (d === 'up') return { x, z: z - 1, pose: 'lyingX' as Pose };
      return { x, z: z + 1, pose: 'lyingX' as Pose };
    }
    if (d === 'right') return { x: x + 1, z, pose: 'lyingZ' as Pose };
    if (d === 'left') return { x: x - 1, z, pose: 'lyingZ' as Pose };
    if (d === 'up') return { x, z: z - 1, pose: 'standing' as Pose };
    return { x, z: z + 2, pose: 'standing' as Pose };
  };

  if (state.block.kind === 'split') {
    const activeKey = state.block.active;
    const active = state.block[activeKey];
    const moved = dir === 'right' ? { x: active.x + 1, z: active.z } : dir === 'left' ? { x: active.x - 1, z: active.z } : dir === 'up' ? { x: active.x, z: active.z - 1 } : { x: active.x, z: active.z + 1 };
    next = { ...state, block: { ...state.block, [activeKey]: moved, justSwapped: false } };
  } else {
    const moved = nextPoseAndAnchor({ x: state.block.x, z: state.block.z, pose: state.block.pose }, dir);
    next = { ...state, block: { kind: 'single', ...moved } };
  }

  // Merge split blocks if adjacent
  if (next.block.kind === 'split') {
    const { a, b } = next.block;
    if ((a.x === b.x && Math.abs(a.z - b.z) === 1) || (a.z === b.z && Math.abs(a.x - b.x) === 1)) {
      if (a.z === b.z) next.block = { kind: 'single', x: Math.min(a.x, b.x), z: a.z, pose: 'lyingX' };
      else next.block = { kind: 'single', x: a.x, z: Math.min(a.z, b.z), pose: 'lyingZ' };
    }
  }

  // Evaluate state
  const occupied = getOccupiedCells(next.block);
  for (const cell of occupied) {
    const tile = level.byPos.get(`${cell.x},${cell.z}`);
    if (!tile || tile.type === 'border') return { ...next, dead: true };
    if (tile.type === 'bridge' && !next.activated[tile.properties?.id || '']) return { ...next, dead: true };
  }

  if (next.block.kind === 'single' && next.block.pose === 'standing') {
    const tile = level.byPos.get(`${next.block.x},${next.block.z}`);
    if (tile?.type === 'weak') return { ...next, dead: true };
    if (tile?.type === 'goal') return { ...next, win: true };
    if (tile?.type === 'splitter') {
      const s1 = level.byId.get(tile.properties?.split1 || -1);
      const s2 = level.byId.get(tile.properties?.split2 || -1);
      if (s1 && s2) next.block = { kind: 'split', a: { x: s1.x, z: s1.z }, b: { x: s2.x, z: s2.z }, active: 'a', justSwapped: false };
    }
  }

  // Buttons
  const pressed = { ...next.pressedButtons };
  let activated = { ...next.activated };
  for (const tile of level.tiles) {
    if (tile.type !== 'button') continue;
    const isUnder = occupied.some(c => c.x === tile.x && c.z === tile.z);
    if (!isUnder) { pressed[tile.id] = false; continue; }
    if (tile.properties?.hard && (next.block.kind !== 'single' || next.block.pose !== 'standing')) continue;
    if (next.block.kind === 'split' && next.block.justSwapped) continue;
    if (pressed[tile.id]) continue;
    pressed[tile.id] = true;
    const ids = (tile.properties?.activating || '').split(',').map(s => s.trim()).filter(Boolean);
    const mode = tile.properties?.type || 'toggle';
    for (const id of ids) {
      if (mode === 'toggle') activated[id] = !activated[id];
      else if (mode === 'on') activated[id] = true;
      else activated[id] = false;
    }
  }
  return { ...next, activated, pressedButtons: pressed };
}

// --- RENDERING HELPERS ---
function tileColor(tile: Tile): string {
  if (tile.type === 'goal') return '#ff2a2a';
  if (tile.type === 'bridge') return '#caa56a';
  if (tile.type === 'button') return tile.properties?.hard ? '#8b5cf6' : '#60a5fa';
  if (tile.type === 'weak') return '#f3f4f6';
  return '#f8fafc';
}

function axisForDir(dir: Direction): THREE.Vector3 {
  return (dir === 'left' || dir === 'right') ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
}

function angleForDir(dir: Direction): number {
  if (dir === 'right' || dir === 'up') return -Math.PI / 2;
  return Math.PI / 2;
}

function pivotForSingle(x: number, z: number, pose: Pose, dir: Direction): THREE.Vector3 {
  const b = (pose === 'standing') ? { minX: x, maxX: x, minZ: z, maxZ: z }
    : (pose === 'lyingX') ? { minX: x, maxX: x + 1, minZ: z, maxZ: z }
      : { minX: x, maxX: x, minZ: z, maxZ: z + 1 };
  if (dir === 'right') return new THREE.Vector3(b.maxX + 0.5, 0, (b.minZ + b.maxZ) / 2);
  if (dir === 'left') return new THREE.Vector3(b.minX - 0.5, 0, (b.minZ + b.maxZ) / 2);
  if (dir === 'up') return new THREE.Vector3((b.minX + b.maxX) / 2, 0, b.minZ - 0.5);
  return new THREE.Vector3((b.minX + b.maxX) / 2, 0, b.maxZ + 0.5);
}

// --- COMPONENTS ---
const BloxorzCanvas: React.FC<{ level: Level; state: GameState; boardState: GameState; transition: RollTransition | null; deathAt: number | null; focus: { x: number; z: number } }> = ({ level, state, boardState, transition, deathAt, focus }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const boardStateRef = useRef(boardState);
  const transitionRef = useRef(transition);
  const deathAtRef = useRef(deathAt);
  const focusRef = useRef(focus);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { boardStateRef.current = boardState; }, [boardState]);
  useEffect(() => { transitionRef.current = transition; }, [transition]);
  useEffect(() => { deathAtRef.current = deathAt; }, [deathAt]);
  useEffect(() => { focusRef.current = focus; }, [focus]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xcfe7e6, 18, 55);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
    const centerX = level.center?.x || 0;
    const centerZ = level.center?.z || 0;

    const boardGroup = new THREE.Group();
    boardGroup.position.set(-centerX, 0, -centerZ);
    scene.add(boardGroup);

    const tileMeshes = new Map<number, THREE.Mesh>();
    level.tiles.forEach(tile => {
      if (tile.type === 'border') return;
      const geom = new THREE.BoxGeometry(TILE_SIZE, TILE_THICKNESS, TILE_SIZE);
      const mat = new THREE.MeshStandardMaterial({ color: tileColor(tile), roughness: 0.92 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(tile.x, -TILE_THICKNESS / 2, tile.z);
      mesh.receiveShadow = true;
      boardGroup.add(mesh);
      tileMeshes.set(tile.id, mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color: 0x6e7882, transparent: true, opacity: 0.5 }));
      edges.position.copy(mesh.position);
      boardGroup.add(edges);
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(14, 22, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pivotGroup = new THREE.Group(); boardGroup.add(pivotGroup);
    const blockMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: '#ff2a2a' }));
    blockMesh.castShadow = true;
    pivotGroup.add(blockMesh);

    const splitA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#ff2a2a' }));
    const splitB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#e11d1d' }));
    splitA.castShadow = splitB.castShadow = true;
    boardGroup.add(splitA); boardGroup.add(splitB);

    const camTarget = new THREE.Vector3();
    const animate = () => {
      const curFocus = focusRef.current;
      camTarget.lerp(new THREE.Vector3(curFocus.x - centerX, 0, curFocus.z - centerZ), 0.08);
      camera.position.lerp(new THREE.Vector3(camTarget.x + 10, 12, camTarget.z + 10), 0.08);
      camera.lookAt(camTarget);

      const bState = boardStateRef.current;
      level.tiles.forEach(t => { if (t.type === 'bridge') { const m = tileMeshes.get(t.id); if (m) m.visible = !!bState.activated[t.properties?.id || '']; } });

      const s = stateRef.current;
      const death = deathAtRef.current;
      const fallY = death ? -Math.pow((performance.now() - death) / 650, 2) * 7 : 0;

      if (s.block.kind === 'split') {
        splitA.visible = splitB.visible = true; pivotGroup.visible = false;
        splitA.position.set(s.block.a.x, 0.5 + fallY, s.block.a.z);
        splitB.position.set(s.block.b.x, 0.5 + fallY, s.block.b.z);
      } else {
        splitA.visible = splitB.visible = false; pivotGroup.visible = true;
        const tr = transitionRef.current;
        if (!tr) {
          pivotGroup.position.set(0, 0, 0); pivotGroup.rotation.set(0, 0, 0);
          const pos = s.block.pose === 'standing' ? [s.block.x, 1 + fallY, s.block.z] : s.block.pose === 'lyingX' ? [s.block.x + 0.5, 0.5 + fallY, s.block.z] : [s.block.x, 0.5 + fallY, s.block.z + 0.5];
          blockMesh.position.set(pos[0], pos[1], pos[2]);
          blockMesh.rotation.set(s.block.pose === 'lyingX' ? Math.PI / 2 : 0, 0, s.block.pose === 'lyingZ' ? Math.PI / 2 : 0);
          // Simple rotation fix for standard block
          blockMesh.rotation.set(s.block.pose === 'lyingZ' ? Math.PI / 2 : 0, 0, s.block.pose === 'lyingX' ? Math.PI / 2 : 0);
        } else {
          const tRaw = Math.min(1, Math.max(0, (performance.now() - tr.startedAt) / tr.durationMs));
          const t = tRaw * tRaw * (3 - 2 * tRaw);
          const pivot = pivotForSingle(tr.from.kind === 'single' ? tr.from.x : 0, tr.from.kind === 'single' ? tr.from.z : 0, tr.from.kind === 'single' ? tr.from.pose : 'standing', tr.dir);
          pivotGroup.position.copy(pivot);
          pivotGroup.rotation.set(0, 0, 0);
          const fromC = (tr.from.kind === 'single') ? (tr.from.pose === 'standing' ? new THREE.Vector3(tr.from.x, 1, tr.from.z) : tr.from.pose === 'lyingX' ? new THREE.Vector3(tr.from.x + 0.5, 0.5, tr.from.z) : new THREE.Vector3(tr.from.x, 0.5, tr.from.z + 0.5)) : new THREE.Vector3();
          blockMesh.position.copy(fromC.sub(pivot));
          blockMesh.rotation.set(tr.from.kind === 'single' && tr.from.pose === 'lyingZ' ? Math.PI / 2 : 0, 0, tr.from.kind === 'single' && tr.from.pose === 'lyingX' ? Math.PI / 2 : 0);
          pivotGroup.rotateOnAxis(axisForDir(tr.dir), angleForDir(tr.dir) * t);
        }
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    const resize = () => {
      const w = canvasRef.current?.parentElement?.clientWidth || window.innerWidth;
      const h = canvasRef.current?.parentElement?.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); window.addEventListener('resize', resize); animate();
    return () => { window.removeEventListener('resize', resize); renderer.dispose(); };
  }, [level]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// --- GAME LOGIC HOOKS ---
const BloxorzGame: React.FC<{ onComplete: (score: number) => void; onBack: () => void }> = ({ onComplete, onBack }) => {
  const [gameState, setGameState] = useState<'levelSelect' | 'playing' | 'complete'>('levelSelect');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [levelData, setLevelData] = useState<Level | null>(null);
  const [playState, setPlayState] = useState<GameState | null>(null);
  const [settledState, setSettledState] = useState<GameState | null>(null);
  const [transition, setTransition] = useState<RollTransition | null>(null);
  const [deathAt, setDeathAt] = useState<number | null>(null);
  const [focus, setFocus] = useState({ x: 0, z: 0 });

  const { totalXP, completedLevels, bestScores, isLevelUnlocked, recordLevelCompletion } = useLevelProgress('bloxorz');

  const levels = Array.from({ length: 33 }, (_, i) => ({ id: i + 1, name: `Stage ${i + 1}`, xpReward: 100 + i * 20 }));

  const loadLevel = async (id: number) => {
    try {
      const response = await fetch(`/maps/bloxorz${id}.json`);
      const map = await response.json();
      const tileSize = map.tilewidth || 50;
      const tiles: Tile[] = [];
      const byId = new Map<number, Tile>();
      const byPos = new Map<string, Tile>();
      map.layers.forEach((layer: any) => {
        if (layer.type !== 'objectgroup') return;
        layer.objects.forEach((obj: any) => {
          const x = Math.round(obj.x / tileSize), z = Math.round(obj.y / tileSize);
          const tile: Tile = { id: obj.id, type: layer.name as TileType, x, z, color: layer.color, properties: obj.properties };
          tiles.push(tile); byId.set(tile.id, tile); byPos.set(`${x},${z}`, tile);
        });
      });
      const centerTile = map.properties?.center ? byId.get(map.properties.center) : null;
      const level: Level = { tileSize, tiles, byId, byPos, center: centerTile ? { x: centerTile.x, z: centerTile.z } : undefined };
      setLevelData(level);
      const initial = createInitialState(id, level);
      setPlayState(initial); setSettledState(initial); setDeathAt(null); setTransition(null);
      setFocus(level.center || { x: 0, z: 0 });
    } catch (e) { console.error('Failed to load level', e); }
  };

  const handleMove = useCallback((dir: Direction) => {
    if (!levelData || !playState || playState.win || playState.dead || transition) return;
    const next = moveEngine(playState, levelData, dir);
    const duration = 170;
    if (playState.block.kind === 'single' && next.block.kind === 'single') {
      const tr: RollTransition = { from: playState.block, to: next.block, dir, startedAt: performance.now(), durationMs: duration };
      setTransition(tr);
      setTimeout(() => { setTransition(null); setSettledState(next); }, duration);
    } else {
      setSettledState(next);
    }
    setPlayState(next);
    if (next.dead) setTimeout(() => setDeathAt(performance.now()), 100);
    if (next.win) setTimeout(() => {
      recordLevelCompletion(selectedLevelId, 100, 150);
      setGameState('complete');
    }, 1000);
  }, [levelData, playState, transition, selectedLevelId, recordLevelCompletion]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp') handleMove('up');
      else if (e.key === 'ArrowDown') handleMove('down');
      else if (e.key === 'ArrowLeft') handleMove('left');
      else if (e.key === 'ArrowRight') handleMove('right');
    };
    window.addEventListener('keydown', down); return () => window.removeEventListener('keydown', down);
  }, [gameState, handleMove]);

  if (gameState === 'levelSelect') {
    return (
      <LevelSelectScaffold title="Bloxorz 3D" onBack={onBack} totalXP={totalXP} completedLevelsCount={completedLevels.size} totalLevels={levels.length}>
        <InstructionalOverlay isOpen={showInstructions} onComplete={() => { setShowInstructions(false); setGameState('playing'); loadLevel(selectedLevelId); }} title="Bloxorz Goal" instructions={["Roll the block across tiles", "Avoid falling off the edges", "Fall through the square hole", "Use buttons to open bridges"]} patternType="sequence" />
        <div className="relative mb-24">
          <LevelPathContainer
            levels={levels.map(l => ({ id: l.id, name: l.name, xpReward: l.xpReward, metadata: { type: '3D Logic' } }))}
            completedLevels={completedLevels} bestScores={bestScores} selectedLevelId={selectedLevelId}
            onSelectLevel={(l) => setSelectedLevelId(l.id)}
            onStartLevel={(l) => { setSelectedLevelId(l.id); setShowInstructions(true); }}
            isLevelUnlocked={isLevelUnlocked} nodeHeight={180}
          />
        </div>
      </LevelSelectScaffold>
    );
  }

  if (gameState === 'playing' && levelData && playState) {
    return (
      <div className="w-full h-screen bg-[#cfe7e6] flex flex-col relative overflow-hidden">
        <button onClick={() => setGameState('levelSelect')} className="absolute top-6 left-6 z-[100] w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-800 hover:bg-white/40 transition-all shadow-lg active:scale-95"><ArrowLeft className="w-6 h-6" /></button>
        <div className="absolute top-6 right-6 z-[100] bg-white/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 shadow-xl"><p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-1">Stage {selectedLevelId}</p><p className="text-xl font-black text-slate-800 uppercase tracking-tight">Processing Matrix</p></div>
        <BloxorzCanvas level={levelData} state={playState} boardState={settledState || playState} transition={transition} deathAt={deathAt} focus={focus} />
        {playState.dead && <div className="absolute inset-0 z-[200] flex items-center justify-center bg-red-950/20 backdrop-blur-sm animate-in fade-in duration-500"><div className="bg-white p-8 rounded-[3rem] shadow-2xl text-center"><p className="text-red-500 font-black uppercase tracking-widest text-xs mb-2">Simulation Failed</p><h2 className="text-3xl font-black text-slate-800 mb-6 uppercase">Integrity Lost</h2><Button onClick={() => loadLevel(selectedLevelId)} className="bg-red-500 hover:bg-red-600 text-white font-black px-10 h-16 rounded-2xl shadow-xl active:scale-95">Re-Initialize <RotateCcw className="ml-2 w-5 h-5" /></Button></div></div>}
      </div>
    );
  }

  if (gameState === 'complete') {
    return <UnifiedGameResults score={100} maxScore={100} accuracy={100} xpEarned={150} levelName={`Stage ${selectedLevelId}`} gameId="bloxorz" isPassed={true} onPlayAgain={() => { setGameState('playing'); loadLevel(selectedLevelId); }} onExit={() => setGameState('levelSelect')} />;
  }

  return <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 gap-6 h-screen"><div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="text-blue-400 font-black uppercase tracking-[0.4em] text-xs">Initializing Neural Link...</p></div>;
};

export default BloxorzGame;
