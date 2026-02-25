/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartLegend,
  ChartCategoryAxisItem,
} from '@progress/kendo-react-charts'
import 'hammerjs'

// eslint-disable-next-line react/prop-types
export function MultiStackBarChartContainer({ categories, series, name }) {
  return (
    <Chart style={{ height: 250 }}>
      {/* <ChartTitle text="Units sold" /> */}
      <ChartLegend position="top" orientation="horizontal" />
      <ChartCategoryAxis>
        <ChartCategoryAxisItem categories={categories} />
      </ChartCategoryAxis>
      <ChartSeries>
        {series.map((s) => (
          <ChartSeriesItem
            name={s.name}
            data={s.data}
            type="bar"
            stack={true}
            key={s.name}
            tooltip={{ visible: true }}
          />
        ))}
      </ChartSeries>
    </Chart>
  )
}

//   export function SingleStackBarChartContainer({ categories, firstSeries }) {
//       return (
//           <Chart style={{height: 200}}>
//               {/* <ChartTitle text="Units sold" /> */}
//               <ChartCategoryAxis>
//               <ChartCategoryAxisItem categories={categories}>
//                   {/* <ChartCategoryAxisTitle text="Months" /> */}
//               </ChartCategoryAxisItem>
//               </ChartCategoryAxis>
//               <ChartSeries>
//               <ChartSeriesItem type="bar" stack={true} gap={2} spacing={0.25} data={firstSeries} />
//               {/* <ChartSeriesItem type="Barumn" stack={true} data={secondSeries} />
//               <ChartSeriesItem type="Barumn" stack={true} data={thirdSeries} />
//               <ChartSeriesItem type="Barumn" stack={true} data={fourthSeries} /> */}
//               </ChartSeries>
//           </Chart>
//       )
//   }

//   export function DoubleStackBarChartContainer({ categories, firstSeries, secondSeries }){
//       return (
//           <Chart style={{height: 200}}>
//           {/* <ChartTitle text="Units sold" /> */}
//           <ChartCategoryAxis>
//           <ChartCategoryAxisItem categories={categories}>
//               {/* <ChartCategoryAxisTitle text="Months" /> */}
//           </ChartCategoryAxisItem>
//           </ChartCategoryAxis>
//           <ChartSeries>
//           <ChartSeriesItem type="bar" stack={true} gap={2} spacing={0.25} data={firstSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={secondSeries} />
//           {/* <ChartSeriesItem type="column" stack={true} data={thirdSeries} />
//           <ChartSeriesItem type="column" stack={true} data={fourthSeries} /> */}
//           </ChartSeries>
//       </Chart>
//       )

//   }

//   export function TripleStackBarChartContainer({ categories, firstSeries, secondSeries, thirdSeries }){
//       return (
//           <Chart style={{height: 200}}>
//           {/* <ChartTitle text="Units sold" /> */}
//           <ChartCategoryAxis>
//           <ChartCategoryAxisItem categories={categories}>
//               {/* <ChartCategoryAxisTitle text="Months" /> */}
//           </ChartCategoryAxisItem>
//           </ChartCategoryAxis>
//           <ChartSeries>
//           <ChartSeriesItem type="bar" stack={true} gap={2} spacing={0.25} data={firstSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={secondSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={thirdSeries} />
//           {/* <ChartSeriesItem type="column" stack={true} data={fourthSeries} /> */}
//           </ChartSeries>
//       </Chart>
//       )

//   }

//   export function QuadStackBarChartContainer({ categories, firstSeries, secondSeries, thirdSeries, fourthSeries }){
//       return (
//           <Chart style={{height: 200}}>
//           {/* <ChartTitle text="Units sold" /> */}
//           <ChartCategoryAxis>
//           <ChartCategoryAxisItem categories={categories}>
//               {/* <ChartCategoryAxisTitle text="Months" /> */}
//           </ChartCategoryAxisItem>
//           </ChartCategoryAxis>
//           <ChartSeries>
//           <ChartSeriesItem type="bar" stack={true} gap={2} spacing={0.25} data={firstSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={secondSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={thirdSeries} />
//           <ChartSeriesItem type="bar" stack={true} data={fourthSeries} />
//           </ChartSeries>
//       </Chart>
//       )

// }
