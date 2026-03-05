import React, { useMemo } from 'react';
import { useStore, ClaimType } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Legend() {
  const { claims, activeClaimTypes, toggleClaimTypeFilter, viewMode, timeWindowStart, timeWindowEnd, minConfidenceScore } = useStore();

  const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      if (claim.confidenceScore < minConfidenceScore) return false;
      
      const claimDate = claim.dateStart ? new Date(claim.dateStart).getTime() : claim.createdAt;
      if (timeWindowStart && claimDate < timeWindowStart) return false;
      if (timeWindowEnd && claimDate > timeWindowEnd) return false;

      if (viewMode === 'Verification') {
        if (!claim.humanReviewed || claim.evidenceIds.length === 0) return false;
      } else if (viewMode === 'Disputed') {
        if (!claim.disputed) return false;
      }
      
      return true;
    });
  }, [claims, minConfidenceScore, timeWindowStart, timeWindowEnd, viewMode]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClaims.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return counts;
  }, [filteredClaims]);

  const allTypes: ClaimType[] = ['funding', 'affiliation', 'communication', 'family', 'conflict', 'influence', 'ownership', 'legal', 'other'];

  const getClaimColorVar = (type: string) => `hsl(var(--claim-${type}))`;

  return (
    <div className="glass-panel p-4 rounded-lg w-64 flex flex-col gap-3" data-testid="panel-legend">
      <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Relationship Types</h3>
      <ScrollArea className="h-full max-h-[300px] pr-4">
        <div className="flex flex-col gap-2">
          {allTypes.map(type => {
            const count = typeCounts[type] || 0;
            const isActive = activeClaimTypes.has(type);
            
            return (
              <button
                key={type}
                onClick={() => toggleClaimTypeFilter(type)}
                className={`flex items-center justify-between text-xs py-1 px-2 rounded-md transition-all ${isActive ? 'bg-secondary/50' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                data-testid={`button-filter-${type}`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getClaimColorVar(type) }}
                  />
                  <span className="capitalize">{type}</span>
                </div>
                <span className="font-mono bg-background/50 px-1.5 py-0.5 rounded text-[10px]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
