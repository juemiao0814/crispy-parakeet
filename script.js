/* ---------- 前台：AI 客服（占位） ---------- */
function ai(){
  document.getElementById("reply").innerHTML = "AI：已记录您的招商需求";
}

/* ---------- 前台：提交招商 / 代理申请 ---------- */
function submitForm(type){
  let fields;
  if(type === 'supplier'){
    fields = {
      "公司名称": document.getElementById('s-company').value.trim(),
      "联系人": document.getElementById('s-contact').value.trim(),
      "微信": document.getElementById('s-wechat').value.trim(),
      "主营产品": document.getElementById('s-product').value.trim()
    };
  } else {
    fields = {
      "姓名": document.getElementById('a-name').value.trim(),
      "国家地区": document.getElementById('a-country').value.trim(),
      "微信": document.getElementById('a-wechat').value.trim(),
      "WhatsApp": document.getElementById('a-whatsapp').value.trim(),
      "销售渠道": document.getElementById('a-channel').value.trim()
    };
  }

  if(Object.values(fields).some(v => !v)){
    alert('请填写完整信息');
    return;
  }

  const record = {
    id: Date.now(),
    type: type,
    fields: fields,
    status: '待处理',
    time: new Date().toLocaleString('zh-CN')
  };

  const list = JSON.parse(localStorage.getItem('lct_submissions') || '[]');
  list.push(record);
  localStorage.setItem('lct_submissions', JSON.stringify(list));

  alert('提交成功！我们会尽快联系您');

  const prefix = type === 'supplier' ? 's-' : 'a-';
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(input => input.value = '');
}

/* ---------- 后台：初始化默认管理员 ---------- */
function ensureDefaultAdmin(){
  if(!localStorage.getItem('lct_admins')){
    localStorage.setItem('lct_admins', JSON.stringify([{ u: 'admin', p: '123456' }]));
  }
}

/* ---------- 后台：登录 / 登出 ---------- */
function login(){
  ensureDefaultAdmin();
  const admins = JSON.parse(localStorage.getItem('lct_admins'));
  const u = document.getElementById('user').value.trim();
  const p = document.getElementById('pass').value;
  const found = admins.find(a => a.u === u && a.p === p);

  if(found){
    sessionStorage.setItem('lct_session', u);
    showDashboard();
  } else {
    document.getElementById('tip').innerHTML = '账号或密码错误';
  }
}

function logout(){
  sessionStorage.removeItem('lct_session');
  location.reload();
}

function showDashboard(){
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('curUser').innerText = sessionStorage.getItem('lct_session');
  renderData('all');
  renderAdminList();
}

/* ---------- 后台：标签页切换 ---------- */
function switchTab(name, btn){
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  if(btn) btn.classList.add('active');
}

/* ---------- 后台：招商数据列表 ---------- */
function filterData(type){
  renderData(type);
}

