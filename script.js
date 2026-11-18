document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  function renderStars(rating) {
    const full = Math.round(rating);
    let stars = "";
    for (let i = 0; i < 5; i++) {
      stars += i < full ? "★" : "☆";
    }
    return stars;
  }

  // Animated stats counters
  const stats = [
    { id: "statProperties", target: 1280, suffix: "+" },
    { id: "statYears", target: 15, suffix: "" },
    { id: "statClients", target: 9400, suffix: "+" },
    { id: "statCities", target: 24, suffix: "" }
  ];

  function animateCount(el, target, suffix) {
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statsBar = document.querySelector(".stats-bar");
  let statsAnimated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        stats.forEach((s) => {
          const el = document.getElementById(s.id);
          animateCount(el, s.target, s.suffix);
        });
      }
    });
  }, { threshold: 0.4 });
  if (statsBar) observer.observe(statsBar);

  // Properties
  const properties = [
    { icon: "🏡", badge: "For Sale", type: "sale", price: "$485,000", title: "Modern Family Home", address: "214 Maple Street, Downtown", beds: 4, baths: 3, sqft: "2,450" },
    { icon: "🏙️", badge: "For Rent", type: "rent", price: "$2,200/mo", title: "Riverside Loft Apartment", address: "88 River Walk, Riverside", beds: 2, baths: 2, sqft: "1,180" },
    { icon: "🏠", badge: "For Sale", type: "sale", price: "$720,000", title: "Hillcrest Family Villa", address: "45 Summit Drive, Hillcrest", beds: 5, baths: 4, sqft: "3,200" },
    { icon: "🏢", badge: "For Sale", type: "sale", price: "$310,000", title: "Lakeside Modern Condo", address: "19 Shoreline Ave, Lakeside", beds: 2, baths: 2, sqft: "1,050" },
    { icon: "🏘️", badge: "For Rent", type: "rent", price: "$1,850/mo", title: "Old Town Charm House", address: "7 Heritage Lane, Old Town", beds: 3, baths: 2, sqft: "1,620" },
    { icon: "🏡", badge: "For Sale", type: "sale", price: "$560,000", title: "Downtown Townhouse", address: "132 Court Street, Downtown", beds: 3, baths: 3, sqft: "1,980" }
  ];

  const propertyGrid = document.getElementById("propertyGrid");
  properties.forEach((p) => {
    const card = document.createElement("div");
    card.className = "property-card";
    const badgeClass = p.type === "rent" ? "property-badge rent" : "property-badge";
    card.innerHTML =
      '<div class="property-image">' +
      '<span class="' + badgeClass + '">' + p.badge + '</span>' +
      '<button class="favorite-toggle" aria-label="Save property">♡</button>' +
      p.icon +
      '</div>' +
      '<div class="property-info">' +
      '<div class="property-price">' + p.price + '</div>' +
      '<div class="property-title">' + p.title + '</div>' +
      '<div class="property-address">' + p.address + '</div>' +
      '<div class="property-meta">' +
      '<span>🛏️ ' + p.beds + ' bd</span>' +
      '<span>🚿 ' + p.baths + ' ba</span>' +
      '<span>📏 ' + p.sqft + ' sqft</span>' +
      '</div></div>';

    const favBtn = card.querySelector(".favorite-toggle");
    favBtn.addEventListener("click", () => {
      favBtn.classList.toggle("active");
      favBtn.textContent = favBtn.classList.contains("active") ? "♥" : "♡";
    });

    propertyGrid.appendChild(card);
  });

  // Why choose us
  const whyItems = [
    { icon: "🧑‍💼", title: "Expert Agents", text: "Local specialists with deep neighborhood knowledge." },
    { icon: "✅", title: "Verified Listings", text: "Every property is inspected and confirmed before listing." },
    { icon: "💰", title: "Best Price Guarantee", text: "Transparent pricing with no hidden fees, ever." },
    { icon: "💬", title: "24/7 Support", text: "Our team is one call or message away, any time." }
  ];
  const whyGrid = document.getElementById("whyGrid");
  whyItems.forEach((w) => {
    const card = document.createElement("div");
    card.className = "why-card";
    card.innerHTML =
      '<div class="why-icon">' + w.icon + '</div>' +
      '<h3>' + w.title + '</h3>' +
      '<p>' + w.text + '</p>';
    whyGrid.appendChild(card);
  });

  // Agents
  const agents = [
    { name: "Sofia Martins", role: "Senior Listing Agent", rating: 5, reviews: 142 },
    { name: "Marcus Lee", role: "Buyer's Agent", rating: 4.8, reviews: 98 },
    { name: "Elena Rossi", role: "Luxury Properties", rating: 4.9, reviews: 76 }
  ];
  const agentGrid = document.getElementById("agentGrid");
  agents.forEach((a) => {
    const initials = a.name.split(" ").map((n) => n[0]).join("");
    const card = document.createElement("div");
    card.className = "agent-card";
    card.innerHTML =
      '<div class="agent-avatar">' + initials + '</div>' +
      '<div class="agent-name">' + a.name + '</div>' +
      '<div class="agent-role">' + a.role + '</div>' +
      '<div class="agent-rating">' + renderStars(a.rating) + '<span>(' + a.reviews + ' reviews)</span></div>';
    agentGrid.appendChild(card);
  });

  // Testimonials
  const testimonials = [
    { text: "Meridian made buying our first home stress-free. Our agent answered every question, even late at night.", name: "The Caldwell Family", role: "Bought in Hillcrest", rating: 5 },
    { text: "Sold our condo in two weeks for above asking price. Could not have asked for a smoother process.", name: "Robert Nguyen", role: "Sold in Lakeside", rating: 5 },
    { text: "As a first-time renter, I appreciated how patient and thorough the team was with every step.", name: "Jasmine Park", role: "Rented in Riverside", rating: 4 }
  ];
  const testimonialGrid = document.getElementById("testimonialGrid");
  testimonials.forEach((t) => {
    const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.innerHTML =
      '<div class="testimonial-stars">' + renderStars(t.rating) + '</div>' +
      '<p class="testimonial-text">"' + t.text + '"</p>' +
      '<div class="testimonial-author">' +
      '<div class="author-avatar">' + initials + '</div>' +
      '<div><div class="author-name">' + t.name + '</div><div class="author-role">' + t.role + '</div></div>' +
      '</div>';
    testimonialGrid.appendChild(card);
  });

  // Search form
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
  });

  // CTA form
  const ctaForm = document.getElementById("ctaForm");
  const ctaMsg = document.getElementById("ctaMsg");
  ctaForm.addEventListener("submit", (e) => {
    e.preventDefault();
    ctaMsg.textContent = "Thanks! A Meridian agent will reach out within one business day.";
    ctaForm.reset();
  });
});
