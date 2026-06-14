export interface Question {
  id: string;
  context: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

// Simple deterministic hash to shuffle options based on question index
function deterministicShuffle(choices: string[], correctIndex: number, idx: number): { choices: string[]; correctIndex: number } {
  const seed = idx + choices.length * 3;
  const shuffled = [...choices];
  let newCorrectIndex = correctIndex;

  // Perform deterministic swaps
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs(seed * (i + 13)) % (i + 1);
    
    // Swap choices
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;

    // Track where the correct index went
    if (newCorrectIndex === i) {
      newCorrectIndex = j;
    } else if (newCorrectIndex === j) {
      newCorrectIndex = i;
    }
  }

  return { choices: shuffled, correctIndex: newCorrectIndex };
}

export function generateExercise(unitId: string, idx: number): Question {
  // idx goes from 1 to 100
  let difficulty: "Easy" | "Medium" | "Difficult" = "Easy";
  let diffColor = "🟢 Easy";
  if (idx > 33 && idx <= 66) {
    difficulty = "Medium";
    diffColor = "🟡 Medium";
  } else if (idx > 66) {
    difficulty = "Difficult";
    diffColor = "🔴 Difficult";
  }

  let context = `🌍 Unit Exercise ${idx}/100 • ${diffColor}`;
  let question = "";
  let choices: string[] = [];
  let correctIndex = 0;
  let explanation = "";

  const names = [
    "Barnaby", "Leo", "Mia", "Zoe", "Sam", "Ava", "Eli", "Grace", "Oliver", 
    "Chloe", "Sophia", "Lucas", "Noah", "Emily", "Aiden", "Isabella", "Maya", "Daniel"
  ];
  const items = [
    "recycled glass beads", "marine biological sensors", "solar energy adapters", "compost garden bins",
    "rectangular science modules", "aquaponic fish containers", "classroom math textbooks", "community pizza slices"
  ];

  const name1 = names[(idx + 2) % names.length];
  const name2 = names[(idx + 5) % names.length];
  const item1 = items[(idx + 1) % items.length];

  if (unitId === "fractions_decimals" || unitId === "fractions") {
    // UNIT 1: Fractions & Decimals (Numbers)
    if (difficulty === "Easy") {
      // 1-step fractions, simple equivalence, basic decimals
      const totalSlices = 5 + (idx % 6); // 5 to 10
      const eatenSlices = 1 + (idx % (totalSlices - 2)); // 1 to totalSlices-2
      const leftSlices = totalSlices - eatenSlices;

      const type = idx % 3;
      if (type === 0) {
        // Decimal convert
        const denom = (idx % 2 === 0) ? 5 : 10;
        const num = 1 + (idx % (denom - 1));
        const decimalVal = (num / denom).toFixed(2);
        
        question = `At the local green energy hub, ${name1} monitors a solar panel array. If exactly ${num}/${denom} of the solar grid accumulates maximum current, which of the following represents this fraction as a decimal value?`;
        choices = [
          `${decimalVal}`,
          `${((num + 1) / denom).toFixed(2)}`,
          `${(num / (denom * 2)).toFixed(2)}`,
          `0.0${num}`
        ];
        explanation = `To convert state fractional values into decimals, divide our top numerator by our bottom denominator. So, ${num} ÷ ${denom} gives exactly ${decimalVal}!`;
      } else if (type === 1) {
        // Pizza slice leftovers
        question = `${name1} and ${name2} are sharing a community garden plot divided into ${totalSlices} equal square sections. If they plant carrots in ${eatenSlices} sections, what fraction represents the remaining unseeded garden plot?`;
        choices = [
          `${leftSlices}/${totalSlices}`,
          `${eatenSlices}/${totalSlices}`,
          `1/${totalSlices}`,
          `${leftSlices}/${totalSlices + 2}`
        ];
        explanation = `The whole garden has ${totalSlices} total sections. Planting on ${eatenSlices} sections leaves ${totalSlices} - ${eatenSlices} = ${leftSlices} sections unseeded. Thus, ${leftSlices}/${totalSlices} remains!`;
      } else {
        // Pure Simplification
        const multiplier = 2 + (idx % 4); // 2 to 5
        const baseNum = 3;
        const baseDenom = 4;
        const largeNum = baseNum * multiplier;
        const largeDenom = baseDenom * multiplier;

        question = `Barnaby is sorting ${item1} into math kits. He catalogs the success rate as ${largeNum}/${largeDenom}. What equivalent fraction is this when simplified to its lowest terms?`;
        choices = [
          `${baseNum}/${baseDenom}`,
          `1/2`,
          `2/3`,
          `${largeNum - 2}/${largeDenom - 2}`
        ];
        explanation = `To simplify ${largeNum}/${largeDenom}, find the greatest common factor, which is ${multiplier}. Dividing top and bottom by ${multiplier} gives exactly ${baseNum}/${baseDenom}!`;
      }
    } else if (difficulty === "Medium") {
      // Adding fractions, multistep decimals
      const type = idx % 3;
      if (type === 0) {
        // Simple addition of halves, fourths, eighths
        // (A/4) + (B/8)
        const fourths = 1 + (idx % 2); // 1 or 2 fourths
        const eighths = 1 + (idx % 4); // 1 to 4 eighths
        const convertedFourths = fourths * 2;
        const sumEighths = convertedFourths + eighths;
        
        question = `For a science experiment, ${name1} pours ${fourths}/4 kilograms of soil into a jar, and then adds another ${eighths}/8 kilograms of mineral dust. What is the combined total weight of soil in the jar?`;
        choices = [
          `${sumEighths}/8 kg`,
          `${fourths + eighths}/12 kg`,
          `${convertedFourths}/8 kg`,
          `${(sumEighths + 2)}/8 kg`
        ];
        explanation = `To add these, find a common denominator (8). Convert ${fourths}/4 to eighths: (${fourths}×2)/(4×2) = ${convertedFourths}/8. Now, ${convertedFourths}/8 + ${eighths}/8 = ${sumEighths}/8 kg total!`;
      } else if (type === 1) {
        // Decimals subtraction
        const initial = (15.5 + (idx % 10)).toFixed(1);
        const used = (4.2 + (idx % 6)).toFixed(1);
        const rem = (parseFloat(initial) - parseFloat(used)).toFixed(2);

        question = `${name1} starts an inquiry lesson with a spool containing ${initial} meters of biodegradable measuring rope. After the teams cut out exactly ${used} meters for coordinate mapping, how many meters of rope are left?`;
        choices = [
          `${rem} m`,
          `${(parseFloat(rem) + 1.5).toFixed(1)} m`,
          `${(parseFloat(rem) - 0.8).toFixed(1)} m`,
          `${(parseFloat(initial) + parseFloat(used)).toFixed(1)} m`
        ];
        explanation = `Subtract the used rope length from the initial length: ${initial} - ${used} = ${rem} meters left!`;
      } else {
        // Decimals multiplication (single digits)
        const count = 3 + (idx % 5); // 3 to 7
        const unitVal = (0.25 * (1 + (idx % 3))).toFixed(2); // 0.25, 0.50, 0.75
        const totalVal = (count * parseFloat(unitVal)).toFixed(2);

        question = `${name1} measures ${count} eco-friendly water vials. If each vial contains exactly ${unitVal} liters of liquid fuel, what is the combined volume of all the vials measured?`;
        choices = [
          `${totalVal} liters`,
          `${(parseFloat(totalVal) + 0.5).toFixed(2)} liters`,
          `${(parseFloat(totalVal) * 2).toFixed(2)} liters`,
          `${(count + parseFloat(unitVal)).toFixed(2)} liters`
        ];
        explanation = `Multiply the count of vials by the volume per vial: ${count} vials × ${unitVal} liters = ${totalVal} liters total!`;
      }
    } else {
      // Difficult / Expert
      const type = idx % 3;
      if (type === 0) {
        // Multi-discount problem
        const price = 50 + (idx % 5) * 10; // $50, $60, $70, $80, $90
        const disc1 = 20; // 20%
        const disc2 = 10; // 10%
        const intermediate = price * 0.80;
        const finalPrice = intermediate * 0.90;

        question = `At the PYP math accessories store, a supreme calculator costs $${price}. A seasonal coupon offers 20% off. If ${name1} then presents a Barnaby badge giving an additional 10% off the discounted price, what is the final cost?`;
        choices = [
          `$${finalPrice.toFixed(2)}`,
          `$${(price * 0.70).toFixed(2)}`,
          `$${(price - 15).toFixed(2)}`,
          `$${(price * 0.80).toFixed(2)}`
        ];
        explanation = `First discount of 20% on $${price} is $${(price * 0.2).toFixed(2)} off, leaving $${intermediate.toFixed(2)}. The second 10% discount is calculated on $${intermediate.toFixed(2)} ($${(intermediate * 0.1).toFixed(2)} off). Final price = $${intermediate.toFixed(2)} - $${(intermediate * 0.1).toFixed(2)} = $${finalPrice.toFixed(2)}!`;
      } else if (type === 1) {
        // Mixed number fraction multiplication
        // A 1/2 * B 1/3
        const wholeA = 2 + (idx % 3); // 2 or 3 or 4
        const wholeB = 1 + (idx % 2); // 1 or 2
        // A.5 * B.333
        // e.g., 2 1/2 * 1 1/3 = 5/2 * 4/3 = 20/6 = 10/3 = 3 1/3
        // Numerator calculations
        const numA = wholeA * 2 + 1; // 5 or 7 or 9
        const numB = wholeB * 3 + 1; // 4 or 7
        const productNum = numA * numB;
        const productDenom = 6;
        const wholeResult = Math.floor(productNum / productDenom);
        const remNum = productNum % productDenom;
        // simplify remNum/6
        let fracStr = `${remNum}/6`;
        if (remNum === 2) fracStr = "1/3";
        if (remNum === 3) fracStr = "1/2";
        if (remNum === 4) fracStr = "2/3";
        
        const finalFracStr = `${wholeResult} ${fracStr}`;

        question = `Barnaby has a scientific formula that requires ${wholeA} 1/2 liters of organic compost. If he intends to manufacture exactly ${wholeB} 1/3 batches of this formula, how many liters of compost does he require?`;
        choices = [
          `${finalFracStr} liters`,
          `${wholeA * wholeB} 1/5 liters`,
          `${wholeResult + 2} 1/6 liters`,
          `${wholeA + wholeB} 5/6 liters`
        ];
        explanation = `Convert mixed numbers to improper fractions: ${wholeA} 1/2 = ${numA}/2. ${wholeB} 1/3 = ${numB}/3. Multiply them: ${numA}/2 × ${numB}/3 = ${productNum}/6. Converting back gives ${finalFracStr} liters of compost!`;
      } else {
        // Real-world comparison rates
        const litersA = 3;
        const costA = 12 + (idx % 3) * 3; // 12, 15, 18
        const rateA = costA / litersA;
        const litersB = 5;
        const costB = rateA * litersB - 1; // slightly cheaper rate
        const rateB = costB / litersB;

        question = `Store A sells 3 liters of chemical fuel for $${costA}. Store B sells 5 liters of matching fuel for $${costB}. Which option has the fairer price per liter of fuel, and what is its rate?`;
        choices = [
          `Store B is fairer at $${rateB.toFixed(2)}/liter`,
          `Store A is fairer at $${rateA.toFixed(2)}/liter`,
          `Both stores offer the exact same rate`,
          `Store B is fairer at $${(rateB + 0.3).toFixed(2)}/liter`
        ];
        explanation = `Store A rate: $${costA} ÷ 3 = $${rateA.toFixed(2)} per liter. Store B rate: $${costB} ÷ 5 = $${rateB.toFixed(2)} per liter. Thus, Store B has the fairer cost rate!`;
      }
    }
  } else if (unitId === "coordinates_plane" || unitId === "coordinates") {
    // UNIT 2: Shape & Space (Coordinate Plane)
    if (difficulty === "Easy") {
      const x = -5 + (idx % 11); // -5 to 5
      const y = -5 + ((idx + 3) % 11); // -5 to 5
      
      const type = idx % 2;
      if (type === 0 && x !== 0 && y !== 0) {
        // Grid quadrant location
        let quad = "Quadrant I";
        if (x < 0 && y > 0) quad = "Quadrant II";
        if (x < 0 && y < 0) quad = "Quadrant III";
        if (x > 0 && y < 0) quad = "Quadrant IV";

        question = `On a 4-quadrant science tracking monitor, a marine sensor is mapped at coordinates (${x}, ${y}). In which mathematical quadrant does this sensor sit?`;
        choices = [
          quad,
          quad === "Quadrant I" ? "Quadrant II" : "Quadrant I",
          quad === "Quadrant III" ? "Quadrant IV" : "Quadrant III",
          "On the Origin line"
        ];
        explanation = `Coordinates are (x, y). X is ${x > 0 ? "positive (right)" : "negative (left)"}, and Y is ${y > 0 ? "positive (up)" : "negative (down)"}. This corresponds exactly to ${quad}!`;
      } else {
        // Horizontal walk then climb concept
        const transX = 3 + (idx % 4);
        question = `${name1} stands at coordinate (2, -3). If they walk horizontally right exactly ${transX} steps, what are their new coordinate indices on the map?`;
        choices = [
          `(${2 + transX}, -3)`,
          `(2, ${-3 + transX})`,
          `(${2 - transX}, -3)`,
          `(${2 + transX}, ${-3 + transX})`
        ];
        explanation = `Walking horizontally modifies only the horizontal X index. Starting at X=2 and moving right ${transX} steps means X becomes 2 + ${transX} = ${2 + transX}. Y remains unchanged at -3. Coordinates: (${2 + transX}, -3).`;
      }
    } else if (difficulty === "Medium") {
      // 2-step translate, distance, or fourth corner rectangle
      const type = idx % 2;
      if (type === 0) {
        // Fourth corner
        const xMin = -4 + (idx % 3);
        const xMax = xMin + 5;
        const yMin = -3 + (idx % 3);
        const yMax = yMin + 4;
        // Corners: (xMin, yMin), (xMax, yMin), (xMax, yMax), (xMin, yMax)
        // Let's hide (xMin, yMax)
        question = `Three vertex markers of a rectangular solar collector array are located on our site grid at (${xMin}, ${yMin}), (${xMax}, ${yMin}), and (${xMax}, ${yMax}). What coordinates must the final fourth vertex represent to complete our rectangle?`;
        choices = [
          `(${xMin}, ${yMax})`,
          `(${xMin}, ${yMin - 2})`,
          `(${xMax + 1}, ${yMax})`,
          `(${xMin + 1}, ${yMin + 1})`
        ];
        explanation = `A rectangle aligns vertically and horizontally with its corners. The bottom side is between x=${xMin} and x=${xMax} at y=${yMin}. The right side is between y=${yMin} and y=${yMax} at x=${xMax}. The fourth corner matches the left x(${xMin}) and top y(${yMax}), giving (${xMin}, ${yMax})!`;
      } else {
        // Submarine translate
        const x1 = -3 + (idx % 6);
        const y1 = -2 + (idx % 5);
        const dx = 4 + (idx % 4); // translate right
        const dy = -(3 + (idx % 3)); // translate down
        const x2 = x1 + dx;
        const y2 = y1 + dy;

        question = `A remote sea rover at (${x1}, ${y1}) is commanded to translate exactly ${dx} units right and ${Math.abs(dy)} units downward. What coordinates represent its target destination?`;
        choices = [
          `(${x2}, ${y2})`,
          `(${x1 - dx}, ${y1 + dy})`,
          `(${x2}, ${y1 + Math.abs(dy)})`,
          `(${x1 + dy}, ${y1 + dx})`
        ];
        explanation = `Translate right by adding ${dx} to X: ${x1} + ${dx} = ${x2}. Translate down by subtracting ${Math.abs(dy)} from Y: ${y1} - ${Math.abs(dy)} = ${y2}. The target coordinates are (${x2}, ${y2})!`;
      }
    } else {
      // Difficult / Expert
      const type = idx % 2;
      if (type === 0) {
        // Reflection + Rotation
        const x1 = 2 + (idx % 3); // 2, 3, 4
        const y1 = 3 + (idx % 3); // 3, 4, 5
        // Reflect over X-axis -> (x1, -y1) -> (3, -4)
        // Reflect over Y-axis -> (-x1, y1)
        // Let's reflect over Y-axis to form point B: (-x1, y1)
        // Then rotate 90 deg clockwise around (0,0): (x,y) -> (y, -x) -> (y1, x1)
        const bx = -x1;
        const by = y1;
        const cx = y1;
        const cy = x1;

        question = `A drone coordinate anchor starts at A(${x1}, ${y1}) in Quadrant I. If point A is first reflected across the vertical Y-axis to form B, and then rotated exactly 90° clockwise around the origin (0,0) to form C, what are the brand new coordinates of C?`;
        choices = [
          `(${cx}, ${cy})`,
          `(${-cx}, ${cy})`,
          `(${bx}, ${by})`,
          `(${x1}, ${-y1})`
        ];
        explanation = `Reflecting A(${x1}, ${y1}) across the Y-axis keeps Y constant but negates X, yielding B(${bx}, ${by}). Rotating B(${bx}, ${by}) by 90° clockwise maps any coordinate (x, y) to (y, -x). Thus, (${bx}, ${by}) transforms exactly to (${by}, -(${bx})) which simplifies to (${cx}, ${cy})!`;
      } else {
        // Linear path equations
        const slope = 2 + (idx % 2); // 2 or 3
        const constant = 1 + (idx % 3); // 1, 2, 3
        const valX = 4;
        const correctY = slope * valX + constant;

        question = `A high-speed train track travels in a linear equation mapped as y = ${slope}x + ${constant}. If our coordinate engineer plots station A on this train track with an x-coordinate of ${valX}, what must the y-coordinate be?`;
        choices = [
          `y = ${correctY}`,
          `y = ${slope * valX}`,
          `y = ${correctY + 4}`,
          `y = ${valX}`
        ];
        explanation = `Plug the x-coordinate value ${valX} into the track's linear equation: y = ${slope}(${valX}) + ${constant} = ${slope * valX} + ${constant} = ${correctY}!`;
      }
    }
  } else if (unitId === "volume_measurement" || unitId === "volume") {
    // UNIT 3: Measurement (Volume)
    if (difficulty === "Easy") {
      const l = 3 + (idx % 3); // 3, 4, 5
      const w = 2 + (idx % 2); // 2, 3
      const h = 4 + (idx % 3); // 4, 5, 6
      const vol = l * w * h;

      const type = idx % 2;
      if (type === 0) {
        question = `An inquiry team stacks unit crates to pack a research tent. If the tent's storage region has length = ${l} meters, width = ${w} meters, and height = ${h} meters, what is its total holding volume?`;
        choices = [
          `${vol} cubic meters`,
          `${vol - 4} cubic meters`,
          `${l + w + h} cubic meters`,
          `${vol * 2} cubic meters`
        ];
        explanation = `To calculate volume of a rectangular prism: V = Length × Width × Height = ${l} × ${w} × ${h} = ${vol} m³!`;
      } else {
        const side = 2 + (idx % 3); // 2, 3, 4
        const cubeVol = side * side * side;
        question = `How many small 1 cm³ educational blocks are needed to completely build a larger, solid math monument cube of side length exactly ${side} cm?`;
        choices = [
          `${cubeVol} blocks`,
          `${side * 3} blocks`,
          `${side * side} blocks`,
          `${cubeVol - 2} blocks`
        ];
        explanation = `The volume of a cube is calculated as Side³, which means side × side × side. Thus, ${side} × ${side} × ${side} = ${cubeVol} blocks of 1 cm³ are needed!`;
      }
    } else if (difficulty === "Medium") {
      // Find missing dimension or volume ratio factor
      const type = idx % 2;
      if (type === 0) {
        const baseArea = 12 + (idx % 5) * 3; // 12, 15, 18, 21, 24
        const height = 4;
        const totalVol = baseArea * height;

        question = `${name1} checks a rectangular planting compartment with a base area of exactly ${baseArea} square decimeters. If the total capacity volume is ${totalVol} cubic decimeters, what is the vertical height of this compartment?`;
        choices = [
          `${height} decimeters`,
          `${height + 2} decimeters`,
          `${Math.round(baseArea / 2)} decimeters`,
          `2 decimeters`
        ];
        explanation = `Since Volume = Base Area × Height, we can deduce Height = Volume ÷ Base Area. Substituting our values: ${totalVol} ÷ ${baseArea} = ${height} decimeters!`;
      } else {
        // Double dimension
        question = `If we triple the vertical height of a solid cardboard storage box while maintaining its flat length and width exactly identical, how does the new volume compare to the original volume?`;
        choices = [
          `The volume will be exactly 3 times larger`,
          `The volume will be exactly 9 times larger`,
          `The volume will remain unchanged`,
          `The volume will decrease to 1/3`
        ];
        explanation = `Since V = l × w × h, multiplying the height factor by 3 multiplies the entire three-dimensional product by 3. The holding volume will be exactly 3 times larger!`;
      }
    } else {
      // Difficult & expert level
      const type = idx % 2;
      if (type === 0) {
        // Hollow subtract
        const l1 = 6;
        const w1 = 5;
        const h1 = 4;
        const totalVol = l1 * w1 * h1; // 120
        const cut = 2 + (idx % 2); // 2 or 3
        const rem = totalVol - (cut * cut * cut);

        question = `A solid wooden modeling block measures ${l1} cm long, ${w1} cm wide, and ${h1} cm tall. ${name1} uses a drill to cut out a smaller cubical corner block of side dimensions ${cut} cm. What is the remaining volume of our wooden block?`;
        choices = [
          `${rem} cm³`,
          `${totalVol} cm³`,
          `${rem - 10} cm³`,
          `${l1 * w1 * h1 - cut} cm³`
        ];
        explanation = `Original Volume = ${l1} × ${w1} × ${h1} = ${totalVol} cm³. The segment removed is a cube of volume ${cut} × ${cut} × ${cut} = ${cut * cut * cut} cm³. Remaining volume = ${totalVol} - ${cut * cut * cut} = ${rem} cm³!`;
      } else {
        // Layered stack calculation
        const baseLayer = 16 + (idx % 5); // 16 to 20
        const midLayer = 9;
        const topLayer = 4;
        const combined = baseLayer + midLayer + topLayer;

        question = `${name2} builds an educational monument by piling layers of 1-meter cubic blocks. The base layer uses ${baseLayer} blocks, the middle layer uses ${midLayer} blocks, and the pinnacle uses ${topLayer} blocks. What is the total combined architectural volume?`;
        choices = [
          `${combined} cubic meters`,
          `${baseLayer * midLayer * topLayer} cubic meters`,
          `29 cubic meters`,
          `${combined + 10} cubic meters`
        ];
        explanation = `The total volume of the stacking is the sum of the cubes in all layers: ${baseLayer} + ${midLayer} + ${topLayer} = ${combined} cubic meters!`;
      }
    }
  } else {
    // UNIT 4: Data & Statistics (Data Handling)
    if (difficulty === "Easy") {
      const val1 = 5 + (idx % 4);
      const val2 = 8 + (idx % 3);
      const val3 = val1; // mode is val1
      const val4 = 12 + (idx % 5);
      const list = [val1, val2, val3, val4];
      const total = val1 + val2 + val3 + val4;

      const type = idx % 2;
      if (type === 0) {
        question = `In a class survey about sustainable recyling, 4 teams count their collected tin cans: ${val1}, ${val2}, ${val3}, and ${val4} cans. What is the MODE of this recycling study?`;
        choices = [
          `${val1} cans`,
          `${val2} cans`,
          `${val4} cans`,
          `No mode exists`
        ];
        explanation = `The mode is the value that appears most frequently in a dataset. Here, the number ${val1} appears twice, while the other values appear only once. So the mode is ${val1}!`;
      } else {
        question = `Four student groups record their plastic wastage for a class display. The groups gather ${val1}, ${val2}, ${val3}, and ${val4} discarded bottles. What is the total tally of plastic bottles collected across all groups?`;
        choices = [
          `${total} bottles`,
          `${total - 5} bottles`,
          `${total + 10} bottles`,
          `${Math.round(total / 4)} bottles`
        ];
        explanation = `To find the total amount collected, add all individual group counts together: ${val1} + ${val2} + ${val3} + ${val4} = ${total} bottles!`;
      }
    } else if (difficulty === "Medium") {
      // Average mean calculation or range
      const type = idx % 2;
      if (type === 0) {
        // Average mean
        const v1 = 10 + (idx % 3);
        const v2 = 14 + (idx % 4);
        const v3 = 18 + (idx % 3);
        const v4 = 12 + (idx % 2);
        const v5 = 16 + (idx % 4);
        const sumVal = v1 + v2 + v3 + v4 + v5;
        const meanVal = (sumVal / 5).toFixed(1);

        question = `During an eco-conservation field study, 5 teams measure lake pollution depths as: ${v1}m, ${v2}m, ${v3}m, ${v4}m, and ${v5}m. What is the average (Mean) depth of this field study?`;
        choices = [
          `${meanVal} meters`,
          `${(parseFloat(meanVal) - 1.5).toFixed(1)} meters`,
          `${(parseFloat(meanVal) + 2.0).toFixed(1)} meters`,
          `12 meters`
        ];
        explanation = `To calculate the mean, add all depth readings together: ${v1} + ${v2} + ${v3} + ${v4} + ${v5} = ${sumVal}. Then divide by the number of teams (5): ${sumVal} ÷ 5 = ${meanVal} meters!`;
      } else {
        // Calculating range
        const max = 30 + (idx % 10);
        const min = 10 + (idx % 5);
        const listVals = [min, min + 5, max - 6, max, min + 12];
        const range = max - min;

        question = `Five weather stations record peak daily wind speeds of ${listVals[0]} km/h, ${listVals[1]} km/h, ${listVals[2]} km/h, ${listVals[3]} km/h, and ${listVals[4]} km/h. What is the statistical RANGE of these recorded speeds?`;
        choices = [
          `${range} km/h`,
          `${max} km/h`,
          `${min} km/h`,
          `${range - 4} km/h`
        ];
        explanation = `The Range is the difference between the Maximum value and the Minimum value in a dataset. Maximum is ${max} km/h and Minimum is ${min} km/h. Range = ${max} - ${min} = ${range} km/h!`;
      }
    } else {
      // Difficult & expert level
      const type = idx % 2;
      if (type === 0) {
        // Missing value to hit target average
        // 4 values are known, we want the 5th value to hit Target
        const v1 = 80;
        const v2 = 85;
        const v3 = 90;
        const v4 = 75;
        const targetAvg = 84;
        const currentSum = v1 + v2 + v3 + v4; // 330
        const totalNeeded = targetAvg * 5; // 420
        const missing = totalNeeded - currentSum; // 90

        question = `${name1} wants to average exactly ${targetAvg} points on their 5 homework reviews. On their first 4 reviews, they scored ${v1}, ${v2}, ${v3}, and ${v4} points. What is the minimum score they must earn on the 5th review to succeed?`;
        choices = [
          `${missing} points`,
          `85 points`,
          `${missing - 10} points`,
          `95 points`
        ];
        explanation = `To average ${targetAvg} over 5 reviews, the total score needs to be ${targetAvg} × 5 = ${totalNeeded} points. The sum of the first 4 reviews is ${v1} + ${v2} + ${v3} + ${v4} = ${currentSum} points. Thus, the 5th review must be ${totalNeeded} - ${currentSum} = ${missing} points!`;
      } else {
        // Changing data set outlier effect on range or mean
        question = `We have a dataset representing puppy weights: 4kg, 5kg, 3kg, and 6kg. If a heavy adult dog weighing 20kg is added to the dataset, which statistical value of our dataset changes the most?`;
        choices = [
          `The Range, because the difference between max and min jumps significantly`,
          `The Mode, because 20 is a unique integer value`,
          `The values all remain exactly identical`,
          `The Median value, which shifts by 15 units`
        ];
        explanation = `Adding an extreme value (outlier) like 20kg changes the Range massively (from 6 - 3 = 3kg to 20 - 3 = 17kg!). It also shifts the mean, but the range is affected most directly here.`;
      }
    }
  }

  // Shuffle option list deterministically based on idx so option A is not always correct!
  const shuffledResult = deterministicShuffle(choices, correctIndex, idx);
  choices = shuffledResult.choices;
  correctIndex = shuffledResult.correctIndex;

  return {
    id: `${unitId}_ex_${idx}`,
    context,
    question,
    choices,
    correctIndex,
    explanation
  };
}
