import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const AddNoteModal = ({ isOpen, onClose, onAdd, folders, subjects }) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    console.log("Form submitted with:", { title, subject, description });
    
    if (!title.trim() || !subject.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    onAdd({ 
      title: title.trim(), 
      subject: subject.trim(), 
      description: description.trim() 
    });
    
    // Reset form
    setTitle("");
    setSubject("");
    setDescription("");
    onClose();
  };

  const handleCancel = () => {
    setTitle("");
    setSubject("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
          <DialogDescription>
            Create a new note by filling out the form below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input 
            placeholder="Enter note title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          
          <Input 
            placeholder="Enter subject" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
          />
          
          <Textarea 
            placeholder="Enter description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal;