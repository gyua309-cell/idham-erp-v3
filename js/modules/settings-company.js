// ============================================================
// IDHAM ERP — Settings v3.0 — Full Feature Suite
// ============================================================
import { doc, getDoc, setDoc, serverTimestamp, getDocs, collection, query, orderBy } from "../utils/db.js";
import { db, COMPANY_ID } from "../firebase-config.js";
import { getCoaMapping, saveCoaMapping } from "../utils/coa-connector.js";

// ── Helpers ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const val = id => $(id)?.value?.trim() ?? "";

export async function render(container, user) {
  container.innerHTML = `
    <div class="page-content">
      <div class="page-header" style="margin-bottom:24px;">
        <div>
          <h1 class="page-title">⚙️ إعدادات النظام</h1>
          <p class="section-label" style="margin-top:4px;">تخصيص الشركة، المظهر، ZATCA، والنسخ الاحتياطي</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:start;">

        <!-- ── Settings Sidebar Nav ── -->
        <div class="card" style="padding:8px;">
          <nav id="settings-nav">
            ${navItem('company',  '🏢', 'بيانات الشركة',    true)}
            ${navItem('logo',     '🖼️', 'شعار المنشأة')}
            ${navItem('fonts',    '🔤', 'الخطوط والمظهر')}
            ${navItem('zatca',    '⚡', 'إعدادات ZATCA')}
            ${navItem('system',   '🔧', 'إعدادات النظام')}
            ${navItem('pricing',  '🏷️', 'سياسات التسعير والخصم')}
            ${navItem('backup',   '💾', 'النسخ الاحتياطي')}
            ${navItem('coa-mapping', '🔗', 'ربط شجرة الحسابات')}
          </nav>
        </div>

        <!-- ── Settings Content ── -->
        <div id="settings-content">

          <!-- ══ TAB: Company ══ -->
          <div id="tab-company" class="settings-tab">
            <div class="card">
              <div class="card-header"><h3>🏢 بيانات الشركة</h3></div>
              <div class="card-body" style="padding:28px;">
                <div class="grid-2 gap-16 mb-16">
                  <div class="form-group" style="grid-column:span 2;">
                    <label>اسم الشركة *</label>
                    <input type="text" id="co-name" class="input" placeholder="إدهام للمواد الغذائية" />
                  </div>
                  <div class="form-group">
                    <label>رقم السجل التجاري</label>
                    <input type="text" id="co-cr" class="input mono" placeholder="1xxxxxxxxx" />
                  </div>
                  <div class="form-group">
                    <label>رقم ضريبة القيمة المضافة (VAT)</label>
                    <input type="text" id="co-vat" class="input mono" placeholder="300000000000003" maxlength="15" />
                  </div>
                  <div class="form-group">
                    <label>الهاتف</label>
                    <input type="tel" id="co-phone" class="input mono" placeholder="05xxxxxxxx" />
                  </div>
                  <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" id="co-email" class="input" placeholder="info@company.com" />
                  </div>
                </div>
                <div class="form-group mb-16">
                  <label>العنوان</label>
                  <input type="text" id="co-address" class="input" placeholder="الرياض، حي العليا" />
                </div>
                <div class="grid-3 gap-16 mb-16">
                  <div class="form-group">
                    <label>المدينة</label>
                    <input type="text" id="co-city" class="input" />
                  </div>
                  <div class="form-group">
                    <label>الرمز البريدي</label>
                    <input type="text" id="co-zip" class="input mono" />
                  </div>
                  <div class="form-group">
                    <label>الدولة</label>
                    <input type="text" id="co-country" class="input" value="المملكة العربية السعودية" />
                  </div>
                </div>
                <div class="grid-2 gap-16 mb-24">
                  <div class="form-group">
                    <label>العملة</label>
                    <select id="co-currency" class="input">
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EUR">يورو (EUR)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>نسبة ضريبة القيمة المضافة</label>
                    <select id="co-vat-rate" class="input">
                      <option value="15">15%</option>
                      <option value="5">5%</option>
                      <option value="0">0% (معفى)</option>
                    </select>
                  </div>
                </div>
                <div class="grid-2 gap-16 mb-24">
                  <div class="form-group">
                    <label>📁 صورة السجل التجاري (أتمتة الأرشيف)</label>
                    <input type="file" id="co-cr-upload" class="input" accept="image/*,application/pdf" />
                  </div>
                  <div class="form-group">
                    <label>📁 صورة الشهادة الضريبية / البطاقة الضريبية (أتمتة الأرشيف)</label>
                    <input type="file" id="co-tax-upload" class="input" accept="image/*,application/pdf" />
                  </div>
                </div>
                <div id="co-save-msg" class="alert good hidden mb-12">✅ تم حفظ بيانات الشركة بنجاح</div>
                <div id="co-error" class="alert bad hidden mb-12"></div>
                <button class="btn btn-primary" onclick="saveCompanySettings()" id="save-co-btn">💾 حفظ بيانات الشركة</button>
              </div>
            </div>
          </div>

          <!-- ══ TAB: Logo ══ -->
          <div id="tab-logo" class="settings-tab hidden">
            <div class="card">
              <div class="card-header"><h3>🖼️ شعار المنشأة</h3></div>
              <div class="card-body" style="padding:28px;">
                <div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap;">
                  <!-- Upload Area -->
                  <div>
                    <p class="section-label mb-12">الشعار الحالي (يظهر في الفواتير والتقارير)</p>
                    <div id="logo-preview-wrap" style="width:200px;height:140px;border:2px dashed var(--border);border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--bg-2);position:relative;overflow:hidden;cursor:pointer;" onclick="document.getElementById('logo-file-input').click()">
                      <img id="logo-preview-img" src="" alt="شعار الشركة" style="max-width:180px;max-height:120px;object-fit:contain;display:none;" />
                      <div id="logo-empty-msg" style="text-align:center;color:var(--text-muted);">
                        <div style="font-size:36px;margin-bottom:8px;">🖼️</div>
                        <div style="font-size:12px;">اضغط لرفع الشعار</div>
                      </div>
                    </div>
                    <input type="file" id="logo-file-input" accept="image/*" style="display:none;" onchange="handleLogoUpload(event)" />
                    <div style="display:flex;gap:8px;margin-top:12px;">
                      <button class="btn btn-primary" onclick="document.getElementById('logo-file-input').click()">📁 رفع شعار</button>
                      <button class="btn btn-secondary" onclick="removeLogo()" id="remove-logo-btn" style="display:none;">🗑️ حذف</button>
                    </div>
                  </div>
                  <!-- Guidelines -->
                  <div style="flex:1;min-width:240px;">
                    <h4 style="margin-bottom:12px;color:var(--text-0);">إرشادات الشعار</h4>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                      ${guideLine('✅','الصيغ المدعومة: PNG, JPG, SVG, WebP')}
                      ${guideLine('✅','الحجم الموصى به: 400×200 بكسل أو أكبر')}
                      ${guideLine('✅','الخلفية الشفافة (PNG) مثالية للفواتير')}
                      ${guideLine('⚠️','الحجم الأقصى: 2 ميجابايت')}
                      ${guideLine('ℹ️','يُحفظ الشعار في قاعدة البيانات ويظهر في جميع الفواتير والتقارير المطبوعة')}
                    </div>
                    <div id="logo-save-msg" class="alert good hidden mt-16">✅ تم حفظ الشعار بنجاح</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══ TAB: Fonts & Appearance ══ -->
          <div id="tab-fonts" class="settings-tab hidden">
            <div class="card">
              <div class="card-header"><h3>🔤 الخطوط والمظهر</h3></div>
              <div class="card-body" style="padding:28px;">

                <!-- Font Family -->
                <div class="form-group mb-24">
                  <label>خط واجهة النظام</label>
                  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:10px;" id="font-selector">
                    ${fontCard('IBM Plex Sans Arabic','IBM Plex Sans Arabic','أكثر دقة واحترافية',true)}
                    ${fontCard('Tajawal','Tajawal','هادئ وسهل للقراءة')}
                    ${fontCard('Cairo','Cairo','عصري وجريء')}
                    ${fontCard('Almarai','Almarai','دافئ ومتوازن')}
                    ${fontCard('Noto Sans Arabic','Noto Sans Arabic','شامل ومتوافق')}
                  </div>
                </div>

                <!-- Font Size -->
                <div class="form-group mb-24">
                  <label>حجم الخط الأساسي</label>
                  <div style="display:flex;align-items:center;gap:16px;margin-top:10px;">
                    <input type="range" id="font-size-range" min="12" max="18" value="14" step="1"
                      style="flex:1;accent-color:var(--primary);" oninput="updateFontSizeLabel(this.value)" />
                    <span id="font-size-label" style="min-width:50px;font-weight:700;color:var(--primary);font-size:18px;">14px</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px;">
                    <span>صغير (12px)</span><span>متوسط</span><span>كبير (18px)</span>
                  </div>
                </div>

                <!-- Preview -->
                <div style="background:var(--bg-2);border-radius:12px;padding:20px;margin-bottom:24px;">
                  <p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">معاينة مباشرة:</p>
                  <p id="font-preview" style="font-size:16px;line-height:1.8;color:var(--text-1);">
                    نظام إدهام ERP — إدارة متكاملة للمواد الغذائية | إصدار الفاتورة الإلكترونية ZATCA المرحلة الثانية
                  </p>
                </div>

                <!-- ✨ THEME SELECTOR — Full Premium Picker -->
                <div class="form-group mb-24">
                  <label style="font-size:15px;font-weight:700;margin-bottom:4px;">🎨 ثيم النظام الكامل</label>
                  <p class="section-label" style="margin-bottom:16px;">اختر شكل وألوان النظام — يُطبّق فوراً ويُحفظ تلقائياً</p>

                  <!-- Dark Themes Group -->
                  <div style="margin-bottom:20px;">
                    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">🌙 ثيمات داكنة</div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;" id="theme-grid-dark">

                      <div class="sett-theme-card" id="swatch-dark" onclick="applyThemeFromSettings('dark')" data-theme="dark">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#060813 50%,#6366f1 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">🌌</span>
                          <div>
                            <div class="sett-theme-name">Dark Space</div>
                            <div class="sett-theme-sub">بنفسجي داكن</div>
                          </div>
                        </div>
                      </div>

                      <div class="sett-theme-card" id="swatch-dark-cyan" onclick="applyThemeFromSettings('dark-cyan')" data-theme="dark-cyan">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#020c18 50%,#06b6d4 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">🌊</span>
                          <div>
                            <div class="sett-theme-name">Ocean Depth</div>
                            <div class="sett-theme-sub">أزرق مائي</div>
                          </div>
                        </div>
                      </div>

                      <div class="sett-theme-card" id="swatch-dark-gold" onclick="applyThemeFromSettings('dark-gold')" data-theme="dark-gold">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#09090b 50%,#f59e0b 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">✨</span>
                          <div>
                            <div class="sett-theme-name">Premium Gold</div>
                            <div class="sett-theme-sub">ذهبي فاخر</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <!-- Light Themes Group -->
                  <div>
                    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">☀️ ثيمات فاتحة</div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;" id="theme-grid-light">

                      <div class="sett-theme-card" id="swatch-light" onclick="applyThemeFromSettings('light')" data-theme="light">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#eef2f7 50%,#4f46e5 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">☀️</span>
                          <div>
                            <div class="sett-theme-name">Classic Light</div>
                            <div class="sett-theme-sub">بنفسجي فاتح</div>
                          </div>
                        </div>
                      </div>

                      <div class="sett-theme-card" id="swatch-light-blue" onclick="applyThemeFromSettings('light-blue')" data-theme="light-blue">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#eef2ff 50%,#1d4ed8 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">🔵</span>
                          <div>
                            <div class="sett-theme-name">Clear Sky</div>
                            <div class="sett-theme-sub">أزرق سماوي</div>
                          </div>
                        </div>
                      </div>

                      <div class="sett-theme-card" id="swatch-light-green" onclick="applyThemeFromSettings('light-green')" data-theme="light-green">
                        <div class="sett-theme-preview" style="background:linear-gradient(135deg,#f0fdf4 50%,#059669 100%);"></div>
                        <div class="sett-theme-info">
                          <span class="sett-theme-icon">🌿</span>
                          <div>
                            <div class="sett-theme-name">Fresh Emerald</div>
                            <div class="sett-theme-sub">أخضر زمردي</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <button class="btn btn-primary" onclick="saveAppearanceSettings()">💾 حفظ إعدادات المظهر</button>
                <div id="fonts-save-msg" class="alert good hidden mt-12">✅ تم حفظ إعدادات المظهر</div>

              </div>
            </div>
          </div>

          <!-- ══ TAB: ZATCA ══ -->
          <div id="tab-zatca" class="settings-tab hidden">
            <div class="card">
              <div class="card-header"><h3>⚡ إعدادات ZATCA — فاتورة إلكترونية المرحلة 2</h3></div>
              <div class="card-body" style="padding:28px;">
                <div class="alert info mb-16">ℹ️ تأكد من الحصول على شهادة ZATCA (CSID) عبر بوابة فاتورة قبل تفعيل الإرسال التلقائي</div>
                <div class="grid-2 gap-16 mb-16">
                  <div class="form-group">
                    <label>بيئة ZATCA</label>
                    <select id="zatca-env" class="input">
                      <option value="sandbox">Sandbox (تجريبية)</option>
                      <option value="simulation">Simulation</option>
                      <option value="production">Production (إنتاج)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>رقم الجهاز (Device Serial)</label>
                    <input type="text" id="zatca-device" class="input mono" placeholder="EGS1-xxxxx" />
                  </div>
                </div>
                <div class="form-group mb-16">
                  <label>شهادة OTP (للتسجيل الأولي)</label>
                  <input type="password" id="zatca-otp" class="input mono" placeholder="أدخل OTP من بوابة فاتورة" />
                </div>
                <div class="form-group mb-16">
                  <label>CSID (Compliance Certificate)</label>
                  <textarea id="zatca-csid" class="input mono" rows="4" placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"></textarea>
                </div>
                <div class="form-group mb-16">
                  <label>PCSID (Production Certificate)</label>
                  <textarea id="zatca-pcsid" class="input mono" rows="4" placeholder="بعد الإعداد الناجح في Sandbox"></textarea>
                </div>
                <div class="form-group mb-16">
                  <label>المفتاح الخاص (Private Key)</label>
                  <textarea id="zatca-key" class="input mono" rows="3" placeholder="-----BEGIN EC PRIVATE KEY-----&#10;..." style="font-size:10px;"></textarea>
                  <div class="section-label mt-4">⚠️ لا تشارك المفتاح الخاص مع أي أحد</div>
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn btn-secondary" onclick="testZATCAConnection()">🔗 اختبار الاتصال</button>
                  <button class="btn btn-primary" onclick="saveZATCASettings()">💾 حفظ إعدادات ZATCA</button>
                </div>
                <div id="zatca-test-result" class="hidden mt-12"></div>
              </div>
            </div>
          </div>

          <!-- ══ TAB: System ══ -->
          <div id="tab-system" class="settings-tab hidden">
            <div class="card">
              <div class="card-header"><h3>🔧 إعدادات النظام</h3></div>
              <div class="card-body" style="padding:28px;">
                <div class="grid-2 gap-16 mb-16">
                  <div class="form-group">
                    <label>بادئة أرقام فواتير المبيعات</label>
                    <input type="text" id="sys-inv-prefix" class="input mono" value="INV-" />
                  </div>
                  <div class="form-group">
                    <label>بادئة أرقام فواتير الشراء</label>
                    <input type="text" id="sys-pur-prefix" class="input mono" value="PUR-" />
                  </div>
                  <div class="form-group">
                    <label>رقم الفاتورة التسلسلي الحالي</label>
                    <input type="number" id="sys-inv-seq" class="input mono" value="1" min="1" />
                  </div>
                  <div class="form-group">
                    <label>عدد أيام استحقاق الفواتير الافتراضي</label>
                    <input type="number" id="sys-due-days" class="input mono" value="30" min="1" />
                  </div>
                  <div class="form-group">
                    <label>طريقة تقييم المخزون</label>
                    <select id="sys-valuation-method" class="input">
                      <option value="weighted_average">متوسط مرجح (Weighted Average)</option>
                      <option value="fifo">الوارد أولاً يصرف أولاً (FIFO)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>رمز أمان تجاوز المدير (Supervisor PIN) *</label>
                    <input type="text" id="sys-supervisor-pin" class="input mono" value="1234" placeholder="1234" maxlength="10" />
                  </div>
                </div>
                <div class="form-group mb-24">
                  <label>نص الطباعة الافتراضي في أسفل الفاتورة</label>
                  <textarea id="sys-footer" class="input" rows="3" placeholder="شكراً لتعاملكم معنا…"></textarea>
                </div>
                <button class="btn btn-primary" onclick="saveSystemSettings()">💾 حفظ الإعدادات</button>
                <div id="sys-save-msg" class="alert good hidden mt-12">✅ تم حفظ إعدادات النظام</div>
              </div>
            </div>
          </div>

          <!-- ══ TAB: Pricing & Discounts ══ -->
          <div id="tab-pricing" class="settings-tab hidden">
            <div class="card">
              <div class="card-header"><h3>🏷️ سياسات التسعير والخصم التلقائي</h3></div>
              <div class="card-body" style="padding:28px;">
                
                <!-- 1. Category Margins -->
                <h4 class="mb-12" style="color:var(--primary); font-family:var(--font-heading); font-size:14px; font-weight:700;">📈 سياسة تسعير فئات الحركة (هوامش الربح المقترحة)</h4>
                <div class="form-group mb-16" style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="sys-enable-category-margins" style="width:18px; height:18px;" />
                  <label for="sys-enable-category-margins" style="margin-bottom:0; cursor:pointer;">تفعيل الاقتراح التلقائي لأسعار التجزئة بناءً على تكلفة الصنف وهامش ربح الفئة</label>
                </div>
                <div class="grid-3 gap-16 mb-24">
                  <div class="form-group">
                    <label>هامش سلع أساسية عالية الدوران (%)</label>
                    <input type="number" id="sys-margin-fast" class="input mono" min="0" step="0.1" value="5" />
                  </div>
                  <div class="form-group">
                    <label>هامش سلع متوسطة الدوران (%)</label>
                    <input type="number" id="sys-margin-medium" class="input mono" min="0" step="0.1" value="10" />
                  </div>
                  <div class="form-group">
                    <label>هامش سلع منخفضة/متخصصة (%)</label>
                    <input type="number" id="sys-margin-slow" class="input mono" min="0" step="0.1" value="15" />
                  </div>
                </div>

                <!-- 2. Auto Discounts -->
                <h4 class="mb-12" style="border-top:1px solid var(--border-soft); padding-top:16px; color:var(--primary); font-family:var(--font-heading); font-size:14px; font-weight:700;">💸 سياسات الخصم التلقائي</h4>
                
                <div style="background:var(--bg-2); border-radius:12px; padding:16px; margin-bottom:20px;">
                  <div class="form-group mb-12" style="display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" id="sys-enable-cash-discount" style="width:18px; height:18px;" />
                    <label for="sys-enable-cash-discount" style="margin-bottom:0; cursor:pointer; font-weight:700;">تفعيل خصم تعجيل الدفع النقدي (Cash Discount)</label>
                  </div>
                  <div class="form-group mb-16" style="max-width:300px; padding-right:26px;">
                    <label>نسبة الخصم التلقائي عند السداد نقداً/تحويل (%)</label>
                    <input type="number" id="sys-cash-discount-rate" class="input mono" min="0" max="100" step="0.1" value="1" />
                  </div>

                  <div class="form-group mb-12" style="display:flex; align-items:center; gap:8px; border-top:1px dashed var(--border-soft); padding-top:12px;">
                    <input type="checkbox" id="sys-enable-volume-discount" style="width:18px; height:18px;" />
                    <label for="sys-enable-volume-discount" style="margin-bottom:0; cursor:pointer; font-weight:700;">تفعيل خصم الكميات الكبيرة (Volume Discount)</label>
                  </div>
                  <div class="grid-2 gap-16" style="padding-right:26px;">
                    <div class="form-group">
                      <label>الحد الأدنى للكمية الإجمالية لتفعيل الخصم (قطعة)</label>
                      <input type="number" id="sys-volume-discount-threshold" class="input mono" min="1" value="50" />
                    </div>
                    <div class="form-group">
                      <label>نسبة خصم الكميات الكبيرة الممنوح (%)</label>
                      <input type="number" id="sys-volume-discount-rate" class="input mono" min="0" max="100" step="0.1" value="2" />
                    </div>
                  </div>
                </div>

                <!-- 3. Sales Rep Control & Limits -->
                <h4 class="mb-12" style="border-top:1px solid var(--border-soft); padding-top:16px; color:var(--primary); font-family:var(--font-heading); font-size:14px; font-weight:700;">🛡️ ضوابط ورقابة مبيعات المناديب والائتمان</h4>
                <div class="grid-2 gap-16 mb-24">
                  <div class="form-group">
                    <label>الحد الأقصى للخصم اليدوي المسموح للمندوب (%)</label>
                    <input type="number" id="sys-max-rep-discount" class="input mono" min="0" max="100" step="0.1" value="3" />
                    <p class="dim" style="font-size:11px; margin-top:4px;">أي خصم يتجاوز هذه النسبة سيتطلب إدخال رمز أمان المشرف لحفظ الفاتورة.</p>
                  </div>
                  <div class="form-group">
                    <label>تأمين حد الائتمان وسقوف ديون العملاء</label>
                    <select id="sys-credit-block-policy" class="input">
                      <option value="allow_all">السماح بالبيع الآجل دائماً (دون قيود)</option>
                      <option value="warn">تنبيه فقط عند تجاوز حد الائتمان</option>
                      <option value="block_with_pin" selected>منع الحفظ عند التجاوز إلا بـ رمز المشرف (Supervisor PIN)</option>
                    </select>
                  </div>
                </div>

                <div id="pricing-save-msg" class="alert good hidden mb-12">✅ تم حفظ سياسات التسعير والخصم بنجاح</div>
                <button class="btn btn-primary" onclick="savePricingSettings()" id="save-pricing-btn">💾 حفظ سياسات التسعير والخصم</button>
              </div>
            </div>
          </div>

          <!-- ══ TAB: Backup ══ -->
          <div id="tab-backup" class="settings-tab hidden">
            <!-- Create Backup -->
            <div class="card mb-16">
              <div class="card-header"><h3>📤 إنشاء نسخة احتياطية</h3></div>
              <div class="card-body" style="padding:28px;">
                <p style="color:var(--text-dim);margin-bottom:20px;line-height:1.8;">
                  يتم تصدير جميع بيانات الشركة (الإعدادات، الحسابات، القيود، المنتجات، العملاء، الموردين) كملف JSON مشفر يمكن استخدامه للاستعادة لاحقاً.
                </p>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;" id="backup-stats">
                  ${backupStat('📋','القيود المحاسبية','جارٍ الحساب...')}
                  ${backupStat('👥','العملاء والموردين','جارٍ الحساب...')}
                  ${backupStat('📦','المنتجات','جارٍ الحساب...')}
                </div>
                <div style="display:flex;gap:10px;align-items:center;">
                  <button class="btn btn-primary" onclick="createBackup()" id="backup-btn">
                    <span id="backup-spinner" class="loading-spinner hidden" style="width:14px;height:14px;border-width:2px;margin-left:6px;"></span>
                    📥 تنزيل النسخة الاحتياطية
                  </button>
                  <span id="backup-status" style="font-size:12px;color:var(--text-muted);"></span>
                </div>
              </div>
            </div>

            <!-- Restore Backup -->
            <div class="card mb-16">
              <div class="card-header"><h3>📥 استعادة نسخة احتياطية</h3></div>
              <div class="card-body" style="padding:28px;">
                <div class="alert warn mb-16">
                  ⚠️ <strong>تحذير:</strong> ستؤدي الاستعادة إلى استبدال البيانات الحالية بالبيانات الموجودة في ملف النسخة الاحتياطية. تأكد من إنشاء نسخة احتياطية جديدة أولاً.
                </div>
                <div id="restore-dropzone" style="border:2px dashed var(--border);border-radius:14px;padding:40px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg-2);"
                  onclick="$('restore-file-input').click()"
                  ondragover="event.preventDefault();this.style.borderColor='var(--primary)'"
                  ondragleave="this.style.borderColor='var(--border)'"
                  ondrop="handleRestoreDrop(event)">
                  <div style="font-size:40px;margin-bottom:8px;">📂</div>
                  <div style="font-weight:700;color:var(--text-1);margin-bottom:4px;">اضغط لاختيار ملف أو اسحبه هنا</div>
                  <div style="font-size:12px;color:var(--text-muted);">ملفات .json فقط</div>
                </div>
                <input type="file" id="restore-file-input" accept=".json" style="display:none;" onchange="handleRestoreFile(event)" />
                <div id="restore-preview" class="hidden mt-16">
                  <div class="card" style="padding:16px;">
                    <h4 style="margin-bottom:10px;">📋 محتوى الملف:</h4>
                    <div id="restore-preview-content" style="font-size:12px;color:var(--text-dim);line-height:1.8;"></div>
                    <div style="margin-top:16px;display:flex;gap:8px;">
                      <button class="btn btn-danger" onclick="confirmRestore()" id="restore-confirm-btn">⚠️ تأكيد الاستعادة</button>
                      <button class="btn btn-secondary" onclick="cancelRestore()">إلغاء</button>
                    </div>
                  </div>
                </div>
                <div id="restore-status" class="hidden mt-12"></div>
              </div>
            </div>

            <!-- Auto Backup Schedule -->
            <div class="card">
              <div class="card-header"><h3>⏰ جدولة النسخ الاحتياطي التلقائي</h3></div>
              <div class="card-body" style="padding:28px;">
                <div class="grid-2 gap-16 mb-16">
                  <div class="form-group">
                    <label>تكرار النسخ التلقائي</label>
                    <select id="auto-backup-freq" class="input">
                      <option value="never">لا يوجد</option>
                      <option value="daily" selected>يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>آخر نسخة احتياطية</label>
                    <div id="last-backup-info" class="input" style="cursor:default;background:var(--bg-2);display:flex;align-items:center;gap:6px;">
                      <span>لم يتم بعد</span>
                    </div>
                  </div>
                </div>
                <button class="btn btn-primary" onclick="saveBackupSchedule()">💾 حفظ جدول النسخ</button>
                <div id="backup-schedule-msg" class="alert good hidden mt-12">✅ تم حفظ جدول النسخ</div>
              </div>
            </div>
          </div>

          <!-- ══ TAB: COA Mapping ══ -->
          <div id="tab-coa-mapping" class="settings-tab hidden">
            <div class="card mb-16">
              <div class="card-header"><h3>🔗 ربط الأقسام الجانبية بشجرة الحسابات</h3></div>
              <div class="card-body" style="padding:28px;">
                <p style="color:var(--text-dim);margin-bottom:20px;line-height:1.8;">
                  قم بربط كل قسم جانبي بالحساب الأب المقابل له في شجرة الحسابات لتوليد الحسابات الفرعية تلقائياً عند الإضافة.
                </p>
                
                <div class="grid-1 gap-20 mb-20" style="max-width: 600px;">
                  <!-- Customers -->
                  <div style="border-bottom: 1px solid var(--border-soft); padding-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                      <strong style="font-size:14px;">👥 قسم العملاء</strong>
                      <label class="switch-wrap" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="map-cust-enabled" checked />
                        <span>تفعيل الأتمتة</span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>الحساب الأب (Parent Account)</label>
                      <select id="map-cust-parent" class="input coa-select">
                        <option value="">اختر الحساب...</option>
                      </select>
                    </div>
                  </div>

                  <!-- Suppliers -->
                  <div style="border-bottom: 1px solid var(--border-soft); padding-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                      <strong style="font-size:14px;">🤝 قسم الموردين</strong>
                      <label class="switch-wrap" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="map-supp-enabled" checked />
                        <span>تفعيل الأتمتة</span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>الحساب الأب (Parent Account)</label>
                      <select id="map-supp-parent" class="input coa-select">
                        <option value="">اختر الحساب...</option>
                      </select>
                    </div>
                  </div>

                  <!-- Banks -->
                  <div style="border-bottom: 1px solid var(--border-soft); padding-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                      <strong style="font-size:14px;">🏦 قسم البنوك</strong>
                      <label class="switch-wrap" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="map-bank-enabled" checked />
                        <span>تفعيل الأتمتة</span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>الحساب الأب (Parent Account)</label>
                      <select id="map-bank-parent" class="input coa-select">
                        <option value="">اختر الحساب...</option>
                      </select>
                    </div>
                  </div>

                  <!-- Cash Boxes -->
                  <div style="padding-bottom: 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                      <strong style="font-size:14px;">💵 قسم الصناديق والخزائن</strong>
                      <label class="switch-wrap" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                        <input type="checkbox" id="map-cash-enabled" checked />
                        <span>تفعيل الأتمتة</span>
                      </label>
                    </div>
                    <div class="form-group">
                      <label>الحساب الأب (Parent Account)</label>
                      <select id="map-cash-parent" class="input coa-select">
                        <option value="">اختر الحساب...</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div id="coa-mapping-save-msg" class="alert good hidden mb-12">✅ تم حفظ إعدادات ربط الحسابات بنجاح</div>
                <button class="btn btn-primary" onclick="saveCoaMappingSettings()" id="save-coa-mapping-btn">💾 حفظ إعدادات ربط الحسابات</button>
              </div>
            </div>
          </div>

        </div><!-- /settings-content -->
      </div>
    </div>

    <style>
    /* ── Settings Nav ── */
    #settings-nav { display:flex;flex-direction:column;gap:3px; }
    .sett-nav-item {
      display:flex;align-items:center;gap:10px;padding:10px 12px;
      border-radius:10px;cursor:pointer;transition:all .15s;
      font-size:13px;font-weight:600;color:var(--text-dim);
      text-decoration:none;border:none;background:transparent;
      font-family:var(--font-heading);width:100%;text-align:right;
      white-space:nowrap;overflow:hidden;
    }
    .sett-nav-item:hover { background:var(--bg-hover);color:var(--text-0); }
    .sett-nav-item.active {
      background:var(--primary-dim);color:var(--primary);
      border-right:3px solid var(--primary);border-radius:0 10px 10px 0;
      font-weight:700;
    }
    /* Light mode: dark text on white background */
    body.theme-light .sett-nav-item { color:var(--text-dim); }
    body.theme-light .sett-nav-item:hover { background:var(--bg-hover);color:var(--text-0); }
    body.theme-light .sett-nav-item.active {
      background:var(--primary-dim);color:var(--primary);
      border-right-color:var(--primary);
    }
    .sett-nav-icon { font-size:17px;width:20px;text-align:center;flex-shrink:0; }
    .sett-nav-label { flex:1;overflow:hidden;text-overflow:ellipsis; }

    /* ── Font Cards ── */
    .font-card {
      border:2px solid var(--border);border-radius:12px;padding:14px;cursor:pointer;
      transition:all .2s;text-align:center;background:var(--bg-2);
    }
    .font-card:hover { border-color:var(--primary);background:var(--primary-dim); }
    .font-card.selected { border-color:var(--primary);background:var(--primary-dim);box-shadow:0 0 0 3px var(--primary-glow); }
    .font-card-name { font-size:15px;font-weight:700;margin-bottom:6px;color:var(--text-0); }
    .font-card-sample { font-size:12px;color:var(--text-muted); }

    /* ── Color Swatches ── */
    .color-swatch {
      width:40px;height:40px;border-radius:50%;cursor:pointer;border:3px solid transparent;
      transition:all .2s;position:relative;
    }
    .color-swatch:hover { transform:scale(1.15); }
    .color-swatch.selected { border-color:var(--text-0);box-shadow:0 0 0 3px rgba(255,255,255,.3); }
    .color-swatch-wrap { display:flex;flex-direction:column;align-items:center;gap:4px; }
    .color-swatch-label { font-size:10px;color:var(--text-muted);white-space:nowrap; }

    /* ── Theme Cards (New 6-theme picker) ── */
    .sett-theme-card {
      border:2px solid var(--border-soft); border-radius:14px;
      overflow:hidden; cursor:pointer;
      transition:all .2s ease;
      background:var(--bg-2);
    }
    .sett-theme-card:hover { border-color:var(--primary); transform:translateY(-2px); box-shadow:var(--shadow-md); }
    .sett-theme-card.active {
      border-color:var(--primary);
      box-shadow:0 0 0 3px var(--primary-glow), var(--shadow-md);
    }
    .sett-theme-preview {
      height:64px; width:100%;
    }
    .sett-theme-info {
      display:flex; align-items:center; gap:8px;
      padding:10px 12px;
    }
    .sett-theme-icon { font-size:18px; flex-shrink:0; }
    .sett-theme-name { font-size:12px; font-weight:700; color:var(--text-0); line-height:1.3; }
    .sett-theme-sub  { font-size:10px; color:var(--text-dim); }

    /* nav compatibility for all light themes */
    body.theme-light-blue .sett-nav-item,
    body.theme-light-green .sett-nav-item { color:var(--text-dim); }
    body.theme-light-blue .sett-nav-item.active,
    body.theme-light-green .sett-nav-item.active {
      background:var(--primary-dim);color:var(--primary);
      border-right-color:var(--primary);
    }


    /* ── Backup Stats ── */
    .backup-stat-card {
      background:var(--bg-2);border-radius:12px;padding:16px;text-align:center;
      border:1px solid var(--border);
    }
    .backup-stat-icon { font-size:24px;margin-bottom:6px; }
    .backup-stat-label { font-size:11px;color:var(--text-muted);margin-bottom:4px; }
    .backup-stat-value { font-size:20px;font-weight:800;color:var(--text-0); }
    </style>`;

  // Init
  await loadAllSettings();
  initFontSelector();
  initColorSelector();
  initThemeCardState();

  loadBackupStats();
  loadLastBackupInfo();
}

