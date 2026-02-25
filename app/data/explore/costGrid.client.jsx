import * as React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { load, loadMessages } from "@progress/kendo-react-intl";
import likelySubtags from "cldr-core/supplemental/likelySubtags.json";
import currencyData from "cldr-core/supplemental/currencyData.json";
import weekData from "cldr-core/supplemental/weekData.json";
import numbers from "cldr-numbers-full/main/es/numbers.json";
import currencies from "cldr-numbers-full/main/es/currencies.json";
import caGregorian from "cldr-dates-full/main/es/ca-gregorian.json";
import dateFields from "cldr-dates-full/main/es/dateFields.json";
import timeZoneNames from "cldr-dates-full/main/es/timeZoneNames.json";
import esMessages from "~/kendo/rawData/explore/es.json";
import { process } from "@progress/kendo-data-query";
import sales from "~/kendo/rawData/explore/cost.json";

load(
  likelySubtags,
  currencyData,
  weekData,
  numbers,
  currencies,
  caGregorian,
  dateFields,
  timeZoneNames
);
loadMessages(esMessages, "es-ES");

export default function SalesGrid() {
  const [dataState, setDataState] = React.useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "desc",
      },
    ],
  });
  const [dataResult, setDataResult] = React.useState(process(sales, dataState));
  const dataStateChange = (event) => {
    setDataResult(process(sales, event.dataState));
    setDataState(event.dataState);
  };
  const expandChange = (event) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;
    setDataResult({
      ...dataResult,
      data: [...dataResult.data],
    });
  };
  return (
    <div>
      <Grid
        style={{
          height: "640px",
        }}
        sortable={true}
        filterable={true}
        groupable={true}
        reorderable={true}
        pageable={{
          buttonCount: 4,
          pageSizes: true,
        }}
        data={dataResult}
        {...dataState}
        onDataStateChange={dataStateChange}
        // detail={DetailComponent}
        expandField="expanded"
        onExpandChange={expandChange}
      >
        <GridColumn
          field="cost_Name"
          title="Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="costValue"
          title="value"
          filter="numeric"
          width="200px"
        />
       
      </Grid>
    </div>
  );
}
