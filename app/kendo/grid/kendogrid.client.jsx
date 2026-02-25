import * as React from "react";
import * as ReactDOM from "react-dom";
import { Grid, GridColumn } from "@progress/kendo-react-grid";

export function GridContainer({data}){
  return (
    <Grid
      style={{
        height: "200px",
      }}
      data={data}
    >
      <GridColumn field="Item Description" width="250px" />
      <GridColumn field="Spend" />
      <GridColumn field="MinUnit" />
      <GridColumn field="Avg Unit"  />
      <GridColumn field="Max Unit" />
      <GridColumn field="Agreement Price"   />
      <GridColumn field="Savings Potential" />
    </Grid>
  );
};