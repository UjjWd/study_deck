import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Folder, 
  Tag, 
  BookOpen,
  Star,
  X,
  Download,
  AlertCircle
} from "lucide-react";
import PDFViewer from './PDFViewer';
import '@react-pdf-viewer/core/lib/styles/index.css';

// Initialize default layout plugin

interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
  isMarkedForRevision: boolean;
  folderId?: string;
  type: 'note' | 'pdf';
  pdfUrl?: string;
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface ViewFullModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  folders: Folder[];
}

// Simple PDF viewer component using iframe
const SimplePDFViewer: React.FC<{ fileUrl?: string }> = ({ fileUrl }) => {
  const [error, setError] = useState(false);
  
  if (!fileUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No PDF file available</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">Unable to display PDF</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Open in new tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full border-0 rounded-lg"
        title="PDF Viewer"
        onError={() => setError(true)}
      />
    </div>
  );
};

const ViewFullModal: React.FC<ViewFullModalProps> = ({
  isOpen,
  onClose,
  note,
  folders,
}) => {
  if (!note) return null;

  const folder = folders.find(f => f._id === note.folderId);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {note.type === 'pdf' ? (
                <FileText className="w-6 h-6 text-red-500" />
              ) : (
                <FileText className="w-6 h-6 text-blue-500" />
              )}
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {note.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {note.subject}
                  </Badge>
                  {note.isMarkedForRevision && (
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Marked for Revision
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="border-b pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Created: {formatDate(note.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Updated: {formatDate(note.updatedAt)}</span>
              </div>
              {folder && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Folder className="w-4 h-4" />
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                    <span>{folder.name}</span>
                  </div>
                </div>
              )}
              {note.tags.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-4 h-4" />
                  <span>{note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          {note.tags.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content Section */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              {note.type === 'pdf' ? (
                <>
                  <FileText className="w-4 h-4 text-red-500" />
                  PDF Content
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-blue-500" />
                  Note Content
                </>
              )}
            </h3>
            
            {note.type === 'pdf' ? (
              <div className="border rounded-lg p-4 bg-muted/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{note.title}</p>
                      <p className="text-muted-foreground mt-2">PDF Document</p>
                    </div>
                    {note.pdfUrl && (
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(note.pdfUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Open PDF
                      </Button>
                    )}
                  </div>
                  <div className="h-[600px]">
                    <SimplePDFViewer fileUrl={note.pdfUrl} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-background">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {note.content}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewFullModal;