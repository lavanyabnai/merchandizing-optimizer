import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export function SkeletonDemo() {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
        <div className="divide-y">
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </div>
    </div>
  )
}