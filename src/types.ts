export type AttendanceStatus = 'present' | 'late' | 'leave' | 'absent';

export type LeaveType = 'sick' | 'personal' | 'activity' | 'other';

export type NutritionStatus = 'thin' | 'normal' | 'overweight' | 'obese';

export interface StudentHealth {
  // สุขภาพ: เหา
  hasLice: boolean; // เป็นเหา
  liceSeverity?: 'mild' | 'moderate' | 'severe' | 'none'; // เล็กน้อย (ไข่เหา), ปานกลาง, มาก
  liceTreated?: boolean; // ได้รับการรักษา / แจกยาสระกำจัดเหาแล้ว

  // สุขภาพ: ภาวะโภชนาการ / โรคอ้วน
  isObese: boolean; // ภาวะอ้วนหรือน้ำหนักเกินเกณฑ์
  weight?: number; // น้ำหนัก (กก.)
  height?: number; // ส่วนสูง (ซม.)
  bmi?: number; // ดัชนีมวลกาย BMI
  nutritionStatus?: NutritionStatus; // ผอม / สมส่วน / เริ่มอ้วน / อ้วน

  // สุขภาพ: ช่องปากและฟัน / ฟันผุ
  hasCavities: boolean; // มีฟันผุ
  cavityCount?: number; // จำนวนซี่ที่ผุ
  cavityTreated?: boolean; // ได้รับการอุดฟัน / ถอน / พบหมอฟัน รพ.สต. แล้ว

  // บันทึกและมาตรการช่วยเหลือ
  healthNote?: string; // หมายเหตุสุขภาพ
  lastCheckedDate?: string; // วันที่ตรวจล่าสุด (YYYY-MM-DD)
  treatmentPlan?: string; // แผนการดูแล (เช่น แจกยาเหา, ควบคุมน้ำหวาน, ส่งต่อ รพ.สต.)
}

export interface Student {
  id: string;
  studentNumber: number; // เลขที่
  studentCode: string;   // รหัสนักเรียน เช่น 65101
  title: 'เด็กชาย' | 'เด็กหญิง' | 'นาย' | 'นางสาว' | string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  note?: string;
  health?: StudentHealth; // ข้อมูลตรวจสุขภาพ (เหา, อ้วน, ฟันผุ)
}

export interface AttendanceEntry {
  status: AttendanceStatus;
  note?: string;
  leaveType?: LeaveType;
  health?: Partial<StudentHealth>; // บันทึกสุขภาพประจำวัน/คาบ
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  classroomId: string;
  date: string; // YYYY-MM-DD
  period: string; // e.g. "โฮมรูม (เช้า)", "คาบ 1", "คาบ 2", etc.
  entries: Record<string, AttendanceEntry>; // studentId -> entry
  generalNote?: string;
  recordedAt: string;
}

export interface Classroom {
  id: string;
  name: string; // e.g. "ชั้นประถมศึกษาปีที่ 4"
  schoolName?: string; // e.g. "รร.ตชด.บ้านลาดเรือ"
  affiliation?: string; // default: "กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)"
  subject?: string; // e.g. "กิจกรรมเช็คชื่อหน้าเสาธง / โฮมรูม"
  academicYear: string; // e.g. "2567"
  semester: string; // e.g. "1" หรือ "2"
  room?: string; // e.g. "ห้องเรียน ป.4"
  teacherName?: string; // e.g. "ด.ต. สมศักดิ์ สุขประเสริฐ (ครูประจำชั้น)"
  principalName?: string; // e.g. "ร.ต.อ. วิเชียร มงคลพิทักษ์ (ครูใหญ่)"
  students: Student[];
  createdAt: string;
}

export type ActiveTab = 'attendance' | 'health' | 'report' | 'students' | 'history';

export interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  leave: number;
  absent: number;
  unrecorded: number;
  percentage: number;
}

export interface HealthStats {
  total: number;
  // เหา
  liceCount: number;
  licePercentage: number;
  liceMale: number;
  liceFemale: number;
  liceTreatedCount: number;

  // อ้วน
  obeseCount: number;
  obesePercentage: number;
  obeseMale: number;
  obeseFemale: number;
  averageBmi: number;
  overweightCount: number;
  normalWeightCount: number;
  thinCount: number;

  // ฟันผุ
  cavityStudentCount: number;
  cavityPercentage: number;
  cavityTotalTeeth: number;
  cavityMale: number;
  cavityFemale: number;
  cavityTreatedCount: number;

  // สุขภาพสมบูรณ์ (ไม่มีเหา ไม่เป็นโรคอ้วน ไม่มีฟันผุ)
  perfectHealthCount: number;
  perfectHealthPercentage: number;
}
