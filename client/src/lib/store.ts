import { create } from "zustand";

// Core Data Model Types
export type EntityType =
  | "Person"
  | "Organization"
  | "Place"
  | "Document"
  | "Media";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  aliases?: string[];
  tags: string[];
  notes?: string;
  createdAt: number;
  pinned?: boolean; // UI State
}

export interface Evidence {
  id: string;
  title: string;
  type: "pdf" | "text" | "image" | "audio" | "video" | "url";
  url?: string;
  sourceName?: string;
  publishedDate?: string;
  reliabilityScore: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: number;
}

export interface Event {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string;
  locationId?: string;
  participantIds: string[];
  evidenceIds: string[];
  notes?: string;
  createdAt: number;
}

export type ClaimType =
  | "funding"
  | "affiliation"
  | "communication"
  | "family"
  | "conflict"
  | "influence"
  | "ownership"
  | "legal"
  | "other";

export interface Claim {
  id: string;
  type: ClaimType;
  sourceId: string;
  targetId: string;
  directed: boolean;
  statement: string;
  dateStart?: string;
  dateEnd?: string;
  confidenceScore: 1 | 2 | 3 | 4 | 5;
  evidenceIds: string[];
  humanReviewed: boolean;
  disputed: boolean;
  createdAt: number;
}

export type ViewMode = "Discovery" | "Verification" | "Disputed";
export type GraphLayout = "Force" | "Radial";

interface AppState {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;

  entities: Entity[];
  evidence: Evidence[];
  events: Event[];
  claims: Claim[];

  viewMode: ViewMode;
  graphLayout: GraphLayout;
  selectedNodeId: string | null;
  selectedClaimId: string | null;
  selectedEventId: string | null;

  timeWindowStart: number | null;
  timeWindowEnd: number | null;
  activeClaimTypes: Set<ClaimType>;
  minConfidenceScore: number;

  // Layout State
  isTimelineCollapsed: boolean;
  isInspectorCollapsed: boolean;
  isLegendCollapsed: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setGraphLayout: (layout: GraphLayout) => void;
  selectNode: (id: string | null) => void;
  selectClaim: (id: string | null) => void;
  selectEvent: (id: string | null) => void;

  setTimeWindow: (start: number | null, end: number | null) => void;
  toggleClaimTypeFilter: (type: ClaimType) => void;
  setMinConfidenceScore: (score: number) => void;

  // Layout Actions
  setTimelineCollapsed: (collapsed: boolean) => void;
  setInspectorCollapsed: (collapsed: boolean) => void;
  setLegendCollapsed: (collapsed: boolean) => void;

  // Data Mutations (Mock CRUD)
  loadEntities: () => Promise<void>;
  addEntity: (entity: Omit<Entity, "id" | "createdAt">) => Promise<void>;
  loadEvidence: () => Promise<void>;
  addEvidence: (evidence: Omit<Evidence, "id" | "createdAt">) => Promise<void>;
  loadEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, "id" | "createdAt">) => Promise<void>;
  loadClaims: () => Promise<void>;
  addClaim: (claim: Omit<Claim, "id" | "createdAt">) => Promise<void>;

  toggleNodePin: (id: string) => void;
}

// Mock Data
const MOCK_ENTITIES: Entity[] = [
  {
    id: "e1",
    type: "Person",
    name: "John Doe",
    tags: ["suspect", "high-priority"],
    createdAt: Date.now(),
  },
  {
    id: "e2",
    type: "Organization",
    name: "Acme Corp",
    tags: ["shell-company"],
    createdAt: Date.now(),
  },
  {
    id: "e3",
    type: "Person",
    name: "Jane Smith",
    tags: ["witness"],
    createdAt: Date.now(),
  },
  {
    id: "e4",
    type: "Place",
    name: "Warehouse 42",
    tags: ["location"],
    createdAt: Date.now(),
  },
];

const MOCK_EVIDENCE: Evidence[] = [
  {
    id: "ev1",
    title: "Bank Statement",
    type: "pdf",
    reliabilityScore: 5,
    createdAt: Date.now(),
  },
  {
    id: "ev2",
    title: "Anonymous Tip",
    type: "text",
    reliabilityScore: 2,
    createdAt: Date.now(),
  },
];

