import { ProgressBar } from '@progress/kendo-react-progressbars'
import Link from 'next/link'

import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'

export default function CardLayoutChat({ kpiData }) {
  const emptyStyles = { background: '#ef4444' }
  const progressStyles = { background: '#22c55e' }
  return (
    <>
      <ul className="m-4 grid grid-cols-2 gap-2 ">
        {kpiData.map(kpi => (
          <li
            key={kpi.Name}
            className="col-span-1 flex flex-col divide-y divide-gray-200 border rounded-lg shadow-xl shadow-slate-900/10 p-2"
          >
            <div className="relative flex flex-1 flex-col py-2 pl-3">
              <span
                className={`absolute inset-x-0 top-0 h-1 rounded-lg${
                  kpi && typeof kpi.status === 'string'
                    ? kpi.status === 'Above Target'
                      ? ` bg-green-500`
                      : kpi.status === 'Below Target'
                        ? ` bg-red-500`
                        : ''
                    : ''
                }`}
              ></span>
              <div className="my-2 flex items-baseline gap-2">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {kpi.Name}
                  </h3>
                  <h1 className="text-4xl font-bold text-black">{kpi.Value}</h1>
                </div>
                <div className="ml-auto overflow-x-hidden px-2  text-center text-base font-medium text-gray-700">
                  <ProgressBar
                    value={kpi.TargetAch}
                    style={{ width: 100, height: 12 }}
                    labelVisible={true}
                    labelPlacement={'start'}
                    emptyStyle={emptyStyles}
                    progressStyle={progressStyles}
                  />
                </div>
              </div>
              <div>{kpi.container}</div>
            </div>
            <div></div>
          </li>
        ))}
      </ul>
    </>
  )
}
