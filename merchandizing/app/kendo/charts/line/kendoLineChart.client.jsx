import {
  Chart,
  ChartTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartLegend
} from "@progress/kendo-react-charts";
import "hammerjs";

export function MultiLineChartContainer({categories,series}){
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
            <ChartSeriesItem name={s.name} data={s.data} type="line" key={s.name} labels={{visible:true}}/>
            ))}
            </ChartSeries>
        </Chart>
    )
  }

// export function SingleLineChartContainer({ categories, firstSeries }) {
//     return (
//         <Chart style={{height: 200}}>
//             {/* <ChartTitle text="Units sold" /> */}
//             <ChartCategoryAxis>
//             <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//             </ChartCategoryAxisItem>
//             </ChartCategoryAxis>
//             <ChartSeries>
//             <ChartSeriesItem type="line" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
//             {/* <ChartSeriesItem type="bar" data={secondSeries} />
//             <ChartSeriesItem type="bar" data={thirdSeries} />
//             <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//             </ChartSeries>
//         </Chart>
//     )
// }

// export function DoubleLineChartContainer({ categories, firstSeries, secondSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         {/* <ChartTitle text="Units sold" /> */}
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="line" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="line" data={secondSeries} labels={{visible:true}} />
//         {/* <ChartSeriesItem type="bar" data={thirdSeries} />
//         <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//         </ChartSeries>
//     </Chart>
//     )

// }

// export function TripleLineChartContainer({ categories, firstSeries, secondSeries, thirdSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         {/* <ChartTitle text="Units sold" /> */}
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="line" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="line" data={secondSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="line" data={thirdSeries} labels={{visible:true}} />
//         {/* <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//         </ChartSeries>
//     </Chart>
//     )

// }

// export function QuadLineChartContainer({ categories, firstSeries, secondSeries, thirdSeries, fourthSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         {/* <ChartTitle text="Units sold" /> */}
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="line" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="line" data={secondSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="line" data={thirdSeries} labels={{visible:true}}/>
//         <ChartSeriesItem type="line" data={fourthSeries} labels={{visible:true}} />
//         </ChartSeries>
//     </Chart>
//     )

// }