// ── Nav item helper ──────────────────────────────────────────
function navItem(tab, icon, label, active = false) {
  return `
    <button class="sett-nav-item${active?' active':''}" onclick="switchSettingsTab('${tab}',this)">
      <span class="sett-nav-icon">${icon}</span>
      <span class="sett-nav-label">${label}</span>
    </button>`;
}
function guideLine(icon, text) {
  return `<div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--text-dim);">
    <span style="flex-shrink:0;">${icon}</span><span>${text}</span></div>`;
}
function fontCard(value, display, desc, selected = false) {
  return `
    <div class="font-card${selected?' selected':''}" data-font="${value}" onclick="selectFont('${value}',this)">
      <div class="font-card-name" style="font-family:'${display}',sans-serif;">${display}</div>
      <div class="font-card-sample" style="font-family:'${display}',sans-serif;">أبجدية عربية 1234</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${desc}</div>
    </div>`;
}
function colorSwatch(color, label, selected = false) {
  return `
    <div class="color-swatch-wrap">
      <div class="color-swatch${selected?' selected':''}" data-color="${color}" style="background:${color};" onclick="selectColor('${color}',this)" title="${label}"></div>
      <span class="color-swatch-label">${label.split(' ')[0]}</span>
    </div>`;
}
function backupStat(icon, label, value) {
  return `<div class="backup-stat-card">
    <div class="backup-stat-icon">${icon}</div>
    <div class="backup-stat-label">${label}</div>
    <div class="backup-stat-value" id="bstat-${label.substring(0,3)}">${value}</div>
  </div>`;
}

