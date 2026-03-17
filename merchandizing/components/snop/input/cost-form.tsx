
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
  material_cost_pu: number;
  inv_hold_cost_pupm: number;
  stockout_cost_pupm: number;
}

export default function CostInput() {
  const form = useForm<ConditionFormValues>({
    // resolver: zodResolver(inputScenarioSchema),
    defaultValues: {
      material_cost_pu: 0,
      inv_hold_cost_pupm: 0,
      stockout_cost_pupm: 0,
    },
  })
  
  return (
     <div className="grid w-full gap-4">
       <Form {...form} >
         <FormField
          control={form.control}
          name="material_cost_pu"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Material Cost</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Material Cost" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      <FormField
          control={form.control}
          name="inv_hold_cost_pupm"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Holding Cost</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Holding Cost" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="stockout_cost_pupm"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">Stockout Cost</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Stockout Cost" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />  
      </Form>

    </div>
  );
}
