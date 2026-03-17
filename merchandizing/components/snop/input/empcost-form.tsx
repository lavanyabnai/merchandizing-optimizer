import { Input } from '@/components/ui/input';
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
  hiring_cost_pw: number;
  firing_cost_pw:number;
  worker_cost_pm:number;
  overtime_cost_phr:number
}

  export default function CostInput() {
    const form = useForm<ConditionFormValues>({
      // resolver: zodResolver(inputScenarioSchema),
      defaultValues: {
        hiring_cost_pw: 0,
        firing_cost_pw:0,
        worker_cost_pm:0,
       overtime_cost_phr:0
      },
    })
  return (

    <div className="grid w-full gap-4">
    <Form {...form} >
       <FormField
          control={form.control}
          name="hiring_cost_pw"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Hiring Cost</FormLabel>
              <p className="text-gray-400 text-sm">per employee</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="hiring_cost_pw" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firing_cost_pw"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Layoff Cost</FormLabel>
              <p className="text-gray-400 text-sm">per employee</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="firing_cost_pw" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="worker_cost_pm"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Employee Cost</FormLabel>
              <p className="text-gray-400 text-sm">per employee</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="firing_cost_pw" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

     <FormField
          control={form.control}
          name="overtime_cost_phr"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Overtime Cost</FormLabel>
              <p className="text-gray-400 text-sm">per employee</p>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="overtime_cost_phr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </Form>
        </div>

  );
}
