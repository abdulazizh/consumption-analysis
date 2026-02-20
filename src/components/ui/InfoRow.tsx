// مكون صف المعلومات

interface InfoRowProps {
  label: string
  value?: string | number | null
  darkMode: boolean
}

export function InfoRow({ label, value, darkMode }: InfoRowProps) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between">
      <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>{label}:</span>
      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
