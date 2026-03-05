import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TimelineView() {
  const { events, timeWindowStart, timeWindowEnd, setTimeWindow, selectEvent, selectedEventId } = useStore();
  
  // Find global min/max dates from events and claims to set slider bounds
  const minTime = new Date('2023-01-01').getTime();
  const maxTime = new Date('2024-12-31').getTime();

  const handleSliderChange = (value: number[]) => {
    setTimeWindow(value[0], value[1]);
  };

  return (
    <div className="glass-panel p-4 rounded-lg w-full flex flex-col gap-4" data-testid="panel-timeline">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Timeline</h3>
        <div className="flex gap-4 text-xs font-mono">
          <span>{timeWindowStart ? format(timeWindowStart, 'MMM yyyy') : 'Start'}</span>
          <span>-</span>
          <span>{timeWindowEnd ? format(timeWindowEnd, 'MMM yyyy') : 'End'}</span>
        </div>
      </div>

      <div className="px-2">
        <Slider
          defaultValue={[timeWindowStart || minTime, timeWindowEnd || maxTime]}
          min={minTime}
          max={maxTime}
          step={1000 * 60 * 60 * 24 * 30} // roughly 1 month steps
          onValueChange={handleSliderChange}
          className="my-4"
        />
      </div>

      {/* Mini Event Track */}
      <div className="h-12 w-full relative border-t border-border mt-2 pt-2 flex items-center overflow-x-auto gap-2 no-scrollbar">
        {events.map(event => {
          const eventTime = new Date(event.dateStart).getTime();
          const isSelected = selectedEventId === event.id;
          const isInWindow = timeWindowStart && timeWindowEnd && eventTime >= timeWindowStart && eventTime <= timeWindowEnd;
          
          return (
            <button
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className={`flex-shrink-0 text-left p-2 rounded border transition-colors ${
                isSelected ? 'bg-primary/20 border-primary' : 'bg-secondary/20 border-transparent hover:border-border'
              } ${!isInWindow ? 'opacity-30' : 'opacity-100'}`}
              style={{ minWidth: '150px' }}
            >
              <div className="text-[10px] text-muted-foreground font-mono">{format(eventTime, 'yyyy-MM-dd')}</div>
              <div className="text-xs font-medium truncate">{event.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
