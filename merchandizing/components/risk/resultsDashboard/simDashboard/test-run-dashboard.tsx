import { Settings, Maximize2, List } from "lucide-react"

export default function TestRunDashboard() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Total Cost</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">14,165,956.489</span>
            <span className="text-gray-500">USD</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">34,953,848</span>
            <span className="text-gray-500">USD</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Profit</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">20,787,891.511</span>
            <span className="text-gray-500">USD</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-500">Average Cost per Item</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-blue-600">5,054.924</span>
            <span className="text-gray-500">USD</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border col-span-1">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-medium">Revenue, Total Cost</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Settings size={16} />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4 h-64 flex items-center justify-center text-gray-500">Chart Placeholder</div>
          <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
            <div>Chart items visible: 2 of 2</div>
            <List size={16} />
          </div>
        </div>

        <div className="bg-white rounded-lg border col-span-1">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-medium">Profit and Loss Analysis</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Settings size={16} />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left font-medium text-gray-500">#</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Statistics</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Value</th>
                    <th className="py-2 px-4 text-left font-medium text-gray-500">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2 px-4">1</td>
                    <td className="py-2 px-4">Inventory Carrying</td>
                    <td className="py-2 px-4">13,744,799</td>
                    <td className="py-2 px-4">USD</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">2</td>
                    <td className="py-2 px-4">Profit</td>
                    <td className="py-2 px-4">20,787,891.511</td>
                    <td className="py-2 px-4">USD</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">3</td>
                    <td className="py-2 px-4">Facility Cost</td>
                    <td className="py-2 px-4">137,625.517</td>
                    <td className="py-2 px-4">USD</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2 px-4">4</td>
                    <td className="py-2 px-4">Inventory Spend</td>
                    <td className="py-2 px-4">13,904,059.2</td>
                    <td className="py-2 px-4">USD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border col-span-1">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-medium">Profit, Revenue, Total Cost</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Settings size={16} />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div className="p-4 h-64 flex items-center justify-center text-gray-500">Chart Placeholder</div>
          <div className="p-2 border-t flex items-center justify-between text-xs text-gray-500">
            <div>Chart items visible: 3 of 3</div>
            <List size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
