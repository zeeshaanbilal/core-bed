import { formatCurrency, getAdminDashboardStats } from "@/lib/mock-store";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const adminSummary = [
    { label: "Orders", value: String(stats.orderCount), note: "Live orders stored in the database." },
    { label: "Revenue", value: formatCurrency(stats.revenue), note: "Calculated only from paid live Stripe orders." },
    { label: "Products", value: String(stats.productCount), note: "Active catalog items currently available in the store." },
    { label: "Low stock", value: String(stats.lowStockCount), note: "Items at or below 6 units that need restock attention." },
    { label: "Published content", value: String(stats.publishedContentCount), note: "Guides, policies, and support pages currently live." }
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Dashboard</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Daily operations overview</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">
          Live snapshot of orders, revenue, catalog health, and published content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {adminSummary.map((item) => (
          <article key={item.label} className="section-frame rounded-[1.5rem] border border-[#e8e1d7] bg-white p-6 shadow-[0_18px_40px_rgba(47,42,40,0.05)]">
            <p className="text-sm text-slate">{item.label}</p>
            <p className="mt-3 font-serif text-4xl">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
