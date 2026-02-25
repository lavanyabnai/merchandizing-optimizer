import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Select } from "@/components/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  siteId: z.number(),
  siteName: z.string(),
  demandPercentage: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  demandM3: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  distanceToSiteKm: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  facilityOptions: { label: string; value: number }[];
};

export const DistancebydemandForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  facilityOptions
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4 bg-white"
      >
        <FormField
          name="siteId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site</FormLabel>
              <FormControl>
                <Select
                  options={facilityOptions.map((option) => ({
                    ...option,
                    value: String(option.value)
                  }))}
                  value={String(field.value)}
                  onChange={(value) => field.onChange(Number(value))}
                  disabled={disabled}
                  placeholder="Select a location"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="siteName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Site Name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="demandPercentage"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demand percentage</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Demand percentage"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="demandM3"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Demand M3</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Demand m3" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="distanceToSiteKm"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance to site km</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Distance to site km"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create Distance by Demand'}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete Distance by Demand
          </Button>
        )}
      </form>
    </Form>
  );
};
