"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calculator, CreditCard, Package, Search, Settings, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for demonstration - replace with your actual data sources
const recentSearches = [
  { id: "INT_DST", type: "Oc", title: "Customer 123 Order" },
  { id: "SHP-ID-9876", type: "shipment", title: "Carrier 1 Shipment" },
  { id: "Marble Mosaic", type: "customer", title: "Denver DC Stockout" },
]

const quickLinks = [
  { id: "dashboard", title: "Dashboard", icon: Calculator },
  { id: "control-tower", title: "Control Tower", icon: Settings },
  { id: "order-management", title: "Order Management", icon: Package },
  { id: "track-trace", title: "Track & Trace", icon: Truck },
  { id: "order-fulfillment", title: "Order Fulfillment", icon: Package },
  { id: "service-analytics", title: "Service Level Analytics", icon: CreditCard },
]

type SearchResult = {
  id: string
  title: string
  type: string
  description?: string
  route?: string
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult[]>([])

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([])
      return
    }

    setIsLoading(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      // Mock search results - replace with actual search logic
      const searchResults: SearchResult[] = []

      // Search for orders
      if (searchQuery.toUpperCase().startsWith("ORD")) {
        searchResults.push({
          id: searchQuery.toUpperCase(),
          title: `Order ${searchQuery.toUpperCase()}`,
          type: "order",
          description: "View order details",
          route: `/orders/${searchQuery.toUpperCase()}`,
        })
      }

      // Search for shipments
      if (searchQuery.toUpperCase().startsWith("SHP")) {
        searchResults.push({
          id: searchQuery.toUpperCase(),
          title: `Shipment ${searchQuery.toUpperCase()}`,
          type: "shipment",
          description: "View shipment details",
          route: `/shipments/${searchQuery.toUpperCase()}`,
        })
      }

      // Search for pages
      const pageMatches = quickLinks.filter((link) => link.title.toLowerCase().includes(searchQuery.toLowerCase()))

      pageMatches.forEach((match) => {
        searchResults.push({
          id: match.id,
          title: match.title,
          type: "page",
          description: `Navigate to ${match.title}`,
          route: `/${match.id.toLowerCase().replace(/\s+/g, "-")}`,
        })
      })

      setResults(searchResults)
      setIsLoading(false)
    }, 500)
  }, [])

  React.useEffect(() => {
    handleSearch(query)
  }, [query, handleSearch])

  const handleSelect = (result: SearchResult) => {
    setOpen(false)

    if (result.route) {
      router.push(result.route)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-[600px] justify-start items-center rounded-[0.5rem] bg-neutral-200 text-base font-normal text-muted-foreground shadow-none"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center">
          <Search className="mr-2 h-6 w-6" />
          Search anything...
        </span>
        <kbd className="pointer-events-none absolute mt-1 right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search orders, shipments, customers..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ) : (
            <>
              {query.length > 0 && results.length > 0 && (
                <CommandGroup heading="Search Results">
                  {results.map((result) => (
                    <CommandItem key={result.id} value={result.id} onSelect={() => handleSelect(result)}>
                      {result.type === "order" && <Package className="mr-2 h-4 w-4" />}
                      {result.type === "shipment" && <Truck className="mr-2 h-4 w-4" />}
                      {result.type === "page" && <Calculator className="mr-2 h-4 w-4" />}
                      <span>{result.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {query.length === 0 && (
                <>
                  <CommandGroup heading="Recent Searches">
                    {recentSearches.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => {
                          setOpen(false)
                          // Navigate to the appropriate route based on the type
                          const route =
                            item.type === "order"
                              ? `/orders/${item.id}`
                              : item.type === "shipment"
                                ? `/shipments/${item.id}`
                                : `/customers/${item.id}`
                          router.push(route)
                        }}
                      >
                        {item.type === "order" && <Package className="mr-2 h-4 w-4" />}
                        {item.type === "shipment" && <Truck className="mr-2 h-4 w-4" />}
                        {item.type === "customer" && <CreditCard className="mr-2 h-4 w-4" />}
                        <span>{item.title}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({item.id})</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Quick Links">
                    {quickLinks.map((link) => (
                      <CommandItem
                        key={link.id}
                        value={link.id}
                        onSelect={() => {
                          setOpen(false)
                          router.push(`/${link.id.toLowerCase().replace(/\s+/g, "-")}`)
                        }}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        <span>{link.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

