import {
  createContentAction,
  deleteContentAction,
  updateContentAction,
  updateHomePageSetupAction,
  updateSalesPageSetupAction
} from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getContentEntries, getCatalogProducts } from "@/lib/mock-store";
import {
  getHomePageSetup,
  getSalesPageSetup,
  stringifyArticleCards,
  stringifyCategoryCards
} from "@/lib/page-setup";

function ProductSlugReference({ slugList }: { slugList: string[] }) {
  return (
    <div className="rounded-[1.25rem] border border-ink/10 bg-[#fcfaf6] p-4 text-sm text-slate">
      <p className="font-medium text-ink">Available product slugs</p>
      <p className="mt-2 leading-7">{slugList.join(", ")}</p>
    </div>
  );
}

export default async function AdminContentPage() {
  const [contentBlocks, homeSetup, summerSetup, winterSetup, products] = await Promise.all([
    getContentEntries(),
    getHomePageSetup(),
    getSalesPageSetup("summer"),
    getSalesPageSetup("winter"),
    getCatalogProducts()
  ]);

  const productSlugs = products.map((product) => product.slug);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Page setup</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Page content, media and campaign control</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">
          Manage homepage media, muted video, editorial card images, and seasonal sale page selections from one place.
          Current URLs are kept visible in the form so replacements stay easy to understand.
        </p>
      </div>

      <form action={updateHomePageSetupAction} className="section-frame rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Homepage</p>
            <h3 className="mt-3 font-serif text-3xl">Hero, muted video and editorial cards</h3>
          </div>
          <FormSubmitButton
            idleLabel="Save homepage setup"
            pendingLabel="Saving..."
            className="rounded-full bg-ink px-5 py-3 text-sm text-ivory"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="saleLineOne"
            defaultValue={homeSetup.saleLineOne}
            placeholder="Sale line one"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="saleLineTwo"
            defaultValue={homeSetup.saleLineTwo}
            placeholder="Sale line two"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="discountValue"
            defaultValue={homeSetup.discountValue}
            placeholder="Discount value"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="discountSuffix"
            defaultValue={homeSetup.discountSuffix}
            placeholder="Discount suffix"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2"
            name="heroImageUrl"
            defaultValue={homeSetup.heroImageUrl}
            placeholder="Hero mattress image URL"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="heroCardTitle"
            defaultValue={homeSetup.heroCardTitle}
            placeholder="Hero card title"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="heroCardSubtitle"
            defaultValue={homeSetup.heroCardSubtitle}
            placeholder="Hero card subtitle"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2"
            name="videoPosterUrl"
            defaultValue={homeSetup.videoPosterUrl}
            placeholder="Muted video poster URL"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2"
            name="videoUrl"
            defaultValue={homeSetup.videoUrl}
            placeholder="Muted video file URL"
            required
          />
          <input
            className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="videoTitle"
            defaultValue={homeSetup.videoTitle}
            placeholder="Video section title"
            required
          />
          <textarea
            className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
            name="videoBody"
            defaultValue={homeSetup.videoBody}
            placeholder="Video section supporting copy"
            required
          />
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-ink">
              Category cards
            </span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
              name="categoryCardsData"
              defaultValue={stringifyCategoryCards(homeSetup.categoryCards)}
              required
            />
            <span className="mt-2 block text-xs text-slate">One line per card: Title | Href | Image URL</span>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-ink">
              Blog cards
            </span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
              name="articleCardsData"
              defaultValue={stringifyArticleCards(homeSetup.articleCards)}
              required
            />
            <span className="mt-2 block text-xs text-slate">One line per card: Slug | Title | Image URL</span>
          </label>
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-2">
        {[
          { key: "summer" as const, title: "Summer sale page", setup: summerSetup },
          { key: "winter" as const, title: "Winter sale page", setup: winterSetup }
        ].map(({ key, title, setup }) => (
          <form key={key} action={updateSalesPageSetupAction} className="section-frame rounded-[1.75rem] p-6">
            <input type="hidden" name="season" value={key} />
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-bronze">{key} campaign</p>
                <h3 className="mt-3 font-serif text-3xl">{title}</h3>
              </div>
              <FormSubmitButton
                idleLabel={`Save ${key} setup`}
                pendingLabel="Saving..."
                className="rounded-full bg-ink px-5 py-3 text-sm text-ivory"
              />
            </div>

            <div className="mt-6 grid gap-4">
              <input
                className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="eyebrow"
                defaultValue={setup.eyebrow}
                placeholder="Eyebrow"
                required
              />
              <input
                className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="title"
                defaultValue={setup.title}
                placeholder="Headline"
                required
              />
              <textarea
                className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="body"
                defaultValue={setup.body}
                placeholder="Supporting copy"
                required
              />
              <input
                className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="accent"
                defaultValue={setup.accent}
                placeholder="Accent label"
                required
              />
              <input
                className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="image"
                defaultValue={setup.image}
                placeholder="Hero image URL"
                required
              />
              <textarea
                className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                name="productSlugs"
                defaultValue={setup.productSlugs.join(", ")}
                placeholder="Comma separated product slugs"
              />
              <ProductSlugReference slugList={productSlugs} />
            </div>
          </form>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Supporting content entries</p>
          <h3 className="mt-3 font-serif text-3xl">Guides, policy and extra content blocks</h3>
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
    </div>
  );
}
