import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ConstraintInput() {

  return (
    <div className="grid w-full  gap-4">
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="startinv">
          Starting Inventory
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="startinv"
          name="inventory_start"
          // defaultValue={constraint["inventory_start"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="endinv">
          Ending Inventory
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="endinv"
          name="inventory_end"
          // defaultValue={constraint["inventory_end"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="startback">
          Starting Backlog
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="startback"
          name="backlog_start"
          // defaultValue={constraint["backlog_start"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="endback">
          Ending Backlog
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="endback"
          name="backlog_end"
          // defaultValue={constraint["backlog_end"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
    </div>
  );
}
