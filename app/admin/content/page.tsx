import { createContentAction, deleteContentAction, updateContentAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getContentEntries } from "@/lib/mock-store";

export default async function AdminContentPage() {
  const contentBlocks = await getContentEntries();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Content</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Content and SEO control surface</h2>
      </div>

      <form action={createContentAction} className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Create content entry</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="title" placeholder="Title" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="slug" placeholder="Slug" required />
          <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue="guide" name="type">
            <option value="guide">Guide</option>
            <option value="policy">Policy</option>
            <option value="homepage">Homepage</option>
          </select>
          <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue="draft" name="status">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="summary" placeholder="Short summary" required />
        </div>
        <div className="mt-5">
          <FormSubmitButton idleLabel="Create content" pendingLabel="Saving..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {contentBlocks.map((block) => (
          <article key={block.id} className="section-frame rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">
              {block.type} · {block.status}
            </p>
            <form action={updateContentAction} className="mt-4 grid gap-4">
              <input name="id" type="hidden" value={block.id} />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={block.title} name="title" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={block.slug} name="slug" required />
              <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={block.type} name="type">
                <option value="guide">Guide</option>
                <option value="policy">Policy</option>
                <option value="homepage">Homepage</option>
              </select>
              <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={block.status} name="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={block.summary} name="summary" required />
              <FormSubmitButton idleLabel="Update entry" pendingLabel="Updating..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
            </form>
            <form action={deleteContentAction} className="mt-4">
              <input name="id" type="hidden" value={block.id} />
              <FormSubmitButton idleLabel="Delete entry" pendingLabel="Deleting..." className="text-sm text-slate underline" />
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
