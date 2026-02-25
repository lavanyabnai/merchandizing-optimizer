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
import sales from "~/kendo/rawData/explore/table.json";

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
 ;
  return (
    <div>
      <Grid
        style={{
          height: "300px",
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
        <GridColumn field="Jan" locked={true} width="150px" />
        <GridColumn field="Feb" locked={true} filter="numeric" width="200px" />
        <GridColumn field="Mar" filter="numeric" width="200px" />
        <GridColumn field="Apr" filter="numeric" width="200px" />
        <GridColumn field="May" filter="numeric" width="200px" />
        <GridColumn field="Jun" filter="numeric" width="200px" />
        <GridColumn field="Jul" filter="numeric" width="200px" />
        <GridColumn field="Aug" filter="numeric" width="200px" />
        <GridColumn field="Sep" filter="numeric" width="200px" />
        <GridColumn field="Oct" filter="numeric" width="200px" />
        <GridColumn field="Nov" filter="numeric" width="200px" />
        <GridColumn field="Dec" filter="numeric" width="200px" />

        <GridColumn
          field="total_demand"
          title="Total Demand"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="material_cost_pu"
          title="Material Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="inv_hold_cost_pupm"
          title="Inventory Hold Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="stockout_cost_pupm"
          title="Stockout Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="hiring_cost_pw"
          title="Hiring Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="firing_cost_pw"
          title="Firing Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="labor_hrs_pu"
          title="Labor"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="worker_cost_pm"
          title="Worker Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="overtime_cost_phr"
          title="Overtime Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="outsourcing_cost_pu"
          title="OutSourcing Cost"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="max_work_hrs_pwpm"
          title="Max Work"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="max_overtime_hrs_pwpm"
          title="Max Overtime"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="inventory_start"
          title="Inventory Start"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="inventory_end"
          title="Inventory End"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="backlog_start"
          title="Backlog Start"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="backlog_end"
          title="Backlog End"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="num_workers_start"
          title="Number Workers Start"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="min_end_workers"
          title="Min End Workers"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="max_end_workers"
          title="Max End Workers"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="num_wks_pm"
          title="Num Weeks PM"
          filter="numeric"
          width="200px"
        />
        <GridColumn
          field="num_hrs_pw"
          title="Num Hrs PW"
          filter="numeric"
          width="200px"
        />
      </Grid>
    </div>
  );
}
