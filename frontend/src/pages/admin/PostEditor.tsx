import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { posts, ideas as ideasApi } from '../../lib/api';
import type { Idea } from '../../lib/api';
import { AdminLayout } from './AdminLayout';
import { RichEditor } from '../../components/editor';
import '../../styles/editor.css';

export function PostEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
    const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [postId, setPostId] = useState<string | null>(isNew ? null : id || null);

    // Load ideas
    useEffect(() => {
        ideasApi.list()
            .then(data => setAllIdeas(data.ideas))
            .catch(console.error);
    }, []);

    // Load post if editing
    useEffect(() => {
        if (isNew || !id) return;

        posts.list({ limit: 100 })
            .then(data => {
                const post = data.posts.find(p => p._id === id);
                if (post) {
                    setTitle(post.title);
                    setContent(post.content);
                    setSubtitle(post.subtitle || '');
                    setSelectedIdeas(post.ideas.map(i => i._id));
                    setStatus(post.status === 'published' ? 'published' : 'draft');
                    setPostId(post._id);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, isNew]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [title, content, subtitle, selectedIdeas, postId]);

    const handleSave = async () => {
        if (!title.trim()) {
            setMessage({ type: 'error', text: 'title required' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            if (!postId) {
                const result = await posts.create({
                    title,
                    content,
                    subtitle: subtitle || undefined,
                    ideas: selectedIdeas,
                });
                setPostId(result.post._id);
                setMessage({ type: 'success', text: 'created' });
                navigate(`/admin/posts/${result.post._id}`, { replace: true });
            } else {
                await posts.update(postId, {
                    title,
                    content,
                    subtitle: subtitle || undefined,
                    ideas: selectedIdeas,
                });
                setMessage({ type: 'success', text: 'saved' });
            }
            setLastSaved(new Date());
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'save failed' });
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!postId) {
            setMessage({ type: 'error', text: 'save first' });
            return;
        }

        setSaving(true);
        try {
            await posts.publish(postId);
            setStatus('published');
            setMessage({ type: 'success', text: 'published' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'publish failed' });
        } finally {
            setSaving(false);
        }
    };

    const toggleIdea = (ideaId: string) => {
        setSelectedIdeas(prev =>
            prev.includes(ideaId)
                ? prev.filter(id => id !== ideaId)
                : [...prev, ideaId]
        );
    };

    if (loading) {
        return (
            <AdminLayout>
                <p className="muted">loading...</p>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <section className="admin-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <h1 className="admin-title" style={{ margin: 0 }}>
                        {isNew ? 'new post' : 'editing'}
                        {status === 'published' && <span className="status-published" style={{ marginLeft: 'var(--space-2)' }}>published</span>}
                    </h1>
                    {lastSaved && (
                        <span className="muted" style={{ fontSize: 'var(--text-xs)' }}>
                            saved {lastSaved.toLocaleTimeString()}
                        </span>
                    )}
                </div>

                {message && (
                    <div className={`admin-message admin-message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="admin-field">
                    <label className="admin-label">title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="admin-input"
                        placeholder="Untitled"
                        style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-prose)' }}
                    />
                </div>

                <div className="admin-field">
                    <label className="admin-label">subtitle (optional)</label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="admin-input"
                        placeholder="A brief description"
                    />
                </div>

                <div className="admin-field">
                    <label className="admin-label">concepts</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                        {allIdeas.map(idea => (
                            <button
                                key={idea._id}
                                onClick={() => toggleIdea(idea._id)}
                                className="admin-btn"
                                type="button"
                                style={{
                                    padding: 'var(--space-1) var(--space-2)',
                                    fontSize: 'var(--text-xs)',
                                    background: selectedIdeas.includes(idea._id) ? 'var(--color-accent)' : 'transparent',
                                    borderColor: selectedIdeas.includes(idea._id) ? 'var(--color-accent)' : 'var(--color-border)',
                                    color: selectedIdeas.includes(idea._id) ? '#fff' : 'var(--color-text)',
                                }}
                            >
                                {idea.name}
                            </button>
                        ))}
                        <Link
                            to="/admin/ideas"
                            className="admin-btn"
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)' }}
                        >
                            + manage
                        </Link>
                    </div>
                </div>

                <div className="admin-field">
                    <label className="admin-label">content</label>
                    <RichEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Start writing..."
                    />
                </div>

                <div className="admin-actions">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="admin-btn admin-btn-primary"
                        type="button"
                    >
                        {saving ? '...' : 'save'} (⌘S)
                    </button>

                    {postId && status === 'draft' && (
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="admin-btn"
                            type="button"
                        >
                            publish
                        </button>
                    )}

                    {postId && (
                        <Link to={`/posts/${title.toLowerCase().replace(/\s+/g, '-')}`} className="admin-btn" style={{ marginLeft: 'auto' }}>
                            preview →
                        </Link>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}
