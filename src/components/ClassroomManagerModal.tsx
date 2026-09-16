import React, { useState } from 'react';
import { Classroom } from '../types';
import { BPP_31_SCHOOLS, BPP_TEACHER_RANKS, BPP_CLASS_LEVELS } from '../data/bppSchools';
import { BppEmblem } from './BppEmblem';
import { Plus, Trash2, Edit2, X, School, UserCheck, Shield } from 'lucide-react';

interface ClassroomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: Classroom[];
  activeClassroomId: string;
  onSelectClassroom: (id: string) => void;
  onSaveClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (id: string) => void;
}

export const ClassroomManagerModal: React.FC<ClassroomManagerModalProps> = ({
  isOpen,
  onClose,
  classrooms,
  activeClassroomId,
  onSelectClassroom,
  onSaveClassroom,
  onDeleteClassroom,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form State
  const [schoolName, setSchoolName] = useState(BPP_31_SCHOOLS[0].name);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [name, setName] = useState('ชั้นประถมศึกษาปีที่ 4');
  const [subject, setSubject] = useState('เช็คชื่อหน้าเสาธง / โฮมรูม');
  const [academicYear, setAcademicYear] = useState('2567');
  const [semester, setSemester] = useState('1');
  const [room, setRoom] = useState('อาคารเรียน 1');
  const [teacherRank, setTeacherRank] = useState('ด.ต.');
  const [teacherNameOnly, setTeacherNameOnly] = useState('');
  const [principalRank, setPrincipalRank] = useState('ร.ต.อ.');
  const [principalNameOnly, setPrincipalNameOnly] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditId(null);
    setSchoolName(BPP_31_SCHOOLS[0].name);
    setCustomSchoolName('');
    setName('ชั้นประถมศึกษาปีที่ 4');
    setSubject('เช็คชื่อหน้าเสาธง / โฮมรูม');
    setAcademicYear('2567');
    setSemester('1');
    setRoom('อาคารเรียน 1');
    setTeacherRank('ด.ต.');
    setTeacherNameOnly('');
    setPrincipalRank('ร.ต.อ.');
    setPrincipalNameOnly('');
    setIsEditing(true);
  };

  const handleStartEdit = (c: Classroom) => {
    setEditId(c.id);
    const matchedSchool = BPP_31_SCHOOLS.find(s => s.name === c.schoolName);
    if (matchedSchool) {
      setSchoolName(matchedSchool.name);
      setCustomSchoolName('');
    } else if (c.schoolName) {
      setSchoolName('custom');
      setCustomSchoolName(c.schoolName);
    } else {
      setSchoolName(BPP_31_SCHOOLS[0].name);
      setCustomSchoolName('');
    }

    setName(c.name);
    setSubject(c.subject || 'เช็คชื่อหน้าเสาธง / โฮมรูม');
    setAcademicYear(c.academicYear);
    setSemester(c.semester);
    setRoom(c.room || '');

    // Parse teacher rank
    const tFull = c.teacherName || '';
    const matchedRank = BPP_TEACHER_RANKS.find(r => tFull.startsWith(r));
    if (matchedRank) {
      setTeacherRank(matchedRank);
      setTeacherNameOnly(tFull.replace(matchedRank, '').replace('(ครู ตชด.)', '').trim());
    } else {
      setTeacherRank('ด.ต.');
      setTeacherNameOnly(tFull);
    }

    // Parse principal rank
    const pFull = c.principalName || '';
    const matchedPRank = BPP_TEACHER_RANKS.find(r => pFull.startsWith(r));
    if (matchedPRank) {
      setPrincipalRank(matchedPRank);
      setPrincipalNameOnly(pFull.replace(matchedPRank, '').replace('(ครูใหญ่)', '').trim());
    } else {
      setPrincipalRank('ร.ต.อ.');
      setPrincipalNameOnly(pFull);
    }

    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSchoolName = schoolName === 'custom' ? (customSchoolName.trim() || 'รร.ตชด.') : schoolName;
    const finalTeacherName = teacherNameOnly.trim()
      ? `${teacherRank} ${teacherNameOnly.trim()} (ครู ตชด.)`
      : `${teacherRank} (ครู ตชด.)`;
    const finalPrincipalName = principalNameOnly.trim()
      ? `${principalRank} ${principalNameOnly.trim()} (ครูใหญ่)`
      : undefined;

    if (editId) {
      const existing = classrooms.find((c) => c.id === editId);
      if (existing) {
        onSaveClassroom({
          ...existing,
          schoolName: finalSchoolName,
          affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
          name: name.trim(),
          subject: subject.trim(),
          academicYear: academicYear.trim(),
          semester: semester.trim(),
          room: room.trim(),
          teacherName: finalTeacherName,
          principalName: finalPrincipalName,
        });
      }
    } else {
      const newClass: Classroom = {
        id: `class-bpp31-${Date.now()}`,
        schoolName: finalSchoolName,
        affiliation: 'กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)',
        name: name.trim(),
        subject: subject.trim(),
        academicYear: academicYear.trim(),
        semester: semester.trim(),
        room: room.trim(),
        teacherName: finalTeacherName,
        principalName: finalPrincipalName,
        createdAt: new Date().toISOString(),
        students: [
          { id: `s-${Date.now()}-1`, studentNumber: 1, studentCode: '67001', title: 'เด็กชาย', firstName: 'สมชาย', lastName: 'รักถิ่น', gender: 'male' },
          { id: `s-${Date.now()}-2`, studentNumber: 2, studentCode: '67002', title: 'เด็กหญิง', firstName: 'กาญจนา', lastName: 'ป้องแดน', gender: 'female' },
          { id: `s-${Date.now()}-3`, studentNumber: 3, studentCode: '67003', title: 'เด็กชาย', firstName: 'ธีรภัทร', lastName: 'ชาติตระการ', gender: 'male' },
        ],
      };
      onSaveClassroom(newClass);
      onSelectClassroom(newClass.id);
    }

    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-emerald-900/10 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <BppEmblem size="sm" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                จัดการโรงเรียนและห้องเรียน
              </h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                สังกัด กองกำกับการตำรวจตระเวนชายแดนที่ 31 (กก.ตชด.31)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="py-4 space-y-3.5 overflow-y-auto flex-1 pr-1">
            {/* School Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-emerald-700" />
                โรงเรียน ตชด. ในสังกัด กก.ตชด.31 *
              </label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-xs sm:text-sm p-2 bg-emerald-50/50 border border-emerald-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium text-slate-800"
              >
                {BPP_31_SCHOOLS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.district} {s.province})
                  </option>
                ))}
                <option value="custom">+ ระบุชื่อโรงเรียนอื่น...</option>
              </select>
            </div>

            {schoolName === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  พิมพ์ชื่อโรงเรียนตำรวจตระเวนชายแดน
                </label>
                <input
                  type="text"
                  required
                  value={customSchoolName}
                  onChange={(e) => setCustomSchoolName(e.target.value)}
                  placeholder="เช่น รร.ตชด.บ้าน..."
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            )}

            {/* Class Name & Preset */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับชั้นเรียน *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  {BPP_CLASS_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                  <option value={name}>กำหนดเอง...</option>
                </select>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น ชั้นประถมศึกษาปีที่ 4"
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            {/* Subject and Room */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  กิจกรรม / รายวิชา
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="เช่น เช็คชื่อหน้าเสาธง, โฮมรูม"
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ห้องเรียน / อาคาร
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="เช่น อาคารเรียนพระราชทาน"
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            {/* Year & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ปีการศึกษา (พ.ศ.)
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2567"
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ภาคเรียนที่
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                >
                  <option value="1">ภาคเรียนที่ 1</option>
                  <option value="2">ภาคเรียนที่ 2</option>
                  <option value="ฤดูร้อน">ภาคเรียนฤดูร้อน</option>
                </select>
              </div>
            </div>

            {/* Teacher Details (BPP Rank + Name) */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2.5">
              <label className="block text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                ครูประจำชั้น (ครู ตชด.)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <select
                    value={teacherRank}
                    onChange={(e) => setTeacherRank(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    {BPP_TEACHER_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={teacherNameOnly}
                    onChange={(e) => setTeacherNameOnly(e.target.value)}
                    placeholder="ชื่อ - นามสกุลครูผู้สอน"
                    className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Principal Details */}
              <label className="block text-xs font-semibold text-emerald-950 pt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                ครูใหญ่ รร.ตชด. (สำหรับลงนามในรายงาน)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <select
                    value={principalRank}
                    onChange={(e) => setPrincipalRank(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    {BPP_TEACHER_RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={principalNameOnly}
                    onChange={(e) => setPrincipalNameOnly(e.target.value)}
                    placeholder="ชื่อ - นามสกุลครูใหญ่"
                    className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition"
              >
                {editId ? 'บันทึกการแก้ไข' : 'สร้างห้องเรียน'}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4 space-y-3 overflow-y-auto flex-1 pr-1">
            <div className="space-y-2">
              {classrooms.map((c) => {
                const isActive = c.id === activeClassroomId;
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        onSelectClassroom(c.id);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-900 text-xs bg-emerald-100/80 px-2 py-0.5 rounded">
                          {c.schoolName || 'รร.ตชด.'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                        {isActive && (
                          <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-medium">
                            กำลังใช้งาน
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {c.teacherName ? `${c.teacherName} • ` : ''}
                        นักเรียน {c.students.length} คน • ปีการศึกษา {c.academicYear} (เทอม {c.semester})
                      </p>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="แก้ไขข้อมูลห้อง"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {classrooms.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้อง "${c.name}"?`)) {
                              onDeleteClassroom(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="ลบห้องเรียน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 border-2 border-dashed border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              เพิ่มห้องเรียน / โรงเรียน ตชด. ใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
