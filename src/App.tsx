import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Classroom, AttendanceRecord, AttendanceStatus, LeaveType, ActiveTab } from './types';
import { 
  loadClassrooms, 
  saveClassrooms, 
  loadAttendanceRecords, 
  saveAttendanceRecords, 
  loadLastClassroomId, 
  saveLastClassroomId,
  exportBackupJSON,
  resetAllDataToDefault
} from './utils/storage';
import { getTodayDateString, DEFAULT_PERIODS, formatThaiDateFull } from './utils/thaiDate';
import { Header } from './components/Header';
import { AttendanceSheet } from './components/AttendanceSheet';
import { HealthManager } from './components/HealthManager';
import { StatisticsReport } from './components/StatisticsReport';
import { StudentManager } from './components/StudentManager';
import { AttendanceHistory } from './components/AttendanceHistory';
import { ClassroomManagerModal } from './components/ClassroomManagerModal';
import { QuickRandomPickerModal } from './components/QuickRandomPickerModal';
import { CheckSquare, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => loadClassrooms());
  const [records, setRecords] = useState<AttendanceRecord[]>(() => loadAttendanceRecords());
  const [activeClassroomId, setActiveClassroomId] = useState<string>(() =>
    loadLastClassroomId(loadClassrooms())
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [selectedPeriod, setSelectedPeriod] = useState<string>(DEFAULT_PERIODS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('attendance');

  // Modals
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);

  // Sync to local storage whenever classrooms or records change
  useEffect(() => {
    saveClassrooms(classrooms);
  }, [classrooms]);

  useEffect(() => {
    saveAttendanceRecords(records);
  }, [records]);

  useEffect(() => {
    saveLastClassroomId(activeClassroomId);
  }, [activeClassroomId]);

  // Active classroom object
  const activeClassroom = useMemo(() => {
    return classrooms.find((c) => c.id === activeClassroomId) || classrooms[0] || null;
  }, [classrooms, activeClassroomId]);

  // Active Attendance Record for (activeClassroomId + selectedDate + selectedPeriod)
  const currentRecord = useMemo(() => {
    if (!activeClassroom) return null;

    const existing = records.find(
      (r) =>
        r.classroomId === activeClassroom.id &&
        r.date === selectedDate &&
        r.period === selectedPeriod
    );

    if (existing) return existing;

    // Return virtual / draft record
    const draft: AttendanceRecord = {
      id: `rec-${activeClassroom.id}-${selectedDate}-${selectedPeriod.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}`,
      classroomId: activeClassroom.id,
      date: selectedDate,
      period: selectedPeriod,
      recordedAt: new Date().toISOString(),
      entries: {},
    };
    return draft;
  }, [activeClassroom, records, selectedDate, selectedPeriod]);

  // Helper to upsert a record into state
  const upsertRecord = useCallback((updatedRecord: AttendanceRecord) => {
    setRecords((prev) => {
      const idx = prev.findIndex(
        (r) =>
          r.classroomId === updatedRecord.classroomId &&
          r.date === updatedRecord.date &&
          r.period === updatedRecord.period
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedRecord;
        return next;
      }
      return [...prev, updatedRecord];
    });
  }, []);

  // Update Single Student Entry
  const handleUpdateEntry = (
    studentId: string,
    status: AttendanceStatus,
    note?: string,
    leaveType?: LeaveType
  ) => {
    if (!currentRecord) return;

    const currentEntry = currentRecord.entries[studentId];
    const newEntry = {
      status,
      note: note !== undefined ? note : currentEntry?.note,
      leaveType: leaveType !== undefined ? leaveType : currentEntry?.leaveType,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      entries: {
        ...currentRecord.entries,
        [studentId]: newEntry,
      },
      recordedAt: new Date().toISOString(),
    };

    upsertRecord(updatedRecord);
  };

  // Mark All Students Present
  const handleMarkAllPresent = () => {
    if (!activeClassroom || !currentRecord) return;

    const newEntries = { ...currentRecord.entries };
    activeClassroom.students.forEach((s) => {
      newEntries[s.id] = {
        ...newEntries[s.id],
        status: 'present',
        updatedAt: new Date().toISOString(),
      };
    });

    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      entries: newEntries,
      recordedAt: new Date().toISOString(),
    };

    upsertRecord(updatedRecord);
  };

  // Reset all for current session
  const handleResetAll = () => {
    if (!currentRecord) return;
    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      entries: {},
      generalNote: '',
      recordedAt: new Date().toISOString(),
    };
    upsertRecord(updatedRecord);
  };

  // General Daily Note
  const handleUpdateGeneralNote = (note: string) => {
    if (!currentRecord) return;
    const updatedRecord: AttendanceRecord = {
      ...currentRecord,
      generalNote: note,
      recordedAt: new Date().toISOString(),
    };
    upsertRecord(updatedRecord);
  };

  // Switch Classroom
  const handleSelectClassroom = (id: string) => {
    setActiveClassroomId(id);
  };

  // Save / Add Classroom
  const handleSaveClassroom = (updatedOrNew: Classroom) => {
    setClassrooms((prev) => {
      const exists = prev.some((c) => c.id === updatedOrNew.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedOrNew.id ? updatedOrNew : c));
      }
      return [...prev, updatedOrNew];
    });
    setActiveClassroomId(updatedOrNew.id);
  };

  // Delete Classroom
  const handleDeleteClassroom = (id: string) => {
    setClassrooms((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeClassroomId === id && filtered.length > 0) {
        setActiveClassroomId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Jump from history to attendance sheet
  const handleSelectRecordDate = (date: string, period: string) => {
    setSelectedDate(date);
    setSelectedPeriod(period);
    setActiveTab('attendance');
  };

  // Delete an attendance session
  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Export Backup
  const handleExportBackup = () => {
    exportBackupJSON(classrooms, records);
  };

  // Reset to initial demo data
  const handleResetDemo = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const reset = resetAllDataToDefault();
      setClassrooms(reset.classrooms);
      setRecords(reset.records);
      setActiveClassroomId(reset.classrooms[0].id);
      setSelectedDate(getTodayDateString());
      setSelectedPeriod(DEFAULT_PERIODS[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header with Classroom & Date Switcher */}
      <Header
        classrooms={classrooms}
        activeClassroom={activeClassroom}
        onSelectClassroom={handleSelectClassroom}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenClassroomManager={() => setIsClassroomModalOpen(true)}
        onOpenRandomPicker={() => setIsRandomPickerOpen(true)}
        onExportBackup={handleExportBackup}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!activeClassroom ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <h3 className="text-lg font-bold text-slate-800">ยังไม่มีห้องเรียนในระบบ</h3>
            <button
              onClick={() => setIsClassroomModalOpen(true)}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
            >
              เพิ่มห้องเรียนใหม่
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'attendance' && currentRecord && (
              <AttendanceSheet
                classroom={activeClassroom}
                record={currentRecord}
                onUpdateEntry={handleUpdateEntry}
                onMarkAllPresent={handleMarkAllPresent}
                onResetAll={handleResetAll}
                onUpdateGeneralNote={handleUpdateGeneralNote}
                onOpenRandomPicker={() => setIsRandomPickerOpen(true)}
              />
            )}

            {activeTab === 'health' && (
              <HealthManager
                classroom={activeClassroom}
                onUpdateClassroom={handleSaveClassroom}
              />
            )}

            {activeTab === 'report' && (
              <StatisticsReport
                classroom={activeClassroom}
                records={records}
              />
            )}

            {activeTab === 'students' && (
              <StudentManager
                classroom={activeClassroom}
                onUpdateClassroom={handleSaveClassroom}
              />
            )}

            {activeTab === 'history' && (
              <AttendanceHistory
                classroom={activeClassroom}
                records={records}
                onSelectRecordDate={handleSelectRecordDate}
                onDeleteRecord={handleDeleteRecord}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-900/10 py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              ระบบเช็คชื่อนักเรียน รร.ตชด. • สังกัด กองกำกับการตำรวจตระเวนชายแดนที่ 31 (ค่ายเจ้าพระยาจักรี จ.พิษณุโลก)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetDemo}
              className="text-slate-400 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
              title="รีเซ็ตกลับเป็นข้อมูลตัวอย่างตั้งต้นของ รร.ตชด.31"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ตข้อมูลตัวอย่าง รร.ตชด.31
            </button>
          </div>
        </div>
      </footer>

      {/* Classroom Manager Modal */}
      <ClassroomManagerModal
        isOpen={isClassroomModalOpen}
        onClose={() => setIsClassroomModalOpen(false)}
        classrooms={classrooms}
        activeClassroomId={activeClassroomId}
        onSelectClassroom={handleSelectClassroom}
        onSaveClassroom={handleSaveClassroom}
        onDeleteClassroom={handleDeleteClassroom}
      />

      {/* Quick Random Picker Modal */}
      {activeClassroom && currentRecord && (
        <QuickRandomPickerModal
          isOpen={isRandomPickerOpen}
          onClose={() => setIsRandomPickerOpen(false)}
          students={activeClassroom.students}
          record={currentRecord}
        />
      )}
    </div>
  );
}
