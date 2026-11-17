import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Check,
  Copy,
  Trash2,
  Edit3,
  Users,
  CalendarDays,
  Link,
  Menu,
  X,
  Star,
  Download,
  ExternalLink,
  Leaf,
  Orbit,
  LayoutDashboard,
  BookOpen,
  Gift,
  Settings,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Eye,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  examples,
  load,
  stats,
  uid,
  register,
  KEY,
  empty,
  type Workshop,
  type Workspace,
} from "./data";
import "./style.css";
type Page =
  | "home"
  | "dashboard"
  | "pricing"
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "referrals"
  | "settings";
const Icon = Orbit;
function App() {
  const [data, setData] = useState<Workspace>(load),
    [page, setPage] = useState<Page>("home"),
    [selected, setSelected] = useState<string | null>(
      new URLSearchParams(location.search).get("workshop"),
    ),
    [publicView, setPublicView] = useState(
      !!new URLSearchParams(location.search).get("workshop"),
    ),
    [tab, setTab] = useState("Overview"),
    [modal, setModal] = useState<"edit" | "share" | "certificate" | null>(null),
    [draft, setDraft] = useState<Workshop | null>(null),
    [toast, setToast] = useState(""),
    [tour, setTour] = useState<number | null>(null),
    [query, setQuery] = useState(""),
    [nav, setNav] = useState(false),
    [certPerson, setCertPerson] = useState(""),
    [confirm, setConfirm] = useState<null | {
      message: string;
      run: () => void;
    }>(null);
  const w = data.workshops.find((w) => w.id === selected);
  const s = stats(data.workshops);
  React.useEffect(() => {
    if (new URLSearchParams(location.search).has("ref"))
      track("Referral landing visited");
  }, []);
  function notify(t: string) {
    setToast(t);
    setTimeout(() => setToast(""), 4500);
  }
  function save(next: Workspace) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
    } catch {
      notify("Storage is unavailable or full. Changes could not be saved.");
    }
  }
  function track(action: string, next = data) {
    save({
      ...next,
      events: [...next.events, { action, at: new Date().toISOString() }],
    });
  }
  function update(next: Workshop, action = "Workshop updated") {
    track(action, {
      ...data,
      workshops: data.workshops.map((x) => (x.id === next.id ? next : x)),
    });
    notify(action);
  }
  function go(p: Page) {
    setPage(p);
    setSelected(null);
    setPublicView(false);
    setNav(false);
    window.history.replaceState(null, "", location.pathname);
    window.scrollTo(0, 0);
  }
  function open(x: Workshop, pub = false) {
    setSelected(x.id);
    setPublicView(pub);
    setTab("Overview");
    setPage("dashboard");
    window.scrollTo(0, 0);
  }
  function edit(x?: Workshop) {
    setDraft(
      x
        ? structuredClone(x)
        : {
            id: uid(),
            title: "",
            category: "DESIGN & CREATIVITY",
            description: "",
            date: "2026-12-10",
            time: "10:00",
            location: "",
            host: "",
            capacity: 20,
            color: "peach",
            participants: [],
            resources: [],
            feedback: [],
          },
    );
    setModal("edit");
  }
  function copy(text: string) {
    navigator.clipboard
      ?.writeText(text)
      .then(() => notify("Link copied to clipboard"))
      .catch(() =>
        notify("Copy unavailable. Select and copy the displayed link."),
      );
    track("Share link copied");
  }
  const workshopUrl = (x: Workshop) =>
    `${location.origin}${location.pathname}?workshop=${encodeURIComponent(x.id)}`;
  async function pdf() {
    if (!w) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setDrawColor(36, 89, 77);
    doc.rect(12, 12, 273, 186);
    doc.setTextColor(36, 89, 77);
    doc.setFontSize(14);
    doc.text("BRIGHTORBIT SHAREHUB · DEMO CERTIFICATE", 148, 40, {
      align: "center",
    });
    doc.setFontSize(30);
    doc.text("Certificate of Completion", 148, 65, { align: "center" });
    doc.setFontSize(20);
    doc.text(
      doc.splitTextToSize(certPerson || "Workshop participant", 240),
      148,
      92,
      { align: "center" },
    );
    doc.setFontSize(12);
    doc.text("has completed", 148, 110, { align: "center" });
    doc.setFontSize(20);
    doc.text(doc.splitTextToSize(w.title, 240), 148, 130, { align: "center" });
    doc.setFontSize(12);
    doc.text(`${w.host} · ${w.date}`, 148, 157, { align: "center" });
    doc.text("Prototype preview · Not an accredited qualification", 148, 180, {
      align: "center",
    });
    doc.save("sharehub-certificate.pdf");
    track("Certificate downloaded");
    notify("Certificate PDF downloaded");
  }
  const restore = (reset = false) =>
    setConfirm({
      message: reset
        ? "Reset your workspace? This removes all local workshops and interaction history."
        : "Restore all three original examples? Your current workshops will be replaced.",
      run: () => {
        save(reset ? empty() : { workshops: examples(), events: [] });
        setSelected(null);
        notify(reset ? "Workspace reset" : "Original examples restored");
      },
    });
  return (
    <>
      <header>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
        >
          <span className="brand-icon">
            <Icon size={25} />
          </span>
          <span>
            BrightOrbit<span className="brand-sub">ShareHub</span>
          </span>
        </a>
        <button
          className="mobile-menu icon-btn"
          aria-label="Toggle navigation"
          onClick={() => setNav(!nav)}
        >
          <Menu />
        </button>
        <nav className={nav ? "open" : ""}>
          {(["home", "dashboard", "pricing", "about"] as Page[]).map((p) => (
            <button
              key={p}
              className={page === p && !selected ? "active" : ""}
              onClick={() => go(p)}
            >
              {p === "home"
                ? "Overview"
                : p === "dashboard"
                  ? "My workspace"
                  : p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
        <button
          className="btn small header-cta"
          onClick={() => {
            go("dashboard");
            edit();
          }}
        >
          Create a workshop <ArrowUpRight size={16} />
        </button>
      </header>
      {page === "home" && !selected ? (
        <>
          <main className="landing">
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="tiny-dot" /> LESS ADMIN. MORE AHA MOMENTS.
                </div>
                <h1>
                  One Link.
                  <br />
                  Your Entire
                  <br />
                  <em>Workshop.</em>
                  <span className="spark">✳</span>
                </h1>
                <p>
                  From the first “I’m in” to the final certificate.
                  <br className="desktop" /> Bring your people, resources, and
                  little details
                  <br className="desktop" /> together in one happy place.
                </p>
                <div className="actions">
                  <button
                    className="btn"
                    onClick={() => {
                      go("dashboard");
                      setTour(0);
                    }}
                  >
                    Try your free workspace <ArrowRight size={18} />
                  </button>
                  <button
                    className="text-btn"
                    onClick={() => {
                      if (!data.workshops.length)
                        save({ ...data, workshops: examples() });
                      open(data.workshops[0] || examples()[0], true);
                    }}
                  >
                    Explore a workshop <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="hero-foot">
                  <span>
                    <Check size={14} /> No sign-up needed
                  </span>
                  <span>
                    <Check size={14} /> Free to explore
                  </span>
                  <span>
                    <Check size={14} /> Made for humans
                  </span>
                </div>
              </div>
              <div className="hero-art">
                <div className="orbit-ring ring-one" />
                <div className="orbit-ring ring-two" />
                <span className="art-star">✳</span>
                <div className="float-note">
                  <span className="check-round">
                    <Check size={17} />
                  </span>
                  <div>
                    You make the magic.<small>We’ll keep it together.</small>
                  </div>
                </div>
                <div className="preview-card">
                  <div className="preview-top">
                    <span className="pill">YOUR NEXT GREAT WORKSHOP</span>
                    <span>↗</span>
                  </div>
                  <div className="abstract-art">
                    <div className="shape arch" />
                    <div className="shape circle" />
                    <div className="shape striped" />
                    <span className="flower">✳</span>
                  </div>
                  <div className="preview-body">
                    <span className="eyebrow">DESIGN & CREATIVITY</span>
                    <h3>Creative Thinking Lab</h3>
                    <p>A little curiosity goes a long way.</p>
                    <div className="preview-meta">
                      <span>
                        <CalendarDays size={14} /> Dec 4, 2026
                      </span>
                      <span>
                        <Users size={14} /> 8 people, big ideas
                      </span>
                    </div>
                    <div className="preview-bottom">
                      <div className="avatars">
                        <b>MC</b>
                        <b>AR</b>
                        <b>JL</b>
                        <b>+5</b>
                      </div>
                      <span>
                        Everything. Right here. <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
                <div className="float-resource">
                  <span className="resource-icon">
                    <BookOpen size={20} />
                  </span>
                  <div>
                    Resources? Shared.<small>Good ideas? Unlimited.</small>
                  </div>
                  <CheckCircle2 size={18} />
                </div>
                <div className="handwritten">
                  Your workshop, without the tabs.<span>⤴</span>
                </div>
              </div>
            </section>
            <section className="trust-strip">
              <span>A LITTLE LESS JUGGLING. A LOT MORE POSSIBILITY.</span>
              <div>
                <Users /> Independent trainers
              </div>
              <div>
                <Leaf /> Creative educators
              </div>
              <div>
                <BookOpen /> Community builders
              </div>
            </section>
            <section className="section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">BIG IDEAS. SIMPLE BEGINNINGS.</div>
                  <h2>A space for every kind of spark.</h2>
                </div>
                <button className="text-btn" onClick={() => go("dashboard")}>
                  Meet your workspace <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="workshop-grid">
                {(data.workshops.length ? data.workshops : examples())
                  .slice(0, 3)
                  .map((x) => (
                    <WorkshopCard
                      key={x.id}
                      w={x}
                      onOpen={() => {
                        if (!data.workshops.some((y) => y.id === x.id)) {
                          save({ ...data, workshops: examples() });
                        }
                        open(x, true);
                      }}
                    />
                  ))}
              </div>
            </section>
            <section className="how section">
              <div>
                <div className="eyebrow">ROOM FOR WHAT MATTERS</div>
                <h2>
                  Less scattered.
                  <br />
                  More connected.
                </h2>
                <p>
                  No more hunting through chats, spreadsheets, and inboxes. Just
                  one thoughtful link for the whole journey.
                </p>
                <button
                  className="btn"
                  onClick={() => {
                    go("dashboard");
                    setTour(0);
                  }}
                >
                  See how it works <ArrowRight size={17} />
                </button>
              </div>
              <div className="steps">
                {[
                  [
                    "01",
                    "Make it yours",
                    "Create a workshop page in a few simple steps.",
                  ],
                  [
                    "02",
                    "Bring everyone in",
                    "Share one link for registration, details, and resources.",
                  ],
                  [
                    "03",
                    "Leave a lasting impression",
                    "Track attendance, collect feedback, and celebrate completion.",
                  ],
                ].map(([n, t, d]) => (
                  <article key={n}>
                    <span>{n}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="cta-banner">
              <span>✳</span>
              <h2>
                Your next great workshop
                <br />
                starts with one link.
              </h2>
              <button
                className="btn light"
                onClick={() => {
                  go("dashboard");
                  edit();
                }}
              >
                Let’s make it happen <ArrowUpRight size={18} />
              </button>
              <p>A browser-local prototype. No account. No credit card.</p>
            </section>
          </main>
        </>
      ) : (
        <main className="app-main">
          {!publicView && (
            <div className="workspace-nav">
              {(
                [
                  ["dashboard", "Workspace", LayoutDashboard],
                  ["referrals", "Invite & grow", Gift],
                  ["settings", "Workspace settings", Settings],
                ] as const
              ).map(([p, label, I]) => (
                <button
                  className={page === p ? "active" : ""}
                  onClick={() => go(p)}
                  key={p}
                >
                  <I size={16} />
                  {label}
                </button>
              ))}
              <span className="demo-label">LOCAL DEMO</span>
            </div>
          )}
          {selected && !w ? (
            <section className="empty">
              <h2>Workshop unavailable in this browser</h2>
              <p>
                Shared links are local previews. The workshop data is stored on
                the creator’s device, not a server.
              </p>
              <button className="btn" onClick={() => go("dashboard")}>
                Open my workspace
              </button>
            </section>
          ) : w ? (
            <>
              <button className="text-btn back" onClick={() => go("dashboard")}>
                ← Back to workspace
              </button>
              {publicView && (
                <div className="notice">
                  Public page preview · Registration is saved only in this
                  browser. Shared links do not sync workshop data across
                  devices.
                </div>
              )}
              <div className={`workshop-banner ${w.color}`}>
                <span className="eyebrow">{w.category}</span>
                <h1>{w.title}</h1>
                <p>{w.description}</p>
                <div className="meta">
                  <span>
                    <CalendarDays size={16} />
                    {w.date} · {w.time}
                  </span>
                  <span>
                    <MapPin size={16} />
                    {w.location}
                  </span>
                  <span>Hosted by {w.host}</span>
                </div>
                <div className="actions">
                  {!publicView && (
                    <>
                      <button className="btn" onClick={() => edit(w)}>
                        <Edit3 size={16} /> Edit workshop
                      </button>
                      <button
                        className="btn secondary"
                        onClick={() => {
                          setPublicView(true);
                          track("Public preview opened");
                        }}
                      >
                        <Eye size={16} /> Public preview
                      </button>
                    </>
                  )}
                  <button
                    className="btn secondary"
                    onClick={() => setModal("share")}
                  >
                    <Link size={16} /> Share workshop
                  </button>
                </div>
              </div>
              <div className="tabs">
                {(publicView
                  ? ["Overview", "Resources", "Feedback"]
                  : [
                      "Overview",
                      "Participants",
                      "Resources",
                      "Feedback",
                      "Certificates",
                    ]
                ).map((t) => (
                  <button
                    className={tab === t ? "active" : ""}
                    key={t}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {tab === "Overview" && (
                <div className="detail-grid">
                  <section className="panel">
                    <h2>A little time. A fresh perspective.</h2>
                    <p>{w.description}</p>
                    <h3>What to expect</h3>
                    <ul className="check-list">
                      <li>
                        <Check /> A welcoming, hands-on learning experience
                      </li>
                      <li>
                        <Check /> Resources to keep your momentum going
                      </li>
                      <li>
                        <Check /> Space to connect, experiment, and ask
                        questions
                      </li>
                    </ul>
                    <div className="notice">
                      Synthetic example · All names, registrations and feedback
                      are fictional. Attendance and certificates are for
                      demonstration.
                    </div>
                  </section>
                  <section className="panel">
                    <span className="eyebrow">SAVE YOUR SPOT</span>
                    <h2>Good company awaits.</h2>
                    <p>
                      {w.participants.length} / {w.capacity} places filled ·
                      Free demo registration
                    </p>
                    <progress value={w.participants.length} max={w.capacity} />
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        try {
                          update(
                            register(
                              w,
                              String(f.get("name")),
                              String(f.get("email")),
                            ),
                            "Registration saved locally",
                          );
                          e.currentTarget.reset();
                        } catch (err) {
                          notify((err as Error).message);
                        }
                      }}
                    >
                      <Field label="Your name" name="name" maxLength={80} />
                      <Field label="Email address" name="email" type="email" />
                      <button
                        className="btn full"
                        disabled={w.participants.length >= w.capacity}
                      >
                        {w.participants.length >= w.capacity
                          ? "Workshop full"
                          : "Count me in"}{" "}
                        <ArrowRight size={16} />
                      </button>
                      <small>Demo only. No email will be sent.</small>
                    </form>
                  </section>
                </div>
              )}
              {tab === "Participants" && (
                <section className="panel">
                  <div className="section-heading">
                    <div>
                      <h2>Your people ({w.participants.length})</h2>
                      <p>Mark attendance to unlock completion certificates.</p>
                    </div>
                    <button
                      className="btn secondary"
                      onClick={() => setTab("Overview")}
                    >
                      Add participant
                    </button>
                  </div>
                  {w.participants.length === 0 && (
                    <p>
                      No registrations yet. Add your first participant through
                      the registration form.
                    </p>
                  )}
                  {w.participants.map((p) => (
                    <div className="person-row" key={p.id}>
                      <span className="avatar">{p.name.slice(0, 1)}</span>
                      <div>
                        <b>{p.name}</b>
                        <small>{p.email}</small>
                      </div>
                      <label className="attendance">
                        <input
                          type="checkbox"
                          checked={p.attended}
                          onChange={() =>
                            update(
                              {
                                ...w,
                                participants: w.participants.map((x) =>
                                  x.id === p.id
                                    ? { ...x, attended: !x.attended }
                                    : x,
                                ),
                              },
                              "Attendance updated",
                            )
                          }
                        />{" "}
                        Attended
                      </label>
                      <button
                        className="icon-btn"
                        aria-label={`Remove ${p.name}`}
                        onClick={() =>
                          setConfirm({
                            message: `Remove ${p.name} from this workshop?`,
                            run: () =>
                              update(
                                {
                                  ...w,
                                  participants: w.participants.filter(
                                    (x) => x.id !== p.id,
                                  ),
                                },
                                "Participant removed",
                              ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </section>
              )}
              {tab === "Resources" && (
                <section className="panel">
                  <h2>Keep the learning going.</h2>
                  <p>Helpful links, all in one place.</p>
                  {w.resources.map((r) => (
                    <div className="resource-row" key={r.id}>
                      <BookOpen />
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => track("Resource opened")}
                      >
                        {r.title} <ExternalLink size={14} />
                      </a>
                      {!publicView && (
                        <button
                          className="icon-btn"
                          aria-label={`Delete ${r.title}`}
                          onClick={() =>
                            update(
                              {
                                ...w,
                                resources: w.resources.filter(
                                  (x) => x.id !== r.id,
                                ),
                              },
                              "Resource removed",
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!w.resources.length && <p>No resources shared yet.</p>}
                  {!publicView && (
                    <form
                      className="inline-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        const url = String(f.get("url"));
                        if (!/^https?:\/\//i.test(url)) {
                          notify("Use a valid http or https URL.");
                          return;
                        }
                        update(
                          {
                            ...w,
                            resources: [
                              ...w.resources,
                              { id: uid(), title: String(f.get("title")), url },
                            ],
                          },
                          "Resource added",
                        );
                        e.currentTarget.reset();
                      }}
                    >
                      <Field label="Resource title" name="title" />
                      <Field label="Resource URL" name="url" type="url" />
                      <button className="btn">Add resource</button>
                    </form>
                  )}
                </section>
              )}
              {tab === "Feedback" && (
                <div className="detail-grid">
                  <section className="panel">
                    <h2>Little reflections, big improvements.</h2>
                    {w.feedback.map((f, i) => (
                      <blockquote key={i}>
                        <span className="stars">
                          {"★".repeat(f.rating)}
                          {"☆".repeat(5 - f.rating)}
                        </span>
                        <p>{f.comment}</p>
                        <small>— {f.name} · locally stored feedback</small>
                      </blockquote>
                    ))}
                    {!w.feedback.length && (
                      <p>
                        No feedback yet. Be the first to share a reflection.
                      </p>
                    )}
                  </section>
                  <form
                    className="panel"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      update(
                        {
                          ...w,
                          feedback: [
                            ...w.feedback,
                            {
                              name: String(f.get("name")),
                              rating: Number(f.get("rating")),
                              comment: String(f.get("comment")),
                            },
                          ],
                        },
                        "Feedback saved locally",
                      );
                      e.currentTarget.reset();
                    }}
                  >
                    <h3>How did it feel?</h3>
                    <Field label="Your name" name="name" />
                    <label>
                      Your rating
                      <select name="rating">
                        <option value="5">5 — Loved it</option>
                        <option value="4">4 — Great</option>
                        <option value="3">3 — Good</option>
                        <option value="2">2 — Could be better</option>
                        <option value="1">1 — Needs work</option>
                      </select>
                    </label>
                    <label>
                      Your reflection
                      <textarea name="comment" required maxLength={1000} />
                    </label>
                    <button className="btn">
                      Share feedback <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              )}
              {tab === "Certificates" && (
                <section className="panel">
                  <h2>Celebrate a little progress.</h2>
                  <p>
                    Preview and download a demo completion certificate for an
                    attendee.
                  </p>
                  {!w.participants.some((p) => p.attended) && (
                    <div className="notice">
                      Mark a participant as attended to enable their
                      certificate.
                    </div>
                  )}
                  {w.participants
                    .filter((p) => p.attended)
                    .map((p) => (
                      <div className="person-row" key={p.id}>
                        <CheckCircle2 />
                        <b>{p.name}</b>
                        <button
                          className="btn secondary small"
                          onClick={() => {
                            setCertPerson(p.name);
                            setModal("certificate");
                          }}
                        >
                          Preview certificate <ArrowUpRight size={14} />
                        </button>
                      </div>
                    ))}
                </section>
              )}
            </>
          ) : page === "dashboard" ? (
            <>
              <div className="page-title">
                <div>
                  <div className="eyebrow">YOUR IDEAS HAVE A HOME</div>
                  <h1>
                    Welcome to your workspace
                    <span className="serif-dot">.</span>
                  </h1>
                  <p>A little less organizing. A little more creating.</p>
                </div>
                <button className="btn" onClick={() => edit()}>
                  <Plus size={18} /> New workshop
                </button>
              </div>
              <div className="notice">
                <Leaf size={17} />
                <span>
                  This is your browser-local demo workspace. All example data is
                  synthetic. Genuine multi-user registration, secure organizer
                  access and sharing require a production backend.
                </span>
              </div>
              <div className="stats">
                {[
                  [s.workshops, "Workshops", CalendarDays],
                  [s.participants, "Registrations", Users],
                  [`${s.attendance}%`, "Attendance rate", CheckCircle2],
                  [s.rating, "Average feedback", Star],
                ].map(([v, l, I]) => {
                  const C = I as typeof Star;
                  return (
                    <article key={String(l)}>
                      <C size={19} />
                      <strong>{String(v)}</strong>
                      <span>{String(l)}</span>
                    </article>
                  );
                })}
              </div>
              <div className="section-heading">
                <h2>
                  Your workshops{" "}
                  <span className="count">{data.workshops.length}</span>
                </h2>
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="Find a workshop…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search workshops"
                  />
                </label>
              </div>
              <div className="workshop-grid">
                {data.workshops
                  .filter((x) =>
                    x.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((x) => (
                    <div key={x.id}>
                      <WorkshopCard w={x} onOpen={() => open(x)} />
                      <div className="card-tools">
                        <button onClick={() => edit(x)}>
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => {
                            const d = {
                              ...structuredClone(x),
                              id: uid(),
                              title: x.title + " (copy)",
                              participants: [],
                              feedback: [],
                            };
                            track("Workshop duplicated", {
                              ...data,
                              workshops: [...data.workshops, d],
                            });
                            notify(
                              "Workshop duplicated without participant data",
                            );
                          }}
                        >
                          <Copy size={14} /> Duplicate
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              message: `Delete “${x.title}” and its local registrations?`,
                              run: () => {
                                track("Workshop deleted", {
                                  ...data,
                                  workshops: data.workshops.filter(
                                    (y) => y.id !== x.id,
                                  ),
                                });
                                notify("Workshop deleted");
                              },
                            })
                          }
                          aria-label={`Delete ${x.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              {data.workshops.length === 0 && (
                <div className="empty">
                  <h2>A fresh page for your next idea.</h2>
                  <p>
                    Create your own workshop or explore three fictional
                    examples.
                  </p>
                  <button
                    className="btn"
                    onClick={() => {
                      save({ workshops: examples(), events: [] });
                      notify("Demo data loaded");
                    }}
                  >
                    Load Demo Data
                  </button>
                </div>
              )}
              <div className="bottom-note">
                <span>
                  <Clock size={16} /> Changes are saved in this browser.
                </span>
                <button className="text-btn" onClick={() => setTour(0)}>
                  Take a quick tour <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : page === "pricing" ? (
            <>
              <div className="center-title">
                <div className="eyebrow">SMALL BEGINNINGS. ROOM TO GROW.</div>
                <h1>
                  Big on possibility.
                  <br />
                  <em>Light on your budget.</em>
                </h1>
                <p>
                  Illustrative monthly pricing for market validation. Every plan
                  is a simulated choice.
                </p>
              </div>
              <div className="pricing-grid">
                {[
                  [
                    "Free",
                    "0",
                    "Find your rhythm",
                    "1 workshop",
                    "20 participants",
                  ],
                  [
                    "Starter",
                    "9",
                    "Make it a regular thing",
                    "5 workshops",
                    "100 participants",
                  ],
                  [
                    "Creator",
                    "19",
                    "More room for your ideas",
                    "20 workshops",
                    "500 participants",
                  ],
                  [
                    "Studio",
                    "49",
                    "Bring your whole team",
                    "Unlimited workshops",
                    "2,000 participants",
                  ],
                ].map(([name, price, desc, a, b], i) => (
                  <article
                    className={`panel price ${i === 2 ? "featured" : ""}`}
                    key={name}
                  >
                    {i === 2 && (
                      <span className="pill">A LITTLE MORE POSSIBILITY</span>
                    )}
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    <div className="amount">
                      ${price}
                      <small>/ month</small>
                    </div>
                    <ul className="check-list">
                      {[
                        a,
                        b,
                        "Resources & feedback",
                        "Completion certificates",
                      ].map((t) => (
                        <li key={t}>
                          <Check size={16} />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn full"
                      onClick={() => {
                        track(`Pricing interest: ${name}`);
                        notify(
                          `${name} interest recorded locally. No subscription or payment created.`,
                        );
                      }}
                    >
                      {i ? "I’m interested" : "Explore free"}{" "}
                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="notice">
                All prototype functionality is available without plan limits. No
                checkout, billing, or payment processing is connected.
              </div>
            </>
          ) : page === "referrals" ? (
            <>
              <div className="page-title">
                <div>
                  <div className="eyebrow">GOOD THINGS ARE BETTER SHARED</div>
                  <h1>Pass the spark along.</h1>
                  <p>Know someone with something to teach?</p>
                </div>
                <Gift size={50} />
              </div>
              <section className="panel narrow">
                <h2>A little invitation. A new possibility.</h2>
                <p>
                  Share the ShareHub prototype with a fellow creator. Referral
                  clicks and invitations are counted only in this browser; no
                  rewards or emails are sent.
                </p>
                <label>
                  Your demo referral link
                  <input
                    readOnly
                    value={`${location.origin}${location.pathname}?ref=brightorbit-demo`}
                  />
                </label>
                <div className="actions">
                  <button
                    className="btn"
                    onClick={() =>
                      copy(
                        `${location.origin}${location.pathname}?ref=brightorbit-demo`,
                      )
                    }
                  >
                    Copy invitation <Copy size={16} />
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => {
                      track("Referral preview clicked");
                      notify("Simulated referral visit recorded locally");
                    }}
                  >
                    Simulate referral visit
                  </button>
                </div>
                <h3>
                  {
                    data.events.filter((e) => e.action.includes("Referral"))
                      .length
                  }{" "}
                  simulated referral visits
                </h3>
                <p>
                  {data.events.length} total local interactions ·{" "}
                  {
                    data.events.filter((e) => e.action.startsWith("Pricing"))
                      .length
                  }{" "}
                  pricing interests
                </p>
                <button
                  className="text-btn"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify(data.events, null, 2)],
                      { type: "application/json" },
                    );
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "sharehub-interactions.json";
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                >
                  Download interaction log <Download size={16} />
                </button>
              </section>
            </>
          ) : page === "settings" ? (
            <>
              <div className="page-title">
                <div>
                  <div className="eyebrow">MAKE YOURSELF AT HOME</div>
                  <h1>Workspace settings.</h1>
                  <p>Your browser. Your little corner of possibility.</p>
                </div>
              </div>
              <div className="panel narrow">
                <h2>Demo controls</h2>
                <p>
                  Data is stored under a dedicated localStorage key. No
                  accounts, external database or analytics services are used.
                </p>
                {[
                  [
                    "Load Demo Data",
                    "Add any missing original example workshops without replacing your own.",
                    () => {
                      const ws = examples().filter(
                        (x) => !data.workshops.some((y) => y.id === x.id),
                      );
                      save({ ...data, workshops: [...data.workshops, ...ws] });
                      notify(`${ws.length} examples loaded`);
                    },
                  ],
                  [
                    "Restore Original Examples",
                    "Replace your workspace with the three original synthetic examples.",
                    () => restore(),
                  ],
                  [
                    "Reset My Workspace",
                    "Remove all workshops and locally tracked interactions.",
                    () => restore(true),
                  ],
                  [
                    "Restart Tour",
                    "Get a guided introduction to your workspace.",
                    () => setTour(0),
                  ],
                ].map(([t, d, f]) => (
                  <div className="setting" key={String(t)}>
                    <div>
                      <h3>{String(t)}</h3>
                      <p>{String(d)}</p>
                    </div>
                    <button
                      className="btn secondary small"
                      onClick={f as () => void}
                    >
                      {String(t)}
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <section className="legal panel">
              <div className="eyebrow">BRIGHTORBIT LABS</div>
              <h1>
                {page === "about"
                  ? "More room for human connection."
                  : page === "contact"
                    ? "Let’s start a conversation."
                    : page === "privacy"
                      ? "Your data stays close."
                      : "A few simple ground rules."}
              </h1>
              {page === "about" ? (
                <>
                  <p>
                    BrightOrbit ShareHub helps independent trainers, tutors, and
                    community organizers bring the whole workshop journey into
                    one thoughtful space.
                  </p>
                  <h2>One Link. Your Entire Workshop.</h2>
                  <p>
                    We believe the best learning starts with people, not
                    paperwork. This market-validation prototype explores a
                    simpler way to organize, share, and celebrate workshops.
                  </p>
                  <p>
                    All example workshops and people are synthetic. BrightOrbit
                    Labs is testing the idea, and every feature here runs
                    locally in your browser.
                  </p>
                  <button className="btn" onClick={() => go("contact")}>
                    Share your thoughts <ArrowRight size={16} />
                  </button>
                </>
              ) : page === "contact" ? (
                <>
                  <p>
                    Tell us what would make your workshop life easier. This
                    demonstration form saves your message locally and does not
                    send it.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      track("Contact feedback saved locally");
                      const f = new FormData(e.currentTarget);
                      try {
                        localStorage.setItem(
                          "sharehub-contact",
                          JSON.stringify(Object.fromEntries(f)),
                        );
                      } catch {}
                      notify(
                        "Demo message saved in this browser. It has not been sent.",
                      );
                      e.currentTarget.reset();
                    }}
                  >
                    <Field label="Your name" name="name" />
                    <Field label="Email" name="email" type="email" />
                    <label>
                      Your message
                      <textarea name="message" required maxLength={2000} />
                    </label>
                    <button className="btn">
                      Save demo message <ArrowRight size={16} />
                    </button>
                  </form>
                </>
              ) : page === "privacy" ? (
                <>
                  <p>
                    This prototype stores workshop details, participant names
                    and email addresses, attendance, resources, feedback and
                    interaction events in browser localStorage. Contact drafts
                    are also stored locally. Nothing is submitted to a backend.
                  </p>
                  <h2>You are in control</h2>
                  <p>
                    Use synthetic information only. Anyone with access to this
                    browser can view its demo data. Clearing browser storage
                    removes it; it is not backed up or synchronized.
                  </p>
                  <p>
                    Reset My Workspace removes workshop and interaction data.
                    Contact drafts can be removed using the control below.
                    External resource links follow their destinations’ privacy
                    policies. No paid APIs, advertising trackers, or third-party
                    analytics are used.
                  </p>
                  <button
                    className="btn secondary"
                    onClick={() => {
                      localStorage.removeItem("sharehub-contact");
                      notify("Contact draft removed");
                    }}
                  >
                    Delete local contact draft
                  </button>
                </>
              ) : (
                <>
                  <p>
                    ShareHub is an experimental market-validation prototype
                    provided for evaluation. It is not a production workshop
                    service. Availability and data persistence are not
                    guaranteed.
                  </p>
                  <h2>Demonstration use</h2>
                  <p>
                    Use fictional data. Pricing, referrals, public pages, and
                    certificates demonstrate future product behavior.
                    Certificates are not accredited credentials. No purchases,
                    emails, accounts, or subscriptions are created.
                  </p>
                  <h2>Before production</h2>
                  <p>
                    A production version requires secure authentication,
                    authorization, a backend database, server-side validation,
                    privacy review, backups, and reliable cross-device sharing.
                  </p>
                </>
              )}
            </section>
          )}
        </main>
      )}
      <footer>
        <div className="footer-top">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("home");
            }}
          >
            <span className="brand-icon">
              <Orbit size={23} />
            </span>
            <span>
              BrightOrbit<span className="brand-sub">ShareHub</span>
            </span>
          </a>
          <span>For the people who bring people together.</span>
          <div>
            {(["about", "contact", "privacy", "terms"] as Page[]).map((p) => (
              <button onClick={() => go(p)} key={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BrightOrbit Labs · Made for meaningful moments.</span>
          <span>Market-validation prototype · Browser-local data</span>
          <button
            onClick={() => {
              go("settings");
            }}
          >
            Demo controls
          </button>
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {confirm && (
        <Dialog title="A quick check" close={() => setConfirm(null)}>
          <p>{confirm.message}</p>
          <div className="actions">
            <button
              className="btn"
              onClick={() => {
                confirm.run();
                setConfirm(null);
              }}
            >
              Confirm
            </button>
            <button className="btn secondary" onClick={() => setConfirm(null)}>
              Cancel
            </button>
          </div>
        </Dialog>
      )}
      {tour !== null && (
        <Dialog
          title={
            [
              "Welcome to your happy place.",
              "Make a workshop your own.",
              "Bring your people together.",
              "Finish with a little celebration.",
            ][tour]
          }
          close={() => setTour(null)}
        >
          <div className="tour-art">
            {
              [
                <Orbit size={50} />,
                <CalendarDays size={50} />,
                <Users size={50} />,
                <Star size={50} />,
              ][tour]
            }
          </div>
          <p>
            {
              [
                "This demo lives in your browser. Explore three fictional workshops, or start with a fresh idea.",
                "Use New workshop to create a page. Open any workshop to edit details, duplicate it, or share a public preview.",
                "Register a participant from Overview, mark attendance under Participants, and add helpful links under Resources.",
                "Collect feedback and download PDF certificates for attendees. Find demo reset controls and restart this tour in Workspace settings.",
              ][tour]
            }
          </p>
          <div className="actions">
            <span className="muted">{tour + 1} of 4</span>
            {tour > 0 && (
              <button className="text-btn" onClick={() => setTour(tour - 1)}>
                Back
              </button>
            )}
            <button
              className="btn"
              onClick={() => (tour === 3 ? setTour(null) : setTour(tour + 1))}
            >
              {tour === 3 ? "Let’s explore" : "Next"} <ArrowRight size={16} />
            </button>
          </div>
        </Dialog>
      )}
      {modal === "edit" && draft && (
        <Dialog
          title={
            data.workshops.some((x) => x.id === draft.id)
              ? "A little fine-tuning."
              : "Bring your next idea to life."
          }
          close={() => setModal(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const next = {
                ...draft,
                title: String(f.get("title")),
                description: String(f.get("description")),
                date: String(f.get("date")),
                time: String(f.get("time")),
                host: String(f.get("host")),
                location: String(f.get("location")),
                capacity: Number(f.get("capacity")),
                category: String(f.get("category")),
                color: String(f.get("color")),
              };
              if (next.capacity < next.participants.length) {
                notify("Capacity cannot be below existing registrations.");
                return;
              }
              track("Workshop saved", {
                ...data,
                workshops: data.workshops.some((x) => x.id === next.id)
                  ? data.workshops.map((x) => (x.id === next.id ? next : x))
                  : [...data.workshops, next],
              });
              setModal(null);
              open(next);
              notify("Workshop saved locally");
            }}
          >
            <Field
              label="Workshop title"
              name="title"
              defaultValue={draft.title}
              maxLength={100}
            />
            <label>
              Description
              <textarea
                name="description"
                defaultValue={draft.description}
                required
                maxLength={1000}
              />
            </label>
            <div className="form-grid">
              <Field
                label="Date"
                name="date"
                type="date"
                defaultValue={draft.date}
              />
              <Field
                label="Time"
                name="time"
                type="time"
                defaultValue={draft.time}
              />
              <Field
                label="Host"
                name="host"
                defaultValue={draft.host}
                maxLength={80}
              />
              <Field
                label="Location or meeting details"
                name="location"
                defaultValue={draft.location}
                maxLength={150}
              />
              <Field
                label="Capacity"
                name="capacity"
                type="number"
                min={1}
                max={10000}
                defaultValue={draft.capacity}
              />
              <label>
                Category
                <select name="category" defaultValue={draft.category}>
                  {[
                    "DESIGN & CREATIVITY",
                    "ARTS & CRAFTS",
                    "BUSINESS & GROWTH",
                    "WELLBEING",
                    "EDUCATION",
                    "COMMUNITY",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Workshop color
              <select name="color" defaultValue={draft.color}>
                <option value="peach">Warm peach</option>
                <option value="sage">Soft sage</option>
                <option value="lavender">Quiet lavender</option>
              </select>
            </label>
            <button className="btn full">
              Save workshop <Check size={16} />
            </button>
          </form>
        </Dialog>
      )}
      {modal === "share" && w && (
        <Dialog
          title="One link. A whole lot of possibility."
          close={() => setModal(null)}
        >
          <div className="qr">
            <QRCodeSVG value={workshopUrl(w)} size={180} marginSize={3} />
          </div>
          <label>
            Workshop preview link
            <input readOnly value={workshopUrl(w)} />
          </label>
          <button className="btn full" onClick={() => copy(workshopUrl(w))}>
            Copy workshop link <Copy size={16} />
          </button>
          <p className="notice">
            Local preview only. This QR code points to this origin and workshop
            ID. Other browsers cannot access your local workshop data. A
            production backend and hosting are required for real sharing.
          </p>
          <button
            className="text-btn"
            onClick={() => {
              setModal(null);
              setPublicView(true);
              track("Public preview opened");
            }}
          >
            Open public preview <ArrowUpRight size={16} />
          </button>
        </Dialog>
      )}
      {modal === "certificate" && w && (
        <Dialog
          title="A moment worth celebrating."
          close={() => setModal(null)}
        >
          <div className="certificate">
            <Orbit size={30} />
            <span>BRIGHTORBIT SHAREHUB</span>
            <h2>Certificate of Completion</h2>
            <p>This celebrates</p>
            <h3>{certPerson}</h3>
            <p>for completing</p>
            <h3>{w.title}</h3>
            <small>
              {w.host} · {w.date}
            </small>
            <p>DEMO CERTIFICATE · NOT ACCREDITED</p>
          </div>
          <button className="btn full" onClick={pdf}>
            Download PDF <Download size={16} />
          </button>
        </Dialog>
      )}
    </>
  );
}
function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label>
      {label}
      <input required {...props} />
    </label>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          "button,input,select,textarea,a[href]",
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = overflow;
      old?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <button
          className="dialog-close icon-btn"
          aria-label="Close dialog"
          onClick={close}
        >
          <X />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
function WorkshopCard({ w, onOpen }: { w: Workshop; onOpen: () => void }) {
  return (
    <button className="workshop-card" onClick={onOpen}>
      <div className={`card-art ${w.color}`}>
        <span className="pill">{w.category}</span>
        {w.color === "sage" ? (
          <div className="clay-art">
            <i />
            <i />
            <i />
          </div>
        ) : w.color === "lavender" ? (
          <div className="story-art">
            <span>
              Good
              <br />
              <em>stories</em>
              <br />
              connect.
            </span>
            <b>✳</b>
          </div>
        ) : (
          <div className="card-abstract">
            <i />
            <b />
            <span>✳</span>
          </div>
        )}
        <span className="card-arrow">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="card-body">
        <span className="card-date">
          {new Date(w.date + "T12:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}{" "}
          <span>·</span> {w.time}
        </span>
        <h3>{w.title}</h3>
        <p>{w.description}</p>
        <div className="card-footer">
          <span>
            <Users size={14} />
            {w.participants.length} / {w.capacity} people
          </span>
          <span>{w.location.split("·")[0]}</span>
        </div>
      </div>
    </button>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
