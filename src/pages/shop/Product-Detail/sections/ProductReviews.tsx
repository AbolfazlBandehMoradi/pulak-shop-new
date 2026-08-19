import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import { cn } from '@/utils/cn';
import { createProductReview, getProductReviews, type ProductReview } from '@/utils/shopApi';
import { useToast } from '@/context/ToastContext';

interface ProductReviewsProps {
  productSlug: string;
  languageCode: string;
  initialReviews?: ProductReview[];
  initialReviewCount?: number;
  initialAverageRating?: number;
  initialRatingDistribution?: Array<{ rating: number; count: number }>;
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
    return date.toLocaleDateString(languageCode === 'fa' ? 'fa-IR' : 'en-US', {
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

  return (
    <div className="rounded-2xl border border-first/10 bg-first/5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-s-medium first-text-color">
            {t('review.title') || 'Customer Reviews'}
          </h3>
          <p className="mt-1 text-sm first-text-color-for-paragraph-low">
            {reviewCount}{' '}
            {reviewCount === 1 ? t('review.review') || 'review' : t('review.reviews') || 'reviews'}
          </p>
        </div>

        {!showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="rounded-lg border border-first/10 bg-color-for-layer-on-body px-4 first-text-color transition hover:bg-first/10"
          >
            {t('review.writeReview') || 'Write a Review'}
          </Button>
        )}
      </div>

      {reviewCount > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-5 rounded-xl border border-first/10 bg-color-for-layer-on-body p-4 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
          <div className="text-center md:text-left">
            <motion.div
              className="mb-2 text-4xl font-bold first-text-color"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              {averageRating.toFixed(1)}
            </motion.div>
            <div className="mb-2 flex items-center justify-center gap-1 md:justify-start">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    'h-5 w-5',
                    index < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600',
                  )}
                />
              ))}
            </div>
            <p className="text-sm first-text-color-for-paragraph-low">
              {t('review.basedOn') || 'Based on'} {reviewCount}{' '}
              {reviewCount === 1
                ? t('review.review') || 'review'
                : t('review.reviews') || 'reviews'}
            </p>
          </div>

          <div className="min-w-0">
            <h4 className="mb-3 text-sm font-medium first-text-color">
              {t('review.ratingBreakdown') || 'Rating Breakdown'}
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((starRating) => {
                const dist = ratingDistribution.find((item) => item.rating === starRating);
                const count = dist?.count || 0;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

                return (
                  <div
                    key={starRating}
                    className="grid grid-cols-[3rem_minmax(0,1fr)_2rem] items-center gap-2"
                  >
                    <span className="text-sm first-text-color-for-paragraph-low">
                      {starRating} {t('review.stars') || 'stars'}
                    </span>
                    <div className="h-2 min-w-0 rounded-full bg-first/10">
                      <motion.div
                        className="h-2 rounded-full bg-first"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className="text-right text-sm first-text-color-for-paragraph-low">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 overflow-hidden rounded-xl border border-first/10 bg-color-for-layer-on-body p-4 sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-f-sbold first-text-color">
                {t('review.writeReview') || 'Write a Review'}
              </h4>
              <Button
                className="first-text-color-red"
                size="sm"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  className="bg-first/5 first-text-color-for-paragraph placeholder:first-text-color-for-paragraph placeholder:opacity-50"
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
                  className="bg-first/5 first-text-color-for-paragraph placeholder:first-text-color-for-paragraph placeholder:opacity-50"
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
                  className="bg-first/5 first-text-color-for-paragraph placeholder:first-text-color-for-paragraph placeholder:opacity-50"
                />
              </div>
            </div>

            <div>
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
                className="flex min-h-28 w-full resize-y rounded-md border border-gray-300 bg-first/5 px-3 py-2 text-sm first-text-color-for-paragraph placeholder:first-text-color-for-paragraph placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-first disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="block text-sm font-medium first-text-color-for-paragraph">
                {t('review.rating') || 'Rating'}{' '}
                <span className="first-text-color-red">({t('product.required')})</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    aria-label={`${t('review.rating') || 'Rating'} ${star}`}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-first/30',
                      star <= (hoveredRating || rating)
                        ? 'border-third/40 bg-third/15 text-third shadow-[0_8px_18px_color-mix(in_srgb,var(--color-third)_18%,transparent)]'
                        : 'border-first/10 bg-first/5 text-first/45 hover:border-third/30 hover:bg-third/10 hover:text-third',
                    )}
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        star <= (hoveredRating || rating) ? 'fill-current' : 'fill-transparent',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={
                submitting ||
                !rating ||
                !content.trim() ||
                !reviewerName.trim() ||
                !reviewerEmail.trim()
              }
              className="w-full bg-first text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('review.submitting') || 'Submitting...'}
                </>
              ) : (
                t('review.submit') || 'Submit Review'
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-first/10 bg-color-for-layer-on-body p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !showReviewForm ? (
        <div className="mt-4 rounded-xl border border-dashed border-first/20 bg-color-for-layer-on-body px-4 py-8 text-center">
          <p className="mb-4 first-text-color-for-paragraph">
            {t('review.noReviews') || 'No reviews yet. Be the first to review this product!'}
          </p>
          <Button onClick={() => setShowReviewForm(true)} className="bg-first text-white">
            {t('review.writeReview') || 'Write a Review'}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="rounded-xl border border-first/10 bg-color-for-layer-on-body p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="min-w-0 break-words font-medium first-text-color [overflow-wrap:anywhere]">
                      {review.reviewerName}
                    </span>

                    {review.isVerifiedPurchase && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {t('review.verifiedPurchase') || 'Verified Purchase'}
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={cn(
                          'h-4 w-4',
                          starIndex < review.rating
                            ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-sm first-text-color-for-paragraph-low">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {review.title && (
                <h4 className="mb-2 break-words font-medium first-text-color [overflow-wrap:anywhere]">
                  {review.title}
                </h4>
              )}

              <p className="mb-2 whitespace-pre-wrap break-words first-text-color-for-paragraph [overflow-wrap:anywhere]">
                {review.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
