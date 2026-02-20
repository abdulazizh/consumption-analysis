// مكون صندوق الإحصائيات

interface StatBoxProps {
  label: string
  value: string
  color: 'green' | 'blue' | 'yellow' | 'purple'
  darkMode: boolean
}

const colorClasses = {
  green: 'text-green-500',
  blue: 'text-blue-500',
  yellow: 'text-yellow-500',
  purple: 'text-purple-500'
}

export function StatBox({ label, value, color, darkMode }: StatBoxProps) {
  return (
    <div className="text-center py-3">
      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-lg font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  )
}
