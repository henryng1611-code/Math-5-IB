import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, RefreshCw, Star, HelpCircle, Trophy, PenTool, Award, Sparkles, AlertCircle, ArrowRight, Trash2, CheckCircle2, ChevronRight, HelpCircle as HintIcon, MessageSquare } from "lucide-react";
import confetti from "canvas-confetti";

interface CoordinateTreasureHuntProps {
  onEarnStars: (count: number) => void;
  onSetBarnaby: (mood: "happy" | "thinking" | "resting" | "correct" | "incorrect", msg: string) => void;
}

interface Mission {
  id: number;
  title: string;
  emoji: string;
  difficulty: "Beginner" | "Intermediate" | "Expert";
  instruction: string;
  hint: string;
  targetCount: number; // How many pins they need to plot
  // Verifier receives the plotted pins array [{x, y}] and returns whether correct + a feedback response string
  verifier: (pins: { x: number; y: number }[]) => { isCorrect: boolean; message: string; submessage?: string };
  initialPins?: { x: number; y: number }[]; // optional starting coordinates
  guidePoints?: { x: number; y: number; label: string }[]; // helpers shown as targets
}

const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "Symmetry Shield Construction",
    emoji: "🛡️",
    difficulty: "Beginner",
    instruction: "Your spacecraft spotted solar debris. To build a protective shield, plot the following 4 coordinate pins: A(-5, 4), B(5, 4), C(5, -4), and D(-5, -4). Form an aligned rectangular shield!",
    hint: "Walk horizontally to find x (left/right) first, then ascend/descend vertical y (up/down). Your pins should form a symmetrical 10x8 rectangle centered at the origin!",
    targetCount: 4,
    guidePoints: [
      { x: -5, y: 4, label: "A" },
      { x: 5, y: 4, label: "B" },
      { x: 5, y: -4, label: "C" },
      { x: -5, y: -4, label: "D" }
    ],
    verifier: (pins) => {
      const required = [
        { x: -5, y: 4 },
        { x: 5, y: 4 },
        { x: 5, y: -4 },
        { x: -5, y: -4 }
      ];
      // Check if all required positions are occupied
      const matched = required.map(req => 
        pins.some(p => p.x === req.x && p.y === req.y)
      );
      const allOk = matched.every(m => m === true);
      if (allOk) {
        return { isCorrect: true, message: "Shield fully charged! All 4 aligned coordinates are plotted exactly. We formed a beautifully symmetric rectangular barrier!" };
      }
      const missingCount = matched.filter(m => !m).length;
      return { isCorrect: false, message: `Almost there! You have missing elements. Still need to land ${missingCount} pins on the targeted green coordinates (${required.map(r => `(${r.x}, ${r.y})`).join(", ")}).` };
    }
  },
  {
    id: 2,
    title: "Deep Cosmos Reflection Quest",
    emoji: "🪞",
    difficulty: "Intermediate",
    instruction: "We spotted a key coordinate at point A(5, -6) in Quadrant IV. Reflect point A directly across the Y-axis (which reverses the X-axis sign), then plot its mirror reflection image pin B!",
    hint: "Reflecting a point (x, y) over the Y-axis keeps y exactly the same, but changes the sign of x. So (5, -6) reflected becomes (-5, -6). Go left 5 and down 6!",
    targetCount: 1,
    guidePoints: [{ x: 5, y: -6, label: "A (5, -6)" }],
    verifier: (pins) => {
      const target = { x: -5, y: -6 };
      const hasCorrect = pins.some(p => p.x === target.x && p.y === target.y);
      if (hasCorrect) {
        return { isCorrect: true, message: "Magnificent mirror reflection! Point B was plotted at (-5, -6). It has the same vertical depth but opposite horizontal placement!" };
      }
      return { isCorrect: false, message: "Hmm, that's not the correct reflection point. Reflecting (5, -6) over the vertical Y-axis mirror line should land you at (-5, -6). Check your coordinates!" };
    }
  },
  {
    id: 3,
    title: "Stellar 90° Orbit Rotation",
    emoji: "🌀",
    difficulty: "Expert",
    instruction: "A cosmic artifact resides at coordinate A(3, 4). Rotate this coordinate 90° counter-clockwise (CCW) around the center origin (0, 0). Plot the matching coordinate pin B!",
    hint: "Rule for rotating (x,y) 90° counter-clockwise: swap x and y, and negate the new first value: (-y, x). So rotating (3, 4) counter-clockwise gives (-4, 3)!",
    targetCount: 1,
    guidePoints: [{ x: 3, y: 4, label: "A (3, 4)" }],
    verifier: (pins) => {
      const target = { x: -4, y: 3 };
      const hasCorrect = pins.some(p => p.x === target.x && p.y === target.y);
      if (hasCorrect) {
        return { isCorrect: true, message: "Perfect 90° CCW circular orbit! You correctly rotated (3, 4) to (-4, 3) perfectly. Transformation Master in action!" };
      }
      return { isCorrect: false, message: "Not quite, space navigator! A 90° counter-clockwise rotation swaps the axes and moves you from Quadrant I to Quadrant II. Your target position is (-4, 3)!" };
    }
  },
  {
    id: 4,
    title: "Double-Step Master Navigation",
    emoji: "🚀",
    difficulty: "Expert",
    instruction: "Expert Multi-step Quest! Start from base checkpoint A(-4, -6). Step 1: Reflect A over the horizontal X-axis to get B. Step 2: Rotate point B exactly 90° clockwise (CW) around the origin (0,0) to get C. Plot point C!",
    hint: "Start at A(-4, -6). Reflecting over the X-axis negates Y, bringing you to B(-4, 6). Next, rotating a point (x, y) 90° clockwise swaps and negates: (y, -x). So B(-4, 6) rotated clockwise becomes C(6, 4). Plot point (6, 4)!",
    targetCount: 1,
    guidePoints: [{ x: -4, y: -6, label: "A (-4,-6)" }],
    verifier: (pins) => {
      const target = { x: 6, y: 4 };
      const hasCorrect = pins.some(p => p.x === target.x && p.y === target.y);
      if (hasCorrect) {
        return { isCorrect: true, message: "Outstanding double-step calculations! Reflecting A(-4, -6) over X gave B(-4, 6). Then rotating 90° CW gave C(6, 4)! Double stars granted! 🌟🌟" };
      }
      return { isCorrect: false, message: "Step 1: Reflect A(-4, -6) over the X-axis, which is B(-4, 6). Step 2: Rotate B 90° clockwise. The rule is (x, y) -> (y, -x), which lands you at coordinate (6, 4). Try again!" };
    }
  }
];

