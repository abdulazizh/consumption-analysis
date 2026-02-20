'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header, SearchView, DetailView } from '@/components'
import { ConsumptionRecord, SubscriberInfo, SubscriberSummary, UploadDetails } from '@/types'

export default function Home() {
  const [consumptions, setConsumptions] = useState<ConsumptionRecord[]>([])
  const [subscribers, setSubscribers] = useState<SubscriberSummary[]>([])
  const [subscribersInfo, setSubscribersInfo] = useState<SubscriberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubscriber, setSelectedSubscriber] = useState<SubscriberInfo | null>(null)
  const [darkMode, setDarkMode] = useState(true)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/consumptions')
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
    
    const confirmed = confirm(
      '⚠️ تنبيه هام!\n\n' +
      'سيتم حذف جميع البيانات القديمة واستبدالها بالبيانات الجديدة.\n\n' +
      'هل تريد المتابعة؟'
    )
    if (!confirmed) {
      e.target.value = ''
      return
    }
    
    setLoading(true)
    setUploadStatus('جاري رفع الملف...')
    setUploadDetails(null)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      setUploadStatus('جاري استيراد البيانات...')
      const response = await fetch('/api/consumptions', { 
        method: 'POST', 
        body: formData,
        signal: AbortSignal.timeout(300000) // timeout بعد 5 دقائق
      })
      
      // التحقق من أن الاستجابة JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // الخادم أرجع خطأ غير متوقع (ربما 502 أو 504)
        if (response.status === 502 || response.status === 504) {
          setError('الخادم مشغول. العملية قد تكون نجحت، يرجى تحديث الصفحة للتحقق.')
        } else {
          setError(`خطأ في الاتصال (${response.status}). يرجى المحاولة مرة أخرى أو تحديث الصفحة.`)
        }
        setUploadStatus(null)
        return
      }
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setUploadStatus(null)
      } else {
        setUploadStatus(data.message)
        setUploadDetails(data.details)
        await fetchData()
        setTimeout(() => {
          setUploadStatus(null)
          setUploadDetails(null)
        }, 5000)
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setError('انتهت مهلة الاتصال. العملية قد تكون نجحت، جرب تحديث الصفحة.')
      } else if (err.message?.includes('JSON')) {
        setError('خطأ في قراءة الاستجابة. يرجى تحديث الصفحة للتحقق من نجاح العملية.')
      } else {
        setError('حدث خطأ في رفع الملف: ' + (err.message || 'خطأ غير معروف'))
      }
      setUploadStatus(null)
    } 
    finally { 
      setLoading(false)
      e.target.value = ''
    }
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

  // شاشة التحميل
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

  // عرض تفاصيل المشترك
  if (selectedSubscriber) {
    return (
      <DetailView 
        subscriber={selectedSubscriber} 
        consumptions={selectedConsumptions} 
        chartData={chartData} 
        darkMode={darkMode} 
        onBack={() => setSelectedSubscriber(null)} 
        onExport={exportToCSV} 
      />
    )
  }

  // العرض الرئيسي
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`} dir="rtl">
      <Header 
        darkMode={darkMode} 
        subscribersCount={subscribers.length} 
        onToggleDarkMode={() => setDarkMode(!darkMode)} 
        onFileUpload={handleFileUpload} 
      />
      <SearchView 
        darkMode={darkMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filteredSubscribers={filteredSubscribers}
        subscribersInfo={subscribersInfo}
        error={error}
        uploadStatus={uploadStatus}
        uploadDetails={uploadDetails}
        onSelectSubscriber={setSelectedSubscriber}
      />
    </div>
  )
}
