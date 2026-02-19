import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import db, {
  clearAllData,
  insertSubscriber,
  insertConsumption,
  getSubscribersCount,
  getConsumptionsCount,
  searchSubscribers,
  getSubscriberByAccount,
  getConsumptionsByAccount,
} from "@/lib/db";

interface RawRow {
  m_accountno?: unknown;
  m_oldacount?: unknown;
  m_oldacountagg?: unknown;
  m_name?: unknown;
  m_meter?: unknown;
  m_sect?: unknown;
  m_street?: unknown;
  m_street_no?: unknown;
  m_houseno?: unknown;
  m_house_no2?: unknown;
  M_PHASE?: unknown;
  m_facter?: unknown;
  m_instalno?: unknown;
  m_meterdt?: unknown;
  m_payment?: unknown;
  m_paydt?: unknown;
  m_address?: unknown;
  m_address2?: unknown;
  m_region?: unknown;
  M_CLASSFY?: unknown;
  m_prevread?: unknown;
  m_prevdt?: unknown;
  m_lastread?: unknown;
  m_lastdt?: unknown;
  [key: string]: unknown;
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

// GET - جلب البيانات
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search');
    const accountNo = searchParams.get('account');

    // إذا كان البحث عن حساب معين
    if (accountNo) {
      const subscriber = getSubscriberByAccount(accountNo);
      if (!subscriber) {
        return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 });
      }
      const consumptions = getConsumptionsByAccount(accountNo);
      return NextResponse.json({ subscriber, consumptions });
    }

    // إذا كان هناك بحث
    if (searchTerm) {
      const subscribers = searchSubscribers(searchTerm);
      return NextResponse.json({ subscribers });
    }

    // إحصائيات عامة
    const subscribersCount = getSubscribersCount();
    const consumptionsCount = getConsumptionsCount();

    if (subscribersCount === 0) {
      return NextResponse.json({
        error: 'لا توجد بيانات متاحة. يرجى رفع ملف Excel.',
        subscribers: [],
        consumptions: [],
        count: 0
      });
    }

    return NextResponse.json({
      subscribersCount,
      consumptionsCount,
      message: 'البيانات متاحة'
    });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({
      error: 'حدث خطأ في تحميل البيانات',
      subscribers: [],
      consumptions: [],
      count: 0
    }, { status: 500 });
  }
}

