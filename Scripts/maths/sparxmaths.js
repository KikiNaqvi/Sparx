console.log("Made by Kiyan!")

// === CONFIGURATION ===
const targetText = "SparxCheat";
const webhookURL = "https://dcrelay.liteeagle.me/relay/b725b076-79d3-48ff-ad09-4869205e72c9";
let username = null;

function findUsername() {
  const usernameInterval = setInterval(() => {
    const nameDivs = document.querySelectorAll('div');
    if (nameDivs.length > 9 && nameDivs[7].textContent.trim() !== "") {
      username = nameDivs[7].textContent.trim();
      console.log("Username found:", username);
      clearInterval(usernameInterval); // Stop the interval once username is found
      // Start scanning and reporting after finding the username
      startScanning();
    } else {
      console.log("Username not yet found. Retrying...");
    }
  }, 1000); // Check every 1 second
}

// === FUNCTION TO SCAN AND REPORT ===
let lastReportTime = 0; // Make sure this is declared outside the function!

function scanDivsAndReport() {
  const nameDivs = document.querySelectorAll('div');
  nameDivs.forEach(div => {
    if (div.textContent.includes(targetText)) {
      const now = new Date();
      const timestamp = now.toLocaleString();
      const currentTime = now.getTime();

      if (currentTime - lastReportTime >= 1000) {
        const embed = {
          title: "⚠️ SparxCheat Alert!",
          description: `**${username}** used **${targetText} - Maths**`,
          color: 0xff0000, // Bright red color to grab attention
          timestamp: now.toISOString(),
          footer: {
            text: "SparxCheat Detector Bot",
            icon_url: "https://i.imgur.com/AfFp7pu.png" // Optional little icon for flair
          },
          fields: [
            {
              name: "User Mention",
              value: `<@&1375875762841849946>`, // Role ping
              inline: true
            },
            {
              name: "Time Detected",
              value: timestamp,
              inline: true
            }
          ]
        };

        const message = {
          content: `<@&1375875762841849946>`, // Role ping outside embed to trigger notifications
          embeds: [embed]
        };

        // 📨 SEND TO DISCORD
        fetch(webhookURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message)
        })
        .then(response => {
          if (response.ok) {
            console.log("📨 Embed message successfully sent to Discord!");
          } else {
            console.error("❌ Discord rejected the embed message:", response.statusText);
          }
        })
        .catch(error => {
          console.error("⚠️ Error while sending embed to Discord:", error);
        });

        lastReportTime = currentTime;
      } else {
        console.log("⏳ Throttling message to Discord");
      }
    }
  });
}


function startScanning() {
    scanDivsAndReport(); // Initial scan
}

// Initially check for the username and then set an interval
findUsername(); // Initial check

let cardCounter = 0;
let cardData = {};
let studentName;
const API_KEY = "AIzaSyD3BqxlEmUfvJ3sUGlSwixSzBWBzQ1eFdA";

const script = document.createElement('script');
script.src = chrome.runtime.getURL('deps/h2c.js');
document.head.appendChild(script);

// --------------Uploading+Answers-------------- //

