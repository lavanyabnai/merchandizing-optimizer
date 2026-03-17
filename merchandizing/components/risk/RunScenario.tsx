"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { PlayIcon, PauseIcon, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

import { useGetNetScenarios } from "@/features/net_scenario/api/use-get-net_scenarios";
import { useCreateNetScenario } from "@/features/net_scenario/api/use-create-net_scenario";
import { useBulkDeleteNetScenarios } from "@/features/net_scenario/api/use-bulk-delete-net_scenarios";
import { columns, type Scenario } from "./columns";
import { EditNetScenarioSheet } from "@/features/net_scenario/components/edit-net_scenario-sheet";
import { NewNetScenarioSheet } from "@/features/net_scenario/components/new-net_scenario-sheet";
export default function RunScenario() {
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(420)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [scenarioType, setScenarioType] = useState("Parameter Experiment")
  const [ignoreRoutes, setIgnoreRoutes] = useState(false)
  const [demandVariationType, setDemandVariationType] = useState("exact-demand")
  const [searchType, setSearchType] = useState("find-n-best")
  const [bestSolutions, setBestSolutions] = useState("1")
  const [optimizationTime, setOptimizationTime] = useState("600")
  const [mipGap, setMipGap] = useState("0.000001")
  const [threads, setThreads] = useState("7")
  const [problemType, setProblemType] = useState("use-big-m")
  const [unitType, setUnitType] = useState("m3")
  const [distanceUnit, setDistanceUnit] = useState("km")
  const [currency, setCurrency] = useState("USD")

  // Min and max widths for the sidebar
  const minSidebarWidth = 290
  const maxSidebarWidth = 500

  // Fetch scenarios from database
  const scenariosQuery = useGetNetScenarios()
  const createScenarioMutation = useCreateNetScenario()
  const deleteScenarios = useBulkDeleteNetScenarios()

  const scenarios = scenariosQuery.data || []
  const isDisabled = scenariosQuery.isLoading || deleteScenarios.isPending

  const handleOptimize = () => {
    if (!name.trim()) {
      toast.error("Please enter a scenario name")
      return
    }

    const newScenario = {
      netId: name.trim(),
      description: description.trim(),
      scenarioType,
      ignoreRoutes,
      demandVariationType,
      searchType,
      bestSolutions: Number.parseInt(bestSolutions),
      optimizationTime: Number.parseInt(optimizationTime),
      mipGap: mipGap,
      threads: Number.parseInt(threads),
      problemType,
      unitType,
      distanceUnit,
      currency,
    }

    createScenarioMutation.mutate(newScenario, {
      onSuccess: () => {
        // Reset form
        setName("")
        setDescription("")
        toast.success("Scenario created successfully!")
      },
    })
  }

  // Handle mouse down on the resizer
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Handle mouse move to resize
  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return

      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      // Calculate new width based on mouse position
      let newWidth = e.clientX - containerRect.left

      // Enforce min and max constraints
      newWidth = Math.max(minSidebarWidth, Math.min(newWidth, maxSidebarWidth))

      // Update sidebar width
      setSidebarWidth(newWidth)
    }

    const stopResizing = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleResize)
      window.addEventListener("mouseup", stopResizing)
    }

    return () => {
      window.removeEventListener("mousemove", handleResize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing])

  if (scenariosQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-6 text-slate-300 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <NewNetScenarioSheet />
      <EditNetScenarioSheet />
      <div ref={containerRef} className="flex h-screen bg-background relative">
        {/* Left sidebar with parameters */}
        <div className="border-r overflow-y-auto bg-white flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
          <Card className="border-0 rounded-none h-full">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-2xl font-bold">Experiment settings</h2>

              {/* Scenario Name and Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Scenario Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter scenario name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Scenario Type</Label>
                  <Select value={scenarioType} onValueChange={setScenarioType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Parameter Experiment">Parameter Experiment</SelectItem>
                      <SelectItem value="Risk Experiment">Risk Experiment</SelectItem>
                      <SelectItem value="Simulation Experiment">Simulation Experiment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Experiment Settings */}
              <div className="space-y-4">
                {/* Ignore straight routes - full width */}
                <div className="flex items-center space-x-2">
                  <Switch id="ignore-routes" checked={ignoreRoutes} onCheckedChange={setIgnoreRoutes} />
                  <Label htmlFor="ignore-routes" className="text-sm">
                    Ignore straight routes
                  </Label>
                </div>

                {/* Two column grid for dropdowns and inputs */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Demand variation type */}
                  <div className="space-y-2">
                    <Label className="text-sm">Select demand variation type</Label>
                    <Select value={demandVariationType} onValueChange={setDemandVariationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100-105">100% - 105%</SelectItem>
                        <SelectItem value="95-100">95% - 100%</SelectItem>
                        <SelectItem value="exact-demand">Exact demand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search type */}
                  <div className="space-y-2">
                    <Label className="text-sm">Select search type for N best solutions</Label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="find-n-best">Find N best</SelectItem>
                        <SelectItem value="solution-pool">Solution pool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Number of best solutions */}
                  <div className="space-y-2">
                    <Label className="text-sm">Number of best solutions to find</Label>
                    <Input type="number" value={bestSolutions} onChange={(e) => setBestSolutions(e.target.value)} />
                  </div>

                  {/* Optimization time limit */}
                  <div className="space-y-2">
                    <Label className="text-sm">Optimization time limit, sec</Label>
                    <Input
                      type="number"
                      value={optimizationTime}
                      onChange={(e) => setOptimizationTime(e.target.value)}
                    />
                  </div>

                  {/* MIP Gap */}
                  <div className="space-y-2">
                    <Label className="text-sm">Relative MIP gap</Label>
                    <Input type="number" step="0.000001" value={mipGap} onChange={(e) => setMipGap(e.target.value)} />
                  </div>

                  {/* Number of threads */}
                  <div className="space-y-2">
                    <Label className="text-sm">Number of threads to use</Label>
                    <Select value={threads} onValueChange={setThreads}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 7, 8, 16].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Problem definition type */}
                  <div className="space-y-2">
                    <Label className="text-sm">Problem definition type</Label>
                    <Select value={problemType} onValueChange={setProblemType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="use-big-m">Use Big M</SelectItem>
                        <SelectItem value="indicator">Indicator</SelectItem>
                        <SelectItem value="use-sos">Use SOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit Type */}
                  <div className="space-y-2">
                    <Label className="text-sm">Unit type</Label>
                    <Select value={unitType} onValueChange={setUnitType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ft2">ft²</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                        <SelectItem value="liter">liter</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="ton">ton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Distance Unit */}
                  <div className="space-y-2">
                    <Label className="text-sm">Distance unit</Label>
                    <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="km">km</SelectItem>
                        <SelectItem value="mile">mile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <Label className="text-sm">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleOptimize}
                disabled={createScenarioMutation.isPending}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                {createScenarioMutation.isPending ? (
                  <PauseIcon className="h-4 w-4 mr-2" />
                ) : (
                  <PlayIcon className="h-4 w-4 mr-2" />
                )}
                {createScenarioMutation.isPending ? "Creating Scenario..." : "Create Scenario"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resizer handle */}
        <div
          className={`absolute h-full w-1 bg-transparent hover:bg-primary/20 cursor-col-resize z-10 ${
            isResizing ? "bg-primary/20" : ""
          }`}
          style={{ left: `${sidebarWidth}px` }}
          onMouseDown={startResizing}
        />

        {/* Main content with DataTable */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header section - fixed height */}
          <div className="flex-shrink-0 px-4 py-3 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-xl font-bold">Simulation Scenarios</h2>
            </div>
          </div>

          {/* DataTable container - scrollable */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="w-full overflow-x-auto">
                <DataTable 
                  filterKey="name"
                  columns={columns} 
                  data={scenarios as unknown as Scenario[]}
                  onDelete={(row) => {
                    const ids = row.map((r) => r.original.id)
                    deleteScenarios.mutate({ ids })
                  }}
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}










