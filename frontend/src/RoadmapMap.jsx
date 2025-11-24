import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';

const RoadmapMap = ({ nodes, onNodeClick }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Resize Observer to keep SVG responsive
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // D3 Render Logic
  useEffect(() => {
    if (!dimensions.width || !dimensions.height || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = dimensions.width;
    // Constrain the wave width so it doesn't get too scattered on wide screens
    const waveWidth = Math.min(width, 600); 
    const centerOffset = (width - waveWidth) / 2;

    const nodeSpacing = 300; // Increased spacing for better "flow"
    const totalHeight = nodes.length * nodeSpacing + 400; 
    
    svg.attr("height", totalHeight);

    // --- 1. GENERATE PATH ---
    // Winding path going DOWN from top (First module at top)
    const pathPoints = nodes.map((node, i) => {
      const y = (i * nodeSpacing) + 100; // Start from top
      // Sine wave X position
      const x = (width / 2) + Math.sin(i * 0.8) * (waveWidth / 4); 
      return { x, y, data: node };
    });

    // Create a smooth curve generator
    const lineGenerator = d3.line()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x(d => d.x)
      .y(d => d.y);

    // Draw the Path (Background Track)
    svg.append("path")
      .datum(pathPoints)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#30363d")
      .attr("stroke-width", 24) // Thicker path
      .attr("stroke-linecap", "round");

    // Draw the Path (Active Progress)
    let activeIndex = nodes.findIndex(n => n.data.status === 'active');
    if (activeIndex === -1) activeIndex = nodes.length - 1; 

    const activePoints = pathPoints.slice(0, activeIndex + 1);
    
    if (activePoints.length > 1) {
        svg.append("path")
        .datum(activePoints)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", "#00f2ff") 
        .attr("stroke-width", 8) // Thicker active path
        .attr("stroke-linecap", "round")
        .attr("filter", "drop-shadow(0 0 8px #00f2ff)");
    }

    // --- 2. DRAW NODES ---
    const nodeGroups = svg.selectAll(".node-group")
      .data(pathPoints)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(event, d.data))
      .on("mouseenter", (event, d) => {
        setHoveredNode({ 
            data: d.data.data, 
            x: d.x, 
            y: d.y 
        });
      })
      .on("mouseleave", () => setHoveredNode(null));

    // Node Circle Background (Outer Glow)
    nodeGroups.append("circle")
      .attr("r", 40) // Bigger nodes
      .attr("fill", d => {
        if (d.data.data.status === 'completed') return "#0d1117";
        if (d.data.data.status === 'active') return "#0d1117";
        return "#161b22";
      })
      .attr("stroke", d => {
        if (d.data.data.status === 'completed') return "#2ea043"; 
        if (d.data.data.status === 'active') return "#00f2ff"; 
        return "#30363d"; 
      })
      .attr("stroke-width", d => d.data.data.status === 'active' ? 4 : 3)
      .attr("filter", d => d.data.data.status === 'active' ? "drop-shadow(0 0 12px #00f2ff)" : "");

    // Icon / Number inside
    nodeGroups.append("text")
      .attr("dy", 6)
      .attr("text-anchor", "middle")
      .attr("fill", d => {
        if (d.data.data.status === 'locked') return "#8b949e";
        return "#fff";
      })
      .style("font-family", "JetBrains Mono")
      .style("font-size", "18px") // Bigger text
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d, i) => i + 1);

  }, [dimensions, nodes, onNodeClick]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflowY: 'auto', position: 'relative' }}>
      <svg ref={svgRef} width="100%" style={{ minHeight: '100%' }}></svg>
      
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              left: hoveredNode.x,
              top: hoveredNode.y - 80, // Position above the node
              transform: 'translateX(-50%)',
              background: 'rgba(13, 17, 23, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '12px',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <h4 style={{ margin: 0, color: '#f0f6fc', fontSize: '14px', fontFamily: 'Inter', fontWeight: '600' }}>
              {hoveredNode.data.label}
            </h4>
            <p style={{ margin: '4px 0 0 0', color: '#8b949e', fontSize: '12px', fontFamily: 'Inter' }}>
              {hoveredNode.data.description?.slice(0, 60)}...
            </p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: hoveredNode.data.status === 'locked' ? '#21262d' : 'rgba(0, 242, 255, 0.1)',
                    color: hoveredNode.data.status === 'locked' ? '#8b949e' : '#00f2ff',
                    border: hoveredNode.data.status === 'locked' ? '1px solid #30363d' : '1px solid rgba(0, 242, 255, 0.3)'
                }}>
                    {hoveredNode.data.status.toUpperCase()}
                </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapMap;
