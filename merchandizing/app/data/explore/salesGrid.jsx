import * as React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { GridPDFExport } from "@progress/kendo-react-pdf";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
// import sales from "~/kendo/rawData/explore/sales/sales.json";

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

const DetailComponent = (props) => {
  // const dataItem = props.dataItem;
  return (
    <div>
      <section
        style={{
          width: "200px",
        }}
      >
        <p>Street:</p>
        <p>City:</p>
        <p>Country:</p>
        <p>Postal Code:</p>
      </section>
    </div>
  );
};

export default function SalesGrid({sales}) {
  const [dataState, setDataState] = React.useState({
    skip: 0,
    take: 20,
    sort: [
      {
        field: "orderDate",
        dir: "desc",
      },
    ],
    group: [
      {
        field: "customer",
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
  // let _pdfExport;
  // const exportExcel = () => {
  //   _export.save();
  // };
  // let _export;
  // const exportPDF = () => {
  //   _pdfExport.save();
  // };
  return (
    <div>
      <ExcelExport
        data={sales}
        ref={(exporter) => {
          // _export = exporter;
        }}
      >
        <Grid
          style={{
            height: "500px",
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
          detail={DetailComponent}
          expandField="expanded"
          onExpandChange={expandChange}
        >
          {/* <GridToolbar>
            <button
              title="Export to Excel"
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
              onClick={exportExcel}
            >
              Export to Excel
            </button>
            &nbsp;
            <button
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
              onClick={exportPDF}
            >
              Export to PDF
            </button>
          </GridToolbar> */}
          <GridColumn field="customer" locked={true} width="150px" />
          <GridColumn field="site" locked={true} filter="Site" width="150px" />
          <GridColumn field="sku" filter="numeric"width="200px" />
          <GridColumn field="bucket" filter="numeric"width="200px" />
          <GridColumn field="selling_price" filter="numeric"width="200px" />
          <GridColumn field="mkt_fcst_qty" filter="numeric"width="200px" />
          <GridColumn field="cons_fcst_qty" filter="numeric"width="200px" />
          <GridColumn field="cust_fcst_qty" filter="numeric"width="200px" />
          <GridColumn field="fin_fcst_qty"  filter="numeric" width="200px" />
          <GridColumn field="mnth2_sales_fcst_qty"  filter="numeric" width="200px" />
          {/* {/* <GridColumn field="Jan" filter="numeric" width="200px" />
          <GridColumn field="Feb" filter="numeric" width="200px" />
          <GridColumn field="Mar" filter="numeric" width="200px" />
          <GridColumn field="Apr" filter="numeric" width="200px" />
          <GridColumn field="May" filter="numeric" width="200px" />
          <GridColumn field="Jun" filter="numeric" width="200px" /> */}
        </Grid> 
      </ExcelExport>
      <GridPDFExport
        ref={(element) => {
          // _pdfExport = element;
        }}
        margin="1cm"
      >
        {
          <Grid
            data={process(sales, {
              skip: dataState.skip,
              take: dataState.take,
            })}
          >
            {/* <GridColumn field="Customer" width="200px" />
            <GridColumn field="Jan" filter="numeric" width="200px" />
            <GridColumn field="Feb" filter="numeric" width="280px" />
            <GridColumn field="Mar" filter="numeric" width="200px" />
            <GridColumn field="Apr" filter="numeric" width="200px" />
            <GridColumn field="May" filter="numeric" width="200px" />
            <GridColumn field="Jun" filter="numeric" width="200px" /> */}
            <GridColumn field="customer" locked={true} width="560px" />
            <GridColumn field="site" width="200px" />
            <GridColumn field="sku" width="200px" />
            <GridColumn field="bucket" width="200px" />
            <GridColumn field="selling_price" width="200px" />
            <GridColumn field="mkt_fcst_qty" width="200px" />
            <GridColumn field="cons_fcst_qty" width="200px" />
            <GridColumn field="cust_fcst_qty" width="200px" />
            <GridColumn field="fin_fcst_qty" width="200px" />
            <GridColumn field="mnth2_sales_fcst_qty" width="200px" />
          </Grid>
        }
      </GridPDFExport>
    </div>
  );
}