const MOCK_EVENTS: Event[] = [
  {
    id: "evt1",
    title: "Meeting at Warehouse",
    dateStart: "2023-10-15",
    locationId: "e4",
    participantIds: ["e1", "e3"],
    evidenceIds: ["ev2"],
    createdAt: Date.now(),
  },
  {
    id: "evt2",
    title: "Funds Transfer",
    dateStart: "2023-11-01",
    participantIds: ["e2", "e1"],
    evidenceIds: ["ev1"],
    createdAt: Date.now(),
  },
];

const MOCK_CLAIMS: Claim[] = [
  {
    id: "c1",
    type: "funding",
    sourceId: "e2",
    targetId: "e1",
    directed: true,
    statement: "Acme Corp funded John Doe",
    confidenceScore: 4,
    evidenceIds: ["ev1"],
    humanReviewed: true,
    disputed: false,
    createdAt: Date.now(),
  },
  {
    id: "c2",
    type: "affiliation",
    sourceId: "e1",
    targetId: "e3",
    directed: false,
    statement: "John and Jane are associated",
    confidenceScore: 2,
    evidenceIds: [],
    humanReviewed: false,
    disputed: false,
    createdAt: Date.now(),
  },
  {
    id: "c3",
    type: "conflict",
    sourceId: "e3",
    targetId: "e2",
    directed: true,
    statement: "Jane claims Acme Corp is fraudulent",
    confidenceScore: 3,
    evidenceIds: ["ev2"],
    humanReviewed: true,
    disputed: true,
    createdAt: Date.now(),
  },
];


function normalizeEntity(row: any): Entity {
  return {
    id: row.id,
    type: row.type as EntityType,
    name: row.name,
    aliases: row.aliases ?? [],
    tags: row.tags ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
    pinned: false,
  };
}

async function fetchEntitiesFromApi(): Promise<Entity[]> {
  const res = await fetch("/api/entities", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load entities: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map(normalizeEntity);
}

async function createEntityInApi(
  entity: Omit<Entity, "id" | "createdAt">,
): Promise<Entity> {
  const res = await fetch("/api/entities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      type: entity.type,
      name: entity.name,
      aliases: entity.aliases ?? [],
      tags: entity.tags ?? [],
      notes: entity.notes ?? "",
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create entity: ${res.status} ${msg}`);
  }

  const row = await res.json();
  return normalizeEntity(row);
}


function normalizeEvidence(row: any): Evidence {
  return {
    id: row.id,
    title: row.title,
    type: row.kind as Evidence["type"],
    url: row.url ?? undefined,
    sourceName: row.sourceName ?? undefined,
    publishedDate: row.publishedDate ?? undefined,
    reliabilityScore: (row.reliabilityScore ?? 3) as 1 | 2 | 3 | 4 | 5,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

async function fetchEvidenceFromApi(): Promise<Evidence[]> {
  const res = await fetch("/api/evidence", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load evidence: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map(normalizeEvidence);
}

async function createEvidenceInApi(
  evidence: Omit<Evidence, "id" | "createdAt">,
): Promise<Evidence> {
  const res = await fetch("/api/evidence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: evidence.title,
      kind: evidence.type,
      url: evidence.url ?? "",
      sourceName: evidence.sourceName ?? "",
      publishedDate: evidence.publishedDate ?? "",
      reliabilityScore: evidence.reliabilityScore,
      notes: evidence.notes ?? "",
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create evidence: ${res.status} ${msg}`);
  }

  const row = await res.json();
  return normalizeEvidence(row);
}


function normalizeEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    dateStart: row.dateStart,
    dateEnd: row.dateEnd ?? undefined,
    locationId: row.locationEntityId ?? undefined,
    participantIds: row.participantIds ?? [],
    evidenceIds: row.evidenceIds ?? [],
    notes: row.notes ?? undefined,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

async function fetchEventsFromApi(): Promise<Event[]> {
  const res = await fetch("/api/events", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load events: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map(normalizeEvent);
}

async function createEventInApi(
  event: Omit<Event, "id" | "createdAt">,
): Promise<Event> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: event.title,
      dateStart: event.dateStart,
      dateEnd: event.dateEnd ?? "",
      locationEntityId: event.locationId ?? "",
      participantIds: event.participantIds ?? [],
      notes: event.notes ?? "",
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create event: ${res.status} ${msg}`);
  }

  const row = await res.json();
  return normalizeEvent(row);
}


function normalizeClaim(row: any): Claim {
  return {
    id: row.id,
    type: row.type as ClaimType,
    sourceId: row.sourceId,
    targetId: row.targetId,
    directed: row.directed ?? true,
    statement: row.statement,
    dateStart: row.dateStart ?? undefined,
    dateEnd: row.dateEnd ?? undefined,
    confidenceScore: (row.confidenceScore ?? 3) as 1 | 2 | 3 | 4 | 5,
    evidenceIds: row.evidenceIds ?? [],
    humanReviewed: row.humanReviewed ?? false,
    disputed: row.disputed ?? false,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

async function fetchClaimsFromApi(): Promise<Claim[]> {
  const res = await fetch("/api/claims", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load claims: ${res.status}`);
  }

  const rows = await res.json();
  return rows.map(normalizeClaim);
}

