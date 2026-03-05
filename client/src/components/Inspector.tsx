import React from 'react';
import { useStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Image as ImageIcon, Link2, AlertTriangle, CheckCircle2, Maximize2, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function Inspector() {
  const { 
    selectedNodeId, 
    selectedClaimId, 
    selectedEventId,
    entities,
    claims,
    events,
    evidence,
    toggleNodePin
  } = useStore();

  const getEvidenceById = (id: string) => evidence.find(e => e.id === id);

  if (!selectedNodeId && !selectedClaimId && !selectedEventId) {
    return (
      <div className="glass-panel w-full md:w-80 h-full p-6 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground" data-testid="panel-inspector-empty">
        <AlertTriangle className="w-8 h-8 opacity-20" />
        <p className="text-sm">Select a node, relationship, or event to view details.</p>
      </div>
    );
  }

  const renderEntity = () => {
    const entity = entities.find(e => e.id === selectedNodeId);
    if (!entity) return null;

    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" data-testid={`inspector-entity-${entity.id}`}>
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{entity.type}</div>
          <h2 className="text-xl font-semibold mt-1">{entity.name}</h2>
        </div>
        
        <div className="flex gap-2 mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => toggleNodePin(entity.id)} data-testid={`button-pin-${entity.id}`}>
                {entity.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{entity.pinned ? 'Unpin Node' : 'Pin Node'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" data-testid={`button-expand-${entity.id}`}>
                <Maximize2 className="w-4 h-4 mr-2" /> Expand
              </Button>
            </TooltipTrigger>
            <TooltipContent>Load 1-hop neighbors</TooltipContent>
          </Tooltip>
        </div>

        {entity.tags && entity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entity.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-mono rounded-sm">#{tag}</Badge>
            ))}
          </div>
        )}

        <Separator />

        {entity.notes && (
          <div>
            <div className="text-xs font-semibold mb-1 text-muted-foreground">Notes</div>
            <p className="text-sm">{entity.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderClaim = () => {
    const claim = claims.find(c => c.id === selectedClaimId);
    if (!claim) return null;

    const source = entities.find(e => e.id === claim.sourceId);
    const target = entities.find(e => e.id === claim.targetId);

    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" data-testid={`inspector-claim-${claim.id}`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] tracking-wider">{claim.type}</Badge>
            {claim.disputed && <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">Disputed</Badge>}
            {claim.humanReviewed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <h2 className="text-lg font-medium">{claim.statement}</h2>
        </div>

        <div className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Source</span>
            <span className="font-medium">{source?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Target</span>
            <span className="font-medium">{target?.name}</span>
          </div>
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest">Evidence ({claim.evidenceIds.length})</div>
          {claim.evidenceIds.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No evidence linked.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {claim.evidenceIds.map(id => {
                const ev = getEvidenceById(id);
                if (!ev) return null;
                return (
                  <div key={id} className="flex items-start gap-3 p-2 rounded-md bg-background/50 border border-border/50">
                    {ev.type === 'pdf' ? <FileText className="w-4 h-4 mt-0.5 text-blue-400" /> : <ImageIcon className="w-4 h-4 mt-0.5 text-purple-400" />}
                    <div>
                      <div className="text-sm font-medium">{ev.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Reliability: {ev.reliabilityScore}/5</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEvent = () => {
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return null;

    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" data-testid={`inspector-event-${event.id}`}>
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Event • {event.dateStart}</div>
          <h2 className="text-xl font-semibold mt-1">{event.title}</h2>
        </div>
        
        {event.notes && (
          <div className="bg-secondary/30 p-3 rounded-md text-sm border border-border/50">
            {event.notes}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel w-full md:w-80 h-full flex flex-col md:border-l border-t md:border-t-0 border-b-0 border-r-0 md:rounded-none shadow-2xl" data-testid="panel-inspector">
      <div className="p-4 border-b border-border/50 bg-card/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Inspector</h3>
      </div>
      <ScrollArea className="flex-1 p-6">
        {selectedNodeId && renderEntity()}
        {selectedClaimId && renderClaim()}
        {selectedEventId && renderEvent()}
      </ScrollArea>
    </div>
  );
}
