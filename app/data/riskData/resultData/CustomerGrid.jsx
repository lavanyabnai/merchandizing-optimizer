import { Grid, GridColumn } from "@progress/kendo-react-grid";
import CustomerData from "~/data/riskData/CustomerData.json";

export default function CustomerGrid() {

  return (
    <div>
      <Grid
        data={CustomerData}
        style={{ height: '600px', fontSize: '20px' }}
        rowHeight={50}
        // groupable={true}
        size={'medium'}
        className="text-lg"
      >
        <GridColumn
          className="text-lg"
          field="Name"
          title="Name"
          locked={true}
          filter="numeric"
          width="400px"
        />
        <GridColumn
          className="text-lg"
          field="Type"
          title="Type"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="Location"
          title="Location"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="InclusionType"
          title="Inclusion Type"
          width="400px"
        />
        <GridColumn
          className="text-lg"
          field="AdditionalParameters"
          title="Additional Parameters"
          width="200px"
        />
      </Grid>
    </div>
  )
}
