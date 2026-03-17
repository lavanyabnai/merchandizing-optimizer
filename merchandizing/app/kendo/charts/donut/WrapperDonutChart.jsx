/* eslint-disable react/prop-types */
import {DonutChartContainer} from '../donut/kendoDonutChart.client'


const Fallback = () => {
    return <div>
          <svg width={20} height={20} fill="none">
        <path
          d="M12 4.75v1.5M17.127 6.873l-1.061 1.061M19.25 12h-1.5M17.127 17.127l-1.061-1.061M12 17.75v1.5M7.934 16.066l-1.06 1.06M6.25 12h-1.5M7.934 7.934l-1.06-1.06"
          stroke="currentColor"
          strokeWidth={0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>;
  };


export default function WrapperDonutChart({series}){
    return typeof document !== "undefined" ? <DonutChartContainer series={series} /> : <Fallback />
}

// export function WrapperDoubleDonutChart({series}){
//   return typeof document !== "undefined" ? <DountDoubleChartContainer series={series} /> : <Fallback />
// }
