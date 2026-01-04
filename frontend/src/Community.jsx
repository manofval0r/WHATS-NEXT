import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Search, Plus, ArrowLeft,
    CheckCircle, X, Send, ArrowBigUp, User
} from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';

const PREDEFINED_TAGS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML',
    'TypeScript', 'Vue', 'Angular', 'Django', 'Flask', 'SQL',
    'MongoDB', 'Git', 'Docker', 'AWS', 'Firebase', 'Next.js'
];

export default function Community() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
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
            if (filter !== 'All' && filter !== 'Trending') {
                url += `?type=${filter.toLowerCase()}`;
            }
            const res = await api.get(url);
            let posts = res.data;
            if (filter === 'Trending') {
                posts = posts.sort((a, b) => b.upvotes - a.upvotes);
            }
            setFeed(posts);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (e, postId) => {
        e.stopPropagation();
        try {
            const res = await api.post(`/api/community/posts/${postId}/upvote/`);
            setFeed(feed.map(p => p.id === postId ? { ...p, upvotes: res.data.upvotes, is_upvoted: res.data.voted } : p));
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(prev => ({ ...prev, upvotes: res.data.upvotes, is_upvoted: res.data.voted }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredFeed = feed.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    if (selectedPost) {
        return (
            <PostDetailView
                post={selectedPost}
                onBack={() => setSelectedPost(null)}
                onUpvote={(e) => handleUpvote(e, selectedPost.id)}
                currentUser={currentUser}
                navigate={navigate}
            />
        );
    }

    const filterTags = ['All', 'Trending', ...PREDEFINED_TAGS.slice(0, 8)];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#05070a', // Deep Cyberpunk black
            paddingBottom: isMobile ? '100px' : '40px',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* INJECT CYPBERPUNK STYLES */}
            <style>{`
                :root { --neon-cyan: #00f2ff; --neon-blue: #3713ec; }
                .blink { animation: blink 1s infinite; }
                @keyframes blink { 50% { opacity: 0; } }
            `}</style>

            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(5, 7, 10, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0, 242, 255, 0.1)'
            }}>
                <div style={{ padding: '16px 24px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '4px', height: '24px', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}></div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'JetBrains Mono', letterSpacing: '-0.5px' }}>
                                COMMUNITY_HUB
                            </h1>
                        </div>

                        {!isMobile && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={styles.cyberButton}
                            >
                                <Plus size={16} />
                                <span>NEW_TRANSMISSION</span>
                            </button>
                        )}
                    </div>

                    <div style={styles.searchBar}>
                        <Search size={18} color="var(--neon-cyan)" />
                        <input
                            type="text"
                            placeholder="Search frequency..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={styles.clearButton}>
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div style={styles.filterContainer}>
                        {filterTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFilter(tag)}
                                style={{
                                    ...styles.filterTag,
                                    background: filter === tag ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                    color: filter === tag ? 'var(--neon-cyan)' : '#8b949e',
                                    border: filter === tag ? '1px solid var(--neon-cyan)' : '1px solid transparent',
                                    boxShadow: filter === tag ? '0 0 10px rgba(0, 242, 255, 0.2)' : 'none'
                                }}
                            >
                                {tag === 'Trending' ? '⚡ Trending' : tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feed */}
            <main style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1000px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#8b949e', fontFamily: 'JetBrains Mono' }}>
                        <span className="blink">{'>'}</span> ACCESSING_NETWORK...
                    </div>
                ) : filteredFeed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#8b949e', fontFamily: 'JetBrains Mono' }}>
                        NO_SIGNALS_DETECTED
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {filteredFeed.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onClick={() => setSelectedPost(post)}
                                onUpvote={handleUpvote}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </main>

            {isMobile && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={styles.fab}
                >
                    <Plus size={24} />
                </button>
            )}

            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={fetchFeed}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}

