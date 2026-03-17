/* eslint-disable react/prop-types */
import React from "react";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import Link from "next/link";
import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

export default function CardLayout({ kpiData }) {
  const emptyStyles = { background: "#ef4444" };
  const progressStyles = { background: "#22c55e" };
  
  return (
    <>
      <div className="h-full">
        <ul
          className="py-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
        >
          {kpiData.map((kpi) => (
            <li
              key={kpi.Name}
              className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow-xl shadow-slate-900/10"
            >
              <div className="relative flex flex-1 flex-col py-2 pl-3">
                <span
                  className={`absolute inset-x-0 top-0 h-1 rounded-lg ${
                    kpi.status === "Above Target"
                      ? `bg-green-500`
                      : kpi.status === "Below Target"
                      ? `bg-red-500`
                      : ""
                  }`}
                ></span>
                <div className="my-2 flex items-baseline gap-2">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {kpi.Name}
                    </h3>
                    <h1 className="text-4xl font-bold text-black">
                      {kpi.Value}
                    </h1>
                  </div>
                  <div className="ml-auto overflow-x-hidden px-2 text-center text-base font-medium text-gray-700">
                    <ProgressBar
                      value={kpi.TargetAch}
                      style={{ width: 100, height: 12 }}
                      labelVisible={true}
                      labelPlacement={"start"}
                      emptyStyle={emptyStyles}
                      progressStyle={progressStyles}
                    />
                  </div>
                </div>
                <div>{kpi.container}</div>
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-200 bg-gray-50 h-10">
                  <div className="flex w-0 flex-1">
                    <Link
                      href={kpi.Analyze} // Fixed here
                      className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2 border border-transparent text-sm font-semibold  hover:bg-rose-500 hover:text-white"
                    >
                      <span className="py-4 inline-flex flex-1 items-center justify-center gap-x-3 text-sm font-semibold hover:text-white">
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
                      href="/demo/dashboard/salesExp" // Fixed here
                      className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2 border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white"
                    >
                      <span className="py-4 inline-flex flex-1 items-center justify-center gap-x-3 text-sm font-semibold hover:text-white">
                        <CircleStackIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                        Explore Data
                      </span>
                    </Link>
                  </div>
                  
                  <div className="-ml-px flex flex-1">
                    <Link
                      href="/benchmark" // Fixed here
                      className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2 border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white"
                    >
                      <span className="py-4 inline-flex flex-1 items-center justify-center gap-x-3 text-sm font-semibold hover:text-white">
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
    </>
  );
}
