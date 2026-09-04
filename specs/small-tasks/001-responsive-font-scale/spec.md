# Task: Responsive font scale for Windows display scaling

## Goal
Users on Windows 125%/150% display scaling see the UI as "zoomed in" and must manually
zoom out to ~75% to make it usable. Fix by scaling the root font size down at the correct
logical viewport widths so rem-based Tailwind layout shrinks proportionally.

## Requirements
- At logical viewport ≤ 1600px: root font-size = 14px (catches 1920px @ 125% scaling = 1536px logical)
- At logical viewport ≤ 1280px: root font-size = 13px (catches 1920px @ 150% scaling = 1280px logical)
- No change on viewports > 1600px (unaffected for users at 100% scaling on 1920px+)
- Must not break mobile (< lg) — mobile already has its own layout

## Acceptance Criteria
- [x] On a 1920px screen at 125% Windows scaling the app fits without needing manual zoom
- [x] On a 1920px screen at 100% scaling nothing changes visually
- [x] No new dependencies introduced

## Files Changed
- `app/globals.css` — updated two `@media` breakpoint rules on `html` font-size
