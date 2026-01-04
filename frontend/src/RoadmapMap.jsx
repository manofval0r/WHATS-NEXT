import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const RoadmapMap = ({ nodes, onNodeClick }) => {
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
            @keyframes subtleFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
            }
            .node-floating {
                animation: subtleFloat 3s ease-in-out infinite;
            }
            .node-floating:nth-child(even) {
                animation-delay: 1.5s;
            }
            
            /* Holo Effect */
            @keyframes hologram {
                0% { opacity: 0.8; }
                50% { opacity: 1; text-shadow: 0 0 5px rgba(0,242,255,0.8); }
                100% { opacity: 0.8; }
            }
            .holo-text {
                animation: hologram 2s infinite;
            }
            
            /* Initial fade in */
            .node-item {
                opacity: 0;
                animation: fadeIn 0.5s forwards;
                transform-box: fill-box; /* Ensure transform works on SVG groups */
            }
            @keyframes fadeIn {
                to { opacity: 1; }
            }
        `;
      document.head.appendChild(style);
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = dimensions.width;
    const waveWidth = Math.min(width * 0.5, 300);
    const nodeSpacing = 220;
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
      .attr("stroke", "#21262d")
      .attr("stroke-width", 16)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

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
        .attr("stroke", "#58a6ff")
        .attr("stroke-width", 8)
        .attr("stroke-linecap", "round")
        .attr("filter", "drop-shadow(0 0 6px rgba(88, 166, 255, 0.6))");
    }

    // --- 3. DRAW NODES ---
    const nodeGroups = svg.selectAll(".node-group")
      .data(pathPoints)
      .enter()
      .append("g")
      // Add floating class to Active/Locked too, but mainly Active looks best floating
      .attr("class", d => `node-group node-item node-floating`)
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(event, d.data))
      .on("mouseenter", (event, d) => {
        setHoveredNode({
          data: d.data.data,
          x: d.x,
          y: d.y
        });
        // Enhanced Hover Scale
        d3.select(event.currentTarget)
          .transition().duration(300).ease(d3.easeElasticOut)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1.15)`);
      })
      .on("mouseleave", (event, d) => {
        setHoveredNode(null);
        // Return to normal
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1)`);
      });

    // 3A. Base Circle (Shadow)
    nodeGroups.append("circle")
      .attr("r", 42)
      .attr("cy", 6)
      .attr("fill", "rgba(0,0,0,0.5)");

    // 3B. Main Circle
    nodeGroups.append("circle")
      .attr("r", 40)
      .attr("fill", d => {
        if (d.data.data.status === 'completed') return "#0d1117"; // Dark center for completed
        if (d.data.data.status === 'active') return "#0d1117";    // Dark center for active
        return "#161b22"; // Locked
      })
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "#2ea043";
        if (d.data.data.status === 'active') return "#58a6ff";
        return "#30363d";
      })
      .attr("stroke-width", d => d.data.data.status === 'active' ? 3 : 2)
      // Glow for active/completed
      .attr("filter", d => {
        if (d.data.data.status === 'active') return "drop-shadow(0 0 8px rgba(88, 166, 255, 0.5))";
        if (d.data.data.status === 'completed') return "drop-shadow(0 0 8px rgba(46, 160, 67, 0.5))";
        return "none";
      });

    // 3C. Inner Ring / Progress
    nodeGroups.append("circle")
      .attr("r", 32)
      .attr("fill", "none")
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "#2ea043";
        if (d.data.data.status === 'active') return "#58a6ff";
        return "none";
      })
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5);

    // 3D. Icon / Text
    nodeGroups.append("text")
      .attr("dy", 6)
      .attr("text-anchor", "middle")
      .attr("fill", d => {
        if (d.data.data.status === 'locked') return "#8b949e";
        return "#ffffff";
      })
      .style("font-family", "JetBrains Mono, monospace")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d, i) => i + 1);

  }, [dimensions, nodes, onNodeClick]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        background: '#0d1117'
      }}
    >
      <svg ref={svgRef} width="100%" style={{ minHeight: '100%' }}></svg>

      {/* Tooltip (Holo Design) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            style={{
              position: 'absolute',
              left: hoveredNode.x,
              top: hoveredNode.y - 110,
              transform: 'translateX(-50%)',
              background: 'rgba(13, 17, 23, 0.95)',
              border: '1px solid #58a6ff',
              boxShadow: '0 0 15px rgba(88, 166, 255, 0.3), inset 0 0 20px rgba(88, 166, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              pointerEvents: 'none',
              zIndex: 100,
              minWidth: '240px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}
          >
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
              backgroundSize: '100% 2px, 3px 100%',
              pointerEvents: 'none',
              zIndex: -1
            }}></div>

            {/* Connection Line */}
            <div style={{
              position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: '16px', height: '16px',
              background: '#0d1117',
              borderBottom: '1px solid #58a6ff',
              borderRight: '1px solid #58a6ff',
              zIndex: 1
            }}></div>

            <h4 className="holo-text" style={{ margin: '0 0 8px 0', color: '#58a6ff', fontSize: '16px', fontFamily: 'JetBrains Mono', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {hoveredNode.data.label}
            </h4>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '4px 0' }}>
              <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(56, 139, 253, 0.2)', color: '#58a6ff', borderRadius: '4px' }}>
                STATUS: {hoveredNode.data.status.toUpperCase()}
              </span>
            </div>

            <p style={{ margin: '8px 0 0 0', color: '#8b949e', fontSize: '12px', fontFamily: 'Inter' }}>
              {hoveredNode.data.description?.slice(0, 80)}...
            </p>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapMap;
