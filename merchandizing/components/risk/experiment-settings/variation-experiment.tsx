import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function VariationExperimentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          Variation settings
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">?</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Number of variations</label>
            <Input type="number" defaultValue="3" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Variation step size</label>
            <Input type="number" defaultValue="5" className="mt-1" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Variation parameter</h3>
        <Select defaultValue="service-level">
          <SelectTrigger>
            <SelectValue placeholder="Select parameter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service-level">Service Level</SelectItem>
            <SelectItem value="lead-time">Lead Time</SelectItem>
            <SelectItem value="demand">Demand</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Parameter range</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">Minimum value</label>
              <span className="text-xs font-medium">80%</span>
            </div>
            <Slider defaultValue={[80]} max={100} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">Maximum value</label>
              <span className="text-xs font-medium">99%</span>
            </div>
            <Slider defaultValue={[99]} max={100} step={1} />
          </div>
        </div>
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
