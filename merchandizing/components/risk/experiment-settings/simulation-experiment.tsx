import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SimulationExperimentSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center">
          Experiment settings
          <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">?</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">Repetitions per iteration</label>
            <Input type="number" defaultValue="10" className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Number of threads</label>
            <Input type="number" defaultValue="5" className="mt-1" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Target service level</h3>
        <Input type="number" defaultValue="95" className="mb-4" />

        <label className="text-xs text-gray-500 block mb-1">Service Level by Products</label>
        <Select defaultValue="all">
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
            <SelectItem value="individual">Individual Products</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Failure service level, %</label>
          <Input type="number" defaultValue="95" className="mt-1" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Recovery service level, %</label>
          <Input type="number" defaultValue="97" className="mt-1" />
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
