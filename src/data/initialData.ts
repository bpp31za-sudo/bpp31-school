import { Classroom, AttendanceRecord } from '../types';
import { getTodayDateString } from '../utils/thaiDate';

export const INITIAL_CLASSROOMS: Classroom[] = [
  {
    id: 'class-ladrua-p4',
    name: 'ชั้นประถมศึกษาปีที่ 4',
    schoolName: 'รร.ตชด.บ้านลาดเรือ',
    affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
    subject: 'เช็คชื่อหน้าเสาธง / โฮมรูม',
    academicYear: '2567',
    semester: '1',
    room: 'อาคารเรียนพระราชทาน ห้อง 2',
    teacherName: 'ด.ต. สมศักดิ์ สุขประเสริฐ (ครู ตชด.)',
    principalName: 'ร.ต.อ. วิเชียร มงคลพิทักษ์ (ครูใหญ่)',
    createdAt: '2024-05-15T08:00:00.000Z',
    students: [
      { 
        id: 's1', studentNumber: 1, studentCode: '67401', title: 'เด็กชาย', firstName: 'กิตติศักดิ์', lastName: 'สุขใจ', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 32, height: 136, bmi: 17.3, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's2', studentNumber: 2, studentCode: '67402', title: 'เด็กชาย', firstName: 'ชินวัตร', lastName: 'วัฒนพงษ์', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: true, cavityCount: 2, cavityTreated: false, weight: 33, height: 135, bmi: 18.1, nutritionStatus: 'normal', healthNote: 'ฟันกรามล่างผุ 2 ซี่ นัดพบหมอฟัน รพ.สต.', lastCheckedDate: '2024-09-12' }
      },
      { 
        id: 's3', studentNumber: 3, studentCode: '67403', title: 'เด็กชาย', firstName: 'ณัฐภัทร', lastName: 'เจริญรัตน์', gender: 'male',
        health: { hasLice: false, isObese: true, hasCavities: false, weight: 51, height: 137, bmi: 27.2, nutritionStatus: 'obese', healthNote: 'น้ำหนักเกินเกณฑ์ แนะนำลดของทอด/น้ำหวาน ให้ดื่มนมจืดและวิ่งออกกำลังกาย', lastCheckedDate: '2024-09-14' }
      },
      { 
        id: 's4', studentNumber: 4, studentCode: '67404', title: 'เด็กชาย', firstName: 'ธนกฤต', lastName: 'บุญมี', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: true, cavityCount: 1, cavityTreated: true, weight: 31, height: 134, bmi: 17.3, nutritionStatus: 'normal', healthNote: 'อุดฟันกรามแล้ว 1 ซี่ แปรงฟันสะอาดดี', lastCheckedDate: '2024-09-11' }
      },
      { 
        id: 's5', studentNumber: 5, studentCode: '67405', title: 'เด็กชาย', firstName: 'ปัณณวิชญ์', lastName: 'เรืองโรจน์', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 34, height: 138, bmi: 17.9, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's6', studentNumber: 6, studentCode: '67406', title: 'เด็กชาย', firstName: 'ภูมินทร์', lastName: 'ศิริชัย', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 26, height: 133, bmi: 14.7, nutritionStatus: 'thin', healthNote: 'น้ำหนักค่อนข้างน้อย เสริมอาหารโปรตีนและไข่ต้ม', lastCheckedDate: '2024-09-12' }
      },
      { 
        id: 's7', studentNumber: 7, studentCode: '67407', title: 'เด็กชาย', firstName: 'วรภพ', lastName: 'ทองประเสริฐ', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 33, height: 136, bmi: 17.8, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's8', studentNumber: 8, studentCode: '67408', title: 'เด็กชาย', firstName: 'ศุภกร', lastName: 'อินทรวิชัย', gender: 'male',
        health: { hasLice: false, isObese: true, hasCavities: true, cavityCount: 1, weight: 48, height: 135, bmi: 26.3, nutritionStatus: 'obese', healthNote: 'มีภาวะอ้วนและมีฟันผุ 1 ซี่ จัดเข้ากลุ่มกิจกรรมออกกำลังกายหน้าเสาธง', lastCheckedDate: '2024-09-15' }
      },
      { 
        id: 's9', studentNumber: 9, studentCode: '67409', title: 'เด็กชาย', firstName: 'อนาวิล', lastName: 'ชาติตระการ', gender: 'male',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 32, height: 135, bmi: 17.6, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's10', studentNumber: 10, studentCode: '67410', title: 'เด็กหญิง', firstName: 'กัญญาณัฐ', lastName: 'พงษ์พนา', gender: 'female',
        health: { hasLice: true, liceSeverity: 'moderate', liceTreated: true, isObese: false, hasCavities: false, weight: 30, height: 133, bmi: 17.0, nutritionStatus: 'normal', treatmentPlan: 'แจกยาสระกำจัดเหาแล้ว สระซ้ำรอบที่ 2 สัปดาห์หน้า', lastCheckedDate: '2024-09-15' }
      },
      { 
        id: 's11', studentNumber: 11, studentCode: '67411', title: 'เด็กหญิง', firstName: 'จิดาภา', lastName: 'มั่นคง', gender: 'female',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 31, height: 134, bmi: 17.3, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's12', studentNumber: 12, studentCode: '67412', title: 'เด็กหญิง', firstName: 'ณิชาภัทร', lastName: 'แสงสว่าง', gender: 'female',
        health: { hasLice: true, liceSeverity: 'mild', liceTreated: false, isObese: false, hasCavities: true, cavityCount: 2, weight: 29, height: 132, bmi: 16.6, nutritionStatus: 'normal', treatmentPlan: 'นัดรับยาสระเหากับครูอนามัย และรอตรวจฟัน รพ.สต.', lastCheckedDate: '2024-09-14' }
      },
      { 
        id: 's13', studentNumber: 13, studentCode: '67413', title: 'เด็กหญิง', firstName: 'ทิพวรรณ', lastName: 'ใจดี', gender: 'female',
        health: { hasLice: true, liceSeverity: 'severe', liceTreated: true, isObese: false, hasCavities: false, weight: 28, height: 130, bmi: 16.6, nutritionStatus: 'normal', treatmentPlan: 'เป็นเหามาก ได้รับยาสระและหวีเสนียดแล้ว อาการดีขึ้น', lastCheckedDate: '2024-09-15' }
      },
      { 
        id: 's14', studentNumber: 14, studentCode: '67414', title: 'เด็กหญิง', firstName: 'นภัสสร', lastName: 'รัตนมณี', gender: 'female',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 33, height: 135, bmi: 18.1, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's15', studentNumber: 15, studentCode: '67415', title: 'เด็กหญิง', firstName: 'เบญญาภา', lastName: 'บ่อภาค', gender: 'female',
        health: { hasLice: false, isObese: true, hasCavities: false, weight: 49, height: 136, bmi: 26.5, nutritionStatus: 'obese', healthNote: 'ภาวะเริ่มอ้วน แนะนำงดขนมหวานโรงอาหาร', lastCheckedDate: '2024-09-12' }
      },
      { 
        id: 's16', studentNumber: 16, studentCode: '67416', title: 'เด็กหญิง', firstName: 'พิมพ์พิชชา', lastName: 'กมลรัตน์', gender: 'female',
        health: { hasLice: false, isObese: false, hasCavities: true, cavityCount: 3, cavityTreated: false, weight: 32, height: 135, bmi: 17.6, nutritionStatus: 'normal', healthNote: 'ฟันน้ำนมผุ 3 ซี่ ครูแนะนำย้อมสีฟันและฝึกแปรงฟัน 2 นาที', lastCheckedDate: '2024-09-13' }
      },
      { 
        id: 's17', studentNumber: 17, studentCode: '67417', title: 'เด็กหญิง', firstName: 'รมิดา', lastName: 'เกษมสุข', gender: 'female',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 31, height: 134, bmi: 17.3, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
      { 
        id: 's18', studentNumber: 18, studentCode: '67418', title: 'เด็กหญิง', firstName: 'วริศรา', lastName: 'แก้วมณี', gender: 'female',
        health: { hasLice: false, isObese: false, hasCavities: false, weight: 30, height: 133, bmi: 17.0, nutritionStatus: 'normal', cavityCount: 0, lastCheckedDate: '2024-09-10' }
      },
    ]
  },
  {
    id: 'class-nuchtien-p2',
    name: 'ชั้นประถมศึกษาปีที่ 2',
    schoolName: 'รร.ตชด.บ้านนุชเทียน',
    affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
    subject: 'เช็คชื่อหน้าเสาธง / โฮมรูม',
    academicYear: '2567',
    semester: '1',
    room: 'อาคาร 1 ห้อง 102',
    teacherName: 'ส.ต.อ.หญิง สุภาพร แสงทิพย์ (ครู ตชด.)',
    principalName: 'ร.ต.อ. ณรงค์ ปรีชากุล (ครูใหญ่)',
    createdAt: '2024-05-15T08:00:00.000Z',
    students: [
      { id: 'sn1', studentNumber: 1, studentCode: '67201', title: 'เด็กชาย', firstName: 'ชัยวัฒน์', lastName: 'ปิ่นคำ', gender: 'male' },
      { id: 'sn2', studentNumber: 2, studentCode: '67202', title: 'เด็กชาย', firstName: 'พงศกร', lastName: 'สุขเกษม', gender: 'male' },
      { id: 'sn3', studentNumber: 3, studentCode: '67203', title: 'เด็กชาย', firstName: 'อัครเดช', lastName: 'ชาติตระการ', gender: 'male' },
      { id: 'sn4', studentNumber: 4, studentCode: '67204', title: 'เด็กชาย', firstName: 'พีรวิชญ์', lastName: 'คงทน', gender: 'male' },
      { id: 'sn5', studentNumber: 5, studentCode: '67205', title: 'เด็กหญิง', firstName: 'กานต์สินี', lastName: 'แก้วมณี', gender: 'female' },
      { id: 'sn6', studentNumber: 6, studentCode: '67206', title: 'เด็กหญิง', firstName: 'ชนันพร', lastName: 'รักษ์ป่า', gender: 'female' },
      { id: 'sn7', studentNumber: 7, studentCode: '67207', title: 'เด็กหญิง', firstName: 'ปนัดดา', lastName: 'เรืองศรี', gender: 'female' },
      { id: 'sn8', studentNumber: 8, studentCode: '67208', title: 'เด็กหญิง', firstName: 'สุพิชชา', lastName: 'บ่อภาค', gender: 'female' },
    ]
  },
  {
    id: 'class-crpy-p6',
    name: 'ชั้นประถมศึกษาปีที่ 6',
    schoolName: 'รร.ตชด.อาชีวศึกษาเชียงราย-พะเยา',
    affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
    subject: 'เช็คชื่อหน้าเสาธง / โฮมรูม',
    academicYear: '2567',
    semester: '1',
    room: 'อาคารเรียนเฉลิมพระเกียรติ ชั้น 2',
    teacherName: 'ด.ต. มนัส ชาติตระการ (ครู ตชด.)',
    principalName: 'ร.ต.อ. ประยุทธ์ สมบูรณ์ดี (ครูใหญ่)',
    createdAt: '2024-05-15T08:00:00.000Z',
    students: [
      { id: 'sc1', studentNumber: 1, studentCode: '67601', title: 'เด็กชาย', firstName: 'กฤษฎา', lastName: 'ปิ่นเกล้า', gender: 'male' },
      { id: 'sc2', studentNumber: 2, studentCode: '67602', title: 'เด็กชาย', firstName: 'จิรายุ', lastName: 'พงศ์พิพัฒน์', gender: 'male' },
      { id: 'sc3', studentNumber: 3, studentCode: '67603', title: 'เด็กชาย', firstName: 'เตชินท์', lastName: 'งามสม', gender: 'male' },
      { id: 'sc4', studentNumber: 4, studentCode: '67604', title: 'เด็กชาย', firstName: 'ปวริศ', lastName: 'ศิริพันธ์', gender: 'male' },
      { id: 'sc5', studentNumber: 5, studentCode: '67605', title: 'เด็กหญิง', firstName: 'กานต์พิชชา', lastName: 'คงชนะ', gender: 'female' },
      { id: 'sc6', studentNumber: 6, studentCode: '67606', title: 'เด็กหญิง', firstName: 'ชลธิชา', lastName: 'ธรรมรักษา', gender: 'female' },
      { id: 'sc7', studentNumber: 7, studentCode: '67607', title: 'เด็กหญิง', firstName: 'ธัญญารัตน์', lastName: 'วรการ', gender: 'female' },
      { id: 'sc8', studentNumber: 8, studentCode: '67608', title: 'เด็กหญิง', firstName: 'พิมลภัส', lastName: 'บุษบา', gender: 'female' },
      { id: 'sc9', studentNumber: 9, studentCode: '67609', title: 'เด็กหญิง', firstName: 'สิรินธร', lastName: 'เมธีวรรณ', gender: 'female' },
      { id: 'sc10', studentNumber: 10, studentCode: '67610', title: 'เด็กหญิง', firstName: 'อัญชิสา', lastName: 'ทอฝัน', gender: 'female' },
    ]
  },
  {
    id: 'class-borbia-p3',
    name: 'ชั้นประถมศึกษาปีที่ 3',
    schoolName: 'รร.ตชด.บ้านบ่อเบี้ย',
    affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
    subject: 'เช็คชื่อหน้าเสาธง / โฮมรูม',
    academicYear: '2567',
    semester: '1',
    room: 'อาคารเรียนรวม ห้อง 3',
    teacherName: 'ส.ต.ท. อานนท์ โพธิ์ทอง (ครู ตชด.)',
    principalName: 'ร.ต.ท. วุฒิชัย ขันแก้ว (ครูใหญ่)',
    createdAt: '2024-05-15T08:00:00.000Z',
    students: [
      { id: 'sb1', studentNumber: 1, studentCode: '67301', title: 'เด็กชาย', firstName: 'ธนาคาร', lastName: 'ศรีวิเศษ', gender: 'male' },
      { id: 'sb2', studentNumber: 2, studentCode: '67302', title: 'เด็กชาย', firstName: 'อนุสรณ์', lastName: 'พรมมา', gender: 'male' },
      { id: 'sb3', studentNumber: 3, studentCode: '67303', title: 'เด็กชาย', firstName: 'สุภัทร', lastName: 'ป้องแดน', gender: 'male' },
      { id: 'sb4', studentNumber: 4, studentCode: '67304', title: 'เด็กหญิง', firstName: 'กัญญาวีร์', lastName: 'แก้วคำ', gender: 'female' },
      { id: 'sb5', studentNumber: 5, studentCode: '67305', title: 'เด็กหญิง', firstName: 'พัชราภา', lastName: 'บ่อเบี้ย', gender: 'female' },
      { id: 'sb6', studentNumber: 6, studentCode: '67306', title: 'เด็กหญิง', firstName: 'ลลิตา', lastName: 'วันดี', gender: 'female' },
    ]
  }
];

