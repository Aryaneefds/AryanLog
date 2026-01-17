import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import type { GraphNode, GraphEdge } from '../../lib/api';

interface IdeaGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

interface SimNode extends d3.SimulationNodeDatum, GraphNode {
    x?: number;
    y?: number;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
    source: SimNode | string;
    target: SimNode | string;
    weight: number;
}

export function IdeaGraph({ nodes, edges }: IdeaGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const navigate = useNavigate();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Handle resize
    const updateDimensions = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDimensions({
                width: rect.width,
                height: Math.max(400, Math.min(600, window.innerHeight * 0.6))
            });
        }
    }, []);

    useEffect(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    useEffect(() => {
        if (!svgRef.current || nodes.length === 0 || dimensions.width === 0) return;

        const { width, height } = dimensions;
        const svg = d3.select(svgRef.current);

        svg.selectAll('*').remove();

        const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
        const simEdges: SimEdge[] = edges.map(e => ({
            source: e.source,
            target: e.target,
            weight: e.weight,
        }));

        // Adjust force strength based on screen size
        const isMobile = width < 640;
        const chargeStrength = isMobile ? -100 : -200;
        const linkDistance = isMobile ? 60 : 100;

        const simulation = d3.forceSimulation(simNodes)
            .force('link', d3.forceLink<SimNode, SimEdge>(simEdges)
                .id(d => d.id)
                .distance(linkDistance)
                .strength(d => d.weight * 0.1))
            .force('charge', d3.forceManyBody().strength(chargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(isMobile ? 20 : 30));

        // Container for zoom
        const g = svg.append('g');

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Draw edges
        const link = g.append('g')
            .selectAll('line')
            .data(simEdges)
            .join('line')
            .attr('stroke', 'var(--color-border)')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.weight));

        // Draw nodes
        const node = g.append('g')
            .selectAll<SVGGElement, SimNode>('g')
            .data(simNodes)
            .join('g')
            .attr('cursor', 'pointer')
            .call(d3.drag<SVGGElement, SimNode>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Node circles
        node.append('circle')
            .attr('r', d => Math.sqrt(d.postCount) * (isMobile ? 4 : 5) + (isMobile ? 6 : 8))
            .attr('fill', 'var(--color-bg-subtle)')
            .attr('stroke', 'var(--color-accent)')
            .attr('stroke-width', 2)
            .style('transition', 'all 200ms ease');

        // Node labels
        node.append('text')
            .text(d => d.name.length > 12 ? d.name.slice(0, 10) + '...' : d.name)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'var(--color-text)')
            .attr('font-size', isMobile ? '10px' : '12px')
            .attr('font-family', 'var(--font-sans)')
            .attr('pointer-events', 'none');

        // Hover effects
        node.on('mouseenter', function (_, d) {
            d3.select(this).select('circle')
                .attr('stroke-width', 3)
                .attr('fill', 'var(--color-accent)')
                .attr('fill-opacity', '0.1');

            d3.select(this).select('text')
                .attr('font-weight', 'bold');

            setSelectedNode(d.id);

            // Highlight connected edges
            link.attr('stroke-opacity', l =>
                (l.source as SimNode).id === d.id || (l.target as SimNode).id === d.id
                    ? 1 : 0.2
            );
        })
            .on('mouseleave', function () {
                d3.select(this).select('circle')
                    .attr('stroke-width', 2)
                    .attr('fill', 'var(--color-bg-subtle)');

                d3.select(this).select('text')
                    .attr('font-weight', 'normal');

                setSelectedNode(null);
                link.attr('stroke-opacity', 0.6);
            });

        // Click handler
        node.on('click', (_, d) => {
            navigate(`/ideas/${d.id}`);
        });

        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as SimNode).x!)
                .attr('y1', d => (d.source as SimNode).y!)
                .attr('x2', d => (d.target as SimNode).x!)
                .attr('y2', d => (d.target as SimNode).y!);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [nodes, edges, navigate, dimensions]);

    return (
        <div ref={containerRef} className="relative">
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full bg-bg-subtle"
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 text-xs text-text-muted bg-bg/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                <p className="mb-1">Click to explore • Drag to rearrange</p>
                <p className="hidden sm:block">Scroll to zoom • Circle size = post count</p>
            </div>

            {/* Selected node info */}
            {selectedNode && (
                <div className="absolute top-4 right-4 text-sm bg-bg/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-border">
                    <p className="font-medium">{selectedNode}</p>
                    <p className="text-text-muted text-xs mt-1">
                        {nodes.find(n => n.id === selectedNode)?.postCount || 0} posts
                    </p>
                </div>
            )}
        </div>
    );
}
