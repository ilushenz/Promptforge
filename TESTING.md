# TESTING.md — PromptForge

Open `http://localhost:5174` in your browser. No coding needed — just click through the checklist.

---

## Phase 1 — Layout & Parameter Form

- [ ] App loads without errors (no red error screen, no blank page)
- [ ] Screen is split into two panels: **Parameters** on the left, **Your prompts** on the right
- [ ] **Object type** shows 2 cards — "Freestanding 3D object" is highlighted by default
- [ ] **Object size** shows 4 cards — "Medium" is highlighted by default
- [ ] **Placement** shows 6 cards — "Centre" is highlighted by default
- [ ] **Time of day** shows 6 cards — "Golden hour" is highlighted by default
- [ ] **Season / weather** shows 4 cards — "Clear sky" is highlighted by default
- [ ] Clicking any card highlights it and deselects the previous one in that group
- [ ] **Additional note** textarea is visible with a character counter below it
- [ ] Typing into the note field counts down from 300
- [ ] **Generate Prompts** button is visible but greyed out
- [ ] Right panel shows "Your prompts will appear here" placeholder text
- [ ] Right panel shows the **How to use** steps (4 numbered steps)

---

## Phase 2 — Angle Selector & Generate Button

- [ ] 12 angle cards are visible below the parameters
- [ ] Each card shows a short label and a one-line description
- [ ] Clicking a card highlights it with an amber border
- [ ] A numbered badge (1, 2, 3, 4) appears on each selected card in selection order
- [ ] Counter below the grid shows **"Select 3 more"** after clicking 1 card
- [ ] Counter shows **"Select 2 more"** after clicking 2 cards
- [ ] Counter shows **"Select 1 more"** after clicking 3 cards
- [ ] Counter turns **green** and shows **"4 of 4 selected ✓"** after clicking 4 cards
- [ ] Clicking a 5th card: the earliest-selected card deselects automatically (count stays at 4)
- [ ] **Generate Prompts** button turns **amber/gold** when exactly 4 angles are selected
- [ ] **Reset** button in the top-right clears angle selections and the note field
- [ ] After Reset, Object type / Size / Placement etc. are still set (not cleared)
- [ ] **Refresh the page** — parameter selections and angle selections are still there

---

## Phase 3 — Prompt Generation & Copy

- [ ] With 4 angles selected, click **Generate Prompts** — 4 prompt blocks appear instantly (no loading spinner)
- [ ] Each block has a header showing "Prompt N — [Angle Name]"
- [ ] The prompt text is readable (not garbled, not empty)
- [ ] Prompt text contains the correct lighting description for the Time of day you selected
- [ ] Prompt text contains the correct placement for the Placement you selected
- [ ] Click **Copy** under Prompt 1 — button briefly shows **"Copied ✓"** then reverts
- [ ] Open a text editor (Notes, TextEdit, etc.), paste — the full prompt text is there
- [ ] Click **Copy all 4 prompts** — paste into a text editor — all 4 prompts are there, separated by divider lines with "PROMPT 1 —", "PROMPT 2 —" etc.
- [ ] Change **Time of day** to a different option, click Generate again — the lighting line in the prompts updates
- [ ] Add text to the **Additional note** field, generate — the note appears as the last line of each prompt
- [ ] Click **Reset** — prompts disappear and the placeholder text returns
- [ ] Refresh the page — parameter selections persist; prompts do not need to persist

---

## Phase 4 — Image Annotation Tool

### Photo upload

- [ ] At the top of the left panel you see an **"Upload space photo"** area with a dashed border
- [ ] Clicking it opens your file picker — select any photo from your computer (JPG or PNG)
- [ ] After selecting a photo, the upload area disappears and is replaced by the annotation canvas showing your photo
- [ ] A small **"Remove photo"** link appears in the top-right corner of the photo section
- [ ] Clicking **"Remove photo"** hides the canvas and brings back the upload area
- [ ] Drag a photo file directly onto the upload area — it loads the same as clicking

### Canvas appears correctly

