# TrueScope Development Status

Last Updated: 2026-03-08

---

# Project Overview

TrueScope is an investigative analysis platform designed to:

• Track people, organizations, places, and objects as **entities**  
• Connect them using **claims / relationships**  
• Attach **evidence** to those claims  
• Organize events on a **timeline**  
• Visualize everything using an **interactive graph board**

The system functions similar to an investigative **string board**, but digital and data-driven.

---

# Current Architecture

Frontend
React  
TypeScript  
Zustand state store  
ForceGraph2D visualization  
Tailwind UI components

Backend
Node.js  
Express  
Drizzle ORM  
PostgreSQL database

---

# Major Systems Currently Implemented

## Entity System
Entities can be created and displayed on the investigation graph.

Entity fields:

id  
name  
type  
tags  
notes  
pinned

Entities appear as nodes on the graph board.

Inspector panel displays:

• name  
• type  
• tags  
• notes  
• relationships  
• linked events  
• related evidence

---

## Claim / Relationship System

Claims represent relationships between entities.

Structure:

sourceId  
targetId  
type  
statement  
confidenceScore  
evidenceIds  
humanReviewed  
disputed

Claims are displayed as **graph edges**.

Multiple claims between the same entities use **curved links**.

---

## Evidence System

Evidence items can be attached to claims.

Evidence supports:

title  
type (pdf, text, image)  
sourceName  
reliabilityScore  
notes

Evidence appears inside the Inspector panel under claims.

---

## Event System

Events allow timeline tracking.

Fields:

title  
dateStart  
dateEnd  
participantIds  
locationId  
notes

Events appear in the Inspector and can link to entities.

---

# Graph System

Graph uses:

react-force-graph-2d

Features implemented:

• force layout
• radial layout option
• node selection
• relationship filtering
• curved multi-edges
• directional arrows
• node highlighting

---

# UI Systems Implemented

Navbar

• view mode toggle
• graph layout toggle
• hamburger menu
• entity/claim/event creation

Inspector Panel

Shows detailed info for:

Entities  
Claims  
Events  

Now includes:

• entity edit mode
• editable name
• editable tags
• editable notes
• session-level saving

---

# Context Menu System

Right-click on graph nodes opens menu.

Planned actions include:

Inspect  
Pin  
Expand neighbors  
View relationships  
Open evidence  
Edit entity (planned)

---

# Current Limitations

Entity editing currently saves **only in local session state**.

Changes do NOT yet persist to:

PostgreSQL  
API routes  
Zustand store

Graph node label updates may require reselection.

Evidence linking to entities is currently text-based detection.

---

# Next Development Targets

## 1 — Persistent Entity Editing

Implement:

updateEntity()

Flow:

Inspector → Zustand → API → PostgreSQL

---

## 2 — Relationship Creation from Entity

Allow creating a claim directly from the entity inspector.

Example workflow:

Select entity  
Click "Add Connection"  
Choose target entity  
Choose relationship type  
Add evidence

---

## 3 — Evidence Attachment UI

Drag & drop files.

Supported types:

PDF  
Images  
Text  
Links

Evidence should attach to:

claims  
entities  
events

---

## 4 — Timeline Visualization

Create full event timeline panel.

Features:

• chronological view  
• zoom  
• event filtering  
• entity highlighting

---

## 5 — Graph Context Menu Expansion

Right-click node actions:

Inspect  
Edit  
Add Relationship  
Attach Evidence  
Create Event  
Pin / Unpin

---

# Long Term Vision

TrueScope should function as a complete investigative OS.

Capabilities planned:

• investigation boards
• timeline reconstruction
• entity clustering
• evidence weighting
• narrative construction
• investigation export reports

Eventually including:

• AI relationship analysis
• pattern detection
• anomaly discovery
• automated hypothesis generation

---

# Current Status Summary

Backend running  
Database working  
Entities saving  
Claims saving  
Evidence saving  
Events saving  

Graph visualization working.

Inspector editing implemented (session level).

Next major milestone:

Persistent entity editing + relationship creation UI.

---

# Developer Notes

Always keep:

npm run check

clean with no TypeScript errors.

Primary working directory:

~/TrueScope-Analysis

