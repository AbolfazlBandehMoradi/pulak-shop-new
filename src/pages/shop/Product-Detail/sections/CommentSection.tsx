import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import {
  Send,
  Reply,
  Edit2,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/i18n/useTranslation";
import {
  getComments,
  createComment,
  replyToComment,
  updateComment,
  deleteComment,
  type Comment,
  type CommentResourceType,
} from "@/utils/commentApi";
import { cn } from "@/utils/cn";
import { useToast } from "@/context/ToastContext";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface CommentSectionProps {
  resourceType: CommentResourceType;
  resourceId: number;
  languageCode?: string;
  className?: string;
}

export function CommentSection({
  resourceType,
  resourceId,
  languageCode,
  className,
}: CommentSectionProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useLocalizedNavigate();
  const localizedPath = useLocalizedPath();
  const location = useLocation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );

  // Helper to handle auth errors and redirect to login
  const handleAuthError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "";
    if (
      errorMessage === "AUTH_EXPIRED" ||
      (error instanceof Error &&
        (error as Error & { status?: number }).status === 401)
    ) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      showError(
        t("comment.error.sessionExpired") ||
        "Session expired. Please login again.",
        5000
      );
      setTimeout(() => {
        navigate(`/auth?redirect=${returnUrl}`);
      }, 1500);
      return true;
    }
    return false;
  };

  useEffect(() => {
    loadComments();
  }, [resourceId, resourceType, languageCode]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await getComments({
        resourceType,
        resourceId,
        pageNumber: 1,
        pageSize: 100,
        langCode: languageCode,
      });
      setComments(response.comments);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await createComment(
        {
          content: newComment.trim(),
          resourceId,
          resourceType,
        },
        languageCode
      );
      setNewComment("");
      showSuccess(
        t("comment.success.create") || "Comment added successfully",
        3000
      );
      await loadComments();
    } catch (error) {
      console.error("Failed to create comment:", error);
      if (!handleAuthError(error)) {
        showError(
          t("comment.error.create") || "Failed to create comment",
          5000
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await replyToComment(
        parentId,
        {
          content: replyContent.trim(),
          resourceId,
          resourceType,
        },
        languageCode
      );
      setReplyContent("");
      setReplyingTo(null);
      showSuccess(
        t("comment.success.reply") || "Reply added successfully",
        3000
      );
      await loadComments();
      // Expand replies for this comment
      setExpandedReplies((prev) => new Set(prev).add(parentId));
    } catch (error) {
      console.error("Failed to reply:", error);
      if (!handleAuthError(error)) {
        showError(t("comment.error.reply") || "Failed to reply", 5000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await updateComment(
        commentId,
        { content: editContent.trim() },
        languageCode
      );
      setEditingId(null);
      setEditContent("");
      showSuccess(
        t("comment.success.update") || "Comment updated successfully",
        3000
      );
      await loadComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      if (!handleAuthError(error)) {
        showError(
          t("comment.error.update") || "Failed to update comment",
          5000
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const confirmMessage =
      t("comment.confirm.delete") ||
      "Are you sure you want to delete this comment?";
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteComment(commentId, languageCode);
      showSuccess(
        t("comment.success.delete") || "Comment deleted successfully",
        3000
      );
      await loadComments();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      if (!handleAuthError(error)) {
        showError(
          t("comment.error.delete") || "Failed to delete comment",
          5000
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("comment.justNow") || "Just now";
    if (diffMins < 60)
      return `${diffMins} ${t("comment.minutesAgo") || "minutes ago"}`;
    if (diffHours < 24)
      return `${diffHours} ${t("comment.hoursAgo") || "hours ago"}`;
    if (diffDays < 7)
      return `${diffDays} ${t("comment.daysAgo") || "days ago"}`;
    return date.toLocaleDateString();
  };

  // Check if user can edit or delete a comment
  // Super admin can edit/delete any comment
  // Regular users can only edit/delete their own comments
  const canEditOrDelete = (comment: Comment): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    // Super admin (role ID 1) can edit/delete any comment
    const isSuperAdmin = user.roleIds?.includes(1) ?? false;
    if (isSuperAdmin) {
      return true;
    }

    // Regular users can only edit/delete their own comments
    return comment.authorId === user.id;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {comments.length > 0 && (
        <div className="flex items-center gap-1">
          <ChatBubbleLeftRightIcon className="h-5 w-5 first-text-color-svg transition" />
          <h3 className="first-text-color font-s-bold">
            {t("comment.title") || "Comments"} ({comments.length})
          </h3>
        </div>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="bg-card p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-2">
          <Input
            placeholder={t("comment.placeholder") || "Write a comment..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleSubmitComment();
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-muted-foreground px-3 py-2"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="icon"
              className="bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("comment.hint") || "Press Ctrl + Enter to submit"}
          </p>
        </div>
      ) : (
        <a href={localizedPath("/auth")} className=" flex gap-2 flex-col first-text-color-red relative p-6 rounded-lg  text-center">
          <div className="absolute inset-0 rounded-lg border border-dashed border-gray-500 pointer-events-none"></div>
          <ChatBubbleLeftRightIcon className="h-8 w-8 first-text-color-svg mx-auto transition" />
          <p className="first-text-color-for-paragraph ">
            {t("comment.loginRequired")}
          </p>
        </a>
      )
      }

      {/* Comments List */}
      {
        loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className=" flex gap-2 flex-col  relative p-6 rounded-lg  text-center">
            <div className="absolute inset-0 rounded-lg border border-dashed border-gray-500 pointer-events-none"></div>
            <ChatBubbleLeftRightIcon className="h-8 w-8 first-text-color-svg mx-auto transition" />
            <p className="first-text-color-for-paragraph ">
              {t("comment.noComments") ||
                "No comments yet. Be the first to comment!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                level={0}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyChange={setReplyContent}
                onReplyStart={() => setReplyingTo(comment.id)}
                onReplySubmit={() => handleReply(comment.id)}
                onReplyCancel={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
                editingId={editingId}
                editContent={editContent}
                onEditChange={setEditContent}
                onEditStart={() => {
                  setEditingId(comment.id);
                  setEditContent(comment.content);
                }}
                onEditSubmit={() => handleEdit(comment.id)}
                onEditCancel={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
                onDelete={() => handleDelete(comment.id)}
                onToggleReplies={() => toggleReplies(comment.id)}
                expandedReplies={expandedReplies}
                checkCanEditOrDelete={canEditOrDelete}
                isAuthenticated={isAuthenticated}
                submitting={submitting}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        )
      }
    </div >
  );
}

interface CommentItemProps {
  comment: Comment;
  level: number;
  replyingTo: number | null;
  replyContent: string;
  onReplyChange: (value: string) => void;
  onReplyStart: () => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
  editingId: number | null;
  editContent: string;
  onEditChange: (value: string) => void;
  onEditStart: () => void;
  onEditSubmit: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onToggleReplies: () => void;
  expandedReplies: Set<number>;
  checkCanEditOrDelete: (comment: Comment) => boolean;
  isAuthenticated: boolean;
  submitting: boolean;
  formatDate: (date: string) => string;
  t: (key: string) => string;
}

function CommentItem({
  comment,
  level,
  replyingTo,
  replyContent,
  onReplyChange,
  onReplyStart,
  onReplySubmit,
  onReplyCancel,
  editingId,
  editContent,
  onEditChange,
  onEditStart,
  onEditSubmit,
  onEditCancel,
  onDelete,
  onToggleReplies,
  expandedReplies,
  checkCanEditOrDelete,
  isAuthenticated,
  submitting,
  formatDate,
  t,
}: CommentItemProps) {
  const isExpanded = expandedReplies.has(comment.id);
  const isReplying = replyingTo === comment.id;
  const isEditing = editingId === comment.id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canEditOrDelete = checkCanEditOrDelete(comment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border bg-card p-4",
        level > 0 && "ml-8 border-l-2 border-l-primary/20"
      )}
    >
      {/* Comment Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {comment.authorAvatar?.filePath ? (
            <img
              src={
                comment.authorAvatar.filePath.startsWith("http://") ||
                  comment.authorAvatar.filePath.startsWith("https://")
                  ? comment.authorAvatar.filePath
                  : `${import.meta.env.VITE_API_BASE_URL ||
                  "http://localhost:5299"
                  }${comment.authorAvatar.filePath}`
              }
              alt={comment.authorName}
              className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-border"
              onError={(e) => {
                // Hide image and show fallback initial
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={cn(
              "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0",
              comment.authorAvatar?.filePath && "hidden"
            )}
          >
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">
              {comment.authorName}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </div>
          </div>
        </div>
        {canEditOrDelete && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                if (isEditing) {
                  onEditCancel();
                } else {
                  onEditStart();
                }
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <Input
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onEditSubmit}
              disabled={!editContent.trim() || submitting}
            >
              {t("comment.save") || "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onEditCancel}
              disabled={submitting}
            >
              {t("comment.cancel") || "Cancel"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
          {comment.content}
        </p>
      )}

      {/* Comment Actions */}
      {!isEditing && (
        <div className="flex items-center gap-4 text-xs">
          {isAuthenticated && (
            <button
              onClick={() => {
                if (isReplying) {
                  onReplyCancel();
                } else {
                  onReplyStart();
                }
              }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              {t("comment.reply") || "Reply"}
            </button>
          )}
          {hasReplies && (
            <button
              onClick={onToggleReplies}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded
                ? `${t("comment.hideReplies") || "Hide replies"} (${comment.replies.length
                })`
                : `${t("comment.showReplies") || "Show replies"} (${comment.replies.length
                })`}
            </button>
          )}
        </div>
      )}

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            <Input
              placeholder={t("comment.replyPlaceholder") || "Write a reply..."}
              value={replyContent}
              onChange={(e) => onReplyChange(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onReplySubmit}
                disabled={!replyContent.trim() || submitting}
              >
                {t("comment.submit") || "Submit"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReplyCancel}
                disabled={submitting}
              >
                {t("comment.cancel") || "Cancel"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      <AnimatePresence>
        {hasReplies && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                level={level + 1}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyChange={onReplyChange}
                onReplyStart={onReplyStart}
                onReplySubmit={onReplySubmit}
                onReplyCancel={onReplyCancel}
                editingId={editingId}
                editContent={editContent}
                onEditChange={onEditChange}
                onEditStart={onEditStart}
                onEditSubmit={onEditSubmit}
                onEditCancel={onEditCancel}
                onDelete={onDelete}
                onToggleReplies={() => { }}
                expandedReplies={expandedReplies}
                checkCanEditOrDelete={checkCanEditOrDelete}
                isAuthenticated={isAuthenticated}
                submitting={submitting}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