// ── Tab Switcher ─────────────────────────────────────────────
window.switchSettingsTab = (tab, el) => {
  document.querySelectorAll(".sett-nav-item").forEach(a => a.classList.remove("active"));
  el.classList.add("active");
  document.querySelectorAll(".settings-tab").forEach(d => d.classList.add("hidden"));
  document.getElementById(`tab-${tab}`)?.classList.remove("hidden");
};

// ── Load all settings ────────────────────────────────────────
async function loadAllSettings() {
  try {
    // Company
    const coSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"));
    if (coSnap.exists()) {
      const s = coSnap.data();
      $("co-name")     && ($("co-name").value     = s.name    || "");
      $("co-cr")       && ($("co-cr").value        = s.cr      || s.crNumber || "");
      $("co-vat")      && ($("co-vat").value       = s.vatNumber || "");
      $("co-phone")    && ($("co-phone").value     = s.phone   || "");
      $("co-email")    && ($("co-email").value     = s.email   || "");
      $("co-address")  && ($("co-address").value   = s.address || "");
      $("co-city")     && ($("co-city").value      = s.city    || "");
      $("co-zip")      && ($("co-zip").value       = s.zip     || "");
      $("co-country")  && ($("co-country").value   = s.country || "المملكة العربية السعودية");
      $("co-currency") && ($("co-currency").value  = s.currency || "SAR");
      $("co-vat-rate") && ($("co-vat-rate").value  = s.vatRate  || "15");

      // ── حفظ بيانات الشركة في localStorage فوراً للاستخدام في التصدير ──
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      Object.assign(cached, {
        name:      s.name      || "",
        crNumber:  s.cr        || "",
        vatNumber: s.vatNumber || "",
        phone:     s.phone     || "",
        email:     s.email     || "",
        address:   s.address   || "",
        city:      s.city      || "",
        zip:       s.zip       || "",
        country:   s.country   || "المملكة العربية السعودية",
        currency:  s.currency  || "SAR",
        vatRate:   s.vatRate   || "15",
      });
      localStorage.setItem("idham_company", JSON.stringify(cached));
      window.ERP_COMPANY = cached;
    }
    // Logo
    const logoSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"));
    if (logoSnap.exists() && logoSnap.data().dataUrl) {
      showLogoPreview(logoSnap.data().dataUrl);
      // ── حفظ الشعار في localStorage ──
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      cached.logoBase64 = logoSnap.data().dataUrl;
      localStorage.setItem("idham_company", JSON.stringify(cached));
      window.ERP_COMPANY = cached;
    }
    // Appearance
    const appSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "appearance"));
    if (appSnap.exists()) {
      const a = appSnap.data();
      if (a.fontFamily) selectFont(a.fontFamily, null, false);
      if (a.fontSize)   { $("font-size-range").value = a.fontSize; updateFontSizeLabel(a.fontSize); }
      if (a.primaryColor) {
        selectColor(a.primaryColor, null, false);
        // حفظ اللون الأساسي أيضاً
        const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
        cached.primaryColor = a.primaryColor;
        localStorage.setItem("idham_company", JSON.stringify(cached));
        window.ERP_COMPANY = cached;
      }
    }
    // System
    const sysSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "system"));
    if (sysSnap.exists()) {
      const s = sysSnap.data();
      $("sys-inv-prefix") && ($("sys-inv-prefix").value = s.invoicePrefix  || "INV-");
      $("sys-pur-prefix") && ($("sys-pur-prefix").value = s.purchasePrefix || "PUR-");
      $("sys-inv-seq")    && ($("sys-inv-seq").value    = s.invoiceSequence || 1);
      $("sys-due-days")   && ($("sys-due-days").value   = s.defaultDueDays || 30);
      $("sys-valuation-method") && ($("sys-valuation-method").value = s.valuationMethod || "weighted_average");
      $("sys-supervisor-pin")   && ($("sys-supervisor-pin").value   = s.supervisorPIN || "1234");
      $("sys-footer")     && ($("sys-footer").value     = s.invoiceFooter  || "");

      // Pricing & Auto-Discounts
      $("sys-enable-category-margins") && ($("sys-enable-category-margins").checked = s.enableCategoryMargins ?? false);
      $("sys-margin-fast")   && ($("sys-margin-fast").value   = s.marginFast ?? 5);
      $("sys-margin-medium") && ($("sys-margin-medium").value = s.marginMedium ?? 10);
      $("sys-margin-slow")   && ($("sys-margin-slow").value   = s.marginSlow ?? 15);

      $("sys-enable-cash-discount") && ($("sys-enable-cash-discount").checked = s.enableCashDiscount ?? false);
      $("sys-cash-discount-rate")   && ($("sys-cash-discount-rate").value   = s.cashDiscountRate ?? 1);

      $("sys-enable-volume-discount") && ($("sys-enable-volume-discount").checked = s.enableVolumeDiscount ?? false);
      $("sys-volume-discount-threshold") && ($("sys-volume-discount-threshold").value = s.volumeDiscountThreshold ?? 50);
      $("sys-volume-discount-rate")   && ($("sys-volume-discount-rate").value   = s.volumeDiscountRate ?? 2);

      $("sys-max-rep-discount") && ($("sys-max-rep-discount").value = s.maxRepDiscount ?? 3);
      $("sys-credit-block-policy") && ($("sys-credit-block-policy").value = s.creditBlockPolicy || "block_with_pin");
    }
    // Backup schedule
    const bkSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "backup"));
    if (bkSnap.exists()) {
      const b = bkSnap.data();
      $("auto-backup-freq") && ($("auto-backup-freq").value = b.frequency || "daily");
    }

    // COA Mapping
    await loadCoaMappingSettings();
  } catch(e) { console.error("loadAllSettings:", e); }
}


