import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Loader2, Pencil, X, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface StudentNotesProps {
  studentId: string;
}

const StudentNotes = ({ studentId }: StudentNotesProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const queryKey = ["counselor-notes", studentId];

  const { data: notes = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("counselor_notes")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId && !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("counselor_notes").insert({
        student_id: studentId,
        counselor_id: user!.id,
        content: content.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setNewNote("");
      setIsAdding(false);
      toast.success("Note saved");
    },
    onError: () => toast.error("Failed to save note"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("counselor_notes")
        .update({ content: content.trim() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update note"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("counselor_notes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });

  const handleSubmit = () => {
    if (!newNote.trim()) return;
    addMutation.mutate(newNote);
  };

  const handleUpdate = () => {
    if (!editContent.trim() || !editingId) return;
    updateMutation.mutate({ id: editingId, content: editContent });
  };

  return (
    <div className="card-warm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          Private Notes
        </h2>
        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Note
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 space-y-2">
          <Textarea
            placeholder="Write your observation..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            maxLength={2000}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newNote.trim() || addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Save
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No notes yet. Click "Add Note" to start.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-muted/50 group"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdate}
                      disabled={!editContent.trim() || updateMutation.isPending}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                      {note.updated_at !== note.created_at && " (edited)"}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(note.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentNotes;
