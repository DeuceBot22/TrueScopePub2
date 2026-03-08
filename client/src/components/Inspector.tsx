import React from 'react';
import { useStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Pin,
  PinOff,
  CalendarDays,
  Network,
  Link2,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type EntityOverride = {
  name: string;
  tags: string[];
  notes: string;
};

export function Inspector() {
  const [editMode, setEditMode] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editTags, setEditTags] = React.useState('');
  const [editNotes, setEditNotes] = React.useState('');
  const [entityOverrides, setEntityOverrides] = React.useState<Record<string, EntityOverride>>({});

  const {
    selectedNodeId,
    selectedClaimId,
    selectedEventId,
    entities,
    claims,
    events,
    evidence,
    toggleNodePin,
    selectNode,
    selectClaim,
    selectEvent,
  } = useStore();

  const getEvidenceById = (id: string) => evidence.find((e) => e.id === id);

  const selectedEntity = selectedNodeId
    ? entities.find((e) => e.id === selectedNodeId)
    : null;

  const selectedEntityView = selectedEntity
    ? (() => {
        const override = entityOverrides[selectedEntity.id];
        if (!override) return selectedEntity;
        return {
          ...selectedEntity,
          name: override.name,
          tags: override.tags,
          notes: override.notes,
        };
      })()
    : null;

  React.useEffect(() => {
    if (!selectedEntity) {
      setEditMode(false);
      setEditName('');
      setEditTags('');
      setEditNotes('');
      return;
    }

    const override = entityOverrides[selectedEntity.id];
    const entityForEdit = override
      ? {
          ...selectedEntity,
          name: override.name,
          tags: override.tags,
          notes: override.notes,
        }
      : selectedEntity;

    setEditName(entityForEdit.name || '');
    setEditTags((entityForEdit.tags || []).join(', '));
    setEditNotes(entityForEdit.notes || '');
    setEditMode(false);
  }, [selectedNodeId, selectedEntity, entityOverrides]);

  const handleSaveEntityEdits = () => {
    if (!selectedEntity) return;

    const parsedTags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    setEntityOverrides((prev) => ({
      ...prev,
      [selectedEntity.id]: {
        name: editName.trim() || selectedEntity.name,
        tags: parsedTags,
        notes: editNotes,
      },
    }));

    setEditMode(false);
  };

  const handleCancelEntityEdits = () => {
    if (!selectedEntityView) return;
    setEditName(selectedEntityView.name || '');
    setEditTags((selectedEntityView.tags || []).join(', '));
    setEditNotes(selectedEntityView.notes || '');
    setEditMode(false);
  };

  if (!selectedNodeId && !selectedClaimId && !selectedEventId) {
    return (
      <div
        className="glass-panel w-full md:w-80 h-full p-6 flex flex-col items-center justify-center text-center gap-4 text-muted-foreground"
        data-testid="panel-inspector-empty"
      >
        <AlertTriangle className="w-8 h-8 opacity-20" />
        <p className="text-sm">Select a node, relationship, or event to view details.</p>
      </div>
    );
  }

  const renderEvidenceCard = (id: string) => {
    const ev = getEvidenceById(id);
    if (!ev) return null;

    return (
      <div
        key={id}
        className="flex items-start gap-3 p-2 rounded-md bg-background/50 border border-border/50"
      >
        {ev.type === 'pdf' || ev.type === 'text' ? (
          <FileText className="w-4 h-4 mt-0.5 text-blue-400" />
        ) : (
          <ImageIcon className="w-4 h-4 mt-0.5 text-purple-400" />
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium">{ev.title}</div>
          <div className="text-[10px] text-muted-foreground font-mono">
            Reliability: {ev.reliabilityScore}/5
          </div>
          {ev.sourceName ? (
            <div className="text-[10px] text-muted-foreground">{ev.sourceName}</div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderEntity = () => {
    const entity = selectedEntityView;
    if (!entity) return null;

    const linkedClaims = claims.filter(
      (c) => c.sourceId === entity.id || c.targetId === entity.id,
    );

    const linkedEvents = events.filter(
      (evt) => evt.participantIds?.includes(entity.id) || evt.locationId === entity.id,
    );

    const linkedEvidence = evidence.filter((ev) => {
      const text = `${ev.title} ${ev.notes ?? ''} ${ev.sourceName ?? ''}`.toLowerCase();
      return text.includes(entity.name.toLowerCase());
    });

    return (
      <div
        className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        data-testid={`inspector-entity-${entity.id}`}
      >
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {entity.type}
          </div>

          {editMode ? (
            <input
              className="w-full mt-2 rounded-md border border-border/50 bg-background px-3 py-2 text-sm outline-none"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Entity name"
            />
          ) : (
            <h2 className="text-xl font-semibold mt-1">{entity.name}</h2>
          )}
        </div>

        <div className="flex gap-2 mb-2 flex-wrap">
          {!editMode ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => toggleNodePin(entity.id)}
                    data-testid={`button-pin-${entity.id}`}
                  >
                    {entity.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{entity.pinned ? 'Unpin Node' : 'Pin Node'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    data-testid={`button-expand-${entity.id}`}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Expand
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load 1-hop neighbors</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="h-8"
                onClick={handleSaveEntityEdits}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={handleCancelEntityEdits}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {editMode ? (
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Tags</div>
              <input
                className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm outline-none"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="comma, separated, tags"
              />
            </div>

            <div>
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Notes</div>
              <textarea
                className="w-full min-h-[110px] rounded-md border border-border/50 bg-background px-3 py-2 text-sm outline-none resize-y"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Entity notes"
              />
            </div>
          </div>
        ) : entity.tags && entity.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {entity.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] font-mono rounded-sm"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-1 text-muted-foreground">Notes</div>
          <p className="text-sm whitespace-pre-wrap">
            {entity.notes?.trim() || 'No notes yet.'}
          </p>
          {editMode ? (
            <p className="text-[10px] text-muted-foreground mt-2">
              These edits currently update the app session only. Backend save wiring is the next step.
            </p>
          ) : null}
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Network className="w-3 h-3" />
            Relationships ({linkedClaims.length})
          </div>
          {linkedClaims.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No linked relationships yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedClaims.map((claim) => {
                const otherId = claim.sourceId === entity.id ? claim.targetId : claim.sourceId;
                const other = entities.find((e) => e.id === otherId);

                return (
                  <button
                    key={claim.id}
                    type="button"
                    onClick={() => selectClaim(claim.id)}
                    className="text-left p-2 rounded-md bg-background/50 border border-border/50 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] tracking-wider">
                        {claim.type}
                      </Badge>
                      {claim.disputed ? (
                        <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">
                          Disputed
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-sm mt-2">{claim.statement}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {other ? `Connected to: ${other.name}` : 'Connected item unavailable'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CalendarDays className="w-3 h-3" />
            Events ({linkedEvents.length})
          </div>
          {linkedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No linked events yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedEvents.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => selectEvent(evt.id)}
                  className="text-left p-2 rounded-md bg-background/50 border border-border/50 hover:bg-secondary/40 transition-colors"
                >
                  <div className="text-sm font-medium">{evt.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {evt.dateStart}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Link2 className="w-3 h-3" />
            Related Evidence ({linkedEvidence.length})
          </div>
          {linkedEvidence.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No related evidence found yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {linkedEvidence.map((ev) => renderEvidenceCard(ev.id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderClaim = () => {
    const claim = claims.find((c) => c.id === selectedClaimId);
    if (!claim) return null;

    const source = entities.find((e) => e.id === claim.sourceId);
    const target = entities.find((e) => e.id === claim.targetId);

    return (
      <div
        className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        data-testid={`inspector-claim-${claim.id}`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-none uppercase text-[10px] tracking-wider">
              {claim.type}
            </Badge>
            {claim.disputed ? (
              <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">
                Disputed
              </Badge>
            ) : null}
            {claim.humanReviewed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : null}
          </div>
          <h2 className="text-lg font-medium">{claim.statement}</h2>
        </div>

        <div className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Source</span>
            <button
              type="button"
              className="font-medium hover:underline"
              onClick={() => source && selectNode(source.id)}
            >
              {source?.name ?? 'Unknown'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Target</span>
            <button
              type="button"
              className="font-medium hover:underline"
              onClick={() => target && selectNode(target.id)}
            >
              {target?.name ?? 'Unknown'}
            </button>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-background/40 border border-border/50 rounded-md p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</div>
            <div className="font-medium mt-1">{claim.confidenceScore}/5</div>
          </div>
          <div className="bg-background/40 border border-border/50 rounded-md p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Direction</div>
            <div className="font-medium mt-1">{claim.directed ? 'Directed' : 'Undirected'}</div>
          </div>
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest">
            Evidence ({claim.evidenceIds.length})
          </div>
          {claim.evidenceIds.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No evidence linked.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {claim.evidenceIds.map((id) => renderEvidenceCard(id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEvent = () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) return null;

    const participantEntities = entities.filter((entity) =>
      event.participantIds?.includes(entity.id),
    );

    const location = event.locationId
      ? entities.find((e) => e.id === event.locationId)
      : null;

    return (
      <div
        className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
        data-testid={`inspector-event-${event.id}`}
      >
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Event • {event.dateStart}
          </div>
          <h2 className="text-xl font-semibold mt-1">{event.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="bg-background/40 border border-border/50 rounded-md p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Date</div>
            <div className="font-medium mt-1">
              {event.dateStart}
              {event.dateEnd ? ` → ${event.dateEnd}` : ''}
            </div>
          </div>

          {location ? (
            <div className="bg-background/40 border border-border/50 rounded-md p-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Location</div>
              <button
                type="button"
                className="font-medium mt-1 hover:underline"
                onClick={() => selectNode(location.id)}
              >
                {location.name}
              </button>
            </div>
          ) : null}
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest">
            Participants ({participantEntities.length})
          </div>
          {participantEntities.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No participants linked.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participantEntities.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => selectNode(entity.id)}
                >
                  <Badge variant="secondary" className="cursor-pointer">
                    {entity.name}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <div className="text-xs font-semibold mb-1 text-muted-foreground">Notes</div>
          <p className="text-sm whitespace-pre-wrap">
            {event.notes?.trim() || 'No notes yet.'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="glass-panel w-full md:w-80 h-full flex flex-col md:border-l border-t md:border-t-0 border-b-0 border-r-0 md:rounded-none shadow-2xl"
      data-testid="panel-inspector"
    >
      <div className="p-4 border-b border-border/50 bg-card/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          Inspector
        </h3>
      </div>
      <ScrollArea className="flex-1 p-6">
        {selectedNodeId && renderEntity()}
        {selectedClaimId && renderClaim()}
        {selectedEventId && renderEvent()}
      </ScrollArea>
    </div>
  );
}