function PostCard({ post, onClick, onUpvote, navigate }) {
    const timeAgo = getTimeAgo(post.created_at);
    const authorName = typeof post.author === 'object' ? post.author.username : post.author;

    return (
        <div onClick={onClick} style={styles.card}>
            <div style={styles.cardHeader}>
                <div
                    style={styles.userAvatar}
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${authorName}`); }}
                >
                    <User size={14} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={styles.username} onClick={(e) => { e.stopPropagation(); navigate(`/profile/${authorName}`); }}>
                            {authorName}
                        </p>
                        <span style={{ fontSize: '10px', color: '#8b949e' }}>•</span>
                        <p style={styles.timeAgo}>{timeAgo}</p>
                    </div>
                </div>
                {post.post_type === 'question' && <span style={styles.typeBadge}>?</span>}
            </div>

            <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{post.title}</h3>
                <p style={styles.cardDescription}>{post.content}</p>
            </div>

            <div style={styles.cardFooter}>
                <div style={styles.stats}>
                    <div style={styles.statItem} onClick={(e) => onUpvote(e, post.id)}>
                        <ArrowBigUp size={20} color={post.is_upvoted ? 'var(--neon-cyan)' : '#8b949e'}
                            style={{ filter: post.is_upvoted ? 'drop-shadow(0 0 5px var(--neon-cyan))' : 'none' }}
                        />
                        <span style={{ color: post.is_upvoted ? 'var(--neon-cyan)' : 'inherit', fontWeight: 'bold' }}>{post.upvotes || 0}</span>
                    </div>
                    <div style={styles.statItem}>
                        <MessageSquare size={18} />
                        <span>{post.reply_count || 0}</span>
                    </div>
                </div>
                {post.tags && post.tags.length > 0 && (
                    <div style={styles.tags}>
                        {post.tags.slice(0, 3).map((tag, idx) => (
                            <div key={idx} style={styles.tag}>#{tag}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PostDetailView({ post, onBack, onUpvote, currentUser, navigate }) {
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    const postAuthorName = typeof post.author === 'object' ? post.author.username : post.author;

    useEffect(() => {
        const fetchReplies = async () => {
            try {
                const res = await api.get(`/api/community/posts/${post.id}/replies/`);
                setReplies(res.data);
            } catch (e) { console.error(e); }
        };
        fetchReplies();
    }, [post.id]);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setLoading(true);
        try {
            await api.post('/api/community/replies/', { post: post.id, content: replyText });
            setReplyText('');
            const res = await api.get(`/api/community/posts/${post.id}/replies/`);
            setReplies(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#05070a', paddingBottom: '40px' }}>
            <div style={{
                position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,7,10,0.9)', backdropFilter: 'blur(10px)',
                padding: '16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '16px'
            }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> BACK
                </button>
            </div>

            <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 16px' }}>
                <div style={{ ...styles.card, marginBottom: '30px', border: '1px solid rgba(0,242,255,0.2)' }}>
                    <div style={styles.cardHeader}>
                        <h1 style={{ fontSize: '28px', color: '#fff', margin: 0 }}>{post.title}</h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '14px', color: '#8b949e' }}>
                        <span style={{ color: 'var(--neon-cyan)', cursor: 'pointer' }} onClick={() => navigate(`/profile/${postAuthorName}`)}>@{postAuthorName}</span>
                        <span>•</span>
                        <span>{getTimeAgo(post.created_at)}</span>
                    </div>
                    <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#c9d1d9', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        {post.tags?.map(t => <span key={t} style={styles.tag}>#{t}</span>)}
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={onUpvote} style={{ background: 'none', border: 'none', color: post.is_upvoted ? 'var(--neon-cyan)' : '#8b949e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                            <ArrowBigUp size={24} /> {post.upvotes}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b949e' }}>
                            <MessageSquare size={20} /> {replies.length}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#fff', fontFamily: 'JetBrains Mono' }}>TRANSMISSIONS ({replies.length})</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    {replies.map(reply => (
                        <div key={reply.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #30363d' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--neon-cyan)', fontSize: '13px', fontWeight: 'bold' }}>
                                    {typeof reply.author === 'object' ? reply.author.username : reply.author}
                                </span>
                                <span style={{ color: '#484f58', fontSize: '12px' }}>{getTimeAgo(reply.created_at)}</span>
                            </div>
                            <p style={{ margin: 0, color: '#c9d1d9', fontSize: '14px' }}>{reply.content}</p>
                        </div>
                    ))}
                </div>

                <div style={{ paddingBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Send a transmission..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px', borderRadius: '8px', outline: 'none', fontFamily: 'JetBrains Mono' }}
                        />
                        <button onClick={handleReply} disabled={loading} style={{ background: 'var(--neon-cyan)', color: '#000', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>
                            SEND
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreatePostModal({ onClose, onSuccess, currentUser }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('question');
    const [selectedTags, setSelectedTags] = useState([]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        try {
            await api.post('/api/community/posts/', { title, content, post_type: postType, tags: selectedTags });
            onSuccess();
            onClose();
        } catch (e) { alert('Transmission failed'); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div style={{ width: '600px', maxWidth: '90vw', background: '#0d1117', border: '1px solid var(--neon-cyan)', borderRadius: '12px', padding: '24px', boxShadow: '0 0 30px rgba(0,242,255,0.15)' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ color: 'var(--neon-cyan)', fontFamily: 'JetBrains Mono', marginTop: 0 }}>NEW_TRANSMISSION</h2>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {['question', 'discussion'].map(type => (
                        <button key={type} onClick={() => setPostType(type)} style={{
                            flex: 1, padding: '10px', background: postType === type ? 'rgba(0,242,255,0.1)' : 'transparent',
                            border: postType === type ? '1px solid var(--neon-cyan)' : '1px solid #30363d', color: postType === type ? 'var(--neon-cyan)' : '#8b949e',
                            borderRadius: '6px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold'
                        }}>{type}</button>
                    ))}
                </div>

                <input type="text" placeholder="Subject Line..." value={title} onChange={e => setTitle(e.target.value)}
                    style={{ width: '100%', background: '#010409', border: '1px solid #30363d', padding: '12px', color: '#fff', borderRadius: '6px', marginBottom: '12px', fontFamily: 'JetBrains Mono' }} />

                <textarea placeholder="Message content..." value={content} onChange={e => setContent(e.target.value)} rows={6}
                    style={{ width: '100%', background: '#010409', border: '1px solid #30363d', padding: '12px', color: '#c9d1d9', borderRadius: '6px', marginBottom: '20px', resize: 'vertical' }} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' }}>CANCEL</button>
                    <button onClick={handleSubmit} style={{ background: 'var(--neon-cyan)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>TRANSMIT</button>
                </div>
            </div>
        </div>
    );
}

function getTimeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

const styles = {
    cyberButton: {
        background: 'rgba(0,242,255,0.1)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)',
        padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        fontWeight: 'bold', fontSize: '12px', fontFamily: 'JetBrains Mono', boxShadow: '0 0 10px rgba(0,242,255,0.2)'
    },
    searchBar: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'
    },
    searchInput: { flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'JetBrains Mono', fontSize: '13px' },
    clearButton: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer' },
    filterContainer: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' },
    filterTag: {
        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
    },
    card: {
        background: 'rgba(22, 27, 34, 0.6)', borderRadius: '8px', border: '1px solid #30363d', padding: '20px',
        cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
    },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 1 },
    userAvatar: { width: '28px', height: '28px', borderRadius: '4px', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' },
    username: { margin: 0, color: '#c9d1d9', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    timeAgo: { margin: 0, color: '#484f58', fontSize: '12px' },
    cardTitle: { margin: '0 0 8px 0', color: '#fff', fontSize: '18px', fontWeight: '600', lineHeight: '1.4' },
    cardDescription: { margin: 0, color: '#8b949e', fontSize: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    cardFooter: { marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    stats: { display: 'flex', gap: '20px', color: '#8b949e', fontSize: '14px' },
    statItem: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },
    tags: { display: 'flex', gap: '8px' },
    tag: { color: 'var(--neon-cyan)', fontSize: '12px', opacity: 0.8 },
    typeBadge: { position: 'absolute', top: 0, right: 0, background: '#30363d', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff' },
    fab: { position: 'fixed', bottom: '90px', right: '20px', width: '50px', height: '50px', borderRadius: '50%', background: 'var(--neon-cyan)', color: '#000', border: 'none', boxShadow: '0 0 20px rgba(0,242,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
    cardGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--neon-cyan), transparent)', opacity: 0.5 }
};