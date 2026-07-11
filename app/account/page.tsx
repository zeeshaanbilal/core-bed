import { AccountOverview } from "@/components/account-overview";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getCustomerProfileByEmail } from "@/lib/mock-store";

export default async function AccountPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const [admin, profile] = await Promise.all([isAdminUser(), user?.email ? getCustomerProfileByEmail(user.email) : null]);
  return <AccountOverview error={params.error} success={params.success} user={user} isAdmin={admin} profile={profile} />;
}
