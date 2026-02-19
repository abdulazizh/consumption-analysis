'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { 
  Search, Download, Sun, Moon, Printer,
  User, Hash, ArrowRight, TrendingUp, Clock, FileText
} from 'lucide-react'

interface ConsumptionRecord {
  رقم_الحساب: string
  اسم_المشترك: string
  رقم_المقياس: string
  العنوان: string
  رقم_الفترة: number
  الاستهلاك: number
  الاستهلاك_الحقيقي: number
  المدة_يوم: number
  القراءة_السابقة: number
  تاريخ_السابقة: string
  القراءة_اللاحقة: number
  تاريخ_اللاحقة: string
  المعدل: number
  معامل_الضرب: number
}

interface SubscriberInfo {
  رقم_الحساب: string
  رقم_الحساب_القديم: string
  اسم_المشترك: string
  رقم_المقياس: string
  السجل: string
  البلوك: string
  العقار: string
  الطور: string
  معامل_الضرب: number
  رقم_الاشتراك: string
  تاريخ_النصب: string
  اخر_تسديد: number
  تاريخ_اخر_تسديد: string
  صنف_المستهلك: string
  العنوان: string
  المنطقة: string
  القطاع: string
  التصنيف: string
  القراءة_الحالية: number
  تاريخ_الحالية: string
  القراءة_السابقة: number
  تاريخ_السابقة: string
  اجمالي_الاستهلاك: number
  عدد_الفترات: number
  متوسط_الاستهلاك: number
  متوسط_المدة: number
  متوسط_المعدل: number
}

interface SubscriberSummary {
  رقم_الحساب: string
  رقم_الحساب_القديم: string
  اسم_المشترك: string
  رقم_المقياس: string
  رقم_الاشتراك: string
  العنوان: string
  اجمالي_الاستهلاك: number
  عدد_الفترات: number
  متوسط_الاستهلاك: number
  متوسط_المدة: number
}

export default function Home() {
  const [consumptions, setConsumptions] = useState<ConsumptionRecord[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberSummary[]>([])
  const [subscribersInfo, setSubscribersInfo] = useState<SubscriberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubscriber, setSelectedSubscriber] = useState<SubscriberInfo | null>(null)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async (newFileId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = newFileId ? `/api/consumptions?file=${newFileId}` : '/api/consumptions'
      const response = await fetch(url)
      const data = await response.json()
      if (data.error) { setError(data.error) }
      else {
        setConsumptions(data.consumptions || [])
        setSubscribers(data.subscribers || [])
        setSubscribersInfo(data.subscribersInfo || [])
      }
    } catch { setError('حدث خطأ في تحميل البيانات') }
    finally { setLoading(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch('/api/consumptions', { method: 'POST', body: formData })
      const data = await response.json()
      if (!data.error) {
        setConsumptions(data.consumptions || [])
        setSubscribers(data.subscribers || [])
        setSubscribersInfo(data.subscribersInfo || [])
      }
    } catch {} 
    finally { setLoading(false) }
  }

  const filteredSubscribers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []
    return subscribers.filter(s => 
      s.اسم_المشترك.toLowerCase().includes(term) ||
      s.رقم_الحساب.includes(term) ||
      s.رقم_الحساب_القديم.includes(term) ||
      s.رقم_المقياس.includes(term) ||
      s.رقم_الاشتراك.includes(term)
    ).slice(0, 50)
  }, [subscribers, searchTerm])

  const selectedConsumptions = useMemo(() => {
    if (!selectedSubscriber) return []
    return consumptions.filter(c => c.رقم_الحساب === selectedSubscriber.رقم_الحساب)
  }, [selectedSubscriber, consumptions])

  const chartData = useMemo(() => 
    selectedConsumptions.map(c => ({ name: `ف${c.رقم_الفترة}`, المعدل: c.المعدل }))
  , [selectedConsumptions])

  const exportToCSV = () => {
    if (selectedConsumptions.length === 0 || !selectedSubscriber) return
    const headers = ['القراءة السابقة', 'تاريخ السابقة', 'القراءة اللاحقة', 'تاريخ اللاحقة', 'الاستهلاك', 'المدة', 'المعدل']
    const csvContent = [headers.join(','), ...selectedConsumptions.map(r => `"${r.القراءة_السابقة}","${r.تاريخ_السابقة}","${r.القراءة_اللاحقة}","${r.تاريخ_اللاحقة}","${r.الاستهلاك}","${r.المدة_يوم}","${r.المعدل}"`)].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedSubscriber.اسم_المشترك}_استهلاك.csv`
    link.click()
  }

  if (loading && subscribers.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`} dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-lg`}>جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (selectedSubscriber) {
    return (
      <DetailView subscriber={selectedSubscriber} consumptions={selectedConsumptions} chartData={chartData} darkMode={darkMode} onBack={() => setSelectedSubscriber(null)} onExport={exportToCSV} />
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`} dir="rtl">
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
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{subscribers.length.toLocaleString()} مشترك</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-slate-600'}`}>
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <label className={`p-2.5 rounded-xl ${darkMode ? 'bg-slate-700 text-blue-400' : 'bg-gray-100 text-blue-600'} cursor-pointer`}>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                <FileText className="w-4 h-4" />
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>ابحث عن المشترك</h2>
          <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>بالاسم أو رقم الحساب أو المقياس أو الاشتراك</p>
        </div>

        <div className="relative mb-6">
          <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-400'}`} />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="اكتب للبحث..." className={`w-full ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} border-2 rounded-2xl pr-12 pl-4 py-4 text-lg focus:outline-none focus:border-blue-500`} autoFocus />
          {searchTerm && <button onClick={() => setSearchTerm('')} className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}>✕</button>}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-center mb-6">{error}</div>}

        {searchTerm && filteredSubscribers.length === 0 && !loading && (
          <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">لا توجد نتائج</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredSubscribers.map((sub, index) => (
            <div key={index} onClick={() => { const info = subscribersInfo.find(s => s.رقم_الحساب === sub.رقم_الحساب); if (info) setSelectedSubscriber(info) }} className={`${darkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-500'} border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group`}>
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
    </div>
  )
}

