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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().default("Customer"),
  locationId: z.number().int().positive("Location is required"),
  inclusionType: z.enum(["Include", "Exclude", "Consider"]),
  additionalParams: z.any().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  id?: number;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  locationOptions: { label: string; value: number }[];
};

export const CustomerForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  locationOptions,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      type: "Customer",
      inclusionType: "Include",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4 bg-white">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Customer name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Customer type" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="locationId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Select
                  options={locationOptions.map(option => ({
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
          name="inclusionType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inclusion Type</FormLabel>
              <FormControl>
                <Select
                  options={[
                    { label: "Include", value: "Include" },
                    { label: "Exclude", value: "Exclude" },
                    { label: "Consider", value: "Consider" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                  placeholder="Select inclusion type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="additionalParams"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Parameters</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={disabled}
                  placeholder="Enter additional parameters as JSON"
                  value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="icon"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} placeholder="Icon name or URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create customer"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            Delete customer
          </Button>
        )}
      </form>
    </Form>
  );
};
