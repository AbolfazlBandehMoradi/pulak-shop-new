import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageCircle,
  PencilLine,
  Star,
  ThumbsUp,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import { cn } from '@/utils/cn';
import { getProductReviews, createProductReview, type ProductReview } from '@/utils/shopApi';
import { useToast } from '@/context/ToastContext';

interface ProductReviewsProps {
  productSlug: string;
  languageCode: string;
  initialReviews?: ProductReview[];
  initialReviewCount?: number;
  initialAverageRating?: number;
  initialRatingDistribution?: Array<{ rating: number; count: number }>;
}

const ratingValues = [5, 4, 3, 2, 1];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={`star-${index}`}
          className={cn(
            'h-4 w-4',
            index < Math.round(rating)
              ? 'fill-secound text-secound'
              : 'fill-first-100 text-first-100 dark:fill-gray-700 dark:text-gray-700',
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  productSlug,
  languageCode,
  initialReviews,
  initialReviewCount,
  initialAverageRating,
  initialRatingDistribution,
}: ProductReviewsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const queryClient = useQueryClient();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(user?.firstName || '');
  const [reviewerEmail, setReviewerEmail] = useState(user?.email || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const locale = languageCode === 'fa' ? 'fa-IR' : 'en-US';
  const numberFormatter = new Intl.NumberFormat(locale);
  const ratingFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const reviewsQuery = useQuery({
    queryKey: ['product-reviews', productSlug, languageCode],
    queryFn: () => getProductReviews(productSlug, languageCode),
    initialData: initialReviews
      ? {
          reviews: initialReviews,
          reviewCount: initialReviewCount ?? initialReviews.length,
          averageRating: initialAverageRating ?? 0,
          ratingDistribution: initialRatingDistribution ?? [],
        }
      : undefined,
  });

  const submitReviewMutation = useMutation({
    mutationFn: (payload: {
      reviewerName: string;
      reviewerEmail: string;
      rating: number;
      title?: string;
      content: string;
    }) => createProductReview(productSlug, payload, languageCode),
    onSuccess: async () => {
      showSuccess(
        t('review.success.create') ||
          'Review submitted successfully! It will be visible after approval.',
        5000,
      );

      setRating(0);
      setTitle('');
      setContent('');
      setShowReviewForm(false);

      await queryClient.invalidateQueries({
        queryKey: ['product-reviews', productSlug, languageCode],
      });
    },
    onError: (error) => {
      console.error('Failed to submit review:', error);
      showError(t('review.error.create') || 'Failed to submit review', 5000);
    },
  });

  useEffect(() => {
    if (!user) return;

    setReviewerName((currentName) => currentName || user.firstName || '');
    setReviewerEmail((currentEmail) => currentEmail || user.email || '');
  }, [user]);

  useEffect(() => {
    if (!reviewsQuery.error) return;
    console.error('Failed to load reviews:', reviewsQuery.error);
    showError(t('review.error.load') || 'Failed to load reviews', 5000);
  }, [reviewsQuery.error, showError, t]);

  const handleSubmitReview = () => {
    if (!rating || !content.trim() || !reviewerName.trim() || !reviewerEmail.trim()) {
      showError(t('review.error.required') || 'Please fill in all required fields', 5000);
      return;
    }

    if (rating < 1 || rating > 5) {
      showError(t('review.error.rating') || 'Please select a rating', 5000);
      return;
    }

    submitReviewMutation.mutate({
      reviewerName: reviewerName.trim(),
      reviewerEmail: reviewerEmail.trim(),
      rating,
      title: title.trim() || undefined,
      content: content.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const reviewsData = reviewsQuery.data;
  const reviews = reviewsData?.reviews ?? [];
  const reviewCount = reviewsData?.reviewCount ?? 0;
  const averageRating = reviewsData?.averageRating ?? 0;
  const ratingDistribution = reviewsData?.ratingDistribution ?? [];
  const loading = reviewsQuery.isLoading && !reviewsData;
  const submitting = submitReviewMutation.isPending;
  const selectedRating = hoveredRating || rating;
  const reviewCountLabel =
    reviewCount === 1 ? t('review.review') || 'review' : t('review.reviews') || 'reviews';

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-first/10 text-first">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-s-bold text-xl first-text-color">
              {t('review.title') || 'Customer Reviews'}
            </h3>
            <p className="mt-1 text-sm first-text-color-for-paragraph">
              {numberFormatter.format(reviewCount)} {reviewCountLabel}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setShowReviewForm((current) => !current)}
          className="gap-2 rounded-lg bg-secound px-4 py-2 text-sm text-white hover:bg-secound-600"
        >
          <PencilLine className="h-4 w-4" />
          {showReviewForm
            ? t('common.cancel') || 'Cancel'
            : t('review.writeReview') || 'Write a Review'}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 rounded-lg border border-first-100/70 bg-color-for-layer-sec p-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            <Skeleton className="h-12 w-28 bg-first-100" />
            <Skeleton className="h-5 w-36 bg-first-100" />
            <Skeleton className="h-4 w-48 bg-first-100" />
          </div>
          <div className="space-y-3">
            {ratingValues.map((value) => (
              <div key={`review-summary-loading-${value}`} className="flex items-center gap-3">
                <Skeleton className="h-4 w-12 bg-first-100" />
                <Skeleton className="h-2 flex-1 rounded-full bg-first-100" />
                <Skeleton className="h-4 w-8 bg-first-100" />
              </div>
            ))}
          </div>
        </div>
      ) : reviewCount > 0 ? (
        <div className="grid gap-4 rounded-lg border border-first-100/70 bg-color-for-layer-sec p-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-center">
            <div className="flex items-end gap-2">
              <motion.span
                className="font-s-bold text-5xl leading-none first-text-color"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {ratingFormatter.format(averageRating)}
              </motion.span>
              <span className="pb-1 text-sm first-text-color-for-paragraph">
                / {numberFormatter.format(5)}
              </span>
            </div>
            <Stars rating={averageRating} className="mt-3" />
            <p className="mt-2 text-sm first-text-color-for-paragraph">
              {t('review.basedOn') || 'Based on'} {numberFormatter.format(reviewCount)}{' '}
              {reviewCountLabel}
            </p>
          </div>

          <div className="space-y-3">
            {ratingValues.map((starRating) => {
              const dist = ratingDistribution.find((item) => item.rating === starRating);
              const count = dist?.count || 0;
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

              return (
                <div
                  key={starRating}
                  className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3"
                >
                  <span className="flex items-center gap-1 text-sm first-text-color-for-paragraph">
                    {numberFormatter.format(starRating)}
                    <Star className="h-3.5 w-3.5 fill-secound text-secound" />
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-color-for-layer-on-body">
                    <motion.div
                      className="h-full rounded-full bg-first"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.08 * (5 - starRating) }}
                    />
                  </div>
                  <span className="text-end text-xs first-text-color-for-paragraph">
                    {numberFormatter.format(count)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-first-100/70 bg-color-for-layer-sec p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="font-s-medium first-text-color">
                {t('review.writeReview') || 'Write a Review'}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="first-text-color-for-paragraph hover:text-first"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setTitle('');
                  setContent('');
                }}
              >
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium first-text-color-for-paragraph">
                  {t('review.name') || 'Name'}{' '}
                  <span className="first-text-color-red">({t('product.required')})</span>
                </label>
                <Input
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  placeholder={t('review.namePlaceholder') || 'Your name'}
                  disabled={submitting}
                  className="bg-color-for-layer-on-body"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium first-text-color-for-paragraph">
                  {t('review.email') || 'Email'}{' '}
                  <span className="first-text-color-red">({t('product.required')})</span>
                </label>
                <Input
                  type="email"
                  value={reviewerEmail}
                  onChange={(event) => setReviewerEmail(event.target.value)}
                  placeholder={t('review.emailPlaceholder') || 'your.email@example.com'}
                  disabled={submitting}
                  className="bg-color-for-layer-on-body"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium first-text-color-for-paragraph">
                  {t('review.titleLabel') || 'Title'} ({t('review.optional') || 'optional'})
                </label>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={t('review.titlePlaceholder') || 'Review title'}
                  disabled={submitting}
                  className="bg-color-for-layer-on-body"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium first-text-color-for-paragraph">
                {t('review.rating') || 'Rating'}{' '}
                <span className="first-text-color-red">({t('product.required')})</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`${t('review.rating') || 'Rating'} ${star}`}
                    className="rounded-md p-1 transition hover:bg-color-for-layer-on-body focus:outline-none focus-visible:ring-2 focus-visible:ring-first"
                  >
                    <Star
                      className={cn(
                        'h-7 w-7 transition-colors',
                        star <= selectedRating
                          ? 'fill-secound text-secound'
                          : 'text-first-100 hover:text-secound',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium first-text-color-for-paragraph">
                {t('review.content') || 'Review'}{' '}
                <span className="first-text-color-red">({t('product.required')})</span>
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  t('review.contentPlaceholder') || 'Share your thoughts about this product...'
                }
                rows={5}
                disabled={submitting}
                className="min-h-28 w-full rounded-md border border-gray-300 bg-color-for-layer-on-body px-3 py-2 text-sm first-text-color-for-paragraph placeholder:first-text-color-for-paragraph placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-first disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-500"
              />
            </div>

            <Button
              type="button"
              onClick={handleSubmitReview}
              disabled={
                submitting ||
                !rating ||
                !content.trim() ||
                !reviewerName.trim() ||
                !reviewerEmail.trim()
              }
              className="mt-4 w-full gap-2 rounded-lg bg-first px-4 py-2.5 text-white hover:bg-first-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('review.submitting') || 'Submitting...'}
                </>
              ) : (
                <>
                  <PencilLine className="h-4 w-4" />
                  {t('review.submit') || 'Submit Review'}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`review-loading-${index}`}
              className="rounded-lg border border-first-100/70 bg-color-for-layer-sec p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg bg-first-100" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-first-100" />
                    <Skeleton className="h-3 w-24 bg-first-100" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24 bg-first-100" />
              </div>
              <Skeleton className="mb-2 h-4 w-full bg-first-100" />
              <Skeleton className="h-4 w-4/5 bg-first-100" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !showReviewForm ? (
        <div className="rounded-lg border border-dashed border-first-100 bg-color-for-layer-sec px-4 py-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-first" />
          <p className="mx-auto max-w-md text-sm first-text-color-for-paragraph">
            {t('review.noReviews') || 'No reviews yet. Be the first to review this product!'}
          </p>
          <Button
            type="button"
            onClick={() => setShowReviewForm(true)}
            className="mt-4 gap-2 rounded-lg bg-secound px-4 py-2 text-white hover:bg-secound-600"
          >
            <PencilLine className="h-4 w-4" />
            {t('review.writeReview') || 'Write a Review'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review, index) => (
            <motion.article
              key={review.id}
              className="rounded-lg border border-first-100/70 bg-color-for-layer-sec p-4 transition-colors hover:border-first-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-color-for-layer-on-body text-first">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate font-s-medium first-text-color">
                        {review.reviewerName}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-third/10 px-2 py-0.5 text-xs text-third">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('review.verifiedPurchase') || 'Verified Purchase'}
                        </span>
                      )}
                    </div>
                    <Stars rating={review.rating} className="mt-1" />
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-xs first-text-color-for-paragraph">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {review.title && (
                <h5 className="mt-4 font-s-medium first-text-color">{review.title}</h5>
              )}

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 first-text-color-for-paragraph">
                {review.content}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-first-100 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-md px-2 first-text-color-for-paragraph hover:text-first"
                  onClick={() => {
                    showSuccess(t('review.helpful') || 'Thank you for your feedback!', 2000);
                  }}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {t('review.helpful') || 'Helpful'}
                </Button>
                {review.helpfulVotes > 0 && (
                  <span className="text-xs first-text-color-for-paragraph">
                    {numberFormatter.format(review.helpfulVotes)}
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
