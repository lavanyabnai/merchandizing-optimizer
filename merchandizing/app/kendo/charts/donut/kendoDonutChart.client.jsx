import {
  Chart,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
  ChartSeriesLabels,
} from "@progress/kendo-react-charts";
import "hammerjs";

const labelContent = (props) => {
  let formatedNumber = Number(props.dataItem.value).toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: 2,
  });
  return `${formatedNumber}`;
};
const labelContent1 = (e) => `${e.category}: \n ${e.value}%`;
export function DonutChartContainer({ series }) {
  return (
    <Chart style={{ height: 250 }}>
      <ChartSeries>
        <ChartSeriesItem
          type="donut"
          data={series}
          categoryField="category"
          field="value"
        >
          <ChartSeriesLabels
            color="#fff"
            background="none"
            content={labelContent}
          />
        </ChartSeriesItem>
      </ChartSeries>
      <ChartLegend visible={true} />
    </Chart>
  );
}

const DountDoubleChartContainer = ({ series, index, array }) => {
  const mapSeries = (series, index, array) => (
    <ChartSeriesItem
      type="donut"
      startAngle={150}
      name={series.name}
      data={series.data}
      field="value"
      categoryField="category"
      colorField="color"
    >
      {index === array.length - 1 && (
        <ChartSeriesLabels
          position="outsideEnd"
          background="none"
          content={labelContent1}
        />
      )}
    </ChartSeriesItem>
  );
  const renderTooltip = (context) => {
    const { category, series, value } = context.point || context;
    return (
      <div>
        {category} ({series.name}): {value}%
      </div>
    );
  };
  return (
    <Chart>
      <ChartSeries>
        <ChartTooltip render={renderTooltip} />
        {/* <ChartTitle text="Share of Internet Population Growth" /> */}
        <ChartLegend visible={false} />
        <ChartArea background="none" />
      </ChartSeries>
    </Chart>
  );
};
