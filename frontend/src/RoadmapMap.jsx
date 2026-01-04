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
      .attr("stroke", "#30363d") // Darker, more technical path
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
        .attr("stroke", "#58a6ff") // Cyan/Blue active path
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
      .on("click", (event, d) => onNodeClick(event, d.data))
      .on("mouseenter", (event, d) => {
        setHoveredNode({
          data: d.data.data,
          x: d.x,
          y: d.y
        });
        // Subtle Scale only
        d3.select(event.currentTarget)
          .transition().duration(200).ease(d3.easeCubicOut)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1.05)`);
      })
      .on("mouseleave", (event, d) => {
        setHoveredNode(null);
        // Return to normal
        d3.select(event.currentTarget)
          .transition().duration(200)
          .attr("transform", `translate(${d.x}, ${d.y}) scale(1)`);
      });

    // 3A. Base Circle (Dark Fill)
    nodeGroups.append("circle")
      .attr("r", 40)
      .attr("fill", "#0d1117") // Deep dark fill
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "#238636"; // Tech Green
        if (d.data.data.status === 'active') return "#58a6ff";    // Tech Cyan
        return "#30363d"; // Muted Gray
      })
      .attr("stroke-width", d => d.data.data.status === 'active' ? 2 : 1);

    // 3B. Tech Ring (Outer Rim)
    nodeGroups.append("circle")
      .attr("r", 46)
      .attr("fill", "none")
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "rgba(35, 134, 54, 0.4)";
        if (d.data.data.status === 'active') return "rgba(88, 166, 255, 0.4)";
        return "transparent";
      })
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,4"); // Mechanical dash ring

    // 3C. Inner Logic (Status Indicator)
    nodeGroups.append("circle")
      .attr("r", 4)
      .attr("cy", -25) // Top indicator
      .attr("fill", d => {
        if (d.data.data.status === 'completed') return "#238636";
        if (d.data.data.status === 'active') return "#58a6ff";
        return "#30363d";
      });

    // 3D. Icon / Text (Clean)
    nodeGroups.append("text")
      .attr("dy", 6)
      .attr("text-anchor", "middle")
      .attr("fill", d => {
        if (d.data.data.status === 'locked') return "#484f58";
        return "#e6edf3"; // High contrast text
      })
      .style("font-family", "JetBrains Mono, monospace")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text((d, i) => `0${i + 1}`); // 01, 02 format

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: hoveredNode.x,
              top: hoveredNode.y - 90,
              transform: 'translateX(-50%)',
              background: '#0d1117', // Solid dark
              border: '1px solid #30363d', // Clean border
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              borderRadius: '6px',
              padding: '16px',
              pointerEvents: 'none',
              zIndex: 100,
              minWidth: '220px',
              textAlign: 'left' // Left align for tech feel
            }}
          >
            {/* Connection Line */}
            <div style={{
              position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: '12px', height: '12px',
              background: '#0d1117',
              borderBottom: '1px solid #30363d',
              borderRight: '1px solid #30363d',
              zIndex: 1
            }}></div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
              borderBottom: '1px solid #21262d', paddingBottom: '8px'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#8b949e', textTransform: 'uppercase' }}>
                    // MODULE_INFO
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 'bold',
                color: hoveredNode.data.status === 'completed' ? '#238636' : hoveredNode.data.status === 'active' ? '#58a6ff' : '#484f58',
                fontFamily: 'JetBrains Mono'
              }}>
                [{hoveredNode.data.status.toUpperCase()}]
              </span>
            </div>

            <h4 style={{ margin: '0 0 4px 0', color: '#e6edf3', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600' }}>
              {hoveredNode.data.label}
            </h4>

            <p style={{ margin: 0, color: '#8b949e', fontSize: '12px', fontFamily: 'Inter', lineHeight: '1.4' }}>
              {hoveredNode.data.description?.slice(0, 100)}...
            </p>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapMap;
