import { authGuard } from "@/lib/server/authGuard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await authGuard(true);

  return children;
}