// "use client";

// import type React from "react";
// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { DataTable } from "@/components/data-table";
// import { PlayIcon, PauseIcon, Loader2 } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "sonner";

// // Import the hooks we created
// import { useGetNetScenarios } from "@/features/net_scenario/api/use-get-net_scenarios";
// import { useCreateNetScenario } from "@/features/net_scenario/api/use-create-net_scenario";
// import { useBulkDeleteNetScenarios } from "@/features/net_scenario/api/use-bulk-delete-net_scenarios";
// import { columns } from "./columns";
// import { EditNetScenarioSheet } from "@/features/net_scenario/components/edit-net_scenario-sheet";
// import { NewNetScenarioSheet } from "@/features/net_scenario/components/new-net_scenario-sheet";

// export default function RunScenario() {
//   // Resizable sidebar state
//   const [sidebarWidth, setSidebarWidth] = useState(420);
//   const [isResizing, setIsResizing] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Form states
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [scenarioType, setScenarioType] = useState("Parameter Experiment");
//   const [ignoreRoutes, setIgnoreRoutes] = useState(false);
//   const [demandVariationType, setDemandVariationType] =
//     useState("exact-demand");
//   const [searchType, setSearchType] = useState("find-n-best");
//   const [bestSolutions, setBestSolutions] = useState("1");
//   const [optimizationTime, setOptimizationTime] = useState("600");
//   const [mipGap, setMipGap] = useState("0.000001");
//   const [threads, setThreads] = useState("7");
//   const [problemType, setProblemType] = useState("use-big-m");
//   const [unitType, setUnitType] = useState("m3");
//   const [distanceUnit, setDistanceUnit] = useState("km");
//   const [currency, setCurrency] = useState("USD");

