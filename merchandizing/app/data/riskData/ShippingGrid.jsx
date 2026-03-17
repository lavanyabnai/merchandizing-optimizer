'use client';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import ProcessData from '~/data/riskData/ShippingData.json';

export default function ProcessGrid() {
  return (
    <Grid
      rowHeight={50}
      // groupable={true}
      size={'medium'}
      data={ProcessData}
    >
      <GridColumn field="sources" title="Sources" />
      <GridColumn field="destination" title="Destination" />
      <GridColumn field="product" title="Product" />
      <GridColumn field="vehicletype" title="Vehicle Type" />
      <GridColumn field="type" title="Type" />
      <GridColumn field="parameter" title="Parameter" />
      <GridColumn field="priority" title="Priority" />
      <GridColumn field="Days" title="Days of Week" />
      <GridColumn field="time" title="Start Time" />
    </Grid>
  );
}
