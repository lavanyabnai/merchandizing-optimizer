export const truckEmptyCat = [
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
]
export const truckEmptySeries = [
  {
    name: 'Unloading docks Utilization',
    data: [40, 50, 30, 60, 60, 40],
  },
]

export const truckQueueCat = ['0', '2', '4', '6', '8', '10']
export const truckQueueSeries = [
  {
    name: 'Unloading docks Utilization',
    data: [40, 38, 38, 34, 32, 26],
  },
]


export const QuayCat = [
  'Qc1',
  'Qc2',
  'Qc3',
  'Qc4',
  'Qc5',
  'Qc6',
  'Qc7',
  'Qc8',
  'Qc9',
]

export const Quayeries = [
  {
    name: '',
    data: [34587, 27230, 21894, 41797, 19424, 31664, 34269, 28553, 19911],
  },
]

interface Pro1Data {
  categories: string
  data: number
  color: string
}

const colors = [
  '#a3e635',
  '#374151',
  '#d946ef',
  '#ffa600',
  '#ff6361',
  '#bc5090',
  '#58508d',
  '#003f5c',
  '#ffa600',
]

export const pro1Data: Pro1Data[] = Quayeries[0].data.map((value, index) => ({
  categories: (index + 1).toString(),
  data: value,
  color: colors[index % colors.length],
}))
  // export const pro1Data = [
  //   {
  //     categories: '1',
  //     data: 60000000,
  //     color: '#a3e635',
  //   },
  //   {
  //     categories: '2',
  //     data: 108108000,
  //     color: '#374151',
  //   },
  //   {
  //     categories: '3',
  //     data: 40000000,
  //     color: '#d946ef',
  //   },
  //   {
  //     categories: '4',
  //     data: 10000000,
  //     color: '#ffa600',
  //   },
  // ]
