import React from 'react';
import { AgChartsReact } from 'ag-charts-react';
import 'ag-charts-enterprise';

function getBar() {
  const data = [
    {
      quarter: 'BL3 Optimal',
      dcfixedcost: 40000,
      obtransport: 65000,
      ibtransport: 75000,
      mfgcosts: 79000,
      dcHandling: 80000
    },
    {
      quarter: 'S5:BFP@250',
      dcfixedcost: 20000,
      obtransport: 36295,
      ibtransport: 8263,
      mfgcosts: 1813,
      dcHandling: 2145
    },
    {
      quarter: 'S6:BFP Infinite',
      dcfixedcost: 20000,
      obtransport: 36295,
      ibtransport: 7700,
      mfgcosts: 2125,
      dcHandling: 2145
    },
    {
      quarter: 'S7:Demand 50% BFP',
      dcfixedcost: 33000,
      obtransport: 47974,
      ibtransport: 12020,
      mfgcosts: 4125,
      dcHandling: 3575
    },
    {
      quarter: 'S8:Demand 50%  no BFP',
      dcfixedcost: 33000,
      obtransport: 47974,
      ibtransport: 14545,
      mfgcosts: 2250,
      dcHandling: 3575
    },
    {
      quarter: 'S9:3 Big DCs',
      dcfixedcost: 27000,
      obtransport: 41630,
      ibtransport: 9418,
      mfgcosts: 1500,
      dcHandling: 2546
    },
    {
      quarter: 'S10:LOS Mins',
   dcfixedcost: 40000,
      obtransport: 25856,
      ibtransport: 8861,
      mfgcosts: 1813,
      dcHandling: 2293
    }
  ];

  return data;
}

export default function Comparing() {
  const data = getBar();

  const seriesData = Object.keys(data[0]) // Get all keys of the first object
    .filter((key) => key !== 'quarter') // Exclude 'quarter' key
    .map((key) => ({
      type: 'bar',
      xKey: 'quarter',
      yKey: key,
      yName: key, // Assuming yName should be the same as yKey
      stacked: true,
      label: {
        enabled: true // Set to true or false based on your requirement
      }
    }));

  const stackBar = {
    // theme: 'ag-polychroma',
    data: data,
    series: seriesData
  };

  return (
    <>
      <div className=" text-blue-900 rounded-b-lg border">
     
        <div className="h-[450px]">
          <AgChartsReact options={stackBar as any} />
        </div>
      </div>
    </>
  );
}
