# EcoTrack — Intelligent Sustainability Assistant

> **Track. Reduce. Thrive.** — Your AI-powered carbon footprint companion.

EcoTrack is a production-ready, React-based sustainability assistant that calculates annual carbon footprints, generates personalized action plans, and helps users track progress toward a net-zero lifestyle. It combines an interactive calculator, a learn section, a recommendation engine, and community features — all built as a client-first single-page app.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧮 **6-Step Carbon Calculator** | Transport, Energy, Food, Lifestyle, Water + Flights — with live score preview |
| 🤖 **AI Sustainability Coach** | Floating panel with ranked recommendations (impact × effort × cost) |
| 📊 **Sustainability Score (0–100)** | Animated radial gauge: Beginner → Aware → Sustainable → Eco Champion |
| 🎯 **Onboarding Wizard** | 3-step first-visit setup: name, goal, primary focus area |
| 🔔 **Notification Center** | Milestone, recommendation, challenge, and goal notifications |
| 🏆 **Dynamic Badges** | Unlocked based on real calculator data and user actions |
| 🌍 **Community Hub** | Social feed with sanitized posts, leaderboard, challenges, events |
| 📚 **Learn Section** | Article reader with search, category filters, and modal viewer |
| ♻️ **Tips Library** | Personalized tips with "For You" badges linked to your footprint profile |

---

## 🧠 Architecture

```
src/
├── lib/
│   ├── decisionEngine.ts   # Rule-based AI: emission calc, scoring, ranking
│   ├── sanitize.ts         # XSS prevention, input validation, rate limiting
│   └── storage.ts          # Typed localStorage wrapper with namespaced keys
├── context/
│   └── AppContext.tsx       # Global state: calculator ↔ dashboard ↔ profile
├── components/
│   ├── AICoach.tsx          # Floating recommendation panel (3 tabs)
│   ├── OnboardingWizard.tsx # First-visit 3-step modal
│   ├── NotificationCenter.tsx # Slide-in notification drawer
│   ├── SustainabilityScoreCard.tsx # Animated radial gauge
│   ├── CalculatorSection.tsx # 6-step wizard + results
│   ├── DashboardSection.tsx  # 5-tab dashboard with real data
│   ├── ProfileSection.tsx    # Dynamic badges + goal progress
│   ├── ReduceSection.tsx     # Personalized tips library
│   └── CommunitySection.tsx  # Social feed with sanitization
└── __tests__/
    ├── decisionEngine.test.ts # tests — engine logic & ranking
    └── sanitize.test.ts       # tests — security utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v8+ (or yarn / pnpm)

### Installation

```bash
git clone https://github.com/your-username/ecotrack.git
cd ecotrack
npm install
```

### Environment Variables

Create a `.env.local` or `.env` in the project root:

```env
GEMINI_API_KEY=your_api_key_here  # optional — used for server-side AI features if enabled
```

> The Gemini API key is optional; core decision engine and many features run client-side.

### Development

```bash
npm run dev
# App available at http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧪 Testing

```bash
# Run tests once
npm run test

# Watch tests
npm run test:watch
```

Tests cover the decision engine and security utilities (sanitization, validation). Add tests for any new business logic.

---

## 🔒 Security

| Measure | Implementation |
|---|---|
| **XSS Prevention** | `sanitizeText()` strips HTML tags and escapes entities before rendering |
| **Input Validation** | `validateEmail()` RFC-5321 aware, `validatePassword()` rules, `validateDisplayName()` |
| **Rate Limiting** | `checkRateLimit()` prevents community post spam (example: max 3/minute) |
| **Character Limits** | Posts: 280 chars, Comments: 200 chars — enforced both UI and logic |
| **Numeric Clamping** | `clampNumber()` prevents calculator overflow on range inputs |
| **Type-Safe Storage** | Namespaced `et_*` localStorage keys with JSON parse/stringify safety |

Security notes:
- Sanitize any free-form user content before rendering.
- Do not commit API keys or secrets to the repo. Use .env and CI secrets.

---

## ♿ Accessibility (WCAG 2.1 AA)

- Skip-to-content link for keyboard users
- `aria-label` on interactive elements
- `role="dialog"` + `aria-modal` + `aria-labelledby` on modals
- `aria-expanded` on disclosure buttons and menu toggles
- `aria-live="polite"` for toast notifications
- `role="radiogroup"` + `role="radio"` for option groups
- Proper `<fieldset>` / `<legend>` for radio groups
- `focus-visible` rings for keyboard navigation

---

## ⚡ Performance

- Use code-splitting to lazily load heavy libraries (charts, motion) where appropriate.
- Keep main chunk small; measure with `vite build --report`.
- Avoid large inlined assets; prefer optimized CDN images.

---

## 🌿 Sustainability Score Logic (example)

The score maps annual tonnes CO₂ to a 0–100 scale (example formula):

```
score = clamp(0, 100, Math.round((1 - footprint_tonnes / 20) * 100))
```

Rough bands:
- Beginner (0–25): > ~15 tonnes
- Aware (26–50): ~10–15 tonnes
- Sustainable (51–75): ~5–10 tonnes
- Eco Champion (76–100): < 5 tonnes

These thresholds are configurable and should be driven by domain data if available.

---

## 🤖 Decision Engine

Recommendations are ranked by: Impact × (Inverse Effort) × (Inverse Cost)

```ts
priority = 100 - (impactScore * 4 + effortScore * 3 + costScore * 2)
```

Lower priority number = shown first. Apply a boost to the highest-emission category so that the UI always surfaces the most impactful actions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | motion/react |
| Charts | Recharts |
| Icons | Lucide React |
| Tests | Vitest |
| State | React Context + localStorage |

---

## 📁 License

This project does not include a LICENSE file by default. Add a LICENSE (MIT/Apache) if you want explicit terms.

---

*Built for people who want measurable climate action. Every small reduction compounds.*

