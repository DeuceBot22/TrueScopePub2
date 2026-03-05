import React, { useState } from 'react';
import { useStore, EntityType, ClaimType } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CreateEntityDialog() {
  const [open, setOpen] = useState(false);
  const { addEntity } = useStore();
  const { toast } = useToast();

  const [type, setType] = useState<EntityType>('Person');
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEntity({
      type,
      name,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      notes
    });
    setOpen(false);
    setName('');
    setTags('');
    setNotes('');
    toast({ title: "Entity created", description: `${name} has been added.` });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8" data-testid="button-create-entity">
          <Plus className="w-4 h-4 mr-2" />
          Entity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Create New Entity</DialogTitle>
          <DialogDescription>Add a person, organization, or place to your investigation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: EntityType) => setType(v)}>
              <SelectTrigger data-testid="select-entity-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Person">Person</SelectItem>
                <SelectItem value="Organization">Organization</SelectItem>
                <SelectItem value="Place">Place</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required data-testid="input-entity-name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. suspect, witness" data-testid="input-entity-tags" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} data-testid="input-entity-notes" />
          </div>
          <Button type="submit" data-testid="button-submit-entity">Create Entity</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateClaimDialog() {
  const [open, setOpen] = useState(false);
  const { addClaim, entities } = useStore();
  const { toast } = useToast();

  const [type, setType] = useState<ClaimType>('affiliation');
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [statement, setStatement] = useState('');
  const [confidence, setConfidence] = useState('3');
  const [humanReviewed, setHumanReviewed] = useState(false);
  const [disputed, setDisputed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) return;
    
    addClaim({
      type,
      sourceId,
      targetId,
      directed: true,
      statement,
      confidenceScore: parseInt(confidence) as 1|2|3|4|5,
      evidenceIds: [],
      humanReviewed,
      disputed
    });
    setOpen(false);
    setStatement('');
    toast({ title: "Claim created", description: "Relationship has been added." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 border-border/50 bg-background/50" data-testid="button-create-claim">
          <Plus className="w-4 h-4 mr-2" />
          Claim
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Create Relationship Claim</DialogTitle>
          <DialogDescription>Establish a connection between two entities.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: ClaimType) => setType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {['funding', 'affiliation', 'communication', 'family', 'conflict', 'influence', 'ownership', 'legal', 'other'].map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Source Entity</Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                <SelectContent>
                  {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Target Entity</Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger><SelectValue placeholder="Target" /></SelectTrigger>
                <SelectContent>
                  {entities.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="statement">Statement</Label>
            <Input id="statement" value={statement} onChange={e => setStatement(e.target.value)} required placeholder="e.g. A funded B" />
          </div>

          <div className="grid gap-2">
            <Label>Confidence Score (1-5)</Label>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reviewed">Human Reviewed</Label>
            <Switch id="reviewed" checked={humanReviewed} onCheckedChange={setHumanReviewed} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="disputed" className="text-destructive">Disputed</Label>
            <Switch id="disputed" checked={disputed} onCheckedChange={setDisputed} />
          </div>

          <Button type="submit" data-testid="button-submit-claim">Create Claim</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const { addEvent, entities } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [notes, setNotes] = useState('');
  const [locationId, setLocationId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      title,
      dateStart,
      participantIds: selectedParticipants,
      evidenceIds: [],
      notes,
      locationId: locationId || undefined
    });
    setOpen(false);
    setTitle('');
    setDateStart('');
    setNotes('');
    setLocationId('');
    setSelectedParticipants([]);
    toast({ title: "Event created", description: `${title} has been added to timeline.` });
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 border-border/50 bg-background/50" data-testid="button-create-event">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-background/95 backdrop-blur-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Add a dated event and link participants from your entities.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 overflow-y-auto pr-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Secret Meeting" data-testid="input-event-title" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} required data-testid="input-event-date" />
          </div>
          <div className="grid gap-2">
            <Label>Location (Place Entity)</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue placeholder="Select location (optional)" /></SelectTrigger>
              <SelectContent>
                {entities.filter(e => e.type === 'Place').map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Users className="w-3 h-3" /> Participants
            </Label>
            <ScrollArea className="h-[100px] border border-border/50 rounded-md p-2 bg-background/30">
              <div className="flex flex-wrap gap-2">
                {entities.filter(e => e.type === 'Person' || e.type === 'Organization').map(e => (
                  <Badge 
                    key={e.id} 
                    variant={selectedParticipants.includes(e.id) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleParticipant(e.id)}
                  >
                    {e.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <p className="text-[10px] text-muted-foreground italic">Click to select/deselect participants</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-notes">Notes</Label>
            <Textarea id="event-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add relevant details..." data-testid="input-event-notes" />
          </div>
          <Button type="submit" data-testid="button-submit-event">Create Event</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
