import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Users, Search, Plus, ThumbsUp, Eye,
    CheckCircle, HelpCircle, Hash, Filter, X, Image as ImageIcon,
    MoreVertical, Share2, CornerDownRight, Trash2, Send, ArrowBigUp, ArrowBigDown
} from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';

export default function Community() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, question, discussion
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // If set, shows detail view
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const currentUser = localStorage.getItem('username');

    useEffect(() => {
        fetchFeed();
    }, [filter]);

    const fetchFeed = async () => {
        setLoading(true);
        try {
            let url = '/api/community/posts/';
            if (filter !== 'all') url += `?type=${filter}`;
            const res = await api.get(url);
            setFeed(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleUpvote = async (e, postId) => {
        e.stopPropagation();
        try {
            const res = await api.post(`/api/community/posts/${postId}/upvote/`);
            setFeed(feed.map(p => p.id === postId ? { ...p, upvotes: res.data.upvotes, is_upvoted: res.data.voted } : p));
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(prev => ({ ...prev, upvotes: res.data.upvotes, is_upvoted: res.data.voted }));
            }
        } catch (e) { console.error(e); }
    };

    if (selectedPost) {
        return (
            <PostDetailView
                post={selectedPost}
                onBack={() => setSelectedPost(null)}
                onUpvote={(e) => handleUpvote(e, selectedPost.id)}
                currentUser={currentUser}
            />
        );
    }

    return (
        <div style={{
            padding: isMobile ? '16px' : '40px',
            height: '100%',
            overflowY: 'auto',
            background: 'var(--bg-dark)',
            paddingBottom: isMobile ? '100px' : '40px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* HEADER */}
                <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '24px', fontFamily: 'JetBrains Mono', color: '#fff' }}>
                            COMMUNITY
                        </h1>
                        <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Ask questions, share knowledge, grow together.
                        </p>
                    </div>
                    {!isMobile && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={primaryButtonStyle}
                        >
                            <Plus size={18} />
                            Ask Question
                        </button>
                    )}
                </div>

                {/* FILTERS & SEARCH */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {['all', 'question', 'discussion'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: filter === type ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                                background: filter === type ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                color: filter === type ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontSize: '13px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {type === 'all' ? '🔥 Trending' : type}
                        </button>
                    ))}
                </div>

                {/* FEED */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        Loading community...
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {feed.map(post => (
                            <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                style={cardStyle}
                            >
                                {/* Header: Author & Time */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={avatarStyle}>
                                            {post.author.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                @{post.author.username}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    {post.post_type === 'question' && (
                                        <div style={{
                                            background: post.is_solved ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                                            color: post.is_solved ? 'var(--neon-green)' : 'orange',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            {post.is_solved ? <CheckCircle size={12} /> : <HelpCircle size={12} />}
                                            {post.is_solved ? 'SOLVED' : 'QUESTION'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>{post.title}</h3>
                                <p style={{
                                    margin: 0, fontSize: '14px', color: 'var(--text-secondary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                                }}>
                                    {post.content}
                                </p>

                                {/* Module Badge */}
                                {post.attached_module_name && (
                                    <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <Hash size={12} />
                                        {post.attached_module_name}
                                    </div>
                                )}

                                {/* Footer: Stats */}
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '20px' }}>
                                    <button
                                        onClick={(e) => handleUpvote(e, post.id)}
                                        style={{ ...actionButtonStyle, color: post.is_upvoted ? 'var(--neon-cyan)' : 'var(--text-muted)' }}
                                    >
                                        <ThumbsUp size={16} fill={post.is_upvoted ? "currentColor" : "none"} />
                                        {post.upvotes}
                                    </button>
                                    <div style={actionButtonStyle}>
                                        <MessageSquare size={16} />
                                        {post.reply_count}
                                    </div>
                                    <div style={actionButtonStyle}>
                                        <Eye size={16} />
                                        {post.view_count}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* MOBILE FAB */}
                {isMobile && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            position: 'fixed', bottom: '90px', right: '20px',
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'var(--neon-cyan)', border: 'none',
                            boxShadow: '0 4px 12px rgba(0, 242, 255, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100
                        }}
                    >
                        <Plus size={24} color="#000" />
                    </button>
                )}

                {/* CREATE MODAL */}
                {showCreateModal && (
                    <CreatePostModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => { setShowCreateModal(false); fetchFeed(); }}
                    />
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function PostDetailView({ post, onBack, onUpvote, currentUser }) {
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReplies();
    }, [post.id]);

    const fetchReplies = async () => {
        try {
            const res = await api.get(`/api/community/posts/${post.id}/replies/`);
            setReplies(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleReply = async () => {
        if (!newReply.trim()) return;
        try {
            const res = await api.post('/api/community/replies/', {
                post: post.id,
                content: newReply
            });
            setReplies([...replies, res.data]);
            setNewReply("");
        } catch (e) { alert("Failed to reply"); }
    };

    const handleAccept = async (replyId) => {
        try {
            const res = await api.post(`/api/community/replies/${replyId}/accept/`);
            setReplies(replies.map(r => r.id === replyId ? { ...r, is_accepted: res.data.is_accepted } : r));
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto', background: 'var(--bg-dark)', paddingBottom: '100px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px', cursor: 'pointer' }}>
                    <CornerDownRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Feed
                </button>

                {/* Main Post */}
                <div style={{ ...cardStyle, marginBottom: '20px', border: '1px solid var(--neon-cyan)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <div style={avatarStyle}>{post.author.username[0].toUpperCase()}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>@{post.author.username}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                    <h2 style={{ margin: '0 0 15px 0', color: '#fff' }}>{post.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                        <button onClick={onUpvote} style={{ ...actionButtonStyle, color: post.is_upvoted ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
                            <ThumbsUp size={18} fill={post.is_upvoted ? "currentColor" : "none"} /> {post.upvotes}
                        </button>
                    </div>
                </div>

                {/* Replies */}
                <h3 style={{ color: '#fff', marginBottom: '15px' }}>{replies.length} Replies</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                    {replies.map(reply => (
                        <div key={reply.id} style={{ ...cardStyle, border: reply.is_accepted ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)' }}>
                            {reply.is_accepted && (
                                <div style={{ marginBottom: '10px', color: 'var(--neon-green)', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={14} /> ACCEPTED ANSWER
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ ...avatarStyle, width: '28px', height: '28px', fontSize: '12px' }}>{reply.author.username[0].toUpperCase()}</div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>@{reply.author.username}</span>
                                </div>
                                {currentUser === post.author.username && !post.is_solved && (
                                    <button onClick={() => handleAccept(reply.id)} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '11px', padding: '4px 8px', cursor: 'pointer' }}>
                                        Accept Answer
                                    </button>
                                )}
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.5' }}>{reply.content}</p>
                        </div>
                    ))}
                </div>

                {/* Reply Input */}
                <div style={{ position: 'sticky', bottom: '20px', background: 'var(--bg-surface)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
                    <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Type your reply..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', resize: 'none', outline: 'none' }}
                    />
                    <button onClick={handleReply} style={{ background: 'var(--neon-cyan)', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Send size={18} color="#000" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreatePostModal({ onClose, onSuccess }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("question");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title || !content) return;
        setLoading(true);
        try {
            await api.post('/api/community/posts/', { title, content, post_type: type });
            onSuccess();
        } catch (e) { alert("Failed to create post"); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Ask a Question</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {['question', 'discussion'].map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
                                background: type === t ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                color: type === t ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                cursor: 'pointer', textTransform: 'capitalize'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <input
                    placeholder="Title (e.g., How do I center a div?)"
                    value={title} onChange={e => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', marginBottom: '15px', outline: 'none' }}
                />

                <textarea
                    placeholder="Describe your issue in detail..."
                    value={content} onChange={e => setContent(e.target.value)}
                    style={{ width: '100%', height: '150px', padding: '12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', marginBottom: '20px', resize: 'none', outline: 'none' }}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: 'var(--neon-cyan)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Posting...' : 'Post Question'}
                </button>
            </div>
        </div>
    );
}

// --- STYLES ---
const cardStyle = {
    background: 'rgba(22, 27, 34, 0.6)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px', padding: '16px',
    cursor: 'pointer', transition: 'background 0.2s'
};

const avatarStyle = {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'var(--bg-lighter)', color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '14px'
};

const actionButtonStyle = {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
    cursor: 'pointer'
};

const primaryButtonStyle = {
    background: 'var(--neon-cyan)', color: '#000', border: 'none',
    padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
};