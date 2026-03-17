import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import "./globals.css"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import "@/app/styles/custom-grid-styles.css"
import "@/app/styles/aggrid.css"
import "@/app/styles/kendo.css"
import { LicenseManager } from "ag-grid-enterprise"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/providers/query-provider"
import { SheetProvider } from "@/providers/sheet-provider"
import { SidebarProvider } from "@/lib/hooks/use-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"


export const experimental_ppr = true
LicenseManager.setLicenseKey(
  "[TRIAL]_this_{AG_Charts_and_AG_Grid}_Enterprise_key_{AG-057528}_is_granted_for_evaluation_only___Use_in_production_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_purchasing_a_production_key_please_contact_info@ag-grid.com___You_are_granted_a_{Single_Application}_Developer_License_for_one_application_only___All_Front-End_JavaScript_developers_working_on_the_application_would_need_to_be_licensed___This_key_will_deactivate_on_{14 May 2024}____[v3]_[0102]_MTcxNTY0MTIwMDAwMA==6ff4143f8d6a412a9d66750abe4d9ae3",
)

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "Assortment Optimizer",
  description: "Assortment Optimizer",
  icons: {
    icon: "/favicon.ico",
  },
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Properly await headers
  const headersList = await headers();
  const cspHeader = headersList.get('Content-Security-Policy');

  return (
      <html lang="en" className="size-full" suppressHydrationWarning>
        <head>
          {cspHeader && <meta httpEquiv="Content-Security-Policy" content={cspHeader} />}
        </head>
        <body className={`${inter.variable} font-sans antialiased size-full`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <QueryProvider>
              <TooltipProvider>
                <SheetProvider />
                <SidebarProvider>
                  <Toaster />
                  <main>{children}</main>
                </SidebarProvider>
              </TooltipProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
  )
}
