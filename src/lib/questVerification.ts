export interface VerificationCriterion {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  hint?: string;
}

export interface VerificationResult {
  allPassed: boolean;
  score: number;
  total: number;
  criteria: VerificationCriterion[];
}

/**
 * Normalizes code content by stripping all comments (HTML, JS, CSS) and trimming whitespace.
 */
export function cleanCode(code: string = ""): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .trim();
}

/**
 * Normalizes file path keys (e.g. "/index.html" -> "index.html").
 */
export function normalizeKey(path: string): string {
  return path.replace(/^\/+/, "");
}

/**
 * Checks whether user has made substantial code modifications beyond the starter template.
 */
export function hasModifiedStarter(
  currentFiles: Record<string, string>,
  initialFiles?: Record<string, string> | null
): boolean {
  if (!initialFiles || Object.keys(initialFiles).length === 0) return false;

  const initialMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(initialFiles)) {
    initialMap[normalizeKey(k)] = v;
  }

  let hasDiff = false;
  let filesChecked = 0;

  for (const [rawKey, currentContent] of Object.entries(currentFiles)) {
    const key = normalizeKey(rawKey);
    // Ignore synthetic empty index.js added for Sandpack static stability
    if (key === "index.js" && currentContent.trim() === "" && !initialMap[key]) {
      continue;
    }

    const initialContent = initialMap[key];
    if (initialContent !== undefined) {
      filesChecked++;
      if (cleanCode(currentContent) !== cleanCode(initialContent)) {
        hasDiff = true;
      }
    } else if (cleanCode(currentContent).length > 0) {
      hasDiff = true;
    }
  }

  return hasDiff && filesChecked > 0;
}

function getFile(files: Record<string, string>, ...candidateNames: string[]): string {
  for (const [k, v] of Object.entries(files)) {
    const norm = normalizeKey(k).toLowerCase();
    if (candidateNames.some((cand) => norm === normalizeKey(cand).toLowerCase())) {
      return v;
    }
  }
  return "";
}

