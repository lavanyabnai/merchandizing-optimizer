"use client"

import { PrinterIcon } from "@heroicons/react/24/outline"
import { FilePlusIcon, Pencil2Icon, TrashIcon, DownloadIcon } from "@radix-ui/react-icons"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  bgColor: string
  iconColor: string
  onClick?: () => void
}

function ActionButton({ icon: Icon, tooltip, bgColor, iconColor, onClick }: ActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className={bgColor} onClick={onClick}>
            <Icon className={`${iconColor} size-6`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function IconTooltip() {
  const actions = [
    {
      icon: FilePlusIcon,
      tooltip: "New",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-700",
      onClick: () => console.log("New clicked"),
    },
    {
      icon: Pencil2Icon,
      tooltip: "Edit",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-700",
      onClick: () => console.log("Edit clicked"),
    },
    {
      icon: TrashIcon,
      tooltip: "Delete",
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
      onClick: () => console.log("Delete clicked"),
    },
    {
      icon: PrinterIcon,
      tooltip: "Print",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-800",
      onClick: () => console.log("Print clicked"),
    },
    {
      icon: DownloadIcon,
      tooltip: "Download",
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
      onClick: () => console.log("Download clicked"),
    },
  ]

  return (
    <div className="m-2 space-x-1">
      {actions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </div>
  )
}
