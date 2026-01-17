import { Link } from 'react-router-dom';
import type { ThreadNode as IThreadNode } from '../../lib/api';

interface ThreadNodeProps {
    node: IThreadNode;
    isCurrent?: boolean;
    isBranch?: boolean;
}

export function ThreadNode({ node, isCurrent, isBranch }: ThreadNodeProps) {
    if (!node.post) return null;

    const statusClasses = {
        foundational: 'border-green-500',
        active: 'border-accent bg-accent/5',
        superseded: 'border-text-faint opacity-60',
        tangent: 'border-amber-500',
    };

    const statusLabels = {
        foundational: 'Foundational',
        active: 'Active',
        superseded: 'Superseded',
        tangent: 'Tangent',
    };

    return (
        <div
            className={`
        p-4 rounded-lg border-l-4 bg-bg-subtle
        ${statusClasses[node.status]}
        ${isCurrent ? 'ring-2 ring-accent' : ''}
        ${isBranch ? 'ml-4' : ''}
      `}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Link
                        to={`/posts/${node.post.slug}`}
                        className="font-sans font-semibold hover:text-accent transition-colors"
                    >
                        {node.post.title}
                    </Link>
                    <div className="mt-1 text-sm text-text-muted font-mono">
                        {node.post.publishedAt
                            ? new Date(node.post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                            })
                            : 'Draft'}{' '}
                        · {node.post.readingTime} min
                    </div>
                    <p className="mt-3 text-sm text-text-muted italic">
                        "{node.annotation}"
                    </p>
                </div>
                <span
                    className={`
            text-xs font-mono uppercase tracking-wide px-2 py-1 rounded
            ${node.status === 'foundational' ? 'bg-green-500/10 text-green-500' : ''}
            ${node.status === 'active' ? 'bg-accent/10 text-accent' : ''}
            ${node.status === 'superseded' ? 'bg-text-faint/10 text-text-faint' : ''}
            ${node.status === 'tangent' ? 'bg-amber-500/10 text-amber-500' : ''}
          `}
                >
                    {statusLabels[node.status]}
                </span>
            </div>
        </div>
    );
}