export function verifyTopicSolution(
  topicTitle: string,
  exercisePrompt: string | null,
  files: Record<string, string>,
  initialFiles?: Record<string, string> | null
): VerificationResult {
  // Strip comments from all files so prompt directives inside starter comments do not pass tests
  const rawHtml = getFile(files, "index.html");
  const rawCss = getFile(files, "styles.css");
  const rawJs = getFile(files, "index.js", "App.js", "App.tsx", "script.js");

  const html = cleanCode(rawHtml);
  const css = cleanCode(rawCss);
  const js = cleanCode(rawJs);
  const allCode = `${html}\n${css}\n${js}`;

  const criteria: VerificationCriterion[] = [];
  const titleLower = topicTitle.toLowerCase().trim();
  // 1. HTML Basics
  if (titleLower.includes("html basics")) {
    const hasH1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.test(html) && !/<h1[^>]*>\s*<\/h1>/i.test(html);
    criteria.push({
      id: "h1-heading",
      label: "Adventurer Title (<h1>)",
      description: "Must contain an <h1> heading with your adventurer name or title.",
      passed: hasH1,
      hint: "Add an <h1> heading in index.html (e.g. <h1>Knight of Code</h1>)",
    });

    const hasP = /<p[^>]*>([\s\S]*?)<\/p>/i.test(html) && !/<p[^>]*>\s*<\/p>/i.test(html);
    criteria.push({
      id: "p-paragraph",
      label: "Chronicle Description (<p>)",
      description: "Must contain a <p> paragraph describing your journey.",
      passed: hasP,
      hint: "Add a <p> paragraph inside <body> with a description.",
    });

    const hasA = /<a\s+[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/i.test(html);
    criteria.push({
      id: "a-link",
      label: "Quest Hyperlink (<a>)",
      description: "Must contain an <a> link with a valid href attribute.",
      passed: hasA,
      hint: 'Add an anchor link like <a href="#quests">Quest Log</a>',
    });
  }

  // 2. Semantic HTML
  else if (titleLower.includes("semantic html")) {
    criteria.push({
      id: "sem-header",
      label: "<header> Landmark",
      description: "Header section structured with semantic <header> tag.",
      passed: /<header[\s>]/i.test(html),
      hint: "Wrap your top heading/banner in a <header> element.",
    });
    criteria.push({
      id: "sem-main",
      label: "<main> Document Core",
      description: "Primary page content enclosed within <main> landmark.",
      passed: /<main[\s>]/i.test(html),
      hint: "Enclose the main story content in a <main> tag.",
    });
    criteria.push({
      id: "sem-article",
      label: "<article> Content Block",
      description: "Independent chronicle entry wrapped in <article>.",
      passed: /<article[\s>]/i.test(html),
      hint: "Structure the chapter story inside an <article> element.",
    });
    criteria.push({
      id: "sem-footer",
      label: "<footer> Landmark",
      description: "Page footer wrapped with semantic <footer> tag.",
      passed: /<footer[\s>]/i.test(html),
      hint: "Wrap copyright and footer notes in a <footer> tag.",
    });
  }

  // 3. Forms & Inputs
  else if (titleLower.includes("forms")) {
    criteria.push({
      id: "form-tag",
      label: "<form> Element",
      description: "Form container established for adventurer registration.",
      passed: /<form[\s>]/i.test(html),
      hint: "Add a <form> tag to hold the registration inputs.",
    });
    criteria.push({
      id: "form-input-text",
      label: "Username Input",
      description: "Text input for adventurer codename.",
      passed: /<input[^>]*type=["']text["']/i.test(html) || (/<input[\s>]/i.test(html) && !/type=["']email["']/i.test(html)),
      hint: 'Include an <input type="text" placeholder="Adventurer name" />.',
    });
    criteria.push({
      id: "form-input-email",
      label: "Email Input",
      description: "Input designated for adventurer scroll dispatch.",
      passed: /<input[^>]*type=["']email["']/i.test(html) || /type=["']email["']/i.test(html),
      hint: 'Add an <input type="email" /> for email registration.',
    });
    criteria.push({
      id: "form-submit",
      label: "Submit Button",
      description: "Button or input to submit the registration form.",
      passed: /<button[^>]*>[\s\S]*?<\/button>/i.test(html) || /<input[^>]*type=["']submit["']/i.test(html),
      hint: '<button type="submit">Register</button> inside the form.',
    });
  }

  // 4. Media & Embedding
  else if (titleLower.includes("media") || titleLower.includes("embedding")) {
    criteria.push({
      id: "img-tag",
      label: "Image with Alt Text",
      description: "Image embedded with descriptive alt attribute for accessibility.",
      passed: /<img\s+[^>]*src=["'][^"']+["'][^>]*alt=["'][^"']+["']/i.test(html) || (/<img\s+/i.test(html) && /alt=["'][^"']+["']/i.test(html)),
      hint: 'Include <img src="..." alt="Adventurer Crest" /> with both src and alt.',
    });
    criteria.push({
      id: "figure-tag",
      label: "<figure> & <figcaption>",
      description: "Image encapsulated within figure landmarks.",
      passed: /<figure[\s>]/i.test(html) && /<figcaption[\s>]/i.test(html),
      hint: "Wrap your image in <figure> and add a <figcaption> description.",
    });
  }

  // 5. CSS Basics
  else if (titleLower.includes("css basics") || titleLower.includes("selectors")) {
    criteria.push({
      id: "class-selector",
      label: "Banner Selector (.quest-banner)",
      description: "Styles targeted with .quest-banner class rule in styles.css.",
      passed: /\.quest-banner\s*\{/i.test(css),
      hint: "Add a .quest-banner { ... } block in styles.css.",
    });
    criteria.push({
      id: "color-property",
      label: "Accent Color (#7c5cff)",
      description: "Applies the royal purple accent color #7c5cff.",
      passed: /\.quest-banner[\s\S]*?color\s*:\s*#7c5cff/i.test(css) || /color\s*:\s*#7c5cff/i.test(css),
      hint: "Add color: #7c5cff; to .quest-banner in styles.css.",
    });
    criteria.push({
      id: "bg-property",
      label: "Dark Background Styling",
      description: "Applies dark background (#1a1a26) and alignment styling.",
      passed: /background(-color)?\s*:\s*#1a1a26/i.test(css) || /text-align\s*:\s*center/i.test(css),
      hint: "Specify background: #1a1a26; and text-align: center; in styles.css.",
    });
  }

  // 6. The Box Model & Spacing
  else if (titleLower.includes("box model")) {
    criteria.push({
      id: "box-padding",
      label: "Inner Spacing (padding)",
      description: "Configures element padding for content breathing room.",
      passed: /padding(-[a-z]+)?\s*:\s*[^;]+;/i.test(css),
      hint: "Specify padding (e.g. padding: 16px;) in styles.css.",
    });
    criteria.push({
      id: "box-border",
      label: "Border Boundary (border)",
      description: "Encloses element with a styled border.",
      passed: /border(-[a-z]+)?\s*:\s*[^;]+;/i.test(css),
      hint: "Specify border (e.g. border: 2px solid #7c5cff;) in styles.css.",
    });
    criteria.push({
      id: "box-margin",
      label: "Outer Spacing (margin)",
      description: "Defines margin separation between quest cards.",
      passed: /margin(-[a-z]+)?\s*:\s*[^;]+;/i.test(css),
      hint: "Specify margin (e.g. margin: 20px auto;) in styles.css.",
    });
  }

  // 7. Flexbox Layout
  else if (titleLower.includes("flexbox")) {
    criteria.push({
      id: "flex-display",
      label: "display: flex",
      description: "Declares flexbox layout container on parent element.",
      passed: /display\s*:\s*flex/i.test(css),
      hint: "Add display: flex; to the container selector in styles.css.",
    });
    criteria.push({
      id: "flex-alignment",
      label: "Flex Alignment Properties",
      description: "Uses justify-content, align-items, or gap.",
      passed: /(justify-content|align-items|flex-direction|gap)\s*:\s*[^;]+/i.test(css),
      hint: "Add justify-content: center; or align-items: center; in styles.css.",
    });
  }

  // 8. CSS Grid
  else if (titleLower.includes("grid")) {
    criteria.push({
      id: "grid-display",
      label: "display: grid",
      description: "Declares CSS Grid context on container.",
      passed: /display\s*:\s*grid/i.test(css),
      hint: "Set display: grid; in styles.css.",
    });
    criteria.push({
      id: "grid-template",
      label: "Grid Track Layout",
      description: "Configures grid-template-columns or grid-template-rows.",
      passed: /grid-template-(columns|rows)\s*:\s*[^;]+/i.test(css),
      hint: "Add grid-template-columns: repeat(3, 1fr); or similar.",
    });
  }

  // 9. Responsive Design & Media Queries
  else if (titleLower.includes("responsive") || titleLower.includes("media queries")) {
    criteria.push({
      id: "media-query",
      label: "@media Breakpoint",
      description: "Declares responsive media query for adaptive displays.",
      passed: /@media\s*\([^)]+\)\s*\{/i.test(css),
      hint: "Add a media query such as @media (max-width: 768px) { ... }.",
    });
    criteria.push({
      id: "viewport-override",
      label: "Adaptive Style Override",
      description: "Adjusts layout or properties inside the breakpoint.",
      passed: /@media[\s\S]*?\{[\s\S]*?[a-zA-Z0-9_.-]+\s*\{[\s\S]*?\}[\s\S]*?\}/i.test(css),
      hint: "Place a CSS rule inside the media query block.",
    });
  }

  // 10. CSS Transitions & Keyframes
  else if (titleLower.includes("transitions") || titleLower.includes("animations") || titleLower.includes("keyframes")) {
    criteria.push({
      id: "transition-or-keyframes",
      label: "CSS Animation or Transition",
      description: "Uses transition property or @keyframes animation declaration.",
      passed: /transition\s*:\s*[^;]+|@keyframes\s+[a-zA-Z0-9_-]+/i.test(css),
      hint: "Add transition: all 0.3s ease; or @keyframes pulse { ... }.",
    });
  }

  // 11. JavaScript Basics
  else if (titleLower.includes("javascript basics") || titleLower.includes("js basics") || titleLower.includes("variables & data types")) {
    const hasConst = /\bconst\s+(heroName|[a-zA-Z0-9_$]+)\s*=\s*["'][^"']+["']/i.test(js);
    criteria.push({
      id: "js-const-name",
      label: "const heroName Variable",
      description: "Declares a const heroName variable assigned to your adventurer name string.",
      passed: hasConst,
      hint: 'Add const heroName = "YourAdventurerName"; in index.js',
    });

    const hasLet = /\blet\s+(level|[a-zA-Z0-9_$]+)\s*=\s*\d+/i.test(js);
    criteria.push({
      id: "js-let-level",
      label: "let level Numeric Variable",
      description: "Declares a let level variable initialized to 1.",
      passed: hasLet,
      hint: "Add let level = 1; in index.js",
    });

    const hasLog = /console\.log\s*\([^)]+\)/i.test(js);
    criteria.push({
      id: "js-console-log",
      label: "console.log Output",
      description: "Logs heroName and level to browser console.",
      passed: hasLog,
      hint: 'Add console.log("Adventurer:", heroName, "Level:", level);',
    });
  }

  // 12. Arrays & Iteration
  else if (titleLower.includes("arrays") || titleLower.includes("iteration")) {
    criteria.push({
      id: "array-definition",
      label: "Array Declaration",
      description: "Defines array [...] for inventory or quest data.",
      passed: /\[[\s\S]*?\]/i.test(js),
      hint: "Create an array: const questItems = ['Sword', 'Shield', 'Potion'];",
    });
    criteria.push({
      id: "array-iteration",
      label: "Iteration (forEach / map / for)",
      description: "Iterates through array elements with .forEach, .map, or for-of loop.",
      passed: /\.(forEach|map|filter)\s*\(|for\s*\([^)]+\)/i.test(js),
      hint: "Iterate with questItems.forEach(item => console.log(item));",
    });
  }

  // 13. Objects & Destructuring
  else if (titleLower.includes("objects") || titleLower.includes("destructuring")) {
    criteria.push({
      id: "obj-definition",
      label: "Object Declaration",
      description: "Defines object {...} containing adventurer attributes.",
      passed: /\{[\s\S]*?:[\s\S]*?\}/i.test(js),
      hint: "Create an object: const hero = { name: 'Knight', level: 1 };",
    });
    criteria.push({
      id: "destructuring-or-dot",
      label: "Property Access or Destructuring",
      description: "Extracts properties via destructuring ({ name }) or dot notation.",
      passed: /(const|let)\s*\{[\s\S]*?\}\s*=|(\.[a-zA-Z0-9_$]+)/i.test(js),
      hint: "Destructure with const { name } = hero; or log hero.name",
    });
  }

  // 14. DOM Manipulation
  else if (titleLower.includes("dom manipulation")) {
    criteria.push({
      id: "dom-selector",
      label: "Element Selection",
      description: "Selects DOM elements with document.querySelector or getElementById.",
      passed: /document\.(querySelector|getElementById|querySelectorAll)/i.test(js),
      hint: "Use document.querySelector('#btn') or document.getElementById('...').",
    });
    criteria.push({
      id: "dom-action",
      label: "DOM Mutation",
      description: "Modifies textContent, innerHTML, or classList.",
      passed: /\.(textContent|innerHTML|classList\.add|appendChild)\s*=/i.test(js) || /\.(textContent|innerHTML|classList\.add|appendChild)\s*\(/i.test(js),
      hint: "Update element text: el.textContent = 'Updated!';",
    });
  }

  // 15. DOM Events
  else if (titleLower.includes("dom events") || titleLower.includes("events")) {
    criteria.push({
      id: "event-listener",
      label: "click Event Listener",
      description: "Attaches click event listener to #potion-btn.",
      passed: /addEventListener\s*\(\s*["']click["']/i.test(js),
      hint: "btn.addEventListener('click', () => { ... });",
    });
    criteria.push({
      id: "event-state-update",
      label: "State / Counter Update",
      description: "Increments counter and updates DOM text on click.",
      passed: /(health|\+\+|innerHTML|textContent)/i.test(js) && /addEventListener/i.test(js),
      hint: "Inside event handler, increment health and set healthEl.textContent = health;",
    });
  }

  // 16. Local Storage Persistence
  else if (titleLower.includes("storage") || titleLower.includes("apis")) {
    criteria.push({
      id: "storage-set",
      label: "localStorage.setItem",
      description: "Persists quest inventory state to browser storage.",
      passed: /localStorage\.setItem/i.test(allCode),
      hint: "Call localStorage.setItem('inventory', JSON.stringify(...));",
    });
    criteria.push({
      id: "storage-get",
      label: "localStorage.getItem",
      description: "Reads saved state back from storage.",
      passed: /localStorage\.getItem/i.test(allCode),
      hint: "Call localStorage.getItem('inventory');",
    });
  }

  // 17. Async JavaScript
  else if (titleLower.includes("async javascript") || (titleLower.includes("async") && !titleLower.includes("fetch"))) {
    criteria.push({
      id: "async-func",
      label: "async Function",
      description: "Declares asynchronous function using async keyword.",
      passed: /(async\s+function|async\s*\([^)]*\)\s*=>)/i.test(js),
      hint: "Declare an async function: async function loadScroll() { ... }",
    });
    criteria.push({
      id: "await-call",
      label: "await Expression",
      description: "Pauses async execution using await.",
      passed: /\bawait\s+[a-zA-Z0-9_$]/i.test(js),
      hint: "Use await to await asynchronous promises.",
    });
  }

  // 18. Fetch API & Remote Data
  else if (titleLower.includes("fetch") || titleLower.includes("remote data")) {
    criteria.push({
      id: "fetch-call",
      label: "fetch() Request",
      description: "Initiates asynchronous network request with fetch().",
      passed: /fetch\s*\([^)]+\)/i.test(js),
      hint: "Call fetch('https://api...') to request quest data.",
    });
    criteria.push({
      id: "fetch-json",
      label: "Response JSON Extraction",
      description: "Extracts parsed JSON from the fetch response.",
      passed: /\.json\s*\(\s*\)/i.test(js),
      hint: "Call await response.json(); to retrieve JSON payload.",
    });
  }

  // 19. React Components & Props
  else if (titleLower.includes("react components") || titleLower.includes("props") || titleLower.includes("jsx")) {
    criteria.push({
      id: "react-component",
      label: "Functional Component Definition",
      description: "Creates React component returning JSX markup.",
      passed: /function\s+[A-Z][a-zA-Z0-9_$]*\s*\(|const\s+[A-Z][a-zA-Z0-9_$]*\s*=\s*\(/i.test(js),
      hint: "Declare a component starting with a Capital letter, e.g. function QuestCard(props) { ... }",
    });
    criteria.push({
      id: "react-return-jsx",
      label: "JSX Return Markup",
      description: "Returns valid JSX element structure.",
      passed: /return\s*\(\s*<|<[A-Za-z][A-Za-z0-9]*[\s\S]*?>/i.test(js),
      hint: "Return JSX inside your component: return <div>...</div>;",
    });
  }

  // 20. State with useState
  else if (titleLower.includes("usestate") || titleLower.includes("state")) {
    criteria.push({
      id: "use-state-hook",
      label: "useState Hook Usage",
      description: "Declares reactive state with useState().",
      passed: /useState\s*\(/i.test(js),
      hint: "Declare state with: const [count, setCount] = useState(...);",
    });
    criteria.push({
      id: "state-setter-call",
      label: "State Updater Trigger",
      description: "Invokes state updater function in event handler.",
      passed: /onClick=\{[\s\S]*?=>[\s\S]*?\}/i.test(js) || /set[A-Z][a-zA-Z0-9_$]*\s*\(/i.test(js),
      hint: "Add an onClick handler that calls your state setter function.",
    });
  }

  // 21. Side Effects with useEffect
  else if (titleLower.includes("useeffect") || titleLower.includes("effects")) {
    criteria.push({
      id: "use-effect-hook",
      label: "useEffect Hook Usage",
      description: "Encapsulates side-effects with useEffect().",
      passed: /useEffect\s*\(\s*\(\)\s*=>/i.test(js),
      hint: "Add useEffect(() => { ... }, []); to handle lifecycle effects.",
    });
    criteria.push({
      id: "effect-dependency-or-cleanup",
      label: "Dependency Array or Cleanup",
      description: "Specifies dependency array or returns cleanup callback.",
      passed: /useEffect\s*\([\s\S]*?,\s*\[[\s\S]*?\]\s*\)/i.test(js) || /return\s*\(\)\s*=>/i.test(js),
      hint: "Include the dependency array [ ] or return a cleanup function.",
    });
  }

  // 22. Lists & Conditional Rendering
  else if (titleLower.includes("lists") || titleLower.includes("conditional rendering")) {
    criteria.push({
      id: "list-map",
      label: ".map() List Rendering",
      description: "Renders elements dynamically from collection using .map().",
      passed: /\.map\s*\(/i.test(js),
      hint: "Render list items with {items.map(item => <li key={item}>{item}</li>)}",
    });
    criteria.push({
      id: "conditional-render",
      label: "Conditional Guard (? : or &&)",
      description: "Conditionally renders elements with ternary or short-circuit && operator.",
      passed: /(\?[\s\S]*?:|&&)/.test(js),
      hint: "Use {isOpen && <Modal />} or {isComplete ? 'Done' : 'Active'}",
    });
  }

  // Universal Fallback for any other topics
  if (criteria.length === 0) {
    const isEdited = hasModifiedStarter(files, initialFiles);
    criteria.push({
      id: "code-edited",
      label: "Active Code Trial Modified",
      description: "Code has been modified from the default starter template.",
      passed: isEdited,
      hint: "Implement your code changes in the editor files.",
    });

    const hasCleanContent = isEdited && cleanCode(allCode).length > 25;
    criteria.push({
      id: "code-structure",
      label: "Valid Implementation Code",
      description: "Editor contains substantial code logic addressing the trial.",
      passed: hasCleanContent,
      hint: "Write the solution implementation according to the task objective.",
    });

    if (exercisePrompt) {
      const keywords = exercisePrompt
        .replace(/[<>,.:;'"?()]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !["with", "your", "below", "create", "using", "that", "this"].includes(w.toLowerCase()))
        .slice(0, 3);

      if (keywords.length > 0) {
        const matchesAny = isEdited && keywords.some((kw) => allCode.toLowerCase().includes(kw.toLowerCase()));
        criteria.push({
          id: "prompt-alignment",
          label: `Aligned with Objective (${keywords[0]})`,
          description: `Includes expected patterns from the quest objective directives.`,
          passed: matchesAny,
          hint: `Ensure your solution addresses: ${exercisePrompt}`,
        });
      }
    }
  }

  const passedCount = criteria.filter((c) => c.passed).length;
  const allPassed = criteria.length > 0 && passedCount === criteria.length;

  return {
    allPassed,
    score: passedCount,
    total: criteria.length,
    criteria,
  };
}
