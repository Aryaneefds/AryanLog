import { Link } from 'react-router-dom';
import type { ThreadSummary } from '../../lib/api';

interface PostThreadsProps {
    threads: ThreadSummary[];
}

export function PostThreads({ threads }: PostThreadsProps) {
    if (threads.length === 0) return null;

    return (
        <section className="mt-8 p-6 bg-bg-subtle rounded-lg">
            <h3 className="font-sans text-sm font-semibold text-text-muted mb-3">
                Part of Thought Threads
            </h3>
            <ul className="space-y-2">
                {threads.map((thread) => (
                    <li key={thread.slug}>
                        <Link
                            to={`/threads/${thread.slug}`}
                            className="font-sans text-accent hover:underline"
                        >
                            {thread.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
