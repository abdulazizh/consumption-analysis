import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// Dynamic import for Prisma client
let prisma: any = null;

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  }
  return prisma;
}

const METER_MAX = 100000;

function formatDate(dateValue: unknown): string {
  if (!dateValue) return '';
  let date: Date;
  if (typeof dateValue === 'number') {
    date = new Date((dateValue - 25569) * 86400 * 1000);
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else {
    date = new Date(dateValue as Date);
  }
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function calculatePreviousReading(currentRead: number, recordedConsumption: number, factor: number = 1): number {
  const actualConsumption = factor > 1 ? Math.round(recordedConsumption / factor) : recordedConsumption;
  let prevRead = currentRead - actualConsumption;
  if (prevRead < 0) {
    prevRead = prevRead + METER_MAX;
  }
  return prevRead;
}

// GET: جلب البيانات من قاعدة البيانات
export async function GET() {
  try {
    const db = await getPrisma();
    
    const consumerTypes = await db.consumerType.findMany();
    const subscribers = await db.subscriber.findMany({
      include: {
        consumptions: {
          orderBy: { periodNo: 'asc' }
        },
        consumerType: true
      }
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        error: 'لا توجد بيانات متاحة. يرجى رفع ملف Excel.',
        consumptions: [],
        subscribers: [],
        subscribersInfo: [],
        consumerTypes: consumerTypes.map((c: any) => ({ code: c.code, description: c.description }))
      });
    }

    const consumptions = subscribers.flatMap((sub: any) => 
      sub.consumptions.map((c: any) => ({
        رقم_الحساب: sub.accountNo,
        اسم_المشترك: sub.name,
        رقم_المقياس: sub.meterNo || '',
        العنوان: sub.address || '',
        رقم_الفترة: c.periodNo,
        الاستهلاك: c.consumption,
        الاستهلاك_الحقيقي: c.actualConsumption,
        المدة_يوم: c.duration,
        القراءة_السابقة: c.prevReading,
        تاريخ_السابقة: c.prevDate,
        القراءة_اللاحقة: c.nextReading,
        تاريخ_اللاحقة: c.nextDate,
        المعدل: c.rate,
        معامل_الضرب: c.factor,
      }))
    );

    const subscribersInfo = subscribers.map((sub: any) => ({
      رقم_الحساب: sub.accountNo,
      رقم_الحساب_القديم: sub.oldAccountNo || '',
      اسم_المشترك: sub.name,
      رقم_المقياس: sub.meterNo || '',
      السجل: sub.serial || '',
      البلوك: sub.block || '',
      العقار: sub.property || '',
      الطور: sub.phase || '',
      معامل_الضرب: sub.factor,
      رقم_الاشتراك: sub.subscriptionNo || '',
      تاريخ_النصب: sub.installDate || '',
      اخر_تسديد: sub.lastPayment || 0,
      تاريخ_اخر_تسديد: sub.lastPaymentDate || '',
      صنف_المستهلك: sub.consumerType?.description || '',
      العنوان: sub.address || '',
      المنطقة: sub.region || '',
      القطاع: sub.sector || '',
      التصنيف: sub.classification || '',
      القراءة_الحالية: sub.currentReading || 0,
      تاريخ_الحالية: sub.currentDate || '',
      القراءة_السابقة: sub.prevReading || 0,
      تاريخ_السابقة: sub.prevDate || '',
      اجمالي_الاستهلاك: sub.totalConsumption,
      عدد_الفترات: sub.periodCount,
      متوسط_الاستهلاك: sub.avgConsumption,
      متوسط_المدة: sub.avgDuration,
      متوسط_المعدل: sub.avgRate,
    }));

    const subscribersSummary = subscribers.map((sub: any) => ({
      رقم_الحساب: sub.accountNo,
      رقم_الحساب_القديم: sub.oldAccountNo || '',
      اسم_المشترك: sub.name,
      رقم_المقياس: sub.meterNo || '',
      رقم_الاشتراك: sub.subscriptionNo || '',
      العنوان: sub.address || '',
      اجمالي_الاستهلاك: sub.totalConsumption,
      عدد_الفترات: sub.periodCount,
      متوسط_الاستهلاك: sub.avgConsumption,
      متوسط_المدة: sub.avgDuration,
    }));

    return NextResponse.json({
      consumptions,
      subscribers: subscribersSummary,
      subscribersInfo,
      consumerTypes: consumerTypes.map((c: any) => ({ code: c.code, description: c.description }))
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في تحميل البيانات: ' + (error instanceof Error ? error.message : String(error)),
      consumptions: [],
      subscribers: [],
      subscribersInfo: []
    }, { status: 500 });
  }
}

// POST: رفع ملف Excel وحفظ البيانات في قاعدة البيانات
export async function POST(request: NextRequest) {
  try {
    const db = await getPrisma();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

    console.log('جاري حذف البيانات القديمة...');
    await db.consumption.deleteMany();
    await db.subscriber.deleteMany();
    console.log('تم حذف البيانات القديمة');

    const consumerTypePath = path.join(process.cwd(), 'upload', 'custtypeind.xlsx');
    let consumerTypesMap = new Map<number, string>();
    
    if (fs.existsSync(consumerTypePath)) {
      console.log('جاري استيراد أصناف المستهلكين...');
      const consumerTypeBuffer = fs.readFileSync(consumerTypePath);
      const consumerTypeWorkbook = XLSX.read(consumerTypeBuffer, { type: 'buffer' });
      const consumerTypeSheet = consumerTypeWorkbook.Sheets[consumerTypeWorkbook.SheetNames[0]];
      const consumerTypeData = XLSX.utils.sheet_to_json(consumerTypeSheet) as Array<{ c_custcode: number; c_custdesc: string }>;
      
      await db.consumerType.deleteMany();
      
      for (const row of consumerTypeData) {
        const code = Number(row.c_custcode) || 0;
        const description = String(row.c_custdesc || 'غير محدد');
        consumerTypesMap.set(code, description);
        
        await db.consumerType.create({
          data: { code, description }
        });
      }
      console.log(`تم استيراد ${consumerTypesMap.size} صنف مستهلك`);
    }

    const subscribersData: any[] = [];

    for (const row of data) {
      const accountNo = String(row['m_accountno'] || '');
      if (!accountNo) continue;
      
      const name = String(row['m_name'] || '');
      if (!name) continue;
      
      const factor = Number(row['m_facter']) || 1;
      let prevRead = Number(row['m_prevread']) || 0;
      const prevDt = row['m_prevdt'];
      
      if (prevRead === 0 || !prevDt) continue;
      
      const prevDate = formatDate(prevDt);
      let currentRead = prevRead;
      let totalConsum = 0;
      let totalDays = 0;
      
      const consumptions: any[] = [];
      const periodData: any[] = [];
      
      for (let i = 1; i <= 12; i++) {
        const consum = Number(row[`M_CONSUM${i}`]) || 0;
        const periodDays = Number(row[`M_PERIOD${i}`]) || 0;
        
        if (consum === 0) continue;
        
        const actualConsumption = factor > 1 ? Math.round(consum / factor) : consum;
        const rate = periodDays > 0 ? Math.round(actualConsumption / periodDays) : 0;
        
        periodData.push({ consumption: consum, days: periodDays, actual: actualConsumption, rate });
        totalConsum += consum;
        totalDays += periodDays;
      }
      
      let readAfter = currentRead;
      for (let i = periodData.length - 1; i >= 0; i--) {
        const p = periodData[i];
        const readBefore = calculatePreviousReading(readAfter, p.consumption, factor);
        
        let dtAfter: Date, dtBefore: Date;
        if (i === periodData.length - 1 && prevDate) {
          dtAfter = new Date(prevDate);
          dtBefore = new Date(dtAfter.getTime() - p.days * 24 * 60 * 60 * 1000);
        } else {
          dtAfter = new Date(consumptions[consumptions.length - 1]?.prevDate || prevDate);
          dtBefore = new Date(dtAfter.getTime() - p.days * 24 * 60 * 60 * 1000);
        }
        
        consumptions.push({
          periodNo: periodData.length - i,
          consumption: p.consumption,
          actualConsumption: p.actual,
          duration: p.days,
          prevReading: Math.round(readBefore),
          prevDate: dtBefore.toISOString().split('T')[0],
          nextReading: Math.round(readAfter),
          nextDate: dtAfter.toISOString().split('T')[0],
          rate: p.rate,
          factor: factor,
        });
        
        readAfter = readBefore;
      }
      
      consumptions.sort((a, b) => a.periodNo - b.periodNo);
      
      const actualTotal = factor > 1 ? Math.round(totalConsum / factor) : totalConsum;
      const consumerTypeCode = Number(row['m_cust']) || null;
      
      subscribersData.push({
        accountNo,
        oldAccountNo: String(row['m_oldacount'] || row['m_oldacountagg'] || ''),
        name,
        meterNo: String(row['m_meter'] || ''),
        serial: String(row['m_sect'] || ''),
        block: String(row['m_street_no'] || ''),
        property: String(row['m_houseno'] || ''),
        phase: String(row['M_PHASE'] || ''),
        factor,
        subscriptionNo: String(row['m_instalno'] || ''),
        installDate: formatDate(row['m_meterdt']),
        lastPayment: Number(row['m_payment']) || 0,
        lastPaymentDate: formatDate(row['m_paydt']),
        consumerTypeCode,
        address: String(row['m_address'] || ''),
        region: String(row['m_region'] || ''),
        sector: String(row['m_sect'] || ''),
        classification: String(row['M_CLASSFY'] || ''),
        currentReading: Number(row['m_lastread']) || prevRead,
        currentDate: formatDate(row['m_lastdt']),
        prevReading: prevRead,
        prevDate,
        totalConsumption: totalConsum,
        periodCount: periodData.length,
        avgConsumption: periodData.length > 0 ? Math.round(totalConsum / periodData.length) : 0,
        avgDuration: periodData.length > 0 ? Math.round(totalDays / periodData.length) : 0,
        avgRate: totalDays > 0 ? Math.round(actualTotal / totalDays) : 0,
        consumptions,
      });
    }

    console.log(`جاري حفظ ${subscribersData.length} مشترك...`);
    
    for (const sub of subscribersData) {
      await db.subscriber.create({
        data: {
          accountNo: sub.accountNo,
          oldAccountNo: sub.oldAccountNo || null,
          name: sub.name,
          meterNo: sub.meterNo || null,
          serial: sub.serial || null,
          block: sub.block || null,
          property: sub.property || null,
          phase: sub.phase || null,
          factor: sub.factor,
          subscriptionNo: sub.subscriptionNo || null,
          installDate: sub.installDate || null,
          lastPayment: sub.lastPayment || null,
          lastPaymentDate: sub.lastPaymentDate || null,
          consumerTypeCode: sub.consumerTypeCode,
          address: sub.address || null,
          region: sub.region || null,
          sector: sub.sector || null,
          classification: sub.classification || null,
          currentReading: sub.currentReading || null,
          currentDate: sub.currentDate || null,
          prevReading: sub.prevReading || null,
          prevDate: sub.prevDate || null,
          totalConsumption: sub.totalConsumption,
          periodCount: sub.periodCount,
          avgConsumption: sub.avgConsumption,
          avgDuration: sub.avgDuration,
          avgRate: sub.avgRate,
          consumptions: {
            create: sub.consumptions.map((c: any) => ({
              periodNo: c.periodNo,
              consumption: c.consumption,
              actualConsumption: c.actualConsumption,
              duration: c.duration,
              prevReading: c.prevReading,
              prevDate: c.prevDate,
              nextReading: c.nextReading,
              nextDate: c.nextDate,
              rate: c.rate,
              factor: c.factor,
            }))
          }
        }
      });
    }

    console.log(`تم حفظ ${subscribersData.length} مشترك بنجاح`);
    
    const totalConsumptions = subscribersData.reduce((sum, s) => sum + s.consumptions.length, 0);
    
    return NextResponse.json({ 
      success: true,
      message: `تم حفظ ${subscribersData.length.toLocaleString()} مشترك و ${totalConsumptions.toLocaleString()} سجل استهلاك`,
      subscribersCount: subscribersData.length,
      consumptionsCount: totalConsumptions,
      consumerTypesCount: consumerTypesMap.size
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في رفع الملف: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}
