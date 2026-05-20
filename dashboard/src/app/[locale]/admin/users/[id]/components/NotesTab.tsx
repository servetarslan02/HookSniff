'use client';

import { useToast } from '@/components/Toast';
import { LazySection, Skeletons } from '@/components/LazySection';
import type { NotesTabProps } from './types';
import { ClipboardList, FileText, Tag, X } from '@/components/icons';

export function NotesTab({
 userTags,
 userNotes,
 newTag,
 setNewTag,
 newNote,
 setNewNote,
 id,
 addTagMutation,
 removeTagMutation,
 addNoteMutation,
 t,
}: NotesTabProps) {
 const { toast } = useToast();

 return (
  <LazySection fallback={Skeletons.card} rootMargin={300}>
  <div className="space-y-6">
   <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><FileText size={16} strokeWidth={1.75} className="inline mr-1" /> {t("notesAndTags") || "Notes & Tags"}</h2>

   {/* Tags Section */}
   <div className="glass-card p-6">
    <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3 inline-flex items-center gap-1.5"><Tag size={14} strokeWidth={1.75} /> {t("tags") || "Tags"}</h3>
    <div className="flex flex-wrap gap-2 mb-4">
     {userTags.length > 0 ? userTags.map((tag) => (
      <span key={tag.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
       {tag.tag}
       <button
        onClick={async () => {
         try {
          await removeTagMutation.mutateAsync({ userId: id, tag: tag.tag });
          toast(t("tagRemoved") || "Tag removed", "success");
         } catch { toast(t("tagRemoveFailed") || "Failed", "error"); }
        }}
        className="ml-1 text-brand-500 hover:text-red-500 transition"
       ><X size={18} strokeWidth={1.75} /></button>
      </span>
     )) : <span className="text-xs text-gray-400 dark:text-slate-500">{t("noTags") || "No tags yet"}</span>}
    </div>
    <div className="flex gap-2">
     <input
      type="text"
      value={newTag}
      onChange={(e) => setNewTag(e.target.value)}
      placeholder={t("addTagPlaceholder") || "e.g. vip, at-risk, enterprise"}
      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
      onKeyDown={(e) => {
       if (e.key === 'Enter' && newTag.trim()) {
        addTagMutation.mutateAsync({ userId: id, tag: newTag.trim() })
         .then((res: any) => {
          setNewTag('');
          toast(res.message, "success");
         })
         .catch(() => toast(t("tagAddFailed") || "Failed", "error"));
       }
      }}
     />
     <button
      onClick={async () => {
       if (!newTag.trim()) return;
       try {
        const res = await addTagMutation.mutateAsync({ userId: id, tag: newTag.trim() });
        setNewTag('');
        toast(res.message, "success");
       } catch { toast(t("tagAddFailed") || "Failed", "error"); }
      }}
      className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
     >{t("addTag") || "Add Tag"}</button>
    </div>
   </div>

   {/* Notes Section */}
   <div className="glass-card p-6">
    <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3"><ClipboardList size={16} strokeWidth={1.75} className="inline mr-1" /> {t("notes") || "Notes"}</h3>
    <div className="space-y-3 mb-4">
     {userNotes.length > 0 ? userNotes.map((note) => (
      <div key={note.id} className="p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
       <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{note.content}</p>
       <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{new Date(note.created_at).toLocaleString()}</p>
      </div>
     )) : <p className="text-sm text-gray-400 dark:text-slate-500">{t("noNotes") || "No notes yet"}</p>}
    </div>
    <div className="space-y-2">
     <textarea
      value={newNote}
      onChange={(e) => setNewNote(e.target.value)}
      placeholder={t("addNotePlaceholder") || "Write a note about this customer..."}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
     />
     <button
      onClick={async () => {
       if (!newNote.trim()) return;
       try {
        await addNoteMutation.mutateAsync({ userId: id, content: newNote.trim() });
        setNewNote('');
        toast(t("noteAdded") || "Note added", "success");
       } catch { toast(t("noteAddFailed") || "Failed", "error"); }
      }}
      className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
     >{t("addNote") || "Add Note"}</button>
    </div>
   </div>
  </div>
  </LazySection>
 );
}
