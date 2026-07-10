import { AccountRegisterForm } from "@/components/account-register-form";

export default async function AccountRegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <AccountRegisterForm error={params.error} />;
}
