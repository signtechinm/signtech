import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge, Button, Card, CardContent, CardHeader, Input, Select, Tabs, Textarea } from "./ui.jsx";
import { defaultContent, mergeContent } from "./content.js";
import "./styles.css";

const routes = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const CAPABILITY_STICKY_START = 0.14;
const CAPABILITY_STICKY_END = 0.8;
const CAPABILITY_SCROLL_END = 0.68;
const STATIC_LOGOS = {
  light: "/assets/logo.png",
  dark: "/uploads/1778462287119-ae012fed-light.png",
};
const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/signtechinm", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com/signtechinm", icon: "instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/signtechinm", icon: "linkedin" },
  { label: "WhatsApp", href: "https://wa.me/917012808718", icon: "whatsapp" },
];

const generatedServiceImages = {
  "web-apps": "/assets/generated-service-web-apps.png",
  "mobile-apps": "/assets/generated-service-mobile-apps.png",
  "custom-software": "/assets/generated-service-custom-software.png",
  "website-design": "/assets/generated-service-website-design.png",
  "ecommerce-development": "/assets/generated-service-ecommerce.png",
  "api-development": "/assets/generated-service-api.png",
  "digital-marketing": "/assets/generated-service-marketing.png",
  "graphic-design": "/assets/generated-service-graphic-design.png",
};

function serviceSlug(title) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function serviceImage(service) {
  return generatedServiceImages[serviceSlug(service.title)] || service.image;
}

