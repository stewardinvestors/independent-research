"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  reportId: string;
}

export function CommentSection({ reportId }: CommentSectionProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  const storageKey = `flint-comments-${reportId}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setComments(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, [storageKey]);

  const save = (items: Comment[]) => {
    setComments(items);
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const handleSubmit = () => {
    if (!user || !text.trim()) return;
    const newComment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    save([newComment, ...comments]);
    setText("");
  };

  const handleDelete = (id: string) => {
    save(comments.filter((c) => c.id !== id));
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
                </div>
                {user && user.id === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded-lg p-1 text-[#A8A29E] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#78716C] dark:text-[#A8A29E]">
                {comment.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