function DetailView({ subscriber, consumptions, chartData, darkMode, onBack, onExport }: { subscriber: SubscriberInfo; consumptions: ConsumptionRecord[]; chartData: { name: string; المعدل: number }[]; darkMode: boolean; onBack: () => void; onExport: () => void }) {
  const [showChart, setShowChart] = useState(false)
  const totalDays = consumptions.reduce((s, r) => s + r.المدة_يوم, 0)
  const totalConsum = consumptions.reduce((s, r) => s + r.الاستهلاك, 0)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`} dir="rtl">
      <header className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 print:hidden`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className={`flex items-center gap-2 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <ArrowRight className="w-5 h-5" /><span>رجوع</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowChart(!showChart)} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{showChart ? 'الجدول' : 'الرسم'}</button>
              <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"><Download className="w-4 h-4" />تصدير</button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"><Printer className="w-4 h-4" />طباعة</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 print:py-2">
        {/* Print Layout - Single Page */}
        <div className="print-report">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-2 pb-2 border-b-2 border-gray-400">
            <h1 className="text-base font-bold">تحليل صرفيات المستهلك</h1>
            <p className="text-xs text-gray-600">{new Date().toLocaleDateString('ar')}</p>
          </div>

          {/* Info Table - Print */}
          <table className="hidden print:table w-full text-[9pt] mb-2 border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold w-[12%]">المشترك</td>
                <td className="border border-gray-300 px-1 py-0.5 font-bold">{subscriber.اسم_المشترك}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold w-[12%]">الحساب</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.رقم_الحساب}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold w-[12%]">القديم</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.رقم_الحساب_القديم || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">المقياس</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.رقم_المقياس}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">الاشتراك</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.رقم_الاشتراك || '-'}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">النصب</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.تاريخ_النصب || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">السجل</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.السجل}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">البلوك</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.البلوك || '-'}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">العقار</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.العقار || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">الطور</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.الطور || '-'}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">الضرب</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.معامل_الضرب || '-'}</td>
                <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">الصنف</td>
                <td className="border border-gray-300 px-1 py-0.5">{subscriber.صنف_المستهلك || '-'}</td>
              </tr>
              {subscriber.العنوان && (
                <tr>
                  <td className="border border-gray-300 bg-gray-100 px-1 py-0.5 font-bold">العنوان</td>
                  <td className="border border-gray-300 px-1 py-0.5" colSpan={5}>{subscriber.العنوان}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Stats - Print */}
          <div className="hidden print:flex justify-between mb-2 p-1 bg-gray-100 border border-gray-300 text-[9pt]">
            <span>الاستهلاك: <b className="text-green-700">{subscriber.اجمالي_الاستهلاك.toLocaleString()}</b></span>
            <span>الفترات: <b className="text-blue-700">{subscriber.عدد_الفترات}</b></span>
            <span>المتوسط: <b className="text-amber-700">{subscriber.متوسط_الاستهلاك.toLocaleString()}</b></span>
            <span>المعدل: <b className="text-purple-700">{subscriber.متوسط_المعدل.toLocaleString()}</b></span>
          </div>

          {/* Screen View - Subscriber Card */}
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden mb-4 print:hidden`}>
            <div className={`${darkMode ? 'bg-gradient-to-l from-blue-600 to-blue-500' : 'bg-blue-500'} px-4 py-4`}>
              <h2 className="text-white font-bold text-lg">{subscriber.اسم_المشترك}</h2>
              <div className="flex items-center gap-4 mt-1 text-blue-100 text-sm">
                <span>الحساب: {subscriber.رقم_الحساب}</span>
                {subscriber.رقم_الحساب_القديم && <span>القديم: {subscriber.رقم_الحساب_القديم}</span>}
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <InfoRow label="المقياس" value={subscriber.رقم_المقياس} darkMode={darkMode} />
                <InfoRow label="الاشتراك" value={subscriber.رقم_الاشتراك} darkMode={darkMode} />
                <InfoRow label="السجل" value={subscriber.السجل} darkMode={darkMode} />
                <InfoRow label="الطور" value={subscriber.الطور} darkMode={darkMode} />
                <InfoRow label="البلوك" value={subscriber.البلوك} darkMode={darkMode} />
                <InfoRow label="العقار" value={subscriber.العقار} darkMode={darkMode} />
                <InfoRow label="معامل الضرب" value={subscriber.معامل_الضرب?.toString()} darkMode={darkMode} />
                <InfoRow label="تاريخ النصب" value={subscriber.تاريخ_النصب} darkMode={darkMode} />
                <InfoRow label="الصنف" value={subscriber.صنف_المستهلك} darkMode={darkMode} />
              </div>
              
              {/* آخر تسديد */}
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'} grid grid-cols-2 gap-4 text-sm`}>
                <div className="flex items-center gap-2">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>آخر تسديد:</span>
                  <span className={`font-bold text-green-500`}>{subscriber.اخر_تسديد?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>تاريخ التسديد:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{subscriber.تاريخ_اخر_تسديد || '-'}</span>
                </div>
              </div>
              
              {subscriber.العنوان && (
                <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>العنوان: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{subscriber.العنوان}</span>
                </div>
              )}
            </div>
            <div className={`grid grid-cols-4 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <StatBox label="الاستهلاك" value={subscriber.اجمالي_الاستهلاك.toLocaleString()} color="green" />
              <StatBox label="الفترات" value={subscriber.عدد_الفترات.toString()} color="blue" />
              <StatBox label="المتوسط" value={subscriber.متوسط_الاستهلاك.toLocaleString()} color="yellow" />
              <StatBox label="المعدل" value={subscriber.متوسط_المعدل.toLocaleString()} color="purple" />
            </div>
          </div>

          {/* Consumption Table */}
          <div className={`${showChart ? 'hidden print:block' : ''} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden print:border-gray-300 print:rounded-none`}>
            <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'} print:hidden`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>جدول الاستهلاك</h3>
                {subscriber.معامل_الضرب > 1 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                    معامل الضرب: {subscriber.معامل_الضرب}×
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm print:text-[8pt]">
                <thead className={`${darkMode ? 'bg-slate-700/30' : 'bg-gray-50'} print:bg-gray-100`}>
                  <tr>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">#</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">القراءة السابقة</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">التاريخ</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">القراءة اللاحقة</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">التاريخ</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">الاستهلاك</th>
                    {subscriber.معامل_الضرب > 1 && (
                      <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">الحقيقي</th>
                    )}
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">المدة</th>
                    <th className="px-2 py-1 print:px-1 print:py-0.5 text-center font-medium border border-gray-300">المعدل</th>
                  </tr>
                </thead>
                <tbody>
                  {consumptions.map((row, index) => (
                    <tr key={index} className={`${index % 2 === 1 ? (darkMode ? 'bg-slate-700/20' : 'bg-gray-50') : ''} print:bg-white`}>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300">{row.رقم_الفترة}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center font-mono border border-gray-300">{row.القراءة_السابقة.toLocaleString()}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300">{row.تاريخ_السابقة}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center font-mono border border-gray-300">{row.القراءة_اللاحقة.toLocaleString()}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300">{row.تاريخ_اللاحقة}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center font-bold text-green-500 print:text-green-700 border border-gray-300">{row.الاستهلاك.toLocaleString()}</td>
                      {subscriber.معامل_الضرب > 1 && (
                        <td className="px-2 py-1 print:px-1 print:py-0.5 text-center font-bold text-amber-500 print:text-amber-700 border border-gray-300">{row.الاستهلاك_الحقيقي?.toLocaleString() || Math.round(row.الاستهلاك / subscriber.معامل_الضرب).toLocaleString()}</td>
                      )}
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300">{row.المدة_يوم}</td>
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center font-bold text-blue-500 print:text-blue-700 border border-gray-300">{row.المعدل.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} font-bold print:bg-gray-200`}>
                    <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300" colSpan={5}>الإجمالي</td>
                    <td className="px-2 py-1 print:px-1 print:py-0.5 text-center text-green-500 print:text-green-700 border border-gray-300">{totalConsum.toLocaleString()}</td>
                    {subscriber.معامل_الضرب > 1 && (
                      <td className="px-2 py-1 print:px-1 print:py-0.5 text-center text-amber-500 print:text-amber-700 border border-gray-300">{Math.round(totalConsum / subscriber.معامل_الضرب).toLocaleString()}</td>
                    )}
                    <td className="px-2 py-1 print:px-1 print:py-0.5 text-center border border-gray-300">{totalDays}</td>
                    <td className="px-2 py-1 print:px-1 print:py-0.5 text-center text-blue-500 print:text-blue-700 border border-gray-300">{totalDays > 0 ? Math.round(totalConsum / subscriber.معامل_الضرب / totalDays).toLocaleString() : 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart */}
          {showChart && chartData.length > 0 && (
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 print:hidden`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>تحليل معدل الاستهلاك اليومي</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>المعدل اليومي</span>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke={darkMode ? "#9ca3af" : "#6b7280"} 
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                  />
                  <YAxis 
                    stroke={darkMode ? "#9ca3af" : "#6b7280"} 
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff', 
                      border: '1px solid #374151', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value.toLocaleString()} / يوم`, 'المعدل']}
                  />
                  <Bar 
                    dataKey="المعدل" 
                    fill="url(#colorGradient)" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Stats Summary */}
              <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'} grid grid-cols-3 gap-4 text-center`}>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>أعلى معدل</p>
                  <p className="text-lg font-bold text-red-400">{Math.max(...chartData.map(d => d.المعدل)).toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>أدنى معدل</p>
                  <p className="text-lg font-bold text-green-400">{Math.min(...chartData.map(d => d.المعدل)).toLocaleString()}</p>
                </div>
                <div>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>المتوسط</p>
                  <p className="text-lg font-bold text-amber-400">{Math.round(chartData.reduce((s, d) => s + d.المعدل, 0) / chartData.length).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* No Chart Data Message */}
          {showChart && chartData.length === 0 && (
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 print:hidden text-center`}>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>لا توجد بيانات كافية لعرض الرسم البياني</p>
            </div>
          )}

          {/* Last Payment - Print Only */}
          <div className="hidden print:flex justify-between mt-2 p-1 bg-gray-100 border border-gray-300 text-[9pt]">
            <span>آخر تسديد: <b className="text-green-700">{subscriber.اخر_تسديد?.toLocaleString() || '-'}</b></span>
            <span>تاريخ التسديد: <b className="text-blue-700">{subscriber.تاريخ_اخر_تسديد || '-'}</b></span>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block text-center mt-2 pt-1 border-t border-gray-300 text-[7pt] text-gray-500">
            تحليل صرفيات المستهلك - abdulaziz H Marie
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; font-size: 9pt; }
          .print\\:hidden { display: none !important; }
          .print\\:table { display: table !important; }
          .print\\:flex { display: flex !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}

function InfoRow({ label, value, darkMode }: { label: string; value?: string; darkMode: boolean }) {
  return <div><span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>{label}: </span><span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value || '-'}</span></div>
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = { green: 'text-green-400', blue: 'text-blue-400', yellow: 'text-yellow-400', purple: 'text-purple-400' }
  return <div className="text-center py-3"><p className="text-xs text-gray-500">{label}</p><p className={`text-lg font-bold ${colors[color]}`}>{value}</p></div>
}