function getServiceDetails(service) {
  const title = service?.title || "Digital Service";
  const details = {
    "web-apps": {
      headline: "Fast, responsive web applications built around real business workflows.",
      intro: "We plan, design, and build web apps that help teams manage customers, orders, content, bookings, dashboards, and internal operations with less friction.",
      deliverables: ["User flows and screen architecture", "Responsive frontend development", "Admin panels and dashboards", "API and database integration"],
      outcomes: ["A cleaner customer or staff experience", "Faster everyday operations", "A scalable foundation for new features"],
    },
    "mobile-apps": {
      headline: "Mobile app experiences designed for daily use on modern devices.",
      intro: "We create practical mobile apps for customers, teams, and service operations, with clean navigation and reliable connections to your backend systems.",
      deliverables: ["App structure and interface design", "Cross-platform mobile development", "Authentication and user accounts", "Push-ready architecture and API integration"],
      outcomes: ["A mobile channel your users can rely on", "Consistent brand experience across devices", "A launch-ready app workflow"],
    },
    "custom-software": {
      headline: "Custom software that replaces repetitive manual work with connected tools.",
      intro: "We build focused business software for operations that spreadsheets, disconnected apps, and manual follow-ups can no longer handle well.",
      deliverables: ["Workflow mapping", "Role-based admin tools", "Database-backed business logic", "Reporting and approval flows"],
      outcomes: ["Less duplicate data entry", "Better visibility across teams", "Software shaped around how your business actually works"],
    },
    "website-design": {
      headline: "Modern websites that feel trustworthy, clear, and easy to use.",
      intro: "We design websites that communicate your offer quickly, guide visitors toward action, and give your brand a polished digital presence.",
      deliverables: ["Page structure and content planning", "Responsive UI design", "Landing pages and service pages", "Performance-conscious frontend build"],
      outcomes: ["A stronger first impression", "Clearer service communication", "Better paths from visitor interest to enquiry"],
    },
    "ecommerce-development": {
      headline: "Ecommerce experiences built to make browsing, carts, and checkout smoother.",
      intro: "We create online stores and commerce workflows that help customers find products, understand offers, and complete purchases with confidence.",
      deliverables: ["Catalog and product page setup", "Cart and checkout flow planning", "Payment and platform integration", "Store management workflows"],
      outcomes: ["A smoother buying journey", "Better product presentation", "A store your team can keep managing"],
    },
    "api-development": {
      headline: "Secure APIs and integrations that keep your platforms connected.",
      intro: "We design and build APIs that move data between apps, websites, admin systems, ecommerce platforms, CRMs, and third-party services.",
      deliverables: ["API architecture", "Authentication and access control", "Third-party integrations", "Documentation and testing support"],
      outcomes: ["Connected systems with fewer manual transfers", "Cleaner data flow between tools", "A stronger backend for apps and websites"],
    },
    "digital-marketing": {
      headline: "Digital marketing that improves visibility, traffic, and qualified enquiries.",
      intro: "We help shape campaigns, content, and online activity around measurable business goals rather than scattered posting or ad spend.",
      deliverables: ["Campaign planning", "Landing page direction", "Creative and content support", "Performance review and improvement cycles"],
      outcomes: ["Clearer campaign direction", "More useful traffic", "A repeatable marketing workflow"],
    },
    "graphic-design": {
      headline: "Graphic design assets that make your brand communication sharper.",
      intro: "We create practical brand visuals for digital campaigns, social media, websites, sales material, and everyday business communication.",
      deliverables: ["Brand and campaign creatives", "Social media visuals", "Digital banners and website assets", "Presentation and marketing collateral"],
      outcomes: ["More consistent brand communication", "Better-looking campaign material", "Reusable visuals for your team"],
    },
  };

  return details[serviceSlug(title)] || {
    headline: `${title} shaped around your goals, users, and growth plan.`,
    intro: service?.copy || "We plan and deliver the right digital service with clear scope, polished execution, and practical support after launch.",
    deliverables: ["Discovery and planning", "Design and implementation", "Testing and launch support", "Iteration after release"],
    outcomes: ["A clearer digital workflow", "A more polished customer experience", "A solution your team can build on"],
  };
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const navigate = (href) => {
    window.history.pushState({}, "", href);
    setPath(href);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { path, navigate };
}

function AppLink({ href, navigate, children, className = "" }) {
  return (
    <a
      className={className}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

async function fetchContent() {
  const response = await fetch("/api/content");
  if (!response.ok) throw new Error("Could not load content");
  return response.json();
}

async function saveContent(content) {
  const token = localStorage.getItem("signtech-admin-token");
  const response = await fetch("/api/admin/content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw new Error("Could not save content");
  return response.json();
}

async function fetchAdminContent() {
  const token = localStorage.getItem("signtech-admin-token");
  const response = await fetch("/api/admin/content", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Could not load admin content");
  return response.json();
}

async function loginAdmin(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error("Invalid username or password");
  return response.json();
}

async function logoutAdmin() {
  const token = localStorage.getItem("signtech-admin-token");
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

function Layout({ children, content, navigate, path, theme, setTheme }) {
  const logo = STATIC_LOGOS[theme] || STATIC_LOGOS.dark;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const contactDigits = content.settings.phone.replace(/\D/g, "");
  const footerSocialLinks = socialLinks.map((social) => (
    social.icon === "whatsapp" ? { ...social, href: `https://wa.me/${contactDigits}` } : social
  ));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <header className="site-header">
        <div className="header-brand-group">
          <AppLink className="brand" href="/" navigate={navigate}>
            <img src={logo || "/assets/logo.png"} alt={content.settings.company} />
          </AppLink>
        </div>
        <div className="header-menu-group">
          <nav className="primary-nav" aria-label="Primary navigation">
            {routes.map((route) => (
              <AppLink className={path === route.href ? "active" : ""} href={route.href} key={route.href} navigate={navigate}>
                {route.label}
              </AppLink>
            ))}
          </nav>
          <div className="header-actions">
            <button
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-icon-button"
              onClick={toggleTheme}
              type="button"
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
          </div>
        </div>
        <div className="mobile-header-actions">
          <button
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="theme-icon-button"
            onClick={toggleTheme}
            type="button"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
          <button
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="menu-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </header>
      {isMenuOpen && (
        <div className="mobile-menu open" id="mobile-menu">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-top">
              <img src={logo || "/assets/logo.png"} alt={content.settings.company} />
              <button
                aria-label="Close menu"
                className="mobile-menu-close"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {routes.map((route) => (
                <AppLink className={path === route.href ? "active" : ""} href={route.href} key={route.href} navigate={navigate}>
                  {route.label}
                </AppLink>
              ))}
            </nav>
            <div className="mobile-menu-actions">
              <div className="mobile-menu-socials" aria-label="Social links">
                {footerSocialLinks.map((social) => (
                  <a
                    aria-label={social.label}
                    href={social.href}
                    key={social.label}
                    rel="noreferrer"
                    target="_blank"
                    title={social.label}
                  >
                    <SocialIcon name={social.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <div className="footer-brand">
          <img src={logo || "/assets/logo.png"} alt={content.settings.company} />
          <p>{content.settings.tagline}</p>
        </div>
        <div className="footer-contact">
          <a href={`mailto:${content.settings.email}`}>{content.settings.email}</a>
          <a href={`tel:${content.settings.phone.replace(/\s+/g, "")}`}>{content.settings.phone}</a>
        </div>
        <div className="footer-socials" aria-label="Social links">
          {footerSocialLinks.map((social) => (
            <a
              aria-label={social.label}
              href={social.href}
              key={social.label}
              rel="noreferrer"
              target="_blank"
              title={social.label}
            >
              <SocialIcon name={social.icon} />
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}

function SocialIcon({ name }) {
  const paths = {
    facebook: (
      <path d="M14 8.4V6.8c0-.8.5-1.2 1.3-1.2H17V2.7c-.8-.1-1.6-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.1v1.8H7.7v3.2h2.7v9.9H14v-9.9h2.7l.5-3.2H14Z" />
    ),
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="16.7" cy="7.4" r="1" />
      </>
    ),
    linkedin: (
      <>
        <path d="M6.4 9.8v9.1" />
        <path d="M10.6 18.9v-5.1c0-2.4 1.3-4.1 3.7-4.1 2.2 0 3.3 1.5 3.3 4v5.2" />
        <path d="M10.6 13.9V9.8" />
        <circle cx="6.4" cy="6" r="1.4" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M5.6 18.5 6.8 15A7.2 7.2 0 1 1 9 17.2l-3.4 1.3Z" />
        <path d="M9.4 8.6c.2-.5.4-.6.8-.6h.6c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c.6 1.1 1.4 1.9 2.5 2.5l.5-.5c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.6v.5c0 .5-.2.8-.7.9-3 .6-7.2-3.3-6.6-7.3Z" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function ServiceIcon({ title }) {
  const key = title.toLowerCase();
  const icon =
    key.includes("mobile") ? "mobile" :
    key.includes("software") ? "workflow" :
    key.includes("design") ? "palette" :
    key.includes("ecommerce") ? "cart" :
    key.includes("api") ? "plug" :
    key.includes("marketing") ? "megaphone" :
    key.includes("graphic") ? "pen" :
    "browser";

  const paths = {
    browser: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 9h18" />
        <path d="M8 15l2-2 2 2 4-4" />
      </>
    ),
    mobile: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18h2" />
      </>
    ),
    workflow: (
      <>
        <rect x="3" y="4" width="7" height="6" rx="1.5" />
        <rect x="14" y="14" width="7" height="6" rx="1.5" />
        <path d="M10 7h3.5A3.5 3.5 0 0 1 17 10.5V14" />
        <path d="M14 17h-3.5A3.5 3.5 0 0 1 7 13.5V10" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 0 0 0 18h1.1a2.2 2.2 0 0 0 1.5-3.8 1.8 1.8 0 0 1 1.2-3.2H17a4 4 0 0 0 0-8.1A8.9 8.9 0 0 0 12 3Z" />
        <path d="M7.6 10.2h.01" />
        <path d="M10.2 7.4h.01" />
        <path d="M14 7.8h.01" />
      </>
    ),
    cart: (
      <>
        <path d="M4 5h2l2 10h9.5l2-7H7" />
        <circle cx="10" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </>
    ),
    plug: (
      <>
        <path d="M9 7V3" />
        <path d="M15 7V3" />
        <path d="M7 7h10v4a5 5 0 0 1-10 0Z" />
        <path d="M12 16v5" />
      </>
    ),
    megaphone: (
      <>
        <path d="M4 13h3l10 4V5L7 9H4Z" />
        <path d="M7 13l2 6" />
        <path d="M19 9.5a3 3 0 0 1 0 3" />
      </>
    ),
    pen: (
      <>
        <path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z" />
        <path d="M14 7l3 3" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="capability-icon" fill="none" viewBox="0 0 24 24">
      {paths[icon]}
    </svg>
  );
}

function ProcessWaveCanvas() {
  const canvasRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false, strength: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let animationFrame = 0;

    const resolveProcessWaveColors = () => {
      const styles = window.getComputedStyle(document.documentElement);
      return {
        background: styles.getPropertyValue("--process-wave-bg").trim() || "#061724",
        dots: styles.getPropertyValue("--process-wave-dot").trim() || "#e2eefa",
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = () => {
      frame += prefersReducedMotion ? 0 : 0.009;
      const pointer = pointerRef.current;
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * (pointer.active ? 0.12 : 0.035);
      const colors = resolveProcessWaveColors();

      context.clearRect(0, 0, width, height);
      context.fillStyle = colors.background;
      context.fillRect(0, 0, width, height);

      const horizon = height * 0.2;
      const rows = 52;
      const cols = 108;
      const centerX = width * 0.5;

      for (let row = 0; row < rows; row += 1) {
        const depth = row / (rows - 1);
        const perspective = depth * depth;
        const yBase = horizon + perspective * height * 0.95;
        const spread = width * (0.26 + perspective * 1.08);
        const stepX = spread / cols;
        const dotRadius = 0.65 + perspective * 1.15;
        const rowAlpha = Math.min(0.82, 0.1 + perspective * 0.72);

        for (let col = 0; col <= cols; col += 1) {
          const normalizedX = col / cols - 0.5;
          const x = centerX + normalizedX * spread;
          const ridge =
            Math.sin(normalizedX * 10.5 + frame * 2.2 + depth * 5.8) * 24 * perspective +
            Math.sin(normalizedX * 21 - frame * 1.5 + depth * 9.4) * 11 * perspective;
          const swell = Math.sin(depth * 15.5 - frame * 2.7 + normalizedX * 4) * 36 * perspective;
          const waveY = yBase + ridge + swell;
          const dx = x - pointer.x;
          const dy = waveY - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 260;
          const repelForce =
            pointer.strength *
            Math.pow(Math.max(0, 1 - distance / repelRadius), 2) *
            86 *
            (0.55 + perspective);
          const repelX = distance > 0 ? (dx / distance) * repelForce : 0;
          const repelY = distance > 0 ? (dy / distance) * repelForce : -repelForce;
          const y = waveY + repelY;
          const dotX = x + repelX;
          const edgeFade = Math.max(0, 1 - Math.abs(normalizedX) * 1.7);
          const alpha = rowAlpha * edgeFade;

          if (alpha <= 0.02) continue;
          context.beginPath();
          context.globalAlpha = alpha;
          context.fillStyle = colors.dots;
          context.arc(dotX, y, dotRadius, 0, Math.PI * 2);
          context.fill();
          context.globalAlpha = 1;
        }
      }

      if (!prefersReducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const updatePointer = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      pointerRef.current.active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    };

    const leavePointer = () => {
      pointerRef.current.active = false;
    };

    resize();
    draw();
    const observer = new MutationObserver(() => {
      if (prefersReducedMotion) draw();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer);
    window.addEventListener("pointerleave", leavePointer);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", leavePointer);
    };
  }, []);

  return <canvas className="process-wave-canvas" ref={canvasRef} aria-hidden="true" />;
}

function HomePage({ content, navigate }) {
  const featuredServices = content.services.slice(0, 6);
  const heroTechIcons = content.tech.slice(0, 7);
  const heroRef = useRef(null);
  const capabilitiesRef = useRef(null);
  const capabilityViewportRef = useRef(null);
  const capabilityTrackRef = useRef(null);
  const [isCapabilitySticky, setIsCapabilitySticky] = useState(false);
  const [isCapabilitySwiping, setIsCapabilitySwiping] = useState(false);
  const timelineItems = [
    ["home-hero", "Hero"],
    ["home-capabilities", "Capabilities"],
    ["home-process", "Method"],
    ["home-stack", "Stack"],
    ["home-contact", "Contact"],
  ];
  const [activeSection, setActiveSection] = useState(timelineItems[0][0]);
  const process = [
    ["01", "Map", "Clarify your goals, current stack, audience, and operational constraints."],
    ["02", "Build", "Design, develop, integrate, and test the right digital solution."],
    ["03", "Grow", "Launch with content, marketing, analytics, and improvement cycles."],
  ];

  useEffect(() => {
    const sections = timelineItems
      .map(([id]) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateCapabilityScroll = () => {
      frame = 0;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const scrollY = Math.min(maxScroll, Math.max(0, window.scrollY));
      const pageProgress = scrollY / maxScroll;
      setIsCapabilitySticky(
        window.innerWidth > 860 &&
        pageProgress >= CAPABILITY_STICKY_START &&
        pageProgress <= CAPABILITY_STICKY_END
      );

      const section = capabilitiesRef.current;
      const track = capabilityTrackRef.current;
      const viewport = track?.parentElement;
      if (!section || !track || !viewport) return;

      const progress = Math.min(
        1,
        Math.max(
          0,
          (pageProgress - CAPABILITY_STICKY_START) /
            (CAPABILITY_SCROLL_END - CAPABILITY_STICKY_START)
        )
      );
      const cards = Array.from(track.children);
      const gap = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft - cards[0].offsetWidth : 0;
      const pairWidth = cards[0] ? (cards[0].offsetWidth + gap) * 2 : 0;
      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const scrollRunway = Math.max(window.innerHeight * 1.35, maxShift * 1.05);
      section.style.setProperty("--capability-scroll-space", `${scrollRunway}px`);
      const maxPairIndex = Math.max(1, Math.ceil(maxShift / Math.max(1, pairWidth)));
      const pairProgress = progress * maxPairIndex;
      const basePair = Math.floor(pairProgress);
      const localProgress = pairProgress - basePair;
      const easedLocalProgress = localProgress < 0.5
        ? 2 * localProgress * localProgress
        : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;
      const shiftedPairProgress = Math.min(maxPairIndex, basePair + easedLocalProgress);
      const shift = Math.min(maxShift, shiftedPairProgress * pairWidth);
      track.style.transform = `translate3d(${-shift}px, 0, 0)`;
      section.style.setProperty("--capability-progress", progress.toFixed(3));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateCapabilityScroll);
    };

    updateCapabilityScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const viewport = capabilityViewportRef.current;
    if (!viewport) return undefined;

    let swipeTimer = 0;
    const showSwipeGesture = () => {
      if (window.innerWidth > 860) return;
      setIsCapabilitySwiping(true);
      window.clearTimeout(swipeTimer);
      swipeTimer = window.setTimeout(() => setIsCapabilitySwiping(false), 650);
    };

    viewport.addEventListener("touchstart", showSwipeGesture, { passive: true });
    viewport.addEventListener("touchmove", showSwipeGesture, { passive: true });
    viewport.addEventListener("pointerdown", showSwipeGesture, { passive: true });
    viewport.addEventListener("scroll", showSwipeGesture, { passive: true });

    return () => {
      window.clearTimeout(swipeTimer);
      viewport.removeEventListener("touchstart", showSwipeGesture);
      viewport.removeEventListener("touchmove", showSwipeGesture);
      viewport.removeEventListener("pointerdown", showSwipeGesture);
      viewport.removeEventListener("scroll", showSwipeGesture);
    };
  }, []);

  const activeIndex = Math.max(0, timelineItems.findIndex(([id]) => id === activeSection));

  const updateHeroPointer = (event) => {
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty("--hero-pointer-x", `${event.clientX - rect.left}px`);
    hero.style.setProperty("--hero-pointer-y", `${event.clientY - rect.top}px`);
  };

  return (
    <main className="home-redesign">
      <nav className="home-timeline" aria-label="Home page sections" style={{ "--active-index": activeIndex }}>
        {timelineItems.map(([id, label]) => (
          <a aria-label={label} className={activeSection === id ? "active" : ""} href={`#${id}`} key={id}>
            <span />
          </a>
        ))}
      </nav>

      <section className="home-hero section-pad" id="home-hero" onPointerMove={updateHeroPointer} ref={heroRef}>
        <div className="hero-check-overlay" aria-hidden="true" />
        <div className="hero-tech-icons" aria-hidden="true">
          {heroTechIcons.map(([name, image], index) => (
            <span className="hero-tech-icon" key={`${name}-${index}`}>
              <img src={image} alt="" />
            </span>
          ))}
        </div>
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="home-hero-copy">
          <Badge>Digital build studio</Badge>
          <h1>Design, code, market, and connect your business systems.</h1>
          <p>
            Signtech turns scattered ideas into websites, apps, APIs, ecommerce stores,
            campaigns, and brand systems that are easier to operate and ready to scale.
          </p>
          <div className="hero-actions">
            <Button as="a" href="/contact" onClick={(event) => {
              event.preventDefault();
              navigate("/contact");
            }}>
              Start a Project
            </Button>
            <Button as="a" href="/services" variant="outline" onClick={(event) => {
              event.preventDefault();
              navigate("/services");
            }}>
              View Services
            </Button>
          </div>
        </div>
      </section>

      <section
        className={`home-capabilities ${isCapabilitySticky ? "is-scroll-sticky" : ""}`}
        id="home-capabilities"
        ref={capabilitiesRef}
      >
        <div className="capability-sticky">
          <div className="section-heading centered">
            <Badge>Capabilities</Badge>
            <h2>Everything your digital presence needs, organized into clear workstreams.</h2>
            <p>{content.home.body}</p>
          </div>
          <div className={`capability-viewport ${isCapabilitySwiping ? "is-swipe-active" : ""}`} ref={capabilityViewportRef}>
            <span className="swipe-gesture-indicator" aria-hidden="true">
              <span />
            </span>
            <div className="capability-grid" ref={capabilityTrackRef}>
              {featuredServices.map((service) => (
                <Card className="capability-card" key={service.title}>
                  <CardHeader>
                    <span className="capability-mark">
                      <ServiceIcon title={service.title} />
                    </span>
                    <h3>{service.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p>{service.copy}</p>
                    <Button as="a" className="capability-explore" href={`/services/${serviceSlug(service.title)}`} variant="outline" onClick={(event) => {
                      event.preventDefault();
                      navigate(`/services/${serviceSlug(service.title)}`);
                    }}>
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <div className="capability-scroll-space" aria-hidden="true" />
      </section>

      <section className={`home-process section-pad ${activeSection === "home-process" ? "active" : ""}`} id="home-process">
        <div className="process-wave-bg" aria-hidden="true">
          <ProcessWaveCanvas />
        </div>
        <div className="section-heading">
          <Badge>Method</Badge>
          <h2>From first conversation to measurable release.</h2>
        </div>
        <div className="process-grid">
          <svg className="process-path" aria-hidden="true" viewBox="0 0 720 420">
            <path className="process-path-base" d="M140 300 C200 80 520 80 580 300" />
            <path className="process-path-active" d="M140 300 C200 80 520 80 580 300" />
          </svg>
          {process.map(([step, title, copy]) => (
            <Card className="process-card" key={step}>
              <CardHeader>
                <span>{step}</span>
                <h3>{title}</h3>
              </CardHeader>
              <CardContent>
                <p>{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="home-stack section-pad" id="home-stack">
        <div className="section-heading">
          <Badge>Stack</Badge>
          <h2>Built with tools your team can keep using.</h2>
        </div>
        <div className="stack-marquee" aria-label="Technology stack logos">
          <div className="stack-track">
            {[...content.tech, ...content.tech].map(([name, image], index) => (
              <Card className="stack-chip" key={`${name}-${index}`}>
                <img src={image} alt={name} />
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta section-pad" id="home-contact">
        <Card>
          <CardContent>
            <Badge>Next step</Badge>
            <h2>{content.contact.headline}</h2>
            <p>{content.contact.body}</p>
            <Button as="a" href="/contact" onClick={(event) => {
              event.preventDefault();
              navigate("/contact");
            }}>
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ServicePreview({ content, navigate }) {
  return (
    <section className="services section-pad">
      <div className="section-heading">
        <Badge>Innovation meets execution</Badge>
        <h2>We are good at</h2>
      </div>
      <div className="service-grid">
        {content.services.slice(0, 4).map((service) => (
          <ServiceCard navigate={navigate} service={service} key={service.title} />
        ))}
      </div>
      <div className="section-actions">
        <Button as="a" href="/services" variant="outline" onClick={(event) => {
          event.preventDefault();
          navigate("/services");
        }}>
          View all services
        </Button>
      </div>
    </section>
  );
}

function ServicesPage({ content, navigate }) {
  const process = [
    ["Discover", "We identify the goal, audience, workflow, and success metrics."],
    ["Design", "We shape screens, structure, content, and technical architecture."],
    ["Deliver", "We build, test, launch, and support the service after release."],
  ];

  return (
    <main className="services-redesign">
      <section className="services-hero section-pad">
        <Badge>Services</Badge>
        <h1>Digital services shaped around what your business needs next.</h1>
        <p>From product engineering to marketing execution, Signtech brings technical and creative work together around measurable growth.</p>
      </section>

      <section className="services-list section-pad">
        <div className="section-heading centered">
          <Badge>What we do</Badge>
          <h2>Focused services, delivered as one connected workflow.</h2>
        </div>
        <div className="services-grid-redesign">
          {content.services.map((service, index) => (
            <ServiceCard index={index} navigate={navigate} service={service} key={service.title} />
          ))}
        </div>
      </section>

      <section className="services-process section-pad">
        <div className="section-heading">
          <Badge>How we work</Badge>
          <h2>A simple path from idea to launch.</h2>
        </div>
        <div className="service-process-grid">
          {process.map(([title, copy], index) => (
            <Card className="service-process-card" key={title}>
              <CardHeader>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
              </CardHeader>
              <CardContent>
                <p>{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="services-cta section-pad">
        <Card>
          <CardContent>
            <Badge>Plan your build</Badge>
            <h2>Need help choosing the right service?</h2>
            <p>Tell us what you want to improve, launch, or automate. We will map the right service mix for your business.</p>
            <Button as="a" href="/contact" onClick={(event) => {
              event.preventDefault();
              navigate("/contact");
            }}>
              Contact Sales
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ServiceCard({ service, navigate, index = 0 }) {
  const href = `/services/${serviceSlug(service.title)}`;

  return (
    <Card className="service-card">
      <CardHeader>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>
          <ServiceIcon title={service.title} />
        </strong>
      </CardHeader>
      <CardContent>
        <h3>{service.title}</h3>
        <p>{service.copy}</p>
        <Button as="a" href={href} variant="outline" onClick={(event) => {
          event.preventDefault();
          navigate(href);
        }}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

function ServiceDetailPage({ content, navigate, service }) {
  const detail = getServiceDetails(service);
  const relatedServices = content.services
    .filter((item) => item.title !== service.title)
    .slice(0, 3);

  return (
    <main className="service-detail-page">
      <section className="service-detail-hero section-pad">
        <div className="service-detail-copy">
          <Badge>{service.title}</Badge>
          <h1>{detail.headline}</h1>
          <p>{detail.intro}</p>
          <div className="hero-actions">
            <Button as="a" href="/contact" onClick={(event) => {
              event.preventDefault();
              navigate("/contact");
            }}>
              Start This Service
            </Button>
            <Button as="a" href="/services" variant="outline" onClick={(event) => {
              event.preventDefault();
              navigate("/services");
            }}>
              All Services
            </Button>
          </div>
        </div>
        <div className="service-detail-media">
          <img src={serviceImage(service)} alt={service.title} />
          <span className="service-detail-icon">
            <ServiceIcon title={service.title} />
          </span>
        </div>
      </section>

      <section className="service-detail-body section-pad">
        <Card className="service-detail-panel">
          <CardHeader>
            <Badge>What is included</Badge>
            <h2>Planned, built, and launched with the essentials covered.</h2>
          </CardHeader>
          <CardContent>
            <div className="service-detail-list">
              {detail.deliverables.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="service-detail-panel">
          <CardHeader>
            <Badge>Business value</Badge>
            <h2>What this service helps improve.</h2>
          </CardHeader>
          <CardContent>
            <div className="service-detail-list">
              {detail.outcomes.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="related-services section-pad">
        <div className="section-heading">
          <Badge>Related services</Badge>
          <h2>Often paired with {service.title.toLowerCase()}.</h2>
        </div>
        <div className="service-process-grid">
          {relatedServices.map((item, index) => (
            <ServiceCard index={index} navigate={navigate} service={item} key={item.title} />
          ))}
        </div>
      </section>
    </main>
  );
}

function AboutPage({ content }) {
  const story = [
    ["2020", "Founded", "Signtech began with a focus on practical digital delivery for growing businesses."],
    ["Build", "Expanded services", "Web, API, mobile, ecommerce, marketing, and creative work moved into one delivery flow."],
    ["Now", "Digital partner", "We help teams launch, improve, and maintain systems with clarity and long-term support."],
  ];

  return (
    <main className="about-redesign">
      <section className="about-hero section-pad">
        <div className="about-hero-copy">
          <Badge>{content.about.eyebrow}</Badge>
          <h1>{content.about.headline}</h1>
          <p>{content.about.body}</p>
          <div className="about-stats">
            <Card><strong>2020</strong><span>Founded</span></Card>
            <Card><strong>5+</strong><span>Years expertise</span></Card>
            <Card><strong>8</strong><span>Digital service lines</span></Card>
          </div>
        </div>
        <div className="about-hero-media">
          <img src="/assets/hero-dashboard.png" alt={`${content.settings.company} conference room`} />
        </div>
      </section>

      <section className="about-story section-pad">
        <div className="section-heading">
          <Badge>Our story</Badge>
          <h2>Small enough to move fast, structured enough to deliver well.</h2>
          <p>{content.about.secondBody}</p>
        </div>
        <div className="about-storyline">
          {story.map(([label, title, copy]) => (
            <Card className="story-card" key={label}>
              <CardHeader>
                <span>{label}</span>
                <h3>{title}</h3>
              </CardHeader>
              <CardContent>
                <p>{copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mission about-mission section-pad">
        <Card className="mission-card">
          <CardHeader>
            <Badge>Our Mission</Badge>
            <h2>{content.mission.missionHeadline}</h2>
          </CardHeader>
          <CardContent>
            <p>{content.mission.missionBody}</p>
          </CardContent>
        </Card>
        <Card className="mission-card">
          <CardHeader>
            <Badge>Our Vision</Badge>
            <h2>{content.mission.visionHeadline}</h2>
          </CardHeader>
          <CardContent>
            <p>{content.mission.visionBody}</p>
          </CardContent>
        </Card>
      </section>

      <section className="values about-values section-pad">
        <div className="section-heading centered">
          <Badge>Core values</Badge>
          <h2>The standards behind our work</h2>
        </div>
        <div className="value-grid">
          {content.values.map(([title, copy], index) => (
            <Card className="value-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function ContactPage({ content }) {
  return (
    <main className="contact-page">
      <section className="contact section-pad">
        <div className="contact-copy">
          <Badge>{content.contact.eyebrow}</Badge>
          <h1>{content.contact.headline}</h1>
          <p>{content.contact.body}</p>
          <div className="contact-list" aria-label="Contact details">
            <a href={`mailto:${content.settings.email}`}>{content.settings.email}</a>
            <a href={`tel:${content.settings.phone.replace(/\s+/g, "")}`}>{content.settings.phone}</a>
          </div>
          <div className="contact-service-list" aria-label="Services">
            {content.services.slice(0, 6).map((service) => (
              <span key={service.title}>{service.title}</span>
            ))}
          </div>
        </div>
        <Card className="contact-form">
          <CardHeader>
            <h2>Project enquiry</h2>
            <p>Share a few details and we will get back with the right next step.</p>
          </CardHeader>
          <CardContent>
          <label>
            Name
            <Input type="text" name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <Input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Service
            <Select name="service" defaultValue="">
              <option value="" disabled>Select a service</option>
              {content.services.map((service) => (
                <option key={service.title}>{service.title}</option>
              ))}
            </Select>
          </label>
          <label>
            Message
            <Textarea name="message" rows="4" placeholder="Briefly describe your project" />
          </label>
          <Button type="button">Send Inquiry</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function PageHero({ eyebrow, headline, body }) {
  return (
    <section className="page-hero section-pad">
      <Badge>{eyebrow}</Badge>
      <h1>{headline}</h1>
      <p>{body}</p>
    </section>
  );
}

function PartnerCta({ content, navigate }) {
  return (
    <section className="partners section-pad">
      <div>
        <Badge>{content.partners.eyebrow}</Badge>
        <h2>{content.partners.headline}</h2>
        <p>{content.partners.body}</p>
        <Button as="a" href="/contact" onClick={(event) => {
          event.preventDefault();
          navigate("/contact");
        }}>
          Partner with Signtech
        </Button>
      </div>
      <img src={content.partners.image} alt="Digital growth concept" />
    </section>
  );
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sign in with your admin credentials.");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Checking credentials...");
    try {
      const session = await loginAdmin(username, password);
      localStorage.setItem("signtech-admin-token", session.token);
      onLogin(session.user);
      setStatus("Signed in");
    } catch {
      setStatus("Invalid username or password.");
    }
  };

  return (
    <main className="admin-login-page">
      <Card className="admin-login-card">
        <CardHeader>
          <img src="/assets/logo.png" alt="Signtech" />
          <Badge>Secure Admin</Badge>
          <h1>Sign in to manage Signtech.</h1>
          <p>{status}</p>
        </CardHeader>
        <CardContent>
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label>
              Username
              <Input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              Password
              <Input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <Button type="submit">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function AdminPage({ content, setContent, navigate }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("signtech-admin-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [draft, setDraft] = useState(content);
  const [active, setActive] = useState("overview");
  const [status, setStatus] = useState("Ready");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "settings", label: "Settings" },
  ];

  useEffect(() => {
    if (!user) return;
    fetchAdminContent()
      .then((remote) => {
        const merged = mergeContent(remote);
        setContent(merged);
        setDraft(merged);
      })
      .catch(() => {
        localStorage.removeItem("signtech-admin-token");
        localStorage.removeItem("signtech-admin-user");
        setUser(null);
      });
  }, [user, setContent]);

  const handleLogin = (nextUser) => {
    localStorage.setItem("signtech-admin-user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    localStorage.removeItem("signtech-admin-token");
    localStorage.removeItem("signtech-admin-user");
    setUser(null);
  };

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const setField = (section, key, value) => {
    setDraft((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const setJson = (section, value) => {
    try {
      setDraft((current) => ({ ...current, [section]: JSON.parse(value) }));
      setStatus("Draft updated");
    } catch {
      setStatus("JSON is invalid");
    }
  };

  const handleSave = async () => {
    setStatus("Saving to PostgreSQL...");
    try {
      const saved = await saveContent(draft);
      setContent(mergeContent(saved));
      setStatus("Saved to PostgreSQL");
    } catch {
      setStatus("Save failed. Check your login session and API status.");
    }
  };

  const jsonValue = useMemo(() => JSON.stringify(draft[active], null, 2), [draft, active]);

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/assets/logo.png" alt="Signtech" />
          <Badge>Dashboard</Badge>
        </div>
        <div className="admin-user-card">
          <span className="admin-avatar">{user.username.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <p>{user.role}</p>
          </div>
        </div>
        <Tabs active={active} onChange={setActive} tabs={tabs} />
        <div className="admin-sidebar-actions">
          <Button variant="outline" onClick={() => navigate("/")}>View Site</Button>
          <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <Badge>Content Control</Badge>
            <h1>Website dashboard</h1>
            <p>Update page copy, service data, contact details, and global settings.</p>
          </div>
          <div className="admin-save-box">
            <p>{status}</p>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </header>

        {active === "overview" && (
          <div className="admin-overview-grid">
            <Card className="admin-stat-card">
              <CardHeader><span>Pages</span><strong>4</strong></CardHeader>
              <CardContent><p>Home, Services, About, and Contact are active.</p></CardContent>
            </Card>
            <Card className="admin-stat-card">
              <CardHeader><span>Services</span><strong>{draft.services.length}</strong></CardHeader>
              <CardContent><p>Editable service cards are stored in PostgreSQL.</p></CardContent>
            </Card>
            <Card className="admin-stat-card">
              <CardHeader><span>Database</span><strong>JSONB</strong></CardHeader>
              <CardContent><p>Content saves to the protected admin API.</p></CardContent>
            </Card>
          </div>
        )}

        {active !== "overview" && (
          <Card className="admin-editor-card">
            <CardHeader>
              <h2>{tabs.find((tab) => tab.id === active)?.label} controls</h2>
              <p>Edit this section and save when ready.</p>
            </CardHeader>
            <CardContent>
              {active === "home" && (
                <div className="admin-grid">
                  <Field label="Eyebrow" value={draft.home.eyebrow} onChange={(value) => setField("home", "eyebrow", value)} />
                  <Field label="Headline" value={draft.home.headline} onChange={(value) => setField("home", "headline", value)} />
                  <Field textarea label="Body" value={draft.home.body} onChange={(value) => setField("home", "body", value)} />
                  <Field label="Hero image path" value={draft.home.heroImage} onChange={(value) => setField("home", "heroImage", value)} />
                </div>
              )}
              {active === "about" && (
                <div className="admin-grid">
                  <Field label="Headline" value={draft.about.headline} onChange={(value) => setField("about", "headline", value)} />
                  <Field textarea label="Body" value={draft.about.body} onChange={(value) => setField("about", "body", value)} />
                  <Field textarea label="Second body" value={draft.about.secondBody} onChange={(value) => setField("about", "secondBody", value)} />
                </div>
              )}
              {active === "contact" && (
                <div className="admin-grid">
                  <Field label="Headline" value={draft.contact.headline} onChange={(value) => setField("contact", "headline", value)} />
                  <Field textarea label="Body" value={draft.contact.body} onChange={(value) => setField("contact", "body", value)} />
                </div>
              )}
              {active === "settings" && (
                <div className="admin-grid">
                  <Field label="Company" value={draft.settings.company} onChange={(value) => setField("settings", "company", value)} />
                  <Field label="Email" value={draft.settings.email} onChange={(value) => setField("settings", "email", value)} />
                  <Field label="Phone" value={draft.settings.phone} onChange={(value) => setField("settings", "phone", value)} />
                  <Field textarea label="Footer tagline" value={draft.settings.tagline} onChange={(value) => setField("settings", "tagline", value)} />
                </div>
              )}
              {active === "services" && (
                <label className="admin-json">
                  Services JSON
                  <Textarea rows="20" value={jsonValue} onChange={(event) => setJson("services", event.target.value)} />
                </label>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}

function Field({ label, value, onChange, textarea = false }) {
  const Control = textarea ? Textarea : Input;
  return (
    <label>
      {label}
      <Control value={value || ""} onChange={(event) => onChange(event.target.value)} rows={textarea ? 4 : undefined} />
    </label>
  );
}

function ScrollCursorIndicator() {
  const indicatorRef = useRef(null);

  useEffect(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return undefined;

    let scrollTimer = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    const positionIndicator = () => {
      indicator.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
    };

    const showIndicator = () => {
      document.documentElement.classList.add("is-page-scrolling");
      indicator.classList.add("is-active");
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-page-scrolling");
        indicator.classList.remove("is-active");
      }, 260);
    };

    const handlePointerMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      positionIndicator();
    };

    const handleScroll = () => {
      positionIndicator();
      showIndicator();
    };

    positionIndicator();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("is-page-scrolling");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="scroll-cursor-indicator" ref={indicatorRef} aria-hidden="true">
      <span className="scroll-cursor-shell">
        <span className="scroll-cursor-wheel" />
      </span>
      <span className="scroll-cursor-arrow" />
    </div>
  );
}

function PageLoader({ logo, path }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setShowLoader(true);
    const delay = path === "/" ? 1900 : 1200;
    const timer = window.setTimeout(() => setShowLoader(false), delay);
    return () => window.clearTimeout(timer);
  }, [path]);

  if (!showLoader) return null;

  return (
    <div className="home-loader" role="status" aria-label="Loading Signtech page">
      <div className="loader-mark">
        <span className="loader-logo-orbit" />
        <img src={logo || "/assets/logo.png"} alt="" />
        <span className="loader-logo-shine" />
      </div>
    </div>
  );
}

function App() {
  const { path, navigate } = useRoute();
  const [content, setContent] = useState(defaultContent);
  const [theme, setTheme] = useState(() => localStorage.getItem("signtech-theme") || "dark");

  useEffect(() => {
    fetchContent()
      .then((remote) => setContent(mergeContent(remote)))
      .catch(() => setContent(defaultContent));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("signtech-theme", theme);
  }, [theme]);

  const serviceSlugFromPath = path.startsWith("/services/") ? path.replace("/services/", "") : "";
  const activeService = content.services.find((service) => serviceSlug(service.title) === serviceSlugFromPath);
  const loaderLogo = STATIC_LOGOS[theme] || STATIC_LOGOS.dark;
  const page =
    activeService ? <ServiceDetailPage content={content} navigate={navigate} service={activeService} /> :
    path === "/services" ? <ServicesPage content={content} navigate={navigate} /> :
    path === "/about" ? <AboutPage content={content} /> :
    path === "/contact" ? <ContactPage content={content} /> :
    path === "/admin" ? <AdminPage content={content} navigate={navigate} setContent={setContent} /> :
    <HomePage content={content} navigate={navigate} />;

  if (path === "/admin") {
    return (
      <>
        <PageLoader logo={loaderLogo} path={path} />
        {page}
      </>
    );
  }

  return (
    <Layout content={content} navigate={navigate} path={path} setTheme={setTheme} theme={theme}>
      <PageLoader logo={loaderLogo} path={path} />
      <ScrollCursorIndicator />
      {page}
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(<App />);
