function getPeriodDateBounds(periodKey, customFrom = '', customTo = '') {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  
  const arMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const curMonthName = arMonths[now.getMonth()];
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthName = arMonths[prevMonthDate.getMonth()];

  if (periodKey === 'currentMonth') {
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { from, to: todayStr, label: `مسحوبات الشهر الحالي (${curMonthName})`, shortLabel: `الشهر الحالي (${curMonthName})` };
  }
  if (periodKey === 'lastMonth') {
    const from = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
    const to = `${lastDayPrev.getFullYear()}-${String(lastDayPrev.getMonth() + 1).padStart(2, '0')}-${String(lastDayPrev.getDate()).padStart(2, '0')}`;
    return { from, to, label: `مسحوبات الشهر السابق (${prevMonthName})`, shortLabel: `الشهر السابق (${prevMonthName})` };
  }
  if (periodKey === 'allTime') {
    return { from: '2000-01-01', to: '9999-12-31', label: 'إجمالي المسحوبات (كامل الفترة)', shortLabel: 'كامل الفترة' };
  }
  if (periodKey === 'custom' && customFrom) {
    return { from: customFrom, to: customTo || todayStr, label: `مسحوبات الفترة (${customFrom} إلى ${customTo || todayStr})`, shortLabel: 'فترة مخصصة' };
  }
  // Default: last 30 days
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { from: thirtyDaysAgoStr, to: todayStr, label: 'مسحوبات الشهر (آخر ٣٠ يوماً)', shortLabel: 'آخر ٣٠ يوماً' };
}

console.log('last30:', getPeriodDateBounds('last30'));
console.log('currentMonth:', getPeriodDateBounds('currentMonth'));
console.log('lastMonth:', getPeriodDateBounds('lastMonth'));
console.log('allTime:', getPeriodDateBounds('allTime'));
