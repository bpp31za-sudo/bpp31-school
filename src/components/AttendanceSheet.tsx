import React, { useState, useMemo } from 'react';
import { Classroom, AttendanceRecord, AttendanceStatus, LeaveType, Student } from '../types';
import { 
  Check, 
  Clock, 
  FileText, 
  X, 
  Search, 
  CheckCheck, 
  RotateCcw, 
  MessageSquare, 
  Sparkles,
  LayoutGrid, 
  Table as TableIcon, 
  Filter, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AttendanceSheetProps {
  classroom: Classroom;
  record: AttendanceRecord;
  onUpdateEntry: (studentId: string, status: AttendanceStatus, note?: string, leaveType?: LeaveType) => void;
  onMarkAllPresent: () => void;
  onResetAll: () => void;
  onUpdateGeneralNote: (note: string) => void;
  onOpenRandomPicker: () => void;
}

export const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  classroom,
  record,
  onUpdateEntry,
  onMarkAllPresent,
  onResetAll,
  onUpdateGeneralNote,
  onOpenRandomPicker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus | 'unrecorded'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [activeNoteStudentId, setActiveNoteStudentId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [tempLeaveType, setTempLeaveType] = useState<LeaveType>('sick');

  // Compute live stats
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let leave = 0;
    let absent = 0;
    let unrecorded = 0;

    classroom.students.forEach((student) => {
      const entry = record.entries[student.id];
      if (!entry || !entry.status) {
        unrecorded++;
      } else if (entry.status === 'present') {
        present++;
      } else if (entry.status === 'late') {
        late++;
      } else if (entry.status === 'leave') {
        leave++;
      } else if (entry.status === 'absent') {
        absent++;
      }
    });

    const total = classroom.students.length;
    // Standard Thai calculation: (Present + Late) / Total * 100
    const attended = present + late;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      present,
      late,
      leave,
      absent,
      unrecorded,
      percentage,
    };
  }, [classroom.students, record.entries]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return classroom.students.filter((student) => {
      // Search filter (number or name or code)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${student.title}${student.firstName} ${student.lastName}`.toLowerCase();
        const numMatch = student.studentNumber.toString() === query;
        const codeMatch = student.studentCode.toLowerCase().includes(query);
        const nameMatch = fullName.includes(query);
        if (!numMatch && !codeMatch && !nameMatch) return false;
      }

      // Gender filter
      if (genderFilter !== 'all' && student.gender !== genderFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const entry = record.entries[student.id];
        if (statusFilter === 'unrecorded') {
          if (entry && entry.status) return false;
        } else {
          if (!entry || entry.status !== statusFilter) return false;
        }
      }

      return true;
    });
  }, [classroom.students, record.entries, searchQuery, statusFilter, genderFilter]);

  const handleMarkAll = () => {
    onMarkAllPresent();
    // Fire confetti when teacher checks all
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#6366F1', '#F59E0B']
      });
    } catch {
      // fallback
    }
  };

  const handleOpenNoteModal = (student: Student) => {
    const entry = record.entries[student.id];
    setTempNote(entry?.note || '');
    setTempLeaveType(entry?.leaveType || 'sick');
    setActiveNoteStudentId(student.id);
  };

  const handleSaveNoteModal = () => {
    if (!activeNoteStudentId) return;
    const currentEntry = record.entries[activeNoteStudentId];
    const currentStatus = currentEntry?.status || 'leave';
    onUpdateEntry(activeNoteStudentId, currentStatus, tempNote, tempLeaveType);
    setActiveNoteStudentId(null);
  };

  const activeModalStudent = classroom.students.find(s => s.id === activeNoteStudentId);

  return (
    <div className="space-y-6">
      {/* School & Affiliation Information Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                กก.ตชด.31
              </span>
              <span className="text-xs text-emerald-200">
                {classroom.affiliation || 'กองกำกับการตำรวจตระเวนชายแดนที่ 31'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight text-white flex items-center gap-2">
              {classroom.schoolName || 'โรงเรียนตำรวจตระเวนชายแดน'}
              <span className="text-sm font-normal text-emerald-200">
                — {classroom.name}
              </span>
            </h2>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              {classroom.subject ? `${classroom.subject} • ` : ''}
              {classroom.room ? `${classroom.room} • ` : ''}
              ปีการศึกษา {classroom.academicYear} (ภาคเรียนที่ {classroom.semester})
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-emerald-700/50 sm:pl-4">
            <div className="text-xs text-emerald-200">ครูประจำชั้น / ผู้บันทึก:</div>
            <div className="text-sm font-bold text-amber-300">
              {classroom.teacherName || 'ครู ตชด.'}
            </div>
            {classroom.principalName && (
              <div className="text-[11px] text-emerald-300/80 mt-0.5">
                ครูใหญ่: {classroom.principalName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Stat Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">นักเรียนทั้งหมด</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-400">คน</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>มาเรียน {stats.present + stats.late} คน</span>
          </div>
        </div>

        {/* Present (มา) */}
        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> มาเรียน
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/60 text-emerald-800">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-700">{stats.present}</span>
            <span className="text-xs text-emerald-600">คน</span>
          </div>
          <div className="mt-2 w-full bg-emerald-200/60 rounded-full h-1.5">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Late (สาย) */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> สาย
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-800">
              {stats.late} คน
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-700">{stats.late}</span>
            <span className="text-xs text-amber-600">คน</span>
          </div>
          <div className="mt-2 w-full bg-amber-200/60 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Leave (ลา) */}
        <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-sky-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span> ลา
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-200/60 text-sky-800">
              {stats.leave} คน
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-700">{stats.leave}</span>
            <span className="text-xs text-sky-600">คน</span>
          </div>
          <div className="mt-2 w-full bg-sky-200/60 rounded-full h-1.5">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.leave / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Absent (ขาด) */}
        <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> ขาดเรียน
            </p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-200/60 text-rose-800">
              {stats.absent} คน
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700">{stats.absent}</span>
            <span className="text-xs text-rose-600">คน</span>
          </div>
          <div className="mt-2 w-full bg-rose-200/60 rounded-full h-1.5">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 shadow-xs">
          <p className="text-xs font-semibold text-indigo-900">อัตราเข้าเรียน</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-indigo-700">{stats.percentage}%</span>
            <span className="text-xs text-indigo-500 font-medium">
              {stats.unrecorded > 0 ? `รอเช็ค ${stats.unrecorded}` : 'ครบถ้วน'}
            </span>
          </div>
          <div className="mt-2 w-full bg-indigo-200/60 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stats.percentage >= 80 ? 'bg-indigo-600' : 'bg-amber-500'
              }`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Bar & Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-mark-all-present"
              onClick={handleMarkAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-xs transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              เช็คมาทั้งหมด
            </button>

            <button
              id="btn-reset-attendance"
              onClick={() => {
                if (window.confirm('คุณต้องการรีเซ็ตสถานะการเช็คชื่อของวันนี้ใช่หรือไม่?')) {
                  onResetAll();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ต
            </button>

            <button
              id="btn-trigger-picker"
              onClick={onOpenRandomPicker}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              สุ่มถาม ({stats.present} คน)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">มุมมอง:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                id="btn-view-table"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองตาราง"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">ตาราง</span>
              </button>
              <button
                id="btn-view-card"
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === 'card' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองการ์ด"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">การ์ด</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-student"
              type="text"
              placeholder="ค้นหาชื่อ, สกุล, เลขที่ หรือรหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Quick Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
            </span>
            <button
              id="filter-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({classroom.students.length})
            </button>
            <button
              id="filter-status-unrecorded"
              onClick={() => setStatusFilter('unrecorded')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'unrecorded'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ยังไม่เช็ค ({stats.unrecorded})
            </button>
            <button
              id="filter-status-absent"
              onClick={() => setStatusFilter('absent')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              ขาด ({stats.absent})
            </button>
            <button
              id="filter-status-late"
              onClick={() => setStatusFilter('late')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'late'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              สาย ({stats.late})
            </button>
            <button
              id="filter-status-leave"
              onClick={() => setStatusFilter('leave')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'leave'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              ลา ({stats.leave})
            </button>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center text-xs">
            <select
              id="select-gender-filter"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-hidden cursor-pointer"
            >
              <option value="all">เพศ: ทั้งหมด</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Attendance List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะด้านบน</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setGenderFilter('all');
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 w-16 text-center">เลขที่</th>
                  <th className="py-3 px-3 w-24">รหัส</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4 text-center min-w-[320px]">สถานะการเข้าเรียน</th>
                  <th className="py-3 px-4 w-40">หมายเหตุ / เหตุผล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student) => {
                  const entry = record.entries[student.id];
                  const currentStatus = entry?.status;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        currentStatus === 'absent'
                          ? 'bg-rose-50/30'
                          : currentStatus === 'late'
                          ? 'bg-amber-50/30'
                          : currentStatus === 'leave'
                          ? 'bg-sky-50/30'
                          : ''
                      }`}
                    >
                      {/* เลขที่ */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                          {student.studentNumber}
                        </span>
                      </td>

                      {/* รหัส */}
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                        {student.studentCode}
                      </td>

                      {/* ชื่อ - นามสกุล */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${student.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'}`} />
                          <span className="font-semibold text-slate-800">
                            {student.title}{student.firstName} {student.lastName}
                          </span>
                          {/* Health Tags (เหา / อ้วน / ฟันผุ) */}
                          {student.health?.hasLice && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-medium" title="นักเรียนเป็นเหา">
                              🪮 เหา
                            </span>
                          )}
                          {student.health?.isObese && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium" title="ภาวะอ้วน/เกินเกณฑ์">
                              ⚖️ อ้วน
                            </span>
                          )}
                          {student.health?.hasCavities && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-medium" title={`ฟันผุ ${student.health.cavityCount || 1} ซี่`}>
                              🦷 ผุ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* สถานะ Buttons */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {/* มา */}
                          <button
                            id={`btn-status-${student.id}-present`}
                            onClick={() => onUpdateEntry(student.id, 'present')}
                            className={`flex-1 max-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                              currentStatus === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            มา
                          </button>

                          {/* สาย */}
                          <button
                            id={`btn-status-${student.id}-late`}
                            onClick={() => onUpdateEntry(student.id, 'late')}
                            className={`flex-1 max-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                              currentStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            สาย
                          </button>

                          {/* ลา */}
                          <button
                            id={`btn-status-${student.id}-leave`}
                            onClick={() => {
                              if (currentStatus !== 'leave') {
                                onUpdateEntry(student.id, 'leave', entry?.note, 'sick');
                              }
                              handleOpenNoteModal(student);
                            }}
                            className={`flex-1 max-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                              currentStatus === 'leave'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            ลา
                          </button>

                          {/* ขาด */}
                          <button
                            id={`btn-status-${student.id}-absent`}
                            onClick={() => onUpdateEntry(student.id, 'absent')}
                            className={`flex-1 max-w-[76px] py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                              currentStatus === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            ขาด
                          </button>
                        </div>
                      </td>

                      {/* หมายเหตุ */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {entry?.note || entry?.leaveType ? (
                            <button
                              onClick={() => handleOpenNoteModal(student)}
                              className="text-left text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md truncate max-w-[140px] flex items-center gap-1 transition"
                              title={entry.note || (entry.leaveType === 'sick' ? 'ลาป่วย' : entry.leaveType === 'personal' ? 'ลากิจ' : 'กิจกรรม')}
                            >
                              <MessageSquare className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">
                                {entry.leaveType ? (entry.leaveType === 'sick' ? '[ลาป่วย] ' : entry.leaveType === 'personal' ? '[ลากิจ] ' : '[กิจกรรม] ') : ''}
                                {entry.note || 'มีบันทึก'}
                              </span>
                            </button>
                          ) : (
                            <button
                              id={`btn-add-note-${student.id}`}
                              onClick={() => handleOpenNoteModal(student)}
                              className="text-xs text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition"
                              title="เพิ่มหมายเหตุ / บันทึกเหตุผล"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredStudents.map((student) => {
            const entry = record.entries[student.id];
            const currentStatus = entry?.status;

            return (
              <div
                key={student.id}
                className={`bg-white rounded-xl border p-3.5 shadow-xs transition ${
                  currentStatus === 'present'
                    ? 'border-emerald-200'
                    : currentStatus === 'late'
                    ? 'border-amber-200 bg-amber-50/20'
                    : currentStatus === 'leave'
                    ? 'border-sky-200 bg-sky-50/20'
                    : currentStatus === 'absent'
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center shrink-0">
                      {student.studentNumber}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                        {student.title}{student.firstName} {student.lastName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {student.studentCode} • {student.gender === 'male' ? 'ชาย' : 'หญิง'}
                      </p>
                      {/* Health tags */}
                      {(student.health?.hasLice || student.health?.isObese || student.health?.hasCavities) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.health.hasLice && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-medium">🪮 เหา</span>
                          )}
                          {student.health.isObese && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-medium">⚖️ อ้วน</span>
                          )}
                          {student.health.hasCavities && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 px-1 rounded font-medium">🦷 ผุ</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenNoteModal(student)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                    title="บันทึกหมายเหตุ"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Badge Note if exists */}
                {entry?.note && (
                  <div className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md mb-2 truncate">
                    💬 {entry.note}
                  </div>
                )}

                {/* Quick Status Buttons */}
                <div className="grid grid-cols-4 gap-1">
                  <button
                    onClick={() => onUpdateEntry(student.id, 'present')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                    }`}
                  >
                    มา
                  </button>
                  <button
                    onClick={() => onUpdateEntry(student.id, 'late')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                      currentStatus === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    สาย
                  </button>
                  <button
                    onClick={() => {
                      if (currentStatus !== 'leave') {
                        onUpdateEntry(student.id, 'leave', entry?.note, 'sick');
                      }
                      handleOpenNoteModal(student);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                      currentStatus === 'leave'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-sky-50'
                    }`}
                  >
                    ลา
                  </button>
                  <button
                    onClick={() => onUpdateEntry(student.id, 'absent')}
                    className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                    }`}
                  >
                    ขาด
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classroom General Note & Auto-save Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="input-general-note" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            บันทึกการสอน / บันทึกประจำวันของครู
          </label>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            บันทึกอัตโนมัติแล้ว
          </span>
        </div>
        <textarea
          id="input-general-note"
          rows={2}
          value={record.generalNote || ''}
          onChange={(e) => onUpdateGeneralNote(e.target.value)}
          placeholder="บันทึกข้อความเพิ่มเติม เช่น หัวข้อที่สอน, บันทึกพฤติกรรม, กิจกรรมพิเศษวันนี้..."
          className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
        />
      </div>

      {/* Note Modal for Single Student */}
      {activeNoteStudentId && activeModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  บันทึกหมายเหตุ: เลขที่ {activeModalStudent.studentNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeModalStudent.title}{activeModalStudent.firstName} {activeModalStudent.lastName}
                </p>
              </div>
              <button
                onClick={() => setActiveNoteStudentId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* If status is 'leave', show leave category picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภทการลา
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempLeaveType('sick')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                      tempLeaveType === 'sick'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🤒 ลาป่วย
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempLeaveType('personal')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                      tempLeaveType === 'personal'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🚗 ลากิจ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempLeaveType('activity')}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                      tempLeaveType === 'activity'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏆 กิจกรรม ร.ร.
                  </button>
                </div>
              </div>

              {/* Note Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  รายละเอียดเหตุผล / หมายเหตุ
                </label>
                <textarea
                  rows={3}
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  placeholder="เช่น มีใบรับรองแพทย์จาก รพ., ไปแข่งขันตอบปัญหาวิชาการ, มาสายเพราะติดน้ำท่วม..."
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">ข้อความด่วน:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    'ผู้ปกครองโทรแจ้งครูแล้ว',
                    'มีใบรับรองแพทย์ / พบแพทย์ รพ.สต.',
                    'ช่วยผู้ปกครองเกี่ยวข้าว / ทำไร่',
                    'น้ำป่า / ข้ามลำห้วยไม่ได้',
                    'ไปร่วมกิจกรรมโครงการพระราชทาน',
                    'ตรวจสุขอนามัยประจำสัปดาห์',
                    'ไม่สบาย มีไข้ / หวัด',
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTempNote(preset)}
                      className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveNoteStudentId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveNoteModal}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition"
              >
                บันทึกหมายเหตุ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
