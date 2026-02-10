import './globals.css';
import { VisualEditing } from 'next-sanity';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <VisualEditing />
      </body>
    </html>
  );
}

