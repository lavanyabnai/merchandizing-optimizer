import { memo } from 'react'
import { Handle } from '@xyflow/react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const invoices = [
  {
    name: 'Carrying Cost',
    value: '89.35',
    unit: 'USD',
  },
  {
    name: 'Opportunity Cost',
    value: '7,993.23',
    unit: 'USD',
  },
  {
    name: 'Profit',
    value: '63,344,372.18',
    unit: 'USD',
  },
  {
    name: 'Revenue',
    value: '98,280,000.0',
    unit: 'USD',
  },
  {
    name: 'Total Cost',
    value: '34,935,627.82',
    unit: 'USD',
  },
  {
    name: 'Transportation Cost',
    value: '5,760,238.47',
    unit: 'USD',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
function CustomNode({ data }) {
    const emptyStyles = { background: '#ef4444' }
    const progressStyles = { background: '#22c55e' }
  return (
    <>
      <li
        key={data.name}
        className="p-4 w-72 h-full flex flex-col divide-y divide-gray-200 rounded-lg bg-white shadow-xl shadow-slate-900/10 "
      >
        <div className="relative flex flex-1 flex-col mb-4">
          <div>
            <h1 className="text-xl font-bold text-black text-center">
              {data.name}
            </h1>
          </div>

          <div className="mt-2 flex justify-center items-center ">
            <div
              className={classNames(
                data.bgColor,
                'flex rounded-full justify-center items-center w-24 h-24 '
              )}
            >
              <span className={classNames(data.textColor, 'font-bold text-lg')}>
                {data.icon && <data.icon className="size-14 " />}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="mt-2 flex divide-x divide-gray-200 bg-gray-50 h-10 ">
            <div className="flex w-0 flex-1  ">
              <Link
                href="/risk/results"
                className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2 border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white"
              >
                <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                  <WrenchScrewdriverIcon
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>

            <div className="-ml-px flex flex-1">
              <Link
                href="/risk/analysis"
                className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2  border border-transparent text-sm font-semibold  hover:bg-rose-500 hover:text-white"
              >
                <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                  <CircleStackIcon className="size-5" aria-hidden="true" />
                </span>
              </Link>
            </div>
            <div className="-ml-px flex  flex-1">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative -mr-px inline-flex flex-1 items-center justify-center gap-x-2  border border-transparent text-sm font-semibold hover:bg-rose-500 hover:text-white">
                    <span className="py-4 inline-flex flex-1 items-cente justify-center gap-x-3 text-sm font-semibold hover:text-white">
                      <LightBulbIcon className="size-5" aria-hidden="true" />
                    </span>
                  </div>
                </DialogTrigger>

                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle className="leading-relaxed">
                      {' '}
                      Carrying Cost,Opportunity Cost,Profit,Revenue,Total
                      Cost,Transportation Cost
                    </DialogTitle>
                  </DialogHeader>

                  <div className="w-full bg-white rounded-b-md border">
                    <Table className="">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Statistics Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Unit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.name}>
                            <TableCell>{invoice.name}</TableCell>
                            <TableCell>{invoice.value}</TableCell>
                            <TableCell>{invoice.unit}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </li>
      <Handle type="source" position="right" className="w-1 bg-teal-500" />
      <Handle type="target" position="left" className="w-1 bg-teal-500" />
      {/* <div className="p-2 w-52 shadow-md rounded-md bg-sky-50 border-2 border-stone-400 ">
        <div className="flex justify-center items-center ">
          <div
            className={classNames(
              data.bgColor,
              'flex rounded-full justify-center items-center w-20 h-20'
            )}
          >
            <span className={classNames(data.textColor, 'font-bold text-lg')}>
              {data.icon && <data.icon className="h-14 w-14 " />}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-center text-xl">{data.name}</div>
     
      </div> */}
    </>
  )
}

export default memo(CustomNode)

 