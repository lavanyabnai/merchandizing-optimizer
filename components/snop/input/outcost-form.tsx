
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"


// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { inputScenarioSchema } from "@/features/inputscenario/schemas";


interface ConditionFormValues {
  outsourcing_cost_pu: number;
  max_work_hrs_pwpm:number;
  max_overtime_hrs_pwpm:number
}


export default function CostInput() {
  const form = useForm<ConditionFormValues>({
    // resolver: zodResolver(inputScenarioSchema),
    defaultValues: {
      outsourcing_cost_pu: 0,
      max_work_hrs_pwpm: 0,
      max_overtime_hrs_pwpm: 0
    },
  })

  return (
    <div className="grid w-full gap-4">
     <Form {...form} >
       <FormField
          control={form.control}
          name="outsourcing_cost_pu"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Material Cost</FormLabel>
              <p className="text-gray-400 text-sm">per unit</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="outsourcing_cost_pu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_work_hrs_pwpm"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Manufacturing Cost</FormLabel>
              <p className="text-gray-400 text-sm">per unit</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="max_work_hrs_pwpm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_overtime_hrs_pwpm"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Logistics Cost</FormLabel>
              <p className="text-gray-400 text-sm">per unit</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="max_work_hrs_pwpm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
    </Form>   
    </div>
  );
}
