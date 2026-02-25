"use client";

import React, { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DemandInput from '@/components/snop/input/demand-form';
import CostInput from '@/components/snop/input/cost-form';
import EmpInput from '@/components/snop/input/empcost-form';
import OutsourcingInput from '@/components/snop/input/outcost-form';
import ConstraintInput from '@/components/snop/input/constraint-form';
import EmpConstraintInput from '@/components/snop/input/empconstraint-form';
import ProductConstraintInput from '@/components/snop/input/proconstraint-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowUpTrayIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
// import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { useCreateInputScenario } from '@/features/inputscenario/api/use-create-inputscenario';
// import { createInputScenarioSchema } from '@/features/inputscenario/schemas';
  
function DemoContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-center [&>div]:w-full',
        className,
      )}
      {...props}
    />
  );
}

// type ConditionFormValues = z.infer<typeof createInputScenarioSchema>

export default function SnopForm({ }: { inputData: any }) {
  const [date, setDate] = useState<Date>(new Date());
  const router = useRouter()
  const params = useParams()
  // const { mutate } = useCreateInputScenario();

  const form = useForm<any>({
    // resolver: zodResolver(createInputScenarioSchema),

    defaultValues: {
      scenario_id: "SCEN-2",
      description: "Scenario 2",
      CreatedAt: "2025-02-25",
      UpdatedAt: "2025-02-25",
      module: "Sales & Operations Planning",
      status: "Open",
      customer: "ALL",
      site: "ALL",
      sku: "ALL",
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
      material_cost_pu: 0,
      inv_hold_cost_pupm: 0,
      stockout_cost_pupm: 0,
      hiring_cost_pw: 0,
      firing_cost_pw: 0,
      labor_hrs_pu: 0,
      worker_cost_pm: 0,
      overtime_cost_phr: 0,
      outsourcing_cost_pu: 0,
      max_work_hrs_pwpm: 0,
      max_overtime_hrs_pwpm: 0,
      inventory_start: 0,
      inventory_end: 0,
      backlog_start: 0,
      backlog_end: 0,
      num_workers_start: 0,
      min_end_workers: 0,
      max_end_workers: 0,
    },
  })

  const onSubmit = (values: any) => {
    console.log("Form submitted");
    console.log("Form values before processing:", values);

    const finalValues = {
      ...values,
      Jan: values.Jan,
      Feb: values.Feb,
      Mar: values.Mar,
      Apr: values.Apr,
      May: values.May,
      Jun: values.Jun,
      Jul: values.Jul,
      Aug: values.Aug,
      Sep: values.Sep,
      Oct: values.Oct,
      Nov: values.Nov,
      Dec: values.Dec,
      material_cost_pu: values.material_cost_pu,
      inv_hold_cost_pupm: values.inv_hold_cost_pupm,
      stockout_cost_pupm: values.stockout_cost_pupm,
      hiring_cost_pw: values.hiring_cost_pw,
      firing_cost_pw: values.firing_cost_pw,
      labor_hrs_pu: values.labor_hrs_pu,
      worker_cost_pm: values.worker_cost_pm,
      overtime_cost_phr: values.overtime_cost_phr,
      outsourcing_cost_pu: values.outsourcing_cost_pu,
      max_work_hrs_pwpm: values.max_work_hrs_pwpm,
      max_overtime_hrs_pwpm: values.max_overtime_hrs_pwpm,
      inventory_start: values.inventory_start,
      inventory_end: values.inventory_end,
      backlog_start: values.backlog_start,
      backlog_end: values.backlog_end,
      num_workers_start: values.num_workers_start,
      min_end_workers: values.min_end_workers,
      max_end_workers: values.max_end_workers
    };

    console.log("Submitting values:", finalValues);

    // mutate({ form: finalValues as any }, {
      // onSuccess: ({ data }: { data: any }) => {
        // console.log("Data created successfully:", data);
        form.reset();
        // router.push(`/setup/alert-condition`);
      // },
      // onError: (error: any) => {
        // console.error("Error creating data:", error);
      // }
    // });
  };
  
return (   
<Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)}>
 
   <h2 className="text-3xl font-bold  p-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-700 to-blue-700 font-display">
         Sales & Operations Planning Input
       </h2>
      <div className="flex items-center justify-between">
      
       <div className="flex items-center ">
     
          <FormField
          control={form.control}
          name="scenario_id"
          render={({ field }) => (
            <FormItem  className="">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-20 h-10" placeholder="SCEN-2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem  className="">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-50 h-10" placeholder="Describe your scenario" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem  className="">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-20 h-10" placeholder="ALL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       <FormField
          control={form.control}
          name="site"
          render={({ field }) => (
            <FormItem  className="">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-20 h-10" placeholder="ALL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
            name="sku"
          render={({ field }) => (
            <FormItem  className="">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-20 h-10" placeholder="ALL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
                 <FormField
          control={form.control}
            name="status"
          render={({ field }) => (
            <FormItem  className=" ">
             
              <FormControl>
                <Input className="mx-2 text-blue-900 w-20 h-10 text-center" placeholder="Open" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
   
         <Popover>
           <PopoverTrigger asChild>
             <Button
               variant={'outline'}
               className={cn(
                 'w-[230px] justify-start text-left font-normal',
                 !date && 'text-muted-foreground'
               )}
             >
               <CalendarIcon className="mr-2 h-5 w-5 text-blue-900" />
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
           <Input type="file" className="text-blue-900 w-20 h-10" />

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
       {params.scenId ? 'Update Scenario' : 'Create Scenario'}
       </Button>

       <Button variant="outline">Save Input</Button>
       <div className="mr-2">
         <Button
           onClick={() => router.back()}
           type="button"
           className=""
           variant="secondary"
         >
           Cancel
         </Button>
       </div>
     </div>
 
 </form>
 </Form>
  );
}