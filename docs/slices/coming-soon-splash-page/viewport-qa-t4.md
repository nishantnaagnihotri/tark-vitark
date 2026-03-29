Viewport QA for Responsive Layout (T4)

## Manual Test Protocol

### 1. Desktop (1280px)
- [ ] Open `index.html` at 1280px width in browser
- [ ] Confirm: No horizontal scroll, no overflow
- [ ] Confirm: All content visible, centered, visually balanced
- [ ] Confirm: No layout breakage, text readable, no overlap

### 2. Mobile (375px)
- [ ] Open `index.html` at 375px width in browser or device emulator
- [ ] Confirm: No horizontal scroll, no overflow
- [ ] Confirm: All content visible, readable, not clipped
- [ ] Confirm: No layout breakage, text fits, no overlap

### 3. General
- [ ] No JS, no external assets required
- [ ] Visual style matches "colorful, exciting" intent

---

**Result:**
- [ ] Pass all above for T4 acceptance
- [ ] If any fail, note details and required fix