//   // Min and max widths for the sidebar
//   const minSidebarWidth = 290;
//   const maxSidebarWidth = 500;

//   // Fetch scenarios from database
//   const scenariosQuery = useGetNetScenarios();
//   const createScenarioMutation = useCreateNetScenario();
//   const deleteScenarios = useBulkDeleteNetScenarios();

//   const scenarios = scenariosQuery.data || [];
//   const isDisabled = scenariosQuery.isLoading || deleteScenarios.isPending;

//   const handleOptimize = () => {
//     if (!name.trim()) {
//       toast.error("Please enter a scenario name");
//       return;
//     }

//     const newScenario = {
//       netId: name.trim(),
//       description: description.trim(),
//       scenarioType,
//       ignoreRoutes,
//       demandVariationType,
//       searchType,
//       bestSolutions: parseInt(bestSolutions),
//       optimizationTime: parseInt(optimizationTime),
//       mipGap: mipGap,
//       threads: parseInt(threads),
//       problemType,
//       unitType,
//       distanceUnit,
//       currency,
//     };

//     createScenarioMutation.mutate(newScenario, {
//       onSuccess: () => {
//         // Reset form
//         setName("");
//         setDescription("");
//       },
//     });
//   };

//   // Handle mouse down on the resizer
//   const startResizing = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsResizing(true);
//   };

//   // Handle mouse move to resize
//   useEffect(() => {
//     const handleResize = (e: MouseEvent) => {
//       if (!isResizing) return;
//       const containerRect = containerRef.current?.getBoundingClientRect();
//       if (!containerRect) return;

//       // Calculate new width based on mouse position
//       let newWidth = e.clientX - containerRect.left;
//       // Enforce min and max constraints
//       newWidth = Math.max(minSidebarWidth, Math.min(newWidth, maxSidebarWidth));
//       // Update sidebar width
//       setSidebarWidth(newWidth);
//     };

//     const stopResizing = () => {
//       setIsResizing(false);
//     };

//     if (isResizing) {
//       window.addEventListener("mousemove", handleResize);
//       window.addEventListener("mouseup", stopResizing);
//     }

//     return () => {
//       window.removeEventListener("mousemove", handleResize);
//       window.removeEventListener("mouseup", stopResizing);
//     };
//   }, [isResizing]);

//   if (scenariosQuery.isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="size-6 text-slate-300 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <>
//       <NewNetScenarioSheet />
//       <EditNetScenarioSheet />
//       <div ref={containerRef} className="flex h-screen bg-background relative">
//         {/* Left sidebar with parameters */}
//         <div
//           className="border-r overflow-y-auto bg-white"
//           style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}
//         >
//           <Card className="border-0 rounded-none h-full">
//             <CardContent className="p-6 space-y-6">
//               <h2 className="text-2xl font-bold">Experiment settings</h2>

//               {/* Scenario Name and Description */}
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label className="text-sm">Scenario Name</Label>
//                   <Input
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Enter scenario name"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm">Description</Label>
//                   <Input
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder="Enter description (optional)"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-sm">Scenario Type</Label>
//                   <Select value={scenarioType} onValueChange={setScenarioType}>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Parameter Experiment">
//                         Parameter Experiment
//                       </SelectItem>
//                       <SelectItem value="Risk Experiment">
//                         Risk Experiment
//                       </SelectItem>
//                       <SelectItem value="Simulation Experiment">
//                         Simulation Experiment
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* Experiment Settings */}
//               <div className="space-y-4">
//                 {/* Ignore straight routes - full width */}
//                 <div className="flex items-center space-x-2">
//                   <Switch
//                     id="ignore-routes"
//                     checked={ignoreRoutes}
//                     onCheckedChange={setIgnoreRoutes}
//                   />
//                   <Label htmlFor="ignore-routes" className="text-sm">
//                     Ignore straight routes
//                   </Label>
//                 </div>

