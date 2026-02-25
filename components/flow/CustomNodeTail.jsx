import { memo } from 'react'
import { Handle, Position } from '@xyflow/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
function CustomNode({ data }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-sky-50 border-2 border-stone-400  ">
      <div className="w-80">
        
        <div
          className={classNames(
            data.bgColor,
            'flex rounded-lg  justify-center items-center border-b '
          )}
        >
          <span
            className={classNames(
              data.textColor,
              'font-bold text-lg  text-white'
            )}
          >
            {data.percentage}
          </span>
        </div>

        <div className="mt-2">
          <div className="flex justify-center text-2xl text-center">
            {data.name}
          </div>
          {/* <div className="flex justify-center text-gray-500 font-bold">
            {data.job}
          </div> */}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-1 bg-teal-500" />
      <Handle type="target" position={Position.Left} className="w-1 bg-teal-500" />
    </div>
  )
}

export default memo(CustomNode)
