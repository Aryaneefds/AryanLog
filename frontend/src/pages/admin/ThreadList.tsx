import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { threads as threadsApi } from '../../lib/api';
import type { Thread } from '../../lib/api';
import { AdminLayout } from './AdminLayout';

export function ThreadList() {
    const [allThreads, setAllThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        threadsApi.list()
            .then(data => setAllThreads(data.threads as Thread[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        setMessage(null);

        try {
            const result = await threadsApi.create({
                title: newTitle,
                description: newDescription || undefined,
            });
            setAllThreads(prev => [...prev, result.thread]);
            setNewTitle('');
            setNewDescription('');
            setMessage({ type: 'success', text: 'created' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'create failed' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this thread?')) return;

        try {
            await threadsApi.delete(id);
            setAllThreads(prev => prev.filter(t => t._id !== id));
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'delete failed' });
        }
    };

    return (
        <AdminLayout>
            <section className="admin-section">
                <h1 className="admin-title">threads</h1>

                {message && (
                    <div className={`admin-message admin-message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreate} style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="admin-input"
                            placeholder="thread title"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="admin-btn admin-btn-primary" disabled={creating}>
                            {creating ? '...' : 'add'}
                        </button>
                    </div>
                    <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="admin-input"
                        placeholder="description (optional)"
                    />
                </form>

                {loading ? (
                    <p className="muted">loading...</p>
                ) : allThreads.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>title</th>
                                <th>status</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allThreads.map(thread => (
                                <tr key={thread._id}>
                                    <td>
                                        {thread.title}
                                        {thread.description && (
                                            <span className="muted" style={{ marginLeft: 'var(--space-2)' }}>
                                                — {thread.description}
                                            </span>
                                        )}
                                    </td>
                                    <td className={`status-${thread.status}`}>{thread.status}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(thread._id)}
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
                    <p className="muted">no threads</p>
                )}
            </section>
        </AdminLayout>
    );
}
