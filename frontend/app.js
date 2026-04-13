// ── State ──
let employees=[], departments=[], attendanceData=[], leaves=[];
let performances=[], trainings=[], documents=[];
let currentPage={};
let currentTheme=localStorage.getItem('wfh_theme')||'light';
let empView=localStorage.getItem('wfh_empview')||'table';

// ── Init ──
function initApp(){
  applyTheme(currentTheme);
  initNav();
  initThemeToggle();
  loadDashboard();
  loadEmployees();
  loadDepartments().then(()=>{populateReportDepts();populatePayrollEmps();});
  loadAttendance();
  loadLeaves();
  loadPerformances();
  loadTrainings();
  loadDocuments();
  loadAnalytics();
  setupButtons();
  setEmpView(empView,false);
}

// ── Nav ──
const pageNames={dashboard:'Dashboard',employees:'Employees',departments:'Departments',attendance:'Attendance',leaves:'Leaves',performance:'Performance',trainings:'Trainings',documents:'Documents',reports:'Reports',analytics:'Analytics',payroll:'Payroll'};
function initNav(){
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click',()=>{
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(p=>p.style.display='none');
      const el=document.getElementById('page-'+item.dataset.page);
      if(el){el.style.display='block';}
      document.getElementById('topbarTitle').textContent=pageNames[item.dataset.page]||item.dataset.page;
      document.getElementById('topbarSubtitle').textContent=new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
      if(window.innerWidth<=900) closeSidebar();
    });
  });
}

// ── Sidebar mobile ──
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');}
document.addEventListener('click',e=>{if(window.innerWidth<=900&&!e.target.closest('.sidebar')&&!e.target.closest('#sidebarToggle'))closeSidebar();});

// ── Theme ──
function initThemeToggle(){document.getElementById('themeToggleBtn').addEventListener('click',()=>{currentTheme=currentTheme==='light'?'dark':'light';applyTheme(currentTheme);localStorage.setItem('wfh_theme',currentTheme);});}
function applyTheme(t){document.documentElement.setAttribute('data-theme',t);const btn=document.getElementById('themeToggleBtn');if(btn)btn.textContent=t==='light'?'\u{1F319}':'\u2600\uFE0F';}

// ── Toast ──
function toast(msg,type='info'){
  const c=document.getElementById('toastContainer');
  const el=document.createElement('div');
  el.className='toast '+type;
  const icons={success:'&#9989;',error:'&#10060;',info:'&#8505;'};
  el.innerHTML=`<span class="toast-icon">${icons[type]||icons.info}</span>${msg}`;
  c.appendChild(el);
  setTimeout(()=>{el.style.animation='slideInRight .2s ease reverse';setTimeout(()=>el.remove(),200);},3200);
}

// ── Confirm ──
function confirm(msg,cb){
  document.getElementById('confirmMessage').textContent=msg;
  document.getElementById('confirmOkBtn').onclick=()=>{closeModal('confirmModal');cb();};
  openModal('confirmModal');
}

// ── Modals ──
function openModal(id){document.getElementById(id).classList.add('open');}
function closeModal(id){document.getElementById(id).classList.remove('open');}
window.addEventListener('click',e=>{if(e.target.classList.contains('modal-overlay'))e.target.classList.remove('open');});

// ── Pagination ──
function renderPagination(containerId,total,page,limit,onPage){
  const pages=Math.ceil(total/limit);
  const el=document.getElementById(containerId);
  if(!el)return;
  if(pages<=1){el.innerHTML='';return;}
  let html=`<span class="page-info">${total} total &bull; Page ${page}/${pages}</span>`;
  html+=`<button class="btn btn-ghost btn-sm" ${page<=1?'disabled':''} onclick="(${onPage})(${page-1})">&#8592; Prev</button>`;
  for(let i=Math.max(1,page-2);i<=Math.min(pages,page+2);i++){
    html+=`<button class="btn btn-sm ${i===page?'btn-primary':'btn-ghost'}" onclick="(${onPage})(${i})">${i}</button>`;
  }
  html+=`<button class="btn btn-ghost btn-sm" ${page>=pages?'disabled':''} onclick="(${onPage})(${page+1})">Next &#8594;</button>`;
  el.innerHTML=html;
}

// ── Employee select helper ──
function populateEmployeeSelect(selectId,selected=''){
  const sel=document.getElementById(selectId);
  if(!sel)return;
  sel.innerHTML='<option value="">Select employee</option>'+employees.map(e=>`<option value="${e._id}" ${e._id===selected?'selected':''}>${e.name} — ${e.position}</option>`).join('');
}

// ── Setup buttons ──
function setupButtons(){
  document.getElementById('addEmployeeBtn').onclick=()=>openEmployeeModal();
  document.getElementById('addDeptBtn').onclick=()=>openDeptModal();
  document.getElementById('addAttendanceBtn').onclick=()=>openAttendanceModal();
  document.getElementById('addLeaveBtn').onclick=()=>openModal('leaveModal');
  document.getElementById('addPerfBtn').onclick=()=>openPerfModal();
  document.getElementById('addTrainingBtn').onclick=()=>openTrainingModal();
  document.getElementById('addDocBtn').onclick=()=>openDocModal();
  if(isManagerOrAdmin())document.getElementById('addPerfBtn').style.display='inline-flex';
  let st;
  document.getElementById('empSearch').addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>loadEmployees(1),300);});
  document.getElementById('empDeptFilter').addEventListener('change',()=>loadEmployees(1));
}

