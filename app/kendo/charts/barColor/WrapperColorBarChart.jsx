import { BarColorChartContainer } from "../barColor/kendoBarColorChart.client";


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

// eslint-disable-next-line react/prop-types
export default function WrapperMultiBarColorChart({seriesData}){
    return typeof document !== "undefined" ? (
      <BarColorChartContainer seriesData={seriesData} />
    ) : (
      <Fallback />
    );
}

// export function WrapperQuadColumnChart({category, first, second, third, fourth,name}){
//     return typeof document !== "undefined" ? <QuadColumnChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third} fourthSeries={fourth} name={name}/> : <Fallback />
// }  

// export function WrapperTripleColumnChart({category, first, second, third,name}){
//     return typeof document !== "undefined" ? <TripleColumnChartContainer categories={category} firstSeries={first} secondSeries={second} thirdSeries={third} name={name}/> : <Fallback />
// }

// export function WrapperDoubleColumnChart({category, first, second,name}){
//   return typeof document !== "undefined" ? <DoubleColumnChartContainer categories={category} firstSeries={first} secondSeries={second} name={name}/> : <Fallback />
// }

// export function WrapperSingleColumnChart({category, first,name}){
//   return typeof document !== "undefined" ? <SingleColumnChartContainer categories={category} firstSeries={first} name={name}/> : <Fallback />
// }