// Helper to generate past dates
function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Record for today (รร.ตชด.บ้านลาดเรือ)
  {
    id: `rec-class-ladrua-p4-${getTodayDateString()}-flag`,
    classroomId: 'class-ladrua-p4',
    date: getTodayDateString(),
    period: 'เข้าแถวเคารพธงชาติ / กิจกรรมหน้าเสาธง (08:00)',
    recordedAt: new Date().toISOString(),
    generalNote: 'เข้าแถวเคารพธงชาติพร้อมเพรียง ตรวจความสะอาดเล็บมือและสุขภาพฟันเรียบร้อยดี',
    entries: {
      s1: { status: 'present' },
      s2: { status: 'present' },
      s3: { status: 'late', note: 'ฝนตกหนัก น้ำในลำห้วยขึ้น เดินทางลำบาก' },
      s4: { status: 'present' },
      s5: { status: 'leave', leaveType: 'sick', note: 'เป็นไข้หวัด รักษาตัวที่ รพ.สต.บ่อภาค' },
      s6: { status: 'present' },
      s7: { status: 'present' },
      s8: { status: 'absent', note: 'ยังติดต่อผู้ปกครองไม่ได้ (ประสาน ผญบ. ติดตาม)' },
      s9: { status: 'present' },
      s10: { status: 'present' },
      s11: { status: 'present' },
      s12: { status: 'present' },
      s13: { status: 'leave', leaveType: 'personal', note: 'ช่วยผู้ปกครองเก็บเกี่ยวข้าวโพดบนดอย' },
      s14: { status: 'present' },
      s15: { status: 'present' },
      s16: { status: 'late', note: 'ตื่นสายเนื่องจากเมื่อคืนฝนตก' },
      s17: { status: 'present' },
      s18: { status: 'present' },
    }
  },
  // Record for yesterday
  {
    id: `rec-class-ladrua-p4-${getPastDate(1)}-flag`,
    classroomId: 'class-ladrua-p4',
    date: getPastDate(1),
    period: 'เข้าแถวเคารพธงชาติ / กิจกรรมหน้าเสาธง (08:00)',
    recordedAt: new Date(Date.now() - 86400000).toISOString(),
    generalNote: 'นักเรียนช่วยกันดูแลแปลงผักโครงการเกษตรเพื่ออาหารกลางวันเรียบร้อย',
    entries: {
      s1: { status: 'present' },
      s2: { status: 'present' },
      s3: { status: 'present' },
      s4: { status: 'present' },
      s5: { status: 'leave', leaveType: 'sick', note: 'เป็นไข้' },
      s6: { status: 'present' },
      s7: { status: 'present' },
      s8: { status: 'present' },
      s9: { status: 'present' },
      s10: { status: 'present' },
      s11: { status: 'present' },
      s12: { status: 'present' },
      s13: { status: 'present' },
      s14: { status: 'present' },
      s15: { status: 'late', note: 'ช่วยงานบ้านก่อนมาโรงเรียน' },
      s16: { status: 'present' },
      s17: { status: 'present' },
      s18: { status: 'present' },
    }
  },
  // Record for 2 days ago
  {
    id: `rec-class-ladrua-p4-${getPastDate(2)}-flag`,
    classroomId: 'class-ladrua-p4',
    date: getPastDate(2),
    period: 'เข้าแถวเคารพธงชาติ / กิจกรรมหน้าเสาธง (08:00)',
    recordedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    generalNote: 'กิจกรรมหน้าเสาธง ร้องเพลงชาติและสวดมนต์อย่างสงบ',
    entries: {
      s1: { status: 'present' },
      s2: { status: 'present' },
      s3: { status: 'present' },
      s4: { status: 'present' },
      s5: { status: 'present' },
      s6: { status: 'present' },
      s7: { status: 'present' },
      s8: { status: 'absent' },
      s9: { status: 'present' },
      s10: { status: 'present' },
      s11: { status: 'present' },
      s12: { status: 'present' },
      s13: { status: 'present' },
      s14: { status: 'present' },
      s15: { status: 'present' },
      s16: { status: 'present' },
      s17: { status: 'present' },
      s18: { status: 'present' },
    }
  }
];
