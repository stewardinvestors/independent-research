"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommentSectionProps {
  reportId: string;
}

export function CommentSection({ reportId }: CommentSectionProps) {
  const { user, isAdmin } = useAuth();
  const { t } = useLang();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const useSupabase = isSupabaseConfigured();

  const storageKey = `flint-comments-${reportId}`;

  // ── Load comments ──
  const loadComments = useCallback(async () => {
    if (useSupabase) {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });
      if (data) {
        setComments(
          data.map((c) => ({
            id: c.id,
            userId: c.user_id,
            userName: c.user_name,
            userRole: c.user_role,
            text: c.text,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
          }))
        );
      }
    } else {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setComments(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [useSupabase, reportId, storageKey]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ── localStorage helper ──
  const saveLocal = (items: Comment[]) => {
    setComments(items);
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!user || !text.trim()) return;

    if (useSupabase) {
      const { error } = await supabase.from("comments").insert({
        report_id: reportId,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        text: text.trim(),
      });
      if (!error) {
        setText("");
        await loadComments();
      }
    } else {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        userId: user.id,
        userName: user.name,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      saveLocal([newComment, ...comments]);
      setText("");
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    if (useSupabase) {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (!error) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } else {
      saveLocal(comments.filter((c) => c.id !== id));
    }
  };

  // ── Edit ──
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;

    if (useSupabase) {
      const { error } = await supabase
        .from("comments")
        .update({ text: editText.trim(), updated_at: new Date().toISOString() })
        .eq("id", id);
      if (!error) {
        setEditingId(null);
        setEditText("");
        await loadComments();
      }
    } else {
      const updated = comments.map((c) =>
        c.id === id
          ? { ...c, text: editText.trim(), updatedAt: new Date().toISOString() }
          : c
      );
      saveLocal(updated);
      setEditingId(null);
      setEditText("");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t("방금 전", "Just now");
    if (diffMin < 60) return `${diffMin}${t("분 전", "m ago")}`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}${t("시간 전", "h ago")}`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}${t("일 전", "d ago")}`;
    return d.toLocaleDateString();
  };

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-[#EA580C]" />
        <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F5F4]">
          {t("댓글", "Comments")} {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {/* Write comment */}
      {user ? (
        <div className="mb-6 rounded-2xl border border-[#E5E7EB] dark:border-[#292524] bg-white dark:bg-[#1C1917] p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EA580C] text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t(
                  "이 리포트에 대한 의견을 남겨주세요...",
                  "Share your thoughts on this report..."
                )}
                className="w-full resize-none rounded-xl border border-[#E5E7EB] dark:border-[#292524] bg-transparent p-3 text-sm leading-relaxed text-[#1A1A1A] dark:text-[#F5F5F4] placeholder:text-[#A8A29E] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-[#A8A29E]">
                  Ctrl + Enter {t("로 전송", "to send")}
                </p>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="rounded-xl bg-[#1C1917] dark:bg-[#EA580C] text-white hover:bg-[#292524] disabled:opacity-40"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  {t("댓글 작성", "Post")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-[#292524] p-6 text-center">
          <p className="text-sm text-[#6B7280]">
            {t("댓글을 작성하려면 로그인해주세요.", "Please log in to leave a comment.")}
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] dark:border-[#292524] p-8 text-center">
          <MessageCircle className="mx-auto h-8 w-8 text-[#A8A29E]" />
          <p className="mt-2 text-sm text-[#6B7280]">
            {t("아직 댓글이 없습니다. 첫 댓글을 남겨보세요!", "No comments yet. Be the first to comment!")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-2xl border border-[#E5E7EB] dark:border-[#292524] bg-white dark:bg-[#1C1917] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#78716C] text-xs font-bold text-white">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A] dark:text-[#F5F5F4]">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-[#A8A29E]">{formatDate(comment.createdAt)}</span>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <span className="text-xs text-[#A8A29E]">
                      ({t("수정됨", "edited")})
                    </span>
                  )}
                </div>
                {user && (isAdmin || user.id === comment.userId) && editingId !== comment.id && (
                  <div className="flex items-center gap-1">
                    {user.id === comment.userId && (
                      <button
                        onClick={() => startEdit(comment)}
                        className="rounded-lg p-1 text-[#A8A29E] hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                        title={t("수정", "Edit")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="rounded-lg p-1 text-[#A8A29E] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      title={isAdmin && user.id !== comment.userId ? "Admin delete" : ""}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#E5E7EB] dark:border-[#292524] bg-transparent p-3 text-sm leading-relaxed text-[#1A1A1A] dark:text-[#F5F5F4] focus:border-[#EA580C] focus:outline-none focus:ring-1 focus:ring-[#EA580C]"
                    rows={3}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEdit(comment.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="rounded-xl text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      {t("취소", "Cancel")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editText.trim() || editText.trim() === comment.text}
                      className="rounded-xl bg-[#1C1917] dark:bg-[#EA580C] text-white hover:bg-[#292524] disabled:opacity-40 text-xs"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      {t("수정 완료", "Save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                  {comment.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
