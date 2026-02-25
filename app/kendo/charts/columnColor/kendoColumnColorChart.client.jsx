/* eslint-disable react/prop-types */
import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
} from '@progress/kendo-react-charts'
import 'hammerjs'

export function ColumnColorChartContainer({ seriesData }) {
  return (
    <>
      <div>
        <div>
          <Chart style={{ height: 250 }}>
            <ChartSeries>
              <ChartSeriesItem
                data={seriesData}
                type="column"
                field="data"
                categoryField="categories"
                labels={{ visible: true }}
              />
            </ChartSeries>
          </Chart>
        </div>
      </div>
    </>
  )
}