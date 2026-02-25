"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, RotateCcw, Zap, Scale, Shield } from "lucide-react";

// Constraint schema with validation
export const constraintSchema = z.object({
  totalFacings: z.number().min(50).max(200),
  minFacingsPerSku: z.number().min(1).max(6),
  maxFacingsPerSku: z.number().min(1).max(10),
  minSkusPerSubcategory: z.number().min(1).max(10),
  minSkusPerPriceTier: z.number().min(1).max(5),
  minSkusPerBrand: z.number().min(0).max(10),
  maxSkusPerBrand: z.number().min(1).max(15),
});

export type ConstraintFormValues = z.infer<typeof constraintSchema>;

// Preset configurations
const PRESETS: Record<string, ConstraintFormValues> = {
  conservative: {
    totalFacings: 100,
    minFacingsPerSku: 2,
    maxFacingsPerSku: 4,
    minSkusPerSubcategory: 4,
    minSkusPerPriceTier: 2,
    minSkusPerBrand: 2,
    maxSkusPerBrand: 5,
  },
  balanced: {
    totalFacings: 120,
    minFacingsPerSku: 1,
    maxFacingsPerSku: 6,
    minSkusPerSubcategory: 3,
    minSkusPerPriceTier: 1,
    minSkusPerBrand: 1,
    maxSkusPerBrand: 8,
  },
  aggressive: {
    totalFacings: 150,
    minFacingsPerSku: 1,
    maxFacingsPerSku: 8,
    minSkusPerSubcategory: 2,
    minSkusPerPriceTier: 1,
    minSkusPerBrand: 0,
    maxSkusPerBrand: 12,
  },
};

const DEFAULT_VALUES = PRESETS.balanced;

interface ConstraintFormProps {
  defaultValues?: Partial<ConstraintFormValues>;
  onValuesChange?: (values: ConstraintFormValues) => void;
  disabled?: boolean;
}

interface SliderFieldProps {
  label: string;
  description: string;
  helpText: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  suffix?: string;
}

function SliderField({
  label,
  description,
  helpText,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
  suffix = "",
}: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-bold text-primary">
          {value}{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="cursor-pointer"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function ConstraintForm({
  defaultValues,
  onValuesChange,
  disabled = false,
}: ConstraintFormProps) {
  const form = useForm<ConstraintFormValues>({
    resolver: zodResolver(constraintSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
    mode: "onChange",
  });

  const values = form.watch();

  // Notify parent of value changes
  const handleValueChange = (field: keyof ConstraintFormValues, value: number) => {
    form.setValue(field, value);
    const newValues = { ...values, [field]: value };
    onValuesChange?.(newValues);
  };

  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const preset = PRESETS[presetName];
    Object.entries(preset).forEach(([key, value]) => {
      form.setValue(key as keyof ConstraintFormValues, value);
    });
    onValuesChange?.(preset);
  };

  const resetToDefaults = () => {
    form.reset(DEFAULT_VALUES);
    onValuesChange?.(DEFAULT_VALUES);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Optimization Constraints
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            disabled={disabled}
            className="h-8 px-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("conservative")}
            disabled={disabled}
            className="flex-1"
          >
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Conservative
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("balanced")}
            disabled={disabled}
            className="flex-1"
          >
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            Balanced
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyPreset("aggressive")}
            disabled={disabled}
            className="flex-1"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Aggressive
          </Button>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Space Constraints */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Space Constraints
              </h4>

              <FormField
                control={form.control}
                name="totalFacings"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SliderField
                        label="Total Available Facings"
                        description="Maximum product facings on the shelf"
                        helpText="A 'facing' is one product front visible to shoppers. More facings = more visibility but less variety."
                        min={50}
                        max={200}
                        step={10}
                        value={field.value}
                        onChange={(v) => handleValueChange("totalFacings", v)}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minFacingsPerSku"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SliderField
                          label="Min Facings/SKU"
                          description="Minimum facings for each selected SKU"
                          helpText="At least 1 facing is needed for a product to be visible. 2+ facings improve findability."
                          min={1}
                          max={6}
                          value={field.value}
                          onChange={(v) => handleValueChange("minFacingsPerSku", v)}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxFacingsPerSku"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SliderField
                          label="Max Facings/SKU"
                          description="Maximum facings for any single SKU"
                          helpText="Prevents a single product from dominating the shelf and ensures variety."
                          min={1}
                          max={10}
                          value={field.value}
                          onChange={(v) => handleValueChange("maxFacingsPerSku", v)}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Coverage Constraints */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Coverage Constraints
              </h4>

              <FormField
                control={form.control}
                name="minSkusPerSubcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SliderField
                        label="Min SKUs per Subcategory"
                        description="Ensures coverage across all beverage types"
                        helpText="Minimum SKUs per subcategory (Soft Drinks, Juices, Water, Energy Drinks). Ensures shoppers find what they're looking for."
                        min={1}
                        max={10}
                        value={field.value}
                        onChange={(v) => handleValueChange("minSkusPerSubcategory", v)}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minSkusPerPriceTier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SliderField
                        label="Min SKUs per Price Tier"
                        description="Ensures options at Value, Mid, and Premium price points"
                        helpText="Minimum SKUs at each price point. Ensures options for different budgets."
                        min={1}
                        max={5}
                        value={field.value}
                        onChange={(v) => handleValueChange("minSkusPerPriceTier", v)}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minSkusPerBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SliderField
                          label="Min SKUs/Brand"
                          description="If a brand is included"
                          helpText="Having 2+ SKUs per brand allows for size/flavor variety."
                          min={0}
                          max={10}
                          value={field.value}
                          onChange={(v) => handleValueChange("minSkusPerBrand", v)}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSkusPerBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SliderField
                          label="Max SKUs/Brand"
                          description="Prevents brand dominance"
                          helpText="Prevents over-reliance on one supplier and ensures competitive offerings."
                          min={1}
                          max={15}
                          value={field.value}
                          onChange={(v) => handleValueChange("maxSkusPerBrand", v)}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function getConstraintFormValues(form: ReturnType<typeof useForm<ConstraintFormValues>>) {
  return form.getValues();
}
