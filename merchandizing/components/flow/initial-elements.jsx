import { MarkerType, Position } from 'reactflow'

export const nodes = [
  {
    id: '4',
    type: 'custom',
    position: { x: 0, y: 80 },
    data: {
      label: 'custom style',
    },
    sourcePosition: 'right',
    targetPosition: 'right',
  },
  {
    id: '5',
    type: 'output',
    data: {
      label: 'custom style',
    },
    className: 'circle',
    style: {
      background: '#2B6CB0',
      color: 'white',
    },
    position: { x: 250, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '6',
    type: 'output',
    style: {
      background: '#63B3ED',
      color: 'white',
      width: 100,
    },
    data: {
      label: 'Node',
    },
    position: { x: 250, y: 160 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
]

export const edges = [
  { id: 'e1-2', source: '1', target: '2' },
  {
    id: 'e1-4',
    source: '1',
    target: '3',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    type: 'smoothstep',
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },
  {
    id: 'e4-5',
    source: '4',
    target: '6',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    animated: true,
  },

]