// ── Company ──────────────────────────────────────────────────
window.saveCompanySettings = async () => {
  const name = val("co-name");
  if (!name) { $("co-error").textContent = "اسم الشركة مطلوب"; $("co-error").classList.remove("hidden"); return; }
  $("co-error").classList.add("hidden");
  $("save-co-btn").disabled = true;
  try {
    const companyData = {
      name, cr: val("co-cr"), vatNumber: val("co-vat"),
      phone: val("co-phone"), email: val("co-email"),
      address: val("co-address"), city: val("co-city"),
      zip: val("co-zip"), country: val("co-country"),
      currency: $("co-currency").value, vatRate: $("co-vat-rate").value,
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "company"), companyData, { merge: true });

    // ── حفظ في localStorage لاستخدامه في التصدير فوراً ──
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    localStorage.setItem("idham_company", JSON.stringify({
      ...cached,
      name:       companyData.name,
      crNumber:   companyData.cr,
      vatNumber:  companyData.vatNumber,
      phone:      companyData.phone,
      email:      companyData.email,
      address:    companyData.address,
      city:       companyData.city,
      zip:        companyData.zip,
      country:    companyData.country,
      currency:   companyData.currency,
      vatRate:    companyData.vatRate,
    }));
    window.ERP_COMPANY = JSON.parse(localStorage.getItem("idham_company"));

    const crInput = document.getElementById("co-cr-upload");
    if (crInput && crInput.files.length > 0) {
      const file = crInput.files[0];
      window.uploadFileToArchive(file, "company_docs", COMPANY_ID, `صورة السجل التجاري للشركة`).catch(e => console.warn(e));
    }

    const taxInput = document.getElementById("co-tax-upload");
    if (taxInput && taxInput.files.length > 0) {
      const file = taxInput.files[0];
      window.uploadFileToArchive(file, "company_docs", COMPANY_ID, `صورة الشهادة/البطاقة الضريبية للشركة`).catch(e => console.warn(e));
    }

    showMsg("co-save-msg");
    showToast("تم حفظ بيانات الشركة", "success");
  } catch (e) { $("co-error").textContent = e.message; $("co-error").classList.remove("hidden"); }
  finally { $("save-co-btn").disabled = false; }
};

