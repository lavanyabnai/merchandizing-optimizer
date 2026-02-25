"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"

export default function ComparisonExperiment() {
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparison Experiment Settings</CardTitle>
          <CardDescription>Configure parameters to compare different scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="metrics">Comparison Metrics</TabsTrigger>
            </TabsList>

            {/* Basic Settings Tab */}
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  This is a placeholder for the Comparison Experiment settings. In a complete implementation, this would
                  include detailed configuration options for comparing different scenarios.
                </p>
              </div>
            </TabsContent>

            {/* Scenarios Tab */}
            <TabsContent value="scenarios" className="pt-4">
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">Scenario selection would be implemented here</p>
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="pt-4">
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">Comparison Metrics configuration would be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button type="submit">Run Comparison</Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  )
}
