# Product Requirements Document
## AI Prompt Generator — "PromptForge"
**Version:** 1.0
**Status:** Draft
**Last Updated:** May 2026

---

## 1. Overview

### 1.1 Product Summary

PromptForge is a lightweight, single-page web application that takes a user's visual parameters as input and outputs four ready-to-paste AI image generation prompts — one per selected viewing angle. The user then takes those prompts to any AI image generation tool (Gemini, ChatGPT, etc.), pastes each one along with their two photos, and gets their composited images.

No backend. No API keys. No costs. Runs entirely in the browser.

### 1.2 The Problem It Solves

Writing a good image compositing prompt from scratch requires knowing what details matter: lighting direction, shadow behaviour, scale language, photorealism cues, viewing angle description. Most users don't know this and produce weak prompts that lead to weak results. PromptForge encodes all of that prompt engineering knowledge into a simple form — the user fills in what they know visually, and the app produces a precise, well-structured prompt they can use immediately.

### 1.3 What the User Does With the Output

1. Opens PromptForge, fills in the form, clicks "Generate Prompts"
2. Sees four prompt text blocks — one per selected angle
3. Opens Gemini (or any other tool) in another tab
4. Uploads their space photo + object photo
5. Pastes the first prompt → gets image 1
6. Repeats for prompts 2, 3, 4

That's the full workflow. PromptForge's job ends at step 2.

---

## 2. Users

**Primary user:** A non-technical professional who regularly needs to visualise objects in spaces for client presentations. They are comfortable with web forms and with pasting text. They already use Gemini or a similar tool manually but find writing prompts from scratch time-consuming and inconsistent.

---

## 3. Core Workflow

```
1. CONFIGURE PARAMETERS
   ├─ Object type        → Flat/wall-mounted | Freestanding 3D object
   ├─ Object size        → Small | Medium | Large | Monumental
   ├─ Placement          → Centre | Left | Right | Background | Foreground | On a wall
   ├─ Time of day        → Dawn | Morning | Midday | Golden hour | Dusk | Overcast
   ├─ Season / weather   → Clear sky | Partly cloudy | Overcast | After rain
   ├─ Viewing angles     → Select exactly 4 from 12 presets
   └─ Free-text note     → Optional extra instruction (max 300 chars)

2. GENERATE PROMPTS
   └─ User clicks "Generate Prompts"
   └─ App assembles 4 prompts instantly (no API call — pure string construction)

3. USE PROMPTS
   ├─ Four prompt blocks appear, each labelled with its angle name
   ├─ Each block has a "Copy" button — one click copies to clipboard
   └─ A "Copy all 4 prompts" button copies all four sequentially with separators
```

---

## 4. Viewing Angle Presets

User selects exactly 4. Full list of 12 options:

| Angle Name | What it means |
|------------|---------------|
| Straight-on front view | Eye level, facing the object head-on |
| Slightly elevated front view | Raised to ~1.5× head height, gentle downward angle |
| Low ground-level view | Knee height, looking slightly upward |
| 45° left front | Eye level, diagonally front-left of object |
| 45° right front | Eye level, diagonally front-right of object |
| Side view (left) | Directly to the left, full side profile |
| Side view (right) | Directly to the right, full side profile |
| 45° left rear | Eye level, diagonally behind and left |
| 45° right rear | Eye level, diagonally behind and right |
| Wide establishing shot | Pulled back, object small in full environment |
| Aerial / bird's-eye | Elevated, looking nearly straight down |
| Close-up detail | Very close, surface texture and material fills frame |

---

## 5. Prompt Template

This is the core of the app. For each selected angle, the app assembles the following text — substituting in the user's parameter selections. This runs entirely in the browser with no network call.

```
You are a photorealistic architectural and spatial visualisation assistant.

Place the object shown in the SECOND image into the space shown in the FIRST image.

Object details:
- Type: [object type description]
- Size: [size description]
- Placement: [placement description]

Lighting and atmosphere:
- [time of day description]
- [weather description]
- The object must cast a shadow consistent with this lighting — correct direction, length, and softness.

Viewing angle:
[full angle description]

Output requirements:
- A single photorealistic composite photograph
- Must look like a real photograph taken on location — not a render, illustration, or collage
- Correct perspective, depth, and scale throughout
- No text, watermarks, captions, or borders
[free-text note line, only if user provided one: - Additional instruction: USER_NOTE]
```

