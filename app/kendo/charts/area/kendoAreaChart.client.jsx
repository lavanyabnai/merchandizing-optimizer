import { Chart, ChartTitle, ChartSeries, ChartSeriesItem, ChartCategoryAxis, ChartCategoryAxisItem, ChartLegend } from '@progress/kendo-react-charts';
import "hammerjs";


export function MultiAreaChartContainer({categories,series}){
  return (

      <Chart style={{ height: 250 }}>
        {/* <ChartTitle text="Units sold" /> */}
          <ChartLegend position="top" orientation="horizontal" />
          <ChartCategoryAxis>
            <ChartCategoryAxisItem categories={categories}
          />
          </ChartCategoryAxis>
          <ChartSeries  >
          {series.map((s) => (
          <ChartSeriesItem name={s.name} data={s.data} type="area" key={s.name} />
          ))}
            {/* <ChartSeriesItem name={name[0]} type="area" data={firstSeries} visibleInLegend={true}/>
            <ChartSeriesItem name={name[1]} type="area" data={secondSeries} visibleInLegend={true}/>
            <ChartSeriesItem name={name[2]} type="area" data={thirdSeries} visibleInLegend={true}/> */}
          </ChartSeries>
      </Chart>
  )
};



// export function TripleAreaChartContainer({categories, firstSeries, secondSeries, thirdSeries,name}){
//   return (

//       <Chart style={{ height: 200 }}>
//         {/* <ChartTitle text="Units sold" /> */}
//           <ChartLegend position="top" orientation="horizontal" />
//           <ChartCategoryAxis>
//             <ChartCategoryAxisItem categories={categories}
//           />
//           </ChartCategoryAxis>
//           <ChartSeries >
//             <ChartSeriesItem name={name[0]} type="area" data={firstSeries} visibleInLegend={true}/>
//             <ChartSeriesItem name={name[1]} type="area" data={secondSeries} visibleInLegend={true}/>
//             <ChartSeriesItem name={name[2]} type="area" data={thirdSeries} visibleInLegend={true}/>
//           </ChartSeries>
//       </Chart>
//   )
// };

// export function DoubleAreaChartContainer({categories, firstSeries, secondSeries,name}){
//   return (

//       <Chart style={{ height: 200 }}>
//         {/* <ChartTitle text="Units sold" /> */}
//           <ChartLegend position="top" orientation="horizontal" />
//           <ChartCategoryAxis>
//             <ChartCategoryAxisItem categories={categories}
//           />
//           </ChartCategoryAxis>
//           <ChartSeries >
//             <ChartSeriesItem name={name[0]} type="area" data={firstSeries} visibleInLegend={true}/>
//             <ChartSeriesItem name={name[1]} type="area" data={secondSeries} visibleInLegend={true}/>
//           </ChartSeries>
//       </Chart>
//   )
// }

// export function SingleAreaChartContainer({categories, firstSeries,name}){
//   return (

//       <Chart style={{ height: 200 }}>
//         {/* <ChartTitle text="Units sold" /> */}
//           <ChartLegend position="top" orientation="horizontal" />
//           <ChartCategoryAxis>
//             <ChartCategoryAxisItem categories={categories}
//           />
//           </ChartCategoryAxis>
//           <ChartSeries >
//             <ChartSeriesItem name={name[0]} type="area" data={firstSeries} visibleInLegend={true}/>
//           </ChartSeries>
//       </Chart>
//   )
// }

