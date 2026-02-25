import {
  Chart,
  ChartTooltip,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartValueAxis,
  ChartValueAxisItem,
  ChartTitle
} from '@progress/kendo-react-charts';

import 'hammerjs';

export function BulletChartContainer({visible, plotBands, value}){

  const hidden = { visible: visible };
  const tempPlotBands = [
    {
      from: 60,
      to: 100,
      color:  "#37b400",
      opacity: 1,
    },
    {
      from: 20,
      to: 60,
      color: "#ffc000",
      opacity: 1,
    },
    {
      from: 0,
      to: 20,
      color: "#e62325",
      opacity: 1,
    },
 
  ];


  return (
    <div>

      <Chart style={{ height: 50, width:150 }} >
        
        <ChartSeries>
          <ChartSeriesItem type="bullet" color="#fff" data={value} />

        </ChartSeries>
        <ChartCategoryAxis>
          <ChartCategoryAxisItem majorGridLines={hidden} minorGridLines={hidden} />
        </ChartCategoryAxis>
        <ChartValueAxis>
          <ChartValueAxisItem min={0} max={100} plotBands={tempPlotBands} />
        </ChartValueAxis>
        
      </Chart>

    </div>
  );
};
