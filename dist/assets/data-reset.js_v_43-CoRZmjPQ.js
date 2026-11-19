async function e(t){t.innerHTML=`
    <div class="page-content" style="max-width:640px; margin:40px auto; text-align:center;">
      <div class="card" style="padding:40px 30px; border-radius:18px; border:1px solid var(--border-soft); box-shadow:0 8px 30px rgba(0,0,0,0.06);">
        <div style="font-size:52px; margin-bottom:16px;">🛡️</div>
        <h2 style="font-size:22px; font-weight:900; color:var(--text-1); margin-bottom:12px; font-family:var(--font-heading);">
          ميزة تصفير البيانات معطلة ومحمية
        </h2>
        <p style="font-size:14px; color:var(--text-2); line-height:1.9; margin-bottom:28px;">
          بقرار من إدارة النظام وحرصاً على سلامة الحسابات، تم تعطيل خاصية الحذف الشامل أو تصفير البيانات بصورة نهائية منعاً لأي خطأ غير مقصود.<br />
          جميع القيود والفواتير وأرصدة المخزون مؤمنة ومحفوظة بالكامل.
        </p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <button class="btn btn-primary" onclick="navigate('dashboard')" style="padding:10px 24px; font-weight:700;">
            🏠 العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    </div>
  `}export{e as render};
