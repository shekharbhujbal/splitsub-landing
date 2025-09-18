export const metadata = {
  title: 'SplitSub – Split subscriptions, save together',
  description: 'Split the cost. Share the subscription. Save together.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
