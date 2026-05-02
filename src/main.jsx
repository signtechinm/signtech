import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Badge, Button, Card, CardContent, CardHeader, Input, Select, Tabs, Textarea } from "./ui.jsx";
import { defaultContent, mergeContent } from "./content.js";
import "./styles.css";

const routes = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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
  return (
    <>
      <header className="site-header">
        <AppLink className="brand" href="/" navigate={navigate}>
          <img src="/assets/logo.png" alt="Signtech" />
        </AppLink>
        <nav aria-label="Primary navigation">
          {routes.map((route) => (
            <AppLink className={path === route.href ? "active" : ""} href={route.href} key={route.href} navigate={navigate}>
              {route.label}
            </AppLink>
          ))}
          <AppLink className={path === "/admin" ? "active" : ""} href="/admin" navigate={navigate}>
            Admin
          </AppLink>
        </nav>
        <div className="header-actions">
          <button
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="theme-icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="button"
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          </button>
          <Button as="a" className="header-action" href="/contact" onClick={(event) => {
            event.preventDefault();
            navigate("/contact");
          }}>
            Contact Sales
          </Button>
        </div>
      </header>
      {children}
      <footer>
        <img src="/assets/logo.png" alt="Signtech" />
        <p>{content.settings.tagline}</p>
      </footer>
    </>
  );
}

function HomePage({ content, navigate }) {
  const featuredServices = content.services.slice(0, 6);
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

  const activeIndex = Math.max(0, timelineItems.findIndex(([id]) => id === activeSection));

  return (
    <main className="home-redesign">
      <nav className="home-timeline" aria-label="Home page sections" style={{ "--active-index": activeIndex }}>
        {timelineItems.map(([id, label]) => (
          <a aria-label={label} className={activeSection === id ? "active" : ""} href={`#${id}`} key={id}>
            <span />
          </a>
        ))}
      </nav>

      <section className="home-hero section-pad" id="home-hero">
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

      <section className="home-capabilities section-pad" id="home-capabilities">
        <div className="section-heading centered">
          <Badge>Capabilities</Badge>
          <h2>Everything your digital presence needs, organized into clear workstreams.</h2>
          <p>{content.home.body}</p>
        </div>
        <div className="capability-grid">
          {featuredServices.map((service) => (
            <Card className="capability-card" key={service.title}>
              <CardHeader>
                <span className="capability-mark">{service.title.slice(0, 2)}</span>
                <h3>{service.title}</h3>
              </CardHeader>
              <CardContent>
                <p>{service.copy}</p>
                <Button as="a" className="capability-explore" href="/services" variant="outline" onClick={(event) => {
                  event.preventDefault();
                  navigate("/services");
                }}>
                  Explore
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="home-process section-pad" id="home-process">
        <div className="section-heading">
          <Badge>Method</Badge>
          <h2>From first conversation to measurable release.</h2>
        </div>
        <div className="process-grid">
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
          <ServiceCard service={service} key={service.title} />
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

function ServicesPage({ content }) {
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
            <ServiceCard index={index} service={service} key={service.title} />
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
            <Button as="a" href="/contact">Contact Sales</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function ServiceCard({ service, index = 0 }) {
  return (
    <Card className="service-card">
      <CardHeader>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{service.title.slice(0, 2)}</strong>
      </CardHeader>
      <CardContent>
        <h3>{service.title}</h3>
        <p>{service.copy}</p>
        <Button as="a" href="/contact" variant="outline">Discuss Service</Button>
      </CardContent>
    </Card>
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
        <Badge>{content.about.eyebrow}</Badge>
        <h1>{content.about.headline}</h1>
        <p>{content.about.body}</p>
        <div className="about-stats">
          <Card><strong>2020</strong><span>Founded</span></Card>
          <Card><strong>5+</strong><span>Years expertise</span></Card>
          <Card><strong>8</strong><span>Digital service lines</span></Card>
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
    <main>
      <PageHero eyebrow={content.contact.eyebrow} headline={content.contact.headline} body={content.contact.body} />
      <section className="contact section-pad">
        <div className="contact-copy">
          <Badge>Start a project</Badge>
          <h2>Tell us what you want to build.</h2>
          <p>{content.contact.body}</p>
          <div className="contact-list">
            <span>{content.settings.email}</span>
            <span>{content.settings.phone}</span>
          </div>
        </div>
        <Card className="contact-form">
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
      <Control value={value} onChange={(event) => onChange(event.target.value)} rows={textarea ? 4 : undefined} />
    </label>
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

  const page =
    path === "/services" ? <ServicesPage content={content} /> :
    path === "/about" ? <AboutPage content={content} /> :
    path === "/contact" ? <ContactPage content={content} /> :
    path === "/admin" ? <AdminPage content={content} navigate={navigate} setContent={setContent} /> :
    <HomePage content={content} navigate={navigate} />;

  if (path === "/admin") {
    return page;
  }

  return (
    <Layout content={content} navigate={navigate} path={path} setTheme={setTheme} theme={theme}>
      {page}
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(<App />);
