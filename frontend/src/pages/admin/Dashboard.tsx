import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { posts, ideas, threads } from '../../lib/api';
import { AdminLayout } from './AdminLayout';

export function Dashboard() {
    const [stats, setStats] = useState({
        posts: 0,
        drafts: 0,
        ideas: 0,
        threads: 0,
    });
    const [recentPosts, setRecentPosts] = useState<Array<{ _id: string; title: string; slug: string; status: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            posts.list({ limit: 5 }),
            ideas.list(),
            threads.list(),
        ])
            .then(([postsData, ideasData, threadsData]) => {
                const allPosts = postsData.posts;
                setStats({
                    posts: allPosts.filter(p => p.status === 'published').length,
                    drafts: allPosts.filter(p => p.status === 'draft').length,
                    ideas: ideasData.ideas.length,
                    threads: (threadsData.threads as any[]).length,
                });
                setRecentPosts(allPosts.slice(0, 5).map(p => ({
                    _id: p._id,
                    title: p.title,
                    slug: p.slug,
                    status: p.status,
                })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <section className="admin-section">
                <h1 className="admin-title">dashboard</h1>

                {loading ? (
                    <p className="muted">loading...</p>
                ) : (
                    <>
                        <div style={{ marginBottom: 'var(--space-5)' }}>
                            <div className="admin-stat">
                                <div className="admin-stat-value">{stats.posts}</div>
                                <div className="admin-stat-label">published</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-value">{stats.drafts}</div>
                                <div className="admin-stat-label">drafts</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-value">{stats.ideas}</div>
                                <div className="admin-stat-label">ideas</div>
                            </div>
                            <div className="admin-stat">
                                <div className="admin-stat-value">{stats.threads}</div>
                                <div className="admin-stat-label">threads</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <Link to="/admin/posts/new" className="admin-btn admin-btn-primary">
                                + new post
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {recentPosts.length > 0 && (
                <section className="admin-section">
                    <h2 className="admin-title">recent posts</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>title</th>
                                <th>status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map(post => (
                                <tr key={post._id}>
                                    <td>{post.title}</td>
                                    <td className={`status-${post.status}`}>{post.status}</td>
                                    <td>
                                        <Link to={`/admin/posts/${post._id}`} className="link">
                                            edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </AdminLayout>
    );
}
