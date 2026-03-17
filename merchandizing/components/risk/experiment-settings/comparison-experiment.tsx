import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function ComparisonExperimentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          Comparison settings
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">?</span>
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="baseline" defaultChecked />
            <label
              htmlFor="baseline"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include baseline scenario
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="optimized" defaultChecked />
            <label
              htmlFor="optimized"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include optimized scenario
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Comparison metrics</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="service-level" defaultChecked />
            <label
              htmlFor="service-level"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Service Level
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="cost" defaultChecked />
            <label
              htmlFor="cost"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Total Cost
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="inventory" defaultChecked />
            <label
              htmlFor="inventory"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Inventory Levels
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="lead-time" defaultChecked />
            <label
              htmlFor="lead-time"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lead Time
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Target service level</h3>
        <Input type="number" defaultValue="95" className="mb-4" />
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
