import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folder: Omit<Folder, '_id'>) => void;
  folders: Folder[];
}

const colorOptions = [
  { value: "bg-blue-500", label: "Blue", class: "bg-blue-500" },
  { value: "bg-green-500", label: "Green", class: "bg-green-500" },
  { value: "bg-purple-500", label: "Purple", class: "bg-purple-500" },
  { value: "bg-red-500", label: "Red", class: "bg-red-500" },
  { value: "bg-yellow-500", label: "Yellow", class: "bg-yellow-500" },
  { value: "bg-pink-500", label: "Pink", class: "bg-pink-500" },
  { value: "bg-indigo-500", label: "Indigo", class: "bg-indigo-500" },
  { value: "bg-orange-500", label: "Orange", class: "bg-orange-500" },
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  folders,
}) => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [color, setColor] = useState("bg-blue-500");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      color,
    });

    // Reset form
    setName("");
    setParentId("");
    setColor("bg-blue-500");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              required
            />
          </div>

          {/* <div>
            <Label htmlFor="parent">Parent Folder (Optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (root level)</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                      {folder.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    h-10 rounded-md border-2 transition-all
                    ${color === colorOption.value 
                      ? 'border-foreground ring-2 ring-ring' 
                      : 'border-border hover:border-foreground'
                    }
                    ${colorOption.class}
                  `}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Folder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;