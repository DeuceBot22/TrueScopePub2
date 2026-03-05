import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useStore, Claim, Entity } from '@/lib/store';
import { useTheme } from 'next-themes';
import { forceRadial } from 'd3-force';

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
    graphLayout
  } = useStore();

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
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

  // Filter logic
  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      // Filter by Type
      if (!activeClaimTypes.has(claim.type)) return false;
      
      // Filter by Confidence
      if (claim.confidenceScore < minConfidenceScore) return false;
      
      // Filter by Time
      // For simplicity in V0, we check if the claim's creation date or valid dates overlap with the window.
      // If the claim has no dates, we might assume it's valid, but let's use createdAt for the demo if dates are missing.
      const claimDate = claim.dateStart ? new Date(claim.dateStart).getTime() : claim.createdAt;
      if (timeWindowStart && claimDate < timeWindowStart) return false;
      if (timeWindowEnd && claimDate > timeWindowEnd) return false;

      // Filter by Mode
      if (viewMode === 'Verification') {
        if (!claim.humanReviewed || claim.evidenceIds.length === 0) return false;
      } else if (viewMode === 'Disputed') {
        if (!claim.disputed) return false;
      }
      
      return true;
    });
  }, [claims, activeClaimTypes, minConfidenceScore, timeWindowStart, timeWindowEnd, viewMode]);

  const graphData = useMemo(() => {
    const nodesMap = new Map<string, any>();
    const links: any[] = [];

    // Add nodes based on filtered claims (Focus + Context approach: only show connected nodes, or selected)
    // For V0 without a specific "start empty" UI, we'll show entities that have filtered claims, plus the selected node.
    const relevantEntityIds = new Set<string>();
    if (selectedNodeId) relevantEntityIds.add(selectedNodeId);

    filteredClaims.forEach(claim => {
      relevantEntityIds.add(claim.sourceId);
      relevantEntityIds.add(claim.targetId);
      
      links.push({
        id: claim.id,
        source: claim.sourceId,
        target: claim.targetId,
        type: claim.type,
        claim: claim
      });
    });

    entities.forEach(entity => {
      if (relevantEntityIds.has(entity.id)) {
        nodesMap.set(entity.id, {
          id: entity.id,
          name: entity.name,
          type: entity.type,
          val: entity.id === selectedNodeId ? 2 : 1,
          entity: entity
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  }, [entities, filteredClaims, selectedNodeId]);

  // Apply Layout
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;

    if (graphLayout === 'Radial' && selectedNodeId) {
      fg.d3Force('charge')?.strength(-500);
      // Custom radial layout logic would go here, for now we just tweak forces
      fg.d3Force('radial', forceRadial(150, dimensions.width/2, dimensions.height/2).strength((d: any) => d.id === selectedNodeId ? 1 : 0.1));
    } else {
      fg.d3Force('charge')?.strength(-200);
      fg.d3Force('radial', null); // Remove radial force
    }
    // Re-heat simulation
    fg.d3ReheatSimulation();
  }, [graphLayout, selectedNodeId, dimensions]);


  const getClaimColor = (type: string) => {
    const rootStyle = getComputedStyle(document.documentElement);
    const hsl = rootStyle.getPropertyValue(`--claim-${type}`).trim();
    if (hsl) {
      // H S% L% format
      const [h, s, l] = hsl.split(' ');
      return `hsl(${h}, ${s}, ${l})`;
    }
    return '#888';
  };

  const handleNodeClick = useCallback((node: any) => {
    selectNode(node.id);
  }, [selectNode]);

  const handleLinkClick = useCallback((link: any) => {
    selectClaim(link.id);
  }, [selectClaim]);

  return (
    <div ref={containerRef} className="w-full h-full bg-background relative overflow-hidden" data-testid="container-graph">
      {graphData.nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <p>No data matches the current filters. Adjust the timeline or select a node to explore.</p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor={n => n.id === selectedNodeId ? '#fff' : '#888'}
          nodeRelSize={6}
          linkColor={l => getClaimColor(l.type)}
          linkWidth={l => l.id === useStore.getState().selectedClaimId ? 4 : 1.5}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          backgroundColor={theme === 'light' ? '#ffffff' : '#111827'} // fallback
          // Minimal UI aesthetics
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Inter`;
            
            const isSelected = node.id === selectedNodeId;
            const r = isSelected ? 8 : 4;
            
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
    </div>
  );
}
