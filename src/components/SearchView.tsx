'use client'

import { Search, User, Hash, ArrowRight, TrendingUp, Clock } from 'lucide-react'
import { SubscriberSummary, SubscriberInfo, UploadDetails } from '@/types'

interface SearchViewProps {
  darkMode: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  filteredSubscribers: SubscriberSummary[]
  subscribersInfo: SubscriberInfo[]
  error: string | null
  uploadStatus: string | null
  uploadDetails: UploadDetails | null
  onSelectSubscriber: (subscriber: SubscriberInfo) => void
}

export function SearchView({
  darkMode,
  searchTerm,
  onSearchChange,
  filteredSubscribers,
  subscribersInfo,
  error,
  uploadStatus,
  uploadDetails,
  onSelectSubscriber
}: SearchViewProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>ابحث عن المشترك</h2>
        <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>بالاسم أو رقم الحساب أو المقياس أو الاشتراك</p>
      </div>

      <div className="relative mb-6">
        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          placeholder="اكتب للبحث..." 
          className={`w-full ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} border-2 rounded-2xl pr-12 pl-4 py-4 text-lg focus:outline-none focus:border-blue-500`} 
          autoFocus 
        />
        {searchTerm && (
          <button 
            onClick={() => onSearchChange('')} 
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center mb-6">
          {error}
        </div>
      )}

      {uploadStatus && (
        <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
          <div className="text-center font-bold mb-2">✅ {uploadStatus}</div>
          {uploadDetails && (
            <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'} grid grid-cols-2 md:grid-cols-4 gap-2 text-center`}>
              <div className="bg-black/10 rounded-lg p-2">
                <div className="text-lg font-bold">{uploadDetails.subscribersImported?.toLocaleString()}</div>
                <div className="text-xs opacity-75">مشترك</div>
              </div>
              <div className="bg-black/10 rounded-lg p-2">
                <div className="text-lg font-bold">{uploadDetails.consumptionsImported?.toLocaleString()}</div>
                <div className="text-xs opacity-75">سجل استهلاك</div>
              </div>
              <div className="bg-black/10 rounded-lg p-2">
                <div className="text-lg font-bold text-amber-400">{uploadDetails.subscribersWithoutConsumptions?.toLocaleString()}</div>
                <div className="text-xs opacity-75">بدون قراءات</div>
              </div>
              <div className="bg-black/10 rounded-lg p-2">
                <div className="text-lg font-bold">{uploadDetails.consumerTypesCount}</div>
                <div className="text-xs opacity-75">صنف مستهلك</div>
              </div>
            </div>
          )}
        </div>
      )}

      {searchTerm && filteredSubscribers.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">لا توجد نتائج</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredSubscribers.map((sub, index) => (
          <div 
            key={index} 
            onClick={() => { 
              const info = subscribersInfo.find(s => s.رقم_الحساب === sub.رقم_الحساب)
              if (info) onSelectSubscriber(info) 
            }} 
            className={`${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-500'} border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center`}>
                  <User className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sub.اسم_المشترك}</h3>
                  <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'} mt-0.5`}>
                    <span>الحساب: {sub.رقم_الحساب}</span>
                    {sub.رقم_الحساب_القديم && <span>القديم: {sub.رقم_الحساب_القديم}</span>}
                  </div>
                </div>
              </div>
              <ArrowRight className={`w-5 h-5 ${darkMode ? 'text-slate-600 group-hover:text-blue-400' : 'text-gray-300 group-hover:text-blue-500'} transition-colors`} />
            </div>
            <div className={`flex items-center gap-4 mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="flex items-center gap-1.5 text-xs">
                <Hash className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>المقياس:</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sub.رقم_المقياس}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>الاستهلاك:</span>
                <span className="font-medium text-green-500">{sub.اجمالي_الاستهلاك.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className={`w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>الفترات:</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sub.عدد_الفترات}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
