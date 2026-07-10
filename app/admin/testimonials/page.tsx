import { moderateTestimonialAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getTestimonialsForAdmin } from "@/lib/mock-store";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonialsForAdmin();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Feedback</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Review moderation and homepage curation</h2>
      </div>

      <div className="space-y-4">
        {testimonials.length > 0 ? (
          testimonials.map((testimonial) => (
            <article key={testimonial.id} className="section-frame rounded-[1.75rem] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-bronze">{testimonial.productName}</p>
                  <h3 className="mt-3 font-serif text-3xl">{testimonial.customerName}</h3>
                  <p className="mt-2 text-sm text-slate">
                    {testimonial.customerCity} · {testimonial.rating}/5 · {testimonial.status}
                  </p>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate">{testimonial.body}</p>
                </div>
              </div>

              <form action={moderateTestimonialAction} className="mt-6 grid gap-4 md:grid-cols-3">
                <input name="id" type="hidden" value={testimonial.id} />
                <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={testimonial.status} name="status">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={testimonial.featuredOnHome ? "true" : "false"} name="featuredOnHome">
                  <option value="false">Product page only</option>
                  <option value="true">Also feature on home</option>
                </select>
                <div>
                  <FormSubmitButton idleLabel="Save moderation" pendingLabel="Saving..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
                </div>
              </form>
            </article>
          ))
        ) : (
          <article className="section-frame rounded-[1.75rem] p-6">
            <p className="text-base text-slate">No feedback has been submitted yet.</p>
          </article>
        )}
      </div>
    </div>
  );
}
