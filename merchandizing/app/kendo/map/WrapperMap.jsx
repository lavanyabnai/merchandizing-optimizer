import MapContainer from './kendomap'

export default function WrapperChartGrid() {
  return typeof document !== 'undefined' ? <MapContainer /> : null
}
