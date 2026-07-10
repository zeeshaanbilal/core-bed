import { getApprovedTestimonialsForHome } from "@/lib/mock-store";

export default async function ReviewsPage() {
  const testimonials = await getApprovedTestimonialsForHome();

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Reviews</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Customer feedback and review highlights</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        Approved customer feedback from the admin moderation flow is shown here.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.length > 0 ? (
          testimonials.map((testimonial) => (
            <article key={testimonial.id} className="section-frame rounded-[1.75rem] p-8">
              <p className="font-serif text-3xl leading-tight">&ldquo;{testimonial.body}&rdquo;</p>
              <p className="mt-6 text-sm uppercase tracking-[0.26em] text-bronze">
                {testimonial.customerName} - {testimonial.customerCity}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate">Product: {testimonial.productName}</p>
            </article>
          ))
        ) : (
          <article className="section-frame rounded-[1.75rem] p-8 lg:col-span-3">
            <p className="text-base leading-8 text-slate">No approved feedback is live yet. Once admin approves new entries, they will appear here.</p>
          </article>
        )}
      </div>
    </main>
  );
}
