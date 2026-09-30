import{g as p,f as i,o as v,D as u,x as w,r as h}from"./index-DaYejt0r.js";import{s as x}from"./helpers-Chx_zDkR.js";import{orderBy as b}from"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";import"https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js";let r=[],m=[],y=[],d=[];async function j(e,t){const n=e||document.getElementById("main-content");n&&(n.innerHTML=`
    <div class="page-container" style="padding:20px 24px; animation: fadeIn 0.3s ease;">
      
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="width:44px; height:44px; border-radius:12px; background:linear-gradient(135deg, #F59E0B, #D97706); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; box-shadow:0 4px 12px rgba(245,158,11,0.25);">
            🍱
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:900; margin:0; color:var(--text-0);">عروض الباكجات وتجميع/تفكيك الوحدات الغذائية</h2>
            <p style="margin:2px 0 0; font-size:12.5px; color:var(--text-2);">تصميم الحزم الترويجية • التجميع الآلي (Kitting) • تجزئة الكراتين إلى حبات وتحديث التكلفة</p>
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.openNewBundleModal()" style="display:flex; align-items:center; gap:6px; font-weight:800; padding:9px 18px; border-radius:10px; background:linear-gradient(135deg,#F59E0B,#D97706);">
            <span>➕</span> <span>إنشاء بكج / عرض مركب جديد</span>
          </button>
        </div>
      </div>

      <div id="bundles-grid-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:16px;">
        <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-2);">⏳ جارٍ تحميل عروض الباكجات…</div>
      </div>

    </div>

    <!-- NEW BUNDLE MODAL -->
    <div class="modal-overlay" id="bundle-modal" style="display:none;" onclick="if(event.target===this)window.closeBundleModal()">
      <div class="modal modal-lg" style="max-width:800px; width:95%; max-height:92vh; display:flex; flex-direction:column; padding:0; border-radius:18px; overflow:hidden; background:var(--bg-1);">
        <div class="modal-header" style="padding:16px 20px; border-bottom:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0; font-size:16px; font-weight:900; color:var(--text-0);">🍱 إنشاء بكج أو عرض ترويجي مركب</h3>
          <button class="modal-close" onclick="window.closeBundleModal()">×</button>
        </div>

        <div class="modal-body" style="padding:20px; overflow-y:auto; flex:1; background:var(--bg-3);">
          <div class="card" style="padding:16px; border-radius:12px; margin-bottom:14px; background:var(--bg-card);">
            <div class="grid-2 gap-12 mb-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">اسم البكج أو العرض *</label>
                <input type="text" id="bundle-name" class="form-control font-bold" placeholder="مثال: بكج التوفير الرمضاني 4 قطع" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">كود العرض (SKU)</label>
                <input type="text" id="bundle-sku" class="form-control mono font-bold" placeholder="BDL-RAMADAN-01" />
              </div>
            </div>

            <div class="grid-2 gap-12">
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">سعر بيع البكج للعميل (ر.س) *</label>
                <input type="number" id="bundle-price" class="form-control mono font-bold text-good" placeholder="0.00" min="0" step="0.5" />
              </div>
              <div class="form-group">
                <label style="font-size:11.5px; font-weight:700;">وصف ومميزات العرض</label>
                <input type="text" id="bundle-notes" class="form-control" placeholder="أرز + زيت + سكر بسعر مخفض" />
              </div>
            </div>
          </div>

          <div class="card" style="padding:16px; border-radius:12px; background:var(--bg-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <strong style="font-size:13px; color:var(--text-0);">📦 الأصناف المكونة للبكج</strong>
              <select id="bundle-add-prod-select" class="form-control" style="width:280px; font-size:12px;" onchange="window.addComponentToBundle(this.value)">
                <option value="">+ أضف مكوناً للبكج…</option>
              </select>
            </div>

            <div class="table-container" style="max-height:220px; overflow-y:auto;">
              <table class="data-dense" style="margin:0; font-size:12px;">
                <thead>
                  <tr style="background:var(--bg-3);">
                    <th>اسم الصنف المكون</th>
                    <th style="width:80px; text-align:center;">الكمية بالبكج</th>
                    <th style="width:100px; text-align:left;">التكلفة الفردية</th>
                    <th style="width:100px; text-align:left;">إجمالي التكلفة</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody id="bundle-components-tbody">
                  <tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-2);">أضف المكونات من القائمة أعلاه</td></tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding:10px 14px; background:var(--bg-2); border-radius:10px;">
              <span style="font-size:12px; color:var(--text-2);">إجمالي تكلفة المكونات: <b id="bundle-total-cost" class="mono text-warn">0.00 ر.س</b></span>
              <span style="font-size:12.5px; font-weight:800; color:var(--brand);">هامش ربح البكج المتوقع: <b id="bundle-profit-margin" class="mono text-good">0.00 ر.س (0%)</b></span>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-soft); background:var(--bg-card); display:flex; justify-content:space-between;">
          <button class="btn btn-ghost" onclick="window.closeBundleModal()">إلغاء</button>
          <button class="btn btn-primary" onclick="window.saveBundle()" style="padding:8px 22px; font-weight:800; background:linear-gradient(135deg,#F59E0B,#D97706);">
            💾 حفظ البكج
          </button>
        </div>
      </div>
    </div>
  `,await g())}async function g(){try{const[e,t,n]=await Promise.all([p("productBundles",[b("createdAt","desc")]).catch(()=>[]),p("products",[b("name")]).catch(()=>[]),p("warehouses").catch(()=>[])]);r=e,m=t,y=n,B()}catch(e){console.error("loadBundleData error:",e)}}function B(){const e=document.getElementById("bundles-grid-container");if(e){if(!r.length){e.innerHTML=`
      <div style="grid-column: 1/-1; text-align:center; padding:50px; background:var(--bg-card); border-radius:16px; border:1px dashed var(--border-soft);">
        <div style="font-size:36px; margin-bottom:8px;">🍱</div>
        <b style="font-size:15px; color:var(--text-0);">لا توجد حزم أو باكجات مجهزة حالياً</b>
        <p style="color:var(--text-2); font-size:12px; margin:4px 0 16px;">قم بإنشاء عروض ترويجية مركبة لتسريع دوران البضائع ورفع قيمة فواتير المبيعات</p>
        <button class="btn btn-primary btn-sm" onclick="window.openNewBundleModal()">+ إنشاء أول بكج</button>
      </div>
    `;return}e.innerHTML=r.map(t=>`
    <div class="card" style="padding:16px; border-radius:14px; border:1px solid var(--border-soft); background:var(--bg-card); display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="margin:0; font-size:15px; font-weight:800; color:var(--text-0);">${t.name}</h4>
            <span class="mono" style="font-size:11px; color:var(--brand); font-weight:bold;">${t.sku||"BDL"}</span>
          </div>
          <span class="badge good" style="font-size:13px; font-weight:900;">${i(t.sellingPrice)}</span>
        </div>

        <div style="margin:12px 0; padding:10px; background:var(--bg-2); border-radius:8px; font-size:11.5px;">
          <div style="font-weight:700; color:var(--text-2); margin-bottom:4px;">مكونات البكج:</div>
          ${(t.components||[]).map(n=>`
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>• ${n.productName}</span>
              <b class="mono">${n.qty} ${n.unit||""}</b>
            </div>
          `).join("")}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-soft); padding-top:10px;">
        <span style="font-size:11px; color:var(--text-2);">التكلفة: <b>${i(t.totalCost||0)}</b></span>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-primary btn-sm" style="font-size:11px; padding:4px 10px; background:#10B981;" onclick="window.executeKitting('${t.id}')">⚡ تجميع فوري</button>
          <button class="btn btn-ghost sm" style="color:var(--bad);" onclick="window.deleteBundle('${t.id}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join("")}}window.openNewBundleModal=()=>{d=[],document.getElementById("bundle-name").value="",document.getElementById("bundle-sku").value="BDL-"+Date.now().toString().slice(-5),document.getElementById("bundle-price").value="",document.getElementById("bundle-notes").value="";const e=document.getElementById("bundle-add-prod-select");e&&(e.innerHTML='<option value="">+ أضف مكوناً للبكج…</option>'+m.map(t=>`<option value="${t.id}">${t.name} (${i(t.costPrice||0)})</option>`).join("")),c(),document.getElementById("bundle-modal").style.display="flex"};window.closeBundleModal=()=>{document.getElementById("bundle-modal").style.display="none"};window.addComponentToBundle=e=>{if(!e)return;const t=m.find(o=>o.id===e);if(!t)return;const n=d.find(o=>o.productId===e);n?n.qty+=1:d.push({productId:t.id,productName:t.name,unit:t.unit||"حبة",qty:1,costPrice:t.avgCostPrice||t.costPrice||0}),document.getElementById("bundle-add-prod-select").value="",c()};function c(){const e=document.getElementById("bundle-components-tbody");if(!e)return;let t=0;d.length?e.innerHTML=d.map((n,o)=>{const l=n.qty*n.costPrice;return t+=l,`
        <tr style="border-bottom:1px solid var(--border-soft);">
          <td class="font-bold">${n.productName}</td>
          <td style="text-align:center;">
            <input type="number" class="form-control mono font-bold" style="width:65px; height:26px; text-align:center;" value="${n.qty}" min="1" onchange="window.updateBundleCompQty(${o}, this.value)" />
          </td>
          <td class="mono">${i(n.costPrice)}</td>
          <td class="mono font-bold text-warn">${i(l)}</td>
          <td style="text-align:center;">
            <button class="btn btn-ghost sm" style="color:var(--bad);" onclick="window.removeBundleComp(${o})">✕</button>
          </td>
        </tr>
      `}).join(""):e.innerHTML='<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-2);">أضف المكونات من القائمة أعلاه</td></tr>',document.getElementById("bundle-total-cost").textContent=i(t)}window.updateBundleCompQty=(e,t)=>{d[e]&&(d[e].qty=parseFloat(t)||1,c())};window.removeBundleComp=e=>{d.splice(e,1),c()};window.saveBundle=async()=>{const e=document.getElementById("bundle-name")?.value.trim(),t=document.getElementById("bundle-sku")?.value.trim(),n=parseFloat(document.getElementById("bundle-price")?.value)||0,o=document.getElementById("bundle-notes")?.value.trim()||"";if(!e){alert("يرجى إدخال اسم البكج");return}if(n<=0){alert("يرجى إدخال سعر بيع البكج");return}if(!d.length){alert("أضف مكوناً واحداً على الأقل");return}const l=d.reduce((a,s)=>a+s.qty*s.costPrice,0);try{await v("productBundles",{name:e,sku:t,sellingPrice:n,totalCost:l,components:d,notes:o,createdAt:new Date().toISOString()}),window.closeBundleModal(),u("✅ تم حفظ البكج بنجاح","success"),await g()}catch(a){alert(a.message)}};window.executeKitting=async e=>{const t=r.find(a=>a.id===e);if(!t)return;const n=prompt(`كم عدد بكجات "${t.name}" التي تريد تجميعها وتجهيزها في المستودع؟`,"10"),o=parseInt(n);if(!o||o<=0)return;const l=y[0];if(!l){alert("لا توجد مستودعات متاحة");return}if(await x(`سيتم خصم مكونات ${o} بكج من مستودع ${l.name} وإضافة المنتج المجمع. متابعة؟`,"تأكيد التجميع"))try{for(const a of t.components||[]){const s=a.qty*o;await w(l.id,a.productId,-s,{type:"kitting_component_deduct",notes:`تجميع ${o} من بكج: ${t.name}`}).catch(f=>console.warn(f))}u(`✅ تم تجميع وتجهيز ${o} بكج بنجاح في المستودع!`,"success")}catch(a){alert(a.message)}};window.deleteBundle=async e=>{await x("هل تريد حذف هذا البكج؟","تأكيد الحذف")&&(await h("productBundles",e),u("تم الحذف","success"),await g())};export{j as render};
