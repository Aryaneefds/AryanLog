import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ideas as ideasApi } from '../../lib/api';
import type { Idea } from '../../lib/api';
import { AdminLayout } from './AdminLayout';

export function IdeaList() {
    const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        ideasApi.list()
            .then(data => setAllIdeas(data.ideas))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        setMessage(null);

        try {
            const result = await ideasApi.create({
                name: newName,
                description: newDescription || undefined,
            });
            setAllIdeas(prev => [...prev, result.idea]);
            setNewName('');
            setNewDescription('');
            setMessage({ type: 'success', text: 'created' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'create failed' });
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this idea?')) return;

        try {
            await ideasApi.delete(id);
            setAllIdeas(prev => prev.filter(i => i._id !== id));
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'delete failed' });
        }
    };

    return (
        <AdminLayout>
            <section className="admin-section">
                <h1 className="admin-title">ideas</h1>

                {message && (
                    <div className={`admin-message admin-message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleCreate} style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="admin-input"
                            placeholder="idea name"
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
                ) : allIdeas.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>name</th>
                                <th>posts</th>
                                <th>actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allIdeas.map(idea => (
                                <tr key={idea._id}>
                                    <td>
                                        {idea.name}
                                        {idea.description && (
                                            <span className="muted" style={{ marginLeft: 'var(--space-2)' }}>
                                                — {idea.description}
                                            </span>
                                        )}
                                    </td>
                                    <td>{idea.postCount}</td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(idea._id)}
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
                    <p className="muted">no ideas</p>
                )}
            </section>
        </AdminLayout>
    );
}
