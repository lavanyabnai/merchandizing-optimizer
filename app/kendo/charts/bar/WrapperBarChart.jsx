import {MultiBarChartContainer} from '@/app/kendo/charts/bar/kendoBarChart.client'


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
  
export default function WrapperMultiBarChart({category, series}){
    return typeof document !== "undefined" ? <MultiBarChartContainer categories={category} series={series} /> : <Fallback />
}

// export function WrapperQuadBarChart({category, first, second, third, fourth}){
//     return typeof document !== "undefined" ? <QuadBarChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third} fourthSeries={fourth}/> : <Fallback />
// }  

// export function WrapperTripleBarChart({category, first, second, third}){
//     return typeof document !== "undefined" ? <TripleBarChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third}/> : <Fallback />
// }

// export function WrapperDoubleBarChart({category, first, second}){
//   return typeof document !== "undefined" ? <DoubleBarChartContainer categories={category} firstSeries={first} secondSeries={second}/> : <Fallback />
// }

// export function WrapperSingleBarChart({category, first}){
//   return typeof document !== "undefined" ? <SingleBarChartContainer categories={category} firstSeries={first}/> : <Fallback />
// }