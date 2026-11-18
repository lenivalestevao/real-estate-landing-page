# Meridian Realty — Real Estate Landing Page

A free, responsive real estate agency landing page template built with plain HTML5, CSS3 and JavaScript — no frameworks, no build step. A premium, trustworthy design ready to adapt for any realty or property-listing site.

**[Live demo](https://lenivalestevao.github.io/real-estate-landing-page/)**

## Features

- Sticky header with mobile off-canvas navigation
- Hero section with a property search bar (location, type, max price)
- Animated statistics counter (properties sold, years of experience, clients, cities) that triggers on scroll
- Featured properties grid with sale/rent badges, beds/baths/sqft, and a save-to-favorites toggle
- "Why choose us" feature grid
- Agent profile cards with star ratings
- Client testimonials with star ratings
- Contact call-to-action with a working form and confirmation message
- Fully responsive down to small mobile screens
- Zero dependencies — just HTML, CSS and vanilla JavaScript

## Using it as a template

Clone this repo, download the ZIP, or copy `index.html`, `style.css` and `script.js` into your own project. The full color palette (a navy + gold premium real estate look) lives in CSS custom properties at the top of `style.css`:

```css
:root {
  --navy: #0f1f3d;
  --gold: #c9a227;
}
```

Properties, agents, testimonials and the stats counters are all rendered from plain data arrays at the top of `script.js`, so adding your own listings, team members or reviews only takes editing one array — no HTML editing required.

## Project structure

```
index.html   Markup for the landing page layout
style.css    All styling, including the mobile breakpoints
script.js    Listings, agents, testimonials, animated stats and forms
```

## License

MIT — use it however you like, personal or commercial.
