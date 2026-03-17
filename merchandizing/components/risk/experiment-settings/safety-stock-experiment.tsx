import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function SafetyStockExperimentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          Safety Stock settings
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">?</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Service level target</label>
            <Input type="number" defaultValue="95" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Lead time variability (%)</label>
            <Input type="number" defaultValue="20" className="mt-1" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Safety stock calculation method</h3>
        <Select defaultValue="normal">
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal Distribution</SelectItem>
            <SelectItem value="poisson">Poisson Distribution</SelectItem>
            <SelectItem value="empirical">Empirical Method</SelectItem>
            <SelectItem value="fixed">Fixed Days Supply</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Demand variability</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-gray-500">Coefficient of variation</label>
              <span className="text-xs font-medium">0.3</span>
            </div>
            <Slider defaultValue={[30]} max={100} step={1} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Review period</h3>
        <Select defaultValue="weekly">
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
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
