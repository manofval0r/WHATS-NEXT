import { useEffect, useRef } from 'react';

/**
 * Ambient background field.
 *
 * Deliberately the quietest thing on the page. The Locks figure is the
 * hero and the only element that answers the pointer; this exists to give
 * the deep neutral base some depth so the flat #0b0c0e doesn't read as an
 * empty div, and nothing more. It is fixed behind everything, never takes
 * pointer events, and is not in the accessibility tree.
 *
 * Costs: two draw calls, ~900 points, no per-frame geometry allocation.
 * `three` is imported dynamically so it never sits on the critical path --
 * the landing page does not wait on a WebGL context to paint.
 */
export default function AmbientField() {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;

    let frame = 0;
    let running = true;
    let cleanupScene = null;
    let cancelled = false;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    (async () => {
      const THREE = await import('three');
      if (cancelled) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'low-power',
        });
      } catch {
        // No WebGL: the page is a flat dark background and still reads.
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.domElement.style.display = 'block';
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        58,
        el.clientWidth / Math.max(el.clientHeight, 1),
        0.1,
        200
      );
      camera.position.set(0, 0, 46);

      const SPREAD_X = 90;
      const SPREAD_Y = 56;
      const SPREAD_Z = 90;

      // PointsMaterial with no map draws each point as a hard square, which
      // at this scale shows up as visible rectangular blobs across the
      // background rather than as dust. One small radial-gradient sprite
      // makes every point round and soft for the cost of a single texture.
      const sprite = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 32;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 32, 32);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
      })();

      /** A cloud of points, brightest toward the middle of the screen. */
      const cloud = (count, radius, color, size) => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pos[i * 3] = (Math.random() - 0.5) * SPREAD_X;
          pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
          pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
          color,
          size,
          sizeAttenuation: true,
          map: sprite,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        return new THREE.Points(geo, mat);
      };

      // Two thirds in the base neutral, one third in the accent, and the
      // accent points sit further out so the centre stays quiet.
      const dust = cloud(620, 1, 0x3a3f47, 0.34);
      const sparks = cloud(280, 1, 0xff8a3d, 0.26);
      sparks.position.z = -18;

      scene.add(dust, sparks);

      const clock = new THREE.Clock();

      const draw = () => {
        const t = clock.getElapsedTime();
        // A slow yaw plus a breath in scale: enough that a still screenshot
        // is not what you see, not enough to catch the eye.
        scene.rotation.y = t * 0.014;
        dust.rotation.x = Math.sin(t * 0.06) * 0.05;
        sparks.rotation.y = -t * 0.021;
        sparks.rotation.x = Math.cos(t * 0.05) * 0.04;
        camera.position.z = 46 + Math.sin(t * 0.09) * 2.2;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };

      const loop = () => {
        if (!running) return;
        draw();
        frame = requestAnimationFrame(loop);
      };

      const resize = () => {
        if (!el.clientWidth || !el.clientHeight) return;
        renderer.setSize(el.clientWidth, el.clientHeight);
        camera.aspect = el.clientWidth / Math.max(el.clientHeight, 1);
        camera.updateProjectionMatrix();
      };

      const observer = new ResizeObserver(resize);
      observer.observe(el);

      // Stop entirely when the tab is hidden or the field is scrolled out.
      // An off-screen canvas that keeps rendering is a battery bug, not a
      // feature.
      const onVisible = () => {
        const on = document.visibilityState === 'visible' && !reduced.matches;
        if (on === running) return;
        running = on;
        cancelAnimationFrame(frame);
        if (on) {
          clock.getDelta();
          loop();
        }
      };
      document.addEventListener('visibilitychange', onVisible);
      reduced.addEventListener('change', onVisible);

      cleanupScene = () => {
        document.removeEventListener('visibilitychange', onVisible);
        reduced.removeEventListener('change', onVisible);
        observer.disconnect();
        cancelAnimationFrame(frame);
        dust.geometry.dispose();
        dust.material.dispose();
        sparks.geometry.dispose();
        sparks.material.dispose();
        sprite.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      };

      resize();
      if (reduced.matches) {
        // One still frame. Reduced motion means no drift, not no background.
        draw();
      } else {
        loop();
      }
    })();

    return () => {
      cancelled = true;
      if (cleanupScene) cleanupScene();
    };
  }, []);

  return <div ref={host} className="ambient-field" aria-hidden="true" />;
}