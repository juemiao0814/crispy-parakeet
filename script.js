/* ============================================================
   在这里填入你自己 Supabase 项目的 Project URL 和 anon public key
   （Supabase 控制台 → Project Settings → API）
   ============================================================ */
const SUPABASE_URL = 'https://qafakspeitqsfeawkcsw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Jj-tAhgJu8oVl2Xdw57hLQ_mqzLpB1r';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- 前台：AI 客服（占位） ---------- */
function ai(){
  document.getElementById("reply").innerHTML = "AI：已记录您的招商需求";
}

/* ---------- 前台：提交招商 / 代理申请 ---------- */
async function submitForm(type){
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

  const { error } = await sb.from('submissions').insert([{
    type: type,
    fields: fields,
    status: '待处理'
  }]);

  if(error){
    console.error(error);
    alert('提交失败，请稍后再试');
    return;
  }

  alert('提交成功！我们会尽快联系您');

  const prefix = type === 'supplier' ? 's-' : 'a-';
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(input => input.value = '');
}

/* ---------- 后台：登录 / 登出 ----------
   说明：本站没有独立的服务器会话（session），每次调用需要管理员权限的接口
   时都会带上当前登录账号的用户名+密码，由数据库里的函数重新校验一次
   （密码在数据库中是加密存储的，任何人都无法直接读取）。
   为此，登录成功后会把用户名和密码暂存到 sessionStorage 里，关闭标签页/
   浏览器后会自动清除。
------------------------------------------------------------- */
async function login(){
  const u = document.getElementById('user').value.trim();
  const p = document.getElementById('pass').value;
  const tip = document.getElementById('tip');
  tip.innerHTML = '登录中…';

  const { data, error } = await sb.rpc('login_admin', { p_username: u, p_password: p });

  if(error){
    console.error(error);
    tip.innerHTML = '登录失败，请检查网络或稍后再试';
    return;
  }

  if(data && data.length > 0){
    sessionStorage.setItem('lct_session', data[0].username);
    sessionStorage.setItem('lct_role', data[0].role);
    sessionStorage.setItem('lct_pw', p);
    tip.innerHTML = '';
    showDashboard();
  } else {
    tip.innerHTML = '账号或密码错误';
  }
}

function logout(){
  sessionStorage.removeItem('lct_session');
  sessionStorage.removeItem('lct_role');
  sessionStorage.removeItem('lct_pw');
  location.reload();
}

function currentCreds(){
  return {
    p_username: sessionStorage.getItem('lct_session'),
    p_password: sessionStorage.getItem('lct_pw')
  };
}

async function showDashboard(){
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('curUser').innerText = sessionStorage.getItem('lct_session');

  const isSuper = sessionStorage.getItem('lct_role') === 'super';
  document.getElementById('adminsTabBtn').style.display = isSuper ? 'inline-block' : 'none';

  await loadSubmissions();
  if(isSuper) await loadAdmins();
}

/* ---------- 后台：标签页切换 ---------- */
function switchTab(name, btn){
  if(name === 'admins' && sessionStorage.getItem('lct_role') !== 'super'){
    return; // 普通管理员无权限进入"管理员管理"
  }
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  if(btn) btn.classList.add('active');
}

/* ---------- 后台：招商数据列表 ---------- */
let allSubmissions = [];
let currentFilter = 'all';

async function loadSubmissions(){
  const { data, error } = await sb.rpc('list_submissions', currentCreds());
  if(error){
    console.error(error);
    document.getElementById('dataTableBody').innerHTML =
      '<tr><td colspan="4" class="empty-row">加载失败，请刷新重试</td></tr>';
    return;
  }
  allSubmissions = data || [];
  renderData(currentFilter);
}

function filterData(type){
  currentFilter = type;
  renderData(type);
}

