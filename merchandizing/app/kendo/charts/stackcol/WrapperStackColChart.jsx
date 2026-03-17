/* eslint-disable react/prop-types */
import {MultiStackColChartContainer} from '../stackcol/kendoStackColChart.client'


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

export default function WrapperMultiStackColChart({category, series}){
  return typeof document !== "undefined" ? <MultiStackColChartContainer categories={category} series={series} /> : <Fallback />
}

// export function WrapperQuadStackColChart({category, first, second, third, fourth}){
//     return typeof document !== "undefined" ? <QuadStackColChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third} fourthSeries={fourth}/> : <Fallback />
// }  

// export function WrapperTripleStackColChart({category, first, second, third}){
//     return typeof document !== "undefined" ? <TripleStackColChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third}/> : <Fallback />
// }

// export function WrapperDoubleStackColChart({category, first, second}){
//   return typeof document !== "undefined" ? <DoubleStackColChartContainer categories={category} firstSeries={first} secondSeries={second}/> : <Fallback />
// }

// export function WrapperSingleStackColChart({category, first}){
//   return typeof document !== "undefined" ? <SingleStackColChartContainer categories={category} firstSeries={first}/> : <Fallback />
// }

