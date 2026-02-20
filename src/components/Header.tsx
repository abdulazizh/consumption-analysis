'use client'

import { Sun, Moon, FileText } from 'lucide-react'

interface HeaderProps {
  darkMode: boolean
  subscribersCount: number
  onToggleDarkMode: () => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header({ darkMode, subscribersCount, onToggleDarkMode, onFileUpload }: HeaderProps) {
  return (
    <header className={`${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-lg`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://scontent.fosm23-1.fna.fbcdn.net/v/t39.30808-6/597791678_122149765448925886_173399668230574045_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGAH098HVGOikOC0r8lzeO1XTL-KxwTRh5dMv4rHBNGHkaUza-uTgbqdw_fUC76kYMu-mZVo-0h72Vb86xvCDQr&_nc_ohc=iOt_o0pu6J8Q7kNvwEIZQuA&_nc_oc=Adm_rghz5pJiqfFVpaKR_YAxzJODyCKCO6-6FvuKIcwheU6G0PjVtxUuLUyDJ6jg4kM&_nc_zt=23&_nc_ht=scontent.fosm23-1.fna&_nc_gid=wA2KmJQAnNw_g-8HPpJyZA&oh=00_Afu5RWxTAV4aqiXS7dvJS0DIBTWY4FACPd9aJ07O7Je7ZA&oe=699A5AC4" 
              alt="أيقونة التطبيق"
              className="w-10 h-10 rounded-xl shadow-lg object-cover"
            />
            <div>
              <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>تحليل صرفيات المستهلك</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{subscribersCount.toLocaleString()} مشترك</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleDarkMode} 
              className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-slate-600'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <label className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-700 text-blue-400 hover:bg-slate-600' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'} cursor-pointer transition-colors`} title="رفع ملف Excel جديد">
              <input type="file" accept=".xlsx,.xls" onChange={onFileUpload} className="hidden" />
              <FileText className="w-4 h-4" />
            </label>
          </div>
        </div>
      </div>
    </header>
  )
}