- [ ] The canvas matches the shape (aspect ratio) of your photo — a tall photo produces a tall canvas, a wide photo produces a wide canvas
- [ ] The photo is fully visible inside the canvas — not cropped or distorted
- [ ] Two toggle buttons appear above the canvas: **"Brush mask"** (blue when active) and **"Placement line"** (red when active)
- [ ] **"Brush mask"** is the default active mode

### Brush mask mode

- [ ] With Brush mask selected, a **brush size dropdown** (Small / Medium / Large) and an **"Eraser"** button appear
- [ ] Click and drag on the photo — a semi-transparent blue area appears where you paint
- [ ] The photo is still visible underneath the blue overlay — it is not completely covered
- [ ] Switching to Large brush and painting again produces a noticeably thicker stroke
- [ ] Click **"Eraser"** — the button turns amber to confirm it is active
- [ ] Paint over a previously painted area — the blue overlay is removed where you drag
- [ ] Click **"Eraser"** again — it turns off
- [ ] A **"Clear"** button appears once you have painted anything — clicking it removes all brush strokes instantly
- [ ] After clearing, painting again works normally

### Placement line mode

- [ ] Click **"Placement line"** — the mode switches and the status text says *"Click to set the start point"*
- [ ] Click once anywhere on the photo — the status text changes to *"Click to set the end point"*
- [ ] Click a second point elsewhere — a **red line** appears connecting the two points, with a circular handle at each end
- [ ] The status text now says *"Drag the red handles to adjust"*
- [ ] Drag either circular handle — the line updates in real time as you drag
- [ ] A **"Clear"** button appears — clicking it removes the line entirely
- [ ] After clearing, clicking twice again draws a new line

### Both modes independent

- [ ] Paint a brush area, then switch to Placement line and draw a line — both the blue overlay and the red line are visible at the same time
- [ ] In Brush mode, click **"Clear"** — only the brush strokes are removed; the red line remains untouched
- [ ] In Line mode, click **"Clear"** — only the line is removed; the brush overlay remains untouched

### Download annotated photo

- [ ] With any annotation drawn, a **"Download annotated photo"** button appears below the canvas
- [ ] With no annotations at all, the download button is hidden
- [ ] Click **"Download annotated photo"** — your browser downloads a file named **`space-annotated.png`**
- [ ] Open the downloaded file — it shows your original space photo with the annotations drawn on top (blue overlay and/or red line, matching what you see on screen)
- [ ] The downloaded image is at the original photo's full resolution — not a small screenshot

### Prompt text updates based on annotations

*For these checks: upload a photo, annotate it, select 4 angles, and click Generate Prompts.*

- [ ] **No annotations:** generate prompts with no brush or line drawn — the prompts end after "No text, watermarks, captions, or borders" (or your note if you added one). No placement reference sentence appears.
- [ ] **Brush only:** paint a brush area, generate — each prompt ends with: *"Placement reference: a highlighted region is marked on the uploaded space image…"*
- [ ] **Line only:** draw a placement line, generate — each prompt ends with: *"Placement reference: a line is marked on the uploaded space image indicating the rear bottom edge…"*
- [ ] **Both tools used:** draw a line AND paint a brush area, generate — both sentences appear at the end of each prompt, line sentence first, brush sentence second
- [ ] Click **Clear** on the brush strokes, generate again — only the line sentence remains in the prompts (brush sentence disappears)

### Annotations survive a page refresh

- [ ] Paint some brush strokes and draw a placement line
- [ ] Refresh the page (Cmd+R / F5)
- [ ] Upload the same photo again (the photo itself is not saved — you need to re-upload it)
- [ ] The brush strokes and placement line reappear on the canvas immediately after uploading

### Reset clears everything

- [ ] Annotate the photo and generate prompts, then click **Reset** in the top bar
- [ ] The photo is removed, the canvas disappears, all annotations are gone
- [ ] The parameter cards (Object type, Size, etc.) keep their last values

---

## Build Check

Run in terminal (one-time):

```
npm run build
```

- [ ] Build completes with no errors
- [ ] A `dist/` folder is created in the project directory