function renderData(filter){
  let list = allSubmissions;
  if(filter && filter !== 'all'){
    list = list.filter(d => d.type === filter);
  }

  const tbody = document.getElementById('dataTableBody');
  if(list.length === 0){
    tbody.innerHTML = '<tr><td colspan="4" class="empty-row">暂无数据</td></tr>';
    return;
  }

  const statuses = ['待处理', '已联系', '合作中', '已拒绝'];
  tbody.innerHTML = list.map(d => {
    const typeLabel = d.type === 'supplier' ? '供应商' : '代理';
    const detail = Object.entries(d.fields).map(([k, v]) => `${k}：${v}`).join('<br>');
    const time = new Date(d.created_at).toLocaleString('zh-CN');
    const options = statuses.map(s =>
      `<option value="${s}" ${d.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');
    return `<tr>
      <td>${typeLabel}</td>
      <td>${time}</td>
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

async function updateStatus(id, status){
  const { error } = await sb.rpc('update_submission_status', {
    ...currentCreds(),
    p_id: id,
    p_status: status
  });
  if(error){
    console.error(error);
    alert('状态更新失败，请重试');
    return;
  }
  const item = allSubmissions.find(d => d.id === id);
  if(item) item.status = status;
}

/* ---------- 后台：修改密码 ---------- */
async function changePassword(){
  const oldPass = document.getElementById('oldPass').value;
  const n1 = document.getElementById('newPass').value;
  const n2 = document.getElementById('newPass2').value;
  const tip = document.getElementById('pwTip');

  if(!n1 || n1.length < 6){
    tip.innerHTML = '新密码至少需要6位';
    return;
  }
  if(n1 !== n2){
    tip.innerHTML = '两次输入的新密码不一致';
    return;
  }

  const { error } = await sb.rpc('change_password', {
    p_username: sessionStorage.getItem('lct_session'),
    p_password: oldPass,
    p_new_password: n1
  });

  if(error){
    tip.innerHTML = '当前密码错误';
    return;
  }

  sessionStorage.setItem('lct_pw', n1); // 密码已变更，同步更新本地暂存的密码
  tip.innerHTML = '密码修改成功';
  document.getElementById('oldPass').value = '';
  document.getElementById('newPass').value = '';
  document.getElementById('newPass2').value = '';
}

/* ---------- 后台：管理员管理（仅超级管理员可见/可操作） ---------- */
async function loadAdmins(){
  const { data, error } = await sb.rpc('list_admins', currentCreds());
  if(error){
    console.error(error);
    return;
  }
  renderAdminList(data || []);
}

async function addAdmin(){
  const u = document.getElementById('newAdminUser').value.trim();
  const p = document.getElementById('newAdminPass').value;
  const role = document.getElementById('newAdminRole').value;
  const tip = document.getElementById('adminTip');

  if(!u || !p){
    tip.innerHTML = '请填写账号和密码';
    return;
  }
  if(p.length < 6){
    tip.innerHTML = '密码至少需要6位';
    return;
  }

  const { error } = await sb.rpc('add_admin', {
    ...currentCreds(),
    p_new_username: u,
    p_new_password: p,
    p_new_role: role
  });

  if(error){
    tip.innerHTML = error.message.includes('duplicate') ? '该账号已存在' : '添加失败：' + error.message;
    return;
  }

  tip.innerHTML = '添加成功';
  document.getElementById('newAdminUser').value = '';
  document.getElementById('newAdminPass').value = '';
  await loadAdmins();
}

async function deleteAdmin(u){
  const cur = sessionStorage.getItem('lct_session');
  if(u === cur && !confirm('确定删除当前登录账号？删除后将自动退出登录')){
    return;
  }

  const { error } = await sb.rpc('delete_admin', {
    ...currentCreds(),
    p_target_username: u
  });

  if(error){
    alert(error.message.includes('至少保留') ? '至少保留一个管理员账号' : '删除失败：' + error.message);
    return;
  }

  if(u === cur){
    logout();
  } else {
    await loadAdmins();
  }
}

function renderAdminList(admins){
  const cur = sessionStorage.getItem('lct_session');
  const ul = document.getElementById('adminList');
  ul.innerHTML = admins.map(a => {
    const roleLabel = a.role === 'super' ? '超级管理员' : '普通管理员';
    return `
    <li>
      <span>${a.username} <em class="role-tag">${roleLabel}</em>${a.username === cur ? ' <em>（当前登录）</em>' : ''}</span>
      ${admins.length > 1 ? `<button class="ghost-btn small" onclick="deleteAdmin('${a.username}')">删除</button>` : ''}
    </li>
  `;
  }).join('');
}

/* ---------- 页面加载时：若本次会话已登录则自动进入后台 ---------- */
document.addEventListener('DOMContentLoaded', function(){
  if(document.getElementById('dashboard') && sessionStorage.getItem('lct_session')){
    showDashboard();
  }
});
