"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function SidebarDemo({ sidebarMenu }: { sidebarMenu: any }) {
  const pathname = usePathname()

  return (
    <div className="fixed w-[70px] border-r">
      <nav aria-label="Sidebar" className="h-screen py-2 ">
        <div className="flex flex-col space-y-1 px-2 ">
          {sidebarMenu?.map((item: any, index: number) => (
            <Link
              href={item.to}
              key={index}
              className={classNames(
                pathname === item.to ? "text-sky-500" : "text-slate-600 hover:text-slate-900",
                "group flex flex-col items-center rounded-md p-2",
                "overflow-x-hidden"
              )}
            >
              <div
                className={classNames(
                  "flex h-12 w-12 items-center justify-center rounded-md",
                  pathname === item.to ? "bg-sky-50 text-sky-500" : "text-slate-600 group-hover:text-slate-900 overflow-x-hidden",
                )}
              >
                {item.icon}
              </div>
              <span className="mt-1 text-center text-[12px] font-medium ">{item?.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
