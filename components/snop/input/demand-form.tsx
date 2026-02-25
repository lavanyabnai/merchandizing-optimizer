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
  Jan: number;
  Feb: number;
  Mar: number;
  Apr: number;
  May: number;
  Jun: number;
  Jul: number;
  Aug: number;
  Sep: number;
  Oct: number;
  Nov: number;
  Dec: number;
}

export default function DemandInput() {
  const form = useForm<ConditionFormValues>({
    // resolver: zodResolver(inputScenarioSchema),
    defaultValues: {
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
      Dec: 0
    },
  })
  return (
  <div className="grid w-full gap-4">
    <Form {...form} >
       <FormField
          control={form.control}
          name="Jan"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">January</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Jan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="Feb"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">February</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Feb" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Mar"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">March</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Feb" {...field} />
              </FormControl>
             
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Apr"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">April</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Apr" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="May"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">May</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="May" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="Jun"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">June</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Jun" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Jul"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">July</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Jul" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Aug"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">August</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Aug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="Sep"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">September</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Sep" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Oct"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">October</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Oct" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
         <FormField
          control={form.control}
          name="Nov"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">November</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Nov" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="Dec"
          render={({ field }) => (
            <FormItem  className="grid grid-cols-2 items-center gap-1">
              <FormLabel className="text-lg">December</FormLabel>
              <FormControl>
                <Input className="text-lg text-gray-500 text-center" placeholder="Dec" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
       </Form>
    </div> 
  );
}
