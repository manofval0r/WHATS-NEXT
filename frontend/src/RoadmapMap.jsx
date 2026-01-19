import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock } from 'lucide-react';

const RoadmapMap = ({ nodes, onNodeClick, isMobile }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Resize Observer with debounce
  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            setDimensions({
              width: entry.contentRect.width,
              height: entry.contentRect.height
            });
          }
        }, 100);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // D3 Render Logic
  useEffect(() => {
    // Pass if dimensions are 0 or no nodes
    if (!dimensions.width || nodes.length === 0) return;

    // --- STYLE INJECTION ---
    if (!document.getElementById('roadmap-styles')) {
      const style = document.createElement('style');
      style.id = 'roadmap-styles';
      style.innerHTML = `
            .node-item {
                opacity: 0;
                animation: fadeIn 0.5s forwards;
                transform-box: fill-box;
                transition: all 0.3s ease;
            }
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            /* Tech Pulse for Active Node */
            @keyframes techPulse {
                0% { box-shadow: 0 0 0 0 rgba(88, 166, 255, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(88, 166, 255, 0); }
                100% { box-shadow: 0 0 0 0 rgba(88, 166, 255, 0); }
            }
        `;
      document.head.appendChild(style);
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    // Mobile adjustments: tighter wave, closer nodes
    const mobileView = isMobile || width < 600;
    const waveWidth = mobileView ? Math.min(width * 0.3, 100) : Math.min(width * 0.5, 300);
    const nodeSpacing = mobileView ? 160 : 220;
    const totalHeight = nodes.length * nodeSpacing + 400;

    svg.attr("height", totalHeight);

    // --- 1. GENERATE PATH ---
    const pathPoints = nodes.map((node, i) => {
      const y = (i * nodeSpacing) + 150;
      // Zig-zag / Sine wave
      const direction = i % 2 === 0 ? 1 : -1;
      const x = (width / 2) + (direction * (waveWidth / 2));

      return { x, y, data: node };
    });

    // Curve generator
    const lineGenerator = d3.line()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x(d => d.x)
      .y(d => d.y);

    // --- 2. DRAW PATH ---
    // Background "River"
    svg.append("path")
      .datum(pathPoints)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "var(--border-subtle)") // Theme adaptable
      .attr("stroke-width", 2)   // Thinner precision line
      .attr("stroke-dasharray", "4,4") // Schematic dashed look
      .attr("fill", "none");

    // Active "Cable" (Progress)
    let activeIndex = nodes.findIndex(n => n.data.status === 'active');
    if (activeIndex === -1) activeIndex = nodes.length - 1;

    // Guard: Only draw active path if we have points and activeIndex is valid
    if (pathPoints.length > 0 && activeIndex >= 0) {
      const activePoints = pathPoints.slice(0, activeIndex + 1);

      // We need at least 1 point to draw something
      svg.append("path")
        .datum(activePoints)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "var(--neon-cyan)") // Theme adaptable
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round");
      // Removed heavy drop-shadow
    }

    // --- 3. DRAW NODES ---
    const nodeGroups = svg.selectAll(".node-group")
      .data(pathPoints)
      .enter()
      .append("g")
      .attr("class", d => `node-group node-item`) // Removed node-floating
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setHoveredNode(null); // Clear tooltip immediately to prevent persistence
        if (d.data?.data?.status === 'locked') return;
        onNodeClick(event, d.data);
      })
      .on("mouseenter", (event, d) => {
        // Disable tooltip on mobile/narrow screens to avoid "sticky" hover issues
        if (!mobileView) {
          setHoveredNode({
            data: d.data.data,
            x: d.x,
            y: d.y
          });
        }
        // Subtle Scale only
        d3.select(event.currentTarget)
          .transition().duration(200).ease(d3.easeCubicOut)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(${mobileView ? 1.02 : 1.05})`);
      })
      .on("mouseleave", (event, d) => {
        setHoveredNode(null);
        // Return to normal
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1)`);
      });

    const radius = mobileView ? 32 : 40;

    // 3A. Base Circle (Dark Fill)
    nodeGroups.append("circle")
      .attr("r", radius)
      .attr("fill", "var(--bg-card)")
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "var(--neon-green)";
        if (d.data.data.status === 'active') return "var(--neon-cyan)";
        return "var(--border-subtle)";
      })
      .attr("stroke-width", d => d.data.data.status === 'active' ? 3 : 2);

    // 3B. Outer Glow Ring (Active only)
    nodeGroups.filter(d => d.data.data.status === 'active')
      .append("circle")
      .attr("r", radius + 8)
      .attr("fill", "none")
      .attr("stroke", "var(--neon-cyan)")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 2)
      .style("animation", "pulse-ring 2s ease-in-out infinite");

    // Add pulse animation
    if (!document.getElementById('pulse-ring-animation')) {
      const style = document.createElement('style');
      style.id = 'pulse-ring-animation';
      style.innerHTML = `
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }

    // 3C. Status Icons (Checkmark for completed, Number for others)
    nodeGroups.each(function(d, i) {
      const group = d3.select(this);
      const status = d.data.data.status;

      if (status === 'completed') {
        // Checkmark Icon
        group.append("text")
          .attr("dy", 6)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--neon-green)")
          .style("font-size", mobileView ? "20px" : "24px")
          .style("pointer-events", "none")
          .text("✓");
      } else {
        // Show number for all other states (locked, active, etc.)
        group.append("text")
          .attr("dy", 6)
          .attr("text-anchor", "middle")
          .attr("fill", status === 'active' ? "var(--neon-cyan)" : "var(--text-secondary)")
          .style("font-family", "JetBrains Mono, monospace")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("pointer-events", "none")
          .style("opacity", status === 'locked' ? "0.4" : "1")
          .text(`0${i + 1}`);
      }
    });

    // Apply overall opacity to locked nodes
    nodeGroups.filter(d => d.data.data.status === 'locked')
      .style("opacity", "0.4")
      .style("cursor", "not-allowed");

  }, [dimensions, nodes, onNodeClick, isMobile]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        background: 'transparent'
      }}
    >
      <svg ref={svgRef} width="100%" style={{ minHeight: '100%' }}></svg>

      {/* Tooltip (Holo Design) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: hoveredNode.x, // Centered logic handled in mouseenter
              top: hoveredNode.y - 90,
              transform: 'translateX(-50%)',
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              borderRadius: '6px',
              padding: '12px',
              pointerEvents: 'none',
              zIndex: 1000,
              minWidth: '200px',
              textAlign: 'left' // Left align for tech feel
            }}
          >
            {/* Connection Line - Directed Arrow */}
            <div style={{
              position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: '16px', height: '16px',
              background: 'var(--panel-bg)',
              borderBottom: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              zIndex: 2
            }}></div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
              borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    MODULE_INFO
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 'bold',
                color: hoveredNode.data.status === 'completed' ? 'var(--neon-green)' : hoveredNode.data.status === 'active' ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                fontFamily: 'JetBrains Mono'
              }}>
                [{hoveredNode.data.status.toUpperCase()}]
              </span>
            </div>

            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600' }}>
              {hoveredNode.data.label}
            </h4>

            <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'Inter', lineHeight: '1.4' }}>
              {hoveredNode.data.description?.slice(0, 100)}...
            </p>

            {/* Progress Bar (if active or completed) */}
            {(hoveredNode.data.status === 'active' || hoveredNode.data.status === 'completed') && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Progress</span>
                  <span style={{ fontSize: '10px', color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono' }}>
                    {hoveredNode.data.status === 'completed' ? '100%' : '45%'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: hoveredNode.data.status === 'completed' ? '100%' : '45%',
                    height: '100%',
                    background: hoveredNode.data.status === 'completed' ? 'var(--neon-green)' : 'var(--neon-cyan)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}

            {/* Estimated Time */}
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} />
              <span>Est. Time: <span style={{ color: 'var(--text-primary)' }}>2-3 hours</span></span>
            </div>

            {/* Prerequisites (if locked) */}
            {hoveredNode.data.status === 'locked' && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: 'rgba(255, 190, 11, 0.1)', 
                border: '1px solid rgba(255, 190, 11, 0.3)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#ffbe0b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Lock size={12} /> Complete previous modules to unlock
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapMap;
