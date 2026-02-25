"use client";

import Image from "next/image";
import Link from "next/link";

import { MobileSidebar } from "@/components/mobile-sidebar";
// import { GlobalSearch } from "@/components/global-search";


import {

  HomeIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { MegaDropdownCategories } from "@/components/mega-dropdown-categories";
import { UserButton } from "@clerk/nextjs";


export const HeaderBlue = () => {
 
  const categories = [
    {
      category: "Digital Twin",
      items: [
        {
          name: "Risk Analysis",
          description: "Balance your demand and supply",
          to: "/risk/analysis",
          icon: HomeIcon,
          highlight: true,
          iconBackground: "bg-blue-100",
          iconForeground: "text-blue-700",
        },
        {
          name: "Merchandizing Optimizer",
          description: "Optimize your merchandizing strategy",
          to: "/risk/merchandizing-optimizer",
          icon: ShoppingBagIcon,
          highlight: true,
          iconBackground: "bg-orange-100",
          iconForeground: "text-orange-700",
        },
      
       
      ],
    },

  ]
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
    <nav className="py-2 px-6 flex items-center justify-between bg-blue-900">
      <div className="flex items-center gap-x-2">
        <MobileSidebar />
       <Link href="/" className="flex items-center gap-2">
       <Image className="block lg:hidden" src="/assets/logo.png" alt="logo" width={60} height={60} />
        <Image className="hidden lg:block" src="/assets/logo.png" alt="logo" width={40} height={40} />
        <Image className="hidden lg:block" src="/assets/white-logo.png" alt="logo" width={180} height={60} />
      </Link>
      
      </div>
      <div className="flex items-center gap-x-4">
     <div className="ml-6 hidden lg:block">
        <h1 className="text-lg font-semibold text-white">Assortment Optimizer</h1>
      </div>
      <UserButton appearance={{
        elements: {
          avatarBox: "size-10",
        },
      }} />

      <MegaDropdownCategories categories={categories} />
      </div>
    </nav>
    </header>
  );
};
