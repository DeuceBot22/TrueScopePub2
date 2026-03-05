import React from 'react';
import { useStore, ViewMode } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Search, Shield, ShieldAlert, LayoutTemplate, Activity } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateEntityDialog, CreateClaimDialog } from './CreateModals';

export function Navbar() {
  const { viewMode, setViewMode, graphLayout, setGraphLayout } = useStore();

  return (
    <div className="h-14 glass border-b flex items-center justify-between px-4 z-50 relative" data-testid="navbar">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-wide hidden md:inline">TrueScope</span>
        </div>
        
        <div className="h-6 w-px bg-border/50 mx-2 hidden md:block" />

        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as ViewMode)} className="bg-background/50 rounded-md p-1 border border-border/50">
          <ToggleGroupItem value="Discovery" aria-label="Discovery Mode" className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" data-testid="toggle-mode-discovery">
            <Search className="w-3 h-3 md:mr-2" /> <span className="hidden md:inline">Discovery</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="Verification" aria-label="Verification Mode" className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-emerald-500 data-[state=on]:text-white" data-testid="toggle-mode-verification">
            <Shield className="w-3 h-3 md:mr-2" /> <span className="hidden md:inline">Verification</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="Disputed" aria-label="Disputed Mode" className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground" data-testid="toggle-mode-disputed">
            <ShieldAlert className="w-3 h-3 md:mr-2" /> <span className="hidden md:inline">Disputed</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 border-border/50 bg-background/50"
              onClick={() => setGraphLayout(graphLayout === 'Force' ? 'Radial' : 'Force')}
              data-testid="button-toggle-layout"
            >
              <LayoutTemplate className="w-4 h-4 mr-2 hidden md:block" />
              {graphLayout}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Graph Layout (Force / Radial)</TooltipContent>
        </Tooltip>

        <CreateClaimDialog />
        <CreateEntityDialog />
      </div>
    </div>
  );
}
