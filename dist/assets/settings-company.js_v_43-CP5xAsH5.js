import{d,C as l}from"./index-CnctmNGr.js";import{g as O,c as M}from"./coa-connector-D6PwCSyt.js";import{getDoc as k,doc as u,getDocs as E,collection as I,query as _,orderBy as q,serverTimestamp as x,setDoc as b}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";const t=e=>document.getElementById(e),c=e=>t(e)?.value?.trim()??"";async function te(e,a){e.innerHTML=`
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
            ${f("company","🏢","بيانات الشركة",!0)}
            ${f("logo","🖼️","شعار المنشأة")}
            ${f("fonts","🔤","الخطوط والمظهر")}
            ${f("zatca","⚡","إعدادات ZATCA")}
            ${f("system","🔧","إعدادات النظام")}
            ${f("pricing","🏷️","سياسات التسعير والخصم")}
            ${f("backup","💾","النسخ الاحتياطي")}
            ${f("coa-mapping","🔗","ربط شجرة الحسابات")}
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
                <div class="grid-3 gap-16 mb-16">
                  <div class="form-group">
                    <label>اسم الشارع (Street Name)</label>
                    <input type="text" id="co-street" class="input" placeholder="عامر الشعبي" />
                  </div>
                  <div class="form-group">
                    <label>الحي (District)</label>
                    <input type="text" id="co-district" class="input" placeholder="حي النزهة" />
                  </div>
                  <div class="form-group">
                    <label>المدينة (City)</label>
                    <input type="text" id="co-city" class="input" placeholder="ينبع" />
                  </div>
                </div>
                <div class="grid-4 gap-16 mb-16">
                  <div class="form-group">
                    <label>رقم المبنى (Building No)</label>
                    <input type="text" id="co-building-no" class="input mono" placeholder="7480" maxlength="8" />
                  </div>
                  <div class="form-group">
                    <label>الرمز البريدي (Postal Code)</label>
                    <input type="text" id="co-zip" class="input mono" placeholder="46424" maxlength="5" />
                  </div>
                  <div class="form-group">
                    <label>الرقم الإضافي (Additional No)</label>
                    <input type="text" id="co-additional-no" class="input mono" placeholder="3180" maxlength="4" />
                  </div>
                  <div class="form-group">
                    <label>الدولة (Country)</label>
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
                      ${C("✅","الصيغ المدعومة: PNG, JPG, SVG, WebP")}
                      ${C("✅","الحجم الموصى به: 400×200 بكسل أو أكبر")}
                      ${C("✅","الخلفية الشفافة (PNG) مثالية للفواتير")}
                      ${C("⚠️","الحجم الأقصى: 2 ميجابايت")}
                      ${C("ℹ️","يُحفظ الشعار في قاعدة البيانات ويظهر في جميع الفواتير والتقارير المطبوعة")}
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
                    ${A("IBM Plex Sans Arabic","IBM Plex Sans Arabic","أكثر دقة واحترافية",!0)}
                    ${A("Tajawal","Tajawal","هادئ وسهل للقراءة")}
                    ${A("Cairo","Cairo","عصري وجريء")}
                    ${A("Almarai","Almarai","دافئ ومتوازن")}
                    ${A("Noto Sans Arabic","Noto Sans Arabic","شامل ومتوافق")}
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
                  ${L("📋","القيود المحاسبية","جارٍ الحساب...")}
                  ${L("👥","العملاء والموردين","جارٍ الحساب...")}
                  ${L("📦","المنتجات","جارٍ الحساب...")}
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
    </style>`,await j(),U(),J(),Z(),B()}function f(e,a,i,o=!1){return`
    <button class="sett-nav-item${o?" active":""}" onclick="switchSettingsTab('${e}',this)">
      <span class="sett-nav-icon">${a}</span>
      <span class="sett-nav-label">${i}</span>
    </button>`}function C(e,a){return`<div style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--text-dim);">
    <span style="flex-shrink:0;">${e}</span><span>${a}</span></div>`}function A(e,a,i,o=!1){return`
    <div class="font-card${o?" selected":""}" data-font="${e}" onclick="selectFont('${e}',this)">
      <div class="font-card-name" style="font-family:'${a}',sans-serif;">${a}</div>
      <div class="font-card-sample" style="font-family:'${a}',sans-serif;">أبجدية عربية 1234</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${i}</div>
    </div>`}function L(e,a,i){return`<div class="backup-stat-card">
    <div class="backup-stat-icon">${e}</div>
    <div class="backup-stat-label">${a}</div>
    <div class="backup-stat-value" id="bstat-${a.substring(0,3)}">${i}</div>
  </div>`}window.switchSettingsTab=(e,a)=>{document.querySelectorAll(".sett-nav-item").forEach(i=>i.classList.remove("active")),a.classList.add("active"),document.querySelectorAll(".settings-tab").forEach(i=>i.classList.add("hidden")),document.getElementById(`tab-${e}`)?.classList.remove("hidden")};async function j(){try{const e=await k(u(d,`companies/${l}/settings`,"company"));if(e.exists()){const s=e.data();t("co-name")&&(t("co-name").value=s.name||""),t("co-cr")&&(t("co-cr").value=s.cr||s.crNumber||""),t("co-vat")&&(t("co-vat").value=s.vatNumber||""),t("co-phone")&&(t("co-phone").value=s.phone||""),t("co-email")&&(t("co-email").value=s.email||""),t("co-street")&&(t("co-street").value=s.street||""),t("co-district")&&(t("co-district").value=s.district||""),t("co-building-no")&&(t("co-building-no").value=s.buildingNo||s.buildingNumber||""),t("co-additional-no")&&(t("co-additional-no").value=s.additionalNo||s.additionalNumber||""),t("co-city")&&(t("co-city").value=s.city||""),t("co-zip")&&(t("co-zip").value=s.zip||s.postalCode||""),t("co-country")&&(t("co-country").value=s.country||"المملكة العربية السعودية"),t("co-currency")&&(t("co-currency").value=s.currency||"SAR"),t("co-vat-rate")&&(t("co-vat-rate").value=s.vatRate||"15");const p=JSON.parse(localStorage.getItem("idham_company")||"{}");Object.assign(p,{name:s.name||"",crNumber:s.cr||s.crNumber||"",vatNumber:s.vatNumber||"",phone:s.phone||"",email:s.email||"",street:s.street||"",district:s.district||"",buildingNo:s.buildingNo||s.buildingNumber||"",additionalNo:s.additionalNo||s.additionalNumber||"",address:s.address||"",city:s.city||"",zip:s.zip||s.postalCode||"",country:s.country||"المملكة العربية السعودية",currency:s.currency||"SAR",vatRate:s.vatRate||"15"}),localStorage.setItem("idham_company",JSON.stringify(p)),window.ERP_COMPANY=p}const a=await k(u(d,`companies/${l}/settings`,"logo"));if(a.exists()&&a.data().dataUrl){F(a.data().dataUrl);const s=JSON.parse(localStorage.getItem("idham_company")||"{}");s.logoBase64=a.data().dataUrl,localStorage.setItem("idham_company",JSON.stringify(s)),window.ERP_COMPANY=s}const i=await k(u(d,`companies/${l}/settings`,"appearance"));if(i.exists()){const s=i.data();if(s.fontFamily&&selectFont(s.fontFamily,null,!1),s.fontSize&&(t("font-size-range").value=s.fontSize,updateFontSizeLabel(s.fontSize)),s.primaryColor){selectColor(s.primaryColor,null,!1);const p=JSON.parse(localStorage.getItem("idham_company")||"{}");p.primaryColor=s.primaryColor,localStorage.setItem("idham_company",JSON.stringify(p)),window.ERP_COMPANY=p}}const o=await k(u(d,`companies/${l}/settings`,"system"));if(o.exists()){const s=o.data();t("sys-inv-prefix")&&(t("sys-inv-prefix").value=s.invoicePrefix||"INV-"),t("sys-pur-prefix")&&(t("sys-pur-prefix").value=s.purchasePrefix||"PUR-"),t("sys-inv-seq")&&(t("sys-inv-seq").value=s.invoiceSequence||1),t("sys-due-days")&&(t("sys-due-days").value=s.defaultDueDays||30),t("sys-valuation-method")&&(t("sys-valuation-method").value=s.valuationMethod||"weighted_average"),t("sys-supervisor-pin")&&(t("sys-supervisor-pin").value=s.supervisorPIN||"1234"),t("sys-footer")&&(t("sys-footer").value=s.invoiceFooter||""),t("sys-enable-category-margins")&&(t("sys-enable-category-margins").checked=s.enableCategoryMargins??!1),t("sys-margin-fast")&&(t("sys-margin-fast").value=s.marginFast??5),t("sys-margin-medium")&&(t("sys-margin-medium").value=s.marginMedium??10),t("sys-margin-slow")&&(t("sys-margin-slow").value=s.marginSlow??15),t("sys-enable-cash-discount")&&(t("sys-enable-cash-discount").checked=s.enableCashDiscount??!1),t("sys-cash-discount-rate")&&(t("sys-cash-discount-rate").value=s.cashDiscountRate??1),t("sys-enable-volume-discount")&&(t("sys-enable-volume-discount").checked=s.enableVolumeDiscount??!1),t("sys-volume-discount-threshold")&&(t("sys-volume-discount-threshold").value=s.volumeDiscountThreshold??50),t("sys-volume-discount-rate")&&(t("sys-volume-discount-rate").value=s.volumeDiscountRate??2),t("sys-max-rep-discount")&&(t("sys-max-rep-discount").value=s.maxRepDiscount??3),t("sys-credit-block-policy")&&(t("sys-credit-block-policy").value=s.creditBlockPolicy||"block_with_pin")}const n=await k(u(d,`companies/${l}/settings`,"backup"));if(n.exists()){const s=n.data();t("auto-backup-freq")&&(t("auto-backup-freq").value=s.frequency||"daily")}await G()}catch(e){console.error("loadAllSettings:",e)}}window.saveCompanySettings=async()=>{const e=c("co-name");if(!e){t("co-error").textContent="اسم الشركة مطلوب",t("co-error").classList.remove("hidden");return}t("co-error").classList.add("hidden"),t("save-co-btn").disabled=!0;try{const a=c("co-street"),i=c("co-district"),o=c("co-city"),n=c("co-building-no"),s=c("co-zip"),p=c("co-additional-no"),v=c("co-country")||"المملكة العربية السعودية",m=[];n&&m.push(`مبنى ${n}`),a&&m.push(`شارع ${a}`),i&&m.push(`حي ${i}`),o&&m.push(o),s&&m.push(`رمز ${s}`);const g=m.length>0?m.join(" — "):"ينبع — المملكة العربية السعودية",r={name:e,cr:c("co-cr"),crNumber:c("co-cr"),vatNumber:c("co-vat"),phone:c("co-phone"),email:c("co-email"),street:a,district:i,buildingNo:n,buildingNumber:n,additionalNo:p,additionalNumber:p,address:g,city:o,zip:s,postalCode:s,country:v,currency:t("co-currency").value,vatRate:t("co-vat-rate").value,updatedAt:x()};await b(u(d,`companies/${l}/settings`,"company"),r,{merge:!0});const w=JSON.parse(localStorage.getItem("idham_company")||"{}");localStorage.setItem("idham_company",JSON.stringify({...w,...r,name:r.name,crNumber:r.cr,vatNumber:r.vatNumber,phone:r.phone,email:r.email,street:r.street,district:r.district,buildingNo:r.buildingNo,additionalNo:r.additionalNo,address:r.address,city:r.city,zip:r.zip,country:r.country,currency:r.currency,vatRate:r.vatRate})),window.ERP_COMPANY=JSON.parse(localStorage.getItem("idham_company"));const h=document.getElementById("co-cr-upload");if(h&&h.files.length>0){const N=h.files[0];window.uploadFileToArchive(N,"company_docs",l,"صورة السجل التجاري للشركة").catch(P=>console.warn(P))}const y=document.getElementById("co-tax-upload");if(y&&y.files.length>0){const N=y.files[0];window.uploadFileToArchive(N,"company_docs",l,"صورة الشهادة/البطاقة الضريبية للشركة").catch(P=>console.warn(P))}S("co-save-msg"),showToast("تم حفظ بيانات الشركة","success")}catch(a){t("co-error").textContent=a.message,t("co-error").classList.remove("hidden")}finally{t("save-co-btn").disabled=!1}};window.handleLogoUpload=e=>{const a=e.target.files[0];if(!a)return;if(a.size>2*1024*1024){showToast("حجم الشعار يتجاوز 2 ميجابايت","error");return}const i=new FileReader;i.onload=async o=>{const n=o.target.result;F(n);try{await b(u(d,`companies/${l}/settings`,"logo"),{dataUrl:n,updatedAt:x()},{merge:!0});const s=JSON.parse(localStorage.getItem("idham_company")||"{}");s.logoBase64=n,localStorage.setItem("idham_company",JSON.stringify(s)),window.ERP_COMPANY=s,S("logo-save-msg"),showToast("تم رفع الشعار وحفظه","success")}catch(s){showToast(s.message,"error")}},i.readAsDataURL(a)};function F(e){const a=t("logo-preview-img"),i=t("logo-empty-msg"),o=t("remove-logo-btn");a&&(a.src=e,a.style.display="block"),i&&(i.style.display="none"),o&&(o.style.display="")}window.removeLogo=async()=>{if(confirm("هل تريد حذف الشعار الحالي؟"))try{await b(u(d,`companies/${l}/settings`,"logo"),{dataUrl:"",updatedAt:x()},{merge:!0});const e=t("logo-preview-img"),a=t("logo-empty-msg"),i=t("remove-logo-btn");e&&(e.src="",e.style.display="none"),a&&(a.style.display=""),i&&(i.style.display="none"),showToast("تم حذف الشعار","success")}catch(e){showToast(e.message,"error")}};let $="IBM Plex Sans Arabic",z="#4f46e5";window.applyThemeFromSettings=e=>{if(typeof window.applyTheme=="function"&&window.applyTheme(e),document.querySelectorAll(".sett-theme-card").forEach(a=>{a.classList.toggle("active",a.dataset.theme===e)}),typeof showToast=="function"){const a={dark:"Dark Space 🌌","dark-cyan":"Ocean Depth 🌊","dark-gold":"Premium Gold ✨",light:"Classic Light ☀️","light-blue":"Clear Sky 🔵","light-green":"Fresh Emerald 🌿"};showToast(`تم تطبيق ثيم: ${a[e]||e}`,"success")}};function J(){const e=localStorage.getItem("idham_theme")||"dark";document.querySelectorAll(".sett-theme-card").forEach(a=>{a.classList.toggle("active",a.dataset.theme===e)})}function U(){const e=["Tajawal","Cairo","Almarai","Noto Sans Arabic"],a=document.createElement("link");a.rel="stylesheet",a.href=`https://fonts.googleapis.com/css2?family=${e.map(i=>i.replace(/ /,"+")+":wght@400;700").join("&family=")}&display=swap`,document.head.appendChild(a)}function H(){try{const e=JSON.parse(localStorage.getItem("idham_appearance")||"{}");e.fontFamily&&(document.documentElement.style.setProperty("--font-body",`'${e.fontFamily}', sans-serif`),document.documentElement.style.setProperty("--font-heading",`'${e.fontFamily}', sans-serif`),document.body.style.fontFamily=`'${e.fontFamily}', sans-serif`),e.fontSize&&(document.documentElement.style.setProperty("--font-size-base",e.fontSize+"px"),document.body.style.fontSize=e.fontSize+"px"),e.primaryColor&&(document.documentElement.style.setProperty("--primary",e.primaryColor),document.documentElement.style.setProperty("--primary-dim",e.primaryColor+"22"),document.documentElement.style.setProperty("--primary-glow",e.primaryColor+"55"))}catch{}}window.selectFont=(e,a,i=!0)=>{$=e,document.querySelectorAll(".font-card").forEach(n=>n.classList.toggle("selected",n.dataset.font===e));const o=t("font-preview");o&&(o.style.fontFamily=`'${e}', sans-serif`),document.documentElement.style.setProperty("--font-body",`'${e}', sans-serif`),document.documentElement.style.setProperty("--font-heading",`'${e}', sans-serif`),document.body.style.fontFamily=`'${e}', sans-serif`,R()};window.updateFontSizeLabel=e=>{const a=t("font-size-label");a&&(a.textContent=e+"px"),document.documentElement.style.setProperty("--font-size-base",e+"px"),document.body.style.fontSize=e+"px",R()};window.selectColor=(e,a,i=!0)=>{z=e,document.querySelectorAll(".color-swatch").forEach(o=>o.classList.toggle("selected",o.dataset.color===e)),document.documentElement.style.setProperty("--primary",e),document.documentElement.style.setProperty("--primary-dim",e+"22"),document.documentElement.style.setProperty("--primary-glow",e+"55"),R()};function R(){const e=t("font-size-range")?.value||"14";localStorage.setItem("idham_appearance",JSON.stringify({fontFamily:$,fontSize:e,primaryColor:z}))}window.saveAppearanceSettings=async()=>{try{const e=t("font-size-range")?.value||"14";localStorage.setItem("idham_appearance",JSON.stringify({fontFamily:$,fontSize:e,primaryColor:z})),H(),await b(u(d,`companies/${l}/settings`,"appearance"),{fontFamily:$,fontSize:e,primaryColor:z,updatedAt:x()},{merge:!0}),S("fonts-save-msg"),showToast("✅ تم حفظ إعدادات المظهر وتطبيقها على كامل النظام","success")}catch(e){showToast(e.message,"error")}};window.saveZATCASettings=async()=>{try{await b(u(d,`companies/${l}/settings`,"zatca"),{environment:t("zatca-env").value,deviceSerial:c("zatca-device"),csid:c("zatca-csid"),pcsid:c("zatca-pcsid"),privateKey:c("zatca-key"),updatedAt:x()},{merge:!0}),showToast("تم حفظ إعدادات ZATCA","success")}catch(e){showToast(e.message,"error")}};window.testZATCAConnection=async()=>{const e=t("zatca-test-result");e.innerHTML='<div class="page-loading" style="padding:12px;"><div class="loading-spinner"></div><span>جارٍ الاختبار…</span></div>',e.classList.remove("hidden");try{const a=t("zatca-env").value,o=await fetch(`${a==="production"?"https://gw-fatoora.zatca.gov.sa/e-invoicing/core":"https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation"}/health`);e.innerHTML=o.ok?`<div class="alert good">✅ الاتصال بـ ZATCA يعمل بنجاح (${a})</div>`:`<div class="alert warn">⚠️ البيئة متاحة لكن الرد: ${o.status}</div>`}catch{e.innerHTML='<div class="alert info">ℹ️ اختبار الاتصال يتطلب شهادة CSID صحيحة. تأكد من الإعدادات.</div>'}};window.saveSystemSettings=async()=>{try{await b(u(d,`companies/${l}/settings`,"system"),{invoicePrefix:c("sys-inv-prefix"),purchasePrefix:c("sys-pur-prefix"),invoiceSequence:parseInt(t("sys-inv-seq").value)||1,defaultDueDays:parseInt(t("sys-due-days").value)||30,valuationMethod:t("sys-valuation-method").value,supervisorPIN:c("sys-supervisor-pin")||"1234",invoiceFooter:c("sys-footer"),updatedAt:x()},{merge:!0}),S("sys-save-msg"),showToast("تم حفظ إعدادات النظام","success")}catch(e){showToast(e.message,"error")}};window.savePricingSettings=async()=>{const e=document.getElementById("save-pricing-btn");e.disabled=!0;try{const a={enableCategoryMargins:t("sys-enable-category-margins").checked,marginFast:parseFloat(t("sys-margin-fast").value)||0,marginMedium:parseFloat(t("sys-margin-medium").value)||0,marginSlow:parseFloat(t("sys-margin-slow").value)||0,enableCashDiscount:t("sys-enable-cash-discount").checked,cashDiscountRate:parseFloat(t("sys-cash-discount-rate").value)||0,enableVolumeDiscount:t("sys-enable-volume-discount").checked,volumeDiscountThreshold:parseInt(t("sys-volume-discount-threshold").value)||0,volumeDiscountRate:parseFloat(t("sys-volume-discount-rate").value)||0,maxRepDiscount:parseFloat(t("sys-max-rep-discount").value)||0,creditBlockPolicy:t("sys-credit-block-policy").value,updatedAt:x()};await b(u(d,`companies/${l}/settings`,"system"),a,{merge:!0});const i=JSON.parse(localStorage.getItem("idham_company")||"{}");i.pricing=a,localStorage.setItem("idham_company",JSON.stringify(i)),window.ERP_COMPANY=i,S("pricing-save-msg"),showToast("تم حفظ سياسات التسعير والخصم بنجاح","success")}catch(a){showToast(a.message,"error")}finally{e.disabled=!1}};async function Z(){try{const e=["journalEntries","customers","products"],a=await Promise.all(e.map(o=>E(I(d,`companies/${l}/${o}`)))),i=document.querySelectorAll(".backup-stat-value");i[0]&&(i[0].textContent=a[0].size),i[1]&&(i[1].textContent=a[1].size),i[2]&&(i[2].textContent=a[2].size)}catch(e){console.warn("loadBackupStats:",e)}}async function B(){try{const e=await k(u(d,`companies/${l}/settings`,"backup"));if(e.exists()&&e.data().lastBackup){const a=e.data().lastBackup.toDate?.()||new Date(e.data().lastBackup),i=t("last-backup-info");i&&(i.innerHTML=`<span>✅ ${a.toLocaleDateString("ar-SA")} — ${a.toLocaleTimeString("ar-SA")}</span>`)}}catch{}}window.createBackup=async()=>{const e=t("backup-btn"),a=t("backup-spinner"),i=t("backup-status");e.disabled=!0,a.classList.remove("hidden"),i.textContent="جارٍ جمع البيانات…";try{const o=["chartOfAccounts","journalEntries","customers","suppliers","products","warehouses","salesInvoices","purchaseInvoices","salesReturns","purchaseReturns","receipts","expenses","cheques","cashBoxes","bankAccounts","salesReps","priceLists","costCenters","employees","payrolls","employeeLoans","employeeLeaves","employeeAttendance","employeeSettlements","stockLedger","stockTransfers","inventoryAdjustments","physicalCounts","goodsReceiptPOs","quotations","purchaseRequests","purchaseOrders","users","counters","categories","units","locations","cashTransactions","bankTransactions","productAssemblies","qualityInspections","stockByWarehouse","stockTransactions","purchases","repInvoices","collections","archivedFiles","auditTrails"],n={version:"3.0",createdAt:new Date().toISOString(),company:l,data:{}};for(const g of o){i.textContent=`جارٍ تصدير: ${g}…`;const r=await E(I(d,`companies/${l}/${g}`));n.data[g]=r.docs.map(w=>({id:w.id,...w.data()}))}const s=["company","logo","appearance","system","zatca","backup"];n.settings={};for(const g of s){const r=await k(u(d,`companies/${l}/settings`,g));r.exists()&&(n.settings[g]=r.data())}const p=new Blob([JSON.stringify(n,null,2)],{type:"application/json"}),v=URL.createObjectURL(p),m=document.createElement("a");m.href=v,m.download=`idham-erp-backup-${new Date().toISOString().split("T")[0]}.json`,m.click(),URL.revokeObjectURL(v),await b(u(d,`companies/${l}/settings`,"backup"),{lastBackup:new Date().toISOString(),frequency:t("auto-backup-freq")?.value||"daily"},{merge:!0}),i.textContent="✅ تم التنزيل بنجاح!",showToast("تم إنشاء النسخة الاحتياطية وتنزيلها","success"),B()}catch(o){i.textContent="❌ خطأ: "+o.message,showToast(o.message,"error")}finally{e.disabled=!1,a.classList.add("hidden")}};let T=null;window.handleRestoreFile=e=>{const a=e.target.files[0];a&&D(a)};window.handleRestoreDrop=e=>{e.preventDefault(),t("restore-dropzone").style.borderColor="var(--border)";const a=e.dataTransfer.files[0];a&&D(a)};function D(e){const a=new FileReader;a.onload=i=>{try{const o=JSON.parse(i.target.result);T=o;const n=t("restore-preview"),s=t("restore-preview-content");n&&s&&(s.innerHTML=`
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            <div>📅 <strong>تاريخ النسخة:</strong> ${o.createdAt||"غير معروف"}</div>
            <div>🔖 <strong>الإصدار:</strong> ${o.version||"قديم"}</div>
            ${(()=>{const p={chartOfAccounts:"شجرة الحسابات",journalEntries:"قيود اليومية",customers:"العملاء",suppliers:"الموردين",products:"كتالوج الأصناف",warehouses:"المستودعات والمخازن",salesInvoices:"فواتير المبيعات",purchaseInvoices:"فواتير المشتريات",salesReturns:"مرتجع المبيعات",purchaseReturns:"مرتجع المشتريات",receipts:"سندات القبض والصرف",expenses:"سندات المصروفات",cheques:"إدارة الشيكات",cashBoxes:"الصناديق النقدية",bankAccounts:"الحسابات البنكية",salesReps:"المناديب",priceLists:"قوائم الأسعار",costCenters:"مراكز التكلفة",employees:"سجلات الموظفين",payrolls:"مسيرات الرواتب",employeeLoans:"سلف الموظفين",employeeLeaves:"إجازات الموظفين",employeeAttendance:"حضور وانصراف الموظفين",employeeSettlements:"تصفية الموظفين",stockLedger:"دفتر أستاذ المخزون (كرت الصنف)",stockTransfers:"تحويلات المخزون",inventoryAdjustments:"تسويات المخزون",physicalCounts:"عمليات الجرد الفعلي",goodsReceiptPOs:"سندات استلام البضائع",quotations:"عروض الأسعار",purchaseRequests:"طلبات الشراء",purchaseOrders:"أوامر الشراء",users:"حسابات المستخدمين",counters:"عدادات الفواتير والسندات",categories:"فئات الأصناف",units:"وحدات القياس",locations:"مواقع وأرفف المستودعات",cashTransactions:"حركات الصناديق النقدية",bankTransactions:"حركات الحسابات البنكية",productAssemblies:"تجميع المنتجات",qualityInspections:"فحص الجودة",stockByWarehouse:"المخزون حسب المستودع",stockTransactions:"عمليات حركة المخازن",purchases:"طلبات المشتريات العامة",repInvoices:"فواتير المناديب",collections:"التحصيلات والتحققات",archivedFiles:"الملفات المؤرشفة",auditTrails:"سجل العمليات والتدقيق"};return Object.entries(o.data||{}).map(([v,m])=>`<div>📦 <strong>${p[v]||v}:</strong> ${Array.isArray(m)?m.length+" سجل":"—"}</div>`).join("")})()}
          </div>`,n.classList.remove("hidden"))}catch(o){showToast("ملف JSON غير صحيح: "+o.message,"error")}},a.readAsText(e)}window.confirmRestore=async()=>{if(!T||!confirm("⚠️ هذا الإجراء سيستبدل البيانات الحالية. هل أنت متأكد؟"))return;const e=t("restore-confirm-btn");e.disabled=!0,e.textContent="⏳ جارٍ الاستعادة…";const a=t("restore-status");a.classList.remove("hidden");try{for(const[i,o]of Object.entries(T.data||{})){a.innerHTML=`<div class="alert info">جارٍ استعادة: ${i} (${o.length} سجل)…</div>`;for(const n of o){const{id:s,...p}=n;await b(u(d,`companies/${l}/${i}`,s),p,{merge:!0})}}a.innerHTML=`<div class="alert good">✅ تمت استعادة ${Object.keys(T.data||{}).length} مجموعات بنجاح</div>`,showToast("تمت الاستعادة بنجاح","success")}catch(i){a.innerHTML=`<div class="alert bad">❌ خطأ: ${i.message}</div>`,showToast(i.message,"error")}finally{e.disabled=!1,e.textContent="⚠️ تأكيد الاستعادة"}};window.cancelRestore=()=>{T=null,t("restore-preview")?.classList.add("hidden"),t("restore-file-input")&&(t("restore-file-input").value="")};window.saveBackupSchedule=async()=>{try{await b(u(d,`companies/${l}/settings`,"backup"),{frequency:t("auto-backup-freq").value,updatedAt:x()},{merge:!0}),S("backup-schedule-msg"),showToast("تم حفظ جدول النسخ الاحتياطي","success")}catch(e){showToast(e.message,"error")}};function S(e,a=3e3){const i=t(e);i&&(i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),a))}async function G(){try{const e=await O(),a=t("map-cust-enabled");a&&(a.checked=e.customers?.enabled??!0);const i=t("map-supp-enabled");i&&(i.checked=e.suppliers?.enabled??!0);const o=t("map-bank-enabled");o&&(o.checked=e.banks?.enabled??!0);const n=t("map-cash-enabled");n&&(n.checked=e.cashBoxes?.enabled??!0);const p=(await E(_(I(d,`companies/${l}/chartOfAccounts`),q("code")))).docs.map(h=>({id:h.id,...h.data()})),v=h=>'<option value="">اختر الحساب...</option>'+p.map(y=>`<option value="${y.code}" ${y.code===h?"selected":""}>${y.code} - ${y.name} (${y.type==="asset"?"أصول":y.type==="liability"?"خصوم":y.type==="equity"?"حقوق ملكية":y.type==="revenue"?"إيرادات":"مصروفات"})</option>`).join(""),m=t("map-cust-parent");m&&(m.innerHTML=v(e.customers?.parentCode));const g=t("map-supp-parent");g&&(g.innerHTML=v(e.suppliers?.parentCode));const r=t("map-bank-parent");r&&(r.innerHTML=v(e.banks?.parentCode));const w=t("map-cash-parent");w&&(w.innerHTML=v(e.cashBoxes?.parentCode))}catch(e){console.error("loadCoaMappingSettings error:",e)}}window.saveCoaMappingSettings=async()=>{const e=t("save-coa-mapping-btn");e&&(e.disabled=!0,e.textContent="⏳ جارٍ الحفظ…");try{const a={customers:{enabled:t("map-cust-enabled").checked,parentCode:t("map-cust-parent").value,numbering:"seq"},suppliers:{enabled:t("map-supp-enabled").checked,parentCode:t("map-supp-parent").value,numbering:"seq"},banks:{enabled:t("map-bank-enabled").checked,parentCode:t("map-bank-parent").value,numbering:"seq"},cashBoxes:{enabled:t("map-cash-enabled").checked,parentCode:t("map-cash-parent").value,numbering:"seq"}};await M(a),S("coa-mapping-save-msg"),window.showToast?.("تم حفظ إعدادات ربط الحسابات بنجاح","success")}catch(a){window.showToast?.(a.message,"error")}finally{e&&(e.disabled=!1,e.textContent="💾 حفظ إعدادات ربط الحسابات")}};export{H as applyAppearanceFromStorage,te as render};
