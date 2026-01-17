import { ThreadNode } from './ThreadNode';
import type { ThreadNode as IThreadNode } from '../../lib/api';

interface ThreadTimelineProps {
    nodes: IThreadNode[];
    currentSlug?: string;
}

export function ThreadTimeline({ nodes, currentSlug }: ThreadTimelineProps) {
    // Separate main trunk from branches
    const mainNodes = nodes.filter(n => n.branchFrom === null);
    const branchNodes = nodes.filter(n => n.branchFrom !== null);

    // Group branches by their parent
    const branchMap = new Map<number, IThreadNode[]>();
    branchNodes.forEach(node => {
        const parent = node.branchFrom!;
        if (!branchMap.has(parent)) {
            branchMap.set(parent, []);
        }
        branchMap.get(parent)!.push(node);
    });

    return (
        <div className="relative pl-8">
            {/* Vertical line */}
            <div
                className="absolute left-3 top-0 bottom-0 w-px bg-border"
                aria-hidden="true"
            />

            <ol className="space-y-8">
                {mainNodes.map((node) => (
                    <li key={node.order} className="relative">
                        {/* Node dot */}
                        <div
                            className={`
                absolute -left-5 top-4 w-4 h-4 rounded-full border-2
                ${node.status === 'foundational'
                                    ? 'bg-green-500 border-green-500'
                                    : node.status === 'active'
                                        ? 'bg-accent border-accent'
                                        : 'bg-bg border-border'}
              `}
                        />

                        <ThreadNode
                            node={node}
                            isCurrent={node.post?.slug === currentSlug}
                        />

                        {/* Render branches from this node */}
                        {branchMap.has(node.order) && (
                            <div className="mt-4 ml-8 pl-6 border-l border-dashed border-border">
                                <div className="space-y-4">
                                    {branchMap.get(node.order)!.map(branch => (
                                        <ThreadNode
                                            key={branch.order}
                                            node={branch}
                                            isCurrent={branch.post?.slug === currentSlug}
                                            isBranch
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}
