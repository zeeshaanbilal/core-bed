import { AccountRegisterForm } from "@/components/account-register-form";
import { getVisitorCountry } from "@/lib/visitor-country";

export default async function AccountRegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const defaultCountry = await getVisitorCountry();
  return <AccountRegisterForm error={params.error} defaultCountry={defaultCountry} />;
}
