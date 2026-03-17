"use client"

import React from 'react'
import { kpiService_m } from '@/components/risk/overallData'
import Link from 'next/link'

import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'

export default function ResultOverall() {
  return (
    <div className="bg-white border">
      <ul className="p-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {kpiService_m.map((kpi) => (
          <li
            key={kpi.Name}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow-xl shadow-slate-900/10 "
          >
            <div className="relative flex flex-1 flex-col p-2">
              {/* <span
                className={`absolute inset-x-0 top-0 h-1 rounded-lg ${
                  kpi.status === 'Above Target'
                    ? `bg-green-500`
                    : kpi.status === 'Below Target'
                      ? `bg-red-500`
                      : ''
                }`}
              ></span> */}
              <div className="my-2 flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {kpi.Name}
                  </h3>
                </div>

                <div className="font-medium text-gray-700">
                  <h1 className="text-3xl font-bold text-black">{kpi.Value}</h1>
                </div>
              </div>
              <div>{kpi.container}</div>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200 bg-gray-50 h-10 ">
                <div className="flex w-0 flex-1  ">
                  <Link
                    href={kpi.Analyze}
                    className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2 border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white"
                  >
                    <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                      <WrenchScrewdriverIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                      Analyze
                    </span>
                  </Link>
                </div>

                <div className="-ml-px flex flex-1">
                  <Link
                    href="/demo/dashboard/salesExp"
                    className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2  border border-transparent text-sm font-semibold  hover:bg-rose-500 hover:text-white"
                  >
                    <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                      <CircleStackIcon className="h-5 w-5" aria-hidden="true" />
                      Explore Data
                    </span>
                  </Link>
                </div>
                <div className="-ml-px flex  flex-1">
                  <Link
                    href="/benchmark"
                    className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2  border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white"
                  >
                    <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                      <LightBulbIcon className="h-5 w-5" aria-hidden="true" />
                      Insights
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
