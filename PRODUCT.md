# Product

## Register

product

## Users

Self-coached lifters and recreational athletes who track their own training, nutrition, sleep and body composition, on a phone, usually one-handed, between sets in a gym or standing in a kitchen. They are mid-task when they open the app: logging a set, checking what they lifted last time, seeing how far from today's protein target they are. They are not browsing; they want the number and the next action, then they put the phone down.

A second mode is the evening review: a few minutes on the sofa looking at the week, the trend, and what the coach says about it.

## Product Purpose

AthleteOS holds the whole picture in one place so the coaching it gives actually fits: workouts, meals, water, sleep and weight feed one model of the athlete, and the Coach (a model behind a server-owned prompt) answers from that model rather than from generic advice. Free tier covers logging and a daily allowance of Coach messages; Pro removes the limits. Success is a person who logs consistently because logging is fast, and who trusts the numbers enough to act on them.

## Brand Personality

Direct, grounded, expert. The voice is a coach who has read your log and tells you plainly what it says: specific figures, named lifts, no warm-up praise, no sci-fi vocabulary. Authority comes from being right about your own data, not from sounding technical. Confidence, not hype; encouragement is a stated fact ("third session at that load") rather than a cheer.

## Anti-references

- The "AI command console" aesthetic: diagnostics panels, "System: Operational", "engine calibrations", "distribution matrix", status LEDs. It reads as a prop, and it makes a fitness app sound like a spaceship.
- Generic SaaS dashboard scaffolding: the hero metric with a gradient accent, identical icon-heading-text card grids, uppercase tracked eyebrows over every section.
- Neon as wallpaper: bright accents on borders, glows and decoration until they no longer signal anything.
- Chat as decoration: glassy bubbles, floating pill inputs, sparkle icons, icon-chip prompt rows. The Coach is a plain conversation: flat bordered messages, a bordered message box, a few starter questions written as sentences.
- Interrogation onboarding: a dozen single-question screens before the person has logged anything.
- Empty screens that are just blank: a chart frame with nothing in it, a wall of zeros on first open.

## Design Principles

1. **The number, then the action.** Every screen leads with the figure the athlete came for and the one thing to do next. Decoration never sits between them.
2. **Earned familiarity.** Standard controls, standard patterns, the same button in the same place on every tab. Surprise is spent on data moments, not on chrome.
3. **The accent means "act here" or "this is the selection".** One muted slate blue marks primary actions and the current selection; four muted signal colours (forest, clay, slate, plum) mark the training, fuel, water and sleep data and nothing else. Everything else is charcoal on white, or light slate on dark slate. No neon, no glow, no gradients.
4. **Empty is a starting line, not a void.** A screen with no data yet shows what will appear there and how to make the first entry.
5. **Say what the data says.** Copy names the lift, the load, the gap to target. No buzzwords, no restated headings, no cheerleading.

## Accessibility & Inclusion

WCAG 2.2 AA as the floor: body text at 4.5:1 or better against its surface (the dark theme's muted slate must be checked, not assumed), large text at 3:1, visible focus indicators, 44px minimum touch targets since this is used one-handed mid-set. Every animation has a `prefers-reduced-motion` alternative. Signal colours (volt, orange, cyan, violet) are never the only carrier of meaning; a label or icon accompanies them.
