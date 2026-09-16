import React, { useState, useMemo } from 'react';
import { Classroom, Student, StudentHealth, NutritionStatus } from '../types';
import { calculateBMI, computeHealthStats, exportHealthReportCSV } from '../utils/health';
import { formatThaiDateFull, getTodayDateString } from '../utils/thaiDate';
import { BppEmblem } from './BppEmblem';
import {
  Heart,
  Activity,
  Bug,
  Scale,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Printer,
  Download,
  Edit3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  HelpCircle,
  Plus,
  Minus,
  Apple,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HealthManagerProps {
  classroom: Classroom;
  onUpdateClassroom: (updatedClassroom: Classroom) => void;
}

type ScreeningMode = 'all' | 'lice' | 'weight_height' | 'cavities';
type HealthFilter = 'all' | 'lice' | 'obese' | 'cavities' | 'healthy' | 'overweight' | 'thin';

export const HealthManager: React.FC<HealthManagerProps> = ({
  classroom,
  onUpdateClassroom,
}) => {
  const [screeningMode, setScreeningMode] = useState<ScreeningMode>('all');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  
  // Selected student for detailed health modal
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempHealth, setTempHealth] = useState<StudentHealth>({
    hasLice: false,
    isObese: false,
    hasCavities: false,
  });

  // Calculate live health statistics
  const healthStats = useMemo(() => {
    return computeHealthStats(classroom.students);
  }, [classroom.students]);

  // Update a single student's health data
  const handleUpdateStudentHealth = (studentId: string, healthUpdate: Partial<StudentHealth>) => {
    const updatedStudents = classroom.students.map((student) => {
      if (student.id !== studentId) return student;

      const currentHealth: StudentHealth = student.health || {
        hasLice: false,
        isObese: false,
        hasCavities: false,
      };

      const mergedHealth: StudentHealth = {
        ...currentHealth,
        ...healthUpdate,
        lastCheckedDate: healthUpdate.lastCheckedDate || getTodayDateString(),
      };

      // Recalculate BMI & obesity status if weight/height changed
      if (healthUpdate.weight !== undefined || healthUpdate.height !== undefined) {
        const w = healthUpdate.weight !== undefined ? healthUpdate.weight : currentHealth.weight;
        const h = healthUpdate.height !== undefined ? healthUpdate.height : currentHealth.height;
        const bmiCalc = calculateBMI(w, h);
        mergedHealth.bmi = bmiCalc.bmi;
        mergedHealth.nutritionStatus = bmiCalc.status;
        mergedHealth.isObese = bmiCalc.status === 'obese' || bmiCalc.status === 'overweight';
      }

      return {
        ...student,
        health: mergedHealth,
      };
    });

    onUpdateClassroom({
      ...classroom,
      students: updatedStudents,
    });
  };

  // Open modal for detailed editing
  const handleOpenDetailModal = (student: Student) => {
    setEditingStudentId(student.id);
    const existing = student.health || {
      hasLice: false,
      isObese: false,
      hasCavities: false,
      weight: student.gender === 'male' ? 32 : 30,
      height: student.gender === 'male' ? 135 : 133,
      bmi: 17.5,
      nutritionStatus: 'normal',
      cavityCount: 0,
      lastCheckedDate: getTodayDateString(),
    };
    setTempHealth({ ...existing });
  };

  const handleSaveModal = () => {
    if (!editingStudentId) return;
    handleUpdateStudentHealth(editingStudentId, tempHealth);
    setEditingStudentId(null);
  };

  // Quick batch actions
  const handleBatchMarkNoLice = () => {
    if (window.confirm('คุณต้องการบันทึกว่า "ทุกคนไม่มีเหา" ใช่หรือไม่?')) {
      const updatedStudents = classroom.students.map((s) => ({
        ...s,
        health: {
          ...(s.health || { isObese: false, hasCavities: false }),
          hasLice: false,
          liceSeverity: 'none' as const,
          lastCheckedDate: getTodayDateString(),
        },
      }));
      onUpdateClassroom({ ...classroom, students: updatedStudents });
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return classroom.students.filter((student) => {
      const h = student.health;
      const isLice = Boolean(h?.hasLice);
      const isObese = Boolean(h?.isObese);
      const hasCavities = Boolean(h?.hasCavities);
      const isHealthy = !isLice && !isObese && !hasCavities;

      // Filter by health category
      if (healthFilter === 'lice' && !isLice) return false;
      if (healthFilter === 'obese' && !isObese) return false;
      if (healthFilter === 'cavities' && !hasCavities) return false;
      if (healthFilter === 'healthy' && !isHealthy) return false;
      if (healthFilter === 'overweight' && h?.nutritionStatus !== 'overweight') return false;
      if (healthFilter === 'thin' && h?.nutritionStatus !== 'thin') return false;

      // Filter by gender
      if (genderFilter !== 'all' && student.gender !== genderFilter) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${student.title}${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          student.studentNumber.toString() === q ||
          student.studentCode.toLowerCase().includes(q) ||
          fullName.includes(q)
        );
      }

      return true;
    });
  }, [classroom.students, healthFilter, genderFilter, searchQuery]);

  const activeStudent = classroom.students.find((s) => s.id === editingStudentId);

  return (
    <div className="space-y-6">
      {/* Top BPP Health Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" />
                โครงการ กพด. กก.ตชด.31
              </span>
              <span className="text-xs text-teal-200">
                งานส่งเสริมสุขภาพและสุขอนามัยนักเรียน รร.ตชด.
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight text-white flex items-center gap-2">
              บันทึกตรวจสุขภาพและสถิติ: เหา • อ้วน • ฟันผุ
              <span className="text-sm font-normal text-teal-200">
                ({classroom.name})
              </span>
            </h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              {classroom.schoolName} • ประจำวันที่ {formatThaiDateFull(getTodayDateString())}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="btn-print-health"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-950 bg-teal-100 hover:bg-white rounded-lg transition shadow-2xs cursor-pointer"
              title="พิมพ์แบบบันทึกตรวจสุขภาพ"
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์แบบตรวจ
            </button>
            <button
              id="btn-export-health-csv"
              onClick={() => exportHealthReportCSV(classroom)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-2xs cursor-pointer"
              title="ส่งออกสถิติสุขภาพเป็น Excel (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              ส่งออก Excel
            </button>
          </div>
        </div>
      </div>

      {/* 4 Major Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. เป็นเหา (Head Lice) */}
        <div 
          onClick={() => setHealthFilter(healthFilter === 'lice' ? 'all' : 'lice')}
          className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
            healthFilter === 'lice'
              ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                🪮
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700">เป็นเหา</p>
                <p className="text-[11px] text-slate-400">ตรวจสุขอนามัยเส้นผม</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              healthStats.liceCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {healthStats.licePercentage}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-rose-700">{healthStats.liceCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {healthStats.total} คน</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              (ชาย {healthStats.liceMale} • หญิง {healthStats.liceFemale})
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${healthStats.licePercentage}%` }}
            />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>ได้รับยาสระกำจัดเหา: <strong className="text-slate-800">{healthStats.liceTreatedCount}</strong> คน</span>
            <span className="text-rose-600 font-medium hover:underline">
              {healthFilter === 'lice' ? 'เลิกกรอง' : 'กรองดูรายชื่อ →'}
            </span>
          </div>
        </div>

        {/* 2. ภาวะอ้วน / น้ำหนักเกิน (Obesity & Overweight) */}
        <div 
          onClick={() => setHealthFilter(healthFilter === 'obese' ? 'all' : 'obese')}
          className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
            healthFilter === 'obese'
              ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                ⚖️
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700">ภาวะอ้วน / เกินเกณฑ์</p>
                <p className="text-[11px] text-slate-400">เกณฑ์ BMI กรมอนามัย</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              healthStats.obeseCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {healthStats.obesePercentage}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-amber-700">{healthStats.obeseCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {healthStats.total} คน</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              (ชาย {healthStats.obeseMale} • หญิง {healthStats.obeseFemale})
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${healthStats.obesePercentage}%` }}
            />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>BMI เฉลี่ยห้อง: <strong className="text-slate-800">{healthStats.averageBmi > 0 ? healthStats.averageBmi : '-'}</strong></span>
            <span className="text-amber-700 font-medium hover:underline">
              {healthFilter === 'obese' ? 'เลิกกรอง' : 'กรองดูรายชื่อ →'}
            </span>
          </div>
        </div>

        {/* 3. ฟันผุ (Dental Caries) */}
        <div 
          onClick={() => setHealthFilter(healthFilter === 'cavities' ? 'all' : 'cavities')}
          className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
            healthFilter === 'cavities'
              ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                🦷
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700">มีฟันผุ</p>
                <p className="text-[11px] text-slate-400">ตรวจสุขภาพช่องปาก</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              healthStats.cavityStudentCount > 0 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {healthStats.cavityPercentage}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-sky-700">{healthStats.cavityStudentCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {healthStats.total} คน</span>
            </div>
            <span className="text-[11px] font-medium text-sky-800 bg-sky-100/70 px-1.5 py-0.5 rounded">
              รวม {healthStats.cavityTotalTeeth} ซี่
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${healthStats.cavityPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>รักษา/อุดแล้ว: <strong className="text-slate-800">{healthStats.cavityTreatedCount}</strong> คน</span>
            <span className="text-sky-700 font-medium hover:underline">
              {healthFilter === 'cavities' ? 'เลิกกรอง' : 'กรองดูรายชื่อ →'}
            </span>
          </div>
        </div>

        {/* 4. สุขภาพสมบูรณ์ 3 ด้าน (Healthy & Perfect) */}
        <div 
          onClick={() => setHealthFilter(healthFilter === 'healthy' ? 'all' : 'healthy')}
          className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
            healthFilter === 'healthy'
              ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                🌟
              </span>
              <div>
                <p className="text-xs font-bold text-slate-700">สุขภาพดีสมบูรณ์</p>
                <p className="text-[11px] text-slate-400">ไม่มีเหา • ไม่อ้วน • ไม่ผุ</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {healthStats.perfectHealthPercentage}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-emerald-700">{healthStats.perfectHealthCount}</span>
              <span className="text-xs text-slate-500 font-medium">/ {healthStats.total} คน</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์ กพด.
            </span>
          </div>

          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${healthStats.perfectHealthPercentage}%` }}
            />
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>อัตราส่วนนักเรียนสุขภาพดี</span>
            <span className="text-emerald-700 font-medium hover:underline">
              {healthFilter === 'healthy' ? 'เลิกกรอง' : 'ดูรายชื่อ →'}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Quick Inspection Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Screening Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
              โหมดการบันทึก:
            </span>
            <button
              onClick={() => setScreeningMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                screeningMode === 'all'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              ภาพรวมทั้งหมด
            </button>
            <button
              onClick={() => setScreeningMode('lice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                screeningMode === 'lice'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              🪮 โหมดเดินตรวจเหา (1-Click)
            </button>
            <button
              onClick={() => setScreeningMode('weight_height')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                screeningMode === 'weight_height'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              ⚖️ ชั่งน้ำหนัก-วัดส่วนสูง (คำนวณ BMI)
            </button>
            <button
              onClick={() => setScreeningMode('cavities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                screeningMode === 'cavities'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              🦷 โหมดตรวจฟันผุ
            </button>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchMarkNoLice}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
              title="รีเซ็ตสถานะทุกคนเป็นไม่มีเหา"
            >
              ตั้งค่าทุกคนไม่มีเหา
            </button>
          </div>
        </div>

        {/* Search & Filter Subbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-health"
              type="text"
              placeholder="ค้นหาชื่อ, เลขที่ หรือรหัสนักเรียน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-teal-600 transition"
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

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
            </span>
            <button
              onClick={() => setHealthFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                healthFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ทั้งหมด ({classroom.students.length})
            </button>
            <button
              onClick={() => setHealthFilter('lice')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                healthFilter === 'lice'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              เป็นเหา ({healthStats.liceCount})
            </button>
            <button
              onClick={() => setHealthFilter('obese')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                healthFilter === 'obese'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              อ้วน/เกินเกณฑ์ ({healthStats.obeseCount})
            </button>
            <button
              onClick={() => setHealthFilter('cavities')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                healthFilter === 'cavities'
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              ฟันผุ ({healthStats.cavityStudentCount})
            </button>
            <button
              onClick={() => setHealthFilter('healthy')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                healthFilter === 'healthy'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              สุขภาพดี ({healthStats.perfectHealthCount})
            </button>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2 py-0.5 rounded ${genderFilter === 'all' ? 'bg-white font-semibold text-slate-800 shadow-2xs' : 'text-slate-500'}`}
            >
              ทุกเพศ
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`px-2 py-0.5 rounded ${genderFilter === 'male' ? 'bg-white font-semibold text-sky-700 shadow-2xs' : 'text-slate-500'}`}
            >
              ชาย
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`px-2 py-0.5 rounded ${genderFilter === 'female' ? 'bg-white font-semibold text-pink-700 shadow-2xs' : 'text-slate-500'}`}
            >
              หญิง
            </button>
          </div>
        </div>
      </div>

      {/* Main Health Screening Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              แบบบันทึกผลการตรวจสุขภาพนักเรียนรายบุคคล (โครงการ กพด.)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดง {filteredStudents.length} จาก {classroom.students.length} คน • คลิกที่ปุ่มเพื่อเปลี่ยนสถานะได้ทันที หรือกดปุ่ม &quot;แก้ไข&quot; เพื่อบันทึกอย่างละเอียด
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md font-medium">
              โรงเรียนตำรวจตระเวนชายแดน
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">เลขที่</th>
                <th className="py-3 px-3 w-16">รหัส</th>
                <th className="py-3 px-4 min-w-[170px]">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 text-center w-14">เพศ</th>
                
                {/* เหา Column */}
                <th className="py-3 px-4 text-center min-w-[140px] bg-rose-50/50 border-x border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-rose-800">
                    <span>🪮</span> เหา
                  </div>
                </th>

                {/* ภาวะอ้วน Column */}
                <th className="py-3 px-4 text-center min-w-[190px] bg-amber-50/50 border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-amber-900">
                    <span>⚖️</span> น้ำหนัก/ส่วนสูง (BMI)
                  </div>
                </th>

                {/* ฟันผุ Column */}
                <th className="py-3 px-4 text-center min-w-[160px] bg-sky-50/50 border-r border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-sky-900">
                    <span>🦷</span> ฟันผุ
                  </div>
                </th>

                {/* หมายเหตุ / การดูแล */}
                <th className="py-3 px-4 min-w-[160px]">หมายเหตุ / การส่งต่อ</th>
                <th className="py-3 px-3 text-center w-20">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.map((student) => {
                const h = student.health || {
                  hasLice: false,
                  isObese: false,
                  hasCavities: false,
                };
                const bmiCalc = calculateBMI(h.weight, h.height);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-xs text-slate-700">
                      {student.studentNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-500">
                      {student.studentCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{student.title}{student.firstName} {student.lastName}</span>
                        {!h.hasLice && !h.isObese && !h.hasCavities && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200" title="สุขภาพสมบูรณ์">
                            🌟
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        student.gender === 'male' ? 'bg-sky-100 text-sky-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {student.gender === 'male' ? 'ชาย' : 'หญิง'}
                      </span>
                    </td>

                    {/* เหา Cell */}
                    <td className="py-2.5 px-3 border-x border-slate-200 bg-rose-50/20">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button
                          onClick={() => handleUpdateStudentHealth(student.id, { hasLice: !h.hasLice })}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                            h.hasLice
                              ? 'bg-rose-600 text-white shadow-2xs hover:bg-rose-700'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          {h.hasLice ? (
                            <>
                              <Bug className="w-3.5 h-3.5" />
                              เป็นเหา
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ปกติ
                            </>
                          )}
                        </button>
                        {h.hasLice && (
                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              onClick={() => handleUpdateStudentHealth(student.id, { liceTreated: !h.liceTreated })}
                              className={`px-1.5 py-0.5 rounded transition ${
                                h.liceTreated
                                  ? 'bg-emerald-100 text-emerald-800 font-medium'
                                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              }`}
                              title="คลิกเพื่อเปลี่ยนสถานะการได้รับยาฆ่าเหา"
                            >
                              {h.liceTreated ? '✓ แจกยาแล้ว' : '+ ยังไม่ได้รับยา'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ภาวะอ้วน Cell */}
                    <td className="py-2.5 px-3 border-r border-slate-200 bg-amber-50/20">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {screeningMode === 'weight_height' ? (
                          <div className="flex items-center gap-1 w-full justify-center">
                            <input
                              type="number"
                              placeholder="นน."
                              value={h.weight || ''}
                              onChange={(e) => handleUpdateStudentHealth(student.id, { weight: parseFloat(e.target.value) || undefined })}
                              className="w-14 py-1 px-1.5 text-center text-xs bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-amber-500"
                              title="น้ำหนัก (กก.)"
                            />
                            <span className="text-[10px] text-slate-400">/</span>
                            <input
                              type="number"
                              placeholder="สส."
                              value={h.height || ''}
                              onChange={(e) => handleUpdateStudentHealth(student.id, { height: parseFloat(e.target.value) || undefined })}
                              className="w-14 py-1 px-1.5 text-center text-xs bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-amber-500"
                              title="ส่วนสูง (ซม.)"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${bmiCalc.badgeColor}`}>
                              {bmiCalc.statusThai}
                            </span>
                            {bmiCalc.bmi > 0 && (
                              <span className="text-[11px] font-mono text-slate-500 font-medium">
                                BMI {bmiCalc.bmi}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>นน. {h.weight || '-'} กก.</span>
                          <span>•</span>
                          <span>สส. {h.height || '-'} ซม.</span>
                        </div>
                      </div>
                    </td>

                    {/* ฟันผุ Cell */}
                    <td className="py-2.5 px-3 border-r border-slate-200 bg-sky-50/20">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center gap-1 w-full justify-center">
                          <button
                            onClick={() => handleUpdateStudentHealth(student.id, { 
                              hasCavities: !h.hasCavities,
                              cavityCount: !h.hasCavities ? (h.cavityCount || 1) : 0
                            })}
                            className={`py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                              h.hasCavities
                                ? 'bg-sky-600 text-white shadow-2xs hover:bg-sky-700'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                            }`}
                          >
                            {h.hasCavities ? 'มีฟันผุ' : 'ฟันดี'}
                          </button>

                          {h.hasCavities && (
                            <div className="flex items-center gap-0.5 bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded text-xs font-bold">
                              <span>{h.cavityCount || 1}</span>
                              <span className="text-[10px] font-normal">ซี่</span>
                            </div>
                          )}
                        </div>

                        {h.hasCavities && (
                          <button
                            onClick={() => handleUpdateStudentHealth(student.id, { cavityTreated: !h.cavityTreated })}
                            className={`text-[10px] px-1.5 py-0.2 rounded transition ${
                              h.cavityTreated
                                ? 'bg-emerald-100 text-emerald-800 font-medium'
                                : 'bg-slate-100 text-slate-600 hover:bg-sky-100'
                            }`}
                            title="คลิกเพื่อสลับสถานะการรักษาฟันผุ"
                          >
                            {h.cavityTreated ? '✓ อุด/รักษาแล้ว' : 'รอส่งต่อ รพ.สต.'}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* หมายเหตุ */}
                    <td className="py-2.5 px-4 text-xs text-slate-600">
                      <p className="truncate max-w-[200px]" title={h.healthNote || h.treatmentPlan || 'ไม่มีหมายเหตุ'}>
                        {h.healthNote || h.treatmentPlan || '-'}
                      </p>
                    </td>

                    {/* จัดการ */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenDetailModal(student)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                        title="แก้ไขรายละเอียดสุขภาพ"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Guidelines & Action Plan Cards for BPP Schools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lice action guideline */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm mb-2">
            <span className="text-base">🪮</span>
            <span>แนวทางแก้ไขปัญหาเหา (รร.ตชด.)</span>
          </div>
          <ul className="text-xs text-rose-800 space-y-1.5 list-disc pl-4">
            <li>แจกยาสระกำจัดเหา (เบนซิลเบนโซเอต) ให้สระหมักผม 10-15 นาที</li>
            <li>ใช้หวีเสนียดสางไข่เหาออก และสระซ้ำหลังจากนั้น 7 วัน</li>
            <li>แนะนำผู้ปกครองนำเครื่องนอนและปลอกหมอนไปตากแดดจัด</li>
            <li>ติดตามผลทุกวันศุกร์ในคาบตรวจสุขอนามัย</li>
          </ul>
        </div>

        {/* Obesity action guideline */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
            <span className="text-base">⚖️</span>
            <span>มาตรการลดภาวะอ้วน (โภชนาการ)</span>
          </div>
          <ul className="text-xs text-amber-800 space-y-1.5 list-disc pl-4">
            <li>โครงการเกษตรเพื่ออาหารกลางวัน: จัดจานผัก 50% ข้าว 25% เนื้อสัตว์ 25%</li>
            <li>ควบคุมน้ำหวาน น้ำอัดลม และขนมกรุบกรอบในสหกรณ์โรงเรียน</li>
            <li>ส่งเสริมดื่มนมจืดพระราชทานวันละ 2 กล่อง</li>
            <li>เพิ่มกิจกรรมขยับกายออกกำลังกายตอนเช้าและช่วงพักกลางวัน</li>
          </ul>
        </div>

        {/* Cavity action guideline */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-sm mb-2">
            <span className="text-base">🦷</span>
            <span>มาตรการป้องกันฟันผุ (ทันตสุขภาพ)</span>
          </div>
          <ul className="text-xs text-sky-800 space-y-1.5 list-disc pl-4">
            <li>กิจกรรมแปรงฟันหลังอาหารกลางวันร่วมกันทุกวัน (สูตร 2-2-2)</li>
            <li>ใช้ยาสีฟันผสมฟลูออไรด์ 1,000-1,500 ppm</li>
            <li>จัดกิจกรรมย้อมสีฟันเพื่อประเมินความสะอาดเดือนละ 1 ครั้ง</li>
            <li>รวบรวมรายชื่อนักเรียนฟันผุส่งต่อทันตแพทย์ รพ.สต. เพื่ออุดและเคลือบหลุมร่องฟัน</li>
          </ul>
        </div>
      </div>

      {/* Detailed Student Health Modal */}
      {editingStudentId && activeStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  แบบบันทึกสุขภาพรายบุคคล
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">
                  เลขที่ {activeStudent.studentNumber} • {activeStudent.title}{activeStudent.firstName} {activeStudent.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  รหัส {activeStudent.studentCode} • {activeStudent.gender === 'male' ? 'เพศชาย' : 'เพศหญิง'} • {classroom.name}
                </p>
              </div>
              <button
                onClick={() => setEditingStudentId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Section 1: เหา */}
              <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                    <span>🪮</span> สถานะการเป็นเหา
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTempHealth({ ...tempHealth, hasLice: false, liceSeverity: 'none' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        !tempHealth.hasLice
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      ✓ ไม่เป็นเหา
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempHealth({ ...tempHealth, hasLice: true, liceSeverity: tempHealth.liceSeverity || 'moderate' })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        tempHealth.hasLice
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      เป็นเหา
                    </button>
                  </div>
                </div>

                {tempHealth.hasLice && (
                  <div className="pt-2 border-t border-rose-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-800 font-medium">ระดับความรุนแรง:</span>
                      <select
                        value={tempHealth.liceSeverity || 'moderate'}
                        onChange={(e) => setTempHealth({ ...tempHealth, liceSeverity: e.target.value as any })}
                        className="bg-white border border-rose-200 text-rose-900 rounded px-2 py-1 text-xs"
                      >
                        <option value="mild">เล็กน้อย / มีเฉพาะไข่เหา</option>
                        <option value="moderate">ปานกลาง / มีตัวเหา</option>
                        <option value="severe">มาก / เป็นแผลคันศีรษะ</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-rose-900 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(tempHealth.liceTreated)}
                        onChange={(e) => setTempHealth({ ...tempHealth, liceTreated: e.target.checked })}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>ได้รับแจกยาสระกำจัดเหาและคำแนะนำแล้ว</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Section 2: น้ำหนัก / ส่วนสูง / โรคอ้วน */}
              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                    <span>⚖️</span> ภาวะโภชนาการและโรคอ้วน
                  </label>
                  {(() => {
                    const c = calculateBMI(tempHealth.weight, tempHealth.height);
                    return (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${c.badgeColor}`}>
                        {c.statusThai} {c.bmi > 0 ? `(BMI ${c.bmi})` : ''}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      น้ำหนัก (กิโลกรัม)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 32.5"
                      value={tempHealth.weight || ''}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value) || undefined;
                        const calc = calculateBMI(w, tempHealth.height);
                        setTempHealth({
                          ...tempHealth,
                          weight: w,
                          bmi: calc.bmi,
                          nutritionStatus: calc.status,
                          isObese: calc.status === 'obese' || calc.status === 'overweight',
                        });
                      }}
                      className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      ส่วนสูง (เซนติเมตร)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="เช่น 135"
                      value={tempHealth.height || ''}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value) || undefined;
                        const calc = calculateBMI(tempHealth.weight, h);
                        setTempHealth({
                          ...tempHealth,
                          height: h,
                          bmi: calc.bmi,
                          nutritionStatus: calc.status,
                          isObese: calc.status === 'obese' || calc.status === 'overweight',
                        });
                      }}
                      className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-amber-800 bg-amber-100/50 p-2 rounded-md">
                  💡 เกณฑ์อ้างอิง: ค่า BMI &ge; 23 คือเริ่มอ้วน/ท้วม, ค่า BMI &ge; 25 คือมีภาวะโรคอ้วนตามเกณฑ์กรมอนามัย
                </div>
              </div>

              {/* Section 3: ฟันผุ */}
              <div className="bg-sky-50/50 p-3.5 rounded-xl border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-sky-900 flex items-center gap-1.5">
                    <span>🦷</span> สุขภาพฟันและช่องปาก
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTempHealth({ ...tempHealth, hasCavities: false, cavityCount: 0 })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        !tempHealth.hasCavities
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      ✓ ฟันดี (ไม่ผุ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempHealth({ ...tempHealth, hasCavities: true, cavityCount: tempHealth.cavityCount || 1 })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        tempHealth.hasCavities
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      มีฟันผุ
                    </button>
                  </div>
                </div>

                {tempHealth.hasCavities && (
                  <div className="pt-2 border-t border-sky-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-800 font-medium">จำนวนซี่ที่ผุ:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTempHealth({ ...tempHealth, cavityCount: Math.max(1, (tempHealth.cavityCount || 1) - 1) })}
                          className="w-6 h-6 rounded bg-sky-200 hover:bg-sky-300 text-sky-900 font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm w-6 text-center text-sky-950">
                          {tempHealth.cavityCount || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTempHealth({ ...tempHealth, cavityCount: (tempHealth.cavityCount || 1) + 1 })}
                          className="w-6 h-6 rounded bg-sky-200 hover:bg-sky-300 text-sky-900 font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <span className="text-slate-500">ซี่</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-sky-900 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(tempHealth.cavityTreated)}
                        onChange={(e) => setTempHealth({ ...tempHealth, cavityTreated: e.target.checked })}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span>ได้รับการอุดฟัน / ถอน / ทันตกรรม รพ.สต. แล้ว</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Section 4: บันทึกเพิ่มเติม */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  หมายเหตุสุขภาพ / แผนการดูแลช่วยเหลือ
                </label>
                <textarea
                  rows={2}
                  value={tempHealth.healthNote || tempHealth.treatmentPlan || ''}
                  onChange={(e) => setTempHealth({ ...tempHealth, healthNote: e.target.value, treatmentPlan: e.target.value })}
                  placeholder="เช่น ส่งต่อ รพ.สต., แจกยาเหาครั้งที่ 1, แนะนำให้วิ่งออกกำลังกายตอนเช้า..."
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-teal-600 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-2xs"
              >
                บันทึกข้อมูลสุขภาพ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
