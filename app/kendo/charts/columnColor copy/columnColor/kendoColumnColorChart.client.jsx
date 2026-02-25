import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
 
} from "@progress/kendo-react-charts";
import "hammerjs";


export function ColumnColorChartContainer({seriesData}){
    return (
      <>
        <div>
          <div>
            <Chart style={{  height: 250 }}>
              <ChartSeries>
                <ChartSeriesItem
                  data={seriesData}
                  type="bar"
                  field="data"
                  categoryField="categories"
                />
              </ChartSeries>
            </Chart>
          </div>
        
        </div>
      </>
    );
};
  

// export function MultiColumnChartContainer({categories,series}){
//     return (
  
//         <Chart style={{ height: 250 }}>
//           {/* <ChartTitle text="Units sold" /> */}
//             <ChartLegend position="top" orientation="horizontal" />
//             <ChartCategoryAxis>
//               <ChartCategoryAxisItem categories={categories}
//             />
//             </ChartCategoryAxis>
            
//             <ChartSeries  >
//             {series.map((s) => (
//             <ChartSeriesItem name={s.name} data={s.data} type="column" key={s.name} />
//             ))}
//             </ChartSeries>
//         </Chart>
//     )
//   };