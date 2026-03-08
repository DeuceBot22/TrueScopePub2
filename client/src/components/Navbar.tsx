import React from 'react';
import { useStore, ViewMode } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Search,
  Shield,
  ShieldAlert,
  LayoutTemplate,
  Menu,
  PlusCircle,
  Network,
  Settings,
  Download,
  Upload
} from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  CreateEntityDialog,
  CreateClaimDialog,
  CreateEventDialog
} from './CreateModals';

export function Navbar() {

  const { viewMode, setViewMode, graphLayout, setGraphLayout } = useStore();

  return (
    <div
      className="h-14 glass border-b flex items-center justify-between px-4 z-50 relative"
      data-testid="navbar"
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        {/* LOGO + TITLE */}
        <div className="flex items-center gap-2">

          <img
            src="/favicon.png"
            alt="TrueScope"
            className="w-7 h-7"
          />

          <span className="font-semibold tracking-wide hidden md:inline">
            TrueScope
          </span>

        </div>


        {/* HAMBURGER MENU */}
        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-border/50 bg-background/50"
              data-testid="button-hamburger-menu"
            >

              <Menu className="w-4 h-4" />

            </Button>

          </DropdownMenuTrigger>


          <DropdownMenuContent align="start" className="w-64">

            <DropdownMenuLabel>
              Workspace Actions
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Evidence
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <Network className="w-4 h-4 mr-2" />
              Saved Views
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </DropdownMenuItem>

            <DropdownMenuItem disabled>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem disabled>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>


        {/* DIVIDER */}
        <div className="h-6 w-px bg-border/50 mx-1 hidden md:block" />


        {/* MODE SWITCH */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as ViewMode)}
          className="bg-background/50 rounded-md p-1 border border-border/50"
        >

          <ToggleGroupItem
            value="Discovery"
            aria-label="Discovery Mode"
            className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            data-testid="toggle-mode-discovery"
          >

            <Search className="w-3 h-3 md:mr-2" />

            <span className="hidden md:inline">
              Discovery
            </span>

          </ToggleGroupItem>


          <ToggleGroupItem
            value="Verification"
            aria-label="Verification Mode"
            className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
            data-testid="toggle-mode-verification"
          >

            <Shield className="w-3 h-3 md:mr-2" />

            <span className="hidden md:inline">
              Verification
            </span>

          </ToggleGroupItem>


          <ToggleGroupItem
            value="Disputed"
            aria-label="Disputed Mode"
            className="text-xs px-2 md:px-3 h-7 data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground"
            data-testid="toggle-mode-disputed"
          >

            <ShieldAlert className="w-3 h-3 md:mr-2" />

            <span className="hidden md:inline">
              Disputed
            </span>

          </ToggleGroupItem>

        </ToggleGroup>

      </div>


      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* LAYOUT TOGGLE */}
        <Tooltip>

          <TooltipTrigger asChild>

            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border/50 bg-background/50"
              onClick={() =>
                setGraphLayout(
                  graphLayout === 'Force' ? 'Radial' : 'Force'
                )
              }
              data-testid="button-toggle-layout"
            >

              <LayoutTemplate className="w-4 h-4 mr-2 hidden md:block" />

              {graphLayout}

            </Button>

          </TooltipTrigger>

          <TooltipContent>
            Toggle Graph Layout (Force / Radial)
          </TooltipContent>

        </Tooltip>


        {/* CREATE BUTTONS */}
        <CreateEventDialog />

        <CreateClaimDialog />

        <CreateEntityDialog />

      </div>

    </div>
  );
}