function renderData(filter){
  let list = JSON.parse(localStorage.getItem('lct_submissions') || '[]');
  if(filter && filter !== 'all'){
    list = list.filter(d => d.type === filter);
  }
  list.sort((a, b) => b.id - a.id);

  const tbody = document.getElementById('dataTableBody');
  if(list.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" class="empty-row">暂无数据</td></tr>';
    return;
  }

  const statuses = ['待处理', '已联系', '合作中', '已拒绝'];
  tbody.innerHTML = list.map(d => {
    const typeLabel = d.type === 'supplier' ? '供应商' : '代理';
    const detail = Object.entries(d.fields).map(([k, v]) => `${k}：${v}`).join('<br>');
    const options = statuses.map(s =>
      `<option value="${s}" ${d.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');
    return `<tr>
      <td>${typeLabel}</td>
      <td>${d.time}</td>
      <td>${detail}</td>
      <td><select class="status-${statusClass(d.status)}" onchange="updateStatus(${d.id}, this.value); this.className='status-'+statusClass(this.value)">${options}</select></td>
    </tr>`;
  }).join('');
}

function statusClass(status){
  if(status === '已联系') return 'contacted';
  if(status === '合作中') return 'active';
  if(status === '已拒绝') return 'rejected';
  return 'pending';
}

function updateStatus(id, status){
  const list = JSON.parse(localStorage.getItem('lct_submissions') || '[]');
  const item = list.find(d => d.id === id);
  if(item){
    item.status = status;
    localStorage.setItem('lct_submissions', JSON.stringify(list));
  }
}

/* ---------- 后台：修改密码 ---------- */
function changePassword(){
  const admins = JSON.parse(localStorage.getItem('lct_admins') || '[]');
  const cur = sessionStorage.getItem('lct_session');
  const admin = admins.find(a => a.u === cur);
  const oldPass = document.getElementById('oldPass').value;
  const n1 = document.getElementById('newPass').value;
  const n2 = document.getElementById('newPass2').value;
  const tip = document.getElementById('pwTip');

  if(!admin || admin.p !== oldPass){
    tip.innerHTML = '当前密码错误';
    return;
  }
  if(!n1 || n1.length < 6){
    tip.innerHTML = '新密码至少需要6位';
    return;
  }
  if(n1 !== n2){
    tip.innerHTML = '两次输入的新密码不一致';
    return;
  }

  admin.p = n1;
  localStorage.setItem('lct_admins', JSON.stringify(admins));
  tip.innerHTML = '密码修改成功';
  document.getElementById('oldPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('newPass2').value = '';
}

/* ---------- 后台：管理员管理 ---------- */
function addAdmin(){
  const u = document.getElementById('newAdminUser').value.trim();
  const p = document.getElementById('newAdminPass').value;
  const tip = document.getElementById('adminTip');

  if(!u || !p){
    tip.innerHTML = '请填写账号和密码';
    return;
  }
  if(p.length < 6){
    tip.innerHTML = '密码至少需要6位';
    return;
  }

  const admins = JSON.parse(localStorage.getItem('lct_admins') || '[]');
  if(admins.some(a => a.u === u)){
    tip.innerHTML = '该账号已存在';
    return;
  }

  admins.push({ u, p });
  localStorage.setItem('lct_admins', JSON.stringify(admins));
  tip.innerHTML = '添加成功';
  document.getElementById('newAdminUser').value = '';
  document.getElementById('newAdminPass').value = '';
  renderAdminList();
}

function deleteAdmin(u){
  const admins = JSON.parse(localStorage.getItem('lct_admins') || '[]');
  if(admins.length <= 1){
    alert('至少保留一个管理员账号');
    return;
  }
  const cur = sessionStorage.getItem('lct_session');
  if(u === cur && !confirm('确定删除当前登录账号？删除后将自动退出登录')){
    return;
  }

  const updated = admins.filter(a => a.u !== u);
  localStorage.setItem('lct_admins', JSON.stringify(updated));

  if(u === cur){
    logout();
  } else {
    renderAdminList();
  }
}

function renderAdminList(){
  const admins = JSON.parse(localStorage.getItem('lct_admins') || '[]');
  const cur = sessionStorage.getItem('lct_session');
  const ul = document.getElementById('adminList');
  ul.innerHTML = admins.map(a => `
    <li>
      <span>${a.u}${a.u === cur ? ' <em>（当前登录）</em>' : ''}</span>
      ${admins.length > 1 ? `<button class="ghost-btn small" onclick="deleteAdmin('${a.u}')">删除</button>` : ''}
    </li>
  `).join('');
}

/* ---------- 页面加载时：若已登录则自动进入后台 ---------- */
document.addEventListener('DOMContentLoaded', function(){
  if(document.getElementById('dashboard')){
    ensureDefaultAdmin();
    if(sessionStorage.getItem('lct_session')){
      showDashboard();
    }
  }
});
