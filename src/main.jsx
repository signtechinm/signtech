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

const CAPABILITY_STICKY_END_Y = 4000;
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
  const [capabilityActiveStep, setCapabilityActiveStep] = useState(0);
  const [isCapabilitySwiping, setIsCapabilitySwiping] = useState(false);
  const capabilityStepCount = Math.max(1, Math.ceil(featuredServices.length / 2));
  const timelineItems = [
    ["home-hero", "Hero"],
    ["home-capabilities", "Capabilities"],
    ["home-solution", "Solution"],
    ["home-process", "Method"],
    ["home-stack", "Stack"],
    ["home-contact", "Contact"],
  ];
  const solutionMechanism = [
    ["01", "Understand the need", "We study your business goal, users, current process, and the gaps that are slowing growth."],
    ["02", "Shape the solution", "We define the right mix of website, app, API, ecommerce, marketing, and design work for the outcome."],
    ["03", "Build the workflow", "We create the interface, backend, integrations, content flow, and launch assets around one connected system."],
    ["04", "Measure and improve", "We review performance, user response, enquiries, and operations so the solution keeps getting sharper."],
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
      const section = capabilitiesRef.current;
      const track = capabilityTrackRef.current;
      const viewport = track?.parentElement;
      if (!section || !track || !viewport) return;

      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 78;
      const stickyTop = headerHeight;
      const sectionPageTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollRunway = Math.max(1, CAPABILITY_STICKY_END_Y + stickyTop - sectionPageTop);
      section.style.setProperty("--capability-sticky-top", `${stickyTop}px`);
      section.style.setProperty("--capability-scroll-space", `${scrollRunway}px`);

      if (window.innerWidth <= 860 || maxShift <= 0) {
        track.style.transform = "translate3d(0, 0, 0)";
        section.style.setProperty("--capability-progress", "0");
        setCapabilityActiveStep(0);
        return;
      }

      const sectionTop = section.getBoundingClientRect().top;
      const elapsed = stickyTop - sectionTop;
      const stickyTravel = scrollRunway;
      const progress = Math.min(1, Math.max(0, elapsed / stickyTravel));
      const isScrollActive = elapsed >= 0 && window.scrollY <= CAPABILITY_STICKY_END_Y;
      const stickyOffset = isScrollActive ? Math.max(0, elapsed) : 0;
      section.style.setProperty("--capability-pin-offset", `${stickyOffset}px`);
      const shift = maxShift * progress;
      track.style.transform = `translate3d(${-shift}px, 0, 0)`;
      section.style.setProperty("--capability-progress", progress.toFixed(3));
      const nextStep = Math.min(capabilityStepCount - 1, Math.round(progress * (capabilityStepCount - 1)));
      setCapabilityActiveStep((currentStep) => currentStep === nextStep ? currentStep : nextStep);
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
        className="home-capabilities"
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
          <div
            className="capability-meter"
            aria-label={`Capabilities scroll point ${capabilityActiveStep + 1} of ${capabilityStepCount}`}
            style={{ "--meter-progress": capabilityStepCount > 1 ? capabilityActiveStep / (capabilityStepCount - 1) : 0 }}
          >
            {Array.from({ length: capabilityStepCount }).map((_, index) => (
              <span
                aria-hidden="true"
                className={index === capabilityActiveStep ? "active" : ""}
                key={index}
              />
            ))}
          </div>
        </div>
        <div className="capability-scroll-space" aria-hidden="true" />
      </section>

      <section className="home-solution section-pad" id="home-solution">
        <div className="section-heading centered">
          <Badge>Solution mechanism</Badge>
          <h2>We turn a business problem into a working digital system.</h2>
          <p>
            Every project is planned as a practical mechanism: inputs from your team,
            the right technical workstream, a clear delivery flow, and measurable output after launch.
          </p>
        </div>
        <div className="solution-mechanism-grid">
          {solutionMechanism.map(([step, title, copy]) => (
            <Card className="solution-mechanism-card" key={step}>
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

function ShafeekPage() {
  const pageRef = useRef(null);
  const storyRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const progressRef = useRef(0);
  const loaderRef = useRef(1);
  const shapeTargetRef = useRef(0);
  const shapeDisplayRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const shatterRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePortfolioSection, setActivePortfolioSection] = useState(0);

  const portfolioSections = [
    {
      eyebrow: "Portfolio",
      title: "Shafeek ES",
      body: "AI-powered full stack web developer from Thrissur, Kerala, with 7+ years of experience building scalable, secure, and high-performance digital products.",
      meta: "Laravel | WordPress | DeFi | Automation",
      items: ["Thrissur, Kerala", "7+ years", "Full stack", "AI-powered workflows"],
    },
    {
      eyebrow: "Web & Apps",
      title: "Modern product stack",
      body: "Building web and app experiences across Laravel, React, Next.js, WordPress, ecommerce, PHP, JavaScript, and database-backed systems.",
      meta: "Web and app technologies",
      items: ["Laravel 10", "Next.js 15", "React 19", "TypeScript", "CodeIgniter", "WordPress", "WooCommerce", "Shopify", "HTML5", "CSS3", "PHP", "JavaScript ES6+", "jQuery", "MySQL", "PostgreSQL"],
    },
    {
      eyebrow: "Blockchain",
      title: "Web3 and DeFi systems",
      body: "Experience building token, staking, presale, governance, and blockchain-integrated product flows with smart contract tooling.",
      meta: "DeFi, tokens, smart contracts",
      items: ["Solidity 0.8.x", "Hardhat", "Ethers.js", "Wagmi", "Viem", "RainbowKit", "OpenZeppelin", "Smart Contract Auditing", "Token Presale", "Staking Integration"],
    },
    {
      eyebrow: "APIs",
      title: "Secure connected platforms",
      body: "Designing and integrating APIs, authentication, frontend data layers, and Web3 signature flows for real application workflows.",
      meta: "Frameworks and APIs",
      items: ["RESTful APIs", "GraphQL APIs", "TanStack Query", "React Context", "NextAuth.js", "JWT Auth", "Web3 Signatures"],
    },
    {
      eyebrow: "Interface",
      title: "UI, design, and motion",
      body: "Designing responsive interfaces, dark and light modes, design systems, prototypes, and motion-enhanced frontend experiences.",
      meta: "UI and design tools",
      items: ["Tailwind CSS", "Radix UI", "Framer Motion", "Figma", "Photoshop", "Canva", "Responsive Design", "Dark/Light Mode Design"],
    },
    {
      eyebrow: "AI & Automation",
      title: "Faster intelligent workflows",
      body: "Using AI for prototyping, debugging, automation, planning, and developer acceleration across full stack product delivery.",
      meta: "AI-assisted development",
      items: ["ChatGPT", "Claude AI", "GitHub Copilot", "Prompt Engineering", "AI-Driven Prototyping", "AI Debugging", "AI Workflow Automation"],
    },
    {
      eyebrow: "Delivery",
      title: "Deployment and growth",
      body: "Handling deployment, migrations, analytics, SEO, hosting panels, serverless releases, and production troubleshooting.",
      meta: "DevOps, analytics, SEO",
      items: ["GitHub CI/CD", "Vercel", "cPanel", "AWS", "Database Migrations", "Serverless Deployments", "Google Analytics", "SEO Optimization", "Real-Time APIs", "CoinGecko APIs"],
    },
    {
      eyebrow: "Experience",
      title: "Senior Web Developer",
      body: "Working at Calpar Global since 2017, currently as Senior Web Developer. Led Laravel, CodeIgniter, WordPress, hosting, planning, troubleshooting, CRM, logistics, school management, and delivery system projects.",
      meta: "Calpar Global | Aug 2019 - Present",
      items: ["Senior Web Developer", "Junior Web Developer", "Junior PHP Developer", "MVC Architecture", "Project Planning", "Troubleshooting"],
    },
    {
      eyebrow: "Selected Work",
      title: "Products with real systems",
      body: "Key projects include GlobalChain Finance, a real-world asset tokenisation platform, KCG Warehouse Management System, CampusConnect, Ridex Vehicle Rental Management, Haya App, WADIM, MMRF App, Aqua Dip, CPS, and TJSV.",
      meta: "shafeekes999@gmail.com | +91 7012808718",
      items: ["GlobalChain Finance", "KCG Warehouse Management", "CampusConnect", "Ridex Vehicle Rental Management", "Haya App", "WADIM", "MMRF App", "Aqua Dip", "CPS", "TJSV", "Basma School Management", "Career Explorer"],
    },
    {
      eyebrow: "More",
      title: "Education and languages",
      body: "Diploma in Web Engineering from Ociuz Infotech, BSc Computer Science from University of Calicut, plus practical communication across English, Malayalam, Hindi, and Tamil.",
      meta: "Available for projects and collaborations",
      items: ["Flutter Basics", "AI-Enhanced Cross-Platform Apps", "English", "Malayalam", "Hindi", "Tamil", "BSc Computer Science", "Diploma in Web Engineering"],
    },
  ];

  const proofStats = [
    ["7+", "Years building production web systems"],
    ["30+", "Web, ecommerce, CRM, and business tools"],
    ["Full stack", "Laravel, React, WordPress, APIs, and automation"],
    ["Thrissur", "Available for projects and collaborations"],
  ];

  const featuredProjects = [
    {
      title: "GlobalChain Finance",
      type: "Real-world asset tokenisation platform",
      summary: "Production-oriented RWA tokenisation and digital investment platform with marketplace, wallet auth, KYC, asset submission, GFC token presale, and admin operations.",
      role: "Full stack architecture, Next.js product build, Web3 integration, API/database workflows",
      stack: ["Next.js", "TypeScript", "PostgreSQL", "Solidity", "Hardhat", "Wagmi", "Viem"],
      outcome: "Built a connected platform foundation linking business data, investor journeys, admin review flows, and blockchain-backed asset participation.",
    },
    {
      title: "KCG Warehouse Management",
      type: "Construction warehouse management system",
      summary: "Centralized inventory platform for a UAE construction company covering materials, equipment, supplier deliveries, site returns, stock adjustments, low-stock alerts, and project-specific tracking.",
      role: "System planning, backend architecture, inventory workflows, admin dashboard, reporting",
      stack: ["Laravel", "MySQL", "REST API", "Bootstrap", "JavaScript"],
      outcome: "Replaced Excel-based tracking with real-time warehouse visibility across projects, divisions, suppliers, and site operations.",
    },
    {
      title: "CampusConnect",
      type: "International education CRM/admin system",
      summary: "Laravel CRM for student recruitment and admissions workflows with leads, assignments, follow-ups, calls, documents, applications, offer letters, fees, CAS, visas, reports, country scoping, and master data.",
      role: "Laravel module development, CRM workflows, dashboard analytics, reports, permissions, import/export features",
      stack: ["Laravel 10", "Blade", "MySQL", "Spatie Permissions", "Yajra DataTables", "Maatwebsite Excel"],
      outcome: "Centralized the admissions lifecycle from enquiry to application, offer, payment, CAS, visa, and reporting across countries, branches, and intakes.",
    },
    {
      title: "Ridex Vehicle Rental Management",
      type: "Vehicle rental operations system",
      summary: "Production vehicle rental platform for browsing vehicles, managing bookings, admin operations, media/static assets, and live deployment workflows for ridexrentals.in.",
      role: "Django development, booking flow fixes, frontend templates, deployment scripts, server operations",
      stack: ["Django", "Python", "SQLite", "HTML", "CSS", "JavaScript", "Linux"],
      outcome: "Built and maintained a live rental workflow with quick deployment scripts, local development tooling, backups, and production service management.",
    },
  ];

  const skillGroups = [
    {
      title: "Product Development",
      skills: ["Laravel", "React", "Next.js", "PHP", "JavaScript", "TypeScript"],
    },
    {
      title: "CMS & Ecommerce",
      skills: ["WordPress", "WooCommerce", "Shopify", "Custom themes", "Payment flows"],
    },
    {
      title: "APIs & Backend",
      skills: ["REST APIs", "GraphQL", "JWT Auth", "PostgreSQL", "MySQL", "TanStack Query"],
    },
    {
      title: "Web3 Systems",
      skills: ["Solidity", "Hardhat", "Ethers.js", "Wagmi", "Viem", "Smart contract flows"],
    },
    {
      title: "AI Workflow",
      skills: ["ChatGPT", "Claude AI", "GitHub Copilot", "Prompt engineering", "Automation"],
    },
    {
      title: "Deployment & Growth",
      skills: ["Vercel", "AWS", "cPanel", "CI/CD", "SEO", "Google Analytics"],
    },
  ];

  const experienceTimeline = [
    {
      period: "Aug 2019 - Present",
      role: "Senior Web Developer",
      company: "Calpar Global",
      detail: "Leading Laravel, WordPress, CRM, ecommerce, logistics, and school management system work from planning through production support.",
    },
    {
      period: "2018 - 2019",
      role: "Junior Web Developer",
      company: "Calpar Global",
      detail: "Built backend features, frontend screens, CMS websites, and integrations while supporting client delivery.",
    },
    {
      period: "2017 - 2018",
      role: "Junior PHP Developer",
      company: "Early development work",
      detail: "Started with PHP, MySQL, HTML, CSS, JavaScript, and practical business website development.",
    },
  ];

  const caseStudies = [
    {
      title: "From Manual Operations to Connected Dashboards",
      challenge: "KCG Construction needed to move warehouse operations away from Excel-based tracking while managing materials, equipment, supplier deliveries, site returns, low-stock items, and project allocations across UAE construction sites.",
      approach: "Planned a centralized warehouse system with inventory dashboards, master data, incoming goods, stock adjustments, project-specific filtering, role-based access, reporting, and a roadmap for outgoing requests, approvals, VAT, quality control, and mobile site workflows.",
      result: "Created a practical operating base for real-time inventory visibility, better project cost control, reduced material waste, and cleaner coordination between warehouse teams, site engineers, project managers, and finance.",
    },
    {
      title: "Launching a Web3 Product Experience",
      challenge: "GlobalChain Finance needed to combine RWA asset tokenisation, wallet authentication, KYC workflows, presale mechanics, marketplace browsing, and admin controls inside one production-oriented product.",
      approach: "Built a Next.js and PostgreSQL platform with App Router APIs, wallet/Web3 flows, Solidity contracts, Hardhat tooling, asset submission, KYC review, presale tracking, and admin dashboards.",
      result: "Created a full-stack foundation for asset-backed digital investment workflows, connecting user dashboards, marketplace activity, admin operations, and blockchain confirmations.",
    },
    {
      title: "Modernizing Business Websites for Better Enquiries",
      challenge: "Service pages were not clearly explaining offers or guiding visitors toward meaningful contact.",
      approach: "Reworked page hierarchy, mobile layout, content blocks, performance, and contact paths.",
      result: "A sharper digital presence with clearer service communication and easier enquiry flow.",
    },
  ];

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return undefined;

    let frame = 0;
    const updateLaptop = () => {
      frame = 0;
      const rect = story.getBoundingClientRect();
      const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const activeSection = Math.min(portfolioSections.length - 1, Math.floor(progress * portfolioSections.length));
      progressRef.current = progress;
      shapeTargetRef.current = activeSection;
      setActivePortfolioSection(activeSection);
      story.style.setProperty("--laptop-open", progress.toFixed(3));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateLaptop);
    };

    updateLaptop();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;

    const updateLoader = (now) => {
      const elapsed = now - startedAt;
      loaderRef.current = Math.max(0, 1 - elapsed / 1700);
      if (elapsed >= 1900) {
        setIsLoading(false);
        return;
      }
      frame = window.requestAnimationFrame(updateLoader);
    };

    frame = window.requestAnimationFrame(updateLoader);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let time = 0;
    let isDisposed = false;

    const random = (seed) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return value - Math.floor(value);
    };

    const portraitVectorSource = "/assets/portrait_dotted_vector.svg";

    const loadPortraitTargets = () =>
      new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
          const sampleWidth = 420;
          const sampleHeight = Math.round(sampleWidth * (image.naturalHeight / image.naturalWidth));
          const sampler = document.createElement("canvas");
          const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
          const points = [];

          if (!samplerContext) {
            resolve(points);
            return;
          }

          sampler.width = sampleWidth;
          sampler.height = sampleHeight;
          samplerContext.fillStyle = "#000";
          samplerContext.fillRect(0, 0, sampleWidth, sampleHeight);
          samplerContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);

          const { data } = samplerContext.getImageData(0, 0, sampleWidth, sampleHeight);
          const portraitHeight = 1.86;
          const portraitWidth = portraitHeight * (image.naturalWidth / image.naturalHeight);
          const getRawLuminance = (sampleX, sampleY) => {
            const clampedX = Math.min(sampleWidth - 1, Math.max(0, sampleX));
            const clampedY = Math.min(sampleHeight - 1, Math.max(0, sampleY));
            const offset = (clampedY * sampleWidth + clampedX) * 4;
            const alpha = data[offset + 3] / 255;
            return ((data[offset] + data[offset + 1] + data[offset + 2]) / 3) * alpha;
          };
          const getLuminance = (sampleX, sampleY) => {
            let total = 0;
            let count = 0;
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                total += getRawLuminance(sampleX + dx, sampleY + dy);
                count++;
              }
            }
            return total / count;
          };
          const getPortraitTone = (sampleX, sampleY, luminance, edge = false) => {
            const xRatio = sampleX / sampleWidth;
            const yRatio = sampleY / sampleHeight;
            const faceOvalX = (xRatio - 0.5) / 0.38;
            const faceOvalY = (yRatio - 0.46) / 0.30;
            const isFaceArea = faceOvalX * faceOvalX + faceOvalY * faceOvalY < 1;
            const isEarArea = yRatio > 0.38 && yRatio < 0.58 && (xRatio < 0.22 || xRatio > 0.78);
            const isHairArea = yRatio < 0.34 && xRatio > 0.18 && xRatio < 0.75;
            const isBeardArea = yRatio > 0.58 && yRatio < 0.72 && xRatio > 0.3 && xRatio < 0.7;
            const isNeckArea = yRatio > 0.66 && yRatio < 0.84 && xRatio > 0.32 && xRatio < 0.68;
            const isDressArea = yRatio > 0.76 && xRatio > 0.1 && xRatio < 0.9;
            if (isFaceArea || isEarArea) {
              if (luminance > 140) return "skinHighlight";
              if (luminance > 80) return "skin";
              if (luminance > 45) return "skinShadow";
              return "skinFill";
            }
            if (isNeckArea) {
              if (luminance > 100) return "skinHighlight";
              if (luminance > 55) return "skin";
              if (luminance > 30) return "skinShadow";
              return "skinFill";
            }
            if (isDressArea) {
              if (luminance > 120) return "dressHighlight";
              if (luminance > 60) return "dress";
              if (luminance > 30) return "dressShadow";
              return "dressFill";
            }
            if (isHairArea || isBeardArea) return luminance > 150 ? "hairLight" : "hair";
            return "";
          };

          const pushPoint = (sampleX, sampleY, luminance, edge = false, toneOverride = "", fill = false) => {
            const clampedX = Math.min(sampleWidth - 1, Math.max(0, sampleX));
            const clampedY = Math.min(sampleHeight - 1, Math.max(0, sampleY));
            points.push({
              x: (clampedX / (sampleWidth - 1) - 0.5) * portraitWidth,
              y: (clampedY / (sampleHeight - 1) - 0.5) * portraitHeight,
              z: luminance > 150 || edge ? 0.04 : -0.03,
              edge,
              tone: toneOverride || getPortraitTone(clampedX, clampedY, luminance, edge),
              fill,
            });
          };

          for (let y = 0; y < sampleHeight; y += 3) {
            for (let x = 0; x < sampleWidth; x += 3) {
              const luminance = getLuminance(x, y);
              const xRatio = x / sampleWidth;
              const yRatio = y / sampleHeight;
              const faceOvalX = (xRatio - 0.5) / 0.38;
              const faceOvalY = (yRatio - 0.46) / 0.30;
              const isFaceArea = faceOvalX * faceOvalX + faceOvalY * faceOvalY < 1;
              const isEarArea = yRatio > 0.38 && yRatio < 0.58 && (xRatio < 0.22 || xRatio > 0.78);
              const isNeckArea = yRatio > 0.66 && yRatio < 0.84 && xRatio > 0.32 && xRatio < 0.68;
              const isDressArea = yRatio > 0.76 && xRatio > 0.1 && xRatio < 0.9;
              if (luminance < 48) {
                if ((isFaceArea || isEarArea) && (x + y) % 9 < 4) {
                  pushPoint(x, y, 72, false, "skinFill", true);
                } else if (isNeckArea && (x + y) % 9 < 4) {
                  pushPoint(x, y, 60, false, "skinFill", true);
                } else if (isDressArea && (x + y) % 9 < 5) {
                  pushPoint(x, y, 50, false, "dressFill", true);
                }
                continue;
              }

              const surroundingBright = Math.max(
                getLuminance(x - 2, y),
                getLuminance(x + 2, y),
                getLuminance(x, y - 2),
                getLuminance(x, y + 2)
              );
              const surroundingDark = Math.min(
                getLuminance(x - 2, y),
                getLuminance(x + 2, y),
                getLuminance(x, y - 2),
                getLuminance(x, y + 2)
              );
              const contrast = surroundingBright - surroundingDark;
              pushPoint(x, y, luminance, luminance > 100 || contrast > 32);
              if (isFaceArea && luminance > 42) {
                pushPoint(x + 1, y + 1, luminance, luminance > 90 || contrast > 24);
                if (luminance > 70 || contrast > 30) {
                  pushPoint(x - 1, y + 1, luminance, true);
                }
                if (luminance > 55 || contrast > 28) {
                  pushPoint(x + 1, y - 1, luminance, luminance > 80 || contrast > 30);
                }
              }
            }
          }

          resolve(points);
        };

        image.onerror = () => resolve([]);
        image.src = portraitVectorSource;
      });

    const createParticles = (portraitTargets = []) => {
      const particles = [];
      const makePoint = (seed, x, y, z, edge = false) => ({
        x: x + (random(seed + 1) - 0.5) * (edge ? 0.006 : 0.018),
        y: y + (random(seed + 2) - 0.5) * (edge ? 0.006 : 0.018),
        z: z + (random(seed + 3) - 0.5) * 0.018,
        edge,
      });

      const linePoint = (seed, x1, y1, z1, x2, y2, z2, amount) => {
        const progress = random(seed + 4);
        return makePoint(
          seed,
          x1 + (x2 - x1) * progress,
          y1 + (y2 - y1) * progress,
          z1 + (z2 - z1) * progress,
          true
        );
      };

      const rectPoint = (seed, left, top, right, bottom, z, edgeBias = 0.55) => {
        if (random(seed + 5) < edgeBias) {
          const side = Math.floor(random(seed + 6) * 4);
          if (side === 0) return linePoint(seed, left, top, z, right, top, z, 1);
          if (side === 1) return linePoint(seed, right, top, z, right, bottom, z, 1);
          if (side === 2) return linePoint(seed, right, bottom, z, left, bottom, z, 1);
          return linePoint(seed, left, bottom, z, left, top, z, 1);
        }
        return makePoint(seed, left + random(seed + 7) * (right - left), top + random(seed + 8) * (bottom - top), z);
      };

      const circlePoint = (seed, cx, cy, radius, z, edgeBias = 0.65) => {
        const angle = random(seed + 9) * Math.PI * 2;
        const distance = random(seed + 10) < edgeBias ? radius : Math.sqrt(random(seed + 11)) * radius;
        return makePoint(seed, cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, z, distance > radius * 0.82);
      };

      const roundedRectPoint = (seed, left, top, right, bottom, z, radius = 0.08, edgeBias = 0.62) => {
        const width = right - left;
        const height = bottom - top;
        const edge = random(seed + 26) < edgeBias;
        if (!edge) {
          return makePoint(
            seed,
            left + radius + random(seed + 27) * Math.max(0.001, width - radius * 2),
            top + radius + random(seed + 28) * Math.max(0.001, height - radius * 2),
            z
          );
        }

        const perimeter = 2 * (width + height - 4 * radius) + Math.PI * 2 * radius;
        let distance = random(seed + 29) * perimeter;
        const lineTop = width - radius * 2;
        const lineSide = height - radius * 2;
        const arc = Math.PI * radius * 0.5;

        if (distance < lineTop) return makePoint(seed, left + radius + distance, top, z, true);
        distance -= lineTop;
        if (distance < arc) {
          const angle = -Math.PI / 2 + (distance / arc) * Math.PI / 2;
          return makePoint(seed, right - radius + Math.cos(angle) * radius, top + radius + Math.sin(angle) * radius, z, true);
        }
        distance -= arc;
        if (distance < lineSide) return makePoint(seed, right, top + radius + distance, z, true);
        distance -= lineSide;
        if (distance < arc) {
          const angle = (distance / arc) * Math.PI / 2;
          return makePoint(seed, right - radius + Math.cos(angle) * radius, bottom - radius + Math.sin(angle) * radius, z, true);
        }
        distance -= arc;
        if (distance < lineTop) return makePoint(seed, right - radius - distance, bottom, z, true);
        distance -= lineTop;
        if (distance < arc) {
          const angle = Math.PI / 2 + (distance / arc) * Math.PI / 2;
          return makePoint(seed, left + radius + Math.cos(angle) * radius, bottom - radius + Math.sin(angle) * radius, z, true);
        }
        distance -= arc;
        if (distance < lineSide) return makePoint(seed, left, bottom - radius - distance, z, true);
        distance -= lineSide;
        const angle = Math.PI + (distance / arc) * Math.PI / 2;
        return makePoint(seed, left + radius + Math.cos(angle) * radius, top + radius + Math.sin(angle) * radius, z, true);
      };

      const curvedLinePoint = (seed, x1, y1, cx, cy, x2, y2, z) => {
        const t = random(seed + 30);
        const oneMinusT = 1 - t;
        return makePoint(
          seed,
          oneMinusT * oneMinusT * x1 + 2 * oneMinusT * t * cx + t * t * x2,
          oneMinusT * oneMinusT * y1 + 2 * oneMinusT * t * cy + t * t * y2,
          z,
          true
        );
      };

      const taperedBasePoint = (seed) => {
        const y = -0.02 + random(seed + 31) * 0.86;
        const progress = (y + 0.02) / 0.86;
        const halfWidth = 0.63 + progress * 0.18;
        const edge = random(seed + 32) < 0.76;
        if (edge) {
          const side = Math.floor(random(seed + 33) * 4);
          if (side === 0) return curvedLinePoint(seed, -0.62, -0.03, 0, -0.1, 0.62, -0.03, 0.08);
          if (side === 1) return curvedLinePoint(seed, 0.62, -0.03, 0.86, 0.38, 0.8, 0.84, 0.09);
          if (side === 2) return curvedLinePoint(seed, 0.8, 0.84, 0, 0.95, -0.8, 0.84, 0.1);
          return curvedLinePoint(seed, -0.8, 0.84, -0.86, 0.38, -0.62, -0.03, 0.09);
        }
        return makePoint(seed, (random(seed + 34) - 0.5) * halfWidth * 2, y, 0.08);
      };

      const laptopPoint = (seed) => {
        const section = random(seed + 12);
        if (section < 0.32) return roundedRectPoint(seed, -0.64, -0.8, 0.64, -0.23, -0.38, 0.12, 0.86);
        if (section < 0.38) return curvedLinePoint(seed, -0.72, -0.11, 0, -0.16, 0.72, -0.11, 0.03);
        if (section < 0.56) return taperedBasePoint(seed);
        if (section < 0.86) {
          const row = Math.floor(random(seed + 13) * 5);
          const col = Math.floor(random(seed + 14) * 12);
          return roundedRectPoint(seed, -0.52 + col * 0.095, 0.12 + row * 0.09, -0.47 + col * 0.095, 0.15 + row * 0.09, 0.12, 0.012, 0.9);
        }
        return roundedRectPoint(seed, -0.23, 0.66, 0.23, 0.8, 0.14, 0.04, 0.76);
      };

      const profilePoint = (seed) => {
        const section = random(seed + 15);
        if (section < 0.42) return circlePoint(seed, 0, -0.36, 0.28, 0.03, 0.78);
        if (section < 0.7) return circlePoint(seed, -0.1, -0.38, 0.06, 0.04, 0.45);
        if (section < 0.82) return circlePoint(seed, 0.1, -0.38, 0.06, 0.04, 0.45);
        return curvedLinePoint(seed, -0.52, 0.62, 0, -0.02, 0.52, 0.62, 0.08);
      };

      const workPoint = (seed) => {
        const section = random(seed + 16);
        if (section < 0.32) return roundedRectPoint(seed, -0.68, -0.62, 0.68, 0.58, 0.02, 0.12, 0.82);
        if (section < 0.5) return linePoint(seed, -0.52, -0.28, 0.05, -0.24, 0, 0.05, 1);
        if (section < 0.66) return linePoint(seed, -0.24, 0, 0.05, -0.52, 0.28, 0.05, 1);
        if (section < 0.82) return linePoint(seed, 0.52, -0.28, 0.05, 0.24, 0, 0.05, 1);
        return linePoint(seed, 0.24, 0, 0.05, 0.52, 0.28, 0.05, 1);
      };

      const contactPoint = (seed) => {
        const section = random(seed + 17);
        if (section < 0.58) return roundedRectPoint(seed, -0.68, -0.36, 0.68, 0.42, 0.02, 0.1, 0.82);
        if (section < 0.78) return curvedLinePoint(seed, -0.66, -0.32, -0.24, 0.06, 0, 0.08, 0.03);
        return curvedLinePoint(seed, 0.66, -0.32, 0.24, 0.06, 0, 0.08, 0.03);
      };

      const monogramPoint = (seed) => {
        const section = random(seed + 70);
        if (section < 0.28) return circlePoint(seed, 0, 0, 0.58, 0.02, 0.92);
        if (section < 0.44) return curvedLinePoint(seed, -0.56, -0.16, -0.02, -0.34, 0.56, -0.16, 0.05);
        if (section < 0.6) return curvedLinePoint(seed, -0.56, 0.16, -0.02, 0.34, 0.56, 0.16, 0.05);
        if (section < 0.74) return curvedLinePoint(seed, -0.18, -0.54, -0.34, 0, -0.18, 0.54, 0.06);
        if (section < 0.88) return curvedLinePoint(seed, 0.18, -0.54, 0.34, 0, 0.18, 0.54, 0.06);
        return curvedLinePoint(seed, -0.68, 0.22, 0.02, -0.66, 0.68, -0.22, 0.12);
      };

      const portraitPoint = (seed) => {
        if (!portraitTargets.length) return monogramPoint(seed);

        const point = portraitTargets[Math.floor(((seed * 0.61803398875) % 1) * portraitTargets.length)];
        return {
          ...makePoint(seed, point.x, point.y, point.z, point.edge),
          tone: point.tone,
          fill: point.fill,
        };
      };

      const stackPoint = (seed) => {
        const section = random(seed + 71);
        if (section < 0.28) return roundedRectPoint(seed, -0.64, -0.5, 0.48, -0.1, 0.02, 0.1, 0.82);
        if (section < 0.56) return roundedRectPoint(seed, -0.48, -0.06, 0.64, 0.34, 0.08, 0.1, 0.82);
        if (section < 0.78) return roundedRectPoint(seed, -0.56, 0.38, 0.56, 0.66, 0.14, 0.08, 0.76);
        return curvedLinePoint(seed, -0.7, -0.65, 0.1, -0.88, 0.72, -0.5, 0.04);
      };

      const web3Point = (seed) => {
        const section = random(seed + 72);
        const hex = (cx, cy, radius, z) => {
          const side = Math.floor(random(seed + 73) * 6);
          const a1 = (Math.PI / 3) * side + Math.PI / 6;
          const a2 = (Math.PI / 3) * (side + 1) + Math.PI / 6;
          return linePoint(seed, cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius, z, cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius, z, 1);
        };
        if (section < 0.44) return hex(0, 0, 0.56, 0.06);
        if (section < 0.62) return circlePoint(seed, -0.34, -0.22, 0.11, 0.1, 0.82);
        if (section < 0.8) return circlePoint(seed, 0.36, -0.05, 0.11, 0.1, 0.82);
        return circlePoint(seed, 0.02, 0.36, 0.11, 0.1, 0.82);
      };

      const apiPoint = (seed) => {
        const section = random(seed + 74);
        if (section < 0.22) return circlePoint(seed, -0.52, -0.34, 0.13, 0.05, 0.82);
        if (section < 0.44) return circlePoint(seed, 0.5, -0.28, 0.13, 0.05, 0.82);
        if (section < 0.66) return circlePoint(seed, -0.18, 0.42, 0.13, 0.05, 0.82);
        if (section < 0.82) return curvedLinePoint(seed, -0.42, -0.28, -0.02, -0.58, 0.4, -0.24, 0.04);
        return curvedLinePoint(seed, 0.38, -0.18, 0.25, 0.36, -0.08, 0.38, 0.04);
      };

      const designPoint = (seed) => {
        const section = random(seed + 75);
        if (section < 0.5) return circlePoint(seed, 0, 0, 0.54, 0.04, 0.72);
        if (section < 0.62) return circlePoint(seed, -0.25, -0.16, 0.07, 0.08, 0.7);
        if (section < 0.74) return circlePoint(seed, 0.02, -0.28, 0.07, 0.08, 0.7);
        if (section < 0.86) return circlePoint(seed, 0.25, -0.1, 0.07, 0.08, 0.7);
        return curvedLinePoint(seed, 0.28, 0.24, 0.56, 0.4, 0.16, 0.5, 0.08);
      };

      const aiPoint = (seed) => {
        const section = random(seed + 76);
        const nodes = [
          [-0.48, -0.36],
          [0, -0.5],
          [0.46, -0.28],
          [-0.32, 0.12],
          [0.22, 0.14],
          [-0.02, 0.48],
        ];
        const nodeIndex = Math.floor(random(seed + 77) * nodes.length);
        if (section < 0.48) return circlePoint(seed, nodes[nodeIndex][0], nodes[nodeIndex][1], 0.09, 0.07, 0.8);
        const nextIndex = (nodeIndex + 1 + Math.floor(random(seed + 78) * 3)) % nodes.length;
        return curvedLinePoint(seed, nodes[nodeIndex][0], nodes[nodeIndex][1], 0, 0, nodes[nextIndex][0], nodes[nextIndex][1], 0.04);
      };

      const cloudPoint = (seed) => {
        const section = random(seed + 79);
        if (section < 0.26) return circlePoint(seed, -0.28, 0.04, 0.24, 0.06, 0.74);
        if (section < 0.52) return circlePoint(seed, 0, -0.08, 0.3, 0.06, 0.74);
        if (section < 0.72) return circlePoint(seed, 0.32, 0.06, 0.2, 0.06, 0.74);
        return curvedLinePoint(seed, -0.56, 0.18, 0, 0.34, 0.58, 0.18, 0.08);
      };

      const timelinePoint = (seed) => {
        const section = random(seed + 80);
        if (section < 0.22) return curvedLinePoint(seed, -0.54, -0.55, -0.12, -0.24, -0.38, 0.02, 0.04);
        if (section < 0.44) return curvedLinePoint(seed, -0.38, 0.02, -0.56, 0.38, -0.12, 0.56, 0.04);
        if (section < 0.64) return circlePoint(seed, -0.54, -0.55, 0.09, 0.08, 0.82);
        if (section < 0.82) return circlePoint(seed, -0.38, 0.02, 0.09, 0.08, 0.82);
        return circlePoint(seed, -0.12, 0.56, 0.09, 0.08, 0.82);
      };

      const mobilePoint = (seed) => {
        const section = random(seed + 81);
        if (section < 0.64) return roundedRectPoint(seed, -0.28, -0.66, 0.28, 0.66, 0.04, 0.12, 0.86);
        if (section < 0.78) return circlePoint(seed, 0, 0.52, 0.04, 0.09, 0.86);
        return curvedLinePoint(seed, -0.14, -0.5, 0.1, -0.2, -0.08, 0.22, 0.08);
      };

      const shapes = [portraitPoint, stackPoint, web3Point, apiPoint, designPoint, aiPoint, cloudPoint, timelinePoint, workPoint, contactPoint];
      const count = portraitTargets.length
        ? Math.min(17000, Math.max(10500, portraitTargets.length))
        : 5600;
      for (let index = 0; index < count; index += 1) {
        const seed = index + 1;
        const loaderTarget = portraitPoint(seed);
        const isFillParticle = loaderTarget.fill;
        particles.push({
          originX: (random(seed + 18) - 0.5) * 2.4,
          originY: (random(seed + 19) - 0.5) * 1.6,
          originZ: (random(seed + 20) - 0.5) * 0.8,
          targets: shapes.map((shape) => shape(seed)),
          loaderTarget,
          size: isFillParticle
            ? 0.3 + random(seed + 21) * 0.24
            : (loaderTarget.edge ? 0.74 : 0.42) + random(seed + 21) * (loaderTarget.edge ? 0.46 : 0.38),
          alpha: isFillParticle
            ? 0.36 + random(seed + 22) * 0.18
            : (loaderTarget.edge ? 0.68 : 0.4) + random(seed + 22) * (loaderTarget.edge ? 0.2 : 0.24),
          drift: (random(seed + 23) - 0.5) * 1.7,
          pulse: 0.12 + random(seed + 24) * 0.32,
          orbit: 0.7 + random(seed + 25) * 1.15,
          seed,
        });
      }
      particlesRef.current = particles;
    };

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const ease = (value) => value * value * (3 - 2 * value);

    const projectPoint = (x, y, z, rotateX, rotateY, rotateZ, cameraDistance) => {
      const cosY = Math.cos(rotateY);
      const sinY = Math.sin(rotateY);
      const cosX = Math.cos(rotateX);
      const sinX = Math.sin(rotateX);
      const cosZ = Math.cos(rotateZ);
      const sinZ = Math.sin(rotateZ);

      const yawX = x * cosY - z * sinY;
      const yawZ = x * sinY + z * cosY;
      const pitchY = y * cosX - yawZ * sinX;
      const pitchZ = y * sinX + yawZ * cosX;
      const rollX = yawX * cosZ - pitchY * sinZ;
      const rollY = yawX * sinZ + pitchY * cosZ;
      const perspective = cameraDistance / Math.max(0.35, cameraDistance - pitchZ);

      return {
        x: rollX * perspective,
        y: rollY * perspective,
        z: pitchZ,
        perspective,
      };
    };

    const draw = () => {
      time += 0.008;
      const progress = progressRef.current;
      const loader = loaderRef.current;
      shapeDisplayRef.current += (shapeTargetRef.current - shapeDisplayRef.current) * 0.08;
      const portfolioProgress = shapeDisplayRef.current;
      const shapeIndex = Math.min(portfolioSections.length - 2, Math.floor(portfolioProgress));
      const shapeBlend = ease(portfolioProgress - shapeIndex);
      const activeColors = [
        ["#ffffff", "#f8fafc", "#a3a3a3"],
        ["#f8fafc", "#39ff14", "#00b3ff"],
        ["#ffffff", "#b026ff", "#ff3d71"],
        ["#f8fafc", "#00f5d4", "#ffe600"],
        ["#ffffff", "#ff6b00", "#ff2bd6"],
        ["#f8fafc", "#7c3cff", "#00ffb3"],
        ["#ffffff", "#00a8ff", "#ff9f1c"],
        ["#ffffff", "#ffe600", "#00e5ff"],
        ["#f8fafc", "#00ff85", "#ff2bd6"],
        ["#ffffff", "#ff3d71", "#00b3ff"],
      ][Math.min(portfolioSections.length - 1, Math.round(portfolioProgress))];
      const moveRight = ease(Math.min(1, progress * 1.2));
      const idlePulse = 1 + Math.sin(time * 1.4) * 0.025;
      const isMobileViewport = width < 760;
      const scale = Math.min(width * (isMobileViewport ? 0.32 : 0.34), height * (isMobileViewport ? 0.21 : 0.5)) * idlePulse;
      const centerX = width * (isMobileViewport ? 0.68 : 0.72) + width * moveRight * (isMobileViewport ? 0.04 : 0.08) + Math.sin(time * 0.62) * 10;
      const centerY = height * (isMobileViewport ? 0.2 : 0.5) + Math.cos(time * 0.76) * 8;
      const rotateX = -0.08 + Math.sin(time * 0.7) * 0.075;
      const rotateY = Math.sin(time * 0.55) * 0.22 + moveRight * 0.08;
      const rotateZ = Math.sin(time * 0.42) * 0.04;
      const cameraDistance = 2.35;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < 34; index += 1) {
        const seed = index + 4000;
        const driftX = Math.sin(time * (0.55 + random(seed) * 0.45) + seed) * 12;
        const driftY = Math.cos(time * (0.6 + random(seed + 2) * 0.5) + seed) * 9;
        const x = ((random(seed + 4) * width + driftX + time * 4 * random(seed + 6)) % width + width) % width;
        const y = ((random(seed + 8) * height + driftY + time * 3 * random(seed + 10)) % height + height) % height;
        const size = 0.6 + random(seed + 12) * 1.2;

        context.globalAlpha = 0.025 + random(seed + 14) * 0.05;
        context.fillStyle = random(seed + 16) > 0.72 ? "#ffffff" : "#9ca3af";
        context.fillRect(x, y, size, size);
      }

      const projectedParticles = particlesRef.current.map((particle) => {
        const current = particle.targets[shapeIndex] || particle.targets[0];
        const next = particle.targets[shapeIndex + 1] || current;
        const target = {
          x: current.x + (next.x - current.x) * shapeBlend,
          y: current.y + (next.y - current.y) * shapeBlend,
          z: current.z + (next.z - current.z) * shapeBlend,
          edge: current.edge || next.edge,
          fill: current.fill || next.fill,
          tone: shapeIndex === 0 && shapeBlend < 0.72 ? current.tone : "",
        };
        const loaderIn = ease(1 - loader);
        const x = particle.originX + (target.x - particle.originX) * loaderIn;
        const y = particle.originY + (target.y - particle.originY) * loaderIn;
        const z = particle.originZ + (target.z - particle.originZ) * loaderIn;
        const scatter = Math.sin(time * particle.orbit + particle.seed) * particle.drift * 0.08;
        const shimmer = 0.86 + Math.sin(time * 3.2 + particle.seed) * particle.pulse * 0.08;
        const projected = projectPoint(
          x + scatter / Math.max(1, scale),
          y + Math.cos(time * particle.orbit * 1.2 + particle.seed) * 0.0016,
          z,
          rotateX,
          rotateY,
          rotateZ,
          cameraDistance
        );
        let px = centerX + projected.x * scale;
        let py = centerY + projected.y * scale;

        if (!shatterRef.current[particle.seed]) {
          shatterRef.current[particle.seed] = { dx: 0, dy: 0 };
        }
        const shatter = shatterRef.current[particle.seed];
        const mouse = mouseRef.current;
        if (mouse.active) {
          const distX = px - mouse.x;
          const distY = py - mouse.y;
          const dist = Math.sqrt(distX * distX + distY * distY);
          const radius = 80;
          if (dist < radius && dist > 0) {
            const force = (1 - dist / radius) * 18;
            const angle = Math.atan2(distY, distX);
            shatter.dx += Math.cos(angle) * force;
            shatter.dy += Math.sin(angle) * force;
          }
        }
        shatter.dx *= 0.92;
        shatter.dy *= 0.92;
        if (Math.abs(shatter.dx) < 0.01) shatter.dx = 0;
        if (Math.abs(shatter.dy) < 0.01) shatter.dy = 0;
        px += shatter.dx;
        py += shatter.dy;

        const alpha = particle.alpha * shimmer * loaderIn;

        const portraitToneColors = {
          skinHighlight: ["#ffd8b2", "#f6c49b", "#ffe3c4"],
          skin: ["#e0a06f", "#d79263", "#efb27e"],
          skinFill: ["#c88960", "#d99a6f", "#b97855"],
          skinShadow: ["#b87955", "#c8865e", "#9f674a"],
          hairLight: ["#6a4a37", "#7a553d", "#563c2f"],
          hair: ["#3b2a22", "#4a3328", "#2f241f"],
          frame: ["#9ca3af", "#6b7280", "#cbd5e1"],
          dressHighlight: ["#7ea8d4", "#8fb8e0", "#6e9ac8"],
          dress: ["#5580ab", "#4a72a0", "#6088b2"],
          dressShadow: ["#3d6590", "#476d96", "#345a82"],
          dressFill: ["#2e5478", "#38607f", "#284a6c"],
        };
        const portraitTone = target.tone && portraitToneColors[target.tone];
        const portraitColor = portraitTone
          ? portraitTone[Math.floor(random(particle.seed + 143) * portraitTone.length)]
          : "";

        return {
          alpha: portraitColor
            ? Math.min(1, alpha * (target.fill ? 1.12 : target.edge ? 1.62 : 1.34))
            : target.edge
              ? Math.min(1, alpha * 1.32)
              : alpha,
          color: portraitColor || (
            target.edge
              ? random(particle.seed + shapeIndex * 29) > 0.52
                ? activeColors[1]
                : activeColors[2]
              : random(particle.seed + shapeIndex * 31) > 0.66
                ? activeColors[1]
                : random(particle.seed + shapeIndex * 37) > 0.72
                  ? activeColors[2]
                  : activeColors[0]
          ),
          perspective: projected.perspective,
          px,
          py,
          size: particle.size,
          z: projected.z,
        };
      });

      projectedParticles.sort((a, b) => a.z - b.z);
      projectedParticles.forEach((particle) => {
        context.globalAlpha = Math.min(1, Math.max(0.08, particle.alpha));
        context.fillStyle = particle.color;
        const size = particle.size * (0.72 + particle.perspective * 0.42);
        context.beginPath();
        context.arc(particle.px, particle.py, size * 0.5, 0, Math.PI * 2);
        context.fill();
      });

      for (let index = 0; index < 42; index += 1) {
        const seed = 7000 + index;
        const angle = time * (0.42 + random(seed) * 0.5) + random(seed + 1) * Math.PI * 2;
        const radius = scale * (0.48 + random(seed + 2) * 0.28);
        const orbitTilt = Math.sin(angle + random(seed + 3) * 2) * scale * 0.12;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.36 + orbitTilt;
        const size = 1 + random(seed + 4) * 2.2;

        context.globalAlpha = 0.28 + random(seed + 5) * 0.34;
        context.fillStyle = random(seed + 6) > 0.5 ? activeColors[1] : activeColors[2];
        context.fillRect(x, y, size, size);
      }

      context.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMouseMove = (event) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    loadPortraitTargets().then((portraitTargets) => {
      if (isDisposed) return;
      createParticles(portraitTargets);
      draw();
    });
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <main className={`shafeek-page ${isLoading ? "is-loading" : ""}`} ref={pageRef}>
      <canvas className="shafeek-particle-canvas" ref={canvasRef} aria-hidden="true" />
      {isLoading && <div className="shafeek-loader" aria-label="Loading portfolio" />}
      <div className="shafeek-scroll-story" ref={storyRef}>
        <section className="shafeek-portfolio-stage" aria-labelledby="shafeek-title">
          <h1 id="shafeek-title" className="shafeek-hidden-title">Shafeek</h1>
          <div className="portfolio-copy">
            {portfolioSections.map((section, index) => (
              <article className={activePortfolioSection === index ? "active" : ""} key={section.eyebrow}>
                <span>{section.eyebrow}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {section.items && (
                  <ul className="portfolio-skill-list">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                <strong>{section.meta}</strong>
              </article>
            ))}
          </div>
          <div className="portfolio-progress" aria-hidden="true">
            {portfolioSections.map((section, index) => (
              <span className={activePortfolioSection === index ? "active" : ""} key={section.eyebrow} />
            ))}
          </div>
          <div className="shafeek-hero-actions">
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
            <a href="mailto:shafeekes999@gmail.com?subject=Resume%20request">Resume</a>
          </div>
        </section>
      </div>
      <section className="shafeek-content" aria-label="Shafeek portfolio details">
        <div className="shafeek-proof-grid">
          {proofStats.map(([value, label]) => (
            <div className="shafeek-proof-card" key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <section className="shafeek-section" id="projects">
          <div className="shafeek-section-heading">
            <span>Selected Work</span>
            <h2>Projects that show the kind of systems I build</h2>
            <p>Sample content for now. Replace these with final project descriptions, live links, screenshots, metrics, and client-approved details.</p>
          </div>
          <div className="shafeek-project-grid">
            {featuredProjects.map((project) => (
              <article className="shafeek-project-card" key={project.title}>
                <div>
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                  <div>
                    <dt>Outcome</dt>
                    <dd>{project.outcome}</dd>
                  </div>
                </dl>
                <ul>
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="shafeek-section">
          <div className="shafeek-section-heading">
            <span>Capabilities</span>
            <h2>Skills grouped by the value they bring</h2>
          </div>
          <div className="shafeek-skill-grid">
            {skillGroups.map((group) => (
              <article className="shafeek-skill-card" key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="shafeek-section shafeek-about-section">
          <div className="shafeek-section-heading">
            <span>About</span>
            <h2>A practical developer with a product mindset</h2>
          </div>
          <div className="shafeek-about-copy">
            <p>
              I am a full stack developer from Thrissur, Kerala, focused on building useful, maintainable digital products for businesses. My work usually sits between engineering, product planning, UI implementation, and production troubleshooting.
            </p>
            <p>
              I like turning unclear operational problems into structured systems: CRMs, ecommerce stores, dashboards, APIs, Web3 flows, and automation-assisted workflows that teams can actually use every day.
            </p>
          </div>
        </section>

        <section className="shafeek-section">
          <div className="shafeek-section-heading">
            <span>Experience</span>
            <h2>Professional timeline</h2>
          </div>
          <div className="shafeek-timeline">
            {experienceTimeline.map((item) => (
              <article className="shafeek-timeline-item" key={`${item.period}-${item.role}`}>
                <span>{item.period}</span>
                <h3>{item.role}</h3>
                <strong>{item.company}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shafeek-section">
          <div className="shafeek-section-heading">
            <span>Case Studies</span>
            <h2>Replace these with real project stories</h2>
          </div>
          <div className="shafeek-case-grid">
            {caseStudies.map((study) => (
              <article className="shafeek-case-card" key={study.title}>
                <h3>{study.title}</h3>
                <p><strong>Challenge:</strong> {study.challenge}</p>
                <p><strong>Approach:</strong> {study.approach}</p>
                <p><strong>Result:</strong> {study.result}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shafeek-contact-band" id="contact">
          <div>
            <span>Available for selected work</span>
            <h2>Have a product, website, API, or automation idea?</h2>
            <p>Send a short brief and I will help shape the next practical step.</p>
          </div>
          <div className="shafeek-contact-actions">
            <a href="mailto:shafeekes999@gmail.com">shafeekes999@gmail.com</a>
            <a href="tel:+917012808718">+91 7012808718</a>
            <a href="https://wa.me/917012808718">WhatsApp</a>
          </div>
        </section>
      </section>
    </main>
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
    path === "/shafeek" ? <ShafeekPage /> :
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

  if (path === "/shafeek") {
    return page;
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
