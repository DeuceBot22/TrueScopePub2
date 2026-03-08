import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { forceRadial } from 'd3-force';
import { Pin, PinOff, Eye, Link2, CalendarDays, Paperclip } from 'lucide-react';

type GraphNode = {
  id: string;
  name: string;
  type: string;
  val: number;
  entity: any;
};

type GraphLink = {
  id: string;
  source: string;
  target: string;
  type: string;
  claim: any;
  curvature: number;
};

type ContextMenuState = {
  x: number;
  y: number;
  nodeId: string;
} | null;

function getPairKey(a: string, b: string) {
  return [a, b].sort().join('::');
}

function getCurvatureForIndex(index: number, total: number) {
  if (total <= 1) return 0;

  const midpoint = (total - 1) / 2;
  const distanceFromCenter = index - midpoint;

  if (total % 2 === 1 && index === midpoint) return 0;

  return distanceFromCenter * 0.22;
}

export function GraphView() {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const { theme } = useTheme();

  const {
    entities,
    claims,
    viewMode,
    timeWindowStart,
    timeWindowEnd,
    activeClaimTypes,
    minConfidenceScore,
    selectedNodeId,
    selectNode,
    selectClaim,
    graphLayout,
    toggleNodePin,
  } = useStore();

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (entries[0] && entries[0].contentRect) {
          setDimensions({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height
          });
        }
      });
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('contextmenu', closeMenu);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('contextmenu', closeMenu);
    };
  }, []);

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      if (!activeClaimTypes.has(claim.type)) return false;
      if (claim.confidenceScore < minConfidenceScore) return false;

      const claimDate = claim.dateStart
        ? new Date(claim.dateStart).getTime()
        : claim.createdAt;

      if (timeWindowStart && claimDate < timeWindowStart) return false;
      if (timeWindowEnd && claimDate > timeWindowEnd) return false;

      if (viewMode === 'Verification') {
        if (!claim.humanReviewed || claim.evidenceIds.length === 0) return false;
      } else if (viewMode === 'Disputed') {
        if (!claim.disputed) return false;
      }

      return true;
    });
  }, [
    claims,
    activeClaimTypes,
    minConfidenceScore,
    timeWindowStart,
    timeWindowEnd,
    viewMode
  ]);

  const graphData = useMemo(() => {
    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    const hasVisibleClaims = filteredClaims.length > 0;

    if (hasVisibleClaims) {
      const relevantEntityIds = new Set<string>();
      if (selectedNodeId) relevantEntityIds.add(selectedNodeId);

      const groupedClaims = new Map<string, typeof filteredClaims>();

      filteredClaims.forEach(claim => {
        relevantEntityIds.add(claim.sourceId);
        relevantEntityIds.add(claim.targetId);

        const key = getPairKey(claim.sourceId, claim.targetId);
        const existing = groupedClaims.get(key) ?? [];
        existing.push(claim);
        groupedClaims.set(key, existing);
      });

      groupedClaims.forEach(group => {
        group.forEach((claim, index) => {
          links.push({
            id: claim.id,
            source: claim.sourceId,
            target: claim.targetId,
            type: claim.type,
            claim,
            curvature: getCurvatureForIndex(index, group.length),
          });
        });
      });

      entities.forEach(entity => {
        if (relevantEntityIds.has(entity.id)) {
          nodesMap.set(entity.id, {
            id: entity.id,
            name: entity.name,
            type: entity.type,
            val: entity.id === selectedNodeId ? 2 : 1,
            entity
          });
        }
      });
    } else {
      entities.forEach(entity => {
        nodesMap.set(entity.id, {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          val: entity.id === selectedNodeId ? 2 : 1,
          entity
        });
      });
    }

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }, [entities, filteredClaims, selectedNodeId]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    if (graphLayout === 'Radial' && selectedNodeId) {
      fg.d3Force('charge')?.strength(-500);
      fg.d3Force(
        'radial',
        forceRadial(150, dimensions.width / 2, dimensions.height / 2).strength(
          (d: any) => (d.id === selectedNodeId ? 1 : 0.1)
        )
      );
    } else {
      fg.d3Force('charge')?.strength(-200);
      fg.d3Force('radial', null);
    }

    fg.d3ReheatSimulation();
  }, [graphLayout, selectedNodeId, dimensions]);

  const getClaimColor = (type: string) => {
    const rootStyle = getComputedStyle(document.documentElement);
    const hsl = rootStyle.getPropertyValue(`--claim-${type}`).trim();

    if (hsl) {
      const [h, s, l] = hsl.split(' ');
      return `hsl(${h}, ${s}, ${l})`;
    }

    return '#888';
  };

  const handleNodeClick = useCallback((node: any) => {
    setContextMenu(null);
    selectNode(node.id);
  }, [selectNode]);

  const handleLinkClick = useCallback((link: any) => {
    setContextMenu(null);
    selectClaim(link.id);
  }, [selectClaim]);

  const handleNodeRightClick = useCallback((node: any, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    selectNode(node.id);

    const containerRect = containerRef.current?.getBoundingClientRect();
    const left = containerRect ? event.clientX - containerRect.left : event.clientX;
    const top = containerRect ? event.clientY - containerRect.top : event.clientY;

    setContextMenu({
      x: left,
      y: top,
      nodeId: node.id,
    });
  }, [selectNode]);

  const contextEntity = contextMenu
    ? entities.find((e) => e.id === contextMenu.nodeId)
    : null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-background relative overflow-hidden"
      data-testid="container-graph"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement)?.tagName !== 'CANVAS') return;
        e.preventDefault();
      }}
    >
      {graphData.nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>No data matches the current filters. Adjust the timeline or add entities.</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(n: any) => (n.id === selectedNodeId ? '#fff' : '#888')}
          nodeRelSize={6}
          linkColor={(l: any) => getClaimColor(l.type)}
          linkWidth={(l: any) => (l.id === useStore.getState().selectedClaimId ? 4 : 1.5)}
          linkCurvature={(l: any) => l.curvature ?? 0}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={(l: any) => (l.curvature === 0 ? 1 : 0.92)}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
          onLinkClick={handleLinkClick}
          backgroundColor={theme === 'light' ? '#ffffff' : '#111827'}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter`;

            const isSelected = node.id === selectedNodeId;
            const r = isSelected ? 8 : 5;

            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = isSelected ? '#ffffff' : '#64748b';
            ctx.fill();

            if (isSelected) {
              ctx.lineWidth = 2 / globalScale;
              ctx.strokeStyle = '#3b82f6';
              ctx.stroke();
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
            ctx.fillText(label, node.x, node.y + r + fontSize);
          }}
        />
      )}

      {contextMenu && contextEntity ? (
        <div
          className="absolute z-30 min-w-56 rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-xl backdrop-blur-md"
          style={{
            left: Math.min(contextMenu.x, dimensions.width - 240),
            top: Math.min(contextMenu.y, dimensions.height - 220),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-border/50">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              {contextEntity.type}
            </div>
            <div className="font-medium text-sm mt-1">{contextEntity.name}</div>
          </div>

          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => {
              selectNode(contextEntity.id);
              setContextMenu(null);
            }}
          >
            <Eye className="w-4 h-4" />
            Inspect Entity
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => {
              toggleNodePin(contextEntity.id);
              setContextMenu(null);
            }}
          >
            {contextEntity.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            {contextEntity.pinned ? 'Unpin Node' : 'Pin Node'}
          </button>

          <div className="h-px bg-border/50 my-1" />

          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setContextMenu(null)}
          >
            <Link2 className="w-4 h-4" />
            Add Relationship
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setContextMenu(null)}
          >
            <CalendarDays className="w-4 h-4" />
            Add Event
          </button>

          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => setContextMenu(null)}
          >
            <Paperclip className="w-4 h-4" />
            Attach Evidence
          </button>
        </div>
      ) : null}
    </div>
  );
}
