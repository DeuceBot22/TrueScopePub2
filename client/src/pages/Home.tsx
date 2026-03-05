import React from 'react';
import { GraphView } from '@/components/GraphView';
import { Legend } from '@/components/Legend';
import { TimelineView } from '@/components/TimelineView';
import { Inspector } from '@/components/Inspector';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground" data-testid="page-home">
      <Navbar />
      
      <div className="flex-1 relative flex overflow-hidden">
        {/* Main Graph Canvas */}
        <div className="flex-1 relative z-0">
          <GraphView />
        </div>

        {/* Floating overlays over the graph */}
        <div className="absolute top-4 left-4 z-10 pointer-events-auto">
          <Legend />
        </div>

        <div className="absolute bottom-4 left-4 right-80 z-10 pointer-events-auto px-4">
          <TimelineView />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 h-full relative z-20 pointer-events-auto">
          <Inspector />
        </div>
      </div>
    </div>
  );
}
