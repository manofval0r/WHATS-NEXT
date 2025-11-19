import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import CustomNode from './CustomNode'; // Import our neon node
import { useNavigate } from 'react-router-dom';

// Register the custom node type so React Flow knows it exists
const nodeTypes = { customNode: CustomNode };

export default function Dashboard() {
  // State for Graph
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for UI
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Roadmap on Component Mount
  useEffect(() => {
    const fetchRoadmap = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) { navigate('/'); return; }

      try {
        const res = await axios.post('http://127.0.0.1:8000/api/my-roadmap/', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Load data into React Flow
        setNodes(res.data.nodes);
        setEdges(res.data.edges);
      } catch (err) {
        console.error("Failed to load roadmap", err);
        if (err.response && err.response.status === 401) {
          navigate('/'); // Redirect if token expired
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [navigate, setNodes, setEdges]);

  // 2. Handle Clicking a Node
  const onNodeClick = useCallback((event, node) => {
    // Only open details if the node is NOT locked
    if (node.data.status !== 'locked') {
      setSelectedNode(node);
    }
  }, []);

  // 3. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#050505', color: '#fff', overflow: 'hidden' }}>
      
      {/* --- LEFT SIDEBAR (Navigation) --- */}
      <div style={{ width: '260px', borderRight: '1px solid #222', padding: '25px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 20px 0', background: 'linear-gradient(90deg, #00f2ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          WHAT'S NEXT?
        </h2>
        
        {/* Stats Widget */}
        <div style={{ background: '#111', padding: '15px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #333' }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Market Readiness</div>
          <div style={{ fontSize: '18px', color: '#00ff88', fontWeight: 'bold' }}>Junior Ready</div>
          <div style={{ height: '4px', background: '#333', marginTop: '10px', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: '35%', background: '#00ff88' }}></div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1 }}>
          <div style={menuItemStyle}>🚀 Roadmap</div>
          <div style={menuItemStyle}>👤 My Portfolio</div>
          <div style={menuItemStyle}>🏆 Milestones</div>
        </nav>

        <button onClick={handleLogout} style={{ background: '#222', border: 'none', color: '#aaa', padding: '10px', cursor: 'pointer', borderRadius: '5px' }}>
          Log Out
        </button>
      </div>

      {/* --- CENTER (The Roadmap) --- */}
      <div style={{ flex: 1, position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <p style={{ color: '#00f2ff', animation: 'pulse 1s infinite' }}>Consulting AI Architect...</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background color="#151515" gap={25} />
            <Controls style={{ filter: 'invert(1)' }} />
          </ReactFlow>
        )}
      </div>

      {/* --- RIGHT PANEL (Slide-over Details) --- */}
      {selectedNode && (
        <div style={{ 
          width: '400px', 
          borderLeft: '1px solid #222', 
          background: 'rgba(10, 10, 10, 0.95)', 
          backdropFilter: 'blur(10px)',
          padding: '30px', 
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <button onClick={() => setSelectedNode(null)} style={{ float: 'right', background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✖</button>
          
          <h5 style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0 }}>Module Details</h5>
          <h1 style={{ margin: '10px 0', color: '#00f2ff' }}>{selectedNode.data.label}</h1>
          
          <p style={{ lineHeight: '1.6', color: '#ccc' }}>
            {selectedNode.data.description}
          </p>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>📚 Learning Resources</h3>
            
            <div style={{ background: '#151515', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #333' }}>
              <div style={{ color: '#00ff88', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>RECOMMENDED</div>
              <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '16px' }}>
                {selectedNode.data.resources?.main} ↗
              </a>
            </div>

            <div style={{ background: '#151515', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ color: '#888', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>ALTERNATIVE</div>
              <div style={{ color: '#ccc' }}>{selectedNode.data.resources?.alt}</div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>🛠 Verification Project</h3>
            <div style={{ background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)', padding: '20px', borderRadius: '10px', border: '1px dashed #444' }}>
              <p style={{ marginTop: 0, fontStyle: 'italic', color: '#ddd' }}>"{selectedNode.data.project_prompt}"</p>
              <button style={{ width: '100%', padding: '12px', background: '#00f2ff', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Submit Project Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline styles
const menuItemStyle = {
  padding: '12px',
  margin: '5px 0',
  cursor: 'pointer',
  color: '#ccc',
  borderRadius: '5px',
  transition: '0.2s',
  ':hover': { background: '#222', color: '#fff' }
};