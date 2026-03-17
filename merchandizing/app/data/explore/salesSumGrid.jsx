import * as React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import sales from "~/kendo/rawData/explore/sales/salesSum.json";



export default function SalesSumGrid({data}) {
  // const [dataState, setDataState] = React.useState({
  //   skip: 0,
  //   take: 20,
  //   sort: [
  //     {
  //       field: "orderDate",
  //       dir: "desc",
  //     },
  //   ],
  //   group: [
  //     {
  //       field: "Customer",
  //     },
  //   ],
  // });

  return (
    <div>
      <Grid data={data}>
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
    </div>
  );
}
