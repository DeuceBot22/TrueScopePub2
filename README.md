# TrueScope

TrueScope is an investigative analysis platform designed to map relationships between entities, evidence, and events while preserving **timeline context**.

Unlike traditional graph tools, TrueScope combines:

• relationship graphs  
• evidence tracking  
• event timelines  

into a single investigative environment.

---

# Why TrueScope Exists

Most graph analysis tools answer:

Who is connected to who?

TrueScope answers:

Who was connected to who — when — and what evidence supports it.

This makes it possible to reconstruct investigations as **chronological narratives**, not just static networks.

---

# Core Investigation Model

TrueScope uses four primary objects:

Entities  
Claims (relationships)  
Evidence  
Events (timeline)

Together they form a **temporal knowledge graph**.

Example structure:

Entity → Claim → Entity  
Claim → Evidence  
Entities → Events → Timeline

This allows investigators to analyze both **relationships and chronology simultaneously**.

---

# Current Features

Entity graph visualization

Relationship / claim system

Evidence attachment

Event timeline model

Inspector panel for entity/claim/event analysis

Graph interaction:

node selection  
claim selection  
context menu  
graph layout switching  

Entity editing inside the inspector panel.

---

# Technology Stack

Frontend

React  
TypeScript  
Zustand state management  
Tailwind UI  
ShadCN components  

Graph Visualization

react-force-graph-2d

Backend

Node.js  
Express  
Drizzle ORM  

Database

PostgreSQL

---

# Project Structure


Key components:

GraphView.tsx  
Inspector.tsx  
Navbar.tsx  
CreateModals.tsx  
store.ts  

---

# Investigation Workflow

Typical usage:

1 Create entities (people, companies, locations, etc)

2 Connect them with claims

3 Attach supporting evidence

4 Add events to build a timeline

5 Explore relationships in the graph

6 Reconstruct the investigation chronologically

---

# What Makes TrueScope Different

Most graph tools only show **relationships**.

TrueScope integrates **time** as a core dimension.

This allows investigators to answer:

When relationships formed  
How they evolved  
What events explain them  
What evidence supports them

TrueScope is designed to become a full **investigative operating system**.

---

# Future Features

Persistent entity editing

Relationship creation directly from entities

Evidence file uploads

Interactive timeline panel

Graph filtering and case workspaces

AI-assisted pattern detection

Automated investigation summaries

---

# Vision

TrueScope aims to become the most powerful open investigative graph platform available.

The goal is to combine:

network analysis  
timeline reconstruction  
evidence tracking  

into a single investigative interface.

---

# Author

Ryan Gregory  
GitHub: https://github.com/DeuceBot22

