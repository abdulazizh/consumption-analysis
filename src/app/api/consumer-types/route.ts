import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

let prisma: any = null;

async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  }
  return prisma;
}

// GET: جلب أصناف المستهلكين
export async function GET() {
  try {
    const db = await getPrisma();
    const consumerTypes = await db.consumerType.findMany({
      orderBy: { code: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      consumerTypes: consumerTypes.map((c: any) => ({
        code: c.code,
        description: c.description
      }))
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'حدث خطأ: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

// POST: استيراد/تحديث أصناف المستهلكين من ملف
export async function POST(request: NextRequest) {
  try {
    const db = await getPrisma();
    
    const consumerTypePath = path.join(process.cwd(), 'upload', 'custtypeind.xlsx');
    
    if (!fs.existsSync(consumerTypePath)) {
      return NextResponse.json({ 
        error: 'ملف أصناف المستهلكين غير موجود في مجلد upload'
      }, { status: 400 });
    }
    
    const consumerTypeBuffer = fs.readFileSync(consumerTypePath);
    const consumerTypeWorkbook = XLSX.read(consumerTypeBuffer, { type: 'buffer' });
    const consumerTypeSheet = consumerTypeWorkbook.Sheets[consumerTypeWorkbook.SheetNames[0]];
    const consumerTypeData = XLSX.utils.sheet_to_json(consumerTypeSheet) as Array<{ c_custcode: number; c_custdesc: string }>;
    
    await db.consumerType.deleteMany();
    
    let imported = 0;
    for (const row of consumerTypeData) {
      const code = Number(row.c_custcode) || 0;
      const description = String(row.c_custdesc || 'غير محدد');
      
      await db.consumerType.create({
        data: { code, description }
      });
      imported++;
    }
    
    return NextResponse.json({
      success: true,
      message: `تم استيراد ${imported} صنف مستهلك بنجاح`,
      count: imported
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'حدث خطأ: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}
