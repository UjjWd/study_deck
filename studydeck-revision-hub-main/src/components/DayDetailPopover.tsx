import React, { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AddMultipleTasksModal from "./AddMultipleTasksModal";

type DayType = "work" | "vacation" | "sickness";

interface DayDetailPopoverProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  anchor: React.ReactNode;
  date: Date;
  dayType: DayType;
  onDayTypeChange: (t: DayType) => void;
  events: string[];
  onAddEvent: (e: string) => void;
  onRemoveEvent: (i: number) => void;
}

const dayTypeColor: Record<DayType, string> = {
  work: "text-yellow-700",
  vacation: "text-gray-700",
  sickness: "text-red-700",
};

const dayTypeLabel: Record<DayType, string> = {
  work: "Work Day",
  vacation: "Vacation Day",
  sickness: "Sickness Day",
};

export default function DayDetailPopover(props: DayDetailPopoverProps) {
  const {
    open,
    onOpenChange,
    anchor,
    date,
    dayType,
    onDayTypeChange,
    events,
    onAddEvent,
    onRemoveEvent,
  } = props;
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Add helper for adding many events at once
  const handleAddTasks = (tasks: string[]) => {
    tasks.forEach(props.onAddEvent);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{anchor}</PopoverTrigger>
      <PopoverContent className="w-[320px] z-50" align="start">
        <div className="mb-2">
          <div className="font-bold text-lg">
            {date.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        {/* Day type selector */}
        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-1">Select Day Type</div>
          <RadioGroup
            value={dayType}
            onValueChange={(val) => onDayTypeChange(val as DayType)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="work" id="r-work" />
              <label htmlFor="r-work" className="text-yellow-700 cursor-pointer">Work</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="vacation" id="r-vacation" />
              <label htmlFor="r-vacation" className="text-gray-700 cursor-pointer">Vacation</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="sickness" id="r-sickness" />
              <label htmlFor="r-sickness" className="text-red-700 cursor-pointer">Sickness</label>
            </div>
          </RadioGroup>
        </div>
        {/* Event add */}
        <div className="mb-3">
          <div className="flex items-center mb-1 justify-between">
            <div className="text-xs text-muted-foreground">Important Events</div>
            <AddMultipleTasksModal onAddTasks={handleAddTasks} />
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded p-1 text-sm"
              placeholder="Type an event..."
              onKeyDown={e => {
                if (e.key === "Enter" && input.trim()) {
                  onAddEvent(input.trim());
                  setInput("");
                  setTimeout(() => inputRef.current?.focus(), 1);
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (input.trim()) {
                  onAddEvent(input.trim());
                  setInput("");
                  setTimeout(() => inputRef.current?.focus(), 1);
                }
              }}
              size="sm"
              className="px-3 h-full"
            >Add</Button>
          </div>
          <ul className="mt-2 space-y-1">
            {events.length === 0 && <li className="text-muted-foreground text-xs italic">No events added</li>}
            {events.map((e, i) =>
              <li key={i} className="flex justify-between items-center text-sm bg-muted rounded px-2 py-1">
                <span>{e}</span>
                <button
                  onClick={() => onRemoveEvent(i)}
                  className="text-xs ml-2 text-destructive hover:underline"
                  type="button"
                  aria-label="Remove"
                  title="Remove"
                >Remove</button>
              </li>
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
