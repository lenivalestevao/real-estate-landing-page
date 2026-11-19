/* Meridian Realty: vanilla JavaScript, no dependencies.
   Every page is rendered in the browser and routed with the URL hash
   (#/properties, #/property/3, #/mortgage ...), so it runs on any static host.
   Saved properties and tour requests are kept in localStorage. */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------- Storage (falls back to memory if blocked) ---------- */
  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Icons ---------- */
  const PATHS = {
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'
  };
  const icon = (n, s) => `<svg class="i" width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n] || ''}</svg>`;
  const hydrate = (root) => $$('[data-icon]', root).forEach((el) => { if (!el.firstChild) el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 22); });

  /* ---------- Demo data (replace with your API) ---------- */
  const LOCS = [
    { name: 'Downtown', emoji: '🌆', hue: 215, ppsf: 330, blurb: 'Walkable streets, restaurants and the city skyline.', tags: ['Walkable', 'Nightlife', 'Transit'] },
    { name: 'Riverside', emoji: '🌉', hue: 195, ppsf: 300, blurb: 'Waterfront paths, lofts and weekend markets.', tags: ['Waterfront', 'Lofts', 'Parks'] },
    { name: 'Hillcrest', emoji: '🌄', hue: 150, ppsf: 290, blurb: 'Quiet streets with large homes and great schools.', tags: ['Schools', 'Quiet', 'Family'] },
    { name: 'Lakeside', emoji: '🏞️', hue: 175, ppsf: 260, blurb: 'Lake views, trails and modern condos.', tags: ['Lake', 'Trails', 'Modern'] },
    { name: 'Old Town', emoji: '🏛️', hue: 30, ppsf: 240, blurb: 'Historic charm, cafes and tree-lined lanes.', tags: ['Historic', 'Cafes', 'Charming'] }
  ];
  const TYPES = ['House', 'Apartment', 'Condo', 'Townhouse'];
  const P = [
    { id: 1, icon: '🏡', status: 'sale', price: 485000, title: 'Modern Family Home', address: '214 Maple Street', loc: 'Downtown', type: 'House', beds: 4, baths: 3, sqft: 2450, year: 2018, agent: 1, featured: true },
    { id: 2, icon: '🏙️', status: 'rent', price: 2200, title: 'Riverside Loft Apartment', address: '88 River Walk', loc: 'Riverside', type: 'Apartment', beds: 2, baths: 2, sqft: 1180, year: 2015, agent: 3, featured: true },
    { id: 3, icon: '🏠', status: 'sale', price: 720000, title: 'Hillcrest Family Villa', address: '45 Summit Drive', loc: 'Hillcrest', type: 'House', beds: 5, baths: 4, sqft: 3200, year: 2020, agent: 1, featured: true },
    { id: 4, icon: '🏢', status: 'sale', price: 310000, title: 'Lakeside Modern Condo', address: '19 Shoreline Ave', loc: 'Lakeside', type: 'Condo', beds: 2, baths: 2, sqft: 1050, year: 2019, agent: 2, featured: true },
    { id: 5, icon: '🏘️', status: 'rent', price: 1850, title: 'Old Town Charm House', address: '7 Heritage Lane', loc: 'Old Town', type: 'House', beds: 3, baths: 2, sqft: 1620, year: 1962, agent: 3, featured: true },
    { id: 6, icon: '🏡', status: 'sale', price: 560000, title: 'Downtown Townhouse', address: '132 Court Street', loc: 'Downtown', type: 'Townhouse', beds: 3, baths: 3, sqft: 1980, year: 2017, agent: 2, featured: true },
    { id: 7, icon: '🏰', status: 'sale', price: 1250000, title: 'Sunset Ridge Estate', address: '3 Ridgeview Court', loc: 'Hillcrest', type: 'House', beds: 6, baths: 5, sqft: 4800, year: 2021, agent: 4 },
    { id: 8, icon: '🌇', status: 'rent', price: 1450, title: 'Harbor View Studio', address: '12 Dockside Way', loc: 'Riverside', type: 'Apartment', beds: 1, baths: 1, sqft: 640, year: 2012, agent: 3 },
    { id: 9, icon: '🏘️', status: 'sale', price: 395000, title: 'Lakefront Townhome', address: '56 Pier Road', loc: 'Lakeside', type: 'Townhouse', beds: 3, baths: 2, sqft: 1750, year: 2016, agent: 2 },
    { id: 10, icon: '🏢', status: 'sale', price: 275000, title: 'Heritage Brick Condo', address: '21 Cobble Street', loc: 'Old Town', type: 'Condo', beds: 2, baths: 1, sqft: 980, year: 1998, agent: 1 },
    { id: 11, icon: '🌆', status: 'sale', price: 890000, title: 'Skyline Penthouse', address: '900 Grand Avenue', loc: 'Downtown', type: 'Condo', beds: 3, baths: 3, sqft: 2100, year: 2022, agent: 4 },
    { id: 12, icon: '🏡', status: 'rent', price: 1650, title: 'Cozy Riverside Cottage', address: '31 Willow Bend', loc: 'Riverside', type: 'House', beds: 2, baths: 1, sqft: 1100, year: 1985, agent: 3 }
  ];
  const AGENTS = [
    { id: 1, name: 'Sofia Martins', role: 'Senior Listing Agent', rating: 5, reviews: 142, hue: 215, phone: '(555) 234-5601', email: 'sofia@meridianrealty.example', langs: 'English, Portuguese, Spanish', sold: 214, spec: ['Family homes', 'Hillcrest', 'First-time sellers'], bio: 'Sofia has helped more than 200 families sell their homes at the right price. She knows every street in Hillcrest and Downtown and negotiates calmly and clearly.' },
    { id: 2, name: 'Marcus Lee', role: "Buyer's Agent", rating: 4.8, reviews: 98, hue: 160, phone: '(555) 234-5602', email: 'marcus@meridianrealty.example', langs: 'English, Korean', sold: 167, spec: ['First-time buyers', 'Condos', 'Lakeside'], bio: 'Marcus guides first-time buyers from pre-approval to the day they get the keys, and explains each step in plain language.' },
    { id: 3, name: 'Elena Rodrigues', role: 'Rental Specialist', rating: 4.9, reviews: 76, hue: 340, phone: '(555) 234-5603', email: 'elena@meridianrealty.example', langs: 'English, Spanish', sold: 310, spec: ['Rentals', 'Riverside', 'Relocation'], bio: 'Elena matches tenants and landlords quickly. She handles tours, applications and lease questions so moves stay stress free.' },
    { id: 4, name: 'Daniel Brooks', role: 'Luxury Advisor', rating: 4.7, reviews: 64, hue: 35, phone: '(555) 234-5604', email: 'daniel@meridianrealty.example', langs: 'English, French', sold: 89, spec: ['Luxury homes', 'Penthouses', 'Investors'], bio: 'Daniel focuses on premium listings and investment properties, with careful pricing and discreet marketing.' }
  ];
  const REVIEWS = [
    ['Ana & Pedro C.', 'Bought our first home', 'Marcus explained every step and we closed two weeks early. We could not be happier with our new home.'],
    ['Jordan W.', 'Sold a house in Hillcrest', 'Sofia priced the house perfectly and we had three offers in the first weekend. Truly professional.'],
    ['Maya T.', 'Rented a loft', 'Elena found me a loft in Riverside in four days. The tour and the paperwork were effortless.'],
    ['Richard & Lena K.', 'Moved from another city', 'Everything was clear from the first call. The virtual tours saved us two trips.'],
    ['Carlos M.', 'Investor', 'Daniel understands numbers and neighborhoods. His advice on my condo purchase was spot on.']
  ];
  const FEATS = ['Central air conditioning', 'Hardwood floors', 'Updated kitchen', 'Garage parking', 'Private outdoor space', 'Smart thermostat', 'Walk-in closets', 'In-unit laundry', 'Energy efficient windows', 'Storage room', 'Pet friendly', 'Fiber internet'];
  const FAQ = [
    ['Buying', 'How do I start buying a home?', 'Browse our listings, save the ones you like and schedule a tour. An agent will help you with pre-approval, offers and closing.'],
    ['Buying', 'How much down payment do I need?', 'Many loans start at 3% to 5%, and 20% avoids mortgage insurance. Use our mortgage calculator to compare options.'],
    ['Selling', 'How do you set the price of my home?', 'We compare recent sales nearby, the condition of the home and market demand. Try the estimate on the Sell page for a first idea.'],
    ['Selling', 'What does it cost to sell with Meridian?', 'We explain every fee before you sign, with no hidden costs. Contact us for a no-obligation consultation.'],
    ['Renting', 'How do I apply for a rental?', 'Schedule a tour, then send the application to the listing agent. Most applications get an answer within two business days.'],
    ['Tours', 'Can I tour a property online?', 'Yes. Choose in-person or video when you schedule a tour and an agent will confirm by email.']
  ];

  /* ---------- Helpers ---------- */
  const locOf = (p) => LOCS.find((l) => l.name === p.loc);
  const agentOf = (p) => AGENTS.find((a) => a.id === p.agent);
  const byId = (id) => P.find((p) => p.id === Number(id));
  const shade = (hue) => `linear-gradient(135deg,hsl(${hue} 45% 28%),hsl(${(hue + 25) % 360} 50% 42%))`;
  const priceHTML = (p) => p.status === 'rent' ? `${money(p.price)}<small>/mo</small>` : money(p.price);
  const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('');
  const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
  const featsOf = (p) => [0, 1, 2, 3, 4, 5].map((k) => FEATS[(p.id * 3 + k * 2) % FEATS.length]).filter((v, i, a) => a.indexOf(v) === i);
  const descOf = (p) => `${p.title} is a ${p.beds}-bedroom ${p.type.toLowerCase()} in ${p.loc}, with ${p.baths} bathroom${p.baths > 1 ? 's' : ''} and ${p.sqft.toLocaleString('en-US')} sq ft of living space. Built in ${p.year}, it offers bright rooms, practical storage and easy access to shops, schools and transit. Schedule a tour to see it in person or by video.`;

  /* ---------- State ---------- */
  const DEF = { q: '', loc: 'Any', type: 'Any', status: 'Any', max: 0, beds: 0, sort: 'featured' };
  const state = { fav: store.get('mer-fav', []), tours: store.get('mer-tours', []), f: { ...DEF } };
  const saveAll = () => { store.set('mer-fav', state.fav); store.set('mer-tours', state.tours); };

  function filtered() {
    const f = state.f, q = f.q.trim().toLowerCase();
    let list = P.filter((p) => (f.loc === 'Any' || p.loc === f.loc) && (f.type === 'Any' || p.type === f.type) && (f.status === 'Any' || p.status === f.status) && (!f.max || p.status === 'rent' || p.price <= f.max) && p.beds >= f.beds && (!q || (p.title + ' ' + p.address + ' ' + p.loc + ' ' + p.type).toLowerCase().includes(q)));
    const sorts = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, beds: (a, b) => b.beds - a.beds, sqft: (a, b) => b.sqft - a.sqft, newest: (a, b) => b.year - a.year };
    if (sorts[f.sort]) list = list.slice().sort(sorts[f.sort]);
    return list;
  }

  /* ---------- Shared view pieces ---------- */
  function card(p) {
    const on = state.fav.includes(p.id);
    return `
    <article class="pcard">
      <a class="pimg" href="#/property/${p.id}" style="background:${shade(locOf(p).hue)}" aria-label="${esc(p.title)}">${p.icon}<span class="badge ${p.status === 'rent' ? 'rent' : ''}">For ${p.status === 'rent' ? 'Rent' : 'Sale'}</span></a>
      <button class="fav ${on ? 'on' : ''}" data-action="fav" data-id="${p.id}" aria-label="Save property">${icon('heart', 18)}</button>
      <div class="pinfo">
        <div class="price">${priceHTML(p)}</div>
        <a class="ptitle" href="#/property/${p.id}">${p.title}</a>
        <div class="addr">${p.address}, ${p.loc}</div>
        <div class="meta"><span>🛏️ ${p.beds} bd</span><span>🚿 ${p.baths} ba</span><span>📏 ${p.sqft.toLocaleString('en-US')} sqft</span></div>
      </div>
    </article>`;
  }
  const agentCard = (a) => `<a class="acard" href="#/agent/${a.id}"><div class="avatar" style="background:${shade(a.hue)}">${initials(a.name)}</div><h3>${a.name}</h3><p class="muted">${a.role}</p><p>${stars(a.rating)} <small class="muted">${a.rating} (${a.reviews})</small></p></a>`;
  const reviewCard = (r, i) => `<figure class="review">${stars(5)}<blockquote>${r[2]}</blockquote><figcaption><span class="avatar" style="background:${shade(i * 70 + 200)}">${initials(r[0])}</span><span>${r[0]}<small>${r[1]}</small></span></figcaption></figure>`;
  const carBtns = `<div class="car-btns"><button data-action="car" data-d="-1" aria-label="Previous">${icon('arrow', 18)}</button><button data-action="car" data-d="1" aria-label="Next">${icon('arrow', 18)}</button></div>`;
  const head = (title, sub, crumbs) => `<div class="page-head"><div class="container"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${(crumbs || []).map((c) => ' / ' + c).join('')}</nav><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></div>`;
  const opts = (list, cur, any) => ((any ? [any] : []).concat(list)).map((v) => `<option ${v === cur ? 'selected' : ''}>${v}</option>`).join('');

  /* ---------- Pages ---------- */
  const pages = {};

  pages.home = () => {
    const feats = [['🧑‍💼', 'Expert Agents', 'Local specialists with deep neighborhood knowledge.'], ['✅', 'Verified Listings', 'Every property is inspected and confirmed before listing.'], ['💰', 'Best Price Guarantee', 'Transparent pricing with no hidden fees, ever.'], ['💬', '24/7 Support', 'Our team is one call or message away, any time.']]
      .map((f) => `<div class="feature"><span class="ico">${f[0]}</span><h3>${f[1]}</h3><p>${f[2]}</p></div>`).join('');
    return `
    <section class="hero"><div class="container hero-inner">
      <span class="pill">Trusted by 12,000+ Families</span>
      <h1>Find the home<br>that finds you.</h1>
      <p>Browse curated listings across the city's best neighborhoods, backed by agents who know every street.</p>
    </div></section>
    <div class="container">
      <form class="search-card" data-form="hero-search">
        <div class="field"><label>Location</label><select name="loc">${opts(LOCS.map((l) => l.name), 'Any', 'Any location')}</select></div>
        <div class="field"><label>Property Type</label><select name="type">${opts(TYPES, 'Any', 'Any type')}</select></div>
        <div class="field"><label>Max Price</label><select name="max"><option value="0">No limit</option><option value="200000">$200,000</option><option value="400000">$400,000</option><option value="600000">$600,000</option><option value="1000000">$1,000,000+</option></select></div>
        <button class="btn btn-gold btn-lg">Search</button>
      </form>
      <div class="stats-bar" id="statsBar">
        <div><b data-count="1280" data-suffix="+">0</b><span>Properties Sold</span></div>
        <div><b data-count="15">0</b><span>Years of Experience</span></div>
        <div><b data-count="9400" data-suffix="+">0</b><span>Happy Clients</span></div>
        <div><b data-count="24">0</b><span>Cities Covered</span></div>
      </div>
    </div>
    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Handpicked for You</span><h2>Featured Properties</h2><p>A selection of our most sought-after listings this month</p></div>${carBtns}</div>
      <div class="carousel">${P.filter((p) => p.featured).map(card).join('')}</div>
      <p class="center" style="margin-top:12px"><a class="btn btn-outline" href="#/properties">View all properties</a></p>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head center"><div><span class="eyebrow">Why Meridian</span><h2>Real estate, done right</h2><p>Everything you need for a smooth, confident move</p></div></div>
      <div class="features">${feats}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Explore</span><h2>Browse by neighborhood</h2><p>Find the part of town that fits your life</p></div><a class="link-more" href="#/neighborhoods">All neighborhoods ${icon('arrow', 16)}</a></div>
      <div class="hoods">${LOCS.slice(0, 3).map(hood).join('')}</div>
    </div></section>
    <section class="section alt"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Meet the Team</span><h2>Our Top Agents</h2><p>Local experts ready to guide you home</p></div>${carBtns}</div>
      <div class="carousel quad">${AGENTS.map(agentCard).join('')}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Client Stories</span><h2>What Our Clients Say</h2></div>${carBtns}</div>
      <div class="carousel">${REVIEWS.map(reviewCard).join('')}</div>
    </div></section>
    <section class="section tight"><div class="container"><div class="cta">
      <h2>Ready to find your new home?</h2>
      <p>Tell us what you're looking for and a Meridian agent will reach out within one business day.</p>
      <a class="btn btn-gold btn-lg" href="#/contact">Get Started</a>
    </div></div></section>`;
  };

  const hood = (l) => `<a class="hood" href="#/properties/${l.name}"><div class="pimg" style="background:${shade(l.hue)}">${l.emoji}</div><div class="pinfo"><h3>${l.name}</h3><p>${l.blurb}</p><div class="tags">${l.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div><p style="margin-top:10px"><b>${P.filter((p) => p.loc === l.name).length}</b> listings</p></div></a>`;

  function resultsHTML() {
    const list = filtered();
    return `<div class="results-bar"><b>${list.length} propert${list.length === 1 ? 'y' : 'ies'} found</b><span class="muted">Rent prices are monthly. The max price filter applies to homes for sale.</span></div>${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty"><span class="emoji-xl">🔎</span><h3>No properties match</h3><p>Try different filters or clear them.</p><button class="btn btn-navy" data-action="clear-filters">Clear filters</button></div>`}`;
  }
  pages.properties = (a, b) => {
    if (a !== undefined) {
      state.f = { ...DEF };
      if (a === 'type' && TYPES.includes(b)) state.f.type = b;
      else if (a === 'status' && (b === 'sale' || b === 'rent')) state.f.status = b;
      else if (LOCS.some((l) => l.name === decodeURIComponent(a))) state.f.loc = decodeURIComponent(a);
    }
    const f = state.f;
    const maxOpts = [[0, 'No limit'], [200000, '$200,000'], [400000, '$400,000'], [600000, '$600,000'], [1000000, '$1,000,000']].map((o) => `<option value="${o[0]}" ${f.max === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('');
    const bedOpts = [[0, 'Any'], [1, '1+'], [2, '2+'], [3, '3+'], [4, '4+']].map((o) => `<option value="${o[0]}" ${f.beds === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('');
    const sortOpts = [['featured', 'Featured'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['beds', 'Most bedrooms'], ['sqft', 'Largest'], ['newest', 'Newest built']].map((o) => `<option value="${o[0]}" ${f.sort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('');
    return `
    ${head('Properties', 'Homes for sale and rent across the best neighborhoods.', ['Properties'])}
    <div class="container">
      <div class="filter-bar">
        <div class="field span-all"><label>Search</label><input type="search" data-filter="q" value="${esc(f.q)}" placeholder="Address, title or area"></div>
        <div class="field"><label>Location</label><select data-filter="loc">${opts(LOCS.map((l) => l.name), f.loc, 'Any')}</select></div>
        <div class="field"><label>Type</label><select data-filter="type">${opts(TYPES, f.type, 'Any')}</select></div>
        <div class="field"><label>Status</label><select data-filter="status"><option value="Any" ${f.status === 'Any' ? 'selected' : ''}>Any</option><option value="sale" ${f.status === 'sale' ? 'selected' : ''}>For Sale</option><option value="rent" ${f.status === 'rent' ? 'selected' : ''}>For Rent</option></select></div>
        <div class="field"><label>Max price</label><select data-filter="max">${maxOpts}</select></div>
        <div class="field"><label>Bedrooms</label><select data-filter="beds">${bedOpts}</select></div>
      </div>
      <div class="results-bar" style="margin-bottom:0"><span></span><label class="field" style="flex-direction:row;align-items:center;gap:10px"><span class="muted">Sort by</span><select data-filter="sort" style="width:auto">${sortOpts}</select></label></div>
      <div id="results">${resultsHTML()}</div>
    </div>
    <div style="height:64px"></div>`;
  };

  pages.property = (id) => {
    const p = byId(id);
    if (!p) return pages.notfound();
    const l = locOf(p), a = agentOf(p), on = state.fav.includes(p.id);
    const sim = P.filter((x) => x.id !== p.id && (x.loc === p.loc || x.type === p.type)).slice(0, 3);
    const est = p.status === 'sale' ? `<div class="estimate"><small class="muted">Estimated monthly payment</small><br><b>${money(payment(p.price, 20, 6.5, 30))}</b><small class="muted"> /mo with 20% down at 6.5%</small><p style="margin-top:8px"><a class="link-more" href="#/mortgage/${p.id}">Open the calculator ${icon('arrow', 16)}</a></p></div>` : '';
    return `
    ${head(p.title, p.address + ', ' + p.loc, ['<a href="#/properties">Properties</a>', p.title])}
    <section class="section tight"><div class="container detail">
      <div>
        <div class="gallery-main" style="background:${shade(l.hue)}">${p.icon}<span class="badge ${p.status === 'rent' ? 'rent' : ''}">For ${p.status === 'rent' ? 'Rent' : 'Sale'}</span></div>
        <div class="thumbs">${[0, 1, 2, 3].map((n) => `<div class="thumb ${n === 0 ? 'on' : ''}" style="background:${shade((l.hue + n * 22) % 360)}">${['🛋️', '🍳', '🛁', '🌳'][n]}</div>`).join('')}</div>
        <div class="d-head"><div><h2 style="font-size:24px">${p.title}</h2><p class="muted">📍 ${p.address}, ${p.loc}</p></div><div class="d-price">${priceHTML(p)}</div></div>
        <div class="specs"><div class="spec"><b>${p.beds}</b><span>Bedrooms</span></div><div class="spec"><b>${p.baths}</b><span>Bathrooms</span></div><div class="spec"><b>${p.sqft.toLocaleString('en-US')}</b><span>Square feet</span></div><div class="spec"><b>${p.year}</b><span>Year built</span></div></div>
        <div class="box"><h3>About this property</h3><p>${descOf(p)}</p></div>
        <div class="box"><h3>Features</h3><ul class="feat-list">${featsOf(p).map((f) => `<li>${icon('check', 18)} ${f}</li>`).join('')}</ul></div>
        <div class="box"><h3>Location</h3><div class="map"><span class="pin">📍</span></div><p class="muted" style="margin-top:10px">Sample map. Connect a map provider to show the real position.</p></div>
      </div>
      <aside class="sticky">
        <div class="box">
          <div class="agent-mini"><div class="avatar" style="background:${shade(a.hue)}">${initials(a.name)}</div><div><b><a href="#/agent/${a.id}">${a.name}</a></b><br><small class="muted">${a.role}</small></div></div>
          <a class="btn btn-gold btn-block" href="#/tour/${p.id}">Schedule a Tour</a>
          <button class="btn btn-light btn-block ${on ? 'saved' : ''}" data-action="fav" data-id="${p.id}" style="margin-top:10px">${icon('heart', 18)} ${on ? 'Saved' : 'Save property'}</button>
          ${est}
        </div>
        <form class="box stack" data-form="inquiry"><h3>Ask about this home</h3>
          <div class="field"><label>Name</label><input required placeholder="Jane Doe"></div>
          <div class="field"><label>Email</label><input type="email" required placeholder="you@example.com"></div>
          <div class="field"><label>Message</label><textarea rows="3" required>I am interested in ${esc(p.title)}.</textarea></div>
          <button class="btn btn-navy btn-block">Send message</button></form>
      </aside>
    </div></section>
    ${sim.length ? `<section class="section alt"><div class="container"><div class="section-head"><div><h2>Similar properties</h2></div></div><div class="grid">${sim.map(card).join('')}</div></div></section>` : ''}`;
  };

  pages.agents = () => `
    ${head('Our agents', 'Local experts ready to guide you home.', ['Agents'])}
    <section class="section tight"><div class="container"><div class="grid four">${AGENTS.map(agentCard).join('')}</div></div></section>
    <section class="section tight"><div class="container"><div class="cta"><h2>Want to join our team?</h2><p>We are always looking for people who love real estate and put clients first.</p><a class="btn btn-gold btn-lg" href="#/contact">Contact us</a></div></div></section>`;

  pages.agent = (id) => {
    const a = AGENTS.find((x) => x.id === Number(id));
    if (!a) return pages.notfound();
    const list = P.filter((p) => p.agent === a.id);
    return `
    ${head(a.name, a.role, ['<a href="#/agents">Agents</a>', a.name])}
    <section class="section tight"><div class="container two-col">
      <div>
        <div class="box" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div class="avatar lg" style="background:${shade(a.hue)};margin:0">${initials(a.name)}</div>
          <div><h2>${a.name}</h2><p class="muted">${a.role}</p><p>${stars(a.rating)} <small class="muted">${a.rating} · ${a.reviews} reviews · ${a.sold} homes closed</small></p><div class="tags">${a.spec.map((t) => `<span class="tag">${t}</span>`).join('')}</div></div></div>
        <div class="box"><h3>About ${a.name.split(' ')[0]}</h3><p>${a.bio}</p><p class="muted">Languages: ${a.langs}</p></div>
        <div style="margin-top:28px"><h2 style="margin-bottom:18px">Listings by ${a.name.split(' ')[0]}</h2><div class="grid two">${list.map(card).join('')}</div></div>
      </div>
      <aside class="sticky">
        <form class="box stack" data-form="inquiry"><h3>Contact ${a.name.split(' ')[0]}</h3>
          <div class="contact-row">${icon('phone', 20)}<div><b>Phone</b><small>${a.phone}</small></div></div>
          <div class="contact-row">${icon('mail', 20)}<div><b>Email</b><small>${a.email}</small></div></div>
          <div class="field"><label>Name</label><input required></div><div class="field"><label>Email</label><input type="email" required></div>
          <div class="field"><label>Message</label><textarea rows="3" required></textarea></div>
          <button class="btn btn-gold btn-block">Send message</button></form>
      </aside>
    </div></section>`;
  };

  pages.neighborhoods = () => `
    ${head('Neighborhoods', 'Find the part of town that fits your life.', ['Neighborhoods'])}
    <section class="section tight"><div class="container"><div class="hoods">${LOCS.map(hood).join('')}</div></div></section>`;

  /* Mortgage: monthly principal and interest */
  function payment(price, downPct, rate, years) {
    const loan = price * (1 - downPct / 100), r = rate / 100 / 12, n = years * 12;
    return r === 0 ? loan / n : loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  }
  pages.mortgage = (id) => {
    const p = id ? byId(id) : null;
    const price = p && p.status === 'sale' ? p.price : 485000;
    return `
    ${head('Mortgage calculator', 'Estimate your monthly payment before you make an offer.', ['Mortgage'])}
    <section class="section tight"><div class="container two-col">
      <div class="box stack" id="mortForm">
        <h3>Your numbers</h3>
        <div class="range-val"><span>Home price</span><span id="v-price"></span></div><input type="range" id="m-price" min="100000" max="1500000" step="5000" value="${price}">
        <div class="range-val"><span>Down payment</span><span id="v-down"></span></div><input type="range" id="m-down" min="0" max="50" step="1" value="20">
        <div class="range-val"><span>Interest rate</span><span id="v-rate"></span></div><input type="range" id="m-rate" min="2" max="10" step="0.1" value="6.5">
        <div class="range-val"><span>Loan term</span><span id="v-years"></span></div><input type="range" id="m-years" min="10" max="30" step="5" value="30">
        <p class="muted">Principal and interest only. Taxes, insurance and fees are not included. Estimates are for information only.</p>
      </div>
      <div class="result-card">
        <h3>Estimated monthly payment</h3><div class="big" id="r-pay"></div>
        <div class="bar"><i id="r-bar" style="width:50%"></i></div>
        <div class="legend"><span>Principal</span><span>Interest</span></div>
        <div class="row"><span>Loan amount</span><b id="r-loan"></b></div>
        <div class="row"><span>Down payment</span><b id="r-dp"></b></div>
        <div class="row"><span>Total interest</span><b id="r-int"></b></div>
        <div class="row" style="border:0"><span>Total paid</span><b id="r-total"></b></div>
        <a class="btn btn-gold btn-block" href="#/contact" style="margin-top:20px">Talk to a lender</a>
      </div>
    </div></section>`;
  };
  function mortgageCalc() {
    const g = (id) => Number($('#' + id).value);
    const price = g('m-price'), down = g('m-down'), rate = g('m-rate'), years = g('m-years');
    const pay = payment(price, down, rate, years), loan = price * (1 - down / 100), total = pay * years * 12, interest = total - loan;
    $('#v-price').textContent = money(price); $('#v-down').textContent = down + '% (' + money(price * down / 100) + ')';
    $('#v-rate').textContent = rate.toFixed(1) + '%'; $('#v-years').textContent = years + ' years';
    $('#r-pay').textContent = money(pay); $('#r-loan').textContent = money(loan); $('#r-dp').textContent = money(price * down / 100);
    $('#r-int').textContent = money(interest); $('#r-total').textContent = money(total);
    $('#r-bar').style.width = Math.round(loan / total * 100) + '%';
  }

  pages.sell = () => `
    ${head('Sell your home', 'Get a free estimate and talk to an agent who knows your neighborhood.', ['Sell'])}
    <section class="section tight"><div class="container two-col">
      <form class="box stack" data-form="sell"><h3>Tell us about your home</h3>
        <div class="field"><label>Address</label><input name="address" required placeholder="123 Main Street"></div>
        <div class="form-grid">
          <div class="field"><label>Neighborhood</label><select name="loc">${opts(LOCS.map((l) => l.name))}</select></div>
          <div class="field"><label>Property type</label><select name="type">${opts(TYPES)}</select></div>
          <div class="field"><label>Bedrooms</label><input name="beds" type="number" min="1" max="10" value="3"></div>
          <div class="field"><label>Square feet</label><input name="sqft" type="number" min="300" max="10000" value="1800" required></div>
          <div class="field"><label>Your name</label><input name="name" required></div>
          <div class="field"><label>Email</label><input name="email" type="email" required></div>
        </div>
        <button class="btn btn-gold btn-lg btn-block">Get my free estimate</button></form>
      <div>
        <div class="result-card" id="estimateCard"><h3>Estimated value</h3><div class="big" id="estimateVal">$ -</div><p style="color:#cbd5e1" id="estimateNote">Fill in the form to see a sample estimate. Demo only, based on average prices per square foot in each neighborhood.</p></div>
        <div class="box" style="margin-top:24px"><h3>How selling works</h3><div class="timeline"><div><b>1. Free consultation.</b> We review your home and goals.</div><div><b>2. Pricing and photos.</b> We set the price and market your home.</div><div><b>3. Tours and offers.</b> We manage showings and negotiate.</div><div><b>4. Closing.</b> We handle the paperwork until the keys change hands.</div></div></div>
      </div>
    </div></section>`;

  pages.favorites = () => {
    const list = state.fav.map(byId).filter(Boolean);
    return `${head('Saved properties', list.length + ' saved', ['Saved'])}<section class="section tight"><div class="container">${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty"><span class="emoji-xl">💛</span><h3>No saved properties yet</h3><p>Tap the heart on any listing to keep it here.</p><a class="btn btn-gold btn-lg" href="#/properties">Browse properties</a></div>`}</div></section>`;
  };

  pages.tour = (id) => {
    const sel = id ? byId(id) : null;
    const today = new Date().toISOString().slice(0, 10);
    return `
    ${head('Schedule a tour', 'Pick a day and an agent will confirm by email.', ['Tour'])}
    <section class="section tight"><div class="container two-col">
      <form class="box stack" data-form="tour"><h3>Tour details</h3>
        <div class="field"><label>Property</label><select name="property">${P.map((p) => `<option value="${p.id}" ${sel && sel.id === p.id ? 'selected' : ''}>${esc(p.title)} - ${esc(p.address)}</option>`).join('')}</select></div>
        <div class="form-grid">
          <div class="field"><label>Date</label><input name="date" type="date" required min="${today}"></div>
          <div class="field"><label>Time</label><select name="time"><option>9:00 AM</option><option>11:00 AM</option><option>1:00 PM</option><option>3:00 PM</option><option>5:00 PM</option></select></div>
          <div class="field"><label>Tour type</label><select name="kind"><option>In person</option><option>Video call</option></select></div>
          <div class="field"><label>Phone</label><input name="phone" type="tel" placeholder="(555) 000-0000"></div>
          <div class="field"><label>Name</label><input name="name" required></div>
          <div class="field"><label>Email</label><input name="email" type="email" required></div>
        </div>
        <div class="field"><label>Notes (optional)</label><textarea name="notes" rows="3"></textarea></div>
        <button class="btn btn-gold btn-lg btn-block">Request tour</button></form>
      <aside class="box"><h3>What to expect</h3><div class="timeline"><div><b>Confirmation.</b> An agent confirms within one business day.</div><div><b>The visit.</b> About 30 minutes, in person or by video.</div><div><b>No pressure.</b> Ask anything, no obligation.</div></div></aside>
    </div></section>`;
  };
  pages['tour-done'] = () => {
    const t = state.tours[0];
    if (!t) return pages.notfound();
    const p = byId(t.property);
    return `<section class="section"><div class="container narrow center"><div class="success-ico">${icon('check', 36)}</div><h1>Your tour request is in!</h1><p class="lead" style="margin-top:10px">Thanks, ${esc(t.name)}. We will confirm by email at ${esc(t.email)}.</p>
      <div class="box summary"><div class="r"><span>Property</span><b>${p ? esc(p.title) : ''}</b></div><div class="r"><span>Date</span><b>${esc(t.date)}</b></div><div class="r"><span>Time</span><b>${esc(t.time)}</b></div><div class="r" style="border:0"><span>Type</span><b>${esc(t.kind)}</b></div></div>
      <a class="btn btn-gold btn-lg" href="#/properties">Keep browsing</a></div></section>`;
  };

  pages.about = () => `
    ${head('About Meridian Realty', 'Helping families find the right home since 2010.', ['About'])}
    <section class="section"><div class="container about-grid">
      <div><span class="eyebrow">Our story</span><h2>A brokerage built on trust</h2><p class="lead">Meridian started with a small office and a simple promise: honest advice and clear pricing. Today our agents cover 24 cities and have helped thousands of families buy, sell and rent.</p><p class="lead">We keep our team local, our fees transparent and our communication fast.</p><p style="margin-top:20px"><a class="btn btn-navy" href="#/agents">Meet the team</a></p></div>
      <div class="timeline"><div><b>2010</b> · Meridian opens its first office.</div><div><b>2014</b> · 1,000 families helped.</div><div><b>2019</b> · Expanded to 24 cities.</div><div><b>2026</b> · Digital tours and instant estimates.</div></div>
    </div></section>
    <section class="section alt"><div class="container"><div class="section-head center"><div><h2>Our values</h2></div></div><div class="features" style="grid-template-columns:repeat(3,1fr)"><div class="feature"><span class="ico">🤝</span><h3>Client first</h3><p>Your goals set the plan, every time.</p></div><div class="feature"><span class="ico">🔍</span><h3>Transparency</h3><p>Clear fees and honest advice.</p></div><div class="feature"><span class="ico">🏘️</span><h3>Local knowledge</h3><p>Agents who live where they work.</p></div></div></div></section>`;

  pages.contact = () => `
    ${head('Contact us', 'A Meridian agent will reach out within one business day.', ['Contact'])}
    <section class="section tight"><div class="container two-col">
      <form class="box stack" data-form="inquiry"><h3>Send us a message</h3>
        <div class="form-grid"><div class="field"><label>Name</label><input required placeholder="Jane Doe"></div><div class="field"><label>Email</label><input type="email" required placeholder="you@example.com"></div></div>
        <div class="field"><label>I want to</label><select><option>Buy a home</option><option>Sell a home</option><option>Rent a home</option><option>Something else</option></select></div>
        <div class="field"><label>Message</label><textarea rows="5" required placeholder="Tell us what you are looking for"></textarea></div>
        <button class="btn btn-gold btn-lg">Send message</button></form>
      <aside class="box"><h3>Visit or call</h3>
        <div class="contact-row">${icon('pin', 20)}<div><b>Office</b><small>123 Meridian Ave, Suite 400</small></div></div>
        <div class="contact-row">${icon('phone', 20)}<div><b>Phone</b><small>(555) 234-5678</small></div></div>
        <div class="contact-row">${icon('mail', 20)}<div><b>Email</b><small>hello@meridianrealty.example</small></div></div>
        <div class="map" style="margin-top:12px"><span class="pin">📍</span></div><p class="muted" style="margin-top:10px">Sample details. Replace them with your own.</p></aside>
    </div></section>`;

  pages.faq = () => {
    const groups = [...new Set(FAQ.map((f) => f[0]))].map((g) => `<h3 class="faq-group">${g}</h3>${FAQ.filter((f) => f[0] === g).map((f) => `<details class="acc"><summary>${f[1]}</summary><p>${f[2]}</p></details>`).join('')}`).join('');
    return `${head('Frequently asked questions', 'Quick answers about buying, selling and renting.', ['FAQ'])}<section class="section tight"><div class="container narrow">${groups}<div class="box center" style="margin-top:32px"><h3>Still have questions?</h3><a class="btn btn-navy" href="#/contact">Contact us</a></div></div></section>`;
  };

  const legal = (title, body) => `${head(title, 'Sample text. Replace it with your own policy before going live.', [title])}<section class="section tight"><div class="container narrow box">${body}</div></section>`;
  pages.privacy = () => legal('Privacy policy', '<h3>What we collect</h3><p>This demo keeps saved properties and tour requests only in your own browser. Nothing is sent to a server.</p><h3>Your choices</h3><p>Clear your browser storage at any time to remove this data.</p>');
  pages.terms = () => legal('Terms of service', '<h3>Using this site</h3><p>This is a free template. Listings, prices and agents are fictional examples. Estimates are not financial advice.</p><h3>Equal housing</h3><p>Describe your real fair housing statement here.</p>');
  pages.notfound = () => `<section class="section"><div class="container narrow center"><div class="empty"><span class="emoji-xl">🧭</span><h1>Page not found</h1><p>The page you are looking for does not exist.</p><a class="btn btn-gold btn-lg" href="#/">Back to home</a></div></div></section>`;

  /* ---------- Router ---------- */
  const TITLES = { properties: 'Properties', property: 'Property', agents: 'Agents', agent: 'Agent', neighborhoods: 'Neighborhoods', mortgage: 'Mortgage calculator', sell: 'Sell your home', favorites: 'Saved', tour: 'Schedule a tour', 'tour-done': 'Tour requested', about: 'About', contact: 'Contact', faq: 'FAQ', privacy: 'Privacy', terms: 'Terms' };
  const ROUTE_GROUP = { property: 'properties', agent: 'agents', 'tour-done': 'tour' };
  function render() {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    let key = parts[0] || 'home';
    if (!pages[key]) key = 'notfound';
    $('#view').innerHTML = pages[key](parts[1], parts[2]);
    document.title = (TITLES[key] ? TITLES[key] + ' | ' : '') + 'Meridian Realty';
    const group = ROUTE_GROUP[key] || key;
    $$('.nav a[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === group));
    document.body.classList.remove('nav-open');
    hydrate();
    window.scrollTo(0, 0);
    if (key === 'mortgage') mortgageCalc();
    if (key === 'home') startCounters();
  }

  /* ---------- Animated counters ---------- */
  function startCounters() {
    const els = $$('[data-count]');
    const run = () => els.forEach((el) => {
      const target = Number(el.dataset.count), suffix = el.dataset.suffix || '', t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US') + (k === 1 ? suffix : '');
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    const bar = $('#statsBar');
    if (!bar) return;
    if (!('IntersectionObserver' in window)) { run(); return; }
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(bar);
  }

  /* ---------- UI helpers ---------- */
  function badges() {
    $('#favCount').textContent = state.fav.length;
    $('#favCount').hidden = state.fav.length === 0;
  }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  /* ---------- Events ---------- */
  const actions = {
    'nav-toggle': () => document.body.classList.toggle('nav-open'),
    'ui-close': () => document.body.classList.remove('nav-open'),
    car: (el) => { const c = el.closest('.section').querySelector('.carousel'); c.scrollBy({ left: Number(el.dataset.d) * (c.firstElementChild.offsetWidth + 24) * 2, behavior: 'smooth' }); },
    fav: (el) => {
      const id = Number(el.dataset.id), i = state.fav.indexOf(id);
      if (i > -1) state.fav.splice(i, 1); else state.fav.push(id);
      saveAll(); badges();
      toast(i === -1 ? 'Saved to your list' : 'Removed from your list');
      if (location.hash === '#/favorites' || /^#\/property\//.test(location.hash)) render();
      else $$('.fav[data-id="' + id + '"]').forEach((b) => b.classList.toggle('on', i === -1));
    },
    'clear-filters': () => { state.f = { ...DEF }; if (location.hash === '#/properties') render(); else location.hash = '#/properties'; }
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) { e.preventDefault(); actions[el.dataset.action](el, e); return; }
    if (e.target.closest('.nav a')) document.body.classList.remove('nav-open');
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.closest && t.closest('#mortForm')) { mortgageCalc(); return; }
    const k = t.dataset && t.dataset.filter;
    if (!k) return;
    state.f[k] = (k === 'max' || k === 'beds') ? Number(t.value) : t.value;
    $('#results').innerHTML = resultsHTML();
    hydrate($('#results'));
  });

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form]');
    if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form, d = new FormData(form);
    if (kind === 'hero-search') {
      state.f = { ...DEF, loc: d.get('loc') === 'Any location' ? 'Any' : d.get('loc'), type: d.get('type') === 'Any type' ? 'Any' : d.get('type'), max: Number(d.get('max')) };
      location.hash = '#/properties';
    }
    if (kind === 'inquiry') { toast('Message sent. An agent will reply soon.'); form.reset(); }
    if (kind === 'sell') {
      const l = LOCS.find((x) => x.name === d.get('loc')), sqft = Number(d.get('sqft')), base = sqft * l.ppsf * (1 + (Number(d.get('beds')) - 3) * 0.02);
      $('#estimateVal').textContent = money(base * 0.94) + ' - ' + money(base * 1.06);
      $('#estimateNote').textContent = 'Sample estimate for ' + d.get('address') + '. An agent will contact ' + d.get('email') + ' with a real market analysis.';
      toast('Estimate ready. We will email you.');
    }
    if (kind === 'tour') {
      state.tours.unshift({ property: Number(d.get('property')), date: String(d.get('date')), time: String(d.get('time')), kind: String(d.get('kind')), name: String(d.get('name')), email: String(d.get('email')) });
      saveAll();
      location.hash = '#/tour-done';
    }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('nav-open'); });

  window.addEventListener('hashchange', render);
  badges();
  hydrate();
  render();
})();
