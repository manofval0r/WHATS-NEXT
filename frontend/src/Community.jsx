import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, MessageSquare, Code, Users, Terminal, Send, Trash2, ArrowBigUp, ArrowBigDown } from 'lucide-react';

export default function Community() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('username');

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const res = await api.get('/api/community/feed/');
            setFeed(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleVote = async (itemId, type) => {
        try {
            const res = await api.post(`/api/community/verify/${itemId}/`,
                { vote_type: type }
            );

            setFeed(feed.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        verifications: res.data.new_count,
                        user_vote: res.data.user_vote
                    };
                }
                return item;
            }));

        } catch (e) { alert(e.response?.data?.error || "Error voting"); }
    };

    const toggleComments = async (projectId) => {
        if (activeCommentId === projectId) {
            setActiveCommentId(null);
            return;
        }

        setActiveCommentId(projectId);
        if (!comments[projectId]) {
            setLoadingComments(true);
            try {
                const res = await api.get(`/api/community/comments/${projectId}/`);
                setComments(prev => ({ ...prev, [projectId]: res.data }));
            } catch (e) { console.error(e); }
            finally { setLoadingComments(false); }
        }
    };

    const postComment = async (projectId) => {
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/api/community/comments/${projectId}/create/`,
                { text: newComment }
            );

            setComments(prev => ({
                ...prev,
                [projectId]: [res.data, ...(prev[projectId] || [])]
            }));
            setNewComment("");
        } catch (e) {
            console.error(e);
            alert("Failed to post comment");
        }
    };

    const deleteComment = async (commentId, projectId) => {
        if (!confirm("Delete this comment?")) return;
        try {
            await api.delete(`/api/community/comments/${commentId}/delete/`);

            setComments(prev => ({
                ...prev,
                [projectId]: prev[projectId].filter(c => c.id !== commentId)
            }));
        } catch (e) { alert("Failed to delete"); }
    };

    return (
        <div style={{ padding: '40px', height: '100%', overflowY: 'auto', background: 'var(--bg-dark)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users size={24} color="var(--electric-purple)" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontFamily: 'JetBrains Mono', color: '#fff' }}>
                            COMMUNITY_FEED
                        </h1>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Discover projects, review code, and earn reputation.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                        <div className="terminal-loader">
                            <div className="text">SYNCING_FEED...</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {feed.length > 0 ? feed.map(item => (
                            <div key={item.id} style={cardStyle}>

                                {/* Vote Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingRight: '15px', borderRight: '1px solid var(--border-subtle)' }}>
                                    <button
                                        onClick={() => handleVote(item.id, 'up')}
                                        style={{ background: 'none', border: 'none', color: item.user_vote === 'up' ? 'var(--neon-cyan)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <ArrowBigUp size={24} fill={item.user_vote === 'up' ? "currentColor" : "none"} />
                                    </button>

                                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>
                                        {item.verifications || 0}
                                    </span>

                                    <button
                                        onClick={() => handleVote(item.id, 'down')}
                                        style={{ background: 'none', border: 'none', color: item.user_vote === 'down' ? 'var(--error-red)' : 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <ArrowBigDown size={24} fill={item.user_vote === 'down' ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {/* Content Column */}
                                <div style={{ flex: 1, paddingLeft: '15px' }}>
                                    {/* User Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                        <div
                                            style={avatarStyle}
                                            onClick={() => navigate(`/u/${item.username}`)}
                                        >
                                            {item.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div
                                                onClick={() => navigate(`/u/${item.username}`)}
                                                style={{ fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '14px', cursor: 'pointer' }}
                                            >
                                                @{item.username}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {item.date} • {item.career}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Info */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '18px' }}>
                                            {item.module}
                                        </h3>

                                        <a href={item.link} target="_blank" rel="noreferrer" style={linkBoxStyle}>
                                            <Code size={16} color="var(--neon-cyan)" />
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteWhiteSpace: 'nowrap', flex: 1 }}>
                                                View Source Code
                                            </span>
                                            <ExternalLink size={14} style={{ opacity: 0.5 }} />
                                        </a>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <button
                                            onClick={() => toggleComments(item.id)}
                                            style={{
                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                color: activeCommentId === item.id ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '13px'
                                            }}
                                        >
                                            <MessageSquare size={16} />
                                            {activeCommentId === item.id ? 'Hide Comments' : 'Comments'}
                                        </button>
                                    </div>

                                    {/* COMMENTS SECTION */}
                                    {activeCommentId === item.id && (
                                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--border-subtle)', animation: 'fadeIn 0.3s ease' }}>
                                            {loadingComments && !comments[item.id] ? (
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading comments...</div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                    {/* List */}
                                                    {comments[item.id]?.length > 0 ? (
                                                        comments[item.id].map(comment => (
                                                            <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                                                                <div style={{
                                                                    width: '24px', height: '24px', borderRadius: '6px',
                                                                    background: 'var(--bg-lighter)', color: 'var(--text-muted)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '10px', fontWeight: 'bold'
                                                                }}>
                                                                    {(comment.author_username || "?")[0].toUpperCase()}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <span
                                                                            onClick={() => navigate(`/u/${comment.author_username}`)}
                                                                            style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', cursor: 'pointer' }}
                                                                        >
                                                                            @{comment.author_username}
                                                                        </span>
                                                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                                                        {comment.text}
                                                                    </p>
                                                                </div>
                                                                {/* Delete button */}
                                                                {(currentUser === comment.author_username) && (
                                                                    <button
                                                                        onClick={() => deleteComment(comment.id, item.id)}
                                                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                            No comments yet. Be the first!
                                                        </div>
                                                    )}

                                                    {/* Input */}
                                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Write a comment..."
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && postComment(item.id)}
                                                            style={{
                                                                flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)',
                                                                borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => postComment(item.id)}
                                                            style={{
                                                                background: 'var(--accent-primary)', border: 'none', borderRadius: '6px',
                                                                width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                cursor: 'pointer', color: 'var(--bg-dark)'
                                                            }}
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{
                                color: 'var(--text-muted)', textAlign: 'center', padding: '60px',
                                border: '1px dashed var(--border-subtle)', borderRadius: '12px'
                            }}>
                                <Terminal size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                <p>No projects submitted yet. Be the first to deploy!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

// --- STYLES ---
const cardStyle = {
    background: 'rgba(22, 27, 34, 0.8)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px', padding: '20px',
    display: 'flex', gap: '15px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s, border-color 0.2s',
};

const avatarStyle = {
    width: '36px', height: '36px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #21262d 0%, #161b22 100%)',
    border: '1px solid var(--border-subtle)',
    color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontWeight: 'bold', fontSize: '14px', fontFamily: 'JetBrains Mono',
    cursor: 'pointer'
};

const linkBoxStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(13, 17, 23, 0.5)', padding: '12px 16px',
    borderRadius: '8px', border: '1px solid var(--border-subtle)',
    color: 'var(--text-main)', textDecoration: 'none', fontSize: '13px',
    transition: 'all 0.2s', fontFamily: 'JetBrains Mono'
};