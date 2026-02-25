import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import  { useEffect } from "react";
import "highcharts/modules/data";
import "highcharts/modules/exporting";
import "highcharts/modules/offline-exporting";

import "./MyChart.css"; // Import your CSS file with the added styles

export default function MyChart ()  {
  useEffect(() => {
    // Fetch data using axios, fetch, or any other preferred method
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-population-density.json",
        );
        const data = await response.json();

        // Prevent logarithmic errors in color calculation
        data.forEach((item) => {
          item.value = item.value < 1 ? 1 : item.value;
        });

        // Initialize the chart
        const chartOptions = {
          chart: {
            map: "custom/world",
          },
          title: {
            text: "Zoom in on country by double click",
          },
          mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
          },
          colorAxis: {
            min: 1,
            max: 1000,
            type: "logarithmic",
          },
          series: [
            {
              data: data,
              joinBy: ["iso-a3", "code3"],
              name: "Population density",
              states: {
                hover: {
                  color: "#a4edba",
                },
              },
              tooltip: {
                valueSuffix: "/km²",
              },
            },
          ],
        };

        // Render the chart
        Highcharts.mapChart("container", chartOptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={{}} // Empty options as the chart is initialized in useEffect
      />
    </div>
  );
}


// import WorldMap from "react-svg-worldmap";

// export default function MapContainer() {
//   const data = [
//     { country: "cn", value: 1389618778 }, // china
//     { country: "in", value: 1311559204 }, // india
//     { country: "us", value: 331883986 }, // united states
//     { country: "id", value: 264935824 }, // indonesia
//     { country: "pk", value: 210797836 }, // pakistan
//     { country: "br", value: 210301591 }, // brazil
//     { country: "ng", value: 208679114 }, // nigeria
//     { country: "bd", value: 161062905 }, // bangladesh
//     { country: "ru", value: 141944641 }, // russia
//     { country: "mx", value: 127318112 }, // mexico
//   ];

//   return (
//     <div className="flex items-center w-full  p-2">
//       <WorldMap

//         color="red"
//         title=""
//         value-suffix="people"
//         size="xl"
//         data={data}
//       />
//     </div>
//   );
// }

// import { useState } from "react";
// import WorldMap from "react-world-map";

// export default function MapContainer() {
//   const [selected, setSelected] = useState("");

//   const handleSelect = (selectedRegion) => {
//     setSelected(selectedRegion);
//   };

//   return (
//     <>
//       <WorldMap selected={selected} onSelect={handleSelect} />
//     </>
//   );
// }
