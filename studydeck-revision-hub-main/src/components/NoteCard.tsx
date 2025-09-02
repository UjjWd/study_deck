import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  Calendar,
  FileText,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

interface Folder {
  _id: string;
  name: string;
  parentId?: string;
  color: string;
}

interface NoteCardProps {
  note: Note;
  folders: Folder[];
  viewMode: "grid" | "list";
  onEdit: (_id: string, noteData: Partial<Note>) => void;
  onDelete: (_id: string) => void;
  onToggleRevision: (_id: string) => void;
  onViewFull: (_id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  folders,
  viewMode,
  onEdit,
  onDelete,
  onToggleRevision,
  onViewFull,
}) => {
  const folder = folders.find(f => f._id === note.folderId);
  
  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-shrink-0">
                {note.type === 'pdf' ? (
                  <FileText className="w-8 h-8 text-red-500" />
                ) : (
                  <FileText className="w-8 h-8 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{note.title}</h3>
                  {note.isMarkedForRevision && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {truncateContent(note.content, 100)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {folder && (
                    <Badge variant="outline" className="text-xs">
                      <div className={`w-2 h-2 rounded-full ${folder.color} mr-1`} />
                      {folder.name}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">{note.subject}</Badge>
                  {note.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {note.updatedAt}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewFull(note._id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    {note.type === 'pdf' ? 'View Full PDF' : 'View Full Note'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(note._id, {})}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleRevision(note._id)}>
                    {note.isMarkedForRevision ? (
                      <>
                        <StarOff className="w-4 h-4 mr-2" />
                        Remove from Revision
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Mark for Revision
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(note._id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {note.type === 'pdf' ? (
              <FileText className="w-5 h-5 text-red-500" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500" />
            )}
            <CardTitle className="text-sm font-medium">{note.title}</CardTitle>
            {note.isMarkedForRevision && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewFull(note._id)}>
                <Eye className="w-4 h-4 mr-2" />
                {note.type === 'pdf' ? 'View Full PDF' : 'View Full Note'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(note._id, {})}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleRevision(note._id)}>
                {note.isMarkedForRevision ? (
                  <>
                    <StarOff className="w-4 h-4 mr-2" />
                    Remove from Revision
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Mark for Revision
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(note._id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {folder && (
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${folder.color}`} />
            <span className="text-xs text-muted-foreground">{folder.name}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {truncateContent(note.content, 120)}
        </p>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">{note.subject}</Badge>
            {note.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
            {note.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">+{note.tags.length - 2}</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {note.updatedAt}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteCard;