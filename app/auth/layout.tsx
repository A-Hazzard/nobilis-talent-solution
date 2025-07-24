// Force dynamic rendering to prevent pre-rendering issues for all auth pages
export const dynamic = 'force-dynamic';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 