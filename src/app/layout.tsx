import { GeistSans } from "geist/font/sans"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import { FloatingHelpButton } from '@/components/floating-help-button'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3001"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Inventory Manager",
  description: "Manage your inventories with custom fields",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen">
            {children}
          </main>
          
          <FloatingHelpButton />
        </ThemeProvider>
      </body>
    </html>
  )
}