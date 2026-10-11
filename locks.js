/**
 * Locks: a flight of five canal locks stepping down a hillside, each one a
 * basin walled on both sides and sealed at its downstream end by a pair of
 * mitre gates. The pointer picks a lock; its leaves part and its water falls
 * to the level below, and the locks either side follow, staggered outwards
 * and to a fraction of the depth, so the drop reads as one gesture running
 * downhill.
 *
 * The pattern: discrete items, stepped in height. Tweens, a stagger by
 * distance, identity carried by geometry, and a hit test against each lock's
 * RESTING water plane rather than the one on screen, so a lock that is
 * mid-drop cannot steal the choice or lose it.
 */
const {
  Cam, facing, fit, hull, open, poly, prism, proj, rad, ringAt, rrect, run,
  tdone, tset, tval, tween, disposer, mk, place, pointer, register, unproj,
} = HL;

const N = 4, LEN = 30, WID = 26, WT = 2.6, WH = 12, WR = 4.5;
const PITCH = LEN + 2 * WT;        // a gate stands on the wall it shares
const Z0 = 24, STEPZ = 8, RESTW = 9, DROP = 6.5;
const MIT = 13, GT = 3.4, GH = 5, POST = 3;
const LEAF = Math.hypot(MIT, WID / 2);
const CA = Math.atan2(WID / 2, -MIT) * 180 / Math.PI;   // a leaf, shut
const CB = -CA;                                          // and its pair
/** A run of points ordered left to right on screen. */
const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
/** The falloff: full at the lock chosen, a floor beyond the reach. */
const WEIGHT = (d) => 0.09 + 0.91 * Math.exp(-1.1 * d);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const ox = (i) => i * PITCH;             // a lock's chamber starts here
  const gx = (i) => ox(i) + LEN + WT;      // and its gate stands here
  const zf = (i) => Z0 - i * STEPZ;        // the hillside: each floor is lower
  const zt = (i) => zf(i) + WH;            // its wall top
  const zw = (i) => zf(i) + RESTW;         // its water at rest
  const mg = (i) => zf(i) + WH + GH;       // the top of its gates

  // Fitted to all eight corners of every chamber, floor to top: in this
  // projection the widest point on screen is not the one a two-corner guess
  // would pick. Fitted once, so no pose at intensity 1 leaves the frame.
  const C = Cam(45, 0.5, 2.66);
  const pts = [];
  for (let i = 0; i < N; i++) {
    for (const z of [zf(i), mg(i)]) {
      for (const x of [ox(i) - WT, ox(i) + LEN + WT]) {
        for (const y of [-WID / 2 - WT, WID / 2 + WT]) pts.push([x, y, z]);
      }
    }
  }
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);

  const outer = (i) => rrect(ox(i) - WT, -WID / 2 - WT, ox(i) + LEN + WT, WID / 2 + WT, WR, 6);
  const inner = (i) => rrect(ox(i), -WID / 2, ox(i) + LEN, WID / 2, WR - WT, 6);
  const basin = (i) => rrect(ox(i) + 0.8, -WID / 2 + 0.8, ox(i) + LEN - 0.8, WID / 2 - 0.8, WR - WT - 0.8, 6);
  /** The walls of one lock: the far half before the water, the near half after. */
  function walls(i) {
    const o = outer(i), n = inner(i);
    const far = [
      [poly(hull(ringAt(P, o, zf(i)).concat(ringAt(P, o, zt(i))))), "sil"],
      [poly(ringAt(P, n, zt(i))), "nf"],
    ];
    const iF = LR(ringAt(P, run(n, front), zt(i)));
    const oT = LR(ringAt(P, run(o, front), zt(i)));
    const oB = LR(ringAt(P, run(o, front), zf(i)));
    return { far: far.concat([
      // the seam where the far wall meets the floor, relative to this lock's
      // own floor, which steps. At a fixed z it floats clear of the chamber.
      [open(ringAt(P, run(n, (q) => !front(q)), zf(i) + 2.4)), "nf lo"],
    ]), near: [
      [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
      [open(oT), "nf lo"], [open(iF), "nf"],
      [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    ] };
  }

  /** One mitre leaf, swung back into its wall recess by (1 - w). */
  function leaf(i, side, w) {
    // The leaf hinges on its own wall and reaches ACROSS to the mitre point
    // on the centre line, so the sign follows the side. Getting this backwards
    // swings both leaves outboard: they leave the chamber entirely and the
    // gate is invisible, which is exactly what it did.
    const ang = -side * (CA + (180 - CA) * w);
    const c = Math.cos(rad(ang)), s = Math.sin(rad(ang));
    const turn = (ring) => ring.map((q) => ({
      u: gx(i) + q.u * c - q.v * s,
      v: side * (WID / 2) + q.u * s + q.v * c,
      nu: q.nu * c - q.nv * s,
      nv: q.nu * s + q.nv * c,
    }));
    return prism(P, front,
      turn(rrect(0, -GT / 2, LEAF, GT / 2, 0.7, 4)),
      turn(rrect(0.6, -GT / 2 + 0.6, LEAF - 0.6, GT / 2 - 0.6, 0.5, 4)),
      zf(i), mg(i));
  }

  const g = mk("g", {}, svg);
  const locks = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g);
    const { far, near } = walls(i);
    for (const [d, cls] of far) mk("path", { d, class: cls }, grp);

    const surf = mk("path", { class: "sil" }, grp);
    const la = mk("path", { class: "sil" }, grp), lb = mk("path", { class: "sil" }, grp);

    // the mitre post the leaves meet at, and the mark that names this lock
    const mx = gx(i) - MIT, h = POST / 2;
    const po = prism(P, front,
      rrect(mx - h, -h, mx + h, h, 0.7, 4),
      rrect(mx - h + 0.55, -h + 0.55, mx + h - 0.55, h - 0.55, 0.4, 4),
      mg(i) - 2, mg(i));
    mk("path", { d: po.sil, class: "sil" }, grp);
    mk("path", { d: po.crease, class: "nf lo" }, grp);
    const mark = mk("circle", { r: 1.9, class: "dot off" }, grp);
    place(mark, P(mx, 0, mg(i) + 1.9));

    for (const [d, cls] of near) mk("path", { d, class: cls }, grp);
    locks.push({ grp, surf, la, lb, mark, w: tween(0) });
  }

  // Hit test: each lock's RESTING water plane. These planes never move, so a
  // lock emptying cannot pull the choice out from under the pointer.
  function hit(pt) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < N; i++) {
      const w = unproj(C, pt[0], pt[1], zw(i));
      const dx = Math.max(ox(i) - w[0], 0, w[0] - (ox(i) + LEN));
      const dy = Math.max(-WID / 2 - w[1], 0, w[1] - WID / 2);
      const d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = i; }
    }
    return bestD <= 7 ? best : -1;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (let i = 0; i < N; i++) {
      const cd = locks[i], w = tval(cd.w, now);
      if (!tdone(cd.w, now)) moving = true;

      // Only write a path when its value actually changed. Rewriting an
      // identical `d` every frame leaves the drawing visually still but
      // never geometrically still, which is what rule 07 forbids.
      const lev = zw(i) - DROP * w;
      if (lev !== cd.lev) {
        cd.lev = lev;
        cd.surf.setAttribute("d", poly(ringAt(P, basin(i), lev)));
      }
      if (w !== cd.wx) {
        cd.wx = w;
        cd.la.setAttribute("d", leaf(i, 1, w).sil);
        cd.lb.setAttribute("d", leaf(i, -1, w).sil);
      }
    }
    return moving;
  });
  bag.add(B.unregister);
  let act = -1;
  /** Empties lock a (-1 refills them all). The drop spreads outwards and thins. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    for (let i = 0; i < N; i++) {
      tset(locks[i].w, a < 0 ? 0 : WEIGHT(Math.abs(i - a)), now, Math.abs(i - from) * stag);
    }
    // One bright mark, and it is one mark: at rest it sits on the head lock,
    // and the pointer takes it wherever it goes. Set the class outright
    // rather than toggling -- toggle("dot", true) on an element already
    // carrying "dot off" leaves it with BOTH, and `.dot.off` outranks `.dot`,
    // so the chosen mark came out dim while the rest lost their `.dot`
    // entirely and rendered as solid default dots.
    locks.forEach((cd, i) => cd.mark.setAttribute(
      "class", (a === i || (a < 0 && i === 0)) ? "dot" : "dot off"));
    read.textContent = a < 0 ? "rest" : `lock ${String(a + 1).padStart(2, "0")}`;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());
  // Set the rest state rather than waiting for it: setActive(-1) is a no-op
  // because act already is -1, so otherwise the figure opens with no bright
  // mark at all and nothing says where the eye should start.
  locks[0].mark.setAttribute("class", "dot");
  read.textContent = "rest";
  return { set: (v) => { stag = v; }, destroy: bag.dispose };
}

hairline({
  name: "locks",
  means: "A flight of canal locks stepping down a hill: the lock under the pointer empties, its gates part, and the water falls to the next basin.",
  rules: [1, 2, 3, 5, 8, 9, 10],
  range: [0, 40, 90],
  tour: [[176, 150], [112, 112], [250, 196], null],
  mount,
});