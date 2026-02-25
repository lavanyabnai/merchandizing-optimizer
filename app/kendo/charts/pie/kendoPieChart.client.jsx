import { Chart, ChartLegend, ChartSeries, ChartSeriesItem,ChartSeriesLabels, ChartTitle } from '@progress/kendo-react-charts';
import 'hammerjs';

const labelContent = props => {
  let formatedNumber = Number(props.dataItem.value).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 2
  });
  return `${formatedNumber}`;
};


export function PieChartContainer({series}){
return(

    <Chart style={{height: 250}}>
        {/* <ChartTitle text='World Population by Broad Age Groups' /> */}
        <ChartLegend position="top" orientation="horizontal" />
        <ChartSeries>

        <ChartSeriesItem type="pie" data={series} field="value" categoryField="category"
        labels={{
          visible: true,
          // content: labelContent,
          position: "insideEnd",
          }}
        />
        
        </ChartSeries>
        <ChartLegend visible={true}/>
    </Chart>
    )
}

export function PieChartContainerVisible({series}){
  return(
  
      <Chart style={{height: 200}}>
          {/* <ChartTitle text='World Population by Broad Age Groups' /> */}
          <ChartLegend position="bottom" orientation="horizontal" />
          <ChartSeries>
          <ChartSeriesItem type="pie" data={series} field="value" categoryField="category" labels={{
          visible: true,
          content: labelContent
          }} overlay={{ gradient: "sharpBevel" }} tooltip={{ visible: true }}/>
          </ChartSeries>
      </Chart>
      )
  }
// export default PieChartContainer;