// ── Logo ─────────────────────────────────────────────────────
window.handleLogoUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast("حجم الشعار يتجاوز 2 ميجابايت", "error"); return; }
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const dataUrl = ev.target.result;
    showLogoPreview(dataUrl);
    try {
      await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"),
        { dataUrl, updatedAt: serverTimestamp() }, { merge: true });
      // حفظ الشعار في localStorage لاستخدامه في التصدير
      const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
      cached.logoBase64 = dataUrl;
      localStorage.setItem("idham_company", JSON.stringify(cached));
      window.ERP_COMPANY = cached;
      showMsg("logo-save-msg");
      showToast("تم رفع الشعار وحفظه", "success");
    } catch(err) { showToast(err.message, "error"); }
  };
  reader.readAsDataURL(file);
};

function showLogoPreview(dataUrl) {
  const img = $("logo-preview-img");
  const empty = $("logo-empty-msg");
  const removeBtn = $("remove-logo-btn");
  if (img) { img.src = dataUrl; img.style.display = "block"; }
  if (empty) empty.style.display = "none";
  if (removeBtn) removeBtn.style.display = "";
}

window.removeLogo = async () => {
  if (!confirm("هل تريد حذف الشعار الحالي؟")) return;
  try {
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "logo"),
      { dataUrl: "", updatedAt: serverTimestamp() }, { merge: true });
    const img = $("logo-preview-img");
    const empty = $("logo-empty-msg");
    const removeBtn = $("remove-logo-btn");
    if (img) { img.src = ""; img.style.display = "none"; }
    if (empty) empty.style.display = "";
    if (removeBtn) removeBtn.style.display = "none";
    showToast("تم حذف الشعار", "success");
  } catch(e) { showToast(e.message, "error"); }
};

