import React from 'react';
import { Classroom, ActiveTab } from '../types';
import { formatThaiDateFull, DEFAULT_PERIODS, getTodayDateString } from '../utils/thaiDate';
import { BppEmblem } from './BppEmblem';
import { 
  CheckSquare, 
  BarChart3, 
  Users, 
  Calendar, 
  History, 
  Sparkles, 
  Settings, 
  PlusCircle,
  Download,
  CalendarDays,
  School,
  Shield,
  UserCheck,
  Heart,
  Activity
} from 'lucide-react';

interface HeaderProps {
  classrooms: Classroom[];
  activeClassroom: Classroom | null;
  onSelectClassroom: (id: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenClassroomManager: () => void;
  onOpenRandomPicker: () => void;
  onExportBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  classrooms,
  activeClassroom,
  onSelectClassroom,
  selectedDate,
  onSelectDate,
  selectedPeriod,
  onSelectPeriod,
  activeTab,
  onSelectTab,
  onOpenClassroomManager,
  onOpenRandomPicker,
  onExportBackup,
}) => {
  const isToday = selectedDate === getTodayDateString();

  return (
    <header className="bg-white border-b border-emerald-900/10 sticky top-0 z-30 shadow-xs">
      {/* Top BPP Affiliation Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white text-xs px-4 py-1.5 sm:px-6 lg:px-8 border-b border-emerald-950/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300">
              <Shield className="w-3.5 h-3.5" />
              สังกัด กก.ตชด.31
            </span>
            <span className="hidden sm:inline text-emerald-200/80">•</span>
            <span className="hidden sm:inline text-emerald-100">
              ค่ายเจ้าพระยาจักรี อ.เมือง จ.พิษณุโลก
            </span>
            <span className="hidden md:inline text-emerald-200/80">•</span>
            <span className="hidden md:inline text-emerald-200/90 text-[11px]">
              กองกำกับการตำรวจตระเวนชายแดนที่ 31 (บก.ตชด.ภาค 3)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-emerald-200">
            <span className="italic hidden lg:inline">"เสียสละ อดทน พัฒนา ปวงประชาเป็นสุข"</span>
            <span className="bg-emerald-800/80 text-amber-200 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-700/50">
              ระบบ รร.ตชด.
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BppEmblem size="md" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  ระบบเช็คชื่อนักเรียน รร.ตชด.
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    กก.ตชด.31
                  </span>
                </h1>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-medium text-emerald-950">
                    {activeClassroom?.schoolName || 'โรงเรียนตำรวจตระเวนชายแดน'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-normal">
                    {activeClassroom ? activeClassroom.name : 'บันทึกเวลาเรียน'}
                  </span>
                </p>
              </div>
            </div>

            {/* Mobile Action Icons */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                id="btn-random-picker-mobile"
                onClick={onOpenRandomPicker}
                className="p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                title="สุ่มเรียกนักเรียน"
                aria-label="สุ่มเรียกนักเรียน"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                id="btn-classroom-mgr-mobile"
                onClick={onOpenClassroomManager}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="จัดการโรงเรียน / ห้องเรียน"
                aria-label="จัดการโรงเรียนและห้องเรียน"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Tools & Context Selectors */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* School & Classroom Selector */}
            <div className="flex items-center gap-1 bg-emerald-50/70 p-1 rounded-lg border border-emerald-200/80">
              <label htmlFor="select-classroom" className="sr-only">เลือกโรงเรียนและชั้นเรียน</label>
              <School className="w-4 h-4 text-emerald-700 ml-1.5" />
              <select
                id="select-classroom"
                value={activeClassroom?.id || ''}
                onChange={(e) => onSelectClassroom(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-emerald-950 px-2 py-1 rounded focus:outline-hidden cursor-pointer max-w-[230px] sm:max-w-[300px] truncate"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.schoolName ? `${c.schoolName} - ${c.name}` : c.name} ({c.students.length} คน)
                  </option>
                ))}
              </select>
              <button
                id="btn-open-classroom-modal"
                onClick={onOpenClassroomManager}
                className="p-1 text-emerald-800 hover:text-emerald-950 hover:bg-white rounded transition"
                title="จัดการโรงเรียน / เพิ่มห้องใหม่"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Random Student Tool */}
            <button
              id="btn-random-picker-desktop"
              onClick={onOpenRandomPicker}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-300 transition shadow-2xs"
              title="สุ่มเรียกนักเรียนจากคนที่มาเรียน"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              สุ่มเรียกตอบ
            </button>

            {/* Backup export button */}
            <button
              id="btn-export-backup"
              onClick={onExportBackup}
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              title="สำรองข้อมูลทั้งหมด (JSON)"
            >
              <Download className="w-3.5 h-3.5" />
              สำรองข้อมูล
            </button>
          </div>
        </div>

        {/* Date & Period Controls Sub-bar */}
        <div className="py-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Date Input */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <input
                id="input-attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => onSelectDate(e.target.value)}
                className="text-xs sm:text-sm font-medium text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              />
              {!isToday && (
                <button
                  id="btn-set-today"
                  onClick={() => onSelectDate(getTodayDateString())}
                  className="text-[11px] font-medium text-emerald-700 hover:underline px-1 py-0.5 rounded bg-emerald-50"
                  title="เปลี่ยนเป็นวันนี้"
                >
                  วันนี้
                </button>
              )}
            </div>

            {/* Thai Date Badge */}
            <div className="hidden sm:flex items-center text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {formatThaiDateFull(selectedDate)}
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">กิจกรรม/คาบ:</span>
              <select
                id="select-period"
                value={selectedPeriod}
                onChange={(e) => onSelectPeriod(e.target.value)}
                className="text-xs sm:text-sm bg-slate-50 font-medium text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer max-w-[240px] sm:max-w-[320px] truncate"
              >
                {DEFAULT_PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher Badge with BPP rank */}
          {activeClassroom?.teacherName && (
            <div className="text-xs text-slate-600 hidden md:flex items-center gap-1.5 bg-emerald-50/50 px-2.5 py-1 rounded-md border border-emerald-100">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>ครูประจำชั้น:</span>
              <span className="font-semibold text-emerald-950">{activeClassroom.teacherName}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-200 pt-1 -mb-px overflow-x-auto">
          <button
            id="tab-attendance"
            onClick={() => onSelectTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/70 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-700" />
            บันทึกเช็คชื่อ
          </button>

          <button
            id="tab-health"
            onClick={() => onSelectTab('health')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'health'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/70 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-600" />
            <span>ตรวจสุขภาพและสถิติ (เหา•อ้วน•ฟันผุ)</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline">
              กพด.
            </span>
          </button>

          <button
            id="tab-report"
            onClick={() => onSelectTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/70 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            รายงานและสถิติ (ส่งงานวิชาการ)
          </button>

          <button
            id="tab-students"
            onClick={() => onSelectTab('students')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'students'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/70 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            รายชื่อนักเรียน ({activeClassroom?.students.length || 0} คน)
          </button>

          <button
            id="tab-history"
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-700 text-emerald-900 bg-emerald-50/70 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <History className="w-4 h-4 text-emerald-700" />
            ประวัติการเช็คชื่อ
          </button>
        </div>
      </div>
    </header>
  );
};
