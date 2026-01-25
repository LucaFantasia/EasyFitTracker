import "./globals.css";

export const metadata = {
  title: "EasyFitTracker",
  description: "Workout tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
