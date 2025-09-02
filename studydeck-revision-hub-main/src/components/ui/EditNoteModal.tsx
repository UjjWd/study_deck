import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Note {
  title: string;
  content: string;
  tags: string[];
  subject: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: 'note' | 'pdf';
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  note: Note | null;
  folders: Folder[];
  subjects: string[];
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  note,
  folders,
  subjects,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [subject, setSubject] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isMarkedForRevision, setIsMarkedForRevision] = useState(false);
  const [folderId, setFolderId] = useState<string>("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Populate form with existing note data when modal opens
  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
      setSubject(note.subject || "");
      setIsMarkedForRevision(note.isMarkedForRevision || false);
      setFolderId(note.folderId || "none");
      setNewSubject("");
      setErrors({});
    }
  }, [note, isOpen]);

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (note.type === 'note' && !content.trim()) {
      newErrors.content = "Content is required";
    }
    
    if (!subject) {
      newErrors.subject = "Please select a subject";
    }
    
    if (subject === "new" && !newSubject.trim()) {
      newErrors.newSubject = "Please enter a new subject name";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const finalSubject = subject === "new" ? newSubject.trim() : subject;
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      tags,
      subject: finalSubject,
      isMarkedForRevision,
      folderId: folderId === "none" ? undefined : folderId || undefined,
      type: note?.type || 'note'
    });

    onClose();
  };

  const handleClose = () => {
    // Reset form to original values when canceling
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags(note.tags || []);
      setSubject(note.subject || "");
      setIsMarkedForRevision(note.isMarkedForRevision || false);
      setFolderId(note.folderId || "none");
      setNewSubject("");
      setErrors({});
    }
    onClose();
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors({...errors, title: ""});
                }
              }}
              placeholder="Enter note title..."
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {note.type === 'note' && (
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors({...errors, content: ""});
                  }
                }}
                placeholder="Enter note content..."
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={subject} 
                onValueChange={(value) => {
                  setSubject(value);
                  if (errors.subject) {
                    setErrors({...errors, subject: ""});
                  }
                }}
              >
                <SelectTrigger className={errors.subject ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subj => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                  <SelectItem value="new">+ Create New Subject</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
              )}
              
              {subject === "new" && (
                <div className="mt-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => {
                      setNewSubject(e.target.value);
                      if (errors.newSubject) {
                        setErrors({...errors, newSubject: ""});
                      }
                    }}
                    placeholder="Enter new subject..."
                    className={errors.newSubject ? "border-red-500" : ""}
                  />
                  {errors.newSubject && (
                    <p className="text-red-500 text-sm mt-1">{errors.newSubject}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No folder</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder._id} value={folder._id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
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



          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="revision"
              checked={isMarkedForRevision}
              onChange={(e) => setIsMarkedForRevision(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="revision">Mark for revision queue</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || (note.type === 'note' && !content.trim()) || !subject || (subject === "new" && !newSubject.trim())}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteModal;