import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import { Sparkles, X, Shuffle, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickRandomPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  record: AttendanceRecord;
}

export const QuickRandomPickerModal: React.FC<QuickRandomPickerModalProps> = ({
  isOpen,
  onClose,
  students,
  record,
}) => {
  const [onlyPresent, setOnlyPresent] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [displayStudent, setDisplayStudent] = useState<Student | null>(null);

  // Eligible pool
  const eligibleStudents = students.filter((s) => {
    if (!onlyPresent) return true;
    const entry = record.entries[s.id];
    return entry?.status === 'present';
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedStudent(null);
      setDisplayStudent(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPick = () => {
    if (eligibleStudents.length === 0) {
      alert('ไม่มีนักเรียนในรายชื่อที่ตรงตามเงื่อนไข (ลองเปลี่ยนเป็น "นักเรียนทั้งหมด")');
      return;
    }

    setIsSpinning(true);
    setSelectedStudent(null);

    let counter = 0;
    const totalTicks = 25;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
      setDisplayStudent(eligibleStudents[randomIndex]);
      counter++;

      if (counter >= totalTicks) {
        clearInterval(interval);
        const finalWinner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
        setSelectedStudent(finalWinner);
        setDisplayStudent(finalWinner);
        setIsSpinning(false);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-800">สุ่มเรียกตอบคำถาม / ตรวจงาน</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="my-4 flex items-center justify-center gap-2 text-xs">
          <button
            onClick={() => setOnlyPresent(true)}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              onlyPresent
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            เฉพาะคนที่ &quot;มาเรียน&quot; ({eligibleStudents.length} คน)
          </button>
          <button
            onClick={() => setOnlyPresent(false)}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer ${
              !onlyPresent
                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            ทุกคนในห้อง ({students.length} คน)
          </button>
        </div>

        {/* Display Area */}
        <div className="my-6 min-h-[170px] bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center p-6 transition-all">
          {displayStudent ? (
            <div className={`transition-transform duration-100 ${isSpinning ? 'scale-105 opacity-80' : 'scale-100'}`}>
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-700 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-200 mb-2">
                {displayStudent.studentNumber}
              </div>
              <h4 className="text-xl font-bold text-slate-900">
                {displayStudent.title}{displayStudent.firstName} {displayStudent.lastName}
              </h4>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                รหัส: {displayStudent.studentCode} • เลขที่ {displayStudent.studentNumber}
              </p>
              {selectedStudent && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full animate-bounce border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ผู้โชคดีรอบนี้!
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 space-y-2">
              <Shuffle className="w-10 h-10 mx-auto text-emerald-400" />
              <p className="text-sm font-medium">กดปุ่มด้านล่างเพื่อเริ่มสุ่มรายชื่อ</p>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleStartPick}
          disabled={isSpinning || eligibleStudents.length === 0}
          className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 active:scale-98 rounded-xl shadow-md shadow-emerald-900/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          {isSpinning ? 'กำลังสุ่ม...' : selectedStudent ? 'สุ่มคนต่อไป' : 'เริ่มสุ่มนักเรียน'}
        </button>
      </div>
    </div>
  );
};
