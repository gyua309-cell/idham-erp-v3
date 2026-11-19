function normalizeArabicText(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/[()\[\]{}\-_\/\\.,:;+*="']/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function matchArabicSearch(target, query) {
  if (!query) return true;
  const normTarget = normalizeArabicText(target);
  const normQuery = normalizeArabicText(query);
  if (normTarget.includes(normQuery)) return true;

  // Split query into keywords
  const tokens = normQuery.split(' ').filter(Boolean);
  return tokens.every(token => {
    if (normTarget.includes(token)) return true;
    // Strip leading "ال"
    if (token.startsWith('ال') && token.length > 3) {
      const stripped = token.slice(2);
      if (normTarget.includes(stripped)) return true;
    }
    return false;
  });
}

const customerName = 'مؤسسة عماد ابراهيم الفت حلواني لتقديم الوجبات';
console.log('Match الفت:', matchArabicSearch(customerName, 'الفت'));
console.log('Match حلوانى:', matchArabicSearch(customerName, 'حلوانى'));
console.log('Match الحلوانى:', matchArabicSearch(customerName, 'الحلوانى'));
console.log('Match الفت الحلوانى:', matchArabicSearch(customerName, 'الفت الحلوانى'));
console.log('Match ألفت الحلواني:', matchArabicSearch(customerName, 'ألفت الحلواني'));
console.log('Match مطعم:', matchArabicSearch(customerName, 'مطعم'));
