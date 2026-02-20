// أنواع البيانات للمشروع

export interface ConsumptionRecord {
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

export interface SubscriberInfo {
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
  المجموع_المطلوب: number
  الديون: number
  الدين_المفصول: number
  الدين_المجمد: number
}

export interface SubscriberSummary {
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

export interface UploadDetails {
  totalRows?: number
  subscribersImported?: number
  subscribersWithConsumptions?: number
  subscribersWithoutConsumptions?: number
  consumptionsImported?: number
  consumerTypesCount?: number
  skippedNoAccount?: number
}
