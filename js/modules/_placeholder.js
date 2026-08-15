// ============================================================
// Placeholder modules — will show a "Coming Soon" card
// Each module exports a render() function
// ============================================================

function comingSoon(title, icon = "🔧") {
  return async function render(container, user) {
    container.innerHTML = `
      <div class="page-content">
        <div class="page-header"><h1 class="page-title">${title}</h1></div>
        <div class="card" style="padding:60px;text-align:center;">
          <div style="font-size:56px;margin-bottom:16px;">${icon}</div>
          <h3 style="font-family:var(--font-heading);font-size:18px;color:var(--text-1);margin-bottom:8px;">${title}</h3>
          <p style="color:var(--text-2);font-size:13px;">هذه الوحدة قيد الإنشاء وستكون متاحة قريباً</p>
        </div>
      </div>`;
  };
}

// Export all placeholder modules
export { comingSoon };
