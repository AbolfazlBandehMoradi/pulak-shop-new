import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Reply, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import {
  getComments,
  createComment,
  replyToComment,
  updateComment,
  deleteComment,
  type Comment,
  type CommentResourceType,
} from '@/utils/commentApi';
import { cn } from '@/utils/cn';
import { useToast } from '@/context/ToastContext';
import { useLocalizedNavigate } from '@/hooks/useLocalizedNavigate';
import { useLocalizedPath } from '@/hooks/useLocalizedPath';

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
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const handleAuthError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : '';
    if (
      errorMessage === 'AUTH_EXPIRED' ||
      (error instanceof Error && (error as Error & { status?: number }).status === 401)
    ) {
      const returnUrl = encodeURIComponent(location.pathname + location.search);
      showError(t('comment.error.sessionExpired') || 'Session expired. Please login again.', 5000);
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
      console.error('Failed to load comments:', error);
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
        languageCode,
      );
      setNewComment('');
      showSuccess(t('comment.success.create') || 'Comment added successfully', 3000);
      await loadComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
      if (!handleAuthError(error)) {
        showError(t('comment.error.create') || 'Failed to create comment', 5000);
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
        languageCode,
      );
      setReplyContent('');
      setReplyingTo(null);
      showSuccess(t('comment.success.reply') || 'Reply added successfully', 3000);
      await loadComments();
      setExpandedReplies((prev) => new Set(prev).add(parentId));
    } catch (error) {
      console.error('Failed to reply:', error);
      if (!handleAuthError(error)) {
        showError(t('comment.error.reply') || 'Failed to reply', 5000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await updateComment(commentId, { content: editContent.trim() }, languageCode);
      setEditingId(null);
      setEditContent('');
      showSuccess(t('comment.success.update') || 'Comment updated successfully', 3000);
      await loadComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
      if (!handleAuthError(error)) {
        showError(t('comment.error.update') || 'Failed to update comment', 5000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const confirmMessage =
      t('comment.confirm.delete') || 'Are you sure you want to delete this comment?';
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteComment(commentId, languageCode);
      showSuccess(t('comment.success.delete') || 'Comment deleted successfully', 3000);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      if (!handleAuthError(error)) {
        showError(t('comment.error.delete') || 'Failed to delete comment', 5000);
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

    if (diffMins < 1) return t('comment.justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins} ${t('comment.minutesAgo') || 'minutes ago'}`;
    if (diffHours < 24) return `${diffHours} ${t('comment.hoursAgo') || 'hours ago'}`;
    if (diffDays < 7) return `${diffDays} ${t('comment.daysAgo') || 'days ago'}`;
    return date.toLocaleDateString();
  };

  const canEditOrDelete = (comment: Comment): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const isSuperAdmin = user.roleIds?.includes(1) ?? false;
    if (isSuperAdmin) {
      return true;
    }

    return comment.authorId === user.id;
  };

  return (
    <div
      className={cn(
        'space-y-5 rounded-2xl border border-gray-200/70 bg-color-for-layer-sec p-4 sm:p-6 dark:border-gray-700/70',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-color-for-layer-on-body first-text-color-svg">
            <MessageSquare className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-s-bold first-text-color">{t('comment.title') || 'Comments'}</h3>
            <p className="text-sm first-text-color-for-paragraph-low">
              {comments.length} {t('comment.title') || 'Comments'}
            </p>
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="space-y-3 rounded-xl border border-gray-200/80 bg-color-for-layer-on-body p-4 dark:border-gray-700">
          <textarea
            placeholder={t('comment.placeholder') || 'Write a comment...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmitComment();
            }}
            rows={3}
            className="min-h-24 w-full resize-y rounded-lg border border-gray-300 bg-color-for-layer-sec px-3 py-2 text-sm first-text-color-for-paragraph placeholder:first-text-color-for-paragraph-low focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-first dark:border-gray-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs first-text-color-for-paragraph-low">
              {t('comment.hint') || 'Press Ctrl + Enter to submit'}
            </p>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="h-10 gap-2 rounded-lg bg-first px-4 text-white hover:bg-first-600"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t('comment.submit') || 'Submit'}
            </Button>
          </div>
        </div>
      ) : (
        <a
          href={localizedPath('/auth')}
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-400/80 bg-color-for-layer-on-body p-6 text-center transition hover:border-first"
        >
          <MessageSquare className="h-8 w-8 first-text-color-svg transition" />
          <p className="first-text-color-for-paragraph">
            {t('comment.loginRequired') || 'Please log in to leave a comment'}
          </p>
        </a>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl bg-color-for-layer-on-body p-4">
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
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-400/80 bg-color-for-layer-on-body p-8 text-center">
          <MessageSquare className="h-10 w-10 first-text-color-svg transition" />
          <p className="first-text-color-for-paragraph">
            {t('comment.noComments') || 'No comments yet. Be the first to comment!'}
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
              onReplyStart={setReplyingTo}
              onReplySubmit={handleReply}
              onReplyCancel={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
              editingId={editingId}
              editContent={editContent}
              onEditChange={setEditContent}
              onEditStart={(targetComment) => {
                setEditingId(targetComment.id);
                setEditContent(targetComment.content);
              }}
              onEditSubmit={handleEdit}
              onEditCancel={() => {
                setEditingId(null);
                setEditContent('');
              }}
              onDelete={handleDelete}
              onToggleReplies={toggleReplies}
              expandedReplies={expandedReplies}
              checkCanEditOrDelete={canEditOrDelete}
              isAuthenticated={isAuthenticated}
              submitting={submitting}
              formatDate={formatDate}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  level: number;
  replyingTo: number | null;
  replyContent: string;
  onReplyChange: (value: string) => void;
  onReplyStart: (commentId: number) => void;
  onReplySubmit: (commentId: number) => void;
  onReplyCancel: () => void;
  editingId: number | null;
  editContent: string;
  onEditChange: (value: string) => void;
  onEditStart: (comment: Comment) => void;
  onEditSubmit: (commentId: number) => void;
  onEditCancel: () => void;
  onDelete: (commentId: number) => void;
  onToggleReplies: (commentId: number) => void;
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
        'rounded-xl border border-gray-200/80 bg-color-for-layer-on-body p-4 dark:border-gray-700',
        level > 0 && 'ml-3 border-l-2 border-l-first/30 bg-color-for-layer-sec sm:ml-8',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {comment.authorAvatar?.filePath ? (
            <img
              src={
                comment.authorAvatar.filePath.startsWith('http://') ||
                comment.authorAvatar.filePath.startsWith('https://')
                  ? comment.authorAvatar.filePath
                  : `${
                      import.meta.env.VITE_API_BASE_URL || 'http://localhost:5299'
                    }${comment.authorAvatar.filePath}`
              }
              alt={comment.authorName}
              className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-border"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={cn(
              'h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-first/10 text-xs font-semibold text-first',
              comment.authorAvatar?.filePath && 'hidden',
            )}
          >
            {(comment.authorName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium first-text-color">
              {comment.authorName}
            </div>
            <div className="text-xs first-text-color-for-paragraph-low">
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
                  onEditStart(comment);
                }
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 mb-3">
          <textarea
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            rows={3}
            className="min-h-20 w-full rounded-lg border border-gray-300 bg-color-for-layer-sec px-3 py-2 text-sm first-text-color-for-paragraph focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-first dark:border-gray-600"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onEditSubmit(comment.id)}
              disabled={!editContent.trim() || submitting}
              className="bg-first text-white hover:bg-first-600"
            >
              {t('comment.save') || 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={onEditCancel} disabled={submitting}>
              {t('comment.cancel') || 'Cancel'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-3 whitespace-pre-wrap break-words text-sm leading-6 first-text-color-for-paragraph">
          {comment.content}
        </p>
      )}

      {!isEditing && (
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {isAuthenticated && (
            <button
              onClick={() => {
                if (isReplying) {
                  onReplyCancel();
                } else {
                  onReplyStart(comment.id);
                }
              }}
              className="flex items-center gap-1 first-text-color-for-paragraph-low transition-colors hover:text-first"
            >
              <Reply className="h-3.5 w-3.5" />
              {t('comment.reply') || 'Reply'}
            </button>
          )}
          {hasReplies && (
            <button
              onClick={() => onToggleReplies(comment.id)}
              className="first-text-color-for-paragraph-low transition-colors hover:text-first"
            >
              {isExpanded
                ? `${t('comment.hideReplies') || 'Hide replies'} (${comment.replies.length})`
                : `${t('comment.showReplies') || 'Show replies'} (${comment.replies.length})`}
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {isReplying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2 overflow-hidden"
          >
            <textarea
              placeholder={t('comment.replyPlaceholder') || 'Write a reply...'}
              value={replyContent}
              onChange={(e) => onReplyChange(e.target.value)}
              rows={3}
              className="min-h-20 w-full rounded-lg border border-gray-300 bg-color-for-layer-sec px-3 py-2 text-sm first-text-color-for-paragraph placeholder:first-text-color-for-paragraph-low focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-first dark:border-gray-600"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onReplySubmit(comment.id)}
                disabled={!replyContent.trim() || submitting}
                className="bg-first text-white hover:bg-first-600"
              >
                {t('comment.submit') || 'Submit'}
              </Button>
              <Button size="sm" variant="outline" onClick={onReplyCancel} disabled={submitting}>
                {t('comment.cancel') || 'Cancel'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasReplies && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
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
                onToggleReplies={onToggleReplies}
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
