import { faqPreview } from "@/lib/site-data";

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">FAQ</p>
        <h1 className="mt-4 font-serif text-6xl leading-tight">Support, warranty and policy structure</h1>
        <p className="mt-6 text-base leading-8 text-slate">
          The requirements document calls out product, delivery, returns, payment and warranty FAQs. This page starts that content architecture and keeps it ready for final business rules.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        {faqPreview.map((question) => (
          <article key={question} className="section-frame rounded-[1.5rem] p-6">
            <p className="font-serif text-2xl">{question}</p>
            <p className="mt-3 text-sm leading-7 text-slate">
              Final answer content will connect here once policies, delivery cities, trial rules and warranty coverage are confirmed.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
