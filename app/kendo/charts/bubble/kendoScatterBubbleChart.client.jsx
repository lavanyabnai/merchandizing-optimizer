import * as React from 'react';
import { Chart, ChartTooltip, ChartTitle, ChartLegend, ChartSeries, ChartSeriesItem, ChartXAxis, ChartXAxisItem, ChartYAxis, ChartYAxisItem } from '@progress/kendo-react-charts';
import 'hammerjs';

export default function ScatterBubbleChartContainer({data}){
    return (
        <Chart style={{height: 250}}>
            <ChartTitle text=""/>
            <ChartSeries>
            <ChartSeriesItem type="bubble" xField="x" yField="y" sizeField="size" categoryField="category" data={data} />
            </ChartSeries>
            <ChartXAxis>
            <ChartXAxisItem axisCrossingValue={-5000} majorUnit={2000}  labels={{
            format: "{0:N0}",
            skip: 1,
            rotation: 'auto'
            }} />
            </ChartXAxis>
            <ChartYAxis>
            <ChartYAxisItem labels={{
            format: '{0:N0}',
            visible: true,
            }} />
            </ChartYAxis>
            <ChartLegend visible={true} />
            <ChartTooltip format="{3}: {2:N0} applications" opacity={1} />
        </Chart>
    )

}
    
