import Link from "next/link";

export default function SalesPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-bronze">Sales</p>
        <h1 className="mt-4 font-serif text-6xl font-semibold tracking-[-0.07em] text-navy">Seasonal sale campaigns</h1>
        <p className="mt-6 text-base leading-8 text-slate">
          Explore the current promotional flows built around seasonal merchandising. Each landing page is structured as a dedicated campaign with its own product mix and messaging.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <Link href="/sales/summer" className="rounded-[1.75rem] bg-[linear-gradient(135deg,#49a3ec_0%,#1f73c5_100%)] p-10 text-white">
          <p className="text-xs uppercase tracking-[0.32em] text-white/80">Summer Sale</p>
          <h2 className="mt-5 text-5xl font-semibold tracking-[-0.05em]">Cool sleep offers</h2>
          <p className="mt-5 max-w-md text-base leading-8 text-white/88">Cooling mattresses, lighter pillows and summer-ready support accessories.</p>
        </Link>
        <Link href="/sales/winter" className="rounded-[1.75rem] bg-[linear-gradient(135deg,#173d74_0%,#0e2954_100%)] p-10 text-white">
          <p className="text-xs uppercase tracking-[0.32em] text-white/80">Winter Sale</p>
          <h2 className="mt-5 text-5xl font-semibold tracking-[-0.05em]">Warm comfort picks</h2>
          <p className="mt-5 max-w-md text-base leading-8 text-white/88">Plusher comfort stories, room-friendly bedding and cozy seasonal upgrades.</p>
        </Link>
      </div>
    </main>
  );
}
