import {
  Chart,
  ChartTitle,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartLegend,
  ChartCategoryAxisTitle,
  ChartCategoryAxisItem,
} from "@progress/kendo-react-charts";
import "hammerjs";

export function MultiColumnChartContainer({categories,series}){
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
            <ChartSeriesItem name={s.name} data={s.data} type="column" key={s.name} />
            ))}
            </ChartSeries>
        </Chart>
    )
  };

export function SingleColumnChartContainer({ categories, firstSeries,name }) {
    return (
        <Chart style={{height: 200}}>
             <ChartLegend position="bottom" orientation="horizontal"/>
            <ChartTitle  />
            <ChartCategoryAxis>
            <ChartCategoryAxisItem categories={categories}>
                {/* <ChartCategoryAxisTitle text="Months" /> */}
            </ChartCategoryAxisItem>
            </ChartCategoryAxis>
            <ChartSeries>
            <ChartSeriesItem name={name[0]} type="column" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
            </ChartSeries>
            
        </Chart>
    )
}

export function DoubleColumnChartContainer({ categories, firstSeries, secondSeries}){
    return (
        <Chart style={{height: 200}}>
             <ChartLegend position="bottom" orientation="horizontal"/>
        <ChartTitle />
        <ChartCategoryAxis>
        <ChartCategoryAxisItem categories={categories}>
            {/* <ChartCategoryAxisTitle text="Months" /> */}
        </ChartCategoryAxisItem>
        </ChartCategoryAxis>
        <ChartSeries>
        <ChartSeriesItem type="column" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
        <ChartSeriesItem  type="column" data={secondSeries} labels={{visible:true}} />
        {/* <ChartSeriesItem type="column" data={thirdSeries} />
        <ChartSeriesItem type="column" data={fourthSeries} /> */}
        </ChartSeries>
    </Chart>
    )

}

export function TripleColumnChartContainer({ categories, firstSeries, secondSeries, thirdSeries,name }){
    
    return (
        <Chart style={{height: 200}}>
             <ChartLegend position="bottom" orientation="horizontal"/>
        <ChartTitle text="" />
        <ChartCategoryAxis>
        <ChartCategoryAxisItem categories={categories}>
            {/* <ChartCategoryAxisTitle text="Months" /> */}
        </ChartCategoryAxisItem>
        </ChartCategoryAxis>
        <ChartSeries>
        <ChartSeriesItem  type="column" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
        <ChartSeriesItem type="column" data={secondSeries} labels={{visible:true}} />
        <ChartSeriesItem type="column" data={thirdSeries} labels={{visible:true}} />
        {/* <ChartSeriesItem type="column" data={fourthSeries} /> */}
        </ChartSeries>
        
    </Chart>
    )

}

export function QuadColumnChartContainer({ categories, firstSeries, secondSeries, thirdSeries, fourthSeries,name }){
    return (
        <Chart style={{height: 200}}>
        <ChartLegend position="bottom" orientation="horizontal"/>
        <ChartTitle text="" />
        <ChartCategoryAxis>
        <ChartCategoryAxisItem categories={categories}>
            {/* <ChartCategoryAxisTitle text="Months" /> */}
        </ChartCategoryAxisItem>
        </ChartCategoryAxis>
        <ChartSeries>
        <ChartSeriesItem  type="column" gap={2} spacing={0.25} data={firstSeries} labels={{visible:true}} />
        <ChartSeriesItem  type="column" data={secondSeries} labels={{visible:true}} />
        <ChartSeriesItem  type="column" data={thirdSeries} labels={{visible:true}} />
        <ChartSeriesItem  type="column" data={fourthSeries} labels={{visible:true}} />
        </ChartSeries>
    </Chart>
    )

}