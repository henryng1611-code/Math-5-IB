import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, RefreshCw, Star, Info, Ship, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import CoordinateTreasureHunt from "./CoordinateTreasureHunt";

interface CoordinateQuestProps {
  onEarnStars: (count: number) => void;
  onSetBarnabyMood: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

export default function CoordinateQuest({ onEarnStars, onSetBarnabyMood }: CoordinateQuestProps) {
  const [playMode, setPlayMode] = useState<"treasure_hunt" | "quest" | "arcade">("treasure_hunt");
  const [questType, setQuestType] = useState<"plot" | "read">("plot");
  
  // Game Quest states
  const [targetX, setTargetX] = useState<number>(2);
  const [targetY, setTargetY] = useState<number>(3);
  const [userX, setUserX] = useState<number | null>(null);
  const [userY, setUserY] = useState<number | null>(null);
  const [questSolved, setQuestSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string }>({
    isCorrect: null,
    text: "Click anywhere on the coordinates grid to place your pin!",
  });

  // Reading answers state
  const [readAnsX, setReadAnsX] = useState<string>("");
  const [readAnsY, setReadAnsY] = useState<string>("");

  // Arcade Mini-Game states
  const [spaceshipPos, setSpaceshipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [arcadeStar, setArcadeStar] = useState<{ x: number; y: number }>({ x: 3, y: -2 });
  const [arcadeScore, setArcadeScore] = useState<number>(0);
  const [arcadeSolvedCount, setArcadeSolvedCount] = useState<number>(0);

  // Grid dimensions
  const GRID_SIZE = 300;
  const CENTER = GRID_SIZE / 2;
  const STEP = 26; // Pixels per coordinate step (grid is x: -5 to 5, y: -5 to 5)

  // Math mapping from SVG coords to Integer grid
  const convertPxToGrid = (pxX: number, pxY: number) => {
    const rawX = (pxX - CENTER) / STEP;
    const rawY = (CENTER - pxY) / STEP; // Y axis is inverted in SVG
    
    // Snap to nearest integer within boundaries of -5 to 5
    const snappedX = Math.max(-5, Math.min(5, Math.round(rawX)));
    const snappedY = Math.max(-5, Math.min(5, Math.round(rawY)));
    return { x: snappedX, y: snappedY };
  };

  const convertGridToPx = (gridX: number, gridY: number) => {
    return {
      x: CENTER + gridX * STEP,
      y: CENTER - gridY * STEP,
    };
  };

  const handleGridClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (questSolved && playMode === "quest") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Rescale to match actual viewBox coordinate space (300 x 300)
    const scaleFactorX = GRID_SIZE / rect.width;
    const scaleFactorY = GRID_SIZE / rect.height;
    const svgX = clickX * scaleFactorX;
    const svgY = clickY * scaleFactorY;

    const coords = convertPxToGrid(svgX, svgY);

    if (playMode === "quest") {
      if (questType === "plot") {
        setUserX(coords.x);
        setUserY(coords.y);
        setFeedback({
          isCorrect: null,
          text: `You selected (${coords.x}, ${coords.y}). Click Check Coordinates to verify!`,
        });
        onSetBarnabyMood("thinking", `Aha! You selected (${coords.x}, ${coords.y}). Click "Check Pin!" if that matches our target!`);
      } else {
        // In "read" mode, we click to help verify but the user must type or select actual coordinates in input
        setUserX(coords.x);
        setUserY(coords.y);
      }
    } else {
      // Arcade mode click to move spaceship
      setSpaceshipPos({ x: coords.x, y: coords.y });
    }
  };

  // Generate new Challenge question
  const generateNewQuest = () => {
    setQuestSolved(false);
    setUserX(null);
    setUserY(null);
    setReadAnsX("");
    setReadAnsY("");
    setFeedback({
      isCorrect: null,
      text: "Place your pin directly on the coordinate intersections!",
    });

    // Randomize whether plotting or reading
    const randomType = Math.random() > 0.5 ? "plot" : "read";
    setQuestType(randomType);

    // Random coordinates from -5 to 5, avoiding (0, 0)
    let x = 0;
    let y = 0;
    while (x === 0 && y === 0) {
      x = Math.floor(Math.random() * 11) - 5; // -5 to 5
      y = Math.floor(Math.random() * 11) - 5; // -5 to 5
    }

    setTargetX(x);
    setTargetY(y);

    if (randomType === "plot") {
      onSetBarnabyMood("thinking", `Ahoy, Captain! Can you mount the anchor pin directly on the coordinate intersection: (${x}, ${y})? Walk then climb!`);
    } else {
      onSetBarnabyMood("thinking", `Help! Barnaby's telescope spotted a golden compass lost at coordinates! Look at our gold star. What are the coordinates?`);
    }
  };

  const handleVerify = () => {
    if (questSolved) return;

    if (questType === "plot") {
      if (userX === null || userY === null) {
        setFeedback({
          isCorrect: false,
          text: "Double-check your map! Please click on the grid to place the coordinate pin first.",
        });
        return;
      }

      if (userX === targetX && userY === targetY) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Tremendous Plotting! Coordinates (${targetX}, ${targetY}) located exactly! ⭐`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Fantastic navigation! You plotted (${targetX}, ${targetY}) flawlessly. You earned 5 stars! 🌟`);
        confetti({ particleCount: 75, spread: 55, origin: { y: 0.8 } });
      } else {
        const xDist = Math.abs(userX - targetX);
        const yDist = Math.abs(userY - targetY);
        let tip = "Walk first, then climb. ";
        if (xDist > 0 && yDist === 0) tip += `Check your horizontal line: you need x = ${targetX} but selected ${userX}.`;
        else if (yDist > 0 && xDist === 0) tip += `Check your vertical elevator: you need y = ${targetY} but selected ${userY}.`;
        else tip += `Check both lines! Walk to ${targetX}, then elevate to ${targetY}.`;

        setFeedback({
          isCorrect: false,
          text: `Not quite! You placed it at (${userX}, ${userY}). ${tip}`,
        });
        onSetBarnabyMood("incorrect", `Let's work through the rules: horizontal value first, vertical value second. Try again!`);
      }
    } 
    