### Parameter value maps (used by the template engine)

**Object type:**
- Flat/wall-mounted → "a flat, wall-mounted object (such as a painting, panel, or relief)"
- Freestanding 3D → "a freestanding three-dimensional object"

**Size:**
- Small → "small — less than 50 centimetres in its largest dimension"
- Medium → "medium — between 50 centimetres and 1.5 metres tall"
- Large → "large — between 1.5 and 3 metres tall"
- Monumental → "monumental — over 3 metres tall, dominating the space"

**Placement:**
- Centre → "positioned at the centre of the space"
- Left → "positioned toward the left side of the space"
- Right → "positioned toward the right side of the space"
- Background → "positioned in the far background of the space"
- Foreground → "positioned in the near foreground of the space"
- On a wall → "mounted on or positioned directly against a wall"

**Time of day:**
- Dawn → "Dawn light — very soft, warm orange-pink light just above the horizon; long dramatic shadows"
- Morning → "Morning light — bright directional light from a low sun, warm golden tone, medium-length shadows"
- Midday → "Midday light — overhead sunlight, strong and neutral-white, short shadows directly beneath objects"
- Golden hour → "Golden hour light — very warm, low-angle amber sunlight from the side; long soft shadows"
- Dusk → "Dusk light — fading warm light near the horizon, deep blue-purple sky beginning, very long shadows"
- Overcast → "Overcast light — diffuse, even, shadowless lighting from a uniformly cloudy sky; no directional shadows"

**Weather:**
- Clear sky → "Clear sky with no clouds"
- Partly cloudy → "Partly cloudy sky with some clouds casting occasional shadow"
- Overcast → "Completely overcast sky, heavy grey clouds"
- After rain → "After recent rain — wet surfaces, slight reflections on the ground, moist vegetation"

**Angle descriptions (full text passed into prompt):**
- Straight-on front view → "Camera at eye level directly in front of the object, facing it head-on. The viewer stands facing the object straight ahead."
- Slightly elevated front view → "Camera raised to approximately 1.5× average head height, angled slightly downward toward the object from the front."
- Low ground-level view → "Camera at knee height, angled slightly upward toward the object. The object appears imposing from this low vantage point."
- 45° left front → "Camera at eye level, positioned diagonally in front of and to the left of the object. The object's left front corner faces the camera."
- 45° right front → "Camera at eye level, positioned diagonally in front of and to the right of the object. The object's right front corner faces the camera."
- Side view (left) → "Camera directly to the left of the object at eye level, showing the complete left side profile."
- Side view (right) → "Camera directly to the right of the object at eye level, showing the complete right side profile."
- 45° left rear → "Camera at eye level, positioned diagonally behind and to the left of the object. The object's left rear corner faces the camera."
- 45° right rear → "Camera at eye level, positioned diagonally behind and to the right of the object. The object's right rear corner faces the camera."
- Wide establishing shot → "Camera pulled back to a wide vantage point showing the object small within the full context of the entire space. The environment dominates the frame."
- Aerial / bird's-eye → "Camera elevated significantly above the scene, looking nearly straight down at the object and surrounding space."
- Close-up detail → "Camera very close to the object, filling most of the frame with surface texture and material detail. Only a small portion of the surrounding space is visible."

---

## 6. Feature List (MVP — everything in one version)

| # | Feature | Description |
|---|---------|-------------|
| F1 | Parameter form | All controls from Section 3 — radio cards for each parameter |
| F2 | Angle selector | 12-card grid, exactly 4 must be selected |
| F3 | Prompt builder | Pure JS/TS function — assembles prompt string from parameters |
| F4 | Generate button | Active only when exactly 4 angles selected; instant output |
| F5 | Prompt output blocks | Four labelled text areas, one per angle |
| F6 | Copy button per prompt | One-click clipboard copy for each prompt individually |
| F7 | Copy all button | Copies all four prompts separated by a clear divider line |
| F8 | Usage instructions | Permanent short panel explaining how to use prompts in Gemini |
| F9 | Reset button | Clears all outputs; keeps parameter selections intact |
| F10 | Form persistence | Parameters remembered in localStorage across page refreshes |

