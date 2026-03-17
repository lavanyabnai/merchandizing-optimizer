import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


export default function ConstraintInput() {


  return (
    <div className="grid w-full  gap-4">
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="max">
          Max overtime hours
          <p className="text-gray-400 text-sm">per employee per month</p>
        </Label>
        <Input
          id="max"
          name="max_overtime_hrs_pwpm"
          // defaultValue={constraint["max_overtime_hrs_pwpm"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="noemp">
          Starting # of employee
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="noemp"
          name="num_workers_start"
          // defaultValue={constraint["num_workers_start"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="minemp">
          Min ending # of employees
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="minemp"
          name="min_end_workers"
          // defaultValue={constraint["min_end_workers"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-2 items-center gap-1">
        <Label className="text-lg" htmlFor="maxemp">
          Max ending # of employees
          <p className="text-gray-400 text-sm">Units</p>
        </Label>
        <Input
          id="maxemp"
          name="max_end_workers"
          // defaultValue={constraint["max_end_workers"]}
          className="text-lg text-gray-500 text-center"
        />
      </div>
    </div>
  );
}
