import React, { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import AmbientField from './AmbientField';
import './Landing.css';

/**
 * The Locks figure is a complete, self-contained page built by the
 * hairline-create skill. It ships as an iframe rather than being
 * reimplemented in React: the figure and its engine are one artefact, and
 * the brief for that engine is explicit that the kernel is never edited or
 * copied into application code. Lazy, because it is 44 KB and the headline
 * above it does not wait for it.
 */
const LocksFigure = lazy(() => {
  const Figure = () => (
    <div className="figure">
      <iframe
        src="/figure-locks.html?theme=dark&play=1"
        title="An interactive drawing of four canal locks stepping down a hillside. Pointing at a lock empties it: the gates part and the water falls to the level below."
        loading="lazy"
        scrolling="no"
      />
    </div>
  );
  return Promise.resolve({ default: Figure });
});

/**
 * The flight, in order, because it genuinely is a sequence -- each step
 * needs the one before it, and the product enforces that. Numbering here
 * is information rather than decoration.
 */
const FLIGHT = [
  {
    title: 'Pick a role',
    body:
      'Not a course catalogue. A destination — backend engineer, data analyst, '
      + 'cloud engineer — and the modules that actually get you there, in an '
      + 'order that respects the dependencies between them.',
  },
  {
    title: 'Work one lock',
    body:
      'Each module is a lesson, a quiz and a project brief. You do not move '
      + 'on by watching a video; the next module stays shut until this one '
      + 'is finished.',
  },
  {
    title: 'Build the thing',
    body:
      'The brief is a real thing with a real spec. Submit a repository URL and '
      + 'it is scored against a rubric derived from the module.',
  },
  {
    title: 'Get the verdict',
    body:
      'A score, a pass threshold, and the specific checks that failed. Not a '
      + 'badge for finishing a video — evidence you can point a hiring manager at.',
  },
  {
    title: 'Walk out with it',
    body:
      'Completed modules become portfolio entries and CV lines. The export is '
      + 'a single HTML file with no server and no login to view.',
  },
];

/**
 * What was cut, and why. On a portfolio piece the removals are more '
 * informative than the features: each of these shipped as a section on the
 * old landing page and could not honestly be demonstrated.
 */
const REMOVED = [
  {
    thing: 'The employer job board',
    why:
      'A two-sided marketplace with zero employers is a page that renders '
      + 'either nothing or fake data. It was replaced with job matching '
      + 'against the live feed, ranked on what you have completed, with the '
      + 'scoring shown rather than hidden.',
  },
  {
    thing: 'Premium',
    why:
      'A paywall in front of a product with no paying customers is a '
      + 'demonstration of a business model, not of the product. Everything '
      + 'is free, including the CV and portfolio exports.',
  },
  {
    thing: 'The progress bar',
    why:
      'XP was a number on the user row that could be edited out of sync with '
      + 'itself. It is an append-only ledger now, and the leaderboard sums '
      + 'the ledger.',
  },
];

export default function Landing() {
  const [open, setOpen] = useState(null);

  return (
    <div className="landing">
      <AmbientField />

      <header className="masthead">
        <Link to="/" className="wordmark">
          WHATS-NEXT
        </Link>
        <nav>
          <Link to="/case-study">Case study</Link>
          <Link to="/auth">Sign in</Link>
        </nav>
      </header>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────
            The figure is the hero. The headline is two lines and then the
            page gets out of the way. */}
        <section className="hero">
          <h1>
            A roadmap you finish
            <br />
            by building what&rsquo;s on it.
          </h1>

          <Suspense fallback={<div className="figure figure--loading" />}>
            <LocksFigure />
          </Suspense>

          <p className="hero__lede">
            Point at a lock and it empties: the gates part, the water falls to
            the level below, and the next one opens. That is the whole product
            &mdash; you do not move on by watching a video.
          </p>

          <div className="hero__actions">
            <Link to="/auth" className="btn btn--primary">
              Start a roadmap
            </Link>
            <Link to="/case-study" className="btn">
              How this was built
            </Link>
          </div>
        </section>

        {/* ── The flight ────────────────────────────────────────────── */}
        <section className="flight">
          <h2>Five stages, in order</h2>
          <ol className="flight__list">
            {FLIGHT.map((s, i) => (
              <li key={s.title}>
                <span className="flight__n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── What was cut ───────────────────────────────────────────── */}
        <section className="cut">
          <h2>Three things I removed</h2>
          <p className="cut__lede">
            Each of these was a section on the previous landing page. None of
            them could survive contact with a real user.
          </p>
          <ul className="cut__list">
            {REMOVED.map((r) => {
              const id = r.thing.toLowerCase().replace(/[^a-z]+/g, '-');
              const isOpen = open === id;
              return (
                <li key={r.thing} className={isOpen ? 'is-open' : undefined}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-body`}
                    onClick={() => setOpen(isOpen ? null : id)}
                  >
                    {r.thing}
                  </button>
                  <div id={`${id}-body`} className="cut__body" hidden={!isOpen}>
                    <p>{r.why}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="colophon">
        <p>
          Built as a portfolio piece. Django and DRF on the back, React and
          Vite on the front, AI on OpenRouter&rsquo;s free tier — no paid
          model is called anywhere in the product.
        </p>
        <p className="colophon__meta">
          <Link to="/case-study">Case study</Link>
          <Link to="/auth">Sign in</Link>
        </p>
      </footer>
    </div>
  );
}