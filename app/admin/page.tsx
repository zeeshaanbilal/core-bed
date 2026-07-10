import { adminQueues } from "@/lib/site-data";
import { formatCurrency, getAdminDashboardStats } from "@/lib/mock-store";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();
  const adminSummary = [
    { label: "Orders stored", value: String(stats.orderCount), note: "Checkout orders are now stored in the database." },
    { label: "Revenue", value: formatCurrency(stats.revenue), note: "Calculated from live database order totals." },
    { label: "Low stock", value: String(stats.lowStockCount), note: "Products at or below 6 units flagged for restock." },
    { label: "Draft content", value: String(stats.draftContentCount), note: "Policies and guides still awaiting final content." }
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Dashboard</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Admin dashboard skeleton</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminSummary.map((item) => (
          <article key={item.label} className="section-frame rounded-[1.5rem] p-6">
            <p className="text-sm text-slate">{item.label}</p>
            <p className="mt-3 font-serif text-4xl">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate">{item.note}</p>
          </article>
        ))}
      </div>

      <article className="section-frame rounded-[1.75rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Launch queue</p>
        <ul className="mt-6 space-y-3 text-sm leading-7 text-slate">
          {adminQueues.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-slate">
          Dashboard numbers are now read from the Prisma database, so seeded products, posts, and orders will appear here live.
        </p>
      </article>
    </div>
  );
}
