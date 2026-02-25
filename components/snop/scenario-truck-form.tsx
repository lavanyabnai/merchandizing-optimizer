import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'


export default function TruckInput({ }: { truck: any }) {

  return (
    <div className="grid w-full  gap-10">
      <div className="grid grid-cols-4 items-center gap-4 justify-center">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 1
        </Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue  placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 2
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 3
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 4
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 5
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 6
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 7
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 8
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 9
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 10
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label
          className="text-lg rounded border border-sky-500 p-1 text-center bg-sky-50"
          htmlFor="pc"
        >
          Region 11
        </Label>
        <Select>
          <SelectTrigger className="w-full ">
            <SelectValue placeholder="Yes" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
        <Input
          id="NorthAmerica"
          name="NorthAmerica"
          defaultValue="1.0"
          className="text-lg text-gray-500 text-center"
        />
      </div>
    </div>
  )
}
