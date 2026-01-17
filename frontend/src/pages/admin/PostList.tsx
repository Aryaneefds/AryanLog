import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { posts } from '../../lib/api';
import type { Post } from '../../lib/api';
import { AdminLayout } from './AdminLayout';

export function PostList() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');

    useEffect(() => {
        posts.list({ limit: 100 })
            .then(data => setAllPosts(data.posts))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredPosts = filter === 'all'
        ? allPosts
        : allPosts.filter(p => p.status === filter);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this post?')) return;
        try {
            await posts.delete(id);
            setAllPosts(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    return (
        <AdminLayout>
            <section className="admin-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h1 className="admin-title" style={{ margin: 0 }}>posts</h1>
                    <Link to="/admin/posts/new" className="admin-btn admin-btn-primary">
                        + new post
                    </Link>
                </div>

                <div style={{ marginBottom: 'var(--space-3)' }}>
                    {(['all', 'draft', 'published', 'archived'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className="admin-btn"
                            style={{
                                marginRight: 'var(--space-1)',
                                background: filter === status ? 'var(--color-text)' : 'transparent',
                                color: filter === status ? 'var(--color-bg)' : 'var(--color-text)',
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="muted">loading...</p>
                ) : filteredPosts.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>title</th>
                                <th>status</th>
                                <th>date</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(post => (
                                <tr key={post._id}>
                                    <td>{post.title}</td>
                                    <td className={`status-${post.status}`}>{post.status}</td>
                                    <td className="muted">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString()
                                            : '—'
                                        }
                                    </td>
                                    <td>
                                        <Link to={`/admin/posts/${post._id}`} className="link" style={{ marginRight: 'var(--space-2)' }}>
                                            edit
                                        </Link>
                                        <Link to={`/posts/${post.slug}`} className="link muted" style={{ marginRight: 'var(--space-2)' }}>
                                            view
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="link"
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="muted">no posts</p>
                )}
            </section>
        </AdminLayout>
    );
}