// ── Employee view toggle ──
function setEmpView(v,save=true){
  empView=v;
  if(save)localStorage.setItem('wfh_empview',v);
  document.getElementById('empTableCard').style.display=v==='table'?'block':'none';
  document.getElementById('empCardsContainer').style.display=v==='cards'?'block':'none';
  document.getElementById('empViewTable').classList.toggle('active',v==='table');
  document.getElementById('empViewCards').classList.toggle('active',v==='cards');
}

// ── Helpers ──
function fmtSalary(n){return n?'$'+Number(n).toLocaleString():'—';}
function fmtDate(d){if(!d)return'—';try{return new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}catch{return d;}}
function calcDuration(ci,co){if(!ci||!co)return'—';const[h1,m1]=ci.split(':').map(Number);const[h2,m2]=co.split(':').map(Number);const mins=(h2*60+m2)-(h1*60+m1);if(mins<=0)return'—';return`${Math.floor(mins/60)}h ${mins%60}m`;}
function leaveDays(s,e){if(!s||!e)return'';const d=Math.round((new Date(e)-new Date(s))/(1000*60*60*24))+1;return`${d} day${d!==1?'s':''}`;}
function initials(name){return name?name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):'?';}
function avatarColor(name){const colors=['#667eea','#764ba2','#f093fb','#4facfe','#43e97b','#fa709a','#fee140','#30cfd0'];let h=0;for(let c of(name||''))h=(h*31+c.charCodeAt(0))%colors.length;return colors[h];}

// ── Dashboard ──
async function loadDashboard(){
  try{
    const res=await fetch(API+'/dashboard/stats');
    const data=await res.json();
    if(!data.success)return;
    const d=data.data;
    document.getElementById('dashStats').innerHTML=`
      <div class="stat-card"><div class="stat-icon blue">&#128101;</div><div class="stat-info"><div class="value">${d.totalEmployees}</div><div class="label">Total Employees</div></div></div>
      <div class="stat-card"><div class="stat-icon purple">&#127970;</div><div class="stat-info"><div class="value">${d.totalDepartments}</div><div class="label">Departments</div></div></div>
      <div class="stat-card"><div class="stat-icon green">&#9989;</div><div class="stat-info"><div class="value">${d.todayAttendance.present}</div><div class="label">Present Today</div></div></div>
      <div class="stat-card"><div class="stat-icon red">&#10060;</div><div class="stat-info"><div class="value">${d.todayAttendance.absent}</div><div class="label">Absent Today</div></div></div>
      <div class="stat-card"><div class="stat-icon orange">&#11088;</div><div class="stat-info"><div class="value">${d.avgRating||'—'}</div><div class="label">Avg Performance</div></div></div>`;
    const total=d.totalEmployees||1;
    const depts=d.deptDistribution||[];
    document.getElementById('deptChart').innerHTML=depts.length
      ?'<div class="bar-chart">'+depts.map(item=>{const[name,count]=Object.entries(item)[0];return`<div class="bar-row"><span class="bar-label" title="${name}">${name}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/total*100)}%"></div></div><span class="bar-count">${count}</span></div>`;}).join('')+'</div>'
      :'<p class="text-muted" style="text-align:center;padding:20px">No department data yet</p>';
    const att=d.todayAttendance,attTotal=att.present+att.absent+att.leave||1;
    document.getElementById('todayAttChart').innerHTML=`<div class="bar-chart">
      <div class="bar-row"><span class="bar-label">Present</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(att.present/attTotal*100)}%;background:var(--success)"></div></div><span class="bar-count">${att.present}</span></div>
      <div class="bar-row"><span class="bar-label">Absent</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(att.absent/attTotal*100)}%;background:var(--danger)"></div></div><span class="bar-count">${att.absent}</span></div>
      <div class="bar-row"><span class="bar-label">On Leave</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(att.leave/attTotal*100)}%;background:var(--warning)"></div></div><span class="bar-count">${att.leave}</span></div>
    </div>`;
    // Quick actions
    const qa=document.getElementById('quickActions');
    if(qa&&isManagerOrAdmin()){
      qa.innerHTML=`
        <div class="quick-action-btn" onclick="openAttendanceModal()"><span class="qa-icon">&#128197;</span> Mark Attendance</div>
        <div class="quick-action-btn" onclick="openEmployeeModal()"><span class="qa-icon">&#128101;</span> Add Employee</div>
        <div class="quick-action-btn" onclick="openPerfModal()"><span class="qa-icon">&#11088;</span> Add Review</div>
        <div class="quick-action-btn" onclick="document.querySelector('[data-page=reports]').click()"><span class="qa-icon">&#128200;</span> View Reports</div>`;
    }
  }catch(e){console.error('Dashboard',e);}
}

// ── Employees ──
async function loadEmployees(page=1){
  currentPage.employees=page;
  const search=document.getElementById('empSearch')?.value||'';
  const dept=document.getElementById('empDeptFilter')?.value||'';
  try{
    let url=`${API}/employees?page=${page}&limit=15`;
    if(search)url+=`&q=${encodeURIComponent(search)}`;
    const res=await fetch(url);
    const data=await res.json();
    if(!data.success)return;
    // client-side dept filter
    if(dept)data.data=data.data.filter(e=>e.department===dept);
    employees=data.data;
    renderEmployees(data);
    renderEmployeeCards(data);
  }catch(e){console.error(e);}
}

