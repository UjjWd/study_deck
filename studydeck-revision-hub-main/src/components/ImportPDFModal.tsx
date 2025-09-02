import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, File, X, Plus } from "lucide-react";

interface ImportData {
  title: string;
  subject: string;
  tags: string[];
  folderId?: string;
  pdfUrl?: string;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface ImportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportData, file: File | null) => void;
  folders: Folder[];
  subjects: string[];
}

const ImportPDFModal: React.FC<ImportPDFModalProps> = ({
  isOpen,
  onClose,
  onImport,
  folders = [],
  subjects = [],
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace('.pdf', ''));
      }
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = () => {
    // Validation: Check if required fields are filled
    if (!selectedFile || !title.trim()) {
      alert("Please select a PDF file and enter a title");
      return;
    }
    
    // Check if subject is selected
    if (!subject) {
      alert("Please select a subject");
      return;
    }
    
    // If "new" subject is selected, check if new subject name is provided
    if (subject === "new" && !newSubject.trim()) {
      alert("Please enter a new subject name");
      return;
    }

    const finalSubject = subject === "new" ? newSubject.trim() : subject;
    onImport({
      title: title.trim(),
      subject: finalSubject,
      tags,
      folderId: folderId || undefined
    }, selectedFile);
    onClose();
  };

  // Check if form is valid for submit button state
  const isFormValid = selectedFile && 
                     title.trim() && 
                     subject && 
                     (subject !== "new" || newSubject.trim());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import PDF</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Select PDF File *</Label>
            <div className="mt-2">
              {selectedFile ? (
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                  <File className="w-5 h-5 text-red-500" />
                  <span className="flex-1 truncate">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a PDF file or drag and drop
                  </p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter PDF title..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject || ''} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects && subjects.length > 0 ? (
                    subjects.map(subj => (
                      <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                  )}
                  <SelectItem value="new">+ Create New Subject</SelectItem>
                </SelectContent>
              </Select>
              
              {subject === "new" && (
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Enter new subject..."
                  className="mt-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select value={folderId || ''} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders && folders.length > 0 ? (
                    folders.map(folder => (
                      <SelectItem key={folder._id} value={folder._id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                          {folder.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-folders" disabled>No folders available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tag and press Enter..."
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Import PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportPDFModal;