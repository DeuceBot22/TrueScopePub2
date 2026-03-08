import React, { useEffect } from 'react';
import { GraphView } from '@/components/GraphView';
import { Legend } from '@/components/Legend';
import { TimelineView } from '@/components/TimelineView';
import { Inspector } from '@/components/Inspector';
import { Navbar } from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, ListFilter, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const { 
    isTimelineCollapsed, setTimelineCollapsed,
    isInspectorCollapsed, setInspectorCollapsed,
    isLegendCollapsed, setLegendCollapsed,
    loadEntities,
    loadEvidence,
    loadEvents,
    loadClaims
  } = useStore();

  useEffect(() => {
    loadEntities().catch((err) => {
      console.error("Failed to load entities", err);
    });

    loadEvidence().catch((err) => {
      console.error("Failed to load evidence", err);
    });

    loadEvents().catch((err) => {
      console.error("Failed to load events", err);
    });

    loadClaims().catch((err) => {
      console.error("Failed to load claims", err);
    });
  }, [loadEntities, loadEvidence, loadEvents, loadClaims]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground" data-testid="page-home">
      <Navbar />
      
      <div className="flex-1 relative flex overflow-hidden">
        {/* Main Graph Canvas */}
        <div className="flex-1 relative z-0">
          <GraphView />
        </div>

        {/* Legend Overlay */}
        <div className={cn(
          "absolute top-4 left-4 z-10 transition-all duration-300 ease-in-out",
          isLegendCollapsed ? "-translate-x-[calc(100%+1rem)]" : "translate-x-0"
        )}>
          <Legend />
        </div>
        
        {/* Legend Toggle Button */}
        <div className="absolute top-4 left-4 z-20 pointer-events-auto">
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-8 w-8 glass border border-border/50 shadow-md transition-all duration-300",
              isLegendCollapsed ? "translate-x-0" : "translate-x-64 ml-4"
            )}
            onClick={() => setLegendCollapsed(!isLegendCollapsed)}
            data-testid="button-toggle-legend"
          >
            {isLegendCollapsed ? <ListFilter className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Timeline Overlay */}
        <div className={cn(
          "absolute bottom-4 left-4 right-80 z-10 transition-all duration-300 ease-in-out",
          isInspectorCollapsed && "right-4",
          isTimelineCollapsed ? "translate-y-[calc(100%+1rem)]" : "translate-y-0"
        )}>
          <TimelineView />
        </div>

        {/* Timeline Toggle Button */}
        <div className={cn(
          "absolute bottom-4 left-1/2 -translate-x-1/2 z-20 transition-all duration-300",
          isTimelineCollapsed ? "translate-y-0" : "translate-y-[-180px]" // Adjust based on timeline height
        )}>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 glass border border-border/50 shadow-md px-4"
            onClick={() => setTimelineCollapsed(!isTimelineCollapsed)}
            data-testid="button-toggle-timeline"
          >
            {isTimelineCollapsed ? <Calendar className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            {isTimelineCollapsed ? "Show Timeline" : "Hide"}
          </Button>
        </div>

        {/* Right Sidebar (Inspector) */}
        <div className={cn(
          "h-full relative z-20 pointer-events-auto transition-all duration-300 ease-in-out",
          isInspectorCollapsed ? "w-0" : "w-80"
        )}>
          <div className={cn(
            "h-full w-80 absolute right-0 transition-transform duration-300",
            isInspectorCollapsed ? "translate-x-full" : "translate-x-0"
          )}>
            <Inspector />
          </div>
          
          {/* Inspector Toggle Button */}
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "absolute top-4 z-30 h-8 w-8 glass border border-border/50 shadow-md transition-all duration-300",
              isInspectorCollapsed ? "-left-12" : "left-0 -translate-x-full -ml-4"
            )}
            onClick={() => setInspectorCollapsed(!isInspectorCollapsed)}
            data-testid="button-toggle-inspector"
          >
            {isInspectorCollapsed ? <Info className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
