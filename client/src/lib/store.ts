import { create } from 'zustand';

// Core Data Model Types
export type EntityType = 'Person' | 'Organization' | 'Place' | 'Document' | 'Media';

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
  type: 'pdf' | 'text' | 'image' | 'audio' | 'video' | 'url';
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

export type ClaimType = 'funding' | 'affiliation' | 'communication' | 'family' | 'conflict' | 'influence' | 'ownership' | 'legal' | 'other';

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

export type ViewMode = 'Discovery' | 'Verification' | 'Disputed';
export type GraphLayout = 'Force' | 'Radial';

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
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt'>) => void;
  addEvidence: (evidence: Omit<Evidence, 'id' | 'createdAt'>) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt'>) => void;
  
  toggleNodePin: (id: string) => void;
}

// Mock Data
const MOCK_ENTITIES: Entity[] = [
  { id: 'e1', type: 'Person', name: 'John Doe', tags: ['suspect', 'high-priority'], createdAt: Date.now() },
  { id: 'e2', type: 'Organization', name: 'Acme Corp', tags: ['shell-company'], createdAt: Date.now() },
  { id: 'e3', type: 'Person', name: 'Jane Smith', tags: ['witness'], createdAt: Date.now() },
  { id: 'e4', type: 'Place', name: 'Warehouse 42', tags: ['location'], createdAt: Date.now() },
];

const MOCK_EVIDENCE: Evidence[] = [
  { id: 'ev1', title: 'Bank Statement', type: 'pdf', reliabilityScore: 5, createdAt: Date.now() },
  { id: 'ev2', title: 'Anonymous Tip', type: 'text', reliabilityScore: 2, createdAt: Date.now() },
];

const MOCK_EVENTS: Event[] = [
  { id: 'evt1', title: 'Meeting at Warehouse', dateStart: '2023-10-15', locationId: 'e4', participantIds: ['e1', 'e3'], evidenceIds: ['ev2'], createdAt: Date.now() },
  { id: 'evt2', title: 'Funds Transfer', dateStart: '2023-11-01', participantIds: ['e2', 'e1'], evidenceIds: ['ev1'], createdAt: Date.now() }
];

const MOCK_CLAIMS: Claim[] = [
  { id: 'c1', type: 'funding', sourceId: 'e2', targetId: 'e1', directed: true, statement: 'Acme Corp funded John Doe', confidenceScore: 4, evidenceIds: ['ev1'], humanReviewed: true, disputed: false, createdAt: Date.now() },
  { id: 'c2', type: 'affiliation', sourceId: 'e1', targetId: 'e3', directed: false, statement: 'John and Jane are associated', confidenceScore: 2, evidenceIds: [], humanReviewed: false, disputed: false, createdAt: Date.now() },
  { id: 'c3', type: 'conflict', sourceId: 'e3', targetId: 'e2', directed: true, statement: 'Jane claims Acme Corp is fraudulent', confidenceScore: 3, evidenceIds: ['ev2'], humanReviewed: true, disputed: true, createdAt: Date.now() },
];

export const useStore = create<AppState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  entities: MOCK_ENTITIES,
  evidence: MOCK_EVIDENCE,
  events: MOCK_EVENTS,
  claims: MOCK_CLAIMS,
  
  viewMode: 'Discovery',
  graphLayout: 'Force',
  selectedNodeId: null,
  selectedClaimId: null,
  selectedEventId: null,
  
  timeWindowStart: new Date('1920-01-01').getTime(),
  timeWindowEnd: new Date('2030-12-31').getTime(),
  activeClaimTypes: new Set<ClaimType>(['funding', 'affiliation', 'communication', 'family', 'conflict', 'influence', 'ownership', 'legal', 'other']),
  minConfidenceScore: 1,

  // Layout State
  isTimelineCollapsed: false,
  isInspectorCollapsed: false,
  isLegendCollapsed: false,
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setGraphLayout: (layout) => set({ graphLayout: layout }),
  selectNode: (id) => set({ selectedNodeId: id, selectedClaimId: null, selectedEventId: null }),
  selectClaim: (id) => set({ selectedClaimId: id, selectedNodeId: null, selectedEventId: null }),
  selectEvent: (id) => set({ selectedEventId: id, selectedNodeId: null, selectedClaimId: null }),
  
  setTimeWindow: (start, end) => set({ timeWindowStart: start, timeWindowEnd: end }),
  toggleClaimTypeFilter: (type) => set((state) => {
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
  setInspectorCollapsed: (collapsed) => set({ isInspectorCollapsed: collapsed }),
  setLegendCollapsed: (collapsed) => set({ isLegendCollapsed: collapsed }),
  
  addEntity: (entity) => set((state) => ({ 
    entities: [...state.entities, { ...entity, id: `e${Date.now()}`, createdAt: Date.now() }] 
  })),
  addEvidence: (evidence) => set((state) => ({ 
    evidence: [...state.evidence, { ...evidence, id: `ev${Date.now()}`, createdAt: Date.now() }] 
  })),
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, { ...event, id: `evt${Date.now()}`, createdAt: Date.now() }] 
  })),
  addClaim: (claim) => set((state) => ({ 
    claims: [...state.claims, { ...claim, id: `c${Date.now()}`, createdAt: Date.now() }] 
  })),
  
  toggleNodePin: (id) => set((state) => ({
    entities: state.entities.map(e => e.id === id ? { ...e, pinned: !e.pinned } : e)
  })),
}));