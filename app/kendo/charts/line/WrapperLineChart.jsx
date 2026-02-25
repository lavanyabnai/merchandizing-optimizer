// import {SingleLineChartContainer, DoubleLineChartContainer, TripleLineChartContainer, QuadLineChartContainer,MultiLineChartContainer} from '~/kendo/charts/line/kendoLineChart.client'
import { MultiLineChartContainer } from '../line/kendoLineChart.client'

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

export default function WrapperMultiLineChart({category, series}){
    return typeof document !== "undefined" ? <MultiLineChartContainer categories={category} series={series} /> : <Fallback />
}

// export function WrapperQuadLineChart({category, first, second, third, fourth}){
//     return typeof document !== "undefined" ? <QuadLineChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third} fourthSeries={fourth}/> : <Fallback />
// }  

// export function WrapperTripleLineChart({category, first, second, third}){
//     return typeof document !== "undefined" ? <TripleLineChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third}/> : <Fallback />
// }

// export function WrapperDoubleLineChart({category, first, second}){
//   return typeof document !== "undefined" ? <DoubleLineChartContainer categories={category} firstSeries={first} secondSeries={second}/> : <Fallback />
// }

// export function WrapperSingleLineChart({category, first}){
//   return typeof document !== "undefined" ? <SingleLineChartContainer categories={category} firstSeries={first}/> : <Fallback />
// }