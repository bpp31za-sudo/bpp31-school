import { Classroom, AttendanceRecord } from '../types';
import { INITIAL_CLASSROOMS, INITIAL_ATTENDANCE_RECORDS } from '../data/initialData';

const STORAGE_KEY_CLASSES = 'bpp31_classes_v2';
const STORAGE_KEY_RECORDS = 'bpp31_records_v2';
const STORAGE_KEY_LAST_CLASS = 'bpp31_last_class_v2';

export function loadClassrooms(): Classroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!raw) {
      saveClassrooms(INITIAL_CLASSROOMS);
      return INITIAL_CLASSROOMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Gracefully ensure every student has a valid health object
      const migrated: Classroom[] = parsed.map((c: Classroom) => {
        // Find matching initial classroom if exists to borrow initial health info if missing
        const initialClass = INITIAL_CLASSROOMS.find((ic) => ic.id === c.id);
        const students = c.students.map((s) => {
          if (s.health) return s;
          const initialStudent = initialClass?.students.find((is) => is.id === s.id);
          if (initialStudent?.health) {
            return { ...s, health: { ...initialStudent.health } };
          }
          return {
            ...s,
            health: {
              hasLice: false,
              isObese: false,
              hasCavities: false,
              weight: s.gender === 'male' ? 32 : 30,
              height: s.gender === 'male' ? 135 : 133,
              bmi: 17.5,
              nutritionStatus: 'normal' as const,
              cavityCount: 0,
              lastCheckedDate: new Date().toISOString().slice(0, 10),
            },
          };
        });
        return { ...c, students };
      });
      return migrated;
    }
    return INITIAL_CLASSROOMS;
  } catch (err) {
    console.error('Error loading classrooms from localStorage:', err);
    return INITIAL_CLASSROOMS;
  }
}

export function saveClassrooms(classes: Classroom[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  } catch (err) {
    console.error('Error saving classrooms to localStorage:', err);
  }
}

export function loadAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) {
      saveAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
      return INITIAL_ATTENDANCE_RECORDS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ATTENDANCE_RECORDS;
  } catch (err) {
    console.error('Error loading attendance records from localStorage:', err);
    return INITIAL_ATTENDANCE_RECORDS;
  }
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving attendance records to localStorage:', err);
  }
}

export function loadLastClassroomId(classrooms: Classroom[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAST_CLASS);
    if (saved && classrooms.some(c => c.id === saved)) {
      return saved;
    }
  } catch (e) {
    // fallback
  }
  return classrooms[0]?.id || '';
}

export function saveLastClassroomId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_CLASS, id);
  } catch (e) {
    // ignore
  }
}

export function resetAllDataToDefault(): { classrooms: Classroom[]; records: AttendanceRecord[] } {
  saveClassrooms(INITIAL_CLASSROOMS);
  saveAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
  saveLastClassroomId(INITIAL_CLASSROOMS[0].id);
  return { classrooms: INITIAL_CLASSROOMS, records: INITIAL_ATTENDANCE_RECORDS };
}

/**
 * Export data to CSV with UTF-8 BOM so Microsoft Excel and Google Sheets open Thai text cleanly
 */
export function exportToCSV(filename: string, rows: string[][]): void {
  const csvContent = '\uFEFF' + rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Backup all data as JSON
 */
export function exportBackupJSON(classrooms: Classroom[], records: AttendanceRecord[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    classrooms,
    records,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `bpp31-attendance-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
