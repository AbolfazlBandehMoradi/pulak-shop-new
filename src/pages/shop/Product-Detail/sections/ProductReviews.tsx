import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, Loader2 } from 'lucide-react';
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

  // Review form state
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

      // Reset form
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
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="w-full font-s-medium first-text-color text-lg mt-4 mb-2">
            {t('review.title') || 'Customer Reviews'}
          </h3>
          {reviewCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {reviewCount}{' '}
              {reviewCount === 1
                ? t('review.review') || 'review'
                : t('review.reviews') || 'reviews'}
            </p>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      {reviewCount > 0 && (
        <div className="grid grid-cols-1 gap-6 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
          <div className="text-center md:text-left">
            <motion.div
              className="mb-2 text-4xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              {averageRating.toFixed(1)}
            </motion.div>
            <div className="mb-2 flex items-center justify-center gap-1 md:justify-start">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600',
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('review.basedOn') || 'Based on'} {reviewCount}{' '}
              {reviewCount === 1
                ? t('review.review') || 'review'
                : t('review.reviews') || 'reviews'}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">
              {t('review.ratingBreakdown') || 'Rating Breakdown'}
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((starRating) => {
                const dist = ratingDistribution.find((d) => d.rating === starRating);
                const count = dist?.count || 0;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

                return (
                  <div key={starRating} className="flex items-center gap-2">
                    <span className="w-12 text-sm">
                      {starRating} {t('review.stars') || 'stars'}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-muted dark:bg-gray-700">
                      <motion.div
                        className="h-2 rounded-full bg-primary dark:bg-primary/80"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 rounded-lg border border-gray-300 p-6"
          >
            <div className="flex items-center justify-between">
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
            <div className="flex flex-wrap justify-between">
              <div className="w-31/96">
                <label className="mb-2 block text-sm first-text-color-for-paragraph font-medium">
                  {t('review.name') || 'Name'}{' '}
                  <span className="first-text-color-red">({t('product.required')})</span>
                </label>
                <Input
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder={t('review.namePlaceholder') || 'Your name'}
                  disabled={submitting}
                  className="placeholder:first-text-color-for-paragraph first-text-color-for-paragraph placeholder:opacity-50"
                />
              </div>
              <div className="w-31/96">
                <label className="mb-2 block text-sm first-text-color-for-paragraph font-medium">
                  {t('review.email') || 'Email'}
                  <span className="first-text-color-red">({t('product.required')})</span>
                </label>
                <Input
                  type="email"
                  className="placeholder:first-text-color-for-paragraph first-text-color-for-paragraph placeholder:opacity-50"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder={t('review.emailPlaceholder') || 'your.email@example.com'}
                  disabled={submitting}
                />
              </div>
              <div className="w-31/96">
                <label className="mb-2 block first-text-color-for-paragraph text-sm font-medium">
                  {t('review.titleLabel') || 'Title'} ({t('review.optional') || 'optional'})
                </label>
                <Input
                  value={title}
                  className="placeholder:first-text-color-for-paragraph first-text-color-for-paragraph placeholder:opacity-50"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('review.titlePlaceholder') || 'Review title'}
                  disabled={submitting}
                />
              </div>
            </div>
            {/* Review Content */}
            <div>
              <label className="mb-2 block text-sm first-text-color-for-paragraph font-medium">
                {t('review.content') || 'Review'}
                <span className="first-text-color-red">({t('product.required')})</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  t('review.contentPlaceholder') || 'Share your thoughts about this product...'
                }
                rows={5}
                disabled={submitting}
                className="flex border-gray-300 dark:border-gray-500  placeholder:first-text-color-for-paragraph placeholder:opacity-50 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:text-muted-foreground focus-visible:outline-none first-text-color-for-paragraph bg-color-for-layer-sec  disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center">
              <label className=" block text-sm first-text-color-for-paragraph font-medium">
                {t('review.rating') || 'Rating'}
                <span className="first-text-color-red">({t('product.required')})</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8 cursor-pointer transition-colors',
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                          : 'text-gray-300 hover:text-yellow-400 dark:text-gray-600',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            {/* Submit Button */}
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

      {/* Reviews List */}
      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 border-b pb-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 && !showReviewForm ? (
        <div className="rounded-lg border border-gray-300 py-8 text-center">
          <p className="mb-4 first-text-color-for-paragraph">
            {t('review.noReviews') || 'No reviews yet. Be the first to review this product!'}
          </p>

          <Button
            onClick={() => setShowReviewForm(true)}
            className="border border-gray-300 first-text-color-for-paragraph"
          >
            {t('review.writeReview') || 'Write a Review'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="border-b pb-4 dark:border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium">{review.reviewerName}</span>

                    {review.isVerifiedPurchase && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {t('review.verifiedPurchase') || 'Verified Purchase'}
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {review.title && <h4 className="mb-2 font-medium">{review.title}</h4>}

              <p className="mb-2 whitespace-pre-wrap text-muted-foreground">{review.content}</p>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    showSuccess(t('review.helpful') || 'Thank you for your feedback!', 2000);
                  }}
                >
                  <ThumbsUp className="mr-1 h-3 w-3" />
                  {t('review.helpful') || 'Helpful'}
                  {review.helpfulVotes > 0 && <span className="ml-1">({review.helpfulVotes})</span>}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
