export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_DAYS_FULL = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

/**
 * Format a YYYY-MM-DD string into Thai Full Date format:
 * e.g., "วันจันทร์ที่ 16 กันยายน พ.ศ. 2567"
 */
export function formatThaiDateFull(dateString: string): string {
  if (!dateString) return '';
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const dateObj = new Date(year, monthIndex, day);
  const dayOfWeek = THAI_DAYS_FULL[dateObj.getDay()] || '';
  const thaiYear = year + 543;
  const thaiMonth = THAI_MONTHS_FULL[monthIndex] || '';

  return `${dayOfWeek}ที่ ${day} ${thaiMonth} พ.ศ. ${thaiYear}`;
}

/**
 * Format date string into Short Thai: e.g. "16 ก.ย. 67"
 */
export function formatThaiDateShort(dateString: string): string {
  if (!dateString) return '';
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const thaiYearShort = ((year + 543) % 100).toString().padStart(2, '0');
  const thaiMonth = THAI_MONTHS_SHORT[monthIndex] || '';

  return `${day} ${thaiMonth} ${thaiYearShort}`;
}

/**
 * Get today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Common school periods in BPP Schools (รร.ตชด. สังกัด กก.ตชด.31)
 */
export const DEFAULT_PERIODS = [
  'เข้าแถวเคารพธงชาติ / กิจกรรมหน้าเสาธง (08:00)',
  'ตรวจสุขอนามัยยามเช้า (โครงการ กพด.)',
  'คาบที่ 1 (08:30 - 09:30)',
  'คาบที่ 2 (09:30 - 10:30)',
  'คาบที่ 3 (10:30 - 11:30)',
  'โครงการเกษตรเพื่ออาหารกลางวัน & แปรงฟัน (11:30 - 12:30)',
  'คาบที่ 4 (12:30 - 13:30)',
  'คาบที่ 5 (13:30 - 14:30)',
  'กิจกรรมพัฒนาผู้เรียน / สหกรณ์นักเรียน / วิชาชีพ (14:30 - 15:30)',
];
