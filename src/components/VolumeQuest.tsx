import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Layers, RefreshCw, Star, Play, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface VolumeQuestProps {
  onEarnStars: (count: number) => void;
  onSetBarnabyMood: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

export default function VolumeQuest({ onEarnStars, onSetBarnabyMood }: VolumeQuestProps) {
  // Prism dimensions
  const [width, setWidth] = useState<number>(3);  // x
  const [depth, setDepth] = useState<number>(2);  // y
  const [height, setHeight] = useState<number>(2); // z

  // Challenge mode states
  const [questType, setQuestType] = useState<"calculate" | "build">("calculate");
  const [targetVolume, setTargetVolume] = useState<number>(12);
  
  // Quiz parameters
  const [targetWidth, setTargetWidth] = useState<number>(3);
  const [targetHeight, setTargetHeight] = useState<number>(2);
  const [targetDepth, setTargetDepth] = useState<number>(2);
  
  const [userVolInput, setUserVolInput] = useState<string>("");
  const [questSolved, setQuestSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string }>({
    isCorrect: null,
    text: "Adjust the sliders to build boxes and watch how the volume formula calculates in 3D!",
  });

  // Cube scale drawing parameters
  const SCALE = 24;
  const DX = SCALE * 0.866; // 20.78
  const DY = SCALE * 0.5;   // 12

  // Generate a new Volume challenge
  const generateNewQuest = () => {
    setQuestSolved(false);
    setUserVolInput("");
    setFeedback({ isCorrect: null, text: "" });

    const isCalculate = Math.random() > 0.5;
    if (isCalculate) {
      setQuestType("calculate");
      // Pick random values between 2 and 5 for a reasonable challenge
      const w = Math.floor(Math.random() * 4) + 2;
      const d = Math.floor(Math.random() * 4) + 2;
      const h = Math.floor(Math.random() * 4) + 2;
      
      setTargetWidth(w);
      setTargetDepth(d);
      setTargetHeight(h);
      
      // Auto-set sliders to these targets so children can see the 3D model, then they must calculate it
      setWidth(w);
      setDepth(d);
      setHeight(h);
      
      onSetBarnabyMood(
        "thinking",
        `Can you calculate the volume of this rectangular prism? It is ${w} units wide, ${d} units deep, and ${h} units high!`
      );
    } else {
      setQuestType("build");
      // Choose targets with multiple factorization possibilities: 12, 16, 18, 20, 24, 30
      const volumes = [12, 16, 18, 24, 30];
      const target = volumes[Math.floor(Math.random() * volumes.length)];
      setTargetVolume(target);
      
      // Let's randomize starting sliders so they are NOT currently equal to the target
      setWidth(1);
      setDepth(1);
      setHeight(1);

      onSetBarnabyMood(
        "thinking",
        `Let's build! Can you adjust the sliders to construct ANY rectangular prism with a volume of exactly ${target} cubic units? there are many ways!`
      );
    }
  };

  useEffect(() => {
    generateNewQuest();
  }, []);

  // Compute Volume
  const currentVolume = useMemo(() => {
    return width * depth * height;
  }, [width, depth, height]);

  // Painter's Algorithm layers ordering: bottom layer (k=0) to top (k=height-1),
  // back (j=0) to front (j=depth-1), left (i=0) to right (i=width-1)
  const sortedCubes = useMemo(() => {
    const cubes = [];
    const Cx = 140; // Center offset inside SVG
    const Cy = 140;

    for (let k = 0; k < height; k++) {
      for (let j = 0; j < depth; j++) {
        for (let i = 0; i < width; i++) {
          // Center projection for high-fidelity isometric cube (i, j, k)
          const cx = Cx + (i - j) * DX;
          const cy = Cy + (i + j) * DY - k * SCALE;
          cubes.push({ i, j, k, cx, cy });
        }
      }
    }
    return cubes;
  }, [width, depth, height, DX, DY, SCALE]);

  const verifyAnswer = () => {
    if (questSolved) return;

    if (questType === "calculate") {
      const correctVol = targetWidth * targetDepth * targetHeight;
      const parsedUser = parseInt(userVolInput.trim(), 10);

      if (parsedUser === correctVol) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Wow, Excellent! Length(${targetWidth}) × Width(${targetDepth}) × Height(${targetHeight}) = ${correctVol} cubic units! 🧊`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Incredible calculation! You multiplied all coordinates correctly. That's 5 stars!`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Incorrect Volume! Try multiplying the base area (${targetWidth} × ${targetDepth}) by the height (${targetHeight}).`,
        });
        onSetBarnabyMood("incorrect", `Take another look. Try counting the cubes on the 3D grid or multiply W × D × H!`);
      }
    } 
    
    else if (questType === "build") {
      if (currentVolume === targetVolume) {
        setQuestSolved(true);
        setFeedback({
          isCorrect: true,
          text: `Awesome Architecting! Your prism is ${width} × ${depth} × ${height} which totals exactly ${targetVolume} cubic units!`,
        });
        onEarnStars(5);
        onSetBarnabyMood("correct", `Fantastic! You discovered an equivalent combination: ${width} × ${depth} × ${height} = ${targetVolume}! Enjoy +5 Stars! ⭐`);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      } else {
        setFeedback({
          isCorrect: false,
          text: `Not quite! Your current box has a volume of ${currentVolume} cubic units. Adjust sliders until you hit exactly ${targetVolume}.`,
        });
        onSetBarnabyMood("incorrect", `Current volumes are ${currentVolume} units³. Keep moving the sliders to reach exactly ${targetVolume}!`);
      }
    }
  };

  return (
    <div id="volume-quest" className="bg-white rounded-3xl p-6 shadow-md border border-indigo-100 flex flex-col gap-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧊</span>
          <div>
            <h2 className="text-2xl font-bold text-indigo-600 font-sans">Volume Architect 3D</h2>
            <p className="text-xs text-slate-500">PYP Grade 5 Measurement Strand (Capacity & 3D Units)</p>
          </div>
        </div>
        <button
          onClick={generateNewQuest}
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Skip / New Problem
        </button>
      </div>

      {/* Inquiry rules block */}
      <div className="bg-indigo-50 border border-indigo-100/60 rounded-2xl p-4 flex items-start gap-3">
        <Layers className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-indigo-800 text-sm">Active Quest Rule:</h4>
          {questType === "calculate" ? (
            <p className="text-slate-700 text-sm">
              Study the stack of 3D unit cubes. The rectangular prism is <span className="font-bold text-slate-900">{targetWidth} units wide</span>, <span className="font-bold text-slate-900">{targetDepth} units deep</span>, and <span className="font-bold text-slate-900">{targetHeight} units high</span>. Calculate the total volume in cubic blocks!
            </p>
          ) : (
            <p className="text-slate-700 text-sm">
              Use the sliders below. Set Width, Depth, and Height so that the multiplication of all three equals exactly <span className="font-extrabold text-amber-600 text-base">{targetVolume}</span>! Can you spot different combinations that work?
            </p>
          )}
        </div>
      </div>

      {/* Interface workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
        
        {/* Isometric SVG Renderer */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative bg-white border border-slate-200 rounded-2xl p-4 w-full max-w-[280px] aspect-square flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 280 280" className="w-[230px] h-[230px] overflow-visible">
              {/* Background floor grid shadow for height perspective */}
              <polygon
                points={`140,240 ${140 + 5 * DX},${240 + 5 * DY} 140,${240 + 10 * DY} ${140 - 5 * DX},${240 + 5 * DY}`}
                className="fill-slate-100/65 stroke-slate-200 stroke-[1]"
              />

              {/* Loop to render sorting cubes back to front */}
              {sortedCubes.map((cube, idx) => {
                const { cx, cy } = cube;
                // Shift downwards to nest nicely in the SVG box
                const drawY = cy + 40;

                return (
                  <g key={`cube-${idx}`} className="transition-all duration-300">
                    {/* Left Face */}
                    <polygon
                      points={`${cx - DX},${drawY} ${cx},${drawY + DY} ${cx},${drawY + SCALE} ${cx - DX},${drawY + SCALE - DY}`}
                      className="fill-cyan-600 stroke-cyan-800 stroke-[0.8] opacity-90"
                    />
                    {/* Right Face */}
                    <polygon
                      points={`${cx},${drawY + DY} ${cx + DX},${drawY} ${cx + DX},${drawY + SCALE - DY} ${cx},${drawY + SCALE}`}
                      className="fill-cyan-800 stroke-cyan-950 stroke-[0.8] opacity-90"
                    />
                    {/* Top Face */}
                    <polygon
                      points={`${cx},${drawY - DY} ${cx + DX},${drawY} ${cx},${drawY + DY} ${cx - DX},${drawY}`}
                      className="fill-cyan-400 stroke-cyan-500 stroke-[0.8] opacity-90 hover:fill-amber-300"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Total Block Counters Overlay */}
            <div className="absolute top-2 right-2 bg-slate-900/95 text-white p-2 rounded-xl text-xs font-bold leading-none shadow-sm flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider">Volume Formula</span>
              <span className="font-mono text-cyan-400">
                {width} × {depth} × {height} = {currentVolume} units³
              </span>
            </div>
          </div>

          {/* Slices indicator */}
          <div className="text-[10px] text-slate-400 text-center font-bold">
            💡 Layer analysis: Base is {width} × {depth} (= {width*depth} cubes), stacked {height} high!
          </div>
        </div>

        {/* Sliders and Question form */}
        <div className="space-y-4">
          
          {/* Slices controller block */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">Prism Dimensions Panel</h3>
            
            {/* Width-l slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>↔ Width (Length): </span>
                <span className="text-indigo-600 font-bold">{width} units</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                disabled={questType === "calculate" && !questSolved} // Lock dimensions in calculation practice so students answer original question
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Depth-w slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>↗ Depth (Width): </span>
                <span className="text-indigo-600 font-bold">{depth} units</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                disabled={questType === "calculate" && !questSolved}
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Height-h slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>↕ Height: </span>
                <span className="text-indigo-600 font-bold">{height} units</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                disabled={questType === "calculate" && !questSolved}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Form interaction block */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            {questType === "calculate" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Submit the calculated volume of the matching {targetWidth} × {targetDepth} × {targetHeight} box:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Total Volume: </span>
                  <input
                    type="text"
                    disabled={questSolved}
                    placeholder="Volume units³"
                    value={userVolInput}
                    onChange={(e) => setUserVolInput(e.target.value)}
                    className="w-32 px-3 py-2 border-2 border-slate-200 rounded-lg font-bold font-mono text-center text-lg focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-mono">units³</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Current dimensions product matches:
                </p>
                <div className="flex justify-center items-center gap-1.5 bg-indigo-50 py-2.5 rounded-lg border border-indigo-100 font-mono font-bold text-sm text-indigo-700">
                  <span>{width}</span>
                  <span>×</span>
                  <span>{depth}</span>
                  <span>×</span>
                  <span>{height}</span>
                  <span>=</span>
                  <span className="text-base text-amber-600">{currentVolume} units³ / {targetVolume} target</span>
                </div>
              </div>
            )}
          </div>

          {/* Verification buttons and response banners */}
          <div className="flex flex-col gap-2">
            {!questSolved ? (
              <button
                onClick={verifyAnswer}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Verify Volume Plan!
              </button>
            ) : (
              <button
                onClick={generateNewQuest}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Embark on Next 3D Build Quest 🧊
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
                  {feedback.isCorrect ? "⭐ Success!" : "🤔 Adjust dimensions!"}
                </div>
                {feedback.text}
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