    else if (questType === "read") {
      const parsedX = parseInt(readAnsX.trim(), 10);
      const parsedY = parseInt(readAnsY.trim(), 10);

      if (parsedX === targetX && parsedY === targetY) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Brilliant! The target star is indeed at coordinates (${targetX}, ${targetY})! 🌟`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Correct! Walked to ${targetX} and climbed to ${targetY}. Spot on! Star gained! ⭐`);
        confetti({ particleCount: 75, spread: 55, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Oops! (${isNaN(parsedX) ? "?" : parsedX}, ${isNaN(parsedY) ? "?" : parsedY}) is incorrect. Look at the lines going to the axis rails.`,
        });
        onSetBarnabyMood("incorrect", `Look carefully. Travel from the origin (0,0). How far left/right? How far up/down?`);
      }
    }
  };

  // Arcade spaceship movement logic
  const moveSpaceship = (dx: number, dy: number) => {
    setSpaceshipPos((prev) => {
      const nextX = Math.max(-5, Math.min(5, prev.x + dx));
      const nextY = Math.max(-5, Math.min(5, prev.y + dy));
      return { x: nextX, y: nextY };
    });
  };

  // Check Arcade Star collision
  useEffect(() => {
    if (playMode !== "arcade") return;
    if (spaceshipPos.x === arcadeStar.x && spaceshipPos.y === arcadeStar.y) {
      setArcadeScore((prev) => prev + 5);
      setArcadeSolvedCount((prev) => prev + 1);
      onEarnStars(2);
      
      // Randomize new star
      let newX = 0;
      let newY = 0;
      while ((newX === spaceshipPos.x && newY === spaceshipPos.y) || (newX === 0 && newY === 0)) {
        newX = Math.floor(Math.random() * 11) - 5;
        newY = Math.floor(Math.random() * 11) - 5;
      }
      setArcadeStar({ x: newX, y: newY });
      onSetBarnabyMood("correct", `Awesome catch! Flying ship captured Star at (${spaceshipPos.x}, ${spaceshipPos.y})! +2 Stars! 🚀`);
      
      // Tiny pop confetti
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.7 } });
    }
  }, [spaceshipPos, arcadeStar, playMode]);

  // Run on mount
  useEffect(() => {
    generateNewQuest();
  }, [playMode]);

  // Render variables
  const plottedPx = userX !== null && userY !== null ? convertGridToPx(userX, userY) : null;
  const targetPx = convertGridToPx(targetX, targetY);
  const spaceshipPx = convertGridToPx(spaceshipPos.x, spaceshipPos.y);
  const arcadeStarPx = convertGridToPx(arcadeStar.x, arcadeStar.y);

  // Generate grid SVG elements
  const gridLines = [];
  for (let i = -5; i <= 5; i++) {
    const offset = CENTER + i * STEP;
    // Don't draw axes in light color
    if (i !== 0) {
      // Horizontal grid lines
      gridLines.push(
        <line
          key={`h-${i}`}
          x1="10"
          y1={offset}
          x2="290"
          y2={offset}
          className="stroke-cyan-100 stroke-[1.5]"
          strokeDasharray="1 3"
        />
      );
      // Vertical grid lines
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={offset}
          y1="10"
          x2={offset}
          y2="290"
          className="stroke-cyan-100 stroke-[1.5]"
          strokeDasharray="1 3"
        />
      );
    }
  }

  return (
    <div id="coordinate-quest" className="bg-white rounded-3xl p-6 shadow-md border border-cyan-100 flex flex-col gap-6">
      {/* Header and Mode selection toggle */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <div>
            <h2 className="text-2xl font-bold text-cyan-600">Coordinate Plane Journey</h2>
            <p className="text-xs text-slate-500">PYP Grade 5 Shape & Space Strand (4 Quadrants)</p>
          </div>
        </div>

        {/* Dashboard toggle buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-center">
          <button
            onClick={() => setPlayMode("treasure_hunt")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playMode === "treasure_hunt"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Treasure Hunt (±10 Canvas) 🗺️
          </button>
          <button
            onClick={() => setPlayMode("quest")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playMode === "quest"
                ? "bg-cyan-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Practice Quest (±5 SVG)
          </button>
          <button
            onClick={() => setPlayMode("arcade")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playMode === "arcade"
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Spaceship Arcade 🚀
          </button>
        </div>
      </div>

      {playMode === "treasure_hunt" ? (
        <CoordinateTreasureHunt onEarnStars={onEarnStars} onSetBarnaby={onSetBarnabyMood} />
      ) : playMode === "quest" ? (
        // Practice Quest Mode
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Grid Area */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative bg-cyan-50/45 p-4 rounded-3xl border border-cyan-100 max-w-[340px] w-full shadow-inner aspect-square flex items-center justify-center">
              
              {/* SVG Coordinate Grid */}
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 300"
                onClick={handleGridClick}
                className="overflow-visible select-none cursor-crosshair bg-white/80 rounded-2xl border border-slate-200 shadow-sm"
              >
                {/* Horizontal & Vertical grid lines */}
                {gridLines}

                {/* Major X Axis */}
                <line x1="8" y1={CENTER} x2="292" y2={CENTER} className="stroke-slate-700 stroke-[2.5]" />
                {/* Axis Arrowheads */}
                <polygon points="295,150 288,145 288,155" className="fill-slate-700" />
                <polygon points="5,150 12,145 12,155" className="fill-slate-700" />

                {/* Major Y Axis */}
                <line x1={CENTER} y1="8" x2={CENTER} y2="292" className="stroke-slate-700 stroke-[2.5]" />
                <polygon points="150,5 145,12 155,12" className="fill-slate-700" />
                <polygon points="150,295 145,288 155,288" className="fill-slate-700" />

                {/* Tick numbers */}
                {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((val) => {
                  const offset = CENTER + val * STEP;
                  return (
                    <g key={`tick-${val}`}>
                      {/* X Tiks */}
                      <line x1={offset} y1={CENTER - 3} x2={offset} y2={CENTER + 3} className="stroke-slate-800 stroke-[1.5]" />
                      <text x={offset} y={CENTER + 14} textAnchor="middle" className="text-[9px] font-bold text-slate-500 fill-slate-500 font-mono">
                        {val}
                      </text>
                      {/* Y Tiks */}
                      <line x1={CENTER - 3} y1={offset} x2={CENTER + 3} y2={offset} className="stroke-slate-800 stroke-[1.5]" />
                      <text x={CENTER - 12} y={offset + 3} textAnchor="end" className="text-[9px] font-bold text-slate-500 fill-slate-500 font-mono">
                        {-val} {/* Inverted because SVG is upside down */}
                      </text>
                    </g>
                  );
                })}

                {/* Origin label */}
                <text x={CENTER + 8} y={CENTER - 5} className="text-[9px] font-bold text-slate-400 fill-current">O (0,0)</text>
                
                {/* Axes labels */}
                <text x="280" y={CENTER - 8} className="text-[10px] font-bold text-slate-800 fill-current font-sans italic">X-axis</text>
                <text x={CENTER + 10} y="15" className="text-[10px] font-bold text-slate-800 fill-current font-sans italic">Y-axis</text>

                {/* HELPFUL DOTTED projection lines from active selections to help kids understand coordinates mapping */}
                {plottedPx && (
                  <g className="opacity-75">
                    <line x1={plottedPx.x} y1={plottedPx.y} x2={CENTER} y2={plottedPx.y} className="stroke-cyan-500 stroke-[1.5] stroke-dash" strokeDasharray="2 3" />
                    <line x1={plottedPx.x} y1={plottedPx.y} x2={plottedPx.x} y2={CENTER} className="stroke-cyan-500 stroke-[1.5]" strokeDasharray="2 3" />
                  </g>
                )}

                {/* Active Interactive Targets depending on Quest Type */}
                
                {/* PLOT MODE: User active Pin */}
                {questType === "plot" && plottedPx && (
                  <g>
                    <circle cx={plottedPx.x} cy={plottedPx.y} r="8" className="fill-cyan-500 stroke-white stroke-[2] shadow-sm animate-pulse" />
                    {/* Tiny visual coordinate label near pin */}
                    <rect x={plottedPx.x + 8} y={plottedPx.y - 18} width="34" height="14" rx="3" className="fill-cyan-700/90" />
                    <text x={plottedPx.x + 25} y={plottedPx.y - 8} textAnchor="middle" className="fill-white text-[8px] font-mono font-bold">
                      ({userX},{userY})
                    </text>
                  </g>
                )}

                {/* READ MODE: Interactive Star helper icon */}
                {questType === "read" && (
                  <g>
                    {/* Projected lines for Star to help students solve the read coordinates */}
                    <line x1={targetPx.x} y1={targetPx.y} x2={CENTER} y2={targetPx.y} className="stroke-purple-400 stroke-[1]" strokeDasharray="2 3" />
                    <line x1={targetPx.x} y1={targetPx.y} x2={targetPx.x} y2={CENTER} className="stroke-purple-400 stroke-[1]" strokeDasharray="2 3" />
                    
                    {/* Animate target object */}
                    <g className="animate-bounce">
                      {/* Cute Target key emoji as an absolute center */}
                      <text x={targetPx.x} y={targetPx.y + 6} textAnchor="middle" className="text-xl select-none select-all">🔑</text>
                    </g>
                  </g>
                )}
              </svg>

              <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] py-0.5 px-2 rounded-md font-bold">
                X [-5,5] • Y [-5,5]
              </div>
            </div>
            
            {/* Compass instruction tip */}
            <p className="text-[11px] text-slate-400 text-center font-medium max-w-[280px]">
              Tip: "Walk before you elevator!" Always read along the horizontal line (left-right) first, then climb vertically (up-down) second.
            </p>
          </div>

          {/* Right Input Controls Side */}
          <div className="flex flex-col gap-4">
            <div className="bg-cyan-50/30 rounded-2xl p-5 border border-cyan-100">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3">
                Mission Challenge:
              </h3>

              {questType === "plot" ? (
                <div className="space-y-3">
                  <p className="text-slate-600 text-sm">
                    Commander Barnaby instructs you to anchor the ship at coordinates:
                  </p>
                  <div className="flex justify-center my-4">
                    <span className="text-4xl font-extrabold text-cyan-600 tracking-tight font-mono bg-white inline-block px-6 py-2.5 rounded-2xl border-2 border-cyan-400 shadow-sm animate-pulse">
                      ({targetX}, {targetY})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Click the crossing intersection point on the coordinate map matching this address!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600 text-sm">
                    A golden keys coordinate map is lost! Look at our key 🔑 on the grid. What coordinates label this spot?
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg font-bold text-slate-700 select-none">(</span>
                    <input
                      type="text"
                      disabled={questSolved}
                      placeholder="X"
                      value={readAnsX}
                      onChange={(e) => setReadAnsX(e.target.value)}
                      className="w-14 h-12 text-center text-xl font-bold font-mono border-2 border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-lg font-bold text-slate-500 select-none">,</span>
                    <input
                      type="text"
                      disabled={questSolved}
                      placeholder="Y"
                      value={readAnsY}
                      onChange={(e) => setReadAnsY(e.target.value)}
                      className="w-14 h-12 text-center text-xl font-bold font-mono border-2 border-slate-300 rounded-xl focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-lg font-bold text-slate-700 select-none">)</span>
                  </div>

                  <div className="flex gap-1 justify-center">
                    {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        disabled={questSolved}
                        onClick={() => {
                          if (!readAnsX) setReadAnsX(String(num));
                          else if (!readAnsY) setReadAnsY(String(num));
                        }}
                        className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold rounded cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      disabled={questSolved}
                      onClick={() => {
                        setReadAnsX("");
                        setReadAnsY("");
                      }}
                      className="px-1.5 py-0.5 bg-slate-300 hover:bg-slate-400 text-[10px] rounded cursor-pointer text-slate-700"
                    >
                      Clr
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Answer check feedback */}
            <div className="flex flex-col gap-2">
              {!questSolved ? (
                <button
                  onClick={handleVerify}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 animate-spin-slow" /> Verify Coordinates Coordinate!
                </button>
              ) : (
                <button
                  onClick={generateNewQuest}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  Embark on Next Coordinate Quest 🧭
                </button>
              )}

              {feedback.isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    feedback.isCorrect
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-0.5">
                    {feedback.isCorrect ? "⭐ Correct!" : "🤔 Not quite!"}
                  </div>
                  {feedback.text}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // SPACESHIP ARCADE MODE
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
          
          {/* Active play field */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative p-2 rounded-2xl border-2 border-indigo-500 max-w-[280px] w-full bg-indigo-950/20 shadow-lg aspect-square flex items-center justify-center">
              
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 300"
                onClick={handleGridClick}
                className="overflow-visible select-none cursor-pointer bg-slate-950 rounded-xl"
              >
                {/* Horizontal & Vertical grid lines in neon colors */}
                {gridLines.map((line, idx) => (
                  <line
                    key={`line-neon-${idx}`}
                    x1={line.props.x1}
                    y1={line.props.y1}
                    x2={line.props.x2}
                    y2={line.props.y2}
                    className="stroke-indigo-950 stroke-[1]"
                  />
                ))}

                {/* Major X Axis */}
                <line x1="10" y1={CENTER} x2="290" y2={CENTER} className="stroke-indigo-600/60 stroke-[2]" />
                
                {/* Major Y Axis */}
                <line x1={CENTER} y1="10" x2={CENTER} y2="290" className="stroke-indigo-600/60 stroke-[2]" />

                {/* Arcade target object: STAR */}
                <g className="animate-pulse">
                  <text x={arcadeStarPx.x} y={arcadeStarPx.y + 6} textAnchor="middle" className="text-xl">⭐</text>
                  <circle cx={arcadeStarPx.x} cy={arcadeStarPx.y} r="14" className="stroke-amber-400 fill-none stroke-[1] opacity-75" />
                </g>

                {/* Spaceship Rocket representer */}
                <g className="transition-all duration-300">
                  <text x={spaceshipPx.x} y={spaceshipPx.y + 6} textAnchor="middle" className="text-xl rotate-[45deg] select-none select-all">🚀</text>
                </g>
              </svg>

              <div className="absolute top-2 left-2 bg-indigo-900/80 text-white text-[9px] py-0.5 px-2 rounded-md font-mono">
                Arcade Grid x, y
              </div>
            </div>

            <div className="text-center text-[10px] text-indigo-300 font-bold max-w-[280px]">
              Click on the grid to instantly warp the ship components!
            </div>
          </div>

          {/* Controls instructions */}
          <div className="flex-1 space-y-4">
            <div className="bg-indigo-950/50 p-4 rounded-2xl border border-indigo-900">
              <h3 className="text-amber-400 font-bold text-md flex items-center gap-1 mb-2">
                <Trophy className="w-5 h-5" /> Star Catching Arcade!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pilot the rocket ship 🚀 using coordinates directions! Fly to the target Star located at:
              </p>
              
              <div className="flex items-center gap-3 justify-center my-3">
                <span className="text-amber-400 font-bold font-mono text-2xl bg-slate-950 px-4 py-2 rounded-xl border border-indigo-800">
                  ({arcadeStar.x}, {arcadeStar.y})
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <div>
                  <span className="text-indigo-400">Ship Position: </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">({spaceshipPos.x}, {spaceshipPos.y})</span>
                </div>
                <div>
                  <span className="text-indigo-400">Score: </span>
                  <span className="font-mono text-xs font-bold text-amber-300">{arcadeScore} XP</span>
                </div>
              </div>
            </div>

            {/* D-Pad Buttons */}
            <div className="flex flex-col items-center gap-1 select-none">
              <button
                onClick={() => moveSpaceship(0, 1)}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer transition-colors shadow-md"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => moveSpaceship(-1, 0)}
                  className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer transition-colors shadow-md animate-none"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSpaceshipPos({ x: 0, y: 0 });
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  ORIGIN (0,0)
                </button>
                <button
                  onClick={() => moveSpaceship(1, 0)}
                  className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer transition-colors shadow-md animate-none"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => moveSpaceship(0, -1)}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white p-2 rounded-lg cursor-pointer transition-colors shadow-md"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[10px] text-indigo-400 text-center italic">
              Up adds +1 to Y. Down subtracts -1 from Y. Right adds +1 to X. Left subtracts -1 from X.
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
}