// ── Fonts & Appearance ───────────────────────────────────────
let _selectedFont = "IBM Plex Sans Arabic";
let _selectedColor = "#4f46e5";

// ── Theme Picker (Settings Page) ─────────────────────────────
window.applyThemeFromSettings = (themeId) => {
  // Call the global theme system
  if (typeof window.applyTheme === 'function') {
    window.applyTheme(themeId);
  }
  // Update card active states in settings page
  document.querySelectorAll('.sett-theme-card').forEach(card => {
    card.classList.toggle('active', card.dataset.theme === themeId);
  });
  // Visual feedback
  if (typeof showToast === 'function') {
    const names = {
      'dark': 'Dark Space 🌌', 'dark-cyan': 'Ocean Depth 🌊',
      'dark-gold': 'Premium Gold ✨', 'light': 'Classic Light ☀️',
      'light-blue': 'Clear Sky 🔵', 'light-green': 'Fresh Emerald 🌿'
    };
    showToast(`تم تطبيق ثيم: ${names[themeId] || themeId}`, 'success');
  }
};

function initThemeCardState() {
  const current = localStorage.getItem('idham_theme') || 'dark';
  document.querySelectorAll('.sett-theme-card').forEach(card => {
    card.classList.toggle('active', card.dataset.theme === current);
  });
}



