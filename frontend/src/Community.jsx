import { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Search, Plus, ThumbsUp, ArrowLeft,
    CheckCircle, Hash, X, Send, ArrowBigUp, User
} from 'lucide-react';
import { useIsMobile } from './hooks/useMediaQuery';

// Predefined tags for smart suggestion
const PREDEFINED_TAGS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'CSS', 'HTML',
    'TypeScript', 'Vue', 'Angular', 'Django', 'Flask', 'SQL',
    'MongoDB', 'Git', 'Docker', 'AWS', 'Firebase', 'Next.js',
    'Express', 'GraphQL', 'REST API', 'Testing', 'DevOps',
    'Machine Learning', 'Data Science', 'Web Development',
    'Mobile Development', 'UI/UX', 'Backend', 'Frontend'
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
            
            // Sort by trending if selected
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
            background: '#131022',
            paddingBottom: isMobile ? '100px' : '40px'
        }}>
            {/* Sticky Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(19, 16, 34, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#fff' }}>
                            Community
                        </h1>
                        {!isMobile && (
                            <button style={styles.searchIcon}>
                                <Search size={20} />
                            </button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div style={styles.searchBar}>
                        <Search size={18} color="#8b949e" />
                        <input
                            type="text"
                            placeholder="Search posts..."
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

                    {/* Filter Tags */}
                    <div style={styles.filterContainer}>
                        {filterTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFilter(tag)}
                                style={{
                                    ...styles.filterTag,
                                    background: filter === tag ? '#3713ec' : 'rgba(255, 255, 255, 0.1)',
                                    color: filter === tag ? '#fff' : 'rgba(255, 255, 255, 0.8)'
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feed */}
            <main style={{ padding: isMobile ? '8px' : '16px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
                        Loading posts...
                    </div>
                ) : filteredFeed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
                        No posts found. Be the first to post!
                    </div>
                ) : (
                    filteredFeed.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onClick={() => setSelectedPost(post)}
                            onUpvote={handleUpvote}
                            navigate={navigate}
                        />
                    ))
                )}
            </main>

            {/* FAB */}
            {isMobile && (
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={styles.fab}
                >
                    <Plus size={28} />
                </button>
            )}

            {/* Create Post Modal */}
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

