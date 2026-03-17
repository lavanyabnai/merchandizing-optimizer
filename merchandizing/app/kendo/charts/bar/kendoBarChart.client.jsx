import {
  Chart,ChartTitle,ChartSeries,ChartSeriesItem,ChartCategoryAxis,ChartCategoryAxisTitle,ChartLegend,ChartCategoryAxisItem} from "@progress/kendo-react-charts";
  
import 'hammerjs'

export function MultiBarChartContainer({categories,series}){
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
            <ChartSeriesItem gap={1} spacing={0.25} name={s.name} data={s.data} type="bar" key={s.name} tooltip={{visible:true}} />
            ))}
            </ChartSeries>
        </Chart>
    )
  };
//   };
// export function SingleBarChartContainer({ categories, firstSeries }) {
//     return (
//         <Chart style={{height: 200}}>
//             <ChartTitle text="" />
//             <ChartCategoryAxis>
//             <ChartCategoryAxisItem categories={categories}>
//                 {/* <ChartCategoryAxisTitle text="Months" /> */}
//             </ChartCategoryAxisItem>
//             </ChartCategoryAxis>
//             <ChartSeries>
//             <ChartSeriesItem type="bar" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
//             {/* <ChartSeriesItem type="bar" data={secondSeries} />
//             <ChartSeriesItem type="bar" data={thirdSeries} />
//             <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//             </ChartSeries>
//         </Chart>
//     )
// }

// export function DoubleBarChartContainer({ categories, firstSeries, secondSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         <ChartTitle text="" />
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="bar" gap={2} spacing={0.25} data={firstSeries}  tooltip={{ visible: true }} />  
//          {/* or labels={{visible}} */}
//         <ChartSeriesItem type="bar" data={secondSeries} tooltip={{visible:true}} />
//         {/* <ChartSeriesItem type="bar" data={thirdSeries} />
//         <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//         </ChartSeries>
//     </Chart>
//     )

// }

// export function TripleBarChartContainer({ categories, firstSeries, secondSeries, thirdSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         <ChartTitle text="" />
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="bar" gap={2} spacing={0.25} data={firstSeries}  tooltip={{ visible: true }} />
//         <ChartSeriesItem type="bar" data={secondSeries} tooltip={{visible:true}} />
//         <ChartSeriesItem type="bar" data={thirdSeries} tooltip={{visible:true}} />
//         {/* <ChartSeriesItem type="bar" data={fourthSeries} /> */}
//         </ChartSeries>
//     </Chart>
//     )

// }

// export function QuadBarChartContainer({ categories, firstSeries, secondSeries, thirdSeries, fourthSeries }){
//     return (
//         <Chart style={{height: 200}}>
//         <ChartTitle text="" />
//         <ChartCategoryAxis>
//         <ChartCategoryAxisItem categories={categories}>
//             {/* <ChartCategoryAxisTitle text="Months" /> */}
//         </ChartCategoryAxisItem>
//         </ChartCategoryAxis>
//         <ChartSeries>
//         <ChartSeriesItem type="bar" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}}/>
//         <ChartSeriesItem type="bar" data={secondSeries} labels={{visible:true}}/>
//         <ChartSeriesItem type="bar" data={thirdSeries} labels={{visible:true}} />
//         <ChartSeriesItem type="bar" data={fourthSeries} labels={{visible:true}} />
//         </ChartSeries>
//     </Chart>
//     )

// }