function renderEmployees(data){
  const tbody=document.getElementById('employeeList');
  if(!data.data.length){
    tbody.innerHTML=`<tr class="empty-row"><td colspan="6"><span class="empty-icon">&#128101;</span><p>No employees found</p>${isManagerOrAdmin()?'<button class="btn btn-primary btn-sm" onclick="openEmployeeModal()">Add First Employee</button>':''}</td></tr>`;
    document.getElementById('empPagination').innerHTML='';return;
  }
  tbody.innerHTML=data.data.map(e=>`<tr>
    <td><div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:${avatarColor(e.name)};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.75rem;flex-shrink:0">${initials(e.name)}</div>
      <div><div style="font-weight:600;font-size:.85rem">${e.name}</div><div style="font-size:.72rem;color:var(--text-muted)">${e.email}</div></div>
    </div></td>
    <td>${e.position}</td>
    <td><span class="badge badge-blue">${e.department}</span></td>
    <td>${fmtSalary(e.salary)}</td>
    <td>${fmtDate(e.hireDate)}</td>
    <td><div class="row-actions">
      ${isManagerOrAdmin()?`<button class="btn btn-secondary btn-xs" onclick="openEmployeeModal('${e._id}')">Edit</button>`:''}
      ${isManagerOrAdmin()?`<button class="btn btn-danger btn-xs" onclick="deleteEmployee('${e._id}','${e.name}')">Delete</button>`:''}
    </div></td>
  </tr>`).join('');
  renderPagination('empPagination',data.total,data.page,15,`p=>loadEmployees(p)`);
}

function renderEmployeeCards(data){
  const container=document.getElementById('empCardsList');
  if(!data.data.length){container.innerHTML='<p class="text-muted" style="text-align:center;padding:40px">No employees found</p>';return;}
  container.innerHTML=data.data.map(e=>`
    <div class="emp-card">
      <div class="emp-card-avatar" style="background:${avatarColor(e.name)}">${initials(e.name)}</div>
      <div class="emp-card-name">${e.name}</div>
      <div class="emp-card-pos">${e.position}</div>
      <div class="emp-card-meta">
        <span>&#127970; ${e.department}</span>
        <span>&#128176; ${fmtSalary(e.salary)}</span>
        <span>&#128197; Hired ${fmtDate(e.hireDate)}</span>
      </div>
      ${isManagerOrAdmin()?`<div class="emp-card-actions">
        <button class="btn btn-secondary btn-sm" style="flex:1" onclick="openEmployeeModal('${e._id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${e._id}','${e.name}')">&#128465;</button>
      </div>`:''}
    </div>`).join('');
  renderPagination('empCardsPagination',data.total,data.page,15,`p=>loadEmployees(p)`);
}

function openEmployeeModal(id=null){
  document.getElementById('empId').value=id||'';
  document.getElementById('empModalTitle').textContent=id?'Edit Employee':'Add Employee';
  ['empName','empEmail','empPosition','empSalary','empHireDate'].forEach(f=>document.getElementById(f).value='');
  const sel=document.getElementById('empDepartment');
  sel.innerHTML='<option value="">Select department</option>'+departments.map(d=>`<option value="${d.name}">${d.name}</option>`).join('');
  if(id){const emp=employees.find(e=>e._id===id);if(emp){document.getElementById('empName').value=emp.name;document.getElementById('empEmail').value=emp.email;document.getElementById('empPosition').value=emp.position;sel.value=emp.department;document.getElementById('empSalary').value=emp.salary;document.getElementById('empHireDate').value=emp.hireDate;}}
  openModal('employeeModal');
}

