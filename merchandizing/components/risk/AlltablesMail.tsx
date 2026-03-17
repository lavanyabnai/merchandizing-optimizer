"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { GripVertical, Filter, ChevronUp, ChevronDown } from "lucide-react"
import { useContentItems } from "@/components/risk/mailData"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem,  } from "@/components/ui/dropdown-menu"
export default function AlltablesMail() {


  const [activeTab] = useState("ALL")
  const contentItems = useContentItems()
  const [selectedItem, setSelectedItem] = useState<typeof contentItems[number] | null>(
    contentItems && contentItems.length > 0 ? contentItems[0] : null
  )
  const [searchTerm, setSearchTerm] = useState("")

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(384) // 24rem (384px) default width
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "deprecated">("all")
  const [sortBy, setSortBy] = useState<"name" | "updated" | "records">("name")
  // Min and max widths for the sidebar
  const minSidebarWidth = 240
  const maxSidebarWidth = 600

  // Handle mouse down on the resizer
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Handle mouse move to resize
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return

      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      // Calculate new width based on mouse position
      let newWidth = e.clientX - containerRect.left

      // Enforce min and max constraints
      newWidth = Math.max(minSidebarWidth, Math.min(newWidth, maxSidebarWidth))

      // Update sidebar width
      setSidebarWidth(newWidth)
    }

    const stopResizing = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleResize)
      window.addEventListener("mouseup", stopResizing)
    }

    return () => {
      window.removeEventListener("mousemove", handleResize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing])

  // Filter content items based on active tab and search term
  const filteredItems = contentItems.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.labels.includes(activeTab)
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })
  // Get icon for table


    // Format date
    // const formatDate = (dateString: string) => {
    //   try {
    //     const date = new Date(dateString)
    //     // Check if date is valid
    //     if (isNaN(date.getTime())) {
    //       return "Invalid date"
    //     }
        
    //     const now = new Date()
    //     const diffTime = Math.abs(now.getTime() - date.getTime())
    //     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
    //     if (diffDays < 1) {
    //       return "Today"
    //     } else if (diffDays === 1) {
    //       return "Yesterday"
    //     } else if (diffDays < 7) {
    //       return `${diffDays} days ago`
    //     } else if (diffDays < 30) {
    //       return `${Math.floor(diffDays / 7)} weeks ago`
    //     } else {
    //       return new Intl.DateTimeFormat("en-US", {
    //         month: "short",
    //         day: "numeric",
    //       }).format(date)
    //     }
    //   } catch (error) {
    //     return "Invalid date"
    //   }
    // }

     // Get status indicator
  const getStatusIndicator = (status: "active" | "inactive" | "deprecated") => {
    switch (status) {
      case "active":
        return <span className="h-2 w-2 rounded-full bg-green-500" title="Active"></span>
      case "inactive":
        return <span className="h-2 w-2 rounded-full bg-amber-500" title="Inactive"></span>
      case "deprecated":
        return <span className="h-2 w-2 rounded-full bg-red-500" title="Deprecated"></span>
    }
  }

    const toggleSort = (field: "name" | "updated" | "records") => {
      if (sortBy === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
      } else {
        setSortBy(field)
        setSortDirection("asc")
      }
    }



  return (
    <div ref={containerRef} className="flex h-screen bg-background relative">
      {/* Left sidebar with dynamic width */}
      <div className="border-r overflow-y-auto" style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Tables</h2>
       
          <div className="mb-4">
            <Input
              placeholder="Search"
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center pb-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    <Filter size={14} className="mr-1" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="inactive">Inactive</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="deprecated">Deprecated</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                    Sort: {sortBy}
                    {sortDirection === "asc" ? (
                      <ChevronUp size={14} className="ml-1" />
                    ) : (
                      <ChevronDown size={14} className="ml-1" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <DropdownMenuRadioItem value="name" onClick={() => toggleSort("name")}>
                      Name
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="updated" onClick={() => toggleSort("updated")}>
                      Last Updated
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="records" onClick={() => toggleSort("records")}>
                      Record Count
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  selectedItem?.id === item.id ? "bg-slate-100 text-slate-900" : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className={`mr-3 text-slate-500 ${selectedItem?.id === item.id ? "text-slate-700" : ""}`}>
                  {item.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <div className="ml-2 flex-shrink-0">{getStatusIndicator(item.status as "active" | "inactive" | "deprecated")}</div>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <span className="truncate">{item.recordCount?.toLocaleString() ?? 0} records</span>
                 
                
                  </div>
                </div>

                <div className="flex space-x-1 ml-2">
                  {item.labels.map((label) => {
                    const isSimulation = label.toLowerCase() === "simulation"
                    return (
                      <div
                        key={`${item.id}-${label}`}
                        className={`h-2 w-2 rounded-full ${isSimulation ? "bg-violet-500" : "bg-amber-500"}`}
                        title={label}
                      ></div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resizer handle */}
      <div
        className={`absolute h-full w-1 bg-transparent hover:bg-primary/20 cursor-col-resize z-10 ${
          isResizing ? "bg-primary/20" : ""
        }`}
        style={{ left: `${sidebarWidth}px` }}
        onMouseDown={startResizing}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground">
          <GripVertical size={16} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        

        {/* Render the selected item's dataTable component */}
        <div className="flex-1 overflow-auto">{selectedItem?.dataTable}</div>
      </div>
    </div>
  )
}
