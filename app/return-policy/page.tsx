export const metadata = {
  title: "Return Policy | Corebed",
};

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 font-serif text-5xl font-semibold text-[#342d28]">Return Policy</h1>
      <div className="space-y-6 text-lg text-gray-700">
        <p>At corebed.com, we prioritize the quality of our products. Please review our return policy carefully.</p>
        <h2 className="font-serif text-2xl font-semibold text-[#342d28]">Returns</h2>
        <p>We only accept returns if the product you received is defective. If the item is defective, you must contact us within 7 days of receiving it to initiate a return. Otherwise, no returns are accepted under any circumstances.</p>
        <h2 className="font-serif text-2xl font-semibold text-[#342d28]">Refunds & Exchanges</h2>
        <p>If your return for a defective product is approved, we will inspect the item upon receiving it and initiate a refund to your original method of payment or offer a replacement. Please note that there is no exchange or refund otherwise.</p>
      </div>
    </div>
  );
}
