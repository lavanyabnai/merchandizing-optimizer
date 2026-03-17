"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Separator } from "@/components/ui/separator"

// Define the type for dropdown items
interface DropdownCategory {
  category: string
  items: {
    name: string
    description: string
    to: string
    icon: LucideIcon
    highlight?: boolean
    iconBackground?: string
    iconForeground?: string
    shortDescription?: string
  }[]
}

interface MegaDropdownProps {
  categories: DropdownCategory[]
}

export function MegaDropdownCategories({ categories }: MegaDropdownProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleItemClick = (to: string) => {
    setOpen(false) // Close the dropdown
    router.push(to) // Navigate programmatically
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center size-10 rounded-full bg-background shadow-sm ring-1 ring-border">
          <Image className="size-8" src="/assets/logo-4.png" width={32} height={32} alt="logo" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[640px] p-4" sideOffset={8}>
        <div className="max-h-[80vh] overflow-y-auto pr-1 space-y-6">
          {categories.map((category) => (
            <div key={category.category}>
              <DropdownMenuLabel className="text-sm font-medium text-muted-foreground">
                {category.category}
              </DropdownMenuLabel>
              <div className="border-b border-border mb-2" />
              <div className="grid grid-cols-2 gap-1">
                {category.items.map((item) => (
                  <DropdownMenuItem
                    key={item.name}
                    onClick={() => handleItemClick(item.to)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer",
                      pathname.startsWith(item.to)
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : item.highlight && "bg-accent/50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center size-9 rounded-full",
                        item.iconBackground || "bg-background shadow-sm",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4",
                          item.iconForeground || "text-foreground/70 group-hover:text-primary",
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{item.shortDescription}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