function initFontSelector() {
  // Load Google Fonts for all options
  const fonts = ['Tajawal','Cairo','Almarai','Noto Sans Arabic'];
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f=>f.replace(/ /,'+')+':wght@400;700').join('&family=')}&display=swap`;
  document.head.appendChild(link);
}
function initColorSelector() {}

// ── Apply appearance globally (called on load + save) ─────────
export function applyAppearanceFromStorage() {
  try {
    const app = JSON.parse(localStorage.getItem("idham_appearance") || "{}");
    if (app.fontFamily) {
      document.documentElement.style.setProperty("--font-body",    `'${app.fontFamily}', sans-serif`);
      document.documentElement.style.setProperty("--font-heading",  `'${app.fontFamily}', sans-serif`);
      document.body.style.fontFamily = `'${app.fontFamily}', sans-serif`;
    }
    if (app.fontSize) {
      document.documentElement.style.setProperty("--font-size-base", app.fontSize + "px");
      document.body.style.fontSize = app.fontSize + "px";
    }
    if (app.primaryColor) {
      document.documentElement.style.setProperty("--primary",      app.primaryColor);
      document.documentElement.style.setProperty("--primary-dim",  app.primaryColor + "22");
      document.documentElement.style.setProperty("--primary-glow", app.primaryColor + "55");
    }
  } catch {}
}


window.selectFont = (fontName, el, save = true) => {
  _selectedFont = fontName;
  document.querySelectorAll(".font-card").forEach(c => c.classList.toggle("selected", c.dataset.font === fontName));
  const preview = $("font-preview");
  if (preview) preview.style.fontFamily = `'${fontName}', sans-serif`;
  // Apply globally to entire app
  document.documentElement.style.setProperty("--font-body",   `'${fontName}', sans-serif`);
  document.documentElement.style.setProperty("--font-heading", `'${fontName}', sans-serif`);
  document.body.style.fontFamily = `'${fontName}', sans-serif`;
  _saveToLocalStorage();
};

window.updateFontSizeLabel = (v) => {
  const lbl = $("font-size-label");
  if (lbl) lbl.textContent = v + "px";
  document.documentElement.style.setProperty("--font-size-base", v + "px");
  document.body.style.fontSize = v + "px";
  _saveToLocalStorage();
};

window.selectColor = (color, el, save = true) => {
  _selectedColor = color;
  document.querySelectorAll(".color-swatch").forEach(s => s.classList.toggle("selected", s.dataset.color === color));
  document.documentElement.style.setProperty("--primary",      color);
  document.documentElement.style.setProperty("--primary-dim",  color + "22");
  document.documentElement.style.setProperty("--primary-glow", color + "55");
  _saveToLocalStorage();
};

function _saveToLocalStorage() {
  const fontSize = $("font-size-range")?.value || "14";
  localStorage.setItem("idham_appearance", JSON.stringify({
    fontFamily: _selectedFont,
    fontSize,
    primaryColor: _selectedColor
  }));
}

window.saveAppearanceSettings = async () => {
  try {
    const fontSize = $("font-size-range")?.value || "14";
    // Save to localStorage first (instant global apply)
    localStorage.setItem("idham_appearance", JSON.stringify({
      fontFamily: _selectedFont, fontSize, primaryColor: _selectedColor
    }));
    applyAppearanceFromStorage();
    // Then save to Firestore
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "appearance"), {
      fontFamily: _selectedFont, fontSize, primaryColor: _selectedColor,
      updatedAt: serverTimestamp()
    }, { merge: true });
    showMsg("fonts-save-msg");
    showToast("✅ تم حفظ إعدادات المظهر وتطبيقها على كامل النظام", "success");
  } catch(e) { showToast(e.message, "error"); }
};

// ── ZATCA ────────────────────────────────────────────────────
window.saveZATCASettings = async () => {
  try {
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "zatca"), {
      environment: $("zatca-env").value, deviceSerial: val("zatca-device"),
      csid: val("zatca-csid"), pcsid: val("zatca-pcsid"),
      privateKey: val("zatca-key"), updatedAt: serverTimestamp()
    }, { merge: true });
    showToast("تم حفظ إعدادات ZATCA", "success");
  } catch(e) { showToast(e.message, "error"); }
};

window.testZATCAConnection = async () => {
  const resultEl = $("zatca-test-result");
  resultEl.innerHTML = `<div class="page-loading" style="padding:12px;"><div class="loading-spinner"></div><span>جارٍ الاختبار…</span></div>`;
  resultEl.classList.remove("hidden");
  try {
    const env = $("zatca-env").value;
    const url = env === "production"
      ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
      : "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation";
    const resp = await fetch(`${url}/health`);
    resultEl.innerHTML = resp.ok
      ? `<div class="alert good">✅ الاتصال بـ ZATCA يعمل بنجاح (${env})</div>`
      : `<div class="alert warn">⚠️ البيئة متاحة لكن الرد: ${resp.status}</div>`;
  } catch {
    resultEl.innerHTML = `<div class="alert info">ℹ️ اختبار الاتصال يتطلب شهادة CSID صحيحة. تأكد من الإعدادات.</div>`;
  }
};

// ── System ───────────────────────────────────────────────────
window.saveSystemSettings = async () => {
  try {
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "system"), {
      invoicePrefix:   val("sys-inv-prefix"),
      purchasePrefix:  val("sys-pur-prefix"),
      invoiceSequence: parseInt($("sys-inv-seq").value) || 1,
      defaultDueDays:  parseInt($("sys-due-days").value) || 30,
      valuationMethod: $("sys-valuation-method").value,
      supervisorPIN:   val("sys-supervisor-pin") || "1234",
      invoiceFooter:   val("sys-footer"),
      updatedAt: serverTimestamp()
    }, { merge: true });
    showMsg("sys-save-msg");
    showToast("تم حفظ إعدادات النظام", "success");
  } catch(e) { showToast(e.message, "error"); }
};

window.savePricingSettings = async () => {
  const btn = document.getElementById("save-pricing-btn");
  btn.disabled = true;
  try {
    const pricingData = {
      enableCategoryMargins:    $("sys-enable-category-margins").checked,
      marginFast:               parseFloat($("sys-margin-fast").value) || 0,
      marginMedium:             parseFloat($("sys-margin-medium").value) || 0,
      marginSlow:               parseFloat($("sys-margin-slow").value) || 0,
      enableCashDiscount:       $("sys-enable-cash-discount").checked,
      cashDiscountRate:         parseFloat($("sys-cash-discount-rate").value) || 0,
      enableVolumeDiscount:     $("sys-enable-volume-discount").checked,
      volumeDiscountThreshold:  parseInt($("sys-volume-discount-threshold").value) || 0,
      volumeDiscountRate:       parseFloat($("sys-volume-discount-rate").value) || 0,
      maxRepDiscount:           parseFloat($("sys-max-rep-discount").value) || 0,
      creditBlockPolicy:        $("sys-credit-block-policy").value,
      updatedAt: serverTimestamp()
    };
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "system"), pricingData, { merge: true });
    
    // Save to localStorage
    const cached = JSON.parse(localStorage.getItem("idham_company") || "{}");
    cached.pricing = pricingData;
    localStorage.setItem("idham_company", JSON.stringify(cached));
    window.ERP_COMPANY = cached;

    showMsg("pricing-save-msg");
    showToast("تم حفظ سياسات التسعير والخصم بنجاح", "success");
  } catch(e) {
    showToast(e.message, "error");
  } finally {
    btn.disabled = false;
  }
};

// ── Backup ───────────────────────────────────────────────────
async function loadBackupStats() {
  try {
    const colNames = ["journalEntries","customers","products"];
    const counts = await Promise.all(
      colNames.map(c => getDocs(collection(db, `companies/${COMPANY_ID}/${c}`)))
    );
    const vals = document.querySelectorAll(".backup-stat-value");
    if (vals[0]) vals[0].textContent = counts[0].size;
    if (vals[1]) vals[1].textContent = counts[1].size;
    if (vals[2]) vals[2].textContent = counts[2].size;
  } catch(e) { console.warn("loadBackupStats:", e); }
}

async function loadLastBackupInfo() {
  try {
    const bkSnap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, "backup"));
    if (bkSnap.exists() && bkSnap.data().lastBackup) {
      const d = bkSnap.data().lastBackup.toDate?.() || new Date(bkSnap.data().lastBackup);
      const el = $("last-backup-info");
      if (el) el.innerHTML = `<span>✅ ${d.toLocaleDateString("ar-SA")} — ${d.toLocaleTimeString("ar-SA")}</span>`;
    }
  } catch {}
}

window.createBackup = async () => {
  const btn = $("backup-btn");
  const spinner = $("backup-spinner");
  const status = $("backup-status");
  btn.disabled = true;
  spinner.classList.remove("hidden");
  status.textContent = "جارٍ جمع البيانات…";

  try {
    const cols = [
      "chartOfAccounts", "journalEntries", "customers", "suppliers", "products", "warehouses",
      "salesInvoices", "purchaseInvoices", "salesReturns", "purchaseReturns", "receipts",
      "expenses", "cheques", "cashBoxes", "bankAccounts", "salesReps", "priceLists",
      "costCenters", "employees", "payrolls", "employeeLoans", "employeeLeaves",
      "employeeAttendance", "employeeSettlements", "stockLedger", "stockTransfers",
      "inventoryAdjustments", "physicalCounts", "goodsReceiptPOs", "quotations",
      "purchaseRequests", "purchaseOrders", "users", "counters", "categories", "units",
      "locations", "cashTransactions", "bankTransactions", "productAssemblies",
      "qualityInspections", "stockByWarehouse", "stockTransactions", "purchases",
      "repInvoices", "collections", "archivedFiles", "auditTrails"
    ];
    const backup = { version: "3.0", createdAt: new Date().toISOString(), company: COMPANY_ID, data: {} };

    for (const col of cols) {
      status.textContent = `جارٍ تصدير: ${col}…`;
      const snap = await getDocs(collection(db, `companies/${COMPANY_ID}/${col}`));
      backup.data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // Settings
    const settingsCols = ["company","logo","appearance","system","zatca","backup"];
    backup.settings = {};
    for (const s of settingsCols) {
      const snap = await getDoc(doc(db, `companies/${COMPANY_ID}/settings`, s));
      if (snap.exists()) backup.settings[s] = snap.data();
    }

    // Download
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `idham-erp-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "backup"), {
      lastBackup: new Date().toISOString(), frequency: $("auto-backup-freq")?.value || "daily"
    }, { merge: true });

    status.textContent = "✅ تم التنزيل بنجاح!";
    showToast("تم إنشاء النسخة الاحتياطية وتنزيلها", "success");
    loadLastBackupInfo();
  } catch(e) {
    status.textContent = "❌ خطأ: " + e.message;
    showToast(e.message, "error");
  } finally {
    btn.disabled = false;
    spinner.classList.add("hidden");
  }
};

let _restoreData = null;

window.handleRestoreFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  readRestoreFile(file);
};

window.handleRestoreDrop = (e) => {
  e.preventDefault();
  $("restore-dropzone").style.borderColor = "var(--border)";
  const file = e.dataTransfer.files[0];
  if (file) readRestoreFile(file);
};

