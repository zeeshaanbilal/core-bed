import { AccountLoginForm } from "@/components/account-login-form";

export default async function AccountLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  return <AccountLoginForm error={params.error} success={params.success} redirectTo={params.redirect} />;
}
