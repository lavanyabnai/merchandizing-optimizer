import { Grid, GridColumn } from "@progress/kendo-react-grid";
import DemandData from "~/data/riskData/DemandData.json";

export default function DemandGrid() {


  return (
    <div>
      <Grid
        data={DemandData}
        style={{ height: '700px' }}
        rowHeight={50}
        // groupable={true}
        // size={'medium'}
      >
        <GridColumn
          className="text-lg"
          field="customer"
          title="Customer"
          locked={true}
          filter="numeric"
          width="400px"
        />
        <GridColumn
          className="text-lg"
          field="product"
          title="Product"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="demandType"
          title="Demand Type"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="orderInterval"
          title="Inclusion Type"
          width="400px"
        />
        <GridColumn
          className="text-lg"
          field="quantity"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="firstOccurrence"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="timePeriod"
          title="Additional Parameters"
          width="200px"
        />
      
        <GridColumn
          className="text-lg"
          field="revenue"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="currency"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="expectedLeadTime"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="timeUnit"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className="text-lg"
          field="backorderPolicy"
          title="Additional Parameters"
          width="200px"
        />
        <GridColumn
          className=""
          field="inclusionType"
          title="Additional Parameters"
          width="200px"
        />
      </Grid>
    </div>
  )
}