---

## 7. Technical Architecture

**This app has no backend.** It is a single-page React + TypeScript app built with Vite. Everything runs in the browser.

| Layer | Technology |
|-------|-----------|
| Framework | React + TypeScript (Vite) |
| Styling | Tailwind CSS |
| State | React useState / useLocalStorage hook |
| Prompt logic | Pure TypeScript function in `src/lib/promptBuilder.ts` |
| Clipboard | Browser-native `navigator.clipboard.writeText()` |
| Persistence | `localStorage` via a simple custom hook |
| Deployment | Single `npm run build` → static files, hostable anywhere for free (Netlify, Vercel, GitHub Pages) |

No npm packages beyond React, TypeScript, Vite, and Tailwind are needed.

---

## 8. UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  PromptForge              [Reset]                        │
│  Generate perfect AI image prompts — free, instant      │
├─────────────────────────┬───────────────────────────────┤
│                         │                               │
│  PARAMETERS             │  YOUR PROMPTS                 │
│  ──────────             │  ──────────                   │
│  Object type            │  ┌─────────────────────────┐  │
│  [radio cards]          │  │ Angle 1: [name]         │  │
│                         │  │ [prompt text]           │  │
│  Object size            │  │              [Copy]     │  │
│  [radio cards]          │  └─────────────────────────┘  │
│                         │  ┌─────────────────────────┐  │
│  Placement              │  │ Angle 2: [name]         │  │
│  [radio cards]          │  │ [prompt text]           │  │
│                         │  │              [Copy]     │  │
│  Time of day            │  └─────────────────────────┘  │
│  [radio cards]          │  ┌─────────────────────────┐  │
│                         │  │ Angle 3: [name]         │  │
│  Weather                │  │ [prompt text]           │  │
│  [radio cards]          │  │              [Copy]     │  │
│                         │  └─────────────────────────┘  │
│  Additional note        │  ┌─────────────────────────┐  │
│  [textarea]             │  │ Angle 4: [name]         │  │
│                         │  │ [prompt text]           │  │
│  VIEWING ANGLES         │  │              [Copy]     │  │
│  Select exactly 4:      │  └─────────────────────────┘  │
│  [12-card grid]         │                               │
│  [2 of 4 selected] ●●   │  [Copy all 4 prompts]        │
│                         │                               │
│  [GENERATE PROMPTS]     │  HOW TO USE                   │
│                         │  ─────────                    │
│                         │  1. Open Gemini in a new tab  │
│                         │  2. Upload your space photo   │
│                         │     and object photo          │
│                         │  3. Paste one prompt per      │
│                         │     generation                │
│                         │  4. Repeat for all 4 angles   │
└─────────────────────────┴───────────────────────────────┘
```

On mobile (< 768px): single column, parameters on top, prompts below. After clicking Generate, auto-scroll to the prompts section.

---

## 9. Design Principles

- **Instant.** Clicking Generate produces output in under 100 milliseconds. There is no loading state, no spinner, no wait.
- **Copy-first.** The output section is optimised for copying. Large copy buttons, clear separators between prompts, readable monospace-style text areas.
- **Instructional.** The "How to use" panel is always visible — not hidden behind a help button. New users should understand the workflow without reading any documentation.
- **No jargon.** The word "prompt" is used (it's unavoidable and the user already knows it from using Gemini), but nothing more technical than that.

---

## 10. Success Criteria

The app is complete when:

1. A user fills in the form and selects 4 angles — the Generate button activates.
2. Clicking Generate instantly shows 4 prompt text blocks, each labelled with its angle name.
3. Clicking Copy under any prompt copies it to clipboard correctly.
4. Clicking "Copy all 4 prompts" copies all four with clear separators between them.
5. Pasting any of the generated prompts into Gemini (with both photos attached) produces a better result than a manually written prompt would.
6. Refreshing the page restores the last parameter selections.
7. `npm run build` produces a static folder that can be hosted for free on Netlify or Vercel with no configuration.
