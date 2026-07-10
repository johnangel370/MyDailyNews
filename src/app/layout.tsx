import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily AI Briefing",
  description: "Private archive of daily AI/ML briefings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
