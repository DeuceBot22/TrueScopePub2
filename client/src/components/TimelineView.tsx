import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { useStore } from '@/lib/store';
import { format, startOfYear, endOfYear } from 'date-fns';
import { Calendar } from 'lucide-react';

export function TimelineView() {
  const { events, timeWindowStart, timeWindowEnd, setTimeWindow, selectEvent, selectedEventId } = useStore();
  
  // Dynamic bounds based on actual data, with a generous default range
  const minTime = new Date('1920-01-01').getTime();
  const maxTime = new Date('2030-12-31').getTime();

  const handleSliderChange = (value: number[]) => {
    setTimeWindow(value[0], value[1]);
  };

  return (
    <div className="glass-panel p-4 rounded-lg w-full flex flex-col gap-4" data-testid="panel-timeline">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Investigation Timeline</h3>
        </div>
        <div className="flex gap-4 text-xs font-mono bg-background/50 px-3 py-1 rounded-full border border-border/50">
          <span className="text-primary">{timeWindowStart ? format(timeWindowStart, 'MMM yyyy') : 'Start'}</span>
          <span className="opacity-30">/</span>
          <span className="text-primary">{timeWindowEnd ? format(timeWindowEnd, 'MMM yyyy') : 'End'}</span>
        </div>
      </div>

      <div className="px-2 pt-2">
        <Slider
          defaultValue={[timeWindowStart || minTime, timeWindowEnd || maxTime]}
          min={minTime}
          max={maxTime}
          step={1000 * 60 * 60 * 24 * 30} // 1 month steps
          onValueChange={handleSliderChange}
          className="my-4"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
          <span>1920</span>
          <span>1950</span>
          <span>1980</span>
          <span>2010</span>
          <span>2030</span>
        </div>
      </div>

      {/* Mini Event Track */}
      <div className="h-16 w-full relative border-t border-border/30 mt-2 pt-3 flex items-center overflow-x-auto gap-3 no-scrollbar">
        {events.length === 0 ? (
          <div className="text-[10px] text-muted-foreground italic px-2">No events recorded.</div>
        ) : (
          events.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()).map(event => {
            const eventTime = new Date(event.dateStart).getTime();
            const isSelected = selectedEventId === event.id;
            const isInWindow = !timeWindowStart || !timeWindowEnd || (eventTime >= timeWindowStart && eventTime <= timeWindowEnd);
            
            return (
              <button
                key={event.id}
                onClick={() => selectEvent(event.id)}
                className={`flex-shrink-0 text-left p-2.5 rounded-md border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                    : 'bg-secondary/20 border-border/50 hover:border-primary/50'
                } ${!isInWindow ? 'opacity-20 grayscale scale-95' : 'opacity-100'}`}
                style={{ minWidth: '160px' }}
              >
                <div className="text-[9px] text-primary/70 font-mono font-bold">{format(eventTime, 'MMM dd, yyyy')}</div>
                <div className="text-xs font-medium truncate mt-0.5">{event.title}</div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
