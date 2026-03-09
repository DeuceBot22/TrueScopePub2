# TrueScope Development Roadmap

This document outlines the planned development stages for the TrueScope investigative analysis platform.

TrueScope is being built as a **temporal investigation graph system** that combines entities, relationships, evidence, and events into a single analysis environment.

---

# Phase 1 — Core Graph System (Mostly Complete)

Entity nodes

Relationship / claim edges

Evidence attachment model

Event timeline data model

Graph visualization

Inspector panel

Entity editing (session level)

Context menu interactions

Basic UI navigation

Goal:
Establish the core investigative graph infrastructure.

---

# Phase 2 — Persistent Editing

Entity updates saved to database

Claim editing support

Evidence editing

API endpoints for updates

Zustand store synchronization

Graph auto-refresh after edits

Goal:
Ensure all investigation data persists reliably.

---

# Phase 3 — Relationship Creation Workflow

Create relationships directly from entity inspector.

Workflow:

Select entity  
Click "Add Connection"  
Choose target entity  
Select relationship type  
Attach evidence  

Graph automatically updates.

Goal:
Make relationship creation intuitive and fast.

---

# Phase 4 — Timeline Visualization

Interactive timeline panel

Chronological event view

Event filtering

Timeline zoom

Entity highlighting by time

Relationship evolution tracking

Goal:
Turn investigations into chronological narratives.

---

# Phase 5 — Evidence System Expansion

Drag-and-drop evidence uploads

Supported types:

PDF  
Images  
Text  
Links  

Evidence viewer panel

Evidence linked to:

claims  
entities  
events  

Goal:
Make evidence first-class investigation data.

---

# Phase 6 — Graph Intelligence

Graph filtering

Cluster detection

Relationship strength weighting

Centrality scoring

Network path discovery

Goal:
Help investigators find hidden relationships.

---

# Phase 7 — Case Workspaces

Multiple investigation boards

Workspace isolation

Case export

Case import

Team collaboration features

Goal:
Support real investigative projects.

---

# Phase 8 — AI Analysis Layer

Pattern detection

Relationship suggestions

Evidence summarization

Timeline reconstruction

Automated investigation reports

Goal:
Assist investigators with complex analysis.

---

# Long-Term Vision

TrueScope becomes a full investigative analysis platform combining:

graph analysis  
timeline reconstruction  
evidence tracking  
AI assistance  

The platform should allow investigators to understand:

Who is connected  
When relationships occurred  
What evidence supports them  
What events explain them  