async function submitEmployee(){
  const id=document.getElementById('empId').value;
  const body={name:document.getElementById('empName').value.trim(),email:document.getElementById('empEmail').value.trim(),position:document.getElementById('empPosition').value.trim(),department:document.getElementById('empDepartment').value,salary:parseFloat(document.getElementById('empSalary').value)||0,hireDate:document.getElementById('empHireDate').value};
  if(!body.name||!body.email||!body.position||!body.department){toast('Please fill all required fields','error');return;}
  try{
    const res=await fetch(API+'/employees'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('employeeModal');toast(id?'Employee updated':'Employee added','success');loadEmployees(currentPage.employees||1);loadDashboard();}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteEmployee(id,name){
  confirm(`Delete "${name}" and all their records? This cannot be undone.`,async()=>{
    const res=await fetch(API+'/employees/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Employee deleted','success');loadEmployees(currentPage.employees||1);loadDashboard();}
    else toast(data.message,'error');
  });
}

// ── Departments ──
async function loadDepartments(){
  try{
    const res=await fetch(API+'/departments');
    const data=await res.json();
    if(!data.success)return;
    departments=data.data;
    renderDepartments();
    // populate dept filter on employees page
    const df=document.getElementById('empDeptFilter');
    if(df){const cur=df.value;df.innerHTML='<option value="">All Departments</option>'+departments.map(d=>`<option value="${d.name}">${d.name}</option>`).join('');df.value=cur;}
  }catch(e){console.error(e);}
}

function renderDepartments(){
  const tbody=document.getElementById('departmentList');
  if(!departments.length){tbody.innerHTML='<tr class="empty-row"><td colspan="5"><span class="empty-icon">&#127970;</span><p>No departments yet</p></td></tr>';return;}
  tbody.innerHTML=departments.map(d=>{
    const empCount=employees.filter(e=>e.department===d.name).length;
    return`<tr>
      <td><strong>${d.name}</strong></td>
      <td style="color:var(--text-muted);font-size:.8rem">${d.description||'—'}</td>
      <td>${d.managerId?(d.managerId.name||'—'):'—'}</td>
      <td><span class="badge badge-blue">${empCount} employee${empCount!==1?'s':''}</span></td>
      <td><div class="row-actions">
        ${isAdmin()?`<button class="btn btn-secondary btn-xs" onclick="openDeptModal('${d._id}')">Edit</button>`:''}
        ${isAdmin()?`<button class="btn btn-danger btn-xs" onclick="deleteDepartment('${d._id}','${d.name}')">Delete</button>`:''}
      </div></td>
    </tr>`;
  }).join('');
}

function openDeptModal(id=null){
  document.getElementById('deptId').value=id||'';
  document.getElementById('deptModalTitle').textContent=id?'Edit Department':'Add Department';
  ['deptName','deptDescription'].forEach(f=>document.getElementById(f).value='');
  const mgr=document.getElementById('deptManagerEmp');
  mgr.innerHTML='<option value="">No manager assigned</option>'+employees.map(e=>`<option value="${e._id}">${e.name}</option>`).join('');
  if(id){const d=departments.find(x=>x._id===id);if(d){document.getElementById('deptName').value=d.name;document.getElementById('deptDescription').value=d.description||'';if(d.managerId)mgr.value=d.managerId._id||d.managerId;}}
  openModal('departmentModal');
}

async function submitDepartment(){
  const id=document.getElementById('deptId').value;
  const body={name:document.getElementById('deptName').value.trim(),description:document.getElementById('deptDescription').value.trim(),managerId:document.getElementById('deptManagerEmp').value||null};
  if(!body.name){toast('Department name is required','error');return;}
  try{
    const res=await fetch(API+'/departments'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('departmentModal');toast(id?'Department updated':'Department created','success');loadDepartments();}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteDepartment(id,name){
  confirm(`Delete department "${name}"?`,async()=>{
    const res=await fetch(API+'/departments/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Department deleted','success');loadDepartments();}
    else toast(data.message,'error');
  });
}

// ── Attendance ──
async function loadAttendance(page=1){
  currentPage.attendance=page;
  try{
    const res=await fetch(`${API}/attendance?page=${page}&limit=20`);
    const data=await res.json();
    if(!data.success)return;
    attendanceData=data.data;
    renderAttendance(data);
  }catch(e){console.error(e);}
}

function renderAttendance(data){
  const tbody=document.getElementById('attendanceList');
  if(!data.data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7"><span class="empty-icon">&#128197;</span><p>No attendance records</p></td></tr>';document.getElementById('attPagination').innerHTML='';return;}
  const sb=s=>s==='present'?'badge-green':s==='absent'?'badge-red':'badge-yellow';
  const si=s=>s==='present'?'&#9989;':s==='absent'?'&#10060;':'&#127796;';
  tbody.innerHTML=data.data.map(a=>`<tr>
    <td><strong>${a.employeeId?a.employeeId.name:'—'}</strong></td>
    <td>${fmtDate(a.date)}</td>
    <td><span class="badge ${sb(a.status)}">${si(a.status)} ${a.status}</span></td>
    <td>${a.checkIn||'—'}</td>
    <td>${a.checkOut||'—'}</td>
    <td style="color:var(--text-muted);font-size:.8rem">${calcDuration(a.checkIn,a.checkOut)}</td>
    <td><div class="row-actions">${isManagerOrAdmin()?`<button class="btn btn-danger btn-xs" onclick="deleteAttendance('${a._id}')">Delete</button>`:''}</div></td>
  </tr>`).join('');
  renderPagination('attPagination',data.total,data.page,20,`p=>loadAttendance(p)`);
}

function openAttendanceModal(){
  document.getElementById('attId').value='';
  document.getElementById('attDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('attStatus').value='';
  document.getElementById('attCheckIn').value='';
  document.getElementById('attCheckOut').value='';
  populateEmployeeSelect('attEmployeeId');
  openModal('attendanceModal');
}

async function submitAttendance(){
  const body={employeeId:document.getElementById('attEmployeeId').value,date:document.getElementById('attDate').value,status:document.getElementById('attStatus').value,checkIn:document.getElementById('attCheckIn').value||null,checkOut:document.getElementById('attCheckOut').value||null};
  if(!body.employeeId||!body.date||!body.status){toast('Employee, date and status are required','error');return;}
  try{
    const res=await fetch(API+'/attendance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('attendanceModal');toast('Attendance recorded','success');loadAttendance(currentPage.attendance||1);loadDashboard();}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteAttendance(id){
  confirm('Delete this attendance record?',async()=>{
    const res=await fetch(API+'/attendance/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Record deleted','success');loadAttendance(currentPage.attendance||1);}
    else toast(data.message,'error');
  });
}

async function filterAttendance(){
  const date=document.getElementById('attFilterDate').value;
  const status=document.getElementById('attFilterStatus').value;
  if(!date&&!status){loadAttendance(1);return;}
  let url=`${API}/search/attendance?`;
  if(date)url+=`date=${date}&`;
  if(status)url+=`status=${status}`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    if(data.success)renderAttendance({data:data.data,total:data.count,page:1});
  }catch{toast('Filter failed','error');}
}

function clearAttFilter(){
  document.getElementById('attFilterDate').value='';
  document.getElementById('attFilterStatus').value='';
  loadAttendance(1);
}

// ── Leaves ──
async function loadLeaves(page=1){
  currentPage.leaves=page;
  try{
    const res=await fetch(`${API}/leaves?page=${page}&limit=20`);
    const data=await res.json();
    if(!data.success)return;
    leaves=data.data;
    renderLeaves(data);
  }catch(e){console.error(e);}
}

function renderLeaves(data){
  const tbody=document.getElementById('leaveList');
  if(!data.data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7"><span class="empty-icon">&#127796;</span><p>No leave requests</p></td></tr>';document.getElementById('leavePagination').innerHTML='';return;}
  const sb=s=>s==='approved'?'badge-green':s==='rejected'?'badge-red':'badge-yellow';
  tbody.innerHTML=data.data.map(l=>`<tr>
    <td><strong>${l.employeeId?l.employeeId.name:'—'}</strong></td>
    <td><span class="badge badge-blue">${l.type}</span></td>
    <td><div style="font-size:.8rem">${fmtDate(l.startDate)} → ${fmtDate(l.endDate)}</div><div style="font-size:.72rem;color:var(--text-muted)">${leaveDays(l.startDate,l.endDate)}</div></td>
    <td>${isAdmin()?`<span class="badge ${sb(l.status)}" style="cursor:pointer" onclick="openLeaveStatusModal('${l._id}','${l.status}')" title="Click to update">${l.status} &#9998;</span>`:`<span class="badge ${sb(l.status)}">${l.status}</span>`}</td>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem" title="${l.reason}">${l.reason}</td>
    <td><div class="row-actions"><button class="btn btn-danger btn-xs" onclick="deleteLeave('${l._id}')">Delete</button></div></td>
  </tr>`).join('');
  renderPagination('leavePagination',data.total,data.page,20,`p=>loadLeaves(p)`);
}

async function submitLeave(){
  const body={startDate:document.getElementById('leaveStart').value,endDate:document.getElementById('leaveEnd').value,type:document.getElementById('leaveType').value,reason:document.getElementById('leaveReason').value.trim()};
  if(!body.startDate||!body.endDate||!body.type||!body.reason){toast('All fields are required','error');return;}
  if(new Date(body.startDate)>new Date(body.endDate)){toast('Start date must be before end date','error');return;}
  try{
    const res=await fetch(API+'/leaves',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('leaveModal');toast('Leave request submitted','success');loadLeaves();}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

function openLeaveStatusModal(id,cur){document.getElementById('leaveStatusId').value=id;document.getElementById('leaveStatusValue').value=cur;openModal('leaveStatusModal');}

async function submitLeaveStatus(){
  const id=document.getElementById('leaveStatusId').value;
  const status=document.getElementById('leaveStatusValue').value;
  try{
    const res=await fetch(API+'/leaves/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    const data=await res.json();
    if(data.success){closeModal('leaveStatusModal');toast(`Leave ${status}`,'success');loadLeaves(currentPage.leaves||1);}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteLeave(id){
  confirm('Delete this leave request?',async()=>{
    const res=await fetch(API+'/leaves/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Leave deleted','success');loadLeaves(currentPage.leaves||1);}
    else toast(data.message,'error');
  });
}

// ── Performance ──
async function loadPerformances(page=1){
  currentPage.performance=page;
  try{
    const res=await fetch(`${API}/performances?page=${page}&limit=20`);
    const data=await res.json();
    if(!data.success)return;
    performances=data.data;
    renderPerformances(data);
  }catch(e){console.error(e);}
}

function renderPerformances(data){
  const tbody=document.getElementById('performanceList');
  if(!data.data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6"><span class="empty-icon">&#11088;</span><p>No reviews yet</p></td></tr>';document.getElementById('perfPagination').innerHTML='';return;}
  tbody.innerHTML=data.data.map(p=>{
    const r=Math.round(p.rating);
    const stars='&#9733;'.repeat(r)+'&#9734;'.repeat(5-r);
    const color=p.rating>=4?'var(--success)':p.rating>=3?'var(--warning)':'var(--danger)';
    return`<tr>
      <td><strong>${p.employeeId?p.employeeId.name:'—'}</strong></td>
      <td style="font-size:.8rem">${fmtDate(p.reviewDate)}</td>
      <td><span class="stars" style="color:${color}">${stars}</span> <span style="font-size:.75rem;color:var(--text-muted)">${p.rating}/5</span></td>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.8rem" title="${p.comments}">${p.comments||'—'}</td>
      <td style="font-size:.8rem">${p.reviewedBy}</td>
      <td><div class="row-actions">${isManagerOrAdmin()?`<button class="btn btn-danger btn-xs" onclick="deletePerformance('${p._id}')">Delete</button>`:''}</div></td>
    </tr>`;
  }).join('');
  renderPagination('perfPagination',data.total,data.page,20,`p=>loadPerformances(p)`);
}

function openPerfModal(){
  populateEmployeeSelect('perfEmployeeId');
  document.getElementById('perfDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('perfRating').value='';
  document.getElementById('perfComments').value='';
  document.getElementById('perfReviewedBy').value=currentUser?currentUser.username:'';
  openModal('performanceModal');
}

async function submitPerformance(){
  const body={employeeId:document.getElementById('perfEmployeeId').value,reviewDate:document.getElementById('perfDate').value||new Date().toISOString().split('T')[0],rating:parseFloat(document.getElementById('perfRating').value),comments:document.getElementById('perfComments').value.trim(),reviewedBy:document.getElementById('perfReviewedBy').value.trim()||'Manager'};
  if(!body.employeeId||isNaN(body.rating)||body.rating<1||body.rating>5){toast('Employee and a valid rating (1-5) are required','error');return;}
  try{
    const res=await fetch(API+'/performances',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('performanceModal');toast('Review saved','success');loadPerformances(currentPage.performance||1);}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deletePerformance(id){
  confirm('Delete this performance review?',async()=>{
    const res=await fetch(API+'/performances/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Review deleted','success');loadPerformances(currentPage.performance||1);}
    else toast(data.message,'error');
  });
}

// ── Trainings ──
async function loadTrainings(page=1){
  currentPage.trainings=page;
  try{
    const res=await fetch(`${API}/trainings?page=${page}&limit=20`);
    const data=await res.json();
    if(!data.success)return;
    trainings=data.data;
    renderTrainings(data);
  }catch(e){console.error(e);}
}

function renderTrainings(data){
  const tbody=document.getElementById('trainingList');
  if(!data.data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="7"><span class="empty-icon">&#127891;</span><p>No trainings found</p></td></tr>';document.getElementById('trainingPagination').innerHTML='';return;}
  const sb=s=>s==='completed'?'badge-green':s==='cancelled'?'badge-red':'badge-blue';
  tbody.innerHTML=data.data.map(t=>`<tr>
    <td><strong>${t.employeeId?t.employeeId.name:'—'}</strong></td>
    <td><div style="font-weight:500">${t.title}</div>${t.description?`<div style="font-size:.72rem;color:var(--text-muted)">${t.description.slice(0,60)}${t.description.length>60?'...':''}</div>`:''}</td>
    <td style="font-size:.8rem">${t.trainer||'—'}</td>
    <td style="font-size:.8rem">${fmtDate(t.startDate)}</td>
    <td style="font-size:.8rem">${t.endDate?fmtDate(t.endDate):'—'}</td>
    <td><span class="badge ${sb(t.completionStatus)}">${t.completionStatus.replace('_',' ')}</span></td>
    <td><div class="row-actions">
      <button class="btn btn-secondary btn-xs" onclick="openTrainingModal('${t._id}')">Edit</button>
      <button class="btn btn-danger btn-xs" onclick="deleteTraining('${t._id}')">Delete</button>
    </div></td>
  </tr>`).join('');
  renderPagination('trainingPagination',data.total,data.page,20,`p=>loadTrainings(p)`);
}

function openTrainingModal(id=null){
  document.getElementById('trainingId').value=id||'';
  document.getElementById('trainingModalTitle').textContent=id?'Edit Training':'Add Training';
  populateEmployeeSelect('trainingEmployeeId');
  ['trainingTitle','trainingDesc','trainingTrainer','trainingStart','trainingEnd','trainingCert'].forEach(f=>document.getElementById(f).value='');
  document.getElementById('trainingStatus').value='in_progress';
  if(id){const t=trainings.find(x=>x._id===id);if(t){document.getElementById('trainingEmployeeId').value=t.employeeId?(t.employeeId._id||t.employeeId):'';document.getElementById('trainingTitle').value=t.title;document.getElementById('trainingDesc').value=t.description||'';document.getElementById('trainingTrainer').value=t.trainer||'';document.getElementById('trainingStatus').value=t.completionStatus;document.getElementById('trainingStart').value=t.startDate;document.getElementById('trainingEnd').value=t.endDate||'';document.getElementById('trainingCert').value=t.certificateUrl||'';}}
  openModal('trainingModal');
}

async function submitTraining(){
  const id=document.getElementById('trainingId').value;
  const body={employeeId:document.getElementById('trainingEmployeeId').value,title:document.getElementById('trainingTitle').value.trim(),description:document.getElementById('trainingDesc').value.trim(),trainer:document.getElementById('trainingTrainer').value.trim(),completionStatus:document.getElementById('trainingStatus').value,startDate:document.getElementById('trainingStart').value,endDate:document.getElementById('trainingEnd').value||'',certificateUrl:document.getElementById('trainingCert').value.trim()};
  if(!body.employeeId||!body.title||!body.startDate){toast('Employee, title and start date are required','error');return;}
  try{
    const res=await fetch(API+'/trainings'+(id?'/'+id:''),{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('trainingModal');toast(id?'Training updated':'Training added','success');loadTrainings(currentPage.trainings||1);}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteTraining(id){
  confirm('Delete this training record?',async()=>{
    const res=await fetch(API+'/trainings/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Training deleted','success');loadTrainings(currentPage.trainings||1);}
    else toast(data.message,'error');
  });
}

// ── Documents ──
async function loadDocuments(page=1){
  currentPage.documents=page;
  try{
    const res=await fetch(`${API}/documents?page=${page}&limit=20`);
    const data=await res.json();
    if(!data.success)return;
    documents=data.data;
    renderDocuments(data);
  }catch(e){console.error(e);}
}

function renderDocuments(data){
  const tbody=document.getElementById('documentList');
  if(!data.data.length){tbody.innerHTML='<tr class="empty-row"><td colspan="6"><span class="empty-icon">&#128196;</span><p>No documents uploaded</p></td></tr>';document.getElementById('docPagination').innerHTML='';return;}
  const typeIcon={contract:'&#128221;',certificate:'&#127942;',id_proof:'&#128100;',degree:'&#127891;',other:'&#128196;'};
  tbody.innerHTML=data.data.map(d=>`<tr>
    <td><strong>${d.employeeId?d.employeeId.name:'—'}</strong></td>
    <td><span class="badge badge-purple">${typeIcon[d.documentType]||'&#128196;'} ${d.documentType.replace('_',' ')}</span></td>
    <td><a href="${d.fileUrl}" target="_blank" style="color:var(--primary);text-decoration:none;font-size:.825rem">&#128279; ${d.fileName}</a></td>
    <td style="font-size:.8rem">${d.uploadedBy?d.uploadedBy.username:'—'}</td>
    <td style="font-size:.8rem">${new Date(d.createdAt).toLocaleDateString()}</td>
    <td><div class="row-actions"><button class="btn btn-danger btn-xs" onclick="deleteDocument('${d._id}')">Delete</button></div></td>
  </tr>`).join('');
  renderPagination('docPagination',data.total,data.page,20,`p=>loadDocuments(p)`);
}

function openDocModal(){
  const sel=document.getElementById('docEmployeeId');
  sel.innerHTML='<option value="">Select employee (optional)</option>'+employees.map(e=>`<option value="${e._id}">${e.name}</option>`).join('');
  ['docType','docFileName','docFileUrl','docDescription'].forEach(f=>document.getElementById(f).value='');
  openModal('documentModal');
}

async function submitDocument(){
  const body={employeeId:document.getElementById('docEmployeeId').value||null,documentType:document.getElementById('docType').value,fileName:document.getElementById('docFileName').value.trim(),fileUrl:document.getElementById('docFileUrl').value.trim(),description:document.getElementById('docDescription').value.trim()};
  if(!body.documentType||!body.fileName||!body.fileUrl){toast('Type, file name and URL are required','error');return;}
  try{
    const res=await fetch(API+'/documents',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json();
    if(data.success){closeModal('documentModal');toast('Document uploaded','success');loadDocuments(currentPage.documents||1);}
    else toast(data.message,'error');
  }catch{toast('Request failed','error');}
}

async function deleteDocument(id){
  confirm('Delete this document?',async()=>{
    const res=await fetch(API+'/documents/'+id,{method:'DELETE'});
    const data=await res.json();
    if(data.success){toast('Document deleted','success');loadDocuments(currentPage.documents||1);}
    else toast(data.message,'error');
  });
}

// ── Reports ──
function populateReportDepts(){
  const sel=document.getElementById('reportDeptSelect');
  if(!sel)return;
  sel.innerHTML='<option value="">All Departments</option>'+departments.map(d=>`<option value="${d.name}">${d.name}</option>`).join('');
}

async function generateMonthlyReport(){
  const month=document.getElementById('reportMonth').value;
  if(!month){toast('Please select a month','error');return;}
  const[year,m]=month.split('-');
  const el=document.getElementById('monthlyReportResult');
  el.innerHTML='<div class="skeleton" style="height:120px;margin-top:10px"></div>';
  try{
    const res=await fetch(`${API}/reports/attendance/monthly?year=${year}&month=${m}`);
    const data=await res.json();
    if(!data.success){el.innerHTML=`<p class="text-danger" style="margin-top:10px">${data.message}</p>`;return;}
    el.innerHTML=`<div style="margin-top:12px"><p style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px">Report for <strong>${data.month}</strong></p>
      <div class="table-wrapper"><table><thead><tr><th>Name</th><th>Dept</th><th>Present</th><th>Absent</th><th>Leave</th><th>Rate</th></tr></thead>
      <tbody>${data.data.map(r=>`<tr><td>${r.name}</td><td>${r.department}</td><td class="text-success">${r.present}</td><td class="text-danger">${r.absent}</td><td style="color:var(--warning)">${r.leave}</td><td><strong>${r.attendanceRate}%</strong></td></tr>`).join('')}</tbody></table></div></div>`;
  }catch{toast('Failed to generate report','error');}
}

async function generatePerformanceReport(){
  const dept=document.getElementById('reportDeptSelect').value;
  const minRating=document.getElementById('reportMinRating').value;
  const el=document.getElementById('perfReportResult');
  el.innerHTML='<div class="skeleton" style="height:120px;margin-top:10px"></div>';
  let url=`${API}/reports/performance?`;
  if(dept)url+=`department=${encodeURIComponent(dept)}&`;
  if(minRating)url+=`minRating=${minRating}`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    if(!data.success){el.innerHTML=`<p class="text-danger" style="margin-top:10px">${data.message}</p>`;return;}
    el.innerHTML=`<div style="margin-top:12px"><div class="table-wrapper"><table><thead><tr><th>Name</th><th>Dept</th><th>Date</th><th>Rating</th></tr></thead>
      <tbody>${data.data.reviews.map(r=>`<tr><td>${r.name}</td><td>${r.department}</td><td>${fmtDate(r.reviewDate)}</td><td><span class="stars">${'&#9733;'.repeat(Math.round(r.rating))}${'&#9734;'.repeat(5-Math.round(r.rating))}</span> ${r.rating}</td></tr>`).join('')}</tbody></table></div>
      ${data.data.deptAverages.length?`<p style="font-size:.8rem;color:var(--text-muted);margin:12px 0 6px">Department Averages</p><div class="table-wrapper"><table><thead><tr><th>Department</th><th>Avg Rating</th><th>Reviews</th></tr></thead><tbody>${data.data.deptAverages.map(d=>`<tr><td>${d.department}</td><td>${d.avgRating}</td><td>${d.reviewCount}</td></tr>`).join('')}</tbody></table></div>`:''}</div>`;
  }catch{toast('Failed to generate report','error');}
}

// ── Analytics ──
async function loadAnalytics(){
  ['retentionCard','perfDistCard','deptPerfCard','trendCard'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<div class="skeleton" style="height:100px"></div>';});
  try{
    const[r1,r2,r3,r4]=await Promise.all([
      fetch(API+'/analytics/retention').then(r=>r.json()),
      fetch(API+'/analytics/performance-distribution').then(r=>r.json()),
      fetch(API+'/analytics/department-performance').then(r=>r.json()),
      fetch(API+'/analytics/attendance-trends').then(r=>r.json())
    ]);
    if(r1.success)document.getElementById('retentionCard').innerHTML=`<div style="text-align:center;padding:12px"><div style="font-size:2.8rem;font-weight:700;background:var(--primary-gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${r1.data.retentionRate}%</div><div class="text-muted" style="margin-top:4px;font-size:.8rem">Retention Rate</div><div style="margin-top:14px;display:flex;gap:24px;justify-content:center"><div style="text-align:center"><div style="font-size:1.3rem;font-weight:700">${r1.data.totalEmployees}</div><div class="text-muted" style="font-size:.72rem">Total</div></div><div style="text-align:center"><div style="font-size:1.3rem;font-weight:700">${r1.data.newHiresLastMonth}</div><div class="text-muted" style="font-size:.72rem">New (30d)</div></div></div></div>`;
    if(r2.success){const d=r2.data,max=Math.max(...Object.values(d))||1;document.getElementById('perfDistCard').innerHTML='<div class="bar-chart">'+Object.entries(d).map(([label,count])=>`<div class="bar-row"><span class="bar-label">${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(count/max*100)}%"></div></div><span class="bar-count">${count}</span></div>`).join('')+'</div>';}
    if(r3.success)document.getElementById('deptPerfCard').innerHTML=`<div class="table-wrapper"><table><thead><tr><th>Department</th><th>Employees</th><th>Avg Rating</th></tr></thead><tbody>${r3.data.map(d=>`<tr><td>${d.department}</td><td>${d.employeeCount}</td><td><span class="stars">${'&#9733;'.repeat(Math.round(d.avgRating))}${'&#9734;'.repeat(5-Math.round(d.avgRating))}</span> <span style="font-size:.75rem">${d.avgRating}</span></td></tr>`).join('')}</tbody></table></div>`;
    if(r4.success)document.getElementById('trendCard').innerHTML='<div class="trend-row">'+r4.data.map(t=>{const color=t.attendanceRate>=90?'var(--success)':t.attendanceRate>=70?'var(--warning)':'var(--danger)';const day=new Date(t.date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'});return`<div class="trend-day"><div class="day-name">${day}</div><div class="day-rate" style="color:${color}">${t.attendanceRate}%</div><div class="day-count">${t.present}/${t.total}</div></div>`;}).join('')+'</div>';
  }catch(e){console.error('Analytics',e);}
}

// ── Payroll ──
function populatePayrollEmps(){
  const sel=document.getElementById('payrollEmpSelect');
  if(!sel)return;
  sel.innerHTML='<option value="">Select employee</option>'+employees.map(e=>`<option value="${e._id}">${e.name} — ${e.position}</option>`).join('');
}

async function generatePayslip(){
  const empId=document.getElementById('payrollEmpSelect').value;
  const month=document.getElementById('payrollMonth').value;
  if(!empId||!month){toast('Please select an employee and month','error');return;}
  const[year,m]=month.split('-');
  const el=document.getElementById('payslipResult');
  el.innerHTML='<div class="skeleton" style="height:60px"></div>';
  try{
    const res=await fetch(API+'/payroll/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({employeeId:empId,month:m,year})});
    const data=await res.json();
    if(data.success)el.innerHTML=`<div style="padding:14px;background:var(--success-bg);border-radius:var(--radius-sm);border:1px solid rgba(56,161,105,.25);margin-top:4px"><p class="text-success" style="margin-bottom:10px;font-weight:500">&#9989; Payslip generated successfully</p><a href="${data.filePath}" download="${data.fileName}" class="btn btn-success btn-sm">&#128196; Download PDF</a></div>`;
    else el.innerHTML=`<p class="text-danger" style="margin-top:8px">${data.message}</p>`;
  }catch{toast('Failed to generate payslip','error');}
}
