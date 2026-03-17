import { useState } from 'react'

import { Button } from "@/components/ui/button";
import Link from 'next/link'


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({sidebarMenu}: {sidebarMenu: any}) {
  const [open] = useState(true)
  return (
    <div
      className={`bg-slate-50 shadow-lg  ${
        open ? 'w-24' : 'w-16'
      } text-gray-100 duration-500 `}
    >
      {/* <div className="py-1 flex justify-end"></div> */}
      {/* <div className="flex items-center justify-center bg-gray-100 py-1 ">
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <img
            className="cursor-poniter mx-auto h-14 w-14 justify-center "
            src={'/assets/logo-4.png'}
            alt="logo"
            onClick={() => setOpen(!open)}
          />
        </div> */}
      <div className="static  w-full mt-3 h-screen flex-1 space-y-1 px-2 border-r">
        {sidebarMenu?.map((item: { name: string; to: string; icon: React.ElementType }) => (
          <Link href={item.to} key={item.name}>
            <Button
              className={classNames(
                'group flex flex-col items-center rounded-md p-4',
                'text-slate-700 hover:bg-sky-50 hover:text-sky-500 hover:border hover:border-sky-500'
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              <h2 className="text-center text-xs font-medium">{item?.name}</h2>
            </Button>
          </Link>
        
        ))}
      </div>
    </div>
  )
}
