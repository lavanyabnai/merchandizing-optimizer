"use client"

interface SectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-center rounded-t-lg bg-gradient-to-t from-indigo-400 via-cyan-400 to-sky-500 shadow-lg p-0.5">
      <div className="flex items-center w-full justify-between bg-sky-50 border rounded-t-lg text-2xl text-blue-900 font-bold">
        <div className="p-2">{title}</div>
      </div>
    </div>
  )
}
