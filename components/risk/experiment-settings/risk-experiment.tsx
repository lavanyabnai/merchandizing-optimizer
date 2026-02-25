import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export function RiskExperimentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          Risk Analysis settings
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">?</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Number of simulations</label>
            <Input type="number" defaultValue="1000" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Confidence level (%)</label>
            <Input type="number" defaultValue="95" className="mt-1" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Risk factors</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="demand" defaultChecked />
            <label
              htmlFor="demand"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Demand Uncertainty
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="supply" defaultChecked />
            <label
              htmlFor="supply"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Supply Disruptions
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="leadtime" defaultChecked />
            <label
              htmlFor="leadtime"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lead Time Variability
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="price" />
            <label
              htmlFor="price"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Price Fluctuations
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Disruption severity</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">Impact level</label>
              <span className="text-xs font-medium">Medium</span>
            </div>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Mitigation strategies</h3>
        <Select defaultValue="buffer">
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buffer">Safety Stock Buffers</SelectItem>
            <SelectItem value="suppliers">Multiple Suppliers</SelectItem>
            <SelectItem value="capacity">Flexible Capacity</SelectItem>
            <SelectItem value="none">No Mitigation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Finance data unit</label>
          <Select defaultValue="usd">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD</SelectItem>
              <SelectItem value="eur">EUR</SelectItem>
              <SelectItem value="gbp">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Product data unit</label>
          <Select defaultValue="m3">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m3">m³</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="pcs">pcs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Time data unit</label>
          <Select defaultValue="day">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">day</SelectItem>
              <SelectItem value="hour">hour</SelectItem>
              <SelectItem value="minute">minute</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Distance data unit</label>
          <Select defaultValue="km">
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="km">km</SelectItem>
              <SelectItem value="mile">mile</SelectItem>
              <SelectItem value="m">m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
