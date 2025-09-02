
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type ClassManagerProps = {
  classes: string[];
  onAddClass: (c: string) => void;
  onDeleteClass: (c: string) => void;
};

export default function ClassManager({
  classes,
  onAddClass,
  onDeleteClass,
}: ClassManagerProps) {
  const [input, setInput] = useState("");
  return (
    <div className="mb-2">
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          const v = input.trim();
          if (v && !classes.includes(v)) {
            onAddClass(v);
            setInput("");
          }
        }}
      >
        <input
          className="border px-2 py-1 rounded"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a class (e.g., codeforces)"
          aria-label="Class name"
        />
        <Button type="submit" size="sm">Add</Button>
      </form>
      <div className="mt-1 flex flex-wrap gap-2">
        {classes.map(c => (
          <span className="bg-yellow-100 rounded px-2 py-0.5 flex items-center gap-1" key={c}>
            <span>{c}</span>
            <button
              aria-label={`Delete ${c}`}
              className="ml-1 text-red-500 text-xs"
              onClick={() => onDeleteClass(c)}
              type="button"
            >✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

