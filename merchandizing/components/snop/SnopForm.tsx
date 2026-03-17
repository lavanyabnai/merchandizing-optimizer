import React from 'react'
// import { Form, useNavigate, useParams } from '@remix-run/react'
import { Button } from '@/components/ui/button'
import DemandInput from '@/components/snop/input/demand-form'
import CostInput from '@/components/snop/input/cost-form';
import EmpInput from '@/components/snop/input/empcost-form';
import OutsourcingInput from '@/components/snop/input/outcost-form';
import ConstraintInput from '@/components/snop/input/constraint-form';
import EmpConstraintInput from '@/components/snop/input/empconstraint-form';
import ProductConstraintInput from '@/components/snop/input/proconstraint-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { ArrowUpTrayIcon, CalendarIcon } from '@heroicons/react/20/solid'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center [&>div]:w-full',
        className
      )}
      {...props}
    />
  )
}

export default function SnopForm({ }: { inputData: any }) {
  const [date, setDate] = React.useState<Date>(new Date())
  // const navigate = useNavigate()
  // const params = useParams()

  return (
    <div className="m-2">
      <form method="post">
        <div className="bg-white mx-2 shadow-md rounded-b-lg">
          <div className="flex items-center  justify-between">
            <h2 className="text-3xl font-bold ml-4 p-2 text-transparent bg-clip-text   bg-gradient-to-r from-blue-700 via-sky-700 to-blue-700 font-display">
              Sales & Operations Planning Inputs
            </h2>
            <div className="flex items-center ">
            <Input
                className="mx-2 text-blue-900 w-50"
                name="scenario_id"
                // defaultValue={inputData.description || 'Describe your scenario'}
                placeholder="SCEN-2"
              />
              <Input
                className="mx-2 text-blue-900 w-20"
                name="description"
                // defaultValue={inputData.description || 'Describe your scenario'}
                placeholder="Describe your scenario"
              />
              <Input
                className="mx-2 text-blue-900 w-50 "
                name="customer"
                defaultValue="All"
                hidden
              />
              <Input
                className="mx-2 text-blue-900 w-50"
                name="site"
                defaultValue="All"
                hidden
              />
              <Input
                className="mx-2 text-blue-900 w-50"
                name="sku"
                defaultValue="All"
                hidden
              />
              <Input
                className="mx-2 text-blue-900 w-50"
                name="Status"
                defaultValue="Open"
                hidden
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[180px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-900" />
                    {date ? (
                      <span className="text-blue-900">
                        {format(date, 'PPP')}
                      </span>
                    ) : (
                      <span className="text-blue-900">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 ">
                  <Calendar
                    className="text-blue-900"
                    mode="single"
                    selected={date}
                    onSelect={(value) => setDate(value as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="ml-2 flex max-w-sm items-center">
                <Input type="file" />

                <Button className="mr-4  p-1 rounded-md border bg-blue-500 hover:bg-blue-600">
                  <div className="flex items-center space-x-1 mx-2 ">
                    <ArrowUpTrayIcon className="text-white h-5 w-5" />
                    <span className="mx-1 text-sm p-1 text-white ">Upload</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
          <div className="items-start justify-center gap-6 rounded-lg p-4 md:grid lg:grid-cols-2 xl:grid-cols-4">
            <div className="col-span-2 grid items-start  gap-2 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1 ">
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1 ">
                    <CardTitle className="text-2xl flex">Demand</CardTitle>
                    <p className="text-gray-400 text-sm">Units per month</p>
                    <div className="border-b" />
                  </CardHeader>

                  <CardContent className="grid gap-4">
                    <DemandInput />
                  </CardContent>
                </Card>
              </DemoContainer>
            </div>

            <div className="col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                      Material & Inventory Cost
                    </CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <CostInput />
                  </CardContent>
                </Card>
              </DemoContainer>
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Employee Cost</CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <EmpInput />
                  </CardContent>
                </Card>
              </DemoContainer>
            </div>

            <div className="col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Outsourcing Cost</CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <OutsourcingInput />
                  </CardContent>
                </Card>
              </DemoContainer>
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                      Inventory Constraint
                    </CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <ConstraintInput />
                  </CardContent>
                </Card>
              </DemoContainer>
            </div>
            <div className="col-span-2 grid items-start gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                      Employee Constraint
                    </CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <EmpConstraintInput />
                  </CardContent>
                </Card>
              </DemoContainer>
              <DemoContainer>
                <Card className="shadow-lg text-blue-900">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">
                      Product Constraint
                    </CardTitle>
                    <div className="border-b" />
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <ProductConstraintInput />
                  </CardContent>
                </Card>
              </DemoContainer>
            </div>
          </div>

          <div className="py-4 border-t flex justify-end space-x-2 mr-2">
            <Button className="bg-blue-500 hover:bg-blue-600">
              {/* {params.scenId ? 'Update Scenario' : 'Create Scenario'} */}
            Create Scenario
            </Button>
{/* 
            {params.scenId == null && ( */}
              <Button variant="outline">Save Input</Button>
            {/* )} */}
            <div className="mr-2">
              <Button
                // onClick={() => navigate(-1)}
                type="button"
                className=""
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
