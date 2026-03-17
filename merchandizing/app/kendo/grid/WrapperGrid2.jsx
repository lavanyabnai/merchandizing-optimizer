import Sales from "../../data/explore/salesGrid";
import SaleSum from "../../data/explore/salesSumGrid";
import Table from "../../data/explore/tableGrid.client";
import Time from "../../data/explore/timeGrid.client";
import Cost from "../../data/explore/costGrid.client";
import Const from "../../data/explore/constGrid.client";

const Fallback = () => {
    return <div>
          <svg width={24} height={24} fill="none">
        <path
          d="M12 4.75v1.5M17.127 6.873l-1.061 1.061M19.25 12h-1.5M17.127 17.127l-1.061-1.061M12 17.75v1.5M7.934 16.066l-1.06 1.06M6.25 12h-1.5M7.934 7.934l-1.06-1.06"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>;
  };


export function WrapperSalesGrid({ data }) {
  return typeof document !== "undefined" ? (
    <Sales sales={data} />
  ) : (
    <Fallback />
  );
}
export function WrapperSalesSummaryGrid({ data }) {
  return typeof document !== "undefined" ? (
    <SaleSum data={data} />
  ) : (
    <Fallback />
  );
}

export function WrapperTableGrid() {
  return typeof document !== "undefined" ? <Table /> : <Fallback />;
}

export function WrapperTimeGrid() {
  return typeof document !== "undefined" ? <Time /> : <Fallback />;
}

export function WrapperCostGrid() {
  return typeof document !== "undefined" ? <Cost /> : <Fallback />;
}
export function WrapperConstGrid() {
  return typeof document !== "undefined" ? <Const /> : <Fallback />;
}

