import { Student, HealthStats, StudentHealth, NutritionStatus, Classroom } from '../types';
import { exportToCSV } from './storage';

/**
 * คำนวณค่า BMI และแปลผลภาวะโภชนาการสำหรับเด็กและเยาวชน (เกณฑ์อ้างอิงกรมอนามัย กระทรวงสาธารณสุข)
 */
export function calculateBMI(weightKg?: number, heightCm?: number): {
  bmi: number;
  status: NutritionStatus;
  statusThai: string;
  badgeColor: string;
} {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      status: 'normal',
      statusThai: 'ยังไม่ระบุ',
      badgeColor: 'bg-slate-100 text-slate-600',
    };
  }

  const heightMeter = heightCm / 100;
  const rawBmi = weightKg / (heightMeter * heightMeter);
  const bmi = Math.round(rawBmi * 10) / 10;

  // เกณฑ์แปลผล BMI สำหรับวัยเรียน (6-18 ปี)
  if (bmi < 15.0) {
    return {
      bmi,
      status: 'thin',
      statusThai: 'ผอม (ต่ำกว่าเกณฑ์)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  } else if (bmi <= 22.9) {
    return {
      bmi,
      status: 'normal',
      statusThai: 'สมส่วน (ตามเกณฑ์)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
  } else if (bmi <= 24.9) {
    return {
      bmi,
      status: 'overweight',
      statusThai: 'เริ่มอ้วน (ท้วม)',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    };
  } else {
    return {
      bmi,
      status: 'obese',
      statusThai: 'อ้วน (เกินเกณฑ์)',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    };
  }
}

/**
 * คำนวณสถิติสุขภาพของห้องเรียน (เหา, อ้วน, ฟันผุ)
 */
export function computeHealthStats(students: Student[]): HealthStats {
  const total = students.length;
  if (total === 0) {
    return {
      total: 0,
      liceCount: 0,
      licePercentage: 0,
      liceMale: 0,
      liceFemale: 0,
      liceTreatedCount: 0,
      obeseCount: 0,
      obesePercentage: 0,
      obeseMale: 0,
      obeseFemale: 0,
      averageBmi: 0,
      overweightCount: 0,
      normalWeightCount: 0,
      thinCount: 0,
      cavityStudentCount: 0,
      cavityPercentage: 0,
      cavityTotalTeeth: 0,
      cavityMale: 0,
      cavityFemale: 0,
      cavityTreatedCount: 0,
      perfectHealthCount: 0,
      perfectHealthPercentage: 0,
    };
  }

  let liceCount = 0;
  let liceMale = 0;
  let liceFemale = 0;
  let liceTreatedCount = 0;

  let obeseCount = 0;
  let obeseMale = 0;
  let obeseFemale = 0;
  let overweightCount = 0;
  let normalWeightCount = 0;
  let thinCount = 0;
  let totalBmi = 0;
  let bmiMeasuredStudents = 0;

  let cavityStudentCount = 0;
  let cavityMale = 0;
  let cavityFemale = 0;
  let cavityTotalTeeth = 0;
  let cavityTreatedCount = 0;

  let perfectHealthCount = 0;

  students.forEach((student) => {
    const h = student.health;
    const isLice = Boolean(h?.hasLice);
    const isObese = Boolean(h?.isObese);
    const hasCavity = Boolean(h?.hasCavities);

    // Lice
    if (isLice) {
      liceCount++;
      if (student.gender === 'male') liceMale++;
      else liceFemale++;
      if (h?.liceTreated) liceTreatedCount++;
    }

    // Obesity
    if (isObese) {
      obeseCount++;
      if (student.gender === 'male') obeseMale++;
      else obeseFemale++;
    }

    if (h?.nutritionStatus === 'overweight') overweightCount++;
    else if (h?.nutritionStatus === 'thin') thinCount++;
    else if (h?.nutritionStatus === 'normal') normalWeightCount++;

    if (h?.bmi && h.bmi > 0) {
      totalBmi += h.bmi;
      bmiMeasuredStudents++;
    } else if (h?.weight && h?.height) {
      const calc = calculateBMI(h.weight, h.height);
      if (calc.bmi > 0) {
        totalBmi += calc.bmi;
        bmiMeasuredStudents++;
      }
    }

    // Cavity
    if (hasCavity) {
      cavityStudentCount++;
      if (student.gender === 'male') cavityMale++;
      else cavityFemale++;
      cavityTotalTeeth += h?.cavityCount || 1;
      if (h?.cavityTreated) cavityTreatedCount++;
    }

    // Perfect health
    if (!isLice && !isObese && !hasCavity) {
      perfectHealthCount++;
    }
  });

  return {
    total,
    liceCount,
    licePercentage: Math.round((liceCount / total) * 100),
    liceMale,
    liceFemale,
    liceTreatedCount,

    obeseCount,
    obesePercentage: Math.round((obeseCount / total) * 100),
    obeseMale,
    obeseFemale,
    averageBmi: bmiMeasuredStudents > 0 ? Math.round((totalBmi / bmiMeasuredStudents) * 10) / 10 : 0,
    overweightCount,
    normalWeightCount,
    thinCount,

    cavityStudentCount,
    cavityPercentage: Math.round((cavityStudentCount / total) * 100),
    cavityTotalTeeth,
    cavityMale,
    cavityFemale,
    cavityTreatedCount,

    perfectHealthCount,
    perfectHealthPercentage: Math.round((perfectHealthCount / total) * 100),
  };
}

/**
 * ส่งออกรายงานการตรวจสุขภาพ (เหา, อ้วน, ฟันผุ) เป็น CSV รองรับภาษาไทยใน Excel
 */
export function exportHealthReportCSV(classroom: Classroom): void {
  const headers = [
    'เลขที่',
    'รหัสนักเรียน',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'เพศ',
    'สถานะเหา',
    'ความรุนแรงเหา',
    'การได้รับยาสระเหา',
    'ภาวะโภชนาการ (อ้วน)',
    'น้ำหนัก (กก.)',
    'ส่วนสูง (ซม.)',
    'ค่า BMI',
    'แปลผล BMI',
    'สุขภาพฟัน (ฟันผุ)',
    'จำนวนฟันผุ (ซี่)',
    'การรักษาฟันผุ',
    'วันที่ตรวจล่าสุด',
    'หมายเหตุสุขภาพ/แผนช่วยเหลือ',
    'โรงเรียน',
    'สังกัด',
  ];

  const rows = classroom.students.map((s) => {
    const h = s.health;
    const bmiInfo = calculateBMI(h?.weight, h?.height);

    return [
      s.studentNumber.toString(),
      s.studentCode,
      s.title,
      s.firstName,
      s.lastName,
      s.gender === 'male' ? 'ชาย' : 'หญิง',
      h?.hasLice ? 'เป็นเหา' : 'ปกติ (ไม่พบเหา)',
      h?.hasLice ? (h.liceSeverity === 'severe' ? 'มาก' : h.liceSeverity === 'moderate' ? 'ปานกลาง' : 'เล็กน้อย/ไข่เหา') : '-',
      h?.hasLice ? (h.liceTreated ? 'ได้รับยาฆ่าเหาแล้ว' : 'ยังไม่ได้รับยา') : '-',
      h?.isObese ? 'อ้วน/น้ำหนักเกิน' : 'ปกติ',
      h?.weight ? h.weight.toString() : '-',
      h?.height ? h.height.toString() : '-',
      bmiInfo.bmi > 0 ? bmiInfo.bmi.toString() : (h?.bmi ? h.bmi.toString() : '-'),
      bmiInfo.statusThai,
      h?.hasCavities ? 'มีฟันผุ' : 'ฟันดี (ไม่ผุ)',
      h?.hasCavities ? (h.cavityCount || 1).toString() : '0',
      h?.hasCavities ? (h.cavityTreated ? 'อุด/รักษาแล้ว' : 'รอส่งต่อทันตกรรม') : '-',
      h?.lastCheckedDate || '-',
      h?.healthNote || h?.treatmentPlan || '-',
      classroom.schoolName || 'รร.ตชด.',
      classroom.affiliation || 'กองกำกับการตำรวจตระเวนชายแดนที่ 31',
    ];
  });

  const safeSchool = (classroom.schoolName || 'รร_ตชด').replace(/[\s\.]+/g, '_');
  const safeClass = classroom.name.replace(/[\s\.]+/g, '_');
  const today = new Date().toISOString().slice(0, 10);
  exportToCSV(`รายงานตรวจสุขภาพ_เหา_อ้วน_ฟันผุ_${safeSchool}_${safeClass}_${today}`, [headers, ...rows]);
}

/**
 * สร้างข้อมูลสุขภาพเริ่มต้นสำหรับนักเรียนใหม่
 */
export function getDefaultStudentHealth(gender: 'male' | 'female' = 'male'): StudentHealth {
  return {
    hasLice: false,
    liceTreated: false,
    isObese: false,
    weight: gender === 'male' ? 32 : 30,
    height: gender === 'male' ? 135 : 133,
    bmi: 17.5,
    nutritionStatus: 'normal',
    hasCavities: false,
    cavityCount: 0,
    cavityTreated: false,
    lastCheckedDate: new Date().toISOString().slice(0, 10),
  };
}