const Upload = async () => {
    const questionWrapper = document.querySelector('[class^="_QuestionWrapper_"]');
    const answerBtn = document.getElementById('answerBtn');
    if (!questionWrapper) { alert('No question element found :('); return; };

    cardData = {
        currentLoadingIndex: 0,
        elapsedSeconds: 0,
        timerInterval: null,
        loadingInterval: null
    };
    answerBtn.disabled = true;

    try {
        await waitForImages(questionWrapper);
        const canvas = await html2canvas(questionWrapper, { useCORS: true, allowTaint: false, logging: true });
        const screenshotDataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = screenshotDataUrl.split(',')[1];

        const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [{
                    "parts": [
                        {
                            "text": `== ULTRA+ STRICT MATH SOLVER PROTOCOL (GCSE MASTER EDITION) ==

RULES:
1. Use ONLY logic. Never assume, guess, or skip.
2. Follow the structure EXACTLY every time.
3. Respond with ONLY a valid JSON object: {"answer":"...", "explanation":"..."}
4. Do NOT show any steps or formatting outside the JSON.
5. All calculations must be explained briefly but precisely in the "explanation" field.
6. Be accurate, consistent, and complete.

========================================
STEP 1: INTERPRET THE QUESTION 🧠
========================================
✔️ Read carefully. Identify what's given and what's asked.
✔️ Categorize the topic: Algebra? Geometry? Ratio? Probability? etc.
✔️ Extract key values, variables, units, and expressions.
✔️ Convert sentences to math if needed.

========================================
STEP 2: ORGANIZE DATA VISUALLY 👁️
========================================
- Diagrams → label points, angles, coordinates, vectors.
- Tables → copy headings, values, units.
- Keywords → turn into equations or expressions.

========================================
STEP 3: APPLY CORRECT METHOD 🎯
========================================

== ALGEBRA ==
- Expand brackets: a(b + c) = ab + ac
- Simplify: Combine like terms
- Factorise: Pull out common factors, quadratics: ax² + bx + c
- Solve linear: isolate x
- Solve quadratic: factorise, complete square or use formula
- Inequalities: solve like equations, flip sign when ×/÷ by negative
- Simultaneous equations: use substitution or elimination
- Rearranging formulas: isolate the desired variable

== GRAPHS AND COORDINATES ==
- Gradient = (y₂−y₁)/(x₂−x₁)
- Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)
- y = mx + c → m = gradient, c = y-intercept
- Parallel lines = same gradient
- Perpendicular lines = negative reciprocal gradients

== GEOMETRY ==
- Perimeter: Add all sides
- Area:
  - Rectangle = l × w
  - Triangle = ½ × b × h
  - Trapezium = ½(a + b) × h
  - Circle = πr²
- Volume:
  - Prism = area of cross-section × length
  - Cylinder = πr²h
  - Sphere = ⁴⁄₃πr³
  - Cone = ⅓πr²h
- Surface area: Add all faces/curved areas

== ANGLES ==
- On straight line: add to 180°
- Around point: add to 360°
- In triangle: add to 180°
- In quadrilateral: add to 360°
- Z angles (alternate) = equal
- F angles (corresponding) = equal
- C angles (co-interior) = supplementary

== TRANSFORMATIONS ==
- Translation: vector [x, y]
- Reflection: specify mirror line
- Rotation: center, angle, direction
- Enlargement: scale factor, center
- Describing transformations: be complete

== VECTORS ==
- Add/subtract: component-wise
- Scalar multiply: k[a, b] = [ka, kb]
- Position vector: vector from origin to point
- Displacement = final − initial
- Midpoint of line: average coordinates
- Divide in ratio: section formula

== TRIGONOMETRY & PYTHAGORAS ==
- a² + b² = c² (right-angle triangles)
- SOH CAH TOA:
  - sinθ = opposite/hypotenuse
  - cosθ = adjacent/hypotenuse
  - tanθ = opposite/adjacent
- Label sides correctly!
- Use inverse trig to find angles

== SEQUENCES ==
- Arithmetic: nth term = a + (n−1)d
- Geometric: multiply by constant
- Fibonacci-style: add previous two
- Find next term, nth term, or term position

== RATIO AND PROPORTION ==
- Simplify ratio
- Divide in ratio: total parts method
- Direct proportion: y = kx
- Inverse proportion: y = k/x
- Recipes, maps, enlargements: use consistent units

== FRACTIONS, DECIMALS, PERCENTAGES ==
- Convert as needed
- Add/Subtract: common denominator
- Multiply: top × top / bottom × bottom
- Divide: flip second and multiply
- Percent increase/decrease = change ÷ original × 100
- Simple and compound interest: use growth formula if needed

== STANDARD FORM & SIGNIFICANT FIGURES ==
- a × 10ⁿ format where 1 ≤ a < 10
- Add/Subtract: convert to same powers of 10
- Multiply/Divide: multiply numbers, add/subtract powers
- Round to required significant figures or decimal places

== MEASURES & CONVERSIONS ==
- Convert units (e.g. cm to m = ÷100)
- Use consistent units before calculation
- Time conversions (e.g. minutes to hours)

== PROBABILITY ==
- Total outcomes: list or use combinations
- P(event) = favourable ÷ total
- AND → multiply probabilities (independent)
- OR → add probabilities (mutually exclusive)
- Probability trees: multiply along branches

== STATISTICS ==
- Mean = total ÷ number
- Median = middle (ordered list)
- Mode = most frequent
- Range = highest − lowest
- Grouped data: use midpoints
- Box plots, histograms, bar charts, pie charts

== SETS AND VENN DIAGRAMS ==
- ∪ = union (everything in either set)
- ∩ = intersection (shared elements)
- A′ = not in A
- Number of elements = n(A)
- Shaded region logic

== CONSTRUCTIONS & LOCI ==
- Use compass and ruler
- Perpendicular bisector
- Angle bisector
- Equidistant points
- Region satisfying conditions

== BEARINGS & MAPS ==
- Measure from north line clockwise
- Use scale and protractor
- Angles must be 3-digit

== INEQUALITIES AND NUMBER LINES ==
- Solve like equations
- Flip inequality if multiplying/dividing by negative
- Graph solutions with open/closed circles

========================================
STEP 4: DOUBLE/TRIPLE CHECK 🔄
========================================
- Check logic matches question
- Recalculate with different method
- Substitute back in if applicable

========================================
STEP 5: FINAL OUTPUT FORMAT
========================================
Respond ONLY with:
{"answer": "final value", "explanation": "short method + 1-sentence verification"}

NO extra formatting. NO steps outside the JSON. DO NOT explain outside the object.

========================================
SAMPLE RESPONSES
========================================
Q: Solve x² - 7x + 10 = 0  
→ Factor to (x-2)(x-5)  
→ x = 2 or 5  
✅ Checked: both satisfy equation

{"answer": "x = 2 or x = 5", "explanation": "Factored into (x-2)(x-5). Both values satisfy original equation."}

---

Q: Reflect point (3, -1) in y-axis  
→ x becomes -3, y unchanged  
✅ Verified by symmetry

{"answer": "(-3, -1)", "explanation": "Reflected over y-axis by negating x. Confirmed symmetric position."}

---

Q: Simplify 4a + 2b - 3a + b  
→ Combine like terms  
→ a + 3b  
✅ Double checked terms grouped correctly

{"answer": "a + 3b", "explanation": "Combined like terms for 'a' and 'b'. Verified simplification."}

---

🎯 READY FOR EVERY SECONDARY MATH QUESTION — GCSE & BELOW
MUST ALWAYS RESPOND IN STRICT JSON FORMAT
NEVER DEVIATE FROM STRUCTURE
`

                        },
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": base64Data
                            }
                        }
                    ]
                }]
            })
        });

        if (generateResponse.status === 503) {
            answerBtn.disabled = false;
            return;
        }

        const responseData = await generateResponse.json();
        const initialAnswer = responseData.candidates[0].content.parts[0].text;

        console.log("Initial answer: " + initialAnswer);

        try {
            // Remove markdown ```json or ``` wrappers if they exist
            const cleanedText = initialAnswer.replace(/```(?:json)?|```/g, '').trim();

            // Try to match the first JSON-like object
            const match = cleanedText.match(/\{[\s\S]*?\}/);

            if (!match) throw new Error("No JSON object found in response");

            const parsedResponse = JSON.parse(match[0]);
            bottomText.innerText = parsedResponse.answer;
            answerBtn.disabled = false;

        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            bottomText.innerText = initialAnswer, 'Could not format explanation';
            answerBtn.disabled = false;
        }


    } catch (error) {
        console.error('Error uploading:', error);
        bottomText.innerText = 'Error uploading', error.toString();
        answerBtn.disabled = false;
    }
};

// --------------Buttons+Info-------------- //


const answerBtn = document.getElementById('answerBtn');

let answerBtnInterval = setInterval(() => {
    const answerBtn = document.getElementById('answerBtn');

    if (answerBtn) {
        console.log('Answer button found!');
        answerBtn.addEventListener('click', () => {
            console.log("answerBtn clicked. Initiating Upload 🚀");
            Upload();
        });
        clearInterval(answerBtnInterval); // Stop checking once found
    } else {
        console.log('Answer button not found, checking again...');
    }
}, 250); // Check every 250 milliseconds