function readRestoreFile(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      _restoreData = data;
      const preview = $("restore-preview");
      const content = $("restore-preview-content");
      if (preview && content) {
        content.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            <div>📅 <strong>تاريخ النسخة:</strong> ${data.createdAt || 'غير معروف'}</div>
            <div>🔖 <strong>الإصدار:</strong> ${data.version || 'قديم'}</div>
            ${(() => {
              const COL_NAMES_AR = {
                chartOfAccounts: "شجرة الحسابات",
                journalEntries: "قيود اليومية",
                customers: "العملاء",
                suppliers: "الموردين",
                products: "كتالوج الأصناف",
                warehouses: "المستودعات والمخازن",
                salesInvoices: "فواتير المبيعات",
                purchaseInvoices: "فواتير المشتريات",
                salesReturns: "مرتجع المبيعات",
                purchaseReturns: "مرتجع المشتريات",
                receipts: "سندات القبض والصرف",
                expenses: "سندات المصروفات",
                cheques: "إدارة الشيكات",
                cashBoxes: "الصناديق النقدية",
                bankAccounts: "الحسابات البنكية",
                salesReps: "المناديب",
                priceLists: "قوائم الأسعار",
                costCenters: "مراكز التكلفة",
                employees: "سجلات الموظفين",
                payrolls: "مسيرات الرواتب",
                employeeLoans: "سلف الموظفين",
                employeeLeaves: "إجازات الموظفين",
                employeeAttendance: "حضور وانصراف الموظفين",
                employeeSettlements: "تصفية الموظفين",
                stockLedger: "دفتر أستاذ المخزون (كرت الصنف)",
                stockTransfers: "تحويلات المخزون",
                inventoryAdjustments: "تسويات المخزون",
                physicalCounts: "عمليات الجرد الفعلي",
                goodsReceiptPOs: "سندات استلام البضائع",
                quotations: "عروض الأسعار",
                purchaseRequests: "طلبات الشراء",
                purchaseOrders: "أوامر الشراء",
                users: "حسابات المستخدمين",
                counters: "عدادات الفواتير والسندات",
                categories: "فئات الأصناف",
                units: "وحدات القياس",
                locations: "مواقع وأرفف المستودعات",
                cashTransactions: "حركات الصناديق النقدية",
                bankTransactions: "حركات الحسابات البنكية",
                productAssemblies: "تجميع المنتجات",
                qualityInspections: "فحص الجودة",
                stockByWarehouse: "المخزون حسب المستودع",
                stockTransactions: "عمليات حركة المخازن",
                purchases: "طلبات المشتريات العامة",
                repInvoices: "فواتير المناديب",
                collections: "التحصيلات والتحققات",
                archivedFiles: "الملفات المؤرشفة",
                auditTrails: "سجل العمليات والتدقيق"
              };
              return Object.entries(data.data || {}).map(([k,v]) => {
                const label = COL_NAMES_AR[k] || k;
                return `<div>📦 <strong>${label}:</strong> ${Array.isArray(v) ? v.length + ' سجل' : '—'}</div>`;
              }).join("");
            })()}
          </div>`;
        preview.classList.remove("hidden");
      }
    } catch(e) { showToast("ملف JSON غير صحيح: " + e.message, "error"); }
  };
  reader.readAsText(file);
}

window.confirmRestore = async () => {
  if (!_restoreData) return;
  if (!confirm("⚠️ هذا الإجراء سيستبدل البيانات الحالية. هل أنت متأكد؟")) return;

  const btn = $("restore-confirm-btn");
  btn.disabled = true;
  btn.textContent = "⏳ جارٍ الاستعادة…";
  const statusEl = $("restore-status");
  statusEl.classList.remove("hidden");

  try {
    for (const [colName, docs] of Object.entries(_restoreData.data || {})) {
      statusEl.innerHTML = `<div class="alert info">جارٍ استعادة: ${colName} (${docs.length} سجل)…</div>`;
      for (const item of docs) {
        const { id, ...data } = item;
        await setDoc(doc(db, `companies/${COMPANY_ID}/${colName}`, id), data, { merge: true });
      }
    }
    statusEl.innerHTML = `<div class="alert good">✅ تمت استعادة ${Object.keys(_restoreData.data||{}).length} مجموعات بنجاح</div>`;
    showToast("تمت الاستعادة بنجاح", "success");
  } catch(e) {
    statusEl.innerHTML = `<div class="alert bad">❌ خطأ: ${e.message}</div>`;
    showToast(e.message, "error");
  } finally { btn.disabled = false; btn.textContent = "⚠️ تأكيد الاستعادة"; }
};

window.cancelRestore = () => {
  _restoreData = null;
  $("restore-preview")?.classList.add("hidden");
  $("restore-file-input") && ($("restore-file-input").value = "");
};

window.saveBackupSchedule = async () => {
  try {
    await setDoc(doc(db, `companies/${COMPANY_ID}/settings`, "backup"),
      { frequency: $("auto-backup-freq").value, updatedAt: serverTimestamp() }, { merge: true });
    showMsg("backup-schedule-msg");
    showToast("تم حفظ جدول النسخ الاحتياطي", "success");
  } catch(e) { showToast(e.message, "error"); }
};

// ── Utilities ────────────────────────────────────────────────
function showMsg(id, ms = 3000) {
  const el = $(id);
  if (!el) return;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), ms);
}

async function loadCoaMappingSettings() {
  try {
    const mapping = await getCoaMapping();

    // Populate toggles
    const cEn = $("map-cust-enabled"); if (cEn) cEn.checked = mapping.customers?.enabled ?? true;
    const sEn = $("map-supp-enabled"); if (sEn) sEn.checked = mapping.suppliers?.enabled ?? true;
    const bEn = $("map-bank-enabled"); if (bEn) bEn.checked = mapping.banks?.enabled ?? true;
    const cbEn = $("map-cash-enabled"); if (cbEn) cbEn.checked = mapping.cashBoxes?.enabled ?? true;

    // Fetch all accounts to fill dropdowns
    const coaSnap = await getDocs(query(collection(db, `companies/${COMPANY_ID}/chartOfAccounts`), orderBy("code")));
    const accounts = coaSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const buildOptions = (selectedVal) => {
      return `<option value="">اختر الحساب...</option>` +
        accounts.map(a => `<option value="${a.code}" ${a.code === selectedVal ? 'selected' : ''}>${a.code} - ${a.name} (${a.type === 'asset'?'أصول':a.type==='liability'?'خصوم':a.type==='equity'?'حقوق ملكية':a.type==='revenue'?'إيرادات':'مصروفات'})</option>`).join("");
    };

    const cSel = $("map-cust-parent"); if (cSel) cSel.innerHTML = buildOptions(mapping.customers?.parentCode);
    const sSel = $("map-supp-parent"); if (sSel) sSel.innerHTML = buildOptions(mapping.suppliers?.parentCode);
    const bSel = $("map-bank-parent"); if (bSel) bSel.innerHTML = buildOptions(mapping.banks?.parentCode);
    const cbSel = $("map-cash-parent"); if (cbSel) cbSel.innerHTML = buildOptions(mapping.cashBoxes?.parentCode);
  } catch (e) {
    console.error("loadCoaMappingSettings error:", e);
  }
}

window.saveCoaMappingSettings = async () => {
  const btn = $("save-coa-mapping-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ جارٍ الحفظ…"; }
  try {
    const mapping = {
      customers: {
        enabled: $("map-cust-enabled").checked,
        parentCode: $("map-cust-parent").value,
        numbering: "seq"
      },
      suppliers: {
        enabled: $("map-supp-enabled").checked,
        parentCode: $("map-supp-parent").value,
        numbering: "seq"
      },
      banks: {
        enabled: $("map-bank-enabled").checked,
        parentCode: $("map-bank-parent").value,
        numbering: "seq"
      },
      cashBoxes: {
        enabled: $("map-cash-enabled").checked,
        parentCode: $("map-cash-parent").value,
        numbering: "seq"
      }
    };

    await saveCoaMapping(mapping);
    showMsg("coa-mapping-save-msg");
    window.showToast?.("تم حفظ إعدادات ربط الحسابات بنجاح", "success");
  } catch (e) {
    window.showToast?.(e.message, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "💾 حفظ إعدادات ربط الحسابات"; }
  }
};