export default function CoordinateTreasureHunt({ onEarnStars, onSetBarnaby }: CoordinateTreasureHuntProps) {
  const [gameMode, setGameMode] = useState<"missions" | "symmetric_artist">("missions");
  const [activeMissionIdx, setActiveMissionIdx] = useState<number>(0);
  const [plottedPins, setPlottedPins] = useState<{ x: number; y: number }[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);
  const [isSymmetricArtistMode, setIsSymmetricArtistMode] = useState<boolean>(false);
  const [symmetryType, setSymmetryType] = useState<"none" | "mirror_y" | "mirror_x" | "origin_180">("mirror_y");
  
  // Quiz and reasoning states
  const [isMissionSolved, setIsMissionSolved] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean | null; text: string; subtext?: string }>({
    isCorrect: null,
    text: "Review the mission guidelines above, then click or drag pins on the ±10 grid to solve the coordinate puzzle!"
  });
  
  // Reasoning prompt modal state
  const [showReasoningModal, setShowReasoningModal] = useState<boolean>(false);
  const [reasoningInput, setReasoningInput] = useState<string>("");
  const [reasoningSubmitted, setReasoningSubmitted] = useState<boolean>(false);
  
  // Custom Artist state
  const [artistPinsCount, setArtistPinsCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeMission = MISSIONS[activeMissionIdx];

  // Map coordinate unit to canvas pixel position
  const getCanvasCoords = (gridX: number, gridY: number, size: number) => {
    const margin = 35;
    const gridSpan = size - margin * 2;
    const step = gridSpan / 20; // 20 divisions from -10 to 10
    return {
      x: margin + (gridX + 10) * step,
      y: margin + (10 - gridY) * step // Y-axis is inverted in canvas pixels
    };
  };

  // Convert canvas pixel mouse coordinate to grid coordinate
  const getGridCoordsFromPx = (pxX: number, pxY: number, size: number) => {
    const margin = 35;
    const gridSpan = size - margin * 2;
    const step = gridSpan / 20;
    const gridX = (pxX - margin) / step - 10;
    const gridY = 10 - (pxY - margin) / step;
    
    // Nearest integer coordinate clamped to [-10, 10]
    return {
      x: Math.max(-10, Math.min(10, Math.round(gridX))),
      y: Math.max(-10, Math.min(10, Math.round(gridY))),
      rawX: gridX,
      rawY: gridY
    };
  };

  // DRAW THE LABELED AXES OR SUBGRID INDICES
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal scaling size
    const size = 500;
    canvas.width = size;
    canvas.height = size;

    // Reset Canvas
    ctx.clearRect(0, 0, size, size);

    // Style parameters
    const margin = 35;
    const centerX = size / 2;
    const centerY = size / 2;
    const gridSpan = size - margin * 2;
    const step = gridSpan / 20;

    // BACKGROUND GRID LAYER
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue; // Skip primary axes
      const currentPos = margin + (i + 10) * step;

      // Vertical sub-lines
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(currentPos, margin);
      ctx.lineTo(currentPos, size - margin);
      ctx.stroke();

      // Horizontal sub-lines
      ctx.beginPath();
      ctx.moveTo(margin, currentPos);
      ctx.lineTo(size - margin, currentPos);
      ctx.stroke();
    }

    // DRAW THE CENTRAL X & Y AXES 
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]); // solid lines

    // Horizontal X Axis
    ctx.beginPath();
    ctx.moveTo(margin - 10, centerY);
    ctx.lineTo(size - margin + 10, centerY);
    ctx.stroke();

    // Vertical Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, margin - 10);
    ctx.lineTo(centerX, size - margin + 10);
    ctx.stroke();

    // AXES ARROWHEADS
    ctx.fillStyle = "#475569";
    // X right arrow
    ctx.beginPath();
    ctx.moveTo(size - margin + 10, centerY - 6);
    ctx.lineTo(size - margin + 20, centerY);
    ctx.lineTo(size - margin + 10, centerY + 6);
    ctx.fill();

    // X left arrow
    ctx.beginPath();
    ctx.moveTo(margin - 10, centerY - 6);
    ctx.lineTo(margin - 20, centerY);
    ctx.lineTo(margin - 10, centerY + 6);
    ctx.fill();

    // Y top arrow
    ctx.beginPath();
    ctx.moveTo(centerX - 6, margin - 10);
    ctx.lineTo(centerX, margin - 20);
    ctx.lineTo(centerX + 6, margin - 10);
    ctx.fill();

    // Y bottom arrow
    ctx.beginPath();
    ctx.moveTo(centerX - 6, size - margin + 10);
    ctx.lineTo(centerX, size - margin + 20);
    ctx.lineTo(centerX + 6, size - margin + 10);
    ctx.fill();

    // AXIS LABELS & GRADUATION TEXTS
    ctx.fillStyle = "#64748B";
    ctx.font = "bold 9px JetBrains Mono, monospace";
    ctx.textBaseline = "middle";

    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const currentPos = margin + (i + 10) * step;

      // X Tick Mark Line + Values labels
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(currentPos, centerY - 4);
      ctx.lineTo(currentPos, centerY + 4);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillText(String(i), currentPos, centerY + 14);

      // Y Tick Mark Line + Values labels
      ctx.beginPath();
      ctx.moveTo(centerX - 4, currentPos);
      ctx.lineTo(centerX + 4, currentPos);
      ctx.stroke();

      ctx.textAlign = "right";
      ctx.fillText(String(-i), centerX - 10, currentPos); // Inverted because canvas y coords go down
    }

    // Origin label
    ctx.fillStyle = "#475569";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(" O(0,0)", centerX + 6, centerY - 10);

    // Axis Header Title Labels
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold italic 11px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("X AXIS", size - 20, centerY - 16);
    ctx.textAlign = "left";
    ctx.fillText("Y AXIS", centerX + 12, 16);

    // DRAW QUADRANT LABELS I, II, III, IV
    ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
    ctx.font = "black 20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("QUADRANT I (+,+)", centerX + gridSpan / 4, centerY - gridSpan / 4);
    ctx.fillText("QUADRANT II (-,+)", centerX - gridSpan / 4, centerY - gridSpan / 4);
    ctx.fillText("QUADRANT III (-,-)", centerX - gridSpan / 4, centerY + gridSpan / 4);
    ctx.fillText("QUADRANT IV (+,-)", centerX + gridSpan / 4, centerY + gridSpan / 4);

    // DRAW MISSION TARGET GUIDE HELPER DOTS
    if (gameMode === "missions" && activeMission.guidePoints) {
      activeMission.guidePoints.forEach(pt => {
        const coords = getCanvasCoords(pt.x, pt.y, size);
        
        // Green highlight circles for targeting spots
        ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
        ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
        ctx.lineWidth = 2;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Inner marker
        ctx.fillStyle = "#10B981";
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = "#065F46";
        ctx.font = "extrabold 11px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(` ${pt.label}`, coords.x + 8, coords.y - 8);
      });
    }

    // DRAW DOTTED GUIDE PROJECTION LINES FOR THE HOVERED OVER PIN 
    if (hoveredPoint) {
      const coords = getCanvasCoords(hoveredPoint.x, hoveredPoint.y, size);
      ctx.strokeStyle = "#818CF8";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      // Projection line to Y-axis
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(centerX, coords.y);
      ctx.stroke();

      // Projection line to X-axis
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, centerY);
      ctx.stroke();

      ctx.setLineDash([]); // reset
    }

    // DRAW SHAPES CONNECTING THE PINS if more than 2 pins are plotted in Mission 1
    if (gameMode === "missions" && activeMission.id === 1 && plottedPins.length >= 2) {
      ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
      ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      plottedPins.forEach((pin, index) => {
        const coords = getCanvasCoords(pin.x, pin.y, size);
        if (index === 0) ctx.moveTo(coords.x, coords.y);
        else ctx.lineTo(coords.x, coords.y);
      });
      // Try to form closed rectangle if all 4 exist
      if (plottedPins.length === 4) {
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    }

    // DRAW SYMMETRY DESIGN CONNECTIONS (ARTIST MODE)
    if (gameMode === "symmetric_artist" && symmetryType !== "none" && plottedPins.length > 0) {
      plottedPins.forEach((p) => {
        const root = getCanvasCoords(p.x, p.y, size);
        let symmetricCoords: { x: number; y: number }[] = [];

        if (symmetryType === "mirror_y") {
          symmetricCoords.push({ x: -p.x, y: p.y });
        } else if (symmetryType === "mirror_x") {
          symmetricCoords.push({ x: p.x, y: -p.y });
        } else if (symmetryType === "origin_180") {
          symmetricCoords.push({ x: -p.x, y: -p.y });
        }

        // Draw helper connectors in transparent colors
        symmetricCoords.forEach(sym => {
          const targetCoords = getCanvasCoords(sym.x, sym.y, size);
          
          // Outer connector line
          ctx.strokeStyle = "rgba(245, 158, 11, 0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(root.x, root.y);
          ctx.lineTo(targetCoords.x, targetCoords.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Symmetric mirrored children preview
          ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
          ctx.strokeStyle = "#D97706";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetCoords.x, targetCoords.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      });
    }

    // DRAW THE ACTIVE PLOTTED PLOT PINS
    plottedPins.forEach((pin, index) => {
      const coords = getCanvasCoords(pin.x, pin.y, size);
      const isDragged = draggedIndex === index;

      // Outer ring animation
      ctx.fillStyle = isDragged ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.15)";
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Pin body
      ctx.fillStyle = isDragged ? "#4338CA" : "#4F46E5";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Small specular highlight inside point
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(coords.x - 3, coords.y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Little label text
      ctx.fillStyle = isDragged ? "#312E81" : "#1E1B4B";
      ctx.font = "black 10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      
      // Compute perfect position offset
      const textOffsetY = pin.y >= 0 ? -18 : 22;
      ctx.fillText(`(${pin.x}, ${pin.y})`, coords.x, coords.y + textOffsetY);
    });

  }, [plottedPins, draggedIndex, hoveredPoint, activeMissionIdx, gameMode, symmetryType]);

  // RESET CORE STATE
  const handleReset = () => {
    setPlottedPins([]);
    setDraggedIndex(null);
    setHoveredPoint(null);
    setIsMissionSolved(false);
    setReasoningSubmitted(false);
    setReasoningInput("");
    setFeedback({
      isCorrect: null,
      text: gameMode === "missions" 
        ? "Grid variables cleared! Click on the grid or drag items to formulate your correct mission answers."
        : "Canvas cleared! Draw symmetric vectors by clicking anywhere on the board!"
    });
    
    if (gameMode === "missions") {
      onSetBarnaby("thinking", `Grid reset! Start piloting your anchor coordinates. Remember, read X first, then Y! 🦉`);
    } else {
      onSetBarnaby("happy", "Let's make some coordinate art! Select your mirror axis and tap coordinates.");
    }
  };

  // HANDLE CANVAS GESTURES & INTUITION
  const getMousePosOnCanvas = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePosOnCanvas(canvas, e.clientX, e.clientY);
    const grid = getGridCoordsFromPx(pos.x, pos.y, canvas.width);

    // Check if clicked near an existing pin to initiate dragging
    const pinIndex = plottedPins.findIndex(
      pin => Math.abs(pin.x - grid.rawX) < 0.65 && Math.abs(pin.y - grid.rawY) < 0.65
    );

    if (pinIndex !== -1) {
      setDraggedIndex(pinIndex);
      onSetBarnaby("thinking", `Dragging pin from (${plottedPins[pinIndex].x}, ${plottedPins[pinIndex].y}). Move the slider!`);
    } else {
      // Create a brand new pin if we are below target count or in artist mode
      const maxCount = gameMode === "missions" ? activeMission.targetCount : 12;
      
      if (plottedPins.length < maxCount) {
        setPlottedPins(prev => [...prev, { x: grid.x, y: grid.y }]);
        onSetBarnaby("happy", `Plotted new coordinate pin at exactly (${grid.x}, ${grid.y})!`);
      } else if (gameMode === "missions") {
        onSetBarnaby("thinking", `You have already plotted your ${maxCount} pins! You can drag them around the board to adjust locations.`);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getMousePosOnCanvas(canvas, e.clientX, e.clientY);
    const grid = getGridCoordsFromPx(pos.x, pos.y, canvas.width);

    setHoveredPoint({ x: grid.x, y: grid.y });

    if (draggedIndex !== null) {
      setPlottedPins(prev => {
        const nextPins = [...prev];
        nextPins[draggedIndex] = { x: grid.x, y: grid.y };
        return nextPins;
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedIndex(null);
  };

  // TOUCH GESTURE COMPATIBILITY FOR HANDHELD DEVICES
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePosOnCanvas(canvas, touch.clientX, touch.clientY);
    const grid = getGridCoordsFromPx(pos.x, pos.y, canvas.width);

    const pinIndex = plottedPins.findIndex(
      pin => Math.abs(pin.x - grid.rawX) < 1.0 && Math.abs(pin.y - grid.rawY) < 1.0
    );

    if (pinIndex !== -1) {
      setDraggedIndex(pinIndex);
    } else {
      const maxCount = gameMode === "missions" ? activeMission.targetCount : 12;
      if (plottedPins.length < maxCount) {
        setPlottedPins(prev => [...prev, { x: grid.x, y: grid.y }]);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePosOnCanvas(canvas, touch.clientX, touch.clientY);
    const grid = getGridCoordsFromPx(pos.x, pos.y, canvas.width);

    setHoveredPoint({ x: grid.x, y: grid.y });

    if (draggedIndex !== null) {
      setPlottedPins(prev => {
        const nextPins = [...prev];
        nextPins[draggedIndex] = { x: grid.x, y: grid.y };
        return nextPins;
      });
    }
  };

  const handleTouchEnd = () => {
    setDraggedIndex(null);
  };

  // CHECK EXERCISE SOLUTION
  const handleVerifyMission = () => {
    if (isMissionSolved) return;

    const result = activeMission.verifier(plottedPins);
    
    if (result.isCorrect) {
      setIsMissionSolved(true);
      setFeedback({
        isCorrect: true,
        text: result.message,
        subtext: "Awesome navigating! Click the button below to submit your Metacognition Reflection for bonus Double Stars!"
      });

      // Basic success tone from guideliner
      onSetBarnaby(
        "correct",
        `Brilliant math scouting! 🌟 You cracked this challenge! Let's explain our mathematical reasoning.`
      );
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Immediately launch the reasoning prompt to encourage reflectiveness
      setShowReasoningModal(true);

    } else {
      setFeedback({
        isCorrect: false,
        text: result.message
      });
      onSetBarnaby("incorrect", "Almost, scout! Drag your pins to the coordinates recommended in the hints. You can do it!");
    }
  };

  // SUBMIT METATHINKING REFLACTION FOR DOUBLE STARS STATUS
  const handleSubmitReasoning = () => {
    if (!reasoningInput.trim()) return;

    setShowReasoningModal(false);
    setReasoningSubmitted(true);

    // Calculate payouts. Expert missions give DOUBLE stars! 
    const isExpert = activeMission.difficulty === "Expert";
    const baseStars = isExpert ? 20 : 10;
    const bonusStars = 10; // extra reflection payload
    
    const totalStars = baseStars + bonusStars;
    onEarnStars(totalStars);

    setFeedback(prev => ({
      ...prev,
      text: `🎉 Cleared & Fully Solved! You unlocked the 'Transformation Master' badge!`,
      subtext: `We registered your thought inquiry: "${reasoningInput}". That's brilliant critical thinking! Awarded +${totalStars} STARS! (+${baseStars} Base + ${bonusStars} Reflection reward!)`
    }));

    onSetBarnaby(
      "happy",
      `Stupendous work, scholar! 🦉 Your insights on symmetry and geometry represent deep inquiry. You earned an amazing +${totalStars} stars! Check out the accessory store!`
    );

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  // SUBMIT ARTIST SYMMETRIC PATTERN FOR EXTRA STAR REWARD
  const handleSubmitSymmetricDesign = () => {
    if (plottedPins.length === 0) {
      setFeedback({
        isCorrect: false,
        text: "Please plot at least 1 design coordinate seed pin on the grid first!"
      });
      return;
    }

    // Multiply star counts based on plotted vertices complexity!
    const complexityBonus = Math.min(15, plottedPins.length * 2);
    const starGains = 10 + complexityBonus;
    onEarnStars(starGains);

    setFeedback({
      isCorrect: true,
      text: `🎨 Masterpiece Registered! Awarded +${starGains} Stars for creating original symmetric designs!`,
      subtext: `The grid generated beautifully mirrored geometry over the specified axis. Feel free to download or try other rotations!`
    });

    onSetBarnaby(
      "happy",
      `Splendid engineering art! 🌟 You created beautiful symmetric geometries. Barnaby looks highly decorated (+${starGains} Stars)!`
    );

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setPlottedPins([]);
  };

  // CHANGE ACTIVE MISSIONS
  const handleSelectMission = (idx: number) => {
    setActiveMissionIdx(idx);
    setPlottedPins([]);
    setDraggedIndex(null);
    setHoveredPoint(null);
    setIsMissionSolved(false);
    setReasoningSubmitted(false);
    setReasoningInput("");
    setFeedback({
      isCorrect: null,
      text: `Mission loaded! Plot/Drag exactly ${MISSIONS[idx].targetCount} coordinates to complete the mission.`
    });
    onSetBarnaby("thinking", `We loaded: "${MISSIONS[idx].title}". Let's challenge coordinates transformation! 🦉`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-cyan-100 space-y-6" id="coordinate-canvased-game">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-cyan-50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚓</span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Coordinates Treasure Hunt</h2>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                ±10 Grid Precision Pilot Block • Canvas-Powered
              </p>
            </div>
          </div>
        </div>

        {/* MODE BUTTONS SLIDER */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setGameMode("missions");
              handleReset();
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              gameMode === "missions"
                ? "bg-indigo-650 text-white shadow-sm"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Transform Missions
          </button>
          <button
            onClick={() => {
              setGameMode("symmetric_artist");
              handleReset();
              onSetBarnaby("happy", "Let's make math art. Select your mirror line, and place pins to automatically mirror them!");
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              gameMode === "symmetric_artist"
                ? "bg-indigo-650 text-white shadow-sm"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Symmetric Designer 🎨
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE CHALLENGES SELECTION OR OPTIONS */}
        <div className="lg:col-span-4 space-y-5">
          {gameMode === "missions" ? (
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Active Mission Link:
              </span>
              <div className="space-y-2.5">
                {MISSIONS.map((m, idx) => {
                  const isCur = idx === activeMissionIdx;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMission(idx)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 ${
                        isCur
                          ? "bg-indigo-50/50 border-indigo-300 shadow-sm ring-1 ring-indigo-200"
                          : "bg-slate-50/40 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-2xl bg-white p-1 rounded-lg block h-10 w-10 text-center shadow-sm">
                        {m.emoji}
                      </span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-xs truncate">{m.title}</h4>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            m.difficulty === "Expert" 
                              ? "bg-red-50 text-red-600 border border-red-100" 
                              : m.difficulty === "Intermediate" 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-emerald-150 text-emerald-800"
                          }`}>
                            {m.difficulty}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                          {m.instruction}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // SYMMETRIC OPTIONS PANEL
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Mirrored Symmetry Engine
                </h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Toggle reflecting axes. Placing a coordinate pin will automatically copy elements symmetrically onto the board!
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase">
                  Select Mirror Operator:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setSymmetryType("mirror_y")}
                    className={`p-2.5 text-left text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-between ${
                      symmetryType === "mirror_y"
                        ? "bg-indigo-600 text-white border-transparent"
                        : "bg-white hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>↔ Reflection over Y-Axis</span>
                    <span className="text-[9px] font-mono opacity-80">(x,y) → (-x,y)</span>
                  </button>
                  <button
                    onClick={() => setSymmetryType("mirror_x")}
                    className={`p-2.5 text-left text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-between ${
                      symmetryType === "mirror_x"
                        ? "bg-indigo-600 text-white border-transparent"
                        : "bg-white hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>↕ Reflection over X-Axis</span>
                    <span className="text-[9px] font-mono opacity-80">(x,y) → (x,-y)</span>
                  </button>
                  <button
                    onClick={() => setSymmetryType("origin_180")}
                    className={`p-2.5 text-left text-xs font-bold rounded-xl border cursor-pointer flex items-center justify-between ${
                      symmetryType === "origin_180"
                        ? "bg-indigo-600 text-white border-transparent"
                        : "bg-white hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>🌀 Origin 180° Point Rotation</span>
                    <span className="text-[9px] font-mono opacity-80">(x,y) → (-x,-y)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex gap-2">
                <button
                  onClick={handleSubmitSymmetricDesign}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" /> Save Design (+15⭐)
                </button>
                <button
                  onClick={handleReset}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 text-xs font-bold rounded-xl cursor-pointer"
                  title="Clear Grid"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE ADVISER PANEL */}
          <div className="bg-indigo-50/45 p-4 rounded-3xl border border-indigo-150/40">
            <div className="flex gap-2.5">
              <span className="text-xl bg-white p-1 rounded-xl block h-8 w-8 text-center shadow-sm">💡</span>
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">
                  Scout Guidance Hub
                </h5>
                <p className="text-[10px] text-slate-600 leading-normal font-semibold">
                  {gameMode === "missions" ? activeMission.hint : "Click coordinates around the ±10 quadrants to map coordinates math! Drag plotted anchors with mouse or finger gestures to adjust."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: THE RESPONSIVE CANVAS GRID LAYER */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative bg-[#0F172A] p-2.5 rounded-3xl shadow-lg border border-slate-700 max-w-full">
            {/* CANVAS INTERACTIVE ELEMENT */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="bg-white rounded-2xl block border border-slate-200 shadow-md cursor-crosshair max-w-full aspect-square"
              style={{ width: "380px" }}
            />

            {/* LIVE DATA HUD OVERLAY */}
            <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[9px] font-extrabold font-mono rounded-lg py-1 px-2 border border-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                PILOT HUD: {hoveredPoint ? `(${hoveredPoint.x}, ${hoveredPoint.y})` : "NO POSITION"}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 bg-indigo-900/90 text-white text-[9px] font-bold rounded-lg py-1 px-2.5 border border-indigo-700">
              {gameMode === "missions" ? `Pins Plotted: ${plottedPins.length} / ${activeMission.targetCount}` : `Design Seeds: ${plottedPins.length}`}
            </div>
          </div>
          
          <span className="text-[10px] text-slate-400 font-bold mt-2 text-center max-w-[280px]">
            Tip: Press on any blue pin and drag to fine-tune placement on intersections!
          </span>
        </div>

        {/* RIGHT COLUMN: ACTIVE EXERCISE FORM CONTROLS */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide">
              {gameMode === "missions" ? "Transformation Verificator" : "Mirrored Coordinates List"}
            </h3>

            {gameMode === "missions" ? (
              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-bold uppercase">
                    Your Plotted Coordinates:
                  </p>
                  {plottedPins.length === 0 ? (
                    <span className="block text-slate-400 text-xs italic">
                      No coordinates plotted yet. Click on the grid to create coordinates seeds!
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {plottedPins.map((p, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-slate-200 text-[10px] font-mono font-bold rounded-lg text-slate-700 shadow-sm flex items-center gap-1 hover:border-red-300"
                        >
                          ({p.x}, {p.y})
                          <button
                            onClick={() => setPlottedPins(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-red-400 hover:text-red-650 font-bold font-mono ml-0.5 text-[8px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-2">
                  {!isMissionSolved ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleVerifyMission}
                        disabled={plottedPins.length === 0}
                        className={`w-full font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all text-white ${
                          plottedPins.length > 0
                            ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer transform hover:-translate-y-0.5"
                            : "bg-slate-300 cursor-not-allowed"
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" /> Verify Transformation!
                      </button>
                      <button
                        onClick={handleReset}
                        className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300/60 text-slate-700 font-bold text-xs py-2 rounded-xl text-center cursor-pointer"
                      >
                        Reset / Clear Pins
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reasoningSubmitted ? (
                        <button
                          onClick={() => {
                            const next = (activeMissionIdx + 1) % MISSIONS.length;
                            handleSelectMission(next);
                          }}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-xl shadow cursor-pointer flex items-center justify-center gap-1"
                        >
                          Next Mission Challenge <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowReasoningModal(true)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 animate-bounce"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Metathinking Reflection (+10⭐)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // SYMMETRIC ARTIST PINS LIST
              <div className="space-y-3">
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-150 text-[10px] text-slate-500 font-bold leading-relaxed">
                  <span className="block text-indigo-700 font-extrabold">Mirrored Pairs:</span>
                  {plottedPins.map((p, idx) => {
                    let symX = p.x;
                    let symY = p.y;
                    if (symmetryType === "mirror_y") symX = -p.x;
                    else if (symmetryType === "mirror_x") symY = -p.y;
                    else if (symmetryType === "origin_180") {
                      symX = -p.x;
                      symY = -p.y;
                    }
                    return (
                      <div key={idx} className="flex justify-between border-b border-dashed border-slate-100 py-1">
                        <span>Original: ({p.x}, {p.y})</span>
                        <span className="text-amber-600">Mirrored: ({symX}, {symY})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC SOLVED RESPONSE ALERT BOX */}
          {feedback.isCorrect !== null && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3.5 rounded-2xl border text-[11px] leading-relaxed font-semibold ${
                feedback.isCorrect
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="font-extrabold flex items-center gap-1 mb-1 text-xs">
                {feedback.isCorrect ? <Award className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{feedback.isCorrect ? "Perfect Resolution!" : "Navigational Alert!"}</span>
              </div>
              <p>{feedback.text}</p>
              {feedback.subtext && <p className="mt-1.5 text-indigo-900 border-t border-slate-200/40 pt-1.5 text-[10px] leading-normal font-sans">{feedback.subtext}</p>}
            </motion.div>
          )}
        </div>
      </div>

      {/* METAMIND REASONING DIALOG MODAL */}
      <AnimatePresence>
        {showReasoningModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 border border-indigo-100"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🦉</span>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Barnaby's Metacognitive Enquiry!</h3>
                  <p className="text-[10.5px] uppercase tracking-wide font-extrabold text-indigo-600">
                    Symmetry & Transformations Reflection Prompt
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs font-semibold leading-relaxed text-slate-700">
                <span className="font-extrabold text-amber-800 block mb-1">
                  💡 Inquire Prompt Question:
                </span>
                "Explain how symmetry or geometric transformations help in real life (for example, in constructing architectures, drawing sports fields, biological cells structures, or navigational GPS systems)."
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase">
                  Write Your Short Scout Answer:
                </label>
                <textarea
                  value={reasoningInput}
                  onChange={(e) => setReasoningInput(e.target.value)}
                  placeholder="e.g. Symmetry helps architects design balanced buildings like the Taj Mahal so gravity weights are distributed equally! It is also beautiful to look at."
                  className="w-full min-h-[90px] text-xs p-3.5 border-2 border-slate-200 focus:border-indigo-500 focus:outline-none rounded-2xl leading-relaxed text-slate-700 font-semibold"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReasoning}
                  disabled={!reasoningInput.trim()}
                  className={`flex-1 font-extrabold text-xs py-3 rounded-2xl shadow flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white ${
                    !reasoningInput.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Reflection & Claim Double Stars 🎉
                </button>
                <button
                  onClick={() => setShowReasoningModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-2xl cursor-pointer text-slate-600"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
