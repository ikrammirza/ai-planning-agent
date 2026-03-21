import "./globals.css";

export const metadata = {
  title: "AI Planning Agent",
  description: "Transform any problem into a structured execution plan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}