//                 {/* Two column grid for dropdowns and inputs */}
//                 <div className="grid grid-cols-2 gap-4">
//                   {/* Demand variation type */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">
//                       Select demand variation type
//                     </Label>
//                     <Select
//                       value={demandVariationType}
//                       onValueChange={setDemandVariationType}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="100-105">100% - 105%</SelectItem>
//                         <SelectItem value="95-100">95% - 100%</SelectItem>
//                         <SelectItem value="exact-demand">
//                           Exact demand
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Search type */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">
//                       Select search type for N best solutions
//                     </Label>
//                     <Select value={searchType} onValueChange={setSearchType}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="find-n-best">Find N best</SelectItem>
//                         <SelectItem value="solution-pool">
//                           Solution pool
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Number of best solutions */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">
//                       Number of best solutions to find
//                     </Label>
//                     <Input
//                       type="number"
//                       value={bestSolutions}
//                       onChange={(e) => setBestSolutions(e.target.value)}
//                     />
//                   </div>

//                   {/* Optimization time limit */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">
//                       Optimization time limit, sec
//                     </Label>
//                     <Input
//                       type="number"
//                       value={optimizationTime}
//                       onChange={(e) => setOptimizationTime(e.target.value)}
//                     />
//                   </div>

//                   {/* MIP Gap */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Relative MIP gap</Label>
//                     <Input
//                       type="number"
//                       step="0.000001"
//                       value={mipGap}
//                       onChange={(e) => setMipGap(e.target.value)}
//                     />
//                   </div>

//                   {/* Number of threads */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Number of threads to use</Label>
//                     <Select value={threads} onValueChange={setThreads}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {[1, 2, 4, 7, 8, 16].map((num) => (
//                           <SelectItem key={num} value={num.toString()}>
//                             {num}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Problem definition type */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Problem definition type</Label>
//                     <Select value={problemType} onValueChange={setProblemType}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="use-big-m">Use Big M</SelectItem>
//                         <SelectItem value="indicator">Indicator</SelectItem>
//                         <SelectItem value="use-sos">Use SOS</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Unit Type */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Unit type</Label>
//                     <Select value={unitType} onValueChange={setUnitType}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="ft2">ft²</SelectItem>
//                         <SelectItem value="kg">kg</SelectItem>
//                         <SelectItem value="lb">lb</SelectItem>
//                         <SelectItem value="liter">liter</SelectItem>
//                         <SelectItem value="m3">m³</SelectItem>
//                         <SelectItem value="pcs">pcs</SelectItem>
//                         <SelectItem value="ton">ton</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Distance Unit */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Distance unit</Label>
//                     <Select
//                       value={distanceUnit}
//                       onValueChange={setDistanceUnit}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="km">km</SelectItem>
//                         <SelectItem value="mile">mile</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Currency */}
//                   <div className="space-y-2">
//                     <Label className="text-sm">Currency</Label>
//                     <Select value={currency} onValueChange={setCurrency}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="EUR">EUR</SelectItem>
//                         <SelectItem value="GBP">GBP</SelectItem>
//                         <SelectItem value="USD">USD</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 onClick={handleOptimize}
//                 disabled={createScenarioMutation.isPending}
//                 className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
//               >
//                 {createScenarioMutation.isPending ? (
//                   <PauseIcon className="h-4 w-4 mr-2" />
//                 ) : (
//                   <PlayIcon className="h-4 w-4 mr-2" />
//                 )}
//                 {createScenarioMutation.isPending
//                   ? "Creating Scenario..."
//                   : "Create Scenario"}
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Resizer handle */}
//         <div
//           className={`absolute h-full w-1 bg-transparent hover:bg-primary/20 cursor-col-resize z-10 ${
//             isResizing ? "bg-primary/20" : ""
//           }`}
//           style={{ left: `${sidebarWidth}px` }}
//           onMouseDown={startResizing}
//         />

//         {/* Main content with DataTable */}
//         <div className="flex-1 overflow-hidden flex flex-col">
//   <div className="flex flex-col px-4 py-2 m-0.5 lg:flex-row lg:items-center lg:justify-between">
//     <h2 className="text-xl font-bold line-clamp-1">Simulation Scenarios</h2>
//   </div>
//   <Separator />
//  <div className="h-full overflow-auto px-4 py-4">
//               <div className="min-w-[800px]">
//                 <DataTable
//                   placeHolder="Filter scenarios..."
//                   filterKey="name"
//                   columns={columns}
//                   data={scenarios as any[]}
//                   onDelete={(row) => {
//                     const ids = row.map((r) => r.original.id)
//                     deleteScenarios.mutate({ ids })
//                   }}
//                   disabled={isDisabled}
//                 />
//               </div>
//             </div>
// </div>
//       </div>
//     </>
//   );
// }