async function createClaimInApi(
  claim: Omit<Claim, "id" | "createdAt">,
): Promise<Claim> {
  const res = await fetch("/api/claims", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      type: claim.type,
      sourceId: claim.sourceId,
      targetId: claim.targetId,
      directed: claim.directed,
      statement: claim.statement,
      dateStart: claim.dateStart ?? "",
      dateEnd: claim.dateEnd ?? "",
      confidenceScore: claim.confidenceScore,
      humanReviewed: claim.humanReviewed,
      disputed: claim.disputed,
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Failed to create claim: ${res.status} ${msg}`);
  }

  const row = await res.json();
  return normalizeClaim(row);
}

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  entities: [],
  evidence: [],
  events: [],
  claims: [],

  viewMode: "Discovery",
  graphLayout: "Force",
  selectedNodeId: null,
  selectedClaimId: null,
  selectedEventId: null,

  timeWindowStart: new Date("1920-01-01").getTime(),
  timeWindowEnd: new Date("2030-12-31").getTime(),
  activeClaimTypes: new Set<ClaimType>([
    "funding",
    "affiliation",
    "communication",
    "family",
    "conflict",
    "influence",
    "ownership",
    "legal",
    "other",
  ]),
  minConfidenceScore: 1,

  // Layout State
  isTimelineCollapsed: false,
  isInspectorCollapsed: false,
  isLegendCollapsed: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setGraphLayout: (layout) => set({ graphLayout: layout }),
  selectNode: (id) =>
    set({ selectedNodeId: id, selectedClaimId: null, selectedEventId: null }),
  selectClaim: (id) =>
    set({ selectedClaimId: id, selectedNodeId: null, selectedEventId: null }),
  selectEvent: (id) =>
    set({ selectedEventId: id, selectedNodeId: null, selectedClaimId: null }),

  setTimeWindow: (start, end) =>
    set({ timeWindowStart: start, timeWindowEnd: end }),
  toggleClaimTypeFilter: (type) =>
    set((state) => {
      const newTypes = new Set(state.activeClaimTypes);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      return { activeClaimTypes: newTypes };
    }),
  setMinConfidenceScore: (score) => set({ minConfidenceScore: score }),

  // Layout Actions
  setTimelineCollapsed: (collapsed) => set({ isTimelineCollapsed: collapsed }),
  setInspectorCollapsed: (collapsed) =>
    set({ isInspectorCollapsed: collapsed }),
  setLegendCollapsed: (collapsed) => set({ isLegendCollapsed: collapsed }),

  loadEntities: async () => {
    const entities = await fetchEntitiesFromApi();
    set({ entities });
  },

  addEntity: async (entity) => {
    const created = await createEntityInApi(entity);
    set((state) => ({
      entities: [...state.entities, created],
    }));
  },
  loadEvidence: async () => {
    const evidence = await fetchEvidenceFromApi();
    set({ evidence });
  },

  addEvidence: async (evidence) => {
    const created = await createEvidenceInApi(evidence);
    set((state) => ({
      evidence: [...state.evidence, created],
    }));
  },
  loadEvents: async () => {
    const events = await fetchEventsFromApi();
    set({ events });
  },

  addEvent: async (event) => {
    const created = await createEventInApi(event);
    set((state) => ({
      events: [...state.events, created],
    }));
  },
  loadClaims: async () => {
    const claims = await fetchClaimsFromApi();
    set({ claims });
  },

  addClaim: async (claim) => {
    const created = await createClaimInApi(claim);
    set((state) => ({
      claims: [...state.claims, created],
    }));
  },

  toggleNodePin: (id) =>
    set((state) => ({
      entities: state.entities.map((e) =>
        e.id === id ? { ...e, pinned: !e.pinned } : e,
      ),
    })),
}));