// POST - رفع ملف Excel
export async function POST(request: NextRequest) {
  try {
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
    const data = XLSX.utils.sheet_to_json(worksheet) as RawRow[];

    // حذف جميع البيانات القديمة
    clearAllData();
    console.log('تم حذف البيانات القديمة');

    let subscribersCount = 0;
    let consumptionsCount = 0;

    // معالجة البيانات
    for (const row of data) {
      const accountNo = String(row.m_accountno || '');
      if (!accountNo) continue;

      const name = String(row.m_name || '');
      if (!name) continue;

      const oldAccountNo = String(row.m_oldacount || row.m_oldacountagg || '');
      const meter = String(row.m_meter || '');
      const sect = String(row.m_sect || '');
      const streetNo = String(row.m_street_no || '');
      const houseNo = String(row.m_houseno || '');
      const phase = String(row.M_PHASE || '');
      const factor = Number(row.m_facter) || 1;
      const instalNo = String(row.m_instalno || '');
      const meterDt = formatDate(row.m_meterdt);
      const payment = Number(row.m_payment) || 0;
      const payDt = formatDate(row.m_paydt);
      const address1 = String(row.m_address || '');
      const address2 = String(row.m_address2 || '');
      const fullAddress = [address1, address2].filter(a => a && a !== 'NaN').join(' - ');
      const region = String(row.m_region || '');
      const classify = String(row.M_CLASSFY || '');

      let prevRead = row.m_prevread;
      let prevDt = row.m_prevdt;
      let lastRead = row.m_lastread;
      let lastDt = row.m_lastdt;

      if (prevRead === null || prevRead === undefined || prevDt === null || prevDt === undefined) continue;

      prevRead = Number(prevRead);
      if (isNaN(prevRead as number)) continue;

      const prevDate = formatDate(prevDt);
      const lastDate = formatDate(lastDt);

      let currentRead = prevRead as number;
      let totalConsum = 0;
      let totalDays = 0;
      let periodCount = 0;
      const periodData: Array<{
        period_no: number;
        consumption: number;
        actual_consumption: number;
        duration_days: number;
        prev_reading: number;
        prev_date: string;
        next_reading: number;
        next_date: string;
        rate: number;
        factor: number;
      }> = [];

      // معالجة الفترات
      for (let i = 1; i <= 12; i++) {
        const consum = Number(row[`M_CONSUM${i}`]) || 0;
        const periodDays = Number(row[`M_PERIOD${i}`]) || 0;

        if (consum === 0) continue;

        const readAfter = currentRead;
        const readBefore = calculatePreviousReading(currentRead, consum, factor);
        const actualConsumption = factor > 1 ? Math.round(consum / factor) : consum;

        let dtAfter: Date, dtBefore: Date;
        if (i === 1 && prevDate) {
          dtAfter = new Date(prevDate);
          dtBefore = new Date(dtAfter.getTime() - periodDays * 24 * 60 * 60 * 1000);
        } else {
          const prevPeriod = periodData[periodData.length - 1];
          dtAfter = new Date(prevPeriod?.prev_date || prevDate);
          dtBefore = new Date(dtAfter.getTime() - periodDays * 24 * 60 * 60 * 1000);
        }

        const rate = periodDays > 0 ? Math.round(actualConsumption / periodDays) : 0;

        periodData.push({
          period_no: i,
          consumption: consum,
          actual_consumption: actualConsumption,
          duration_days: periodDays,
          prev_reading: Math.round(readBefore),
          prev_date: dtBefore.toISOString().split('T')[0],
          next_reading: Math.round(readAfter),
          next_date: dtAfter.toISOString().split('T')[0],
          rate: rate,
          factor: factor,
        });

        totalConsum += consum;
        totalDays += periodDays;
        periodCount++;
        currentRead = readBefore;
      }

      if (periodCount === 0) continue;

      // ترتيب الفترات حسب التاريخ
      periodData.sort((a, b) => new Date(a.prev_date).getTime() - new Date(b.prev_date).getTime());
      periodData.forEach((p, idx) => { p.period_no = idx + 1; });

      // حساب المتوسطات
      const actualTotal = factor > 1 ? Math.round(totalConsum / factor) : totalConsum;
      const avgRate = totalDays > 0 ? Math.round(actualTotal / totalDays) : 0;

      // إضافة المشترك
      insertSubscriber({
        account_no: accountNo,
        old_account_no: oldAccountNo,
        name: name,
        meter: meter,
        subscription_no: instalNo,
        address: fullAddress,
        region: region,
        sector: sect,
        block: streetNo,
        property: houseNo,
        phase: phase,
        factor: factor,
        install_date: meterDt,
        last_payment: payment,
        last_payment_date: payDt,
        consumer_type: '',
        classification: classify,
        current_reading: lastRead ? Number(lastRead) : (prevRead as number),
        current_date: lastDate,
        prev_reading: prevRead as number,
        prev_date: prevDate,
        total_consumption: totalConsum,
        periods_count: periodCount,
        avg_consumption: Math.round(totalConsum / periodCount),
        avg_duration: Math.round(totalDays / periodCount),
        avg_rate: avgRate,
      });

      // إضافة سجلات الاستهلاك
      for (const period of periodData) {
        insertConsumption({
          account_no: accountNo,
          period_no: period.period_no,
          consumption: period.consumption,
          actual_consumption: period.actual_consumption,
          duration_days: period.duration_days,
          prev_reading: period.prev_reading,
          prev_date: period.prev_date,
          next_reading: period.next_reading,
          next_date: period.next_date,
          rate: period.rate,
          factor: period.factor,
        });
        consumptionsCount++;
      }

      subscribersCount++;
    }

    console.log(`تم حفظ ${subscribersCount} مشترك و ${consumptionsCount} سجل استهلاك`);

    return NextResponse.json({
      success: true,
      message: 'تم رفع البيانات بنجاح',
      subscribersCount,
      consumptionsCount,
    });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({
      error: 'حدث خطأ في رفع الملف: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}
