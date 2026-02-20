'use client'

import { useState } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ArrowRight, Download, Printer } from 'lucide-react'
import { SubscriberInfo, ConsumptionRecord } from '@/types'
import { InfoRow, StatBox } from './ui'

interface DetailViewProps {
  subscriber: SubscriberInfo
  consumptions: ConsumptionRecord[]
  chartData: { name: string; المعدل: number }[]
  darkMode: boolean
  onBack: () => void
  onExport: () => void
}

export function DetailView({ subscriber, consumptions, chartData, darkMode, onBack, onExport }: DetailViewProps) {
  const [showChart, setShowChart] = useState(false)
  const totalDays = consumptions.reduce((s, r) => s + r.المدة_يوم, 0)
  const totalConsum = consumptions.reduce((s, r) => s + r.الاستهلاك, 0)

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} print:bg-white print:text-black`} dir="rtl">
      <header className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 print:hidden`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className={`flex items-center gap-2 ${darkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <ArrowRight className="w-5 h-5" /><span>رجوع</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowChart(!showChart)} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                {showChart ? 'الجدول' : 'الرسم'}
              </button>
              <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                <Download className="w-4 h-4" />تصدير
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                <Printer className="w-4 h-4" />طباعة
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 print:py-2">
        <div className="print-report">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-3 pb-2 border-b-2 border-gray-400">
            <h1 className="text-lg font-bold text-black">تقرير تحليل استهلاك المشترك</h1>
            <p className="text-xs text-gray-600">{new Date().toLocaleDateString('ar')}</p>
          </div>

          {/* Info Table - Print */}
          <table className="hidden print:table w-full text-[9pt] mb-2 border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold w-[12%]">المشترك</td>
                <td className="border border-gray-300 px-1 py-0.5 font-bold text-black">{subscriber.اسم_المشترك}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold w-[12%]">الحساب</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.رقم_الحساب}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold w-[12%]">القديم</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.رقم_الحساب_القديم || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">المقياس</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.رقم_المقياس}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">الاشتراك</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.رقم_الاشتراك || '-'}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">النصب</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.تاريخ_النصب || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">السجل</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.السجل}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">البلوك</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.البلوك || '-'}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">العقار</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.العقار || '-'}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">الطور</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.الطور || '-'}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">الضرب</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.معامل_الضرب || '-'}</td>
                <td className="border border-gray-300 bg-gray-50 px-1 py-0.5 font-bold">الصنف</td>
                <td className="border border-gray-300 px-1 py-0.5 text-black">{subscriber.صنف_المستهلك || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* العنوان - Print */}
          {subscriber.العنوان && (
            <div className="hidden print:block mb-2 p-1 border border-gray-300 text-[9pt]">
              <span className="font-bold">العنوان:</span> {subscriber.العنوان}
            </div>
          )}

          {/* Debt Fields - Print */}
          <div className="hidden print:flex justify-between mb-2 p-1.5 border border-gray-300 text-[9pt]">
            <span>المجموع المطلوب: <b className="text-red-600" dir="ltr">{subscriber.المجموع_المطلوب?.toLocaleString() || 0}</b></span>
            <span>الديون: <b className="text-orange-600" dir="ltr">{subscriber.الديون?.toLocaleString() || 0}</b></span>
            <span>الدين المفصول: <b className="text-amber-600" dir="ltr">{subscriber.الدين_المفصول?.toLocaleString() || 0}</b></span>
            <span>الدين المجمد: <b className="text-yellow-700" dir="ltr">{subscriber.الدين_المجمد?.toLocaleString() || 0}</b></span>
          </div>

          {/* Stats - Print */}
          <div className="hidden print:flex justify-between mb-2 p-1 border border-gray-300 text-[9pt]">
            <span>الاستهلاك: <b className="text-green-600" dir="ltr">{subscriber.اجمالي_الاستهلاك.toLocaleString()}</b></span>
            <span>الفترات: <b className="text-blue-600">{subscriber.عدد_الفترات}</b></span>
            <span>المتوسط: <b className="text-amber-600" dir="ltr">{subscriber.متوسط_الاستهلاك.toLocaleString()}</b></span>
            <span>المعدل: <b className="text-purple-600" dir="ltr">{subscriber.متوسط_المعدل.toLocaleString()}</b></span>
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
              
              {/* العنوان */}
              {subscriber.العنوان && (
                <div className={`mb-3 pb-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <span className={darkMode ? 'text-slate-400' : 'text-gray-500'}>العنوان: </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-900'}>{subscriber.العنوان}</span>
                </div>
              )}
              
              {/* الديون */}
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'} grid grid-cols-2 md:grid-cols-4 gap-3 text-sm`}>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>المجموع المطلوب:</span>
                  <span className="font-bold text-red-500 font-mono" dir="ltr">{subscriber.المجموع_المطلوب?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>الديون:</span>
                  <span className="font-bold text-orange-500 font-mono" dir="ltr">{subscriber.الديون?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>الدين المفصول:</span>
                  <span className="font-bold text-amber-500 font-mono" dir="ltr">{subscriber.الدين_المفصول?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>الدين المجمد:</span>
                  <span className="font-bold text-yellow-500 font-mono" dir="ltr">{subscriber.الدين_المجمد?.toLocaleString() || 0}</span>
                </div>
              </div>
              
              {/* آخر تسديد */}
              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-700' : 'border-gray-100'} grid grid-cols-2 gap-4 text-sm`}>
                <div className="flex items-center gap-2">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>آخر تسديد:</span>
                  <span className="font-bold text-green-500 font-mono" dir="ltr">{subscriber.اخر_تسديد?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>تاريخ التسديد:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{subscriber.تاريخ_اخر_تسديد || '-'}</span>
                </div>
              </div>
            </div>
            <div className={`grid grid-cols-4 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <StatBox label="الاستهلاك" value={subscriber.اجمالي_الاستهلاك.toLocaleString()} color="green" darkMode={darkMode} />
              <StatBox label="الفترات" value={subscriber.عدد_الفترات.toString()} color="blue" darkMode={darkMode} />
              <StatBox label="المتوسط" value={subscriber.متوسط_الاستهلاك.toLocaleString()} color="yellow" darkMode={darkMode} />
              <StatBox label="المعدل" value={subscriber.متوسط_المعدل.toLocaleString()} color="purple" darkMode={darkMode} />
            </div>
          </div>

          {/* Consumption Table */}
          <ConsumptionTable 
            consumptions={consumptions} 
            subscriber={subscriber} 
            darkMode={darkMode} 
            showChart={showChart}
            totalConsum={totalConsum}
            totalDays={totalDays}
          />

          {/* Chart */}
          {showChart && chartData.length > 0 && (
            <ConsumptionChart chartData={chartData} darkMode={darkMode} />
          )}
          
          {showChart && chartData.length === 0 && (
            <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl p-8 print:hidden text-center`}>
              <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>لا توجد بيانات كافية لعرض الرسم البياني</p>
            </div>
          )}

          {/* Last Payment - Print Only */}
          <div className="hidden print:flex justify-between mt-2 p-1 border border-gray-300 text-[9pt]">
            <span>آخر تسديد: <b className="text-green-600" dir="ltr">{subscriber.اخر_تسديد?.toLocaleString() || '-'}</b></span>
            <span>تاريخ التسديد: <b className="text-blue-600">{subscriber.تاريخ_اخر_تسديد || '-'}</b></span>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block text-center mt-3 pt-2 border-t border-gray-400 text-[8pt] text-gray-600">
            <div>تم إنشاء هذا التقرير بواسطة نظام تحليل استهلاك المشتركين</div>
            <div className="mt-1">Developed by: <b>Abdulaziz H. Marie</b></div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact; 
            font-size: 9pt; 
            background: white !important;
          }
          .print-report { font-family: 'Segoe UI', Tahoma, sans-serif; }
        }
      `}</style>
    </div>
  )
}

// مكون جدول الاستهلاك
function ConsumptionTable({ 
  consumptions, 
  subscriber, 
  darkMode, 
  showChart,
  totalConsum,
  totalDays 
}: { 
  consumptions: ConsumptionRecord[]
  subscriber: SubscriberInfo
  darkMode: boolean
  showChart: boolean
  totalConsum: number
  totalDays: number
}) {
  return (
    <div className={`${showChart ? 'hidden print:block' : ''} ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-2xl overflow-hidden print:border-gray-300 print:rounded-none print:bg-white`}>
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
          <thead className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'} print:bg-gray-100`}>
            <tr>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>#</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>القراءة السابقة</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>التاريخ</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>القراءة اللاحقة</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>التاريخ</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>الاستهلاك</th>
              {subscriber.معامل_الضرب > 1 && (
                <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>الحقيقي</th>
              )}
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>المدة</th>
              <th className={`px-2 py-2 print:px-1 print:py-0.5 text-center font-medium ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-700 border-gray-300'} border print:border-gray-300 print:text-black`}>المعدل</th>
            </tr>
          </thead>
          <tbody>
            {consumptions.map((row, index) => (
              <tr key={index} className={`${index % 2 === 1 ? (darkMode ? 'bg-slate-700/30' : 'bg-gray-50') : ''} print:bg-white`}>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.رقم_الفترة}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center font-mono ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.القراءة_السابقة.toLocaleString()}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.تاريخ_السابقة}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center font-mono ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.القراءة_اللاحقة.toLocaleString()}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.تاريخ_اللاحقة}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center font-bold text-green-400 print:text-green-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>{row.الاستهلاك.toLocaleString()}</td>
                {subscriber.معامل_الضرب > 1 && (
                  <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center font-bold text-amber-400 print:text-amber-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>
                    {row.الاستهلاك_الحقيقي?.toLocaleString() || Math.round(row.الاستهلاك / subscriber.معامل_الضرب).toLocaleString()}
                  </td>
                )}
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{row.المدة_يوم}</td>
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center font-bold text-blue-400 print:text-blue-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>{row.المعدل.toLocaleString()}</td>
              </tr>
            ))}
            <tr className={`${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} font-bold print:bg-gray-50`}>
              <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`} colSpan={5}>الإجمالي</td>
              <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center text-green-400 print:text-green-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>{totalConsum.toLocaleString()}</td>
              {subscriber.معامل_الضرب > 1 && (
                <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center text-amber-400 print:text-amber-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>
                  {Math.round(totalConsum / subscriber.معامل_الضرب).toLocaleString()}
                </td>
              )}
              <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center ${darkMode ? 'text-slate-300 border-slate-600' : 'text-gray-900 border-gray-300'} border print:border-gray-300 print:text-black`}>{totalDays}</td>
              <td className={`px-2 py-1.5 print:px-1 print:py-0.5 text-center text-blue-400 print:text-blue-600 ${darkMode ? 'border-slate-600' : 'border-gray-300'} border print:border-gray-300`}>
                {totalDays > 0 ? Math.round(totalConsum / subscriber.معامل_الضرب / totalDays).toLocaleString() : 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// مكون الرسم البياني
function ConsumptionChart({ chartData, darkMode }: { chartData: { name: string; المعدل: number }[]; darkMode: boolean }) {
  return (
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
  )
}
