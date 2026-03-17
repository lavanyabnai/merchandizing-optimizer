import { AgChartsReact } from 'ag-charts-react'

import { data } from './data'
// import { topology } from './topology'
import { topology, backgroundtopology, capitals } from './topology'
import CardLayout from '~/components/snop/CardLayout'
import 'ag-charts-enterprise' // Import AgCharts Enterprise if needed

import { ProgressBar } from '@progress/kendo-react-progressbars'
import { Link } from '@remix-run/react'

import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline'

const stats = [
  {
    Name: 'Sales',
    Value: '$2.2B',
    TargetAch: '75',
    status: 'Above Target',
  },
  {
    Name: 'Forcast Accuracy',
    Value: '75%',
    TargetAch: '90',
    status: 'Below Target',
  },
  {
    Name: 'On-Time & In-Full',
    Value: '80%',
    TargetAch: '90',
    status: 'Above Target',
  },
  {
    Name: 'Backlog',
    Value: '$1.2M',
    TargetAch: '50',
    status: 'Below Target',
  },
  {
    Name: 'Cost of Goods',
    Value: '$1.2B',
    TargetAch: '90',
    status: '',
  },
  {
    Name: 'Inventory',
    Value: '$600M',
    TargetAch: '50',
    status: 'Below Target',
  },

]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const options = {
  // title: {
  //   text: 'sales of American States',
  // },
  // background: {
  //   fill: 'aliceblue',
  // },
  data,
  topology,
  series: [
    {
      type: 'map-shape-background',
      fillOpacity: 0,
      stroke: '#66879933',
      fill: '#668799',
      topology: backgroundtopology,
    },
    {
      type: 'map-shape',
      idKey: 'name',
      colorKey: 'sales',
      fill: '#668799',
      fillOpacity: 0.5,
      highlightStyle: {
        item: {
          fillOpacity: 1,
        },
      },
      colorRange: ['#bae6fd', '#0ea5e9', '#60a5fa'],
    },

    // {
    //   type: 'map-marker',
    //   shape: 'square',
    //   topology: capitals,
    //   data: [
    //     { name: 'New York', long: -73.9249, lat: 40.6943 },
    //     { name: 'Los Angeles', long: -118.4068, lat: 34.1141 },
    //     { name: 'Chicago', long: -87.6866, lat: 41.8375 },
    //     { long: -80.2101, lat: 25.784, name: 'Miami' },
    //     { long: -95.3885, lat: 29.786, name: 'Houston' },
    //     { long: -96.7667, lat: 32.7935, name: 'Dallas' },
    //     { long: -122.3244, lat: 47.6211, name: 'Seattle' },
    //     { name: 'Wyoming', long: -109.080842, lat: 45.002073 },
    //   ],
    //   // tooltip: {
    //   //   renderer: ({ datum, title }) => ({
    //   //     title,
    //   //     content: `Name: ${datum.name}`,
    //   //   }),
    //   // },
    //   latitudeKey: 'lat',
    //   longitudeKey: 'long',
    //   labelKey: 'name',
    //   labelName: 'Name',
    //   idKey: 'name',
    //   size: 4,
    //   fill: '#fde047',
    //   fillOpacity: 1,
    //   strokeWidth: 0,
    // },
    {
      type: 'map-marker',
      topology: capitals,
      data: capitals.features.map((t) => {
        return { name: t.properties.name }
      }),
      title: 'CIRCLE MARKERS',
      idKey: 'name',
      size: 6,
      fill: '#546E7A',
      fillOpacity: 1,
      strokeWidth: 0,
      tooltip: {
        renderer: ({ datum, title }) => ({
          title,
          content: `Name: ${datum.name}`,
        }),
      },
    },
    {
      type: 'map-marker',
      legendItemName: 'Markers',
      title: 'DC Locations',
      data: [
        { name: 'New York', long: -73.9249, lat: 40.6943 },
        { name: 'Los Angeles', long: -118.4068, lat: 34.1141 },
        { name: 'Chicago', long: -87.6866, lat: 41.8375 },
        { long: -80.2101, lat: 25.784, name: 'Miami' },
        { long: -95.3885, lat: 29.786, name: 'Houston' },
        { long: -96.7667, lat: 32.7935, name: 'Dallas' },
        { long: -122.3244, lat: 47.6211, name: 'Seattle' },
        { name: 'Wyoming', long: -109.080842, lat: 45.002073 },
      ],
      latitudeKey: 'lat',
      longitudeKey: 'long',

      labelName: 'Name',
      label: { enabled: false },
      shape: 'pin',
      //     type MarkerShape =
      //   'circle'
      // | 'cross'
      // | 'diamond'
      // | 'heart'
      // | 'plus'
      // | 'pin'
      // | 'square'
      // | 'star'
      // | 'triangle'
      // | any;
      size: 20,
      fill: '#EF5450',
      fillOpacity: 1,
      strokeWidth: 0,
      tooltip: {
        renderer: (
          params
        ) => `<div class="ag-chart-tooltip-title" style="background-color: #fb923c">
      DC Location
    </div>
    <div class="ag-chart-tooltip-content">
      <a href="/snop/master">${params.datum.name}</a>
    </div>`,

        interaction: {
          enabled: true,
        },
      },
    },
  ],
}
export default function ChartComponent() {
    const emptyStyles = { background: '#ef4444' }
    const progressStyles = { background: '#22c55e' }
  return (
    <div className='bg-white'>
      <ul className="p-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 ">
        {stats.map((kpi) => (
          <li
            key={kpi.Name}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white border shadow-md"
          >
            <div className="relative flex flex-1 flex-col py-2 pl-3">
              <span
                className={`absolute inset-x-0 top-0 h-1 rounded-lg ${
                  kpi.status === 'Above Target'
                    ? `bg-green-500`
                    : kpi.status === 'Below Target'
                      ? `bg-red-500`
                      : ''
                }`}
              ></span>
              <div className="my-2 flex items-baseline gap-2">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    {kpi.Name}
                  </h3>
                  <h1 className="text-4xl font-bold text-black">{kpi.Value}</h1>
                </div>
                <div className="ml-auto overflow-x-hidden px-2  text-center text-base font-medium text-gray-700">
                  <ProgressBar
                    value={kpi.TargetAch}
                    style={{ width: 100, height: 12 }}
                    labelVisible={true}
                    labelPlacement={'start'}
                    emptyStyle={emptyStyles}
                    progressStyle={progressStyles}
                  />
                </div>
              </div>
          
            </div>
        
          </li>
        ))}
      </ul>
      {/* <CardLayout kpiData={stats} /> */}

      <div className="w-full h-[900px] ">
        <AgChartsReact options={options} />
      </div>
    </div>
  )
}
