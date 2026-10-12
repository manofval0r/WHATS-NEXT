import React from 'react';
import { Link } from 'react-router-dom';
import './CaseStudy.css';

/**
 * The case study is the page a hiring manager will actually read, so it is
 * built out of things that were measured rather than things that sound
 * good: line counts before and after, test counts, bundle sizes, failure
 * counts, and the specific defects that shipped.
 */
const DEFECTS = [
  {
    area: 'The design tokens',
    was:
      'Seven CSS custom properties were referenced across the codebase and '
      + 'defined nowhere: the radii, two shadows and the code face. Each sat '
      + 'in a border-radius, box-shadow or font-family declaration, where an '
      + 'undefined var() invalidates the whole declaration per the CSS spec.',
    now:
      'Every primary button in the product rendered as white text on no '
      + 'background with square corners. Invisible in the JSX, invisible in '
      + 'review, obvious the moment it was rendered.',
  },
  {
    area: 'Build and Verify',
    was:
      'The roadmap node payload carried no verification fields, while the '
      + 'mobile panel gated its whole submission panel on one of them.',
    now:
      'The step that completes a module never rendered, and therefore so did '
      + 'everything downstream of it: XP, streaks, certificates, the portfolio '
      + 'and the CV. None of them can be earned any other way.',
  },
  {
    area: 'Lesson quizzes',
    was:
      'The modal sent answers as an object keyed by index; the endpoint '
      + 'requires a list and checks its length.',
    now: 'A 400 on one hundred per cent of submissions. No lesson was completable.',
  },
  {
    area: 'Certificates',
    was: 'Downloaded with GET against a POST-only endpoint.',
    now: 'A 405 on every attempt. The button had never once worked.',
  },
  {
    area: 'The leaderboard',
    was:
      'It requested a route that is not in the URL conf, and on failure fell '
      + 'back to ten randomly generated users with random XP.',
    now:
      'It rendered a populated-looking community that did not exist. On a '
      + 'portfolio piece that is the single most damaging possible bug: it '
      + 'invents the thing being demonstrated.',
  },
  {
    area: 'The AI path',
    was:
      'Three hard-coded OpenRouter model ids, all dead, and a Gemini key that '
      + 'had been revoked at the source and returned HTTP 400 for every '
      + 'model including the list-models call.',
    now:
      'Quiz generation and every tutor reply were dead. Four models are now '
      + 'verified live against the free tier, and a management command fails '
      + 'the deploy rather than letting it go out silently.',
  },
];

const BEFORE = [
  ['Tracked files in git', '1,261', '154'],
  ['views.py', '4,283 lines, 1 file', '3,898 lines, 13 modules'],
  ['Tests', '0', '74'],
  ['Full test suite', '86s', '1.6s'],
  ['JavaScript entry chunk', '1,882 kB', '341 kB'],
  ['Unreferenced CSS properties', '18', '0'],
  ['Custom properties used but never defined', '7', '0'],
];

const REMOVALS = [
  {
    what: 'Employer job board',
    because:
      'A two-sided marketplace cannot be demonstrated honestly with zero '
      + 'employers. It rendered empty states and, elsewhere, invented '
      + 'listings. It is now read-only matching against the live feed, '
      + 'scored on skills you have actually completed, with the scoring '
      + 'method returned to the client so the UI can state it.',
  },
  {
    what: 'Premium and its paywall',
    because:
      'It gated exports behind a plan in a product with no paying users. '
      + 'Everything is free now. The Stripe integration, if it ever comes '
      + 'back, is a separate and clearly labelled test-mode page.',
  },
  {
    what: 'Community XP as a mutable column',
    because:
      'A counter on the user row that could disagree with the events that '
      + 'produced it. It is an append-only ledger and the leaderboard sums it.',
  },
  {
    what: 'Twelve frontend modules',
    because:
      'Nothing imported them. Two of them were imported but never rendered. '
      + 'One of those held a static import of a 740 kB PDF library, which is '
      + 'why the entry chunk was 1.8 MB.',
  },
];

export default function CaseStudy() {
  return (
    <article className="case">
      <header className="case__head">
        <Link to="/" className="case__back">
          WHATS-NEXT
        </Link>
        <h1>Case study</h1>
        <p className="case__standfirst">
          A learning platform that shipped with no users, zero tests, a dead
          AI path and three features that could not work. What it took to
          make it honest, measured rather than described.
        </p>
      </header>

      <section className="case__section">
        <h2>The numbers</h2>
        <table className="case__table">
          <caption className="sr-only">Before and after</caption>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col">Before</th>
              <th scope="col">After</th>
            </tr>
          </thead>
          <tbody>
            {BEFORE.map(([what, was, now]) => (
              <tr key={what}>
                <th scope="row">{what}</th>
                <td className="case__was">{was}</td>
                <td className="case__now">{now}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="case__section">
        <h2>What was broken, and how it looked from outside</h2>
        <p>
          None of the following would show up in a code review, and most would
          not show up in a demo. They were found by rendering the product and
          by writing tests against the endpoints before trusting them.
        </p>
        <dl className="case__defects">
          {DEFECTS.map((d) => (
            <div key={d.area}>
              <dt>{d.area}</dt>
              <dd>
                <p>{d.was}</p>
                <p className="case__consequence">{d.now}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="case__section">
        <h2>What was taken out</h2>
        <p>
          Cutting a feature is a design decision, and on this one the cuts are
          more informative than what is left.
        </p>
        <ul className="case__removals">
          {REMOVALS.map((r) => (
            <li key={r.what}>
              <h3>{r.what}</h3>
              <p>{r.because}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="case__section">
        <h2>How it is put together</h2>
        <p>
          The back end is Django with Django REST Framework, and the single
          4,283-line <code>views.py</code> was split into thirteen modules
          under <code>core/api/</code>, one per domain. The split was done by
          parsing the file with the AST rather than by counting lines, so
          every symbol moved with its decorators intact, and it was verified
          by resolving every route after each move.
        </p>
        <p>
          The front end is React on Vite. The bundle is split at the vendor
          boundary so the landing page does not download Three.js, a PDF
          library or a syntax highlighter it will never use; the PDF library
          in particular is fetched only when someone actually exports a CV.
        </p>
        <p>
          The hero figure is drawn with the Hairline engine and is one
          self-contained file with no dependencies at runtime. Its rules are
          strict enough that several of them were broken in ways only a
          screenshot would reveal — a gate that pointed the wrong way, and a
          highlight that was on every element instead of one.
        </p>
      </section>

      <section className="case__section">
        <h2>What is still wrong</h2>
        <p>
          The AI runs entirely on OpenRouter&rsquo;s free tier, and those
          models are reasoning models: on the quiz generator, 172 of 215
          completion tokens went into thinking and the rest were truncated
          JSON. The client inflates its token budget threefold and treats a
          length stop as a failure, which works, but it is a workaround and
          not an architecture.
        </p>
        <p>
          Account verification is mandatory, which means the deployed
          instance needs real SMTP before anyone can finish signing up.
          There is a management command that checks the AI provider
          credentials at deploy time and exits non-zero rather than letting a
          revoked key ship quietly.
        </p>
        <p>
          The job matcher ranks a live RSS feed with a transparent heuristic.
          It is explainable and it is honest about being a heuristic, but it
          is keyword matching, and it should not be mistaken for ranking.
        </p>
      </section>

      <footer className="case__foot">
        <Link to="/" className="btn btn--primary">
          Back to the start
        </Link>
      </footer>
    </article>
  );
}