import { getApprovedReviews, averageRating } from '@/lib/sanity/reviews'
import { ReviewForm } from '@/components/product/review-form'

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true">
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className={value <= rating ? 'text-honey-amber' : 'text-porcelain/25'}>
          ★
        </span>
      ))}
    </span>
  )
}

export async function ReviewsSection({
  productSlug,
  productName,
}: {
  productSlug: string
  productName: string
}) {
  const reviews = await getApprovedReviews(productSlug)
  const average = averageRating(reviews)

  return (
    <div className="mt-16 max-w-2xl">
      <div className="flex items-baseline gap-3">
        <h2 className="text-porcelain text-2xl font-bold tracking-tight">Reviews</h2>
        {average !== null && (
          <p className="text-porcelain/60 text-sm">
            <Stars rating={Math.round(average)} /> {average.toFixed(1)} ({reviews.length} review
            {reviews.length === 1 ? '' : 's'})
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-porcelain/60 mt-3 text-sm">
          No reviews yet for {productName} — be the first to leave one.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li key={review._id} className="border-ink-line border-t pt-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-porcelain text-sm font-semibold">{review.reviewerName}</p>
                <Stars rating={review.rating} />
              </div>
              <p className="text-porcelain/70 mt-2 text-sm">{review.body}</p>
              <p className="text-porcelain/40 mt-2 text-xs">
                {new Date(review.submittedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}

      <ReviewForm productSlug={productSlug} productName={productName} />
    </div>
  )
}