// Post Card Component
function PostCard({ post, onClick, onUpvote, navigate }) {
    const timeAgo = getTimeAgo(post.created_at);

    return (
        <div onClick={onClick} style={styles.card}>
            {/* User Info */}
            <div style={styles.cardHeader}>
                <div
                    style={styles.userAvatar}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${post.author}`);
                    }}
                >
                    <User size={16} />
                </div>
                <div style={{ flex: 1 }}>
                    <p
                        style={styles.username}
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${post.author}`);
                        }}
                    >
                        {post.author}
                    </p>
                    <p style={styles.timeAgo}>{timeAgo}</p>
                </div>
            </div>

            {/* Content */}
            <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{post.title}</h3>
                <p style={styles.cardDescription}>{post.content}</p>
            </div>

            {/* Footer */}
            <div style={styles.cardFooter}>
                <div style={styles.stats}>
                    <div
                        style={styles.statItem}
                        onClick={(e) => onUpvote(e, post.id)}
                    >
                        <ArrowBigUp size={18} color={post.is_upvoted ? '#3713ec' : '#8b949e'} />
                        <span>{post.upvotes || 0}</span>
                    </div>
                    <div style={styles.statItem}>
                        <MessageSquare size={18} />
                        <span>{post.reply_count || 0}</span>
                    </div>
                </div>
                {post.tags && post.tags.length > 0 && (
                    <div style={styles.tags}>
                        {post.tags.slice(0, 2).map((tag, idx) => (
                            <div key={idx} style={styles.tag}>
                                {tag}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Post Detail View Component
function PostDetailView({ post, onBack, onUpvote, currentUser, navigate }) {
    const [replies, setReplies] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReplies();
    }, [post.id]);

    const fetchReplies = async () => {
        try {
            const res = await api.get(`/api/community/posts/${post.id}/replies/`);
            setReplies(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setLoading(true);
        try {
            await api.post('/api/community/replies/', {
                post: post.id,
                content: replyText
            });
            setReplyText('');
            fetchReplies();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.detailView}>
            {/* Header */}
            <div style={styles.detailHeader}>
                <button onClick={onBack} style={styles.backButton}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>

            {/* Post Content */}
            <div style={styles.detailPost}>
                <div style={styles.cardHeader}>
                    <div
                        style={styles.userAvatar}
                        onClick={() => navigate(`/profile/${post.author}`)}
                    >
                        <User size={16} />
                    </div>
                    <div>
                        <p
                            style={styles.username}
                            onClick={() => navigate(`/profile/${post.author}`)}
                        >
                            {post.author}
                        </p>
                        <p style={styles.timeAgo}>{getTimeAgo(post.created_at)}</p>
                    </div>
                </div>

                <h2 style={styles.detailTitle}>{post.title}</h2>
                <p style={styles.detailContent}>{post.content}</p>

                {post.tags && post.tags.length > 0 && (
                    <div style={{ ...styles.tags, marginTop: '16px' }}>
                        {post.tags.map((tag, idx) => (
                            <div key={idx} style={styles.tag}>{tag}</div>
                        ))}
                    </div>
                )}

                <div style={styles.detailStats}>
                    <button
                        onClick={onUpvote}
                        style={{
                            ...styles.statButton,
                            color: post.is_upvoted ? '#3713ec' : '#8b949e'
                        }}
                    >
                        <ArrowBigUp size={20} />
                        <span>{post.upvotes || 0}</span>
                    </button>
                </div>
            </div>

            {/* Replies */}
            <div style={styles.repliesSection}>
                <h3 style={styles.repliesTitle}>
                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>

                {replies.map(reply => (
                    <div key={reply.id} style={styles.reply}>
                        <div style={styles.cardHeader}>
                            <div
                                style={styles.userAvatar}
                                onClick={() => navigate(`/profile/${reply.author}`)}
                            >
                                <User size={14} />
                            </div>
                            <div>
                                <p
                                    style={{ ...styles.username, fontSize: '13px' }}
                                    onClick={() => navigate(`/profile/${reply.author}`)}
                                >
                                    {reply.author}
                                </p>
                                <p style={{ ...styles.timeAgo, fontSize: '11px' }}>
                                    {getTimeAgo(reply.created_at)}
                                </p>
                            </div>
                        </div>
                        <p style={styles.replyContent}>{reply.content}</p>
                    </div>
                ))}

                {/* Reply Input */}
                <div style={styles.replyInput}>
                    <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                        style={styles.replyInputField}
                    />
                    <button
                        onClick={handleReply}
                        disabled={loading || !replyText.trim()}
                        style={styles.sendButton}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Create Post Modal Component
function CreatePostModal({ onClose, onSuccess, currentUser }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState('question');
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Smart tag suggestion based on content
        const text = `${title} ${content}`.toLowerCase();
        const suggested = PREDEFINED_TAGS.filter(tag =>
            text.includes(tag.toLowerCase()) && !selectedTags.includes(tag)
        ).slice(0, 5);
        setSuggestedTags(suggested);
    }, [title, content, selectedTags]);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        setLoading(true);
        try {
            await api.post('/api/community/posts/', {
                title,
                content,
                post_type: postType,
                tags: selectedTags
            });
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>Create Post</h2>
                    <button onClick={onClose} style={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <div style={styles.modalContent}>
                    {/* Post Type */}
                    <div style={styles.typeSelector}>
                        {['question', 'discussion'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPostType(type)}
                                style={{
                                    ...styles.typeButton,
                                    background: postType === type ? '#3713ec' : 'rgba(255, 255, 255, 0.05)',
                                    color: postType === type ? '#fff' : '#8b949e'
                                }}
                            >
                                {type === 'question' ? <CheckCircle size={16} /> : <MessageSquare size={16} />}
                                <span style={{ textTransform: 'capitalize' }}>{type}</span>
                            </button>
                        ))}
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.titleInput}
                    />

                    {/* Content */}
                    <textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={styles.contentTextarea}
                        rows={6}
                    />

                    {/* Suggested Tags */}
                    {suggestedTags.length > 0 && (
                        <div style={styles.suggestedTags}>
                            <p style={styles.suggestedLabel}>Suggested tags:</p>
                            <div style={styles.tagList}>
                                {suggestedTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            if (!selectedTags.includes(tag)) {
                                                setSelectedTags([...selectedTags, tag]);
                                            }
                                        }}
                                        style={styles.suggestedTag}
                                    >
                                        <Plus size={12} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                        <div style={styles.selectedTags}>
                            {selectedTags.map(tag => (
                                <div key={tag} style={styles.selectedTag}>
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                                        style={styles.removeTagButton}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title.trim() || !content.trim()}
                        style={{
                            ...styles.submitButton,
                            opacity: (loading || !title.trim() || !content.trim()) ? 0.5 : 1,
                            cursor: (loading || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Utility function
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
}

// Styles
const styles = {
    searchIcon: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.8)',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px'
    },
    searchInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        outline: 'none'
    },
    clearButton: {
        background: 'transparent',
        border: 'none',
        color: '#8b949e',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center'
    },
    filterContainer: {
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    filterTag: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s'
    },
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid transparent'
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px'
    },
    userAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'rgba(55, 19, 236, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3713ec',
        cursor: 'pointer'
    },
    username: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '600',
        color: '#fff',
        cursor: 'pointer'
    },
    timeAgo: {
        margin: 0,
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)'
    },
    cardContent: {
        marginBottom: '12px'
    },
    cardTitle: {
        margin: '0 0 8px 0',
        fontSize: '18px',
        fontWeight: '700',
        color: '#fff',
        lineHeight: '1.4'
    },
    cardDescription: {
        margin: 0,
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: '1.6',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
    },
    stats: {
        display: 'flex',
        gap: '16px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        cursor: 'pointer'
    },
    tags: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    tag: {
        background: 'rgba(55, 19, 236, 0.2)',
        color: '#3713ec',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
    },
    fab: {
        position: 'fixed',
        bottom: '96px',
        right: '16px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#3713ec',
        border: 'none',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(55, 19, 236, 0.4)',
        zIndex: 20
    },
    detailView: {
        minHeight: '100vh',
        background: '#131022',
        paddingBottom: '40px'
    },
    detailHeader: {
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(19, 16, 34, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '8px 0'
    },
    detailPost: {
        padding: '24px 16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    detailTitle: {
        margin: '16px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: '#fff',
        lineHeight: '1.3'
    },
    detailContent: {
        margin: 0,
        fontSize: '15px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.7'
    },
    detailStats: {
        marginTop: '20px',
        display: 'flex',
        gap: '16px'
    },
    statButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer'
    },
    repliesSection: {
        padding: '24px 16px'
    },
    repliesTitle: {
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#fff'
    },
    reply: {
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px'
    },
    replyContent: {
        margin: '12px 0 0 0',
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.6'
    },
    replyInput: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px'
    },
    replyInputField: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        outline: 'none'
    },
    sendButton: {
        background: '#3713ec',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 12px',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    modal: {
        background: '#1a1625',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modalTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#fff'
    },
    closeButton: {
        background: 'transparent',
        border: 'none',
        color: '#8b949e',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center'
    },
    modalContent: {
        padding: '20px'
    },
    typeSelector: {
        display: 'flex',
        gap: '12px',
        marginBottom: '20px'
    },
    typeButton: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    titleInput: {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        outline: 'none',
        marginBottom: '12px'
    },
    contentTextarea: {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: '1.6'
    },
    suggestedTags: {
        marginTop: '16px'
    },
    suggestedLabel: {
        margin: '0 0 8px 0',
        fontSize: '13px',
        color: '#8b949e',
        fontWeight: '500'
    },
    tagList: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    suggestedTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(55, 19, 236, 0.1)',
        border: '1px solid rgba(55, 19, 236, 0.3)',
        borderRadius: '12px',
        padding: '6px 12px',
        color: '#3713ec',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    selectedTags: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '12px'
    },
    selectedTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#3713ec',
        borderRadius: '12px',
        padding: '6px 12px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '500'
    },
    removeTagButton: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
        padding: '0',
        display: 'flex',
        alignItems: 'center'
    },
    submitButton: {
        width: '100%',
        background: '#3713ec',
        border: 'none',
        borderRadius: '8px',
        padding: '14px',
        color: '#fff',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '20px',
        transition: 'all 0.2s'
    }
};