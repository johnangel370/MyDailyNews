export const metadata = {
  title: "Daily AI Briefing",
  description: "Private archive of daily AI/ML briefings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
