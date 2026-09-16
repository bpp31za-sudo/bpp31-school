import React from 'react';
import { Classroom, AttendanceRecord } from '../types';
import { formatThaiDateFull } from '../utils/thaiDate';
import { Calendar, Trash2, CheckCircle2, AlertCircle, Clock, FileText, ArrowRight } from 'lucide-react';

interface AttendanceHistoryProps {
  classroom: Classroom;
  records: AttendanceRecord[];
  onSelectRecordDate: (date: string, period: string) => void;
  onDeleteRecord: (id: string) => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  classroom,
  records,
  onSelectRecordDate,
  onDeleteRecord,
}) => {
  const classRecords = records
    .filter((r) => r.classroomId === classroom.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
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
            <Calendar className="w-5 h-5 text-emerald-700" />
            ประวัติการบันทึกเวลาเรียน ({classRecords.length} ครั้ง)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ประวัติการเช็คชื่อทั้งหมดของ {classroom.name}
          </p>
        </div>
      </div>

      {classRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ยังไม่มีประวัติการเช็คชื่อ</h3>
          <p className="text-xs text-slate-500 mt-1">เริ่มเช็คชื่อนักเรียนในแท็บ &quot;บันทึกเช็คชื่อ&quot; ข้อมูลจะถูกบันทึกที่นี่โดยอัตโนมัติ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classRecords.map((record) => {
            let present = 0;
            let late = 0;
            let leave = 0;
            let absent = 0;
            const total = classroom.students.length;

            classroom.students.forEach((s) => {
              const e = record.entries[s.id];
              if (e?.status === 'present') present++;
              else if (e?.status === 'late') late++;
              else if (e?.status === 'leave') leave++;
              else if (e?.status === 'absent') absent++;
            });

            const attended = present + late;
            const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-indigo-300 transition group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {formatThaiDateFull(record.date)}
                    </h3>
                    <p className="text-xs text-indigo-600 font-medium">
                      {record.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700">
                      {rate}% เข้าเรียน
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm('คุณต้องการลบประวัติการเช็คชื่อของรอบนี้หรือไม่?')) {
                          onDeleteRecord(record.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
                      title="ลบบันทึกนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Breakdown Pills */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-center">
                    <span className="block text-xs text-emerald-600">มา</span>
                    <span className="font-bold text-sm">{present}</span>
                  </div>
                  <div className="bg-amber-50 text-amber-800 p-2 rounded-lg text-center">
                    <span className="block text-xs text-amber-600">สาย</span>
                    <span className="font-bold text-sm">{late}</span>
                  </div>
                  <div className="bg-sky-50 text-sky-800 p-2 rounded-lg text-center">
                    <span className="block text-xs text-sky-600">ลา</span>
                    <span className="font-bold text-sm">{leave}</span>
                  </div>
                  <div className="bg-rose-50 text-rose-800 p-2 rounded-lg text-center">
                    <span className="block text-xs text-rose-600">ขาด</span>
                    <span className="font-bold text-sm">{absent}</span>
                  </div>
                </div>

                {/* Note if any */}
                {record.generalNote && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-3 line-clamp-2">
                    💬 {record.generalNote}
                  </p>
                )}

                {/* View / Edit Button */}
                <button
                  onClick={() => onSelectRecordDate(record.date, record.period)}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>เปิดดูและแก้ไขรายการนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
