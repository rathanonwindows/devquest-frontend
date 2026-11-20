export interface StudyGuide {
  summary: string;
  mentalModel: {
    title: string;
    points: string[];
  };
  cheatSheet: {
    title: string;
    code: string;
    language: string;
  };
  deepDiveScrolls: {
    title: string;
    description: string;
    url: string;
    type: "video" | "interactive" | "docs";
    badge: string;
  }[];
  proTip: string;
}

const STUDY_GUIDES: Record<string, StudyGuide> = {
  "html basics": {
    summary:
      "HTML (HyperText Markup Language) is the skeletal framework of every webpage. Browsers read nested elements with opening and closing tags to assemble document hierarchy, headings, text, and hyperlinked networks.",
    mentalModel: {
      title: "The Document Tree & Nesting Rules",
      points: [
        "Tags describe meaning: <h1> is the chief title of the scroll; <p> holds narrative paragraphs.",
        "Hyperlinks connect realms: The <a href=\"...\"> anchor tag links between internal quest coordinates and external web realms.",
        "Always close your tags: For every <tag>, ensure a corresponding </tag> completes the element.",
      ],
    },
    cheatSheet: {
      title: "Essential Document Anatomy",
      language: "html",
      code: `<h1>Knight of Code</h1>
<p>Venturing forth into the digital kingdom.</p>
<a href="https://devquest.io" target="_blank">View Quest Log</a>`,
    },
    deepDiveScrolls: [
      {
        title: "HTML in 100 Seconds",
        description: "Fast-paced visual breakdown of document anatomy and the DOM tree.",
        url: "https://www.youtube.com/watch?v=ok-plXXHlWw",
        type: "video",
        badge: "Fireship (2 min)",
      },
      {
        title: "MDN Getting Started with HTML",
        description: "Official interactive tutorial covering attributes, tags, and formatting.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics",
        type: "docs",
        badge: "Official MDN",
      },
    ],
    proTip: "Never use multiple <h1> tags on a single page — search engines and screen readers rely on one main <h1> as the document anchor.",
  },

  "semantic html": {
    summary:
      "Semantic HTML gives human and machine meaning to code beyond generic <div> tags. By using <header>, <main>, <article>, and <footer>, assistive technologies and search bots understand document context instantly.",
    mentalModel: {
      title: "Landmark Architecture",
      points: [
        "<header>: Introductory banner, site logo, or global chapter navigation.",
        "<main>: The singular central content core of the document — never duplicated.",
        "<article>: Self-contained chronicle entry that makes sense independently.",
        "<footer>: Sign-off, copyright, author coordinates, and secondary links.",
      ],
    },
    cheatSheet: {
      title: "Semantic Landmark Blueprint",
      language: "html",
      code: `<header>
  <h1>Guild Chronicles</h1>
</header>
<main>
  <article>
    <h2>The Great Refactor</h2>
    <p>Replacing generic div soup with landmark semantics.</p>
  </article>
</main>
<footer>
  <p>&copy; 2026 DevQuest Guild</p>
</footer>`,
    },
    deepDiveScrolls: [
      {
        title: "Semantic HTML Guide & Cheatsheet",
        description: "Visual breakdown of when to use section vs article vs div.",
        url: "https://www.youtube.com/watch?v=kGW8Al_cga4",
        type: "video",
        badge: "Kevin Powell (12 min)",
      },
      {
        title: "HTML5 Semantic Elements Overview",
        description: "Complete glossary of semantic elements and accessible roles.",
        url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html",
        type: "docs",
        badge: "MDN Spec",
      },
    ],
    proTip: "Use <div> purely as a styling container hook with CSS. When content has inherent meaning, always choose a semantic tag.",
  },

  "forms & inputs": {
    summary:
      "Forms are the primary interactive bridges connecting user keystrokes to server actions. They capture player names, credentials, checkboxes, and dispatches via structured <input> controls.",
    mentalModel: {
      title: "Form Inputs & State Capture",
      points: [
        "The <form> wrapper organizes related inputs and handles submission events.",
        "<input type=\"text\"> captures names; <input type=\"email\"> auto-validates email formats.",
        "<label for=\"id\"> binds labels to inputs, expanding tap zones and enabling screen readers.",
        "<button type=\"submit\"> triggers the browser form submission pipeline.",
      ],
    },
    cheatSheet: {
      title: "Accessible Registration Form",
      language: "html",
      code: `<form id="signup-form">
  <label for="username">Adventurer Name</label>
  <input type="text" id="username" name="username" placeholder="e.g. PixelKnight" required />

  <label for="email">Guild Email</label>
  <input type="email" id="email" name="email" placeholder="hero@guild.io" required />

  <button type="submit">Embark on Journey</button>
</form>`,
    },
    deepDiveScrolls: [
      {
        title: "HTML Forms The Right Way",
        description: "Master modern form fields, accessibility landmarks, and validation.",
        url: "https://www.youtube.com/watch?v=fNcJuPIZ2WE",
        type: "video",
        badge: "Web Dev Simplified (15 min)",
      },
      {
        title: "MDN Guide to Form Controls",
        description: "Comprehensive catalogue of native browser inputs and attributes.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
        type: "docs",
        badge: "Official MDN",
      },
    ],
    proTip: "Always specify the 'name' attribute on inputs — forms bundle data using name-value pairs during submission.",
  },

  "css basics": {
    summary:
      "CSS (Cascading Style Sheets) controls visual appearance, geometry, colors, typography, and pacing. The Cascade resolves multiple rules based on specificity, inheritance, and order.",
    mentalModel: {
      title: "Rule Syntax & Specificity",
      points: [
        "Selector targets element (.class, #id, or tag name).",
        "Property: value declarations configure visual traits (color, font-size, background).",
        "Classes (.card) are reusable; IDs (#hero) are unique single-instance anchors.",
      ],
    },
    cheatSheet: {
      title: "Standard CSS Rule Block",
      language: "css",
      code: `.quest-banner {
  color: #7c5cff;
  background-color: #1a1a26;
  text-align: center;
  font-size: 24px;
  padding: 20px;
  border-radius: 12px;
}`,
    },
    deepDiveScrolls: [
      {
        title: "CSS in 100 Seconds",
        description: "Speedrun of selectors, cascading priority, and box styles.",
        url: "https://www.youtube.com/watch?v=OEV8gMkCHXQ",
        type: "video",
        badge: "Fireship (2 min)",
      },
      {
        title: "CSS Specificity Calculator & Visualizer",
        description: "Learn how the cascade determines which rule wins.",
        url: "https://specifishity.com/",
        type: "interactive",
        badge: "Interactive Tool",
      },
    ],
    proTip: "Prefer classes over IDs for styling. High-specificity IDs make overriding CSS rules difficult later.",
  },

  "flexbox": {
    summary:
      "Flexbox (Flexible Box Layout) is a one-dimensional layout system designed for distributing space and aligning items along a single axis (row or column). It makes horizontal and vertical centering effortless.",
    mentalModel: {
      title: "The Two Axes of Flexbox",
      points: [
        "Main Axis (default horizontal): Controlled with justify-content (center, space-between, flex-start).",
        "Cross Axis (default vertical): Controlled with align-items (center, stretch, flex-end).",
        "Container vs Items: display: flex goes on the parent; children automatically become flexible items.",
      ],
    },
    cheatSheet: {
      title: "Perfect Centering with Flexbox",
      language: "css",
      code: `.container {
  display: flex;
  justify-content: center; /* Centers along main horizontal axis */
  align-items: center;     /* Centers along cross vertical axis */
  gap: 16px;               /* Clean spacing between items */
  min-height: 50vh;
}`,
    },
    deepDiveScrolls: [
      {
        title: "Flexbox Froggy Game",
        description: "Gamified interactive 24-level puzzle to master flexbox positioning.",
        url: "https://flexboxfroggy.com/",
        type: "interactive",
        badge: "Interactive Game",
      },
      {
        title: "Learn Flexbox in 15 Minutes",
        description: "The most clear, visual flexbox tutorial on the web.",
        url: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
        type: "video",
        badge: "Web Dev Simplified (15 min)",
      },
      {
        title: "CSS-Tricks Complete Guide to Flexbox",
        description: "The industry standard visual poster and cheat sheet.",
        url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        type: "docs",
        badge: "Visual Guide",
      },
    ],
    proTip: "Remember: justify-content aligns items along the flex-direction; align-items aligns items perpendicular to it.",
  },

  "css grid": {
    summary:
      "CSS Grid is a 2-dimensional layout engine capable of arranging elements across simultaneous columns and rows. It excels at macro-layouts, card galleries, and complex dashboard structures.",
    mentalModel: {
      title: "Columns, Rows & Tracks",
      points: [
        "display: grid transforms the parent into a 2D coordinate grid system.",
        "grid-template-columns: repeat(3, 1fr) creates 3 equal columns that automatically balance.",
        "gap: 16px sets unified gutter spacing between all grid tracks without margin hacks.",
      ],
    },
    cheatSheet: {
      title: "Responsive 3-Column Grid",
      language: "css",
      code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Make it responsive */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}`,
    },
    deepDiveScrolls: [
      {
        title: "Grid Garden Interactive Game",
        description: "Grow your carrot garden by mastering CSS grid commands.",
        url: "https://cssgridgarden.com/",
        type: "interactive",
        badge: "Interactive Game",
      },
      {
        title: "Learn CSS Grid in 20 Minutes",
        description: "Visual breakdown of tracks, fr units, and area templates.",
        url: "https://www.youtube.com/watch?v=rg7Fvvl3taU",
        type: "video",
        badge: "Kevin Powell (20 min)",
      },
    ],
    proTip: "Use repeat(auto-fit, minmax(280px, 1fr)) for an instant responsive grid that requires zero media queries!",
  },

  "javascript basics": {
    summary:
      "JavaScript powers interactive logic, state updates, and algorithmic computation in the browser. It executes scripts to alter page content, respond to player clicks, and exchange data with servers.",
    mentalModel: {
      title: "Variables & Data Primitives",
      points: [
        "const: Immutable variable reference (default choice for almost all data).",
        "let: Mutable variable that can be reassigned over time (counters, toggles).",
        "Primitives: Strings ('hero'), Numbers (42), Booleans (true/false), and Objects/Arrays.",
      ],
    },
    cheatSheet: {
      title: "Variable Declaration & Logging",
      language: "javascript",
      code: `const heroName = "ShadowKnight";
let playerLevel = 1;
let isQuestActive = true;

// Level up
playerLevel += 1;

console.log(\`Adventurer: \${heroName} | Level: \${playerLevel}\`);`,
    },
    deepDiveScrolls: [
      {
        title: "JavaScript in 100 Seconds",
        description: "High-level overview of JS runtime, V8 engine, and event loops.",
        url: "https://www.youtube.com/watch?v=DHjqpvDnNGE",
        type: "video",
        badge: "Fireship (2 min)",
      },
      {
        title: "Modern JavaScript Tutorial (javascript.info)",
        description: "The premier comprehensive textbook for JavaScript fundamentals.",
        url: "https://javascript.info/first-steps",
        type: "docs",
        badge: "JavaScript.info",
      },
    ],
    proTip: "Never use 'var' in modern JavaScript — 'const' and 'let' have block scoping which prevents subtle variable leak bugs.",
  },

  "dom events": {
    summary:
      "The DOM (Document Object Model) is the browser's live representation of your HTML. JavaScript listens to player inputs (clicks, keypresses, forms) via addEventListener to update the screen in real time.",
    mentalModel: {
      title: "Select ➔ Listen ➔ Mutate",
      points: [
        "1. Select: Find the element with document.getElementById('id') or document.querySelector('.class').",
        "2. Listen: Attach an observer with element.addEventListener('click', handler).",
        "3. Mutate: Update state and reflect it: display.textContent = newScore.",
      ],
    },
    cheatSheet: {
      title: "Interactive Click Handler",
      language: "javascript",
      code: `let potionCount = 3;
const potionBtn = document.getElementById("drink-btn");
const potionCounter = document.getElementById("count-display");

potionBtn.addEventListener("click", () => {
  if (potionCount > 0) {
    potionCount -= 1;
    potionCounter.textContent = \`Potions: \${potionCount}\`;
  }
});`,
    },
    deepDiveScrolls: [
      {
        title: "DOM Manipulation Crash Course",
        description: "Visual walkthrough of selectors, classList, and event bubbling.",
        url: "https://www.youtube.com/watch?v=y17RuWkWdn8",
        type: "video",
        badge: "Traversy Media (30 min)",
      },
      {
        title: "MDN Introduction to Events",
        description: "Official guide to event targets, bubbling, and listeners.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events",
        type: "docs",
        badge: "Official MDN",
      },
    ],
    proTip: "Use element.classList.toggle('active') instead of directly writing inline styles for cleaner UI state changes.",
  },

  "async javascript": {
    summary:
      "JavaScript is single-threaded. Asynchronous operations (fetching data from APIs, timers, database calls) run non-blockingly using Promises and the modern async/await syntax.",
    mentalModel: {
      title: "The Async / Await Flow",
      points: [
        "async functions always return a Promise.",
        "await pauses the local function execution until the Promise resolves, without freezing the browser UI.",
        "Always enclose await statements in try { ... } catch (err) { ... } to handle network drops cleanly.",
      ],
    },
    cheatSheet: {
      title: "Async Data Fetch Pattern",
      language: "javascript",
      code: `async function loadQuestLog() {
  try {
    const response = await fetch("https://api.devquest.io/quests");
    if (!response.ok) throw new Error("Guild server unreachable");
    const data = await response.json();
    console.log("Quests received:", data);
  } catch (error) {
    console.error("Failed to load quests:", error.message);
  }
}

loadQuestLog();`,
    },
    deepDiveScrolls: [
      {
        title: "Async/Await in 100 Seconds",
        description: "Clear animated breakdown of Promises, callbacks, and await syntax.",
        url: "https://www.youtube.com/watch?v=vn3tm0quoqE",
        type: "video",
        badge: "Fireship (2 min)",
      },
      {
        title: "JavaScript Fetch API Tutorial",
        description: "Practical guide to making GET, POST requests and handling JSON.",
        url: "https://www.youtube.com/watch?v=cuEtnrL9-H0",
        type: "video",
        badge: "Web Dev Simplified (12 min)",
      },
    ],
    proTip: "Remember to check 'if (!response.ok)' — fetch does NOT automatically throw on 404 or 500 HTTP status errors!",
  },

  "media & embedding": {
    summary:
      "Modern web experiences rely on visual imagery, video chronicles, audio soundscapes, and embedded iframes. Using responsive media elements with descriptive alternative text ensures all players can perceive your content.",
    mentalModel: {
      title: "Perception & Performance",
      points: [
        "<img>: Always specify src and alt attributes; alt provides accessibility and displays if images fail to load.",
        "<video controls>: Gives players playback controls (play, pause, volume, fullscreen).",
        "<iframe>: Embeds external documents, sandbox players, or interactive widgets.",
      ],
    },
    cheatSheet: {
      title: "Media Syntax Blueprint",
      language: "html",
      code: `<img src="hero-avatar.png" alt="Adventurer in silver armor with glowing sword" width="300" />
<video controls width="400">
  <source src="victory-fanfare.mp4" type="video/mp4" />
  Your browser does not support video playback.
</video>`,
    },
    deepDiveScrolls: [
      {
        title: "MDN Images in HTML",
        description: "Official guide to responsive images, alt text, and file formats.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Images_in_HTML",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Never leave alt blank unless the image is purely decorative — screen readers rely on descriptive alt text for visually impaired adventurers.",
  },

  "box model & dimensions": {
    summary:
      "Every element rendered in CSS is fundamentally a rectangular box composed of four concentric layers: Content, Padding, Border, and Margin.",
    mentalModel: {
      title: "The 4 Concentric Layers",
      points: [
        "Content: The actual text, image, or child elements.",
        "Padding: Inner breathing room between the content and the element border.",
        "Border: The decorative stroke encapsulating padding and content.",
        "Margin: Outer repellent force creating spacing between neighbor elements.",
        "box-sizing: border-box: Ensures padding and border are included INSIDE the element's width/height.",
      ],
    },
    cheatSheet: {
      title: "Box Model Defensive Reset",
      language: "css",
      code: `*, *::before, *::after {
  box-sizing: border-box;
}

.quest-card {
  width: 320px;
  padding: 16px;
  border: 2px solid #7c5cff;
  margin: 20px auto;
}`,
    },
    deepDiveScrolls: [
      {
        title: "CSS Box Model in 100 Seconds",
        description: "Visual animation explaining padding vs margin vs border-box.",
        url: "https://www.youtube.com/watch?v=rIO5326FgPE",
        type: "video",
        badge: "Fireship (2 min)",
      },
      {
        title: "MDN The Box Model",
        description: "In-depth guide to standard vs alternative box models.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Always use 'box-sizing: border-box' universally so adding padding never accidentally stretches your elements beyond their assigned width.",
  },

  "selectors & specificity": {
    summary:
      "CSS Selectors determine which elements receive style declarations, while Specificity acts as the conflict resolution hierarchy when multiple rules compete for the same element.",
    mentalModel: {
      title: "The Hierarchy of Power",
      points: [
        "Type/Element: h1, p, button (Weight: 1)",
        "Class, Pseudo-class, Attribute: .card, :hover, [type='text'] (Weight: 10)",
        "ID: #hero, #navbar (Weight: 100) — highly specific!",
        "Inline Styles: style='...' (Weight: 1000)",
        "!important: Overrides normal cascading logic — use sparingly as a last resort.",
      ],
    },
    cheatSheet: {
      title: "Selector Patterns",
      language: "css",
      code: `/* Element selector */
button { padding: 8px 16px; }

/* Class selector */
.btn-primary { background: #7c5cff; color: #fff; }

/* Pseudo-class on state */
.btn-primary:hover { filter: brightness(1.15); }

/* Combinator: child */
nav > ul { list-style: none; }`,
    },
    deepDiveScrolls: [
      {
        title: "MDN Specificity Calculator",
        description: "How browsers calculate selector precedence and resolve conflicts.",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Favour classes (.badge) over IDs (#badge) for styling to keep specificity low and styles reusable across components.",
  },

  "responsive design": {
    summary:
      "Responsive design ensures your application renders gracefully across all device screens — from mobile phones to ultra-wide desktop displays — using flexible fluid layouts and media queries.",
    mentalModel: {
      title: "Mobile-First Philosophy",
      points: [
        "Base styles: Target small mobile screens without media queries.",
        "Breakpoints: Add @media (min-width: ...) to progressively enhance layouts as viewport widens.",
        "Fluid units: Use %, rem, and vh/vw instead of fixed pixel widths.",
      ],
    },
    cheatSheet: {
      title: "Media Query Pattern",
      language: "css",
      code: `/* Mobile default: single column */
.deck-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Tablet & Desktop: multi-column */
@media (min-width: 768px) {
  .deck-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}`,
    },
    deepDiveScrolls: [
      {
        title: "Responsive Web Design Basics",
        description: "Google Web.dev guide to viewport meta tags, breakpoints, and fluid images.",
        url: "https://web.dev/learn/design",
        type: "docs",
        badge: "web.dev",
      },
    ],
    proTip: "Always design mobile-first with min-width media queries. It produces significantly cleaner CSS than overriding desktop styles with max-width.",
  },

  "arrays & methods": {
    summary:
      "Arrays are ordered collections of data items. Modern JavaScript relies on powerful higher-order transformation methods (map, filter, reduce, find) that process collections immutably without mutating original arrays.",
    mentalModel: {
      title: "The Essential Quartet",
      points: [
        ".map(): Transforms every item and returns a new array of identical length.",
        ".filter(): Keeps only elements that satisfy a truthy test condition.",
        ".find(): Locates the first matching element, or returns undefined.",
        ".reduce(): Combines all items down into a single accumulated result (e.g. sum, object).",
      ],
    },
    cheatSheet: {
      title: "Array Transformations",
      language: "javascript",
      code: `const quests = [
  { id: 1, title: "HTML Basics", xp: 50, completed: true },
  { id: 2, title: "CSS Grid", xp: 100, completed: false },
];

// Filter completed quests
const finished = quests.filter(q => q.completed);

// Extract titles with map
const titles = quests.map(q => q.title);

// Calculate total XP pool with reduce
const totalXp = quests.reduce((sum, q) => sum + q.xp, 0);`,
    },
    deepDiveScrolls: [
      {
        title: "8 Must Know JavaScript Array Methods",
        description: "Clear animated walkthrough of map, filter, find, and reduce.",
        url: "https://www.youtube.com/watch?v=R8rmfD9Y5-c",
        type: "video",
        badge: "Web Dev Simplified (13 min)",
      },
    ],
    proTip: "Avoid mutating methods like .splice() and .push() in modern reactive applications — prefer .filter() and spread [...array, newItem] for clean state updates.",
  },

  "objects & methods": {
    summary:
      "Objects are key-value storehouses that model real-world entities (players, quests, stats). They support method functions, destructuring, and property enumeration.",
    mentalModel: {
      title: "Data Models & Encapsulation",
      points: [
        "Keys are strings; values can be any type including functions (methods).",
        "Destructuring: const { name, level } = player unpacks properties cleanly.",
        "Spread operator: const updated = { ...player, level: 2 } creates a fresh clone with overrides.",
      ],
    },
    cheatSheet: {
      title: "Object Patterns",
      language: "javascript",
      code: `const player = {
  name: "Aria",
  level: 1,
  stats: { hp: 100, mana: 50 },
  levelUp() {
    this.level += 1;
    return this.level;
  }
};

// Object destructuring
const { name, level } = player;

// Immutable update with spread
const updatedPlayer = { ...player, level: level + 1 };`,
    },
    deepDiveScrolls: [
      {
        title: "MDN Working with Objects",
        description: "Official guide to object initializers, prototypes, and properties.",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Use optional chaining (player?.stats?.hp) to safely access nested object properties without triggering 'Cannot read property of undefined' errors.",
  },

  "functions & scope": {
    summary:
      "Functions are reusable blocks of code that accept parameters and return values. Scope dictates where variables can be accessed in your program.",
    mentalModel: {
      title: "Scope & Arrow Syntax",
      points: [
        "Block Scope: let and const live only inside the { curly braces } where they are declared.",
        "Arrow Functions: const fn = (param) => value provides concise syntax and lexical 'this'.",
        "Pure Functions: Same input always produces the same output with zero side effects.",
      ],
    },
    cheatSheet: {
      title: "Function Declaration Styles",
      language: "javascript",
      code: `// Modern arrow function with implicit return
const calculateXp = (level, multiplier = 100) => level * multiplier;

// Multi-line arrow function with block body
const formatPlayerBadge = (name, rank) => {
  const normalized = name.trim().toUpperCase();
  return \`[\${rank}] \${normalized}\`;
};`,
    },
    deepDiveScrolls: [
      {
        title: "JavaScript Functions & Scope in Depth",
        description: "Lexical scope, closures, and arrow function mechanics explained.",
        url: "https://javascript.info/function-basics",
        type: "docs",
        badge: "JavaScript.info",
      },
    ],
    proTip: "Default function parameters (e.g. multiplier = 100) prevent unexpected NaN values when arguments are omitted.",
  },

  "dom manipulation": {
    summary:
      "DOM Manipulation allows JavaScript to programmatically read and modify HTML elements, alter styles, update text content, and inject new nodes into the document tree.",
    mentalModel: {
      title: "Find, Mutate, Append",
      points: [
        "Select: document.querySelector('.card') finds elements using standard CSS selectors.",
        "Modify: element.textContent sets clean text; element.classList.add('active') updates styling.",
        "Create & Append: document.createElement('div') constructs a new node to append into the tree.",
      ],
    },
    cheatSheet: {
      title: "DOM Manipulation Mechanics",
      language: "javascript",
      code: `// 1. Select element
const alertBox = document.querySelector("#alert");

// 2. Mutate text & class
alertBox.textContent = "⚔️ Quest Trial Triggered!";
alertBox.classList.add("glowing", "danger");

// 3. Create and append dynamic list item
const li = document.createElement("li");
li.textContent = "Obtained Mystic Rune";
document.querySelector("#loot-log").appendChild(li);`,
    },
    deepDiveScrolls: [
      {
        title: "MDN Manipulating Documents",
        description: "Official guide to document tree navigation, node creation, and mutation.",
        url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Use textContent instead of innerHTML when displaying user text to protect your application from XSS (Cross-Site Scripting) injection attacks.",
  },

  "fetch api": {
    summary:
      "The Fetch API provides a modern JavaScript interface for requesting network resources across HTTP. It uses Promises to transfer data without refreshing the web page.",
    mentalModel: {
      title: "The Network Journey",
      points: [
        "1. Dispatch request: fetch(url, options)",
        "2. Inspect status: check if (!response.ok) before parsing.",
        "3. Parse payload: await response.json() extracts the parsed data payload.",
        "4. Catch errors: try/catch absorbs network timeouts and connection drops.",
      ],
    },
    cheatSheet: {
      title: "Standard Fetch Async Pattern",
      language: "javascript",
      code: `async function fetchQuestLeaderboard() {
  try {
    const res = await fetch("https://api.devquest.io/leaderboard");
    if (!res.ok) {
      throw new Error(\`HTTP error! status: \${res.status}\`);
    }
    const leaderboard = await res.json();
    return leaderboard;
  } catch (err) {
    console.error("Leaderboard fetch failed:", err);
    return [];
  }
}`,
    },
    deepDiveScrolls: [
      {
        title: "MDN Using the Fetch API",
        description: "Official documentation covering requests, headers, POST bodies, and responses.",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "When sending data via POST, always stringify the payload with JSON.stringify() and set 'Content-Type': 'application/json' in your headers.",
  },

  "react components & props": {
    summary:
      "React applications are constructed from modular, reusable functional components. Props (properties) allow parent components to pass data and callbacks down to children like function parameters.",
    mentalModel: {
      title: "Component Tree & Props Flow",
      points: [
        "Components are JavaScript functions that return JSX (HTML-like syntax).",
        "Props flow one-way downwards from parent to child.",
        "Props are read-only: components must never modify their own props directly.",
      ],
    },
    cheatSheet: {
      title: "Functional Component with Props",
      language: "javascript",
      code: `// Child component with destructured props
function QuestCard({ title, xp, isComplete }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>Reward: +{xp} XP</p>
      {isComplete ? <span>✅ Done</span> : <button>Start</button>}
    </div>
  );
}

// Parent rendering instances
function QuestRoster() {
  return <QuestCard title="HTML Basics" xp={50} isComplete={true} />;
}`,
    },
    deepDiveScrolls: [
      {
        title: "React.dev: Passing Props to a Component",
        description: "Official React documentation on declaring, reading, and forwarding props.",
        url: "https://react.dev/learn/passing-props-to-a-component",
        type: "docs",
        badge: "Official React Docs",
      },
    ],
    proTip: "Destructure props directly in function parameters ({ title, xp }) for cleaner code and instant visibility of component inputs.",
  },

  "react state & usestate": {
    summary:
      "State represents component memory that changes over time. When state updates via its setter function, React automatically triggers a component re-render to reflect the new state in the DOM.",
    mentalModel: {
      title: "Reactive State Loop",
      points: [
        "useState returns a pair: [currentState, setStateFunction].",
        "State is private and fully isolated within the component.",
        "Never mutate state directly (e.g. count++ is invalid) — always call setCount(count + 1).",
      ],
    },
    cheatSheet: {
      title: "useState Hook Blueprint",
      language: "javascript",
      code: `import { useState } from "react";

function Counter() {
  const [mana, setMana] = useState(100);

  const castSpell = () => {
    // Functional update prevents stale state bugs
    setMana(prevMana => Math.max(0, prevMana - 25));
  };

  return (
    <div>
      <p>Current Mana: {mana} / 100</p>
      <button onClick={castSpell} disabled={mana === 0}>
        Cast Arcane Flare
      </button>
    </div>
  );
}`,
    },
    deepDiveScrolls: [
      {
        title: "React.dev: State: A Component's Memory",
        description: "Official guide on adding state, re-renders, and state batching.",
        url: "https://react.dev/learn/state-a-components-memory",
        type: "docs",
        badge: "Official React Docs",
      },
    ],
    proTip: "When computing new state from previous state, pass an updater function (prev => prev + 1) to avoid race condition and closure capture bugs.",
  },

  "react side effects & useeffect": {
    summary:
      "The useEffect Hook allows functional components to perform side effects: fetching data from network APIs, subscribing to timers, or synchronizing with external browser systems.",
    mentalModel: {
      title: "The Dependency Array Rule",
      points: [
        "[] (Empty): Runs once when the component mounts.",
        "[prop, state]: Runs on mount and re-runs whenever those specific dependencies change.",
        "No array: Runs on every single render (rarely intended!).",
        "Return function: Cleanup callback that runs before unmounting to prevent memory leaks.",
      ],
    },
    cheatSheet: {
      title: "Data Fetching with Cleanup",
      language: "javascript",
      code: `import { useState, useEffect } from "react";

function PlayerProfile({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    fetch(\`/api/users/\${userId}\`)
      .then(res => res.json())
      .then(data => {
        if (isCurrent) setProfile(data);
      });

    // Cleanup cancels stale updates
    return () => {
      isCurrent = false;
    };
  }, [userId]); // Re-fetch when userId changes

  if (!profile) return <div>Loading hero stats...</div>;
  return <div>Welcome, {profile.name}!</div>;
}`,
    },
    deepDiveScrolls: [
      {
        title: "React.dev: Synchronizing with Effects",
        description: "Comprehensive guide to writing effects, declaring dependencies, and cleanups.",
        url: "https://react.dev/learn/synchronizing-with-effects",
        type: "docs",
        badge: "Official React Docs",
      },
    ],
    proTip: "Always list every prop and state variable read inside your effect within its dependency array to prevent stale closure bugs.",
  },

  "react conditional rendering": {
    summary:
      "Conditional rendering enables components to selectively display distinct UI elements or entire layouts based on state, authentication status, or error conditions.",
    mentalModel: {
      title: "The 3 Conditional Tools",
      points: [
        "1. Early return: if (!isLoaded) return <LoadingScreen /> terminates component render early.",
        "2. Ternary operator: {isLoggedIn ? <Dashboard /> : <Login />} toggles between two outcomes.",
        "3. Logical AND (&&): {hasUnreadMessages && <Badge />} renders element only when truthy.",
      ],
    },
    cheatSheet: {
      title: "Conditional Rendering Patterns",
      language: "javascript",
      code: `function QuestBanner({ quest, isLoading, isLocked }) {
  // Pattern 1: Early return guard
  if (isLoading) {
    return <p>Loading quest trial...</p>;
  }

  return (
    <div className="banner">
      <h2>{quest.title}</h2>

      {/* Pattern 2: Short-circuit flag */}
      {quest.isCapstone && <span className="capstone-tag">🏆 CAPSTONE</span>}

      {/* Pattern 3: Ternary branch */}
      {isLocked ? (
        <button disabled>🔒 Sealed</button>
      ) : (
        <button className="primary">⚔️ Embark</button>
      )}
    </div>
  );
}`,
    },
    deepDiveScrolls: [
      {
        title: "React.dev: Conditional Rendering",
        description: "Official guide on returning JSX conditionally with if, &&, and ternaries.",
        url: "https://react.dev/learn/conditional-rendering",
        type: "docs",
        badge: "Official React Docs",
      },
    ],
    proTip: "Beware of numbers with &&: writing '{count && <Badge />}' will render '0' onto the screen when count is 0! Write '{count > 0 && <Badge />}' instead.",
  },

};


/**
 * Retrieves the tailored study guide for a topic, with a universal structured fallback.
 */
export function getTopicStudyGuide(topicTitle: string, defaultDescription?: string | null): StudyGuide {
  const normalized = topicTitle.toLowerCase().trim();
  for (const [key, guide] of Object.entries(STUDY_GUIDES)) {
    if (normalized.includes(key)) {
      return guide;
    }
  }

  // Universal Fallback Study Guide
  return {
    summary:
      defaultDescription ||
      `Master ${topicTitle} to unlock powerful development workflows and complete your roadmap campaign.`,
    mentalModel: {
      title: "Core Mechanics & Objectives",
      points: [
        "Break the problem down into sequential steps before writing code.",
        "Inspect the live preview and test suite diagnostics to verify each requirement.",
        "Consult official documentation scrolls to understand function parameters and syntax.",
      ],
    },
    cheatSheet: {
      title: "Reference Scaffold",
      language: "javascript",
      code: `// ${topicTitle} Blueprint
// Implement the objective directives outlined in the quest codex.`,
    },
    deepDiveScrolls: [
      {
        title: `${topicTitle} - MDN Web Docs`,
        description: "Official developer reference, syntax guides, and browser compatibility.",
        url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(topicTitle)}`,
        type: "docs",
        badge: "MDN Docs",
      },
    ],
    proTip: "Small incremental edits with live preview checking lead to faster victories than writing everything at once.",
  };
}
