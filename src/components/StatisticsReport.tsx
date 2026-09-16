import React, { useState, useMemo } from 'react';
import { Classroom, AttendanceRecord } from '../types';
import { formatThaiDateShort, formatThaiDateFull } from '../utils/thaiDate';
import { exportToCSV } from '../utils/storage';
import { computeHealthStats, calculateBMI } from '../utils/health';
import { BppEmblem } from './BppEmblem';
import { 
  BarChart2, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  TrendingUp, 
  Calendar,
  Award,
  Users,
  School,
  Shield,
  FileCheck,
  Activity,
  Heart
} from 'lucide-react';

interface StatisticsReportProps {
  classroom: Classroom;
  records: AttendanceRecord[];
}

export const StatisticsReport: React.FC<StatisticsReportProps> = ({
  classroom,
  records,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskOnly, setRiskOnly] = useState(false);

  // Filter records belonging to this classroom, sorted by date ascending
  const classRecords = useMemo(() => {
    return records
      .filter((r) => r.classroomId === classroom.id)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [records, classroom.id]);

  const totalSessions = classRecords.length;

  // Calculate per-student cumulative stats
  const studentStats = useMemo(() => {
    return classroom.students.map((student) => {
      let presentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      let absentCount = 0;
      let unrecordedCount = 0;

      classRecords.forEach((rec) => {
        const entry = rec.entries[student.id];
        if (!entry || !entry.status) {
          unrecordedCount++;
        } else if (entry.status === 'present') {
          presentCount++;
        } else if (entry.status === 'late') {
          lateCount++;
        } else if (entry.status === 'leave') {
          leaveCount++;
        } else if (entry.status === 'absent') {
          absentCount++;
        }
      });

      // Total attended sessions = present + late
      const attended = presentCount + lateCount;
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 100;
      // Below 80% is warning threshold in Thai schools
      const isAtRisk = totalSessions >= 3 && rate < 80;

      return {
        student,
        presentCount,
        lateCount,
        leaveCount,
        absentCount,
        unrecordedCount,
        attended,
        rate,
        isAtRisk,
      };
    });
  }, [classroom.students, classRecords, totalSessions]);

  // Overall classroom rate
  const classroomOverallRate = useMemo(() => {
    if (studentStats.length === 0 || totalSessions === 0) return 100;
    const sum = studentStats.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / studentStats.length);
  }, [studentStats, totalSessions]);

  // At-risk students count
  const atRiskStudents = useMemo(() => {
    return studentStats.filter((s) => s.isAtRisk);
  }, [studentStats]);

  // Classroom Health Stats (เหา, อ้วน, ฟันผุ)
  const healthStats = useMemo(() => {
    return computeHealthStats(classroom.students);
  }, [classroom.students]);

  // Filtered student list
  const displayStudents = useMemo(() => {
    return studentStats.filter(({ student, isAtRisk }) => {
      if (riskOnly && !isAtRisk) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${student.title}${student.firstName} ${student.lastName}`.toLowerCase();
        return (
          student.studentNumber.toString() === query ||
          student.studentCode.toLowerCase().includes(query) ||
          fullName.includes(query)
        );
      }
      return true;
    });
  }, [studentStats, searchQuery, riskOnly]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (totalSessions === 0 && classroom.students.length === 0) {
      alert('ยังไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'เลขที่',
      'รหัสนักเรียน',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'เพศ',
      ...classRecords.map((r) => `${r.date} (${r.period})`),
      'มา (ครั้ง)',
      'สาย (ครั้ง)',
      'ลา (ครั้ง)',
      'ขาด (ครั้ง)',
      'รวมมาเรียน (ครั้ง)',
      'อัตราการเข้าเรียน (%)',
      'สถานะเวลาเรียน',
      'สถานะเหา',
      'ภาวะโภชนาการ (BMI)',
      'ฟันผุ (ซี่)',
      'โรงเรียน',
      'สังกัด',
    ];

    const rows = studentStats.map(({ student, presentCount, lateCount, leaveCount, absentCount, attended, rate, isAtRisk }) => {
      const dateColumns = classRecords.map((rec) => {
        const status = rec.entries[student.id]?.status;
        if (status === 'present') return 'มา';
        if (status === 'late') return 'สาย';
        if (status === 'leave') return 'ลา';
        if (status === 'absent') return 'ขาด';
        return '-';
      });

      const h = student.health;
      const bmiCalc = calculateBMI(h?.weight, h?.height);
      const liceStr = h?.hasLice ? `เป็นเหา${h.liceTreated ? ' (รับยาแล้ว)' : ''}` : 'ปกติ';
      const bmiStr = bmiCalc.bmi > 0 ? `${bmiCalc.statusThai} (BMI ${bmiCalc.bmi})` : '-';
      const cavityStr = h?.hasCavities ? `ผุ ${h.cavityCount || 1} ซี่${h.cavityTreated ? ' (รักษาแล้ว)' : ''}` : 'ฟันดี';

      return [
        student.studentNumber.toString(),
        student.studentCode,
        student.title,
        student.firstName,
        student.lastName,
        student.gender === 'male' ? 'ชาย' : 'หญิง',
        ...dateColumns,
        presentCount.toString(),
        lateCount.toString(),
        leaveCount.toString(),
        absentCount.toString(),
        attended.toString(),
        `${rate}%`,
        isAtRisk ? 'เสี่ยงเวลาเรียนไม่พอ (<80%)' : 'ปกติ (ผ่านเกณฑ์)',
        liceStr,
        bmiStr,
        cavityStr,
        classroom.schoolName || 'รร.ตชด.',
        classroom.affiliation || 'กองกำกับการตำรวจตระเวนชายแดนที่ 31',
      ];
    });

    const safeSchool = (classroom.schoolName || 'รร_ตชด').replace(/[\s\.]+/g, '_');
    const safeClass = classroom.name.replace(/[\s\.]+/g, '_');
    exportToCSV(`รายงานเช็คชื่อและสุขภาพ_${safeSchool}_${safeClass}_${new Date().toISOString().slice(0, 10)}`, [headers, ...rows]);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Official Report Header for Print and Screen */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4 text-left">
            <BppEmblem size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  แบบรายงานสถิติเวลาเรียน
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  สังกัด กก.ตชด.31 (ค่ายเจ้าพระยาจักรี)
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {classroom.schoolName || 'โรงเรียนตำรวจตระเวนชายแดน'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                ระดับชั้น: <span className="font-semibold text-slate-800">{classroom.name}</span> • 
                ภาคเรียนที่: <span className="font-semibold text-slate-800">{classroom.semester}/{classroom.academicYear}</span> • 
                ครูประจำชั้น: <span className="font-semibold text-slate-800">{classroom.teacherName || 'ครู ตชด.'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end print:hidden">
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              title="พิมพ์รายงานสรุป (Print / บันทึก PDF)"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              พิมพ์รายงาน / PDF
            </button>

            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition cursor-pointer"
              title="ส่งออกไฟล์ Excel (.csv)"
            >
              <Download className="w-4 h-4" />
              ส่งออก Excel (CSV)
            </button>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
            <span className="text-xs text-slate-500">นักเรียนในชั้น</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{classroom.students.length} คน</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
            <span className="text-xs text-slate-500">จำนวนครั้งที่เช็ค</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{totalSessions} ครั้ง</p>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/60 text-center">
            <span className="text-xs text-emerald-800">อัตราเข้าเรียนเฉลี่ย</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{classroomOverallRate}%</p>
          </div>
          <div className={`p-3 rounded-lg border text-center ${atRiskStudents.length > 0 ? 'bg-rose-50/70 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
            <span className="text-xs">เสี่ยงเวลาเรียนไม่พอ</span>
            <p className={`text-xl font-bold mt-0.5 ${atRiskStudents.length > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
              {atRiskStudents.length} คน
            </p>
          </div>
        </div>

        {/* Integrated BPP Health Highlights: เหา • อ้วน • ฟันผุ */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              สรุปสถิติด้านสุขอนามัยนักเรียน (เหา • อ้วน • ฟันผุ) — โครงการ กพด.
            </span>
            <span className="text-[11px] text-slate-400">
              ข้อมูลปัจจุบัน
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* เหา */}
            <div className="bg-rose-50/60 border border-rose-200/80 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-900 flex items-center gap-1">
                  <span>🪮</span> เป็นเหา
                </span>
                <p className="text-base font-bold text-rose-700 mt-0.5">
                  {healthStats.liceCount} คน <span className="text-xs font-normal text-rose-600">({healthStats.licePercentage}%)</span>
                </p>
              </div>
              <span className="text-[10px] text-rose-800 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200">
                ญ {healthStats.liceFemale} / ช {healthStats.liceMale}
              </span>
            </div>

            {/* อ้วน */}
            <div className="bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                  <span>⚖️</span> อ้วน/เกินเกณฑ์
                </span>
                <p className="text-base font-bold text-amber-700 mt-0.5">
                  {healthStats.obeseCount} คน <span className="text-xs font-normal text-amber-600">({healthStats.obesePercentage}%)</span>
                </p>
              </div>
              <span className="text-[10px] text-amber-800 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                BMI {healthStats.averageBmi > 0 ? healthStats.averageBmi : '-'}
              </span>
            </div>

            {/* ฟันผุ */}
            <div className="bg-sky-50/60 border border-sky-200/80 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-sky-900 flex items-center gap-1">
                  <span>🦷</span> มีฟันผุ
                </span>
                <p className="text-base font-bold text-sky-700 mt-0.5">
                  {healthStats.cavityStudentCount} คน <span className="text-xs font-normal text-sky-600">({healthStats.cavityPercentage}%)</span>
                </p>
              </div>
              <span className="text-[10px] text-sky-800 bg-white/80 px-1.5 py-0.5 rounded border border-sky-200">
                รวม {healthStats.cavityTotalTeeth} ซี่
              </span>
            </div>

            {/* สุขภาพสมบูรณ์ */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 p-2.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                  <span>🌟</span> สุขภาพสมบูรณ์
                </span>
                <p className="text-base font-bold text-emerald-700 mt-0.5">
                  {healthStats.perfectHealthCount} คน <span className="text-xs font-normal text-emerald-600">({healthStats.perfectHealthPercentage}%)</span>
                </p>
              </div>
              <span className="text-[10px] text-emerald-800 bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200">
                ครบ 3 ด้าน
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, สกุล หรือเลขที่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* At-risk filter toggle */}
          <button
            onClick={() => setRiskOnly(!riskOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              riskOnly
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            ดูเฉพาะเสี่ยง มส. (&lt;80%) ({atRiskStudents.length})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          แสดงข้อมูล {displayStudents.length} จาก {classroom.students.length} คน
        </span>
      </div>

      {/* Main Cumulative Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              ตารางสรุปสถิติการเข้าเรียนรายบุคคล
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {classroom.schoolName} • ชั้น {classroom.name} • เกณฑ์เวลาเรียนขั้นต่ำ 80%
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
            เกณฑ์ผ่าน: เวลาเรียน &ge; 80%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 w-14 text-center">เลขที่</th>
                <th className="py-3 px-3 w-20">รหัส</th>
                <th className="py-3 px-4 min-w-[180px]">ชื่อ - นามสกุล</th>
                <th className="py-3 px-3 text-center text-emerald-700">มา</th>
                <th className="py-3 px-3 text-center text-amber-700">สาย</th>
                <th className="py-3 px-3 text-center text-sky-700">ลา</th>
                <th className="py-3 px-3 text-center text-rose-700">ขาด</th>
                <th className="py-3 px-4 text-center min-w-[130px]">อัตราเข้าเรียน (%)</th>
                <th className="py-3 px-3 text-center min-w-[130px] bg-teal-50/40">สุขภาพ (เหา•อ้วน•ผุ)</th>
                <th className="py-3 px-4 text-center w-28">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayStudents.map(({ student, presentCount, lateCount, leaveCount, absentCount, rate, isAtRisk }) => {
                const h = student.health;
                const isLice = Boolean(h?.hasLice);
                const isObese = Boolean(h?.isObese);
                const hasCavities = Boolean(h?.hasCavities);
                const isClean = !isLice && !isObese && !hasCavities;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center font-bold text-xs text-slate-700">
                      {student.studentNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500">
                      {student.studentCode}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {student.title}{student.firstName} {student.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-emerald-700">
                      {presentCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-amber-700">
                      {lateCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-sky-700">
                      {leaveCount}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-rose-700">
                      {absentCount}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              rate >= 80 ? 'bg-emerald-600' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs w-9 text-right">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center bg-teal-50/20">
                      <div className="flex items-center justify-center gap-1">
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
                              <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md" title="ภาวะอ้วน/เกินเกณฑ์">
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
                    <td className="py-2.5 px-4 text-center">
                      {isAtRisk ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                          <AlertTriangle className="w-3 h-3" />
                          เสี่ยง มส.
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          ผ่านเกณฑ์
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date x Student Matrix View */}
      {totalSessions > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">
              ตารางบันทึกการเข้าเรียนรายวัน (Matrix View)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              🟢 = มา | 🟡 = สาย | 🔵 = ลา | 🔴 = ขาด | ⚪ = ยังไม่เช็ค
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12 text-center sticky left-0 bg-slate-50 z-10">เลขที่</th>
                  <th className="py-2.5 px-3 min-w-[140px] sticky left-12 bg-slate-50 z-10 border-r border-slate-200">
                    ชื่อ - นามสกุล
                  </th>
                  {classRecords.map((rec) => (
                    <th key={rec.id} className="py-2 px-2.5 text-center min-w-[70px]">
                      <div className="text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                        {formatThaiDateShort(rec.date)}
                      </div>
                      <div className="text-[9px] text-slate-400 font-normal truncate max-w-[70px]">
                        {rec.period.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayStudents.map(({ student }) => (
                  <tr key={student.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-center font-bold text-slate-600 sticky left-0 bg-white z-10">
                      {student.studentNumber}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-[150px] sticky left-12 bg-white z-10 border-r border-slate-200">
                      {student.firstName} {student.lastName}
                    </td>
                    {classRecords.map((rec) => {
                      const status = rec.entries[student.id]?.status;
                      return (
                        <td key={rec.id} className="py-2 px-2.5 text-center">
                          {status === 'present' ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-emerald-500 text-white font-bold leading-4 text-[10px]" title="มา">✓</span>
                          ) : status === 'late' ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-amber-500 text-white font-bold leading-4 text-[10px]" title="สาย">ส</span>
                          ) : status === 'leave' ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-sky-500 text-white font-bold leading-4 text-[10px]" title="ลา">ล</span>
                          ) : status === 'absent' ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-rose-500 text-white font-bold leading-4 text-[10px]" title="ขาด">✕</span>
                          ) : (
                            <span className="inline-block w-4 h-4 rounded-full bg-slate-200 text-slate-400 font-bold leading-4 text-[10px]" title="ยังไม่เช็ค">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Signatures Section for Reporting to BPP Division 31 */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 text-center border-b border-slate-100 pb-2">
          การรับรองข้อมูลเพื่อเสนอผู้บังคับบัญชา และงานวิชาการ กก.ตชด.31
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center text-xs text-slate-700">
          {/* Teacher Signature */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">ผู้รายงาน / ครูประจำชั้น (ครู ตชด.)</p>
            <div className="pt-8 pb-1 border-b border-dashed border-slate-400 max-w-[240px] mx-auto"></div>
            <p className="font-medium text-slate-900">({classroom.teacherName || '...................................................'})</p>
            <p className="text-[11px] text-slate-500">ตำแหน่ง ครูผู้สอน {classroom.schoolName || 'รร.ตชด.'}</p>
            <p className="text-[11px] text-slate-400">วันที่ .......... เดือน .................... พ.ศ. ...........</p>
          </div>

          {/* Principal Signature */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">ผู้รับรอง / ครูใหญ่ โรงเรียน ตชด.</p>
            <div className="pt-8 pb-1 border-b border-dashed border-slate-400 max-w-[240px] mx-auto"></div>
            <p className="font-medium text-slate-900">({classroom.principalName || '...................................................'})</p>
            <p className="text-[11px] text-slate-500">ตำแหน่ง ครูใหญ่ {classroom.schoolName || 'รร.ตชด.'}</p>
            <p className="text-[11px] text-slate-400">กองกำกับการตำรวจตระเวนชายแดนที่ 31</p>
          </div>
        </div>
      </div>
    </div>
  );
};
