import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import { exportToCSV } from '../utils/storage';
import { getDefaultStudentHealth } from '../utils/health';
import { 
  UserPlus, 
  FileUp, 
  Trash2, 
  Edit3, 
  Search, 
  Download, 
  Check, 
  X, 
  Users, 
  ArrowUpDown,
  Sparkles,
  Heart
} from 'lucide-react';

interface StudentManagerProps {
  classroom: Classroom;
  onUpdateClassroom: (updatedClassroom: Classroom) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  classroom,
  onUpdateClassroom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Single Add / Edit Form State
  const [formNumber, setFormNumber] = useState(classroom.students.length + 1);
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('เด็กชาย');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>('male');

  // Bulk Import State
  const [bulkText, setBulkText] = useState('');

  // Handle Open Add
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextNum = classroom.students.length > 0
      ? Math.max(...classroom.students.map((s) => s.studentNumber)) + 1
      : 1;
    setFormNumber(nextNum);
    setFormCode(`${50000 + nextNum}`);
    setFormTitle('เด็กชาย');
    setFormFirstName('');
    setFormLastName('');
    setFormGender('male');
    setIsAddModalOpen(true);
  };

  // Handle Open Edit
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormNumber(student.studentNumber);
    setFormCode(student.studentCode);
    setFormTitle(student.title);
    setFormFirstName(student.firstName);
    setFormLastName(student.lastName);
    setFormGender(student.gender);
    setIsAddModalOpen(true);
  };

  // Save Single Student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) {
      alert('กรุณากรอกชื่อและนามสกุล');
      return;
    }

    let updatedStudents = [...classroom.students];

    if (editingStudent) {
      // Edit
      updatedStudents = updatedStudents.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              studentNumber: Number(formNumber),
              studentCode: formCode.trim(),
              title: formTitle,
              firstName: formFirstName.trim(),
              lastName: formLastName.trim(),
              gender: formGender,
            }
          : s
      );
    } else {
      // Create new
      const newStudent: Student = {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentNumber: Number(formNumber),
        studentCode: formCode.trim() || `${50000 + Number(formNumber)}`,
        title: formTitle,
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        gender: formGender,
        health: getDefaultStudentHealth(),
      };
      updatedStudents.push(newStudent);
    }

    // Sort by student number
    updatedStudents.sort((a, b) => a.studentNumber - b.studentNumber);

    onUpdateClassroom({
      ...classroom,
      students: updatedStudents,
    });

    setIsAddModalOpen(false);
  };

  // Delete Student
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${name}" ออกจากห้องเรียนนี้?`)) {
      const updatedStudents = classroom.students.filter((s) => s.id !== id);
      onUpdateClassroom({
        ...classroom,
        students: updatedStudents,
      });
    }
  };

  // Auto Renumber
  const handleAutoRenumber = () => {
    if (window.confirm('จัดเรียงและรันเลขที่นักเรียนใหม่ 1 ถึง N ตามลำดับปัจจุบัน?')) {
      const updated = classroom.students.map((s, idx) => ({
        ...s,
        studentNumber: idx + 1,
      }));
      onUpdateClassroom({
        ...classroom,
        students: updated,
      });
    }
  };

  // Process Bulk Import Text
  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const newStudents: Student[] = [];
    let currentMaxNumber = classroom.students.length > 0
      ? Math.max(...classroom.students.map((s) => s.studentNumber))
      : 0;

    lines.forEach((line) => {
      let cleaned = line.trim();
      // Remove leading bullet/number like "1." or "1)" or "1 "
      const numMatch = cleaned.match(/^(\d+)[\.\)\s\t]+(.*)/);
      let studentNum = ++currentMaxNumber;
      if (numMatch) {
        studentNum = parseInt(numMatch[1], 10);
        cleaned = numMatch[2].trim();
      }

      // Detect Title & Gender
      let title = 'เด็กชาย';
      let gender: 'male' | 'female' = 'male';

      if (cleaned.startsWith('เด็กหญิง') || cleaned.startsWith('ด.ญ.')) {
        title = 'เด็กหญิง';
        gender = 'female';
        cleaned = cleaned.replace(/^(เด็กหญิง|ด\.ญ\.)\s*/, '');
      } else if (cleaned.startsWith('เด็กชาย') || cleaned.startsWith('ด.ช.')) {
        title = 'เด็กชาย';
        gender = 'male';
        cleaned = cleaned.replace(/^(เด็กชาย|ด\.ช\.)\s*/, '');
      } else if (cleaned.startsWith('นางสาว') || cleaned.startsWith('น.ส.')) {
        title = 'นางสาว';
        gender = 'female';
        cleaned = cleaned.replace(/^(นางสาว|น\.ส\.)\s*/, '');
      } else if (cleaned.startsWith('นาย')) {
        title = 'นาย';
        gender = 'male';
        cleaned = cleaned.replace(/^นาย\s*/, '');
      }

      // Split first name and last name
      const parts = cleaned.split(/[\s\t,]+/).filter(Boolean);
      const firstName = parts[0] || 'นักเรียน';
      const lastName = parts.slice(1).join(' ') || '-';

      newStudents.push({
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentNumber: studentNum,
        studentCode: `${50000 + studentNum}`,
        title,
        firstName,
        lastName,
        gender,
        health: getDefaultStudentHealth(),
      });
    });

    if (newStudents.length > 0) {
      const all = [...classroom.students, ...newStudents];
      all.sort((a, b) => a.studentNumber - b.studentNumber);
      onUpdateClassroom({
        ...classroom,
        students: all,
      });
      setIsBulkModalOpen(false);
      setBulkText('');
      alert(`นำเข้ารายชื่อนักเรียนสำเร็จ ${newStudents.length} คน`);
    }
  };

  // Export Student List to CSV
  const handleExportRosterCSV = () => {
    const headers = [
      'เลขที่', 
      'รหัสนักเรียน', 
      'คำนำหน้า', 
      'ชื่อ', 
      'นามสกุล', 
      'เพศ', 
      'ห้องเรียน',
      'เป็นเหา',
      'น้ำหนัก (กก.)',
      'ส่วนสูง (ซม.)',
      'BMI',
      'ภาวะโภชนาการ',
      'ฟันผุ (ซี่)',
    ];
    const rows = classroom.students.map((s) => {
      const h = s.health;
      return [
        s.studentNumber.toString(),
        s.studentCode,
        s.title,
        s.firstName,
        s.lastName,
        s.gender === 'male' ? 'ชาย' : 'หญิง',
        classroom.name,
        h?.hasLice ? 'เป็นเหา' : 'ปกติ',
        h?.weight ? h.weight.toString() : '-',
        h?.height ? h.height.toString() : '-',
        h?.bmi ? h.bmi.toString() : '-',
        h?.nutritionStatus === 'obese' ? 'อ้วน' : h?.nutritionStatus === 'overweight' ? 'เริ่มอ้วน' : h?.nutritionStatus === 'underweight' ? 'ผอม' : 'สมส่วน',
        h?.hasCavities ? (h.cavityCount || 1).toString() : '0',
      ];
    });
    exportToCSV(`รายชื่อนักเรียนและข้อมูลสุขภาพ_${classroom.name}`, [headers, ...rows]);
  };

  // Filtered Students
  const filtered = classroom.students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const full = `${s.title}${s.firstName} ${s.lastName}`.toLowerCase();
    return (
      s.studentNumber.toString() === q ||
      s.studentCode.toLowerCase().includes(q) ||
      full.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {classroom.schoolName || 'รร.ตชด.'}
            </span>
            <span className="text-xs text-slate-500">
              สังกัด กก.ตชด.31
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            บัญชีรายชื่อนักเรียน: {classroom.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จำนวนนักเรียนทั้งหมด {classroom.students.length} คน (ชาย {classroom.students.filter(s => s.gender === 'male').length} คน • หญิง {classroom.students.filter(s => s.gender === 'female').length} คน)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Student Button */}
          <button
            id="btn-add-student"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            เพิ่มนักเรียน
          </button>

          {/* Bulk Import Button */}
          <button
            id="btn-bulk-import"
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <FileUp className="w-4 h-4" />
            นำเข้ารายชื่อหลายคน
          </button>

          {/* Auto Renumber */}
          <button
            id="btn-renumber"
            onClick={handleAutoRenumber}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
            title="รันเลขที่ใหม่ 1 ถึง N"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            รันเลขที่
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-roster"
            onClick={handleExportRosterCSV}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            title="ดาวน์โหลดรายชื่อ (CSV)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อ, สกุล, เลขที่ หรือรหัสนักเรียน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          แสดง {filtered.length} จาก {classroom.students.length} คน
        </span>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 w-16 text-center">เลขที่</th>
                <th className="py-3 px-4 w-28">รหัสประจำตัว</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4 w-20">เพศ</th>
                <th className="py-3 px-4 text-center min-w-[130px] bg-teal-50/40">สุขอนามัย (เหา•อ้วน•ผุ)</th>
                <th className="py-3 px-4 text-right w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((student) => {
                const h = student.health;
                const isLice = Boolean(h?.hasLice);
                const isObese = Boolean(h?.isObese);
                const hasCavities = Boolean(h?.hasCavities);
                const isClean = !isLice && !isObese && !hasCavities;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-700">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-bold">
                        {student.studentNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-xs text-slate-500">
                      {student.studentCode}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${student.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`} />
                        <span>{student.title}{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-600">
                      {student.gender === 'male' ? 'ชาย' : 'หญิง'}
                    </td>
                    <td className="py-2.5 px-4 text-center bg-teal-50/20">
                      <div className="flex items-center justify-center gap-1.5">
                        {isClean ? (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full" title="สุขภาพสมบูรณ์">
                            🌟 ปกติ
                          </span>
                        ) : (
                          <>
                            {isLice && (
                              <span className="text-xs bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md" title="เป็นเหา">
                                🪮
                              </span>
                            )}
                            {isObese && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md" title={`น้ำหนักเกิน/อ้วน (BMI ${h?.bmi || '-'})`}>
                                ⚖️
                              </span>
                            )}
                            {hasCavities && (
                              <span className="text-xs bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded-md" title={`ฟันผุ ${h?.cavityCount || 1} ซี่`}>
                                🦷
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ลบนักเรียน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เลขที่ *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสนักเรียน
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="เช่น 50101"
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    คำนำหน้า
                  </label>
                  <select
                    value={formTitle}
                    onChange={(e) => {
                      const t = e.target.value;
                      setFormTitle(t);
                      if (t === 'เด็กหญิง' || t === 'นางสาว') setFormGender('female');
                      if (t === 'เด็กชาย' || t === 'นาย') setFormGender('male');
                    }}
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เพศ
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    placeholder="เช่น สมชาย"
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="เช่น ใจดี"
                    className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  นำเข้ารายชื่อหลายคนพร้อมกัน
                </h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-600">
                วางรายชื่อนักเรียน 1 บรรทัดต่อ 1 คน ระบบจะแยกเลขที่ คำนำหน้า และชื่อ-นามสกุลให้อัตโนมัติ:
              </p>

              <div className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-800 p-2.5 rounded-lg space-y-1">
                <p className="font-semibold">ตัวอย่างรูปแบบที่รองรับ:</p>
                <code>1. เด็กชาย ธนดล ทองดี</code><br />
                <code>2 เด็กหญิง กัญญารัตน์ แสนสุข</code><br />
                <code>3 นาย กฤษณะ บุญเจริญ</code>
              </div>

              <textarea
                rows={7}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="วางรายชื่อที่นี่..."
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>จำนวนบรรทัด: {bulkText.split('\n').filter(l => l.trim()).length} คน</span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkText(
                      "1. เด็กชาย สมชาย ใจดี\n2. เด็กหญิง มณีรัตน์ มั่นคง\n3. เด็กชาย อัศวิน ชัยชนะ\n4. เด็กหญิง นภาพร ทอแสง"
                    );
                  }}
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  ใส่ตัวอย่างทดสอบ
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleProcessBulk}
                disabled={!bulkText.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs"
              >
                ประมวลผลและนำเข้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
