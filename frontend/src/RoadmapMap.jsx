import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * Duolingo-style skill-tree roadmap.
 * Nodes snake left-right down a path. Completed = green, active = primary, locked = gray.
 */
const RoadmapMap = ({ nodes, onNodeClick, isMobile, highlightedNodeIds = [], scrollToNodeId = null, topPadding = 0 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const expandedNodeIdRef = useRef(null);

  // Observe container resize
  useEffect(() => {
    if (!containerRef.current) return;
    let tid;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        clearTimeout(tid);
        tid = setTimeout(() => {
          if (e.contentRect.width > 0)
            setDims({ w: e.contentRect.width, h: e.contentRect.height });
        }, 80);
      }
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); clearTimeout(tid); };
  }, []);

  // D3 render
  useEffect(() => {
    if (!dims.w || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const mobile = isMobile || dims.w < 600;
    const waveAmp = mobile ? Math.min(dims.w * 0.18, 70) : Math.min(dims.w * 0.22, 160);
    const spacing = mobile ? 120 : 150;
    const totalH = nodes.length * spacing + 240;
    const cx = dims.w / 2;

    svg.attr('height', totalH);

    const approxCharW = mobile ? 6.2 : 6.8;
    const pillH = mobile ? 44 : 50;
    const padX = mobile ? 14 : 18;
    const maxPillW = mobile ? Math.max(220, dims.w - 40) : 420;

    const computePillWidth = (label) => {
      const safe = String(label || '');
      const w = safe.length * approxCharW + padX * 2;
      return Math.max(170, Math.min(maxPillW, w));
    };

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const clamp01 = (v) => clamp(v, 0, 100);

    const truncateByChars = (value, maxChars) => {
      const s = String(value || '');
      if (!maxChars || maxChars <= 0) return '';
      return s.length > maxChars ? `${s.slice(0, Math.max(0, maxChars - 1))}…` : s;
    };

    const getProgressPercent = (data) => {
      const candidates = [
        data?.progress_percent,
        data?.progressPercent,
        data?.progress,
        data?.percent_complete,
      ];
      const raw = candidates.find(v => v !== null && v !== undefined && v !== '');
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return clamp01(parsed);

      const status = String(data?.status || '').toLowerCase();
      if (status === 'completed') return 100;
      return 0;
    };

    // Build node positions — snake pattern (centered pills clamped within viewport)
    const pts = nodes.map((node, i) => {
      const y = i * spacing + 120;
      const dir = i % 2 === 0 ? 1 : -1;
      const pillW = computePillWidth(node?.data?.label);
      const half = pillW / 2 + 10;
      const rawX = cx + dir * waveAmp * 0.5;
      const x = clamp(rawX, half, dims.w - half);
      return { x, y, pillW, pillH, data: node };
    });

    // Curve generator
    const line = d3.line()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x(d => d.x)
      .y(d => d.y);

    // --- Trail (background) ---
    svg.append('path')
      .datum(pts)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', 'var(--border-subtle)')
      .attr('stroke-width', mobile ? 4 : 6)
      .attr('stroke-linecap', 'round');

    // --- Progress trail ---
    let activeIdx = nodes.findIndex(n => n.data.status === 'active');
    if (activeIdx === -1) activeIdx = nodes.length - 1;

    if (pts.length > 0 && activeIdx >= 0) {
      svg.append('path')
        .datum(pts.slice(0, activeIdx + 1))
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', 'var(--success)')
        .attr('stroke-width', mobile ? 4 : 6)
        .attr('stroke-linecap', 'round');
    }

    // --- Nodes (pill labels) ---

    const groups = svg.selectAll('.node-g')
      .data(pts)
      .enter()
      .append('g')
      .attr('class', 'node-g')
      .attr('data-node-id', d => d.data?.id)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', d => d.data.data.status === 'locked' ? 'not-allowed' : 'pointer')
      .on('click', (ev, d) => {
        const expandedId = expandedNodeIdRef.current;
        if (expandedId) {
          const prevGroup = groups.filter(p => p?.data?.id === expandedId);
          prevGroup.each(function (p) {
            collapseNode(d3.select(this), p);
          });
          expandedNodeIdRef.current = null;
        }
        if (d.data?.data?.status === 'locked') return;
        onNodeClick(ev, d.data);
      })
      .on('mouseenter', (ev, d) => {
        if (mobile) return;

        const nextId = d?.data?.id;
        const expandedId = expandedNodeIdRef.current;

        if (expandedId && expandedId !== nextId) {
          const prevGroup = groups.filter(p => p?.data?.id === expandedId);
          prevGroup.each(function (p) {
            collapseNode(d3.select(this), p);
          });
        }

        if (expandedId !== nextId) {
          const g = d3.select(ev.currentTarget);
          expandNode(g, d);
          expandedNodeIdRef.current = nextId;
        }
      });

    const highlighted = new Set(highlightedNodeIds || []);

    const applyCollapsedVisuals = (g, d) => {
      const s = d?.data?.data?.status;
      const isHighlighted = highlighted.has(d?.data?.id);

      const fill = s === 'completed'
        ? 'var(--success)'
        : s === 'active'
          ? 'var(--primary)'
          : 'var(--bg-surface)';
      const stroke = isHighlighted
        ? 'var(--primary)'
        : s === 'completed'
          ? 'var(--success)'
          : s === 'active'
            ? 'var(--primary)'
            : 'var(--border-subtle)';
      const textColor = (s === 'completed' || s === 'active') ? '#fff' : 'var(--text-primary)';

      if (s === 'locked') {
        g.style('opacity', 0.65);
      } else {
        g.style('opacity', 1);
      }

      // Pill background
      g.select('rect.pill-rect')
        .attr('x', -d.pillW / 2)
        .attr('y', -d.pillH / 2 + 2)
        .attr('width', d.pillW)
        .attr('height', d.pillH)
        .attr('rx', d.pillH / 2)
        .attr('ry', d.pillH / 2)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', isHighlighted ? 3 : 2);

      const rawLabel = String(d?.data?.data?.label || '');
      const maxChars = Math.max(10, Math.floor((d.pillW - padX * 2) / approxCharW));
      const label = truncateByChars(rawLabel, maxChars);

      g.select('text.pill-label')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', 6)
        .attr('text-anchor', 'middle')
        .attr('fill', s === 'locked' ? 'var(--text-tertiary)' : textColor)
        .style('font-size', mobile ? '12px' : '13px')
        .style('font-weight', '700')
        .text(label);
    };

    const collapseNode = (g, d) => {
      g.selectAll('.expanded-el').remove();
      applyCollapsedVisuals(g, d);
    };

    const expandNode = (g, d) => {
      g.raise();
      g.selectAll('.expanded-el').remove();

      const s = d?.data?.data?.status;
      const isHighlighted = highlighted.has(d?.data?.id);
      const data = d?.data?.data || {};
      const progress = getProgressPercent(data);

      const panelH = mobile ? 54 : 64;
      const panelGap = 10;
      const panelW = d.pillW;
      const x0 = -panelW / 2;
      const pillY = -d.pillH / 2 + 2;
      const panelY = pillY - panelGap - panelH;

      const stroke = isHighlighted
        ? 'var(--primary)'
        : s === 'completed'
          ? 'var(--success)'
          : s === 'active'
            ? 'var(--primary)'
            : 'var(--border-subtle)';

      // Keep base pill unchanged; only add a structured top panel.
      // (We still re-apply stroke emphasis for highlight consistency.)
      g.select('rect.pill-rect')
        .interrupt()
        .transition()
        .duration(140)
        .attr('fill', 'var(--bg-surface)')
        .attr('stroke', stroke)
        .attr('stroke-width', isHighlighted ? 3 : 2);

      // Keep pill label centered and unchanged.
      applyCollapsedVisuals(g, d);

      const leftPad = 18;
      const rightPad = 18;

      // === Expanded top panel (grows upward, semi-transparent) ===
      const panel = g.append('g')
        .attr('class', 'expanded-el')
        .style('pointer-events', 'all');

      const panelBg = panel.append('rect')
        .attr('class', 'expanded-el')
        .attr('x', x0)
        .attr('y', pillY - panelGap)
        .attr('width', panelW)
        .attr('height', 0)
        .attr('rx', 16)
        .attr('ry', 16)
        .attr('fill', 'var(--bg-surface)')
        .attr('opacity', 0);

      panelBg
        .transition()
        .duration(180)
        .attr('y', panelY)
        .attr('height', panelH)
        .attr('opacity', 0.75);

      const statusText = String(s || '').toUpperCase();
      const statusColor = s === 'completed' ? 'var(--success)' : s === 'active' ? 'var(--primary)' : 'var(--text-tertiary)';

      // Status tag
      panel.append('text')
        .attr('class', 'expanded-el')
        .attr('x', x0 + leftPad)
        .attr('y', panelY + 18)
        .attr('text-anchor', 'start')
        .attr('fill', statusColor)
        .style('font-size', '10px')
        .style('font-weight', '900')
        .style('letter-spacing', '0.06em')
        .text(statusText);

      if (s === 'locked') {
        const hint = String(data.unlock_hint || 'Finish the previous module to unlock');
        const hintMaxChars = Math.max(16, Math.floor(((d.pillW * 0.85) - leftPad - rightPad) / approxCharW));
        panel.append('text')
          .attr('class', 'expanded-el')
          .attr('x', x0 + leftPad)
          .attr('y', panelY + 40)
          .attr('text-anchor', 'start')
          .attr('fill', 'var(--text-secondary)')
          .style('font-size', mobile ? '11px' : '12px')
          .style('font-weight', '600')
          .text(truncateByChars(hint, hintMaxChars));
        return;
      }

      // Progress track
      const trackH = 10;
      const trackY = panelY + 38;
      const trackX = x0 + leftPad;
      const percentBlockW = mobile ? 60 : 78;
      const trackW = Math.max(90, panelW - leftPad - rightPad - percentBlockW);

      panel.append('rect')
        .attr('class', 'expanded-el')
        .attr('x', trackX)
        .attr('y', trackY)
        .attr('width', trackW)
        .attr('height', trackH)
        .attr('rx', trackH / 2)
        .attr('ry', trackH / 2)
        .attr('fill', 'var(--border-subtle)')
        .attr('opacity', 0.9);

      const fillColor = s === 'completed' ? 'var(--success)' : 'var(--primary)';
      const fillRect = panel.append('rect')
        .attr('class', 'expanded-el')
        .attr('x', trackX)
        .attr('y', trackY)
        .attr('width', 0)
        .attr('height', trackH)
        .attr('rx', trackH / 2)
        .attr('ry', trackH / 2)
        .attr('fill', fillColor);

      fillRect
        .transition()
        .duration(240)
        .attr('width', (trackW * progress) / 100);

      // Big percent on the right (animated)
      const percentX = x0 + panelW - rightPad;
      const percentText = panel.append('text')
        .attr('class', 'expanded-el')
        .attr('x', percentX)
        .attr('y', panelY + 48)
        .attr('text-anchor', 'end')
        .attr('fill', fillColor)
        .style('font-size', mobile ? '16px' : '20px')
        .style('font-weight', '900')
        .text('0%');

      percentText
        .transition()
        .duration(260)
        .tween('text', function () {
          const node = this;
          const current = Number(String(d3.select(node).text()).replace('%', '')) || 0;
          const interp = d3.interpolateNumber(current, Math.round(progress));
          return function (t) {
            d3.select(node).text(`${Math.round(interp(t))}%`);
          };
        });
    };

    groups.each(function (d) {
      const g = d3.select(this);
      const s = d.data.data.status;
      const isHighlighted = highlighted.has(d.data.id);

      const fill = s === 'completed'
        ? 'var(--success)'
        : s === 'active'
          ? 'var(--primary)'
          : 'var(--bg-surface)';
      const stroke = isHighlighted
        ? 'var(--primary)'
        : s === 'completed'
          ? 'var(--success)'
          : s === 'active'
            ? 'var(--primary)'
            : 'var(--border-subtle)';
      const textColor = (s === 'completed' || s === 'active') ? '#fff' : 'var(--text-primary)';

      if (s === 'locked') {
        g.style('opacity', 0.65);
      }

      // Pill background
      g.append('rect')
        .attr('class', 'pill-rect')
        .attr('x', -d.pillW / 2)
        .attr('y', -d.pillH / 2 + 2)
        .attr('width', d.pillW)
        .attr('height', d.pillH)
        .attr('rx', d.pillH / 2)
        .attr('ry', d.pillH / 2)
        .attr('fill', fill)
        .attr('stroke', stroke)
        .attr('stroke-width', isHighlighted ? 3 : 2);

      // Label inside pill (module name only)
      const rawLabel = String(d.data.data.label || '');
      const maxChars = Math.max(10, Math.floor((d.pillW - padX * 2) / approxCharW));
      const label = rawLabel.length > maxChars ? rawLabel.slice(0, Math.max(0, maxChars - 1)) + '…' : rawLabel;

      g.append('text')
        .attr('class', 'pill-label')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', 6)
        .attr('text-anchor', 'middle')
        .attr('fill', s === 'locked' ? 'var(--text-tertiary)' : textColor)
        .style('font-size', mobile ? '12px' : '13px')
        .style('font-weight', '700')
        .style('pointer-events', 'none')
        .text(label);
    });

    // If a node was expanded previously, restore it after redraw
    if (!mobile && expandedNodeIdRef.current) {
      const expandedId = expandedNodeIdRef.current;
      const g = groups.filter(p => p?.data?.id === expandedId);
      g.each(function (p) {
        expandNode(d3.select(this), p);
      });
    }

  }, [dims, nodes, onNodeClick, isMobile, highlightedNodeIds]);

  // Scroll to the first matched node when requested
  useEffect(() => {
    if (!scrollToNodeId || !containerRef.current || !dims.w || nodes.length === 0) return;

    const mobile = isMobile || dims.w < 600;
    const spacing = mobile ? 120 : 150;

    const idx = nodes.findIndex((n) => n?.id === scrollToNodeId);
    if (idx < 0) return;

    const targetY = idx * spacing + 120 + (Number(topPadding) || 0);
    const container = containerRef.current;
    const desiredTop = Math.max(0, targetY - container.clientHeight / 2);

    container.scrollTo({ top: desiredTop, behavior: 'smooth' });
  }, [scrollToNodeId, dims.w, nodes, isMobile, topPadding]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        paddingTop: topPadding,
        background: 'transparent',
      }}
    >
      <svg ref={svgRef} width="100%" style={{ minHeight: '100%' }} />
    </div>
  );
};

export default RoadmapMap;
