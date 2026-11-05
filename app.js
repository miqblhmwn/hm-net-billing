/**
 * HM NET - Billing & Device Optical Management System
 * Core Application Logic, State Store & Authentication
 */

const STORAGE_KEYS = {
  CUSTOMERS: 'hmnet_customers_v1',
  BILLS: 'hmnet_bills_v1',
  EXPENSES: 'hmnet_expenses_v1',
  AUTH_SESSION: 'hmnet_auth_session_v1',
  ADMIN_ACCOUNT: 'hmnet_admin_account_v1',
  USERS: 'hmnet_users_v2'
};

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: 'Admin HM NET',
  role: 'Pengelola Utama (Full Access)'
};

const DEFAULT_USERS = [
  {
    id: 'u-admin-root',
    username: 'admin',
    password: 'admin123',
    name: 'Admin Utama (HM NET)',
    role: 'SUPER_ADMIN',
    roleLabel: 'Admin Utama (Induk)',
    isParent: true,
    status: 'AKTIF',
    createdAt: '2026-01-01',
    permissions: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: true,
      pelanggan_delete: true,
      tagihan_view: true,
      tagihan_edit: true,
      tagihan_wa: true,
      keuangan_view: true,
      keuangan_edit: true,
      backup_data: true,
      manage_users: true
    }
  },
  {
    id: 'u-teknisi-1',
    username: 'teknisi',
    password: 'teknisi123',
    name: 'Rian (Teknisi Lapangan)',
    role: 'TEKNISI',
    roleLabel: 'Teknisi Lapangan',
    isParent: false,
    status: 'AKTIF',
    createdAt: '2026-02-15',
    permissions: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: true,
      pelanggan_delete: false,
      tagihan_view: true,
      tagihan_edit: false,
      tagihan_wa: false,
      keuangan_view: false,
      keuangan_edit: false,
      backup_data: false,
      manage_users: false
    }
  },
  {
    id: 'u-kasir-1',
    username: 'kasir',
    password: 'kasir123',
    name: 'Dewi (Kasir & Tagihan)',
    role: 'KASIR',
    roleLabel: 'Kasir & Tagihan',
    isParent: false,
    status: 'AKTIF',
    createdAt: '2026-03-01',
    permissions: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: false,
      pelanggan_delete: false,
      tagihan_view: true,
      tagihan_edit: true,
      tagihan_wa: true,
      keuangan_view: false,
      keuangan_edit: false,
      backup_data: false,
      manage_users: false
    }
  }
];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Initial Sample Data (Representing sample data from design document)
const INITIAL_CUSTOMERS = [
  {
    id: 'c-1',
    name: 'Falah',
    phone: '081234567891',
    address: 'Jl. Utama RT 01 RW 01',
    modemType: 'XPON ZTE',
    sn: 'ZTEGd3be73c7',
    ontStatus: 'NEW',
    pon: '1',
    redaman: -18.4,
    speed: '10 Mbps',
    price: 150000,
    status: 'AKTIF',
    installedDate: '2026-01-15'
  },
  {
    id: 'c-2',
    name: 'Agung',
    phone: '085798765432',
    address: 'Gang Mawar No. 12',
    modemType: 'GGCLink',
    sn: 'GGCLcb556b34',
    ontStatus: 'SECOND',
    pon: '2',
    redaman: -24.8,
    speed: '8 Mbps',
    price: 100000,
    status: 'AKTIF',
    installedDate: '2026-02-10'
  },
  {
    id: 'c-3',
    name: 'Pak Rudi',
    phone: '082155443322',
    address: 'Ujung Jalur PON 1',
    modemType: 'Fiberhome',
    sn: 'FHBB883921AA',
    ontStatus: 'GANTI',
    pon: '1',
    redaman: -28.2,
    speed: '12 Mbps',
    price: 175000,
    status: 'AKTIF',
    installedDate: '2026-03-05'
  },
  {
    id: 'c-4',
    name: 'Bu Siti Khodijah',
    phone: '081399887766',
    address: 'Kompleks HM Net Blok B',
    modemType: 'GPON ZTE',
    sn: 'ZTEG778844FF',
    ontStatus: 'NEW',
    pon: '2',
    redaman: -21.0,
    speed: '10 Mbps',
    price: 150000,
    status: 'AKTIF',
    installedDate: '2026-04-01'
  },
  {
    id: 'c-5',
    name: 'Mas Dedi Warnet',
    phone: '089876543210',
    address: 'Dekat Tiang ODP 04',
    modemType: 'Huawei',
    sn: 'HWTC11223344',
    ontStatus: 'NEW',
    pon: '1',
    redaman: -17.5,
    speed: '30 Mbps',
    price: 350000,
    status: 'AKTIF',
    installedDate: '2026-01-20'
  }
];

const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    category: 'Bandwidth Utama',
    notes: 'Biaya Bandwidth utama ISP Pokok (Dedicated)',
    amount: 2370000,
    year: 2026,
    month: 11, // November
    date: '2026-11-02'
  },
  {
    id: 'exp-2',
    category: 'Bandwidth Utama',
    notes: 'Biaya Bandwidth utama ISP Pokok',
    amount: 2370000,
    year: 2026,
    month: 10, // Oktober
    date: '2026-10-02'
  },
  {
    id: 'exp-3',
    category: 'Bandwidth Utama',
    notes: 'Biaya Bandwidth utama ISP Pokok',
    amount: 2370000,
    year: 2026,
    month: 9, // September
    date: '2026-09-02'
  }
];

// App State
let state = {
  currentUser: null,
  customers: [],
  bills: [],
  expenses: [],
  currentTab: 'dashboard',
  selectedYear: 2026,
  selectedMonth: 11, // 1 to 12 (November 2026 default)
  gridMode: 'matrix', // 'matrix' or 'single'
  financialChartInstance: null
};

// ==========================================
// USER MANAGEMENT & AUTHENTICATION STORE (RBAC)
// ==========================================
function getUsersList() {
  const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
  let users = null;

  if (!usersJson) {
    // Migrate existing admin account if available
    users = JSON.parse(JSON.stringify(DEFAULT_USERS));
    const legacyAdminJson = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNT);
    if (legacyAdminJson) {
      try {
        const legacyAdmin = JSON.parse(legacyAdminJson);
        if (legacyAdmin.username) {
          users[0].username = legacyAdmin.username;
          users[0].password = (legacyAdmin.password && legacyAdmin.password !== 'admin') ? legacyAdmin.password : 'admin123';
          users[0].name = legacyAdmin.name || users[0].name;
        }
      } catch (e) {}
    }
    saveUsersList(users);
    return users;
  }

  try {
    users = JSON.parse(usersJson);
  } catch (e) {
    users = JSON.parse(JSON.stringify(DEFAULT_USERS));
  }

  // Sanitize & Sync:
  // 1) Never allow weak "user: admin, pass: admin" in storage
  let modified = false;
  const legacyAdminJson = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNT);
  if (legacyAdminJson && !localStorage.getItem('hmnet_legacy_synced_v3')) {
    try {
      const legacyAdmin = JSON.parse(legacyAdminJson);
      const rootIdx = users.findIndex(u => u.isParent);
      if (rootIdx !== -1 && legacyAdmin.username && legacyAdmin.username.toLowerCase() !== 'admin' && users[rootIdx].username.toLowerCase() === 'admin') {
        users[rootIdx].username = legacyAdmin.username;
        users[rootIdx].password = legacyAdmin.password || users[rootIdx].password;
        users[rootIdx].name = legacyAdmin.name || users[rootIdx].name;
        modified = true;
      }
      localStorage.setItem('hmnet_legacy_synced_v3', '1');
    } catch (e) {}
  }

  const customSuperAdmins = users.filter(u => u.username.toLowerCase() !== 'admin' && u.status === 'AKTIF' && u.permissions?.manage_users);

  users.forEach(u => {
    if (u.username.toLowerCase() === 'admin' && u.password === 'admin') {
      // Upgrade weak "admin / admin" password
      u.password = 'admin123';
      modified = true;
    }
    // If user already created their own custom Super Admin, auto-disable leftover default "admin" once
    if (u.username.toLowerCase() === 'admin' && customSuperAdmins.length > 0 && !localStorage.getItem('hmnet_default_admin_disabled_v3')) {
      u.status = 'NONAKTIF';
      localStorage.setItem('hmnet_default_admin_disabled_v3', '1');
      modified = true;
    }
  });

  if (modified) {
    saveUsersList(users);
  }

  return users;
}

function saveUsersList(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  // Keep legacy admin key synced with root admin
  const rootAdmin = users.find(u => u.isParent) || users[0];
  if (rootAdmin) {
    saveAdminAccount({
      username: rootAdmin.username,
      password: rootAdmin.password,
      name: rootAdmin.name,
      role: rootAdmin.roleLabel || 'Pengelola Utama (Full Access)'
    });
  }
}

function getAdminAccount() {
  const users = getUsersList();
  const rootAdmin = users.find(u => u.isParent) || users[0];
  if (rootAdmin) {
    return {
      username: rootAdmin.username,
      password: rootAdmin.password,
      name: rootAdmin.name,
      role: rootAdmin.roleLabel || 'Pengelola Utama (Full Access)'
    };
  }
  return DEFAULT_ADMIN;
}

function saveAdminAccount(account) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNT, JSON.stringify(account));
}

function checkAuthSession() {
  const sessionJson = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (sessionJson) {
    try {
      const savedUser = JSON.parse(sessionJson);
      const users = getUsersList();
      const current = users.find(u => u.username.toLowerCase() === savedUser.username.toLowerCase());
      if (current && current.status === 'AKTIF') {
        state.currentUser = current;
        showAppView();
        return true;
      }
    } catch (e) {
      state.currentUser = null;
    }
  }
  showLoginView();
  return false;
}

function showLoginView() {
  const viewLogin = document.getElementById('view-login');
  const viewApp = document.getElementById('view-app');
  if (viewLogin) viewLogin.classList.remove('hidden');
  if (viewApp) viewApp.classList.add('hidden');

  // Pastikan form login bersih dan kosong
  const form = document.getElementById('form-login');
  if (form) form.reset();
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  if (uInput) uInput.value = '';
  if (pInput) pInput.value = '';
}

function applyUserPermissions(user) {
  if (!user) return;
  const perms = user.permissions || {
    dashboard: true,
    pelanggan_view: true,
    pelanggan_edit: true,
    pelanggan_delete: true,
    tagihan_view: true,
    tagihan_edit: true,
    tagihan_wa: true,
    keuangan_view: true,
    keuangan_edit: true,
    backup_data: true,
    manage_users: true
  };

  // 1. Sidebar Nav Visibility
  const sideDashboard = document.getElementById('side-dashboard');
  if (sideDashboard) {
    sideDashboard.style.display = perms.dashboard ? 'flex' : 'none';
  }

  const sidePelanggan = document.getElementById('side-pelanggan');
  if (sidePelanggan) {
    sidePelanggan.style.display = perms.pelanggan_view ? 'flex' : 'none';
  }

  const sideTagihan = document.getElementById('side-tagihan');
  if (sideTagihan) {
    sideTagihan.style.display = perms.tagihan_view ? 'flex' : 'none';
  }

  const sideKeuangan = document.getElementById('side-keuangan');
  if (sideKeuangan) {
    sideKeuangan.style.display = perms.keuangan_view ? 'flex' : 'none';
  }

  const sideUsers = document.getElementById('side-users');
  if (sideUsers) {
    sideUsers.style.display = perms.manage_users ? 'flex' : 'none';
  }

  // 2. Header user management button
  const headerBtnUsers = document.getElementById('header-btn-users');
  if (headerBtnUsers) {
    headerBtnUsers.style.display = perms.manage_users ? 'flex' : 'none';
  }

  // 3. Backup / Restore / Excel quick tools
  const dataDropdownBtn = document.querySelector('button[onclick="toggleDataDropdown()"]');
  if (dataDropdownBtn && dataDropdownBtn.parentElement) {
    dataDropdownBtn.parentElement.style.display = perms.backup_data ? 'block' : 'none';
  }

  // 4. Update Header & Drawer identity
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'AD';
  
  const hAvatar = document.getElementById('header-user-avatar');
  const dAvatar = document.getElementById('drawer-user-avatar');
  if (hAvatar) hAvatar.textContent = initials;
  if (dAvatar) dAvatar.textContent = initials;

  const hName = document.getElementById('header-user-name');
  const hRole = document.getElementById('header-user-role');
  const dName = document.getElementById('dropdown-user-name');
  const dRole = document.getElementById('dropdown-user-role');
  const drwName = document.getElementById('drawer-user-name');
  const drwRole = document.getElementById('drawer-user-role');

  if (hName) hName.textContent = user.name || 'Pengguna HM NET';
  if (hRole) hRole.textContent = user.roleLabel || 'Pengguna';
  if (dName) dName.textContent = user.name || 'Pengguna HM NET';
  if (dRole) dRole.textContent = `Hak Akses: ${user.roleLabel || user.role || 'Staf'}`;
  if (drwName) drwName.textContent = user.name || 'Pengguna HM NET';
  if (drwRole) drwRole.textContent = user.roleLabel || 'Staf HM NET';
}

function showAppView() {
  const viewLogin = document.getElementById('view-login');
  const viewApp = document.getElementById('view-app');
  if (viewLogin) viewLogin.classList.add('hidden');
  if (viewApp) viewApp.classList.remove('hidden');

  applyUserPermissions(state.currentUser);
  if (window.lucide) lucide.createIcons();
}

function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
  const passwordInput = document.getElementById('login-password').value;
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');

  // Tolak kombinasi lemah "user: admin, pass: admin" secara mutlak
  if (usernameInput === 'admin' && passwordInput === 'admin') {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Login default (user: admin, pass: admin) telah dinonaktifkan demi keamanan sistem!';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  const users = getUsersList();
  const user = users.find(u => u.username.toLowerCase() === usernameInput && u.password === passwordInput);

  if (!user) {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Username atau Password salah! Periksa kembali data login Anda.';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (user.status !== 'AKTIF') {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Akun Anda dinonaktifkan oleh Admin Utama. Hubungi Admin Induk untuk membuka akses.';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (errorAlert) errorAlert.classList.add('hidden');

  state.currentUser = user;
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(state.currentUser));
  
  showAppView();
  initApp();
  showToast(`Selamat datang, ${user.name}!`);
}

function handleLogout() {
  if (confirm('Yakin ingin keluar dari sistem HM NET?')) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    state.currentUser = null;
    showLoginView();
    showToast('Anda telah berhasil keluar (logout).');
  }
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.setAttribute('data-lucide', 'eye-off');
  } else {
    input.type = 'password';
    if (icon) icon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) lucide.createIcons();
}

function toggleUserDropdown() {
  const dd = document.getElementById('user-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

function openModalAccountSettings() {
  const modal = document.getElementById('modal-account-settings');
  const form = document.getElementById('form-account-settings');
  if (form) form.reset();

  const user = state.currentUser || getAdminAccount();
  const nameInput = document.getElementById('acc-name');
  const userInput = document.getElementById('acc-username');
  if (nameInput) nameInput.value = user.name || 'Admin HM NET';
  if (userInput) userInput.value = user.username || 'admin';

  const oldPwd = document.getElementById('acc-old-password');
  const newPwd = document.getElementById('acc-new-password');
  const confirmPwd = document.getElementById('acc-confirm-password');
  if (oldPwd) oldPwd.value = '';
  if (newPwd) newPwd.value = '';
  if (confirmPwd) confirmPwd.value = '';

  if (modal) modal.classList.remove('hidden');
  document.getElementById('user-dropdown')?.classList.add('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalAccountSettings() {
  document.getElementById('modal-account-settings')?.classList.add('hidden');
}

// Backward-compatible aliases
function openModalChangePassword() {
  openModalAccountSettings();
}

function closeModalChangePassword() {
  closeModalAccountSettings();
}

function saveAccountSettings(e) {
  e.preventDefault();
  const newName = document.getElementById('acc-name').value.trim();
  const newUsername = document.getElementById('acc-username').value.trim().toLowerCase();
  const oldPwd = document.getElementById('acc-old-password').value;
  const newPwd = document.getElementById('acc-new-password').value;
  const confirmPwd = document.getElementById('acc-confirm-password').value;

  const users = getUsersList();
  const currentUser = state.currentUser || users[0];
  const userRecord = users.find(u => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase()) || users[0];

  // 1. Verifikasi Password Lama
  if (oldPwd !== userRecord.password) {
    alert('Password saat ini (lama) yang Anda masukkan tidak sesuai!');
    document.getElementById('acc-old-password').focus();
    return;
  }

  // 2. Validasi Username
  if (!newUsername || newUsername.length < 3) {
    alert('Username login minimal 3 karakter tanpa spasi!');
    document.getElementById('acc-username').focus();
    return;
  }

  // Cek jika username sudah dipakai akun lain
  const dup = users.find(u => u.id !== userRecord.id && u.username.toLowerCase() === newUsername);
  if (dup) {
    alert(`Username "${newUsername}" sudah digunakan oleh akun lain! Gunakan username berbeda.`);
    document.getElementById('acc-username').focus();
    return;
  }

  // 3. Validasi & Ganti Password jika diisi
  let passwordChanged = false;
  if (newPwd) {
    if (newPwd.length < 4) {
      alert('Password baru minimal 4 karakter!');
      document.getElementById('acc-new-password').focus();
      return;
    }
    if (newPwd !== confirmPwd) {
      alert('Konfirmasi password baru tidak cocok dengan password baru!');
      document.getElementById('acc-confirm-password').focus();
      return;
    }
    userRecord.password = newPwd;
    passwordChanged = true;
  }

  // 4. Update data user di users list
  userRecord.name = newName || userRecord.name;
  userRecord.username = newUsername;
  saveUsersList(users);

  // 5. Update session aktif
  state.currentUser = { ...userRecord };
  localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(state.currentUser));

  // 6. Refresh nama di header & drawer
  showAppView();
  closeModalAccountSettings();

  const statusMsg = passwordChanged 
    ? `Akun diperbarui! Username: "${userRecord.username}" & Password baru aktif.` 
    : `Akun diperbarui! Username login Anda sekarang: "${userRecord.username}".`;
  showToast(statusMsg);
}

// ==========================================
// INITIALIZATION
// ==========================================
function initApp() {
  loadData();
  setupDateSelectors();
  renderDashboard();
  renderTablePelanggan();
  renderGridTagihan();
  renderExpenses();
  if (state.currentUser?.permissions?.manage_users) {
    renderTableUsers();
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const dataDd = document.getElementById('data-dropdown');
    if (dataDd && !e.target.closest('#data-dropdown') && !e.target.closest('button[onclick="toggleDataDropdown()"]')) {
      dataDd.classList.add('hidden');
    }

    const userDd = document.getElementById('user-dropdown');
    if (userDd && !e.target.closest('#user-dropdown') && !e.target.closest('button[onclick="toggleUserDropdown()"]')) {
      userDd.classList.add('hidden');
    }
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

function loadData() {
  const custJson = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  if (!custJson) {
    state.customers = INITIAL_CUSTOMERS;
    saveCustomers();
  } else {
    try {
      state.customers = JSON.parse(custJson);
    } catch (e) {
      state.customers = INITIAL_CUSTOMERS;
    }
  }

  const expJson = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!expJson) {
    state.expenses = INITIAL_EXPENSES;
    saveExpenses();
  } else {
    try {
      state.expenses = JSON.parse(expJson);
    } catch (e) {
      state.expenses = INITIAL_EXPENSES;
    }
  }

  const billsJson = localStorage.getItem(STORAGE_KEYS.BILLS);
  if (!billsJson) {
    state.bills = generateSampleBills(state.customers);
    saveBills();
  } else {
    try {
      state.bills = JSON.parse(billsJson);
    } catch (e) {
      state.bills = [];
    }
  }
}

function generateSampleBills(customers) {
  const bills = [];
  customers.forEach(c => {
    // Okt 2026: all paid
    bills.push({
      id: `bill-${c.id}-2026-10`,
      customerId: c.id,
      year: 2026,
      month: 10,
      tariff: c.price,
      amountPaid: c.price,
      status: 'LUNAS',
      paymentDate: '2026-10-05',
      paymentMethod: 'Cash / Tunai',
      notes: 'Lunas tepat waktu'
    });

    // Nov 2026: mixed status
    if (c.id === 'c-1') {
      bills.push({
        id: `bill-${c.id}-2026-11`,
        customerId: c.id,
        year: 2026,
        month: 11,
        tariff: c.price,
        amountPaid: c.price,
        status: 'LUNAS',
        paymentDate: '2026-11-03',
        paymentMethod: 'Transfer BCA',
        notes: '- Desember Lunas'
      });
    } else if (c.id === 'c-2') {
      bills.push({
        id: `bill-${c.id}-2026-11`,
        customerId: c.id,
        year: 2026,
        month: 11,
        tariff: c.price,
        amountPaid: 50000,
        status: 'SEBAGIAN',
        paymentDate: '2026-11-02',
        paymentMethod: 'Cash / Tunai',
        notes: 'Bayar Sebagian (Sisa 50rb)'
      });
    } else {
      bills.push({
        id: `bill-${c.id}-2026-11`,
        customerId: c.id,
        year: 2026,
        month: 11,
        tariff: c.price,
        amountPaid: 0,
        status: 'BELUM',
        paymentDate: '',
        paymentMethod: '',
        notes: ''
      });
    }
  });
  return bills;
}

function saveCustomers() {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(state.customers));
}

function saveBills() {
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(state.bills));
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(state.expenses));
}

// ==========================================
// DATE & TAB LOGIC
// ==========================================
function setupDateSelectors() {
  const years = [2025, 2026, 2027];
  
  const dashYear = document.getElementById('dash-year-select');
  const dashMonth = document.getElementById('dash-month-select');
  const gridYear = document.getElementById('grid-year-select');
  const gridMonth = document.getElementById('grid-month-select');
  const expPeriod = document.getElementById('exp-period');

  const populate = (select, items, currentVal) => {
    if (!select) return;
    select.innerHTML = '';
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.value;
      opt.textContent = item.label;
      if (item.value == currentVal) opt.selected = true;
      select.appendChild(opt);
    });
  };

  const yearItems = years.map(y => ({ value: y, label: `Tahun ${y}` }));
  const monthItems = MONTH_NAMES.map((m, idx) => ({ value: idx + 1, label: m }));

  populate(dashYear, yearItems, state.selectedYear);
  populate(dashMonth, monthItems, state.selectedMonth);
  populate(gridYear, yearItems, state.selectedYear);
  populate(gridMonth, monthItems, state.selectedMonth);

  if (expPeriod) {
    const mm = String(state.selectedMonth).padStart(2, '0');
    expPeriod.value = `${state.selectedYear}-${mm}`;
  }
}

// ==========================================
// SIDEBAR DRAWER (TAB MENU GARIS 3)
// ==========================================
function toggleSidebar() {
  const drawer = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!drawer || !backdrop) return;

  const isClosed = drawer.classList.contains('-translate-x-full');
  if (isClosed) {
    openSidebar();
  } else {
    closeSidebar();
  }
}

function openSidebar() {
  const drawer = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.remove('-translate-x-full');
  backdrop.classList.remove('opacity-0', 'pointer-events-none');
  backdrop.classList.add('opacity-100', 'pointer-events-auto');
}

function closeSidebar() {
  const drawer = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.add('-translate-x-full');
  backdrop.classList.remove('opacity-100', 'pointer-events-auto');
  backdrop.classList.add('opacity-0', 'pointer-events-none');
}

function navSelect(tabId) {
  switchTab(tabId);
  closeSidebar();
}

function switchTab(tabId) {
  const user = state.currentUser;
  const perms = user?.permissions || {
    dashboard: true,
    pelanggan_view: true,
    tagihan_view: true,
    keuangan_view: true,
    manage_users: true
  };

  // Check permission for requested tab
  if (tabId === 'keuangan' && !perms.keuangan_view) {
    showToast('Akses ditolak: Anda tidak memiliki izin melihat menu Keuangan!');
    return;
  }
  if (tabId === 'users' && !perms.manage_users) {
    showToast('Akses ditolak: Menu Kelola Akun khusus untuk Admin Utama!');
    return;
  }
  if (tabId === 'pelanggan' && !perms.pelanggan_view) {
    showToast('Akses ditolak: Anda tidak memiliki izin melihat Master Pelanggan!');
    return;
  }
  if (tabId === 'tagihan' && !perms.tagihan_view) {
    showToast('Akses ditolak: Anda tidak memiliki izin melihat Tagihan Bulanan!');
    return;
  }

  state.currentTab = tabId;

  const tabLabels = {
    dashboard: 'Dashboard',
    pelanggan: 'Master Pelanggan & ONT',
    tagihan: 'Tagihan & Grid Bulanan',
    keuangan: 'Pengeluaran & Laba',
    users: 'Kelola Akun Anak & Hak Akses'
  };

  const badge = document.getElementById('current-page-badge');
  if (badge) {
    badge.textContent = tabLabels[tabId] || 'Dashboard';
  }

  // Toggle Sections & Sidebar items
  ['dashboard', 'pelanggan', 'tagihan', 'keuangan', 'users'].forEach(id => {
    const el = document.getElementById(`tab-${id}`);
    const sideBtn = document.getElementById(`side-${id}`);
    
    if (el) {
      if (id === tabId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }

    if (sideBtn) {
      if (id === tabId) {
        sideBtn.className = 'side-nav-item w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition bg-brand-50 text-brand-700';
      } else {
        sideBtn.className = 'side-nav-item w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition';
      }
    }
  });

  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'pelanggan') {
    renderTablePelanggan();
  } else if (tabId === 'tagihan') {
    renderGridTagihan();
  } else if (tabId === 'keuangan') {
    renderExpenses();
  } else if (tabId === 'users') {
    renderTableUsers();
  }

  if (window.lucide) lucide.createIcons();
}

function toggleDataDropdown() {
  const dd = document.getElementById('data-dropdown');
  if (dd) dd.classList.toggle('hidden');
}

// ==========================================
// REDAMAN HELPER (According to HM NET Specification)
// Hijau: >= -23 dB
// Kuning: -24 s.d -26 dB
// Merah: < -27 dB
// ==========================================
function getRedamanClassification(val) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    return {
      category: 'UNKNOWN',
      label: 'Unknown',
      colorClass: 'bg-slate-100 text-slate-600 border-slate-300',
      badgeClass: 'bg-slate-400'
    };
  }
  
  if (num >= -23.0) {
    return {
      category: 'GOOD',
      label: 'Bagus / Normal',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      badgeClass: 'bg-emerald-500'
    };
  } else if (num >= -26.9) {
    return {
      category: 'WARNING',
      label: 'Waspada',
      colorClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      badgeClass: 'bg-amber-500'
    };
  } else {
    // < -27 dB
    return {
      category: 'BAD',
      label: 'Kritis',
      colorClass: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      badgeClass: 'bg-rose-500'
    };
  }
}

function previewRedamanColor() {
  const input = document.getElementById('cust-redaman');
  const preview = document.getElementById('preview-redaman-badge');
  if (!input || !preview) return;

  const val = input.value;
  if (!val) {
    preview.className = 'px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 bg-slate-100 text-slate-600';
    preview.innerHTML = '<span>Indikator Otomatis</span>';
    return;
  }

  const info = getRedamanClassification(val);
  preview.className = `px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border ${info.colorClass}`;
  preview.innerHTML = `<span class="w-2 h-2 rounded-full ${info.badgeClass}"></span><span>${val} dB (${info.label})</span>`;
}

// ==========================================
// TAB 1: DASHBOARD
// ==========================================
function renderDashboard() {
  const mSelect = document.getElementById('dash-month-select');
  const ySelect = document.getElementById('dash-year-select');

  if (mSelect) state.selectedMonth = parseInt(mSelect.value) || state.selectedMonth;
  if (ySelect) state.selectedYear = parseInt(ySelect.value) || state.selectedYear;

  const activeMonthBills = state.bills.filter(b => b.year === state.selectedYear && b.month === state.selectedMonth);

  const totalPemasukan = activeMonthBills.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
  const paidCount = activeMonthBills.filter(b => b.status === 'LUNAS').length;

  const monthExpenses = state.expenses.filter(e => e.year === state.selectedYear && e.month === state.selectedMonth);
  const totalExpenses = monthExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netProfit = totalPemasukan - totalExpenses;

  let totalPiutang = 0;
  let unpaidCount = 0;
  activeMonthBills.forEach(b => {
    const sisa = (Number(b.tariff) || 0) - (Number(b.amountPaid) || 0);
    if (sisa > 0) {
      totalPiutang += sisa;
      unpaidCount++;
    }
  });

  const pEl = document.getElementById('stat-pemasukan');
  const pcEl = document.getElementById('stat-paid-count');
  const bEl = document.getElementById('stat-bandwidth');
  const profitEl = document.getElementById('stat-profit');
  const piuEl = document.getElementById('stat-piutang');
  const piucEl = document.getElementById('stat-unpaid-count');

  if (pEl) pEl.textContent = formatRupiah(totalPemasukan);
  if (pcEl) pcEl.textContent = `${paidCount} pelanggan lunas`;
  if (bEl) bEl.textContent = formatRupiah(totalExpenses);
  
  if (profitEl) {
    profitEl.textContent = formatRupiah(netProfit);
    profitEl.className = netProfit < 0 ? 'text-2xl font-black text-rose-600' : 'text-2xl font-black text-brand-700';
  }

  if (piuEl) piuEl.textContent = formatRupiah(totalPiutang);
  if (piucEl) piucEl.textContent = `${unpaidCount} belum lunas`;

  // Redaman Statistics
  let countGood = 0;
  let countWarning = 0;
  let countBad = 0;

  state.customers.forEach(c => {
    const cat = getRedamanClassification(c.redaman).category;
    if (cat === 'GOOD') countGood++;
    else if (cat === 'WARNING') countWarning++;
    else if (cat === 'BAD') countBad++;
  });

  const rgEl = document.getElementById('stat-redaman-good');
  const rwEl = document.getElementById('stat-redaman-warning');
  const rbEl = document.getElementById('stat-redaman-bad');
  const toEl = document.getElementById('stat-total-ont');

  if (rgEl) rgEl.textContent = `${countGood} Unit`;
  if (rwEl) rwEl.textContent = `${countWarning} Unit`;
  if (rbEl) rbEl.textContent = `${countBad} Unit`;
  if (toEl) toEl.textContent = `${state.customers.length} Pelanggan`;

  renderFinancialChart();
}

function renderFinancialChart() {
  const canvas = document.getElementById('financialChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (state.financialChartInstance) {
    state.financialChartInstance.destroy();
  }

  const labels = [];
  const incomeData = [];
  const expenseData = [];

  for (let i = 5; i >= 0; i--) {
    let m = state.selectedMonth - i;
    let y = state.selectedYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }

    labels.push(`${MONTH_NAMES[m - 1].substring(0, 3)} ${y}`);

    const mBills = state.bills.filter(b => b.year === y && b.month === m);
    const inc = mBills.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    incomeData.push(inc);

    const mExp = state.expenses.filter(e => e.year === y && e.month === m);
    const exp = mExp.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    expenseData.push(exp);
  }

  state.financialChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pemasukan (Rp)',
          data: incomeData,
          backgroundColor: '#16a34a',
          borderRadius: 8,
          barPercentage: 0.6
        },
        {
          label: 'Beban Bandwidth & Biaya (Rp)',
          data: expenseData,
          backgroundColor: '#f43f5e',
          borderRadius: 8,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatRupiah(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'Rp ' + (value / 1000).toLocaleString('id-ID') + 'k';
            },
            font: { family: 'Plus Jakarta Sans', size: 10 }
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: { font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}

// ==========================================
// TAB 2: MASTER PELANGGAN & PERANGKAT (ONT)
// ==========================================
function renderTablePelanggan() {
  const tbody = document.getElementById('tbody-pelanggan');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-pelanggan')?.value || '').toLowerCase().trim();
  const filterPon = document.getElementById('filter-pon')?.value || 'ALL';
  const filterStatusOnt = document.getElementById('filter-status-ont')?.value || 'ALL';

  const filtered = state.customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery) ||
                          c.sn.toLowerCase().includes(searchQuery) ||
                          c.modemType.toLowerCase().includes(searchQuery) ||
                          (c.address && c.address.toLowerCase().includes(searchQuery));
    const matchesPon = filterPon === 'ALL' || String(c.pon) === String(filterPon);
    const matchesOnt = filterStatusOnt === 'ALL' || c.ontStatus === filterStatusOnt;
    return matchesSearch && matchesPon && matchesOnt;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="py-8 text-center text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
          Tidak ada data pelanggan yang cocok dengan kriteria pencarian.
        </td>
      </tr>
    `;
    updatePelangganCounters(0, state.customers.length);
    if (window.lucide) lucide.createIcons();
    return;
  }

  const userPerms = state.currentUser?.permissions || {
    pelanggan_edit: true,
    pelanggan_delete: true,
    tagihan_wa: true
  };

  filtered.forEach((c, idx) => {
    const redamanInfo = getRedamanClassification(c.redaman);
    
    let ontBadge = 'bg-slate-100 text-slate-800 border-slate-300';
    if (c.ontStatus === 'NEW') ontBadge = 'bg-blue-50 text-blue-700 border-blue-200';
    if (c.ontStatus === 'SECOND') ontBadge = 'bg-amber-50 text-amber-700 border-amber-200';
    if (c.ontStatus === 'GANTI') ontBadge = 'bg-purple-50 text-purple-700 border-purple-200';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';
    tr.innerHTML = `
      <td class="py-3 px-4 text-slate-400 font-bold">${idx + 1}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${c.name}</div>
        <div class="text-[11px] text-slate-400">
          ${c.address ? `${c.address}` : '-'}
        </div>
      </td>
      <td class="py-3 px-4">
        ${c.phone ? `
          <div class="flex items-center space-x-1.5">
            <span class="font-mono text-xs font-bold text-slate-800">${c.phone}</span>
            ${userPerms.tagihan_wa ? `
              <button onclick="openModalWhatsApp('${c.id}', state.selectedYear, state.selectedMonth)" title="Kirim Tagihan WA Langsung" class="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        ` : `
          ${userPerms.pelanggan_edit ? `
            <button onclick="openModalPelanggan('${c.id}')" class="text-[11px] font-semibold text-amber-600 hover:text-amber-700 hover:underline flex items-center space-x-1">
              <i data-lucide="phone-plus" class="w-3.5 h-3.5"></i>
              <span>+ Tambah No. WA</span>
            </button>
          ` : '<span class="text-[11px] text-slate-400">-</span>'}
        `}
      </td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-800">${c.modemType}</div>
        <div class="text-[11px] font-mono text-slate-500">${c.sn}</div>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-extrabold border ${ontBadge}">${c.ontStatus}</span>
      </td>
      <td class="py-3 px-4 text-center font-bold text-slate-700">
        <span class="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">PON ${c.pon}</span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs ${redamanInfo.colorClass}">
          <span class="w-2 h-2 rounded-full ${redamanInfo.badgeClass}"></span>
          <span>${Number(c.redaman).toFixed(1)} dB</span>
        </span>
      </td>
      <td class="py-3 px-4 font-bold text-slate-700">${c.speed}</td>
      <td class="py-3 px-4 text-right font-extrabold text-slate-900">${formatRupiah(c.price)}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center space-x-1">
          ${userPerms.tagihan_wa ? `
            <button onclick="openModalWhatsApp('${c.id}', state.selectedYear, state.selectedMonth)" title="Kirim Tagihan WA" class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition">
              <i data-lucide="message-circle" class="w-4 h-4"></i>
            </button>
          ` : ''}
          ${userPerms.pelanggan_edit ? `
            <button onclick="openModalPelanggan('${c.id}')" title="Edit Data" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
          ` : ''}
          <button onclick="openModalHistory('${c.id}')" title="Histori Pembayaran" class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition">
            <i data-lucide="history" class="w-4 h-4"></i>
          </button>
          ${userPerms.pelanggan_delete ? `
            <button onclick="deletePelanggan('${c.id}')" title="Hapus Pelanggan" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updatePelangganCounters(filtered.length, state.customers.length);
  if (window.lucide) lucide.createIcons();
}

function updatePelangganCounters(displayed, total) {
  const dEl = document.getElementById('count-displayed-pelanggan');
  const tEl = document.getElementById('count-total-pelanggan');
  if (dEl) dEl.textContent = displayed;
  if (tEl) tEl.textContent = total;
}

function openModalPelanggan(customerId = null) {
  const modal = document.getElementById('modal-pelanggan');
  const form = document.getElementById('form-pelanggan');
  const title = document.getElementById('modal-pelanggan-title');

  form.reset();
  document.getElementById('cust-id').value = '';

  if (customerId) {
    const cust = state.customers.find(c => c.id === customerId);
    if (cust) {
      title.textContent = `Edit Pelanggan: ${cust.name}`;
      document.getElementById('cust-id').value = cust.id;
      document.getElementById('cust-name').value = cust.name;
      document.getElementById('cust-phone').value = cust.phone || '';
      document.getElementById('cust-address').value = cust.address || '';
      document.getElementById('cust-modem-type').value = cust.modemType;
      document.getElementById('cust-sn').value = cust.sn;
      document.getElementById('cust-ont-status').value = cust.ontStatus;
      document.getElementById('cust-pon').value = cust.pon;
      document.getElementById('cust-redaman').value = cust.redaman;
      document.getElementById('cust-speed').value = cust.speed;
      document.getElementById('cust-price').value = cust.price;
      document.getElementById('cust-status').value = cust.status || 'AKTIF';
      document.getElementById('cust-installed-date').value = cust.installedDate || '';
    }
  } else {
    title.textContent = 'Tambah Pelanggan & Spesifikasi ONT';
    document.getElementById('cust-modem-type').value = 'XPON ZTE';
    document.getElementById('cust-ont-status').value = 'NEW';
    document.getElementById('cust-pon').value = '1';
    document.getElementById('cust-redaman').value = '-18.5';
    document.getElementById('cust-speed').value = '10 Mbps';
    document.getElementById('cust-price').value = '100000';
    document.getElementById('cust-status').value = 'AKTIF';
  }

  previewRedamanColor();
  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalPelanggan() {
  document.getElementById('modal-pelanggan')?.classList.add('hidden');
}

function savePelanggan(e) {
  e.preventDefault();
  if (state.currentUser && !state.currentUser.permissions?.pelanggan_edit) {
    alert('Akses ditolak: Anda tidak memiliki izin untuk menambah atau mengedit pelanggan.');
    return;
  }
  const id = document.getElementById('cust-id').value;
  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const address = document.getElementById('cust-address').value.trim();
  const modemType = document.getElementById('cust-modem-type').value;
  const sn = document.getElementById('cust-sn').value.trim();
  const ontStatus = document.getElementById('cust-ont-status').value;
  const pon = document.getElementById('cust-pon').value;
  const redaman = parseFloat(document.getElementById('cust-redaman').value) || 0;
  const speed = document.getElementById('cust-speed').value;
  const price = parseInt(document.getElementById('cust-price').value) || 0;
  const status = document.getElementById('cust-status').value;
  const installedDate = document.getElementById('cust-installed-date').value;

  if (id) {
    const idx = state.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      state.customers[idx] = {
        ...state.customers[idx],
        name, phone, address, modemType, sn, ontStatus, pon, redaman, speed, price, status, installedDate
      };
      showToast('Data pelanggan berhasil diperbarui!');
    }
  } else {
    const newCust = {
      id: 'c-' + Date.now(),
      name, phone, address, modemType, sn, ontStatus, pon, redaman, speed, price, status, installedDate
    };
    state.customers.push(newCust);
    showToast('Pelanggan baru berhasil ditambahkan!');
    ensureBillForCustomer(newCust, state.selectedYear, state.selectedMonth);
  }

  saveCustomers();
  closeModalPelanggan();
  renderTablePelanggan();
  renderDashboard();
  renderGridTagihan();
}

function deletePelanggan(customerId) {
  if (state.currentUser && !state.currentUser.permissions?.pelanggan_delete) {
    alert('Akses ditolak: Anda tidak memiliki izin untuk menghapus data pelanggan.');
    return;
  }
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  if (confirm(`Yakin ingin menghapus pelanggan "${cust.name}" (SN: ${cust.sn})? Data tagihan terkait juga akan terhapus.`)) {
    state.customers = state.customers.filter(c => c.id !== customerId);
    state.bills = state.bills.filter(b => b.customerId !== customerId);
    saveCustomers();
    saveBills();
    renderTablePelanggan();
    renderDashboard();
    renderGridTagihan();
    showToast(`Pelanggan ${cust.name} berhasil dihapus.`);
  }
}

// ==========================================
// TAB 3: TAGIHAN & GRID BULANAN (SHEETS VIEW)
// ==========================================
function setGridMode(mode) {
  state.gridMode = mode;
  const btnMatrix = document.getElementById('btn-grid-matrix');
  const btnSingle = document.getElementById('btn-grid-single');
  const contMatrix = document.getElementById('container-grid-matrix');
  const contSingle = document.getElementById('container-grid-single');

  if (mode === 'matrix') {
    btnMatrix.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-brand-700';
    btnSingle.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
    contMatrix.classList.remove('hidden');
    contSingle.classList.add('hidden');
  } else {
    btnSingle.className = 'px-3 py-1.5 rounded-lg bg-white shadow-sm text-brand-700';
    btnMatrix.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
    contSingle.classList.remove('hidden');
    contMatrix.classList.add('hidden');
  }
  renderGridTagihan();
}

function renderGridTagihan() {
  const ySelect = document.getElementById('grid-year-select');
  const mSelect = document.getElementById('grid-month-select');
  if (ySelect) state.selectedYear = parseInt(ySelect.value) || state.selectedYear;
  if (mSelect) state.selectedMonth = parseInt(mSelect.value) || state.selectedMonth;

  if (state.gridMode === 'matrix') {
    renderGridMatrix();
  } else {
    renderGridSingleMonth();
  }
}

function renderGridMatrix() {
  const tbody = document.getElementById('tbody-grid-matrix');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentYear = state.selectedYear;

  state.customers.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-200 transition';

    let cellsHtml = `
      <td class="py-2.5 px-3 text-center text-slate-400 font-bold border-r border-slate-200 bg-slate-50">${idx + 1}</td>
      <td class="py-2.5 px-4 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-sm">
        <div class="font-bold text-slate-900">${c.name}</div>
        <div class="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
          <span class="px-1 bg-indigo-50 text-indigo-700 rounded font-semibold">PON ${c.pon}</span>
          <span>• ${c.speed}</span>
        </div>
      </td>
      <td class="py-2.5 px-3 text-right font-extrabold text-slate-800 border-r border-slate-200">${formatRupiah(c.price)}</td>
    `;

    // 12 Months Columns (Jan s/d Des)
    for (let m = 1; m <= 12; m++) {
      const bill = state.bills.find(b => b.customerId === c.id && b.year === currentYear && b.month === m);
      
      let cellStyle = 'bg-slate-50 text-slate-400 hover:bg-slate-100';
      let textStatus = '-';
      let titleTooltip = `Klik untuk catat tagihan ${MONTH_NAMES[m - 1]} ${currentYear}`;

      if (bill) {
        if (bill.status === 'LUNAS') {
          cellStyle = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black';
          textStatus = 'LUNAS';
          titleTooltip = `Lunas Rp ${formatRupiah(bill.amountPaid)} (Tgl: ${bill.paymentDate || '-'}) ${bill.notes ? 'Catatan: ' + bill.notes : ''}`;
        } else if (bill.status === 'SEBAGIAN') {
          cellStyle = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
          textStatus = `Sisa ${formatRupiah(bill.tariff - bill.amountPaid)}`;
          titleTooltip = `Bayar sebagian: ${formatRupiah(bill.amountPaid)} dari ${formatRupiah(bill.tariff)}`;
        } else {
          cellStyle = 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold';
          textStatus = 'BELUM';
          titleTooltip = `Belum bayar (${formatRupiah(bill.tariff)})`;
        }
      }

      const isSelectedMonth = m === state.selectedMonth;
      const highlightRing = isSelectedMonth ? 'ring-2 ring-brand-500 ring-inset' : '';

      cellsHtml += `
        <td class="py-1 px-1 text-center border-r border-slate-200 ${highlightRing}">
          <button onclick="handleGridCellClick('${c.id}', ${currentYear}, ${m})" title="${titleTooltip}" class="grid-cell w-full py-1.5 px-1 rounded text-[10px] uppercase font-bold truncate transition cursor-pointer shadow-xs ${cellStyle}">
            ${textStatus}
          </button>
        </td>
      `;
    }

    cellsHtml += `
      <td class="py-2 px-3 text-center">
        <div class="flex items-center justify-center space-x-1">
          <button onclick="openModalHistory('${c.id}')" title="Histori Pembayaran" class="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition">
            <i data-lucide="history" class="w-4 h-4"></i>
          </button>
          <button onclick="openModalWhatsApp('${c.id}', ${currentYear}, ${state.selectedMonth})" title="Kirim Tagihan / Kuitansi WhatsApp" class="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;

    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function renderGridSingleMonth() {
  const tbody = document.getElementById('tbody-grid-single');
  if (!tbody) return;

  tbody.innerHTML = '';
  const currentYear = state.selectedYear;
  const currentMonth = state.selectedMonth;

  state.customers.forEach((c, idx) => {
    let bill = state.bills.find(b => b.customerId === c.id && b.year === currentYear && b.month === currentMonth);
    
    if (!bill) {
      bill = {
        id: `bill-${c.id}-${currentYear}-${currentMonth}`,
        customerId: c.id,
        year: currentYear,
        month: currentMonth,
        tariff: c.price,
        amountPaid: 0,
        status: 'BELUM',
        paymentDate: '',
        paymentMethod: '',
        notes: ''
      };
    }

    let statusBadge = 'bg-rose-50 text-rose-800 border-rose-300';
    if (bill.status === 'LUNAS') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black';
    if (bill.status === 'SEBAGIAN') statusBadge = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 text-slate-400 font-bold">${idx + 1}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${c.name}</div>
        <div class="text-[11px] text-slate-500 font-mono">SN: ${c.sn} | PON ${c.pon} | ${c.speed}</div>
      </td>
      <td class="py-3 px-4 text-right font-extrabold text-slate-900">${formatRupiah(bill.tariff)}</td>
      <td class="py-3 px-4 text-center">
        <span class="px-2.5 py-1 rounded-md text-[11px] border font-bold uppercase ${statusBadge}">${bill.status}</span>
      </td>
      <td class="py-3 px-4 text-right font-black ${bill.amountPaid > 0 ? 'text-emerald-600' : 'text-slate-400'}">${formatRupiah(bill.amountPaid)}</td>
      <td class="py-3 px-4 text-slate-600 text-xs">${bill.paymentDate || '-'}</td>
      <td class="py-3 px-4 text-slate-600 text-xs italic">${bill.notes || '-'}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center space-x-1.5">
          <button onclick="handleGridCellClick('${c.id}', ${currentYear}, ${currentMonth})" class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition">
            Update Bayar
          </button>
          <button onclick="openModalWhatsApp('${c.id}', ${currentYear}, ${currentMonth})" title="Kirim Tagihan WA" class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function handleGridCellClick(customerId, year, month) {
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  let bill = state.bills.find(b => b.customerId === customerId && b.year === year && b.month === month);

  if (!bill) {
    bill = {
      id: `bill-${customerId}-${year}-${month}`,
      customerId: customerId,
      year: year,
      month: month,
      tariff: cust.price,
      amountPaid: 0,
      status: 'BELUM',
      paymentDate: '',
      paymentMethod: 'Cash / Tunai',
      notes: ''
    };
    state.bills.push(bill);
    saveBills();
  }

  openModalPayment(bill, cust);
}

function openModalPayment(bill, cust) {
  if (state.currentUser && !state.currentUser.permissions?.tagihan_edit) {
    showToast('Akses ditolak: Anda tidak memiliki izin mengubah status pembayaran.');
    return;
  }
  const modal = document.getElementById('modal-payment');
  document.getElementById('pay-bill-id').value = bill.id;
  document.getElementById('pay-cust-id').value = cust.id;

  document.getElementById('pay-modal-subtitle').textContent = `Pelanggan: ${cust.name} (SN: ${cust.sn} | PON ${cust.pon})`;
  document.getElementById('pay-period-display').textContent = `${MONTH_NAMES[bill.month - 1]} ${bill.year}`;
  document.getElementById('pay-tariff-display').textContent = formatRupiah(bill.tariff);

  document.getElementById('pay-status').value = bill.status || 'LUNAS';
  document.getElementById('pay-amount').value = bill.status === 'BELUM' ? bill.tariff : (bill.amountPaid || bill.tariff);
  
  const todayStr = new Date().toISOString().split('T')[0];
  document.getElementById('pay-date').value = bill.paymentDate || todayStr;
  document.getElementById('pay-method').value = bill.paymentMethod || 'Cash / Tunai';
  document.getElementById('pay-notes').value = bill.notes || '';

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function autoFillPayAmount() {
  const status = document.getElementById('pay-status').value;
  const billId = document.getElementById('pay-bill-id').value;
  const bill = state.bills.find(b => b.id === billId);
  if (!bill) return;

  const amtInput = document.getElementById('pay-amount');
  if (status === 'LUNAS') {
    amtInput.value = bill.tariff;
  } else if (status === 'BELUM') {
    amtInput.value = 0;
  }
}

function closeModalPayment() {
  document.getElementById('modal-payment')?.classList.add('hidden');
}

function savePayment(e) {
  e.preventDefault();
  if (state.currentUser && !state.currentUser.permissions?.tagihan_edit) {
    alert('Akses ditolak: Anda tidak memiliki izin mengubah status pembayaran.');
    return;
  }
  const billId = document.getElementById('pay-bill-id').value;
  const status = document.getElementById('pay-status').value;
  const amountPaid = parseInt(document.getElementById('pay-amount').value) || 0;
  const paymentDate = document.getElementById('pay-date').value;
  const paymentMethod = document.getElementById('pay-method').value;
  const notes = document.getElementById('pay-notes').value.trim();

  const idx = state.bills.findIndex(b => b.id === billId);
  if (idx !== -1) {
    state.bills[idx] = {
      ...state.bills[idx],
      status,
      amountPaid,
      paymentDate,
      paymentMethod,
      notes
    };
    saveBills();
    showToast('Status pembayaran berhasil dicatat!');
  }

  closeModalPayment();
  renderGridTagihan();
  renderDashboard();
  renderExpenses();
}

function generateMonthlyBills() {
  const year = state.selectedYear;
  const month = state.selectedMonth;

  let addedCount = 0;
  state.customers.forEach(c => {
    if (c.status === 'AKTIF') {
      const existing = state.bills.find(b => b.customerId === c.id && b.year === year && b.month === month);
      if (!existing) {
        state.bills.push({
          id: `bill-${c.id}-${year}-${month}`,
          customerId: c.id,
          year: year,
          month: month,
          tariff: c.price,
          amountPaid: 0,
          status: 'BELUM',
          paymentDate: '',
          paymentMethod: '',
          notes: ''
        });
        addedCount++;
      }
    }
  });

  saveBills();
  renderGridTagihan();
  renderDashboard();
  showToast(`Siklus tagihan periode ${MONTH_NAMES[month - 1]} ${year} siap! (${addedCount} tagihan baru digenerate)`);
}

function ensureBillForCustomer(customer, year, month) {
  const existing = state.bills.find(b => b.customerId === customer.id && b.year === year && b.month === month);
  if (!existing) {
    state.bills.push({
      id: `bill-${customer.id}-${year}-${month}`,
      customerId: customer.id,
      year: year,
      month: month,
      tariff: customer.price,
      amountPaid: 0,
      status: 'BELUM',
      paymentDate: '',
      paymentMethod: '',
      notes: ''
    });
    saveBills();
  }
}

// ==========================================
// WHATSAPP INVOICE & NOTIFICATION SENDER
// ==========================================
state.waActiveTemplate = 'tagihan';

function openModalWhatsApp(customerId, year = null, month = null) {
  if (state.currentUser && !state.currentUser.permissions?.tagihan_wa) {
    showToast('Akses ditolak: Anda tidak memiliki izin mengirim tagihan via WhatsApp.');
    return;
  }
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  const y = year || state.selectedYear;
  const m = month || state.selectedMonth;

  let bill = state.bills.find(b => b.customerId === customerId && b.year === y && b.month === m);
  if (!bill) {
    bill = {
      id: `bill-${customerId}-${y}-${m}`,
      customerId: customerId,
      year: y,
      month: m,
      tariff: cust.price,
      amountPaid: 0,
      status: 'BELUM',
      paymentDate: '',
      paymentMethod: '',
      notes: ''
    };
  }

  document.getElementById('wa-customer-id').value = customerId;
  document.getElementById('wa-year').value = y;
  document.getElementById('wa-month').value = m;

  document.getElementById('wa-modal-subtitle').textContent = `Pelanggan: ${cust.name} (SN: ${cust.sn} | PON ${cust.pon})`;
  document.getElementById('wa-summary-period').textContent = `${MONTH_NAMES[m - 1]} ${y} • Paket ${cust.speed}`;
  
  let statusBadge = '<span class="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">BELUM LUNAS</span>';
  if (bill.status === 'LUNAS') {
    statusBadge = '<span class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">LUNAS</span>';
  } else if (bill.status === 'SEBAGIAN') {
    statusBadge = `<span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">SEBAGIAN (Sisa ${formatRupiah(bill.tariff - bill.amountPaid)})</span>`;
  }
  document.getElementById('wa-summary-tariff').innerHTML = `${formatRupiah(bill.tariff)} ${statusBadge}`;

  // Phone input
  const phoneInput = document.getElementById('wa-target-phone');
  phoneInput.value = cust.phone || '';
  onWaPhoneChange();

  // Template selector default
  if (bill.status === 'LUNAS') {
    selectWaTemplate('lunas');
  } else {
    selectWaTemplate('tagihan');
  }

  document.getElementById('modal-whatsapp-sender')?.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalWhatsApp() {
  document.getElementById('modal-whatsapp-sender')?.classList.add('hidden');
}

function onWaPhoneChange() {
  const phoneVal = (document.getElementById('wa-target-phone')?.value || '').trim();
  const hintEl = document.getElementById('wa-phone-status-hint');
  if (!hintEl) return;

  if (!phoneVal) {
    hintEl.textContent = 'Nomor WA masih kosong! Silakan masukkan nomor.';
    hintEl.className = 'text-[11px] text-rose-500 font-semibold';
  } else {
    let clean = phoneVal.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.substring(1);
    hintEl.textContent = `Target WA: +${clean}`;
    hintEl.className = 'text-[11px] text-emerald-600 font-mono font-bold';
  }
}

function selectWaTemplate(tplKey) {
  state.waActiveTemplate = tplKey;

  // Toggle button styles
  ['tagihan', 'peringatan', 'lunas'].forEach(k => {
    const btn = document.getElementById(`btn-tpl-${k}`);
    if (btn) {
      if (k === tplKey) {
        btn.className = 'wa-tpl-btn p-2 rounded-xl border text-xs font-bold transition text-center bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs';
      } else {
        btn.className = 'wa-tpl-btn p-2 rounded-xl border text-xs font-semibold transition text-center text-slate-600 hover:bg-slate-50 border-slate-200';
      }
    }
  });

  const custId = document.getElementById('wa-customer-id').value;
  const y = parseInt(document.getElementById('wa-year').value) || state.selectedYear;
  const m = parseInt(document.getElementById('wa-month').value) || state.selectedMonth;

  const cust = state.customers.find(c => c.id === custId);
  if (!cust) return;

  const bill = state.bills.find(b => b.customerId === custId && b.year === y && b.month === m) || {
    tariff: cust.price,
    amountPaid: 0,
    status: 'BELUM',
    paymentDate: '',
    paymentMethod: ''
  };

  const periodStr = `${MONTH_NAMES[m - 1]} ${y}`;
  const tarifStr = formatRupiah(bill.tariff);
  const dibayarStr = formatRupiah(bill.amountPaid || bill.tariff);

  let message = '';

  if (tplKey === 'tagihan') {
    message = `*PEMBERITAHUAN TAGIHAN INTERNET HM NET*\n` +
`=================================\n` +
`Halo Kak *${cust.name}*,\n\n` +
`Berikut adalah rincian tagihan internet Wi-Fi Anda untuk periode *${periodStr}*:\n` +
`• Paket: ${cust.speed}\n` +
`• Nominal Tagihan: *${tarifStr}*\n` +
`• Status: *BELUM DIBAYAR*\n` +
`• Jatuh Tempo: Tanggal 10 ${periodStr}\n\n` +
`Pembayaran dapat ditransfer melalui:\n` +
`🏦 *BCA*: 123-456-7890 (a.n HM NET)\n` +
`🏦 *BRI*: 0987-654-321 (a.n HM NET)\n` +
`💵 *Cash / Tunai*: Ke kantor / teknisi HM NET saat kunjungan\n\n` +
`Mohon konfirmasi bukti transfer jika sudah membayar. Terima kasih atas kerjasamanya! 🙏\n` +
`*HM NET - Akses Internet Rumahan*`;
  } else if (tplKey === 'peringatan') {
    message = `*PERINGATAN JATUH TEMPO & ISOLIR - HM NET*\n` +
`=================================\n` +
`Penting! Yth. Kak *${cust.name}*,\n\n` +
`Tagihan internet Wi-Fi Anda periode *${periodStr}* sebesar *${tarifStr}* telah melewati batas jatuh tempo.\n\n` +
`Untuk menjaga kelancaran koneksi internet Anda dan menghindari isolir (pemutusan sementara), mohon untuk segera menyelesaikan pembayaran tagihan Anda hari ini.\n\n` +
`Pembayaran dapat ditransfer ke:\n` +
`🏦 *BCA*: 123-456-7890 (a.n HM NET)\n` +
`🏦 *BRI*: 0987-654-321 (a.n HM NET)\n\n` +
`*Abaikan pesan ini bila sudah melakukan pembayaran*. Terima kasih atas perhatiannya! 🙏\n` +
`*HM NET - Akses Internet Rumahan*`;
  } else if (tplKey === 'lunas') {
    message = `*KUITANSI RESMI PEMBAYARAN HM NET*\n` +
`=================================\n` +
`Terima kasih Kak *${cust.name}*!\n\n` +
`Pembayaran internet Wi-Fi Anda telah berhasil kami terima dan dinyatakan *LUNAS*:\n` +
`• Periode: *${periodStr}*\n` +
`• Paket: ${cust.speed}\n` +
`• Total Bayar: *${dibayarStr}* (LUNAS)\n` +
`• Tanggal Bayar: ${bill.paymentDate || new Date().toISOString().split('T')[0]}\n` +
`• Metode Bayar: ${bill.paymentMethod || 'Cash / Tunai'}\n` +
(bill.notes ? `• Catatan: "${bill.notes}"\n` : '') +
`=================================\n` +
`Layanan internet Anda aktif dengan lancar. Jika ada kendala teknis jaringan, silakan hubungi kami. Salam hormat, *HM NET*! 🚀`;
  }

  document.getElementById('wa-message-text').value = message;
}

function copyWaMessageToClipboard() {
  const textarea = document.getElementById('wa-message-text');
  if (!textarea) return;

  textarea.select();
  navigator.clipboard.writeText(textarea.value).then(() => {
    const label = document.getElementById('btn-copy-label');
    if (label) {
      const orig = label.textContent;
      label.textContent = 'Teks Berhasil Disalin! ✅';
      setTimeout(() => { label.textContent = orig; }, 2500);
    }
    showToast('Teks pesan WhatsApp berhasil disalin!');
  }).catch(() => {
    document.execCommand('copy');
    showToast('Teks berhasil disalin!');
  });
}

function submitSendWhatsApp() {
  const phoneRaw = document.getElementById('wa-target-phone').value.trim();
  const custId = document.getElementById('wa-customer-id').value;
  const shouldSavePhone = document.getElementById('wa-save-phone').checked;
  const messageText = document.getElementById('wa-message-text').value.trim();

  if (!phoneRaw) {
    alert('Silakan masukkan nomor WhatsApp tujuan terlebih dahulu!');
    document.getElementById('wa-target-phone').focus();
    return;
  }

  let cleanPhone = phoneRaw.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }

  if (cleanPhone.length < 9) {
    alert('Nomor WhatsApp tidak valid (terlalu pendek)! Minimal 9 digit angka.');
    return;
  }

  // Update customer data if checked
  if (shouldSavePhone && custId) {
    const custIdx = state.customers.findIndex(c => c.id === custId);
    if (custIdx !== -1) {
      state.customers[custIdx].phone = phoneRaw;
      saveCustomers();
      renderTablePelanggan();
    }
  }

  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(waUrl, '_blank');

  closeModalWhatsApp();
  showToast(`Membuka WhatsApp ke +${cleanPhone}...`);
}

function sendInvoiceWhatsAppCurrentModal() {
  const custId = document.getElementById('pay-cust-id').value;
  const billId = document.getElementById('pay-bill-id').value;
  const bill = state.bills.find(b => b.id === billId);
  if (custId && bill) {
    closeModalPayment();
    openModalWhatsApp(custId, bill.year, bill.month);
  }
}

// ==========================================
// MODAL HISTORI PEMBAYARAN PER PELANGGAN
// ==========================================
function openModalHistory(customerId) {
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  const modal = document.getElementById('modal-history');
  document.getElementById('history-modal-title').textContent = `Riwayat Pembayaran: ${cust.name}`;
  document.getElementById('history-modal-subtitle').textContent = `SN: ${cust.sn} | PON: ${cust.pon} | Tarif: ${formatRupiah(cust.price)}`;

  const listContainer = document.getElementById('history-list');
  listContainer.innerHTML = '';

  const custBills = state.bills
    .filter(b => b.customerId === customerId)
    .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));

  if (custBills.length === 0) {
    listContainer.innerHTML = `
      <div class="p-6 text-center text-slate-400">
        <i data-lucide="calendar-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        Belum ada riwayat tagihan atau pembayaran yang tercatat untuk pelanggan ini.
      </div>
    `;
  } else {
    custBills.forEach(b => {
      let badge = 'bg-rose-50 text-rose-700 border-rose-300';
      if (b.status === 'LUNAS') badge = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black';
      if (b.status === 'SEBAGIAN') badge = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';

      const item = document.createElement('div');
      item.className = 'p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs hover:bg-white hover:shadow-xs transition';
      item.innerHTML = `
        <div class="space-y-0.5">
          <div class="font-bold text-slate-900 text-sm">${MONTH_NAMES[b.month - 1]} ${b.year}</div>
          <div class="text-slate-500">
            Tgl: <span class="font-medium text-slate-700">${b.paymentDate || 'Belum Ada'}</span>
            ${b.paymentMethod ? `• Metode: ${b.paymentMethod}` : ''}
          </div>
          ${b.notes ? `<div class="text-indigo-600 font-semibold italic text-[11px] mt-0.5">Catatan: "${b.notes}"</div>` : ''}
        </div>
        <div class="text-right space-y-1">
          <div class="font-extrabold text-sm text-slate-900">${formatRupiah(b.amountPaid)} <span class="text-[10px] text-slate-400 font-normal">/ ${formatRupiah(b.tariff)}</span></div>
          <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold border inline-block ${badge}">${b.status}</span>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalHistory() {
  document.getElementById('modal-history')?.classList.add('hidden');
}

// ==========================================
// TAB 4: KEUANGAN, BANDWIDTH & OPERASIONAL
// ==========================================
function renderExpenses() {
  const labelPeriode = document.getElementById('label-periode-keuangan');
  if (labelPeriode) {
    labelPeriode.textContent = `${MONTH_NAMES[state.selectedMonth - 1]} ${state.selectedYear}`;
  }

  const activeMonthBills = state.bills.filter(b => b.year === state.selectedYear && b.month === state.selectedMonth);
  const totalIncome = activeMonthBills.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);

  const activeMonthExp = state.expenses.filter(e => e.year === state.selectedYear && e.month === state.selectedMonth);
  const totalExpense = activeMonthExp.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netProfit = totalIncome - totalExpense;

  let totalPiutang = 0;
  let countPiutang = 0;
  activeMonthBills.forEach(b => {
    const sisa = (Number(b.tariff) || 0) - (Number(b.amountPaid) || 0);
    if (sisa > 0) {
      totalPiutang += sisa;
      countPiutang++;
    }
  });

  const incEl = document.getElementById('detail-total-income');
  const expEl = document.getElementById('detail-total-expense');
  const profEl = document.getElementById('detail-net-profit');
  const piuEl = document.getElementById('detail-total-piutang');
  const piuCountEl = document.getElementById('detail-count-piutang');

  if (incEl) incEl.textContent = formatRupiah(totalIncome);
  if (expEl) expEl.textContent = formatRupiah(totalExpense);
  if (profEl) {
    profEl.textContent = formatRupiah(netProfit);
    profEl.className = netProfit < 0 ? 'font-black text-rose-700 text-base' : 'font-black text-indigo-700 text-base';
  }
  if (piuEl) piuEl.textContent = formatRupiah(totalPiutang);
  if (piuCountEl) piuCountEl.textContent = `${countPiutang} Pelanggan`;

  const tbody = document.getElementById('tbody-expenses');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (state.expenses.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-6 text-center text-slate-400">
          Belum ada catatan pengeluaran operasional.
        </td>
      </tr>
    `;
    return;
  }

  const sortedExpenses = [...state.expenses].sort((a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01'));

  sortedExpenses.forEach((exp, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 border-b border-slate-100 transition';
    tr.innerHTML = `
      <td class="py-3 px-4 text-slate-400 font-bold">${idx + 1}</td>
      <td class="py-3 px-4 font-bold text-slate-800">
        <span class="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] uppercase font-bold">${exp.category}</span>
      </td>
      <td class="py-3 px-4 font-medium text-slate-900">${exp.notes}</td>
      <td class="py-3 px-4 text-slate-600 font-bold">${MONTH_NAMES[exp.month - 1]} ${exp.year}</td>
      <td class="py-3 px-4 text-slate-500">${exp.date}</td>
      <td class="py-3 px-4 text-right font-black text-rose-600">${formatRupiah(exp.amount)}</td>
      <td class="py-3 px-4 text-center">
        <button onclick="deleteExpense('${exp.id}')" title="Hapus Pengeluaran" class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function openModalExpense() {
  const modal = document.getElementById('modal-expense');
  const form = document.getElementById('form-expense');
  form.reset();

  const mm = String(state.selectedMonth).padStart(2, '0');
  document.getElementById('exp-period').value = `${state.selectedYear}-${mm}`;
  document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalExpense() {
  document.getElementById('modal-expense')?.classList.add('hidden');
}

function saveExpense(e) {
  e.preventDefault();
  if (state.currentUser && !state.currentUser.permissions?.keuangan_edit) {
    alert('Akses ditolak: Anda tidak memiliki izin mencatat pengeluaran operasional.');
    return;
  }
  const category = document.getElementById('exp-category').value;
  const notes = document.getElementById('exp-notes').value.trim();
  const amount = parseInt(document.getElementById('exp-amount').value) || 0;
  const periodStr = document.getElementById('exp-period').value;
  const date = document.getElementById('exp-date').value;

  const [yearStr, monthStr] = periodStr.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const newExp = {
    id: 'exp-' + Date.now(),
    category,
    notes,
    amount,
    year,
    month,
    date
  };

  state.expenses.push(newExp);
  saveExpenses();
  showToast('Pengeluaran operasional berhasil disimpan!');
  closeModalExpense();
  renderExpenses();
  renderDashboard();
}

function deleteExpense(expId) {
  if (state.currentUser && !state.currentUser.permissions?.keuangan_edit) {
    alert('Akses ditolak: Anda tidak memiliki izin menghapus pengeluaran.');
    return;
  }
  if (confirm('Yakin ingin menghapus catatan pengeluaran ini?')) {
    state.expenses = state.expenses.filter(e => e.id !== expId);
    saveExpenses();
    renderExpenses();
    renderDashboard();
    showToast('Catatan pengeluaran dihapus.');
  }
}

// ==========================================
// BACKUP & RESTORE & EXCEL EXPORT
// ==========================================
function exportDataJSON() {
  const exportPayload = {
    app: 'HM NET Billing System',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    customers: state.customers,
    bills: state.bills,
    expenses: state.expenses
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `HM_NET_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast('File backup JSON berhasil diunduh!');
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.customers && data.bills) {
        state.customers = data.customers;
        state.bills = data.bills;
        state.expenses = data.expenses || [];
        saveCustomers();
        saveBills();
        saveExpenses();
        initApp();
        showToast('Database berhasil dipulihkan dari backup!');
      } else {
        alert('Format file JSON tidak sesuai format backup HM NET.');
      }
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function exportExcelAll() {
  if (typeof XLSX === 'undefined') {
    alert('Library SheetJS belum siap.');
    return;
  }

  const wb = XLSX.utils.book_new();

  const custData = state.customers.map((c, i) => ({
    No: i + 1,
    'Nama Pelanggan': c.name,
    'No HP / WA': c.phone,
    Alamat: c.address,
    'Tipe Modem': c.modemType,
    'Serial Number (SN)': c.sn,
    'Status ONT': c.ontStatus,
    'Jalur PON': c.pon,
    'Redaman (dB)': c.redaman,
    'Kecepatan': c.speed,
    'Tarif Bulanan': c.price,
    Status: c.status
  }));
  const wsCust = XLSX.utils.json_to_sheet(custData);
  XLSX.utils.book_append_sheet(wb, wsCust, 'Master Pelanggan');

  const billData = state.bills
    .filter(b => b.year === state.selectedYear && b.month === state.selectedMonth)
    .map((b, i) => {
      const c = state.customers.find(x => x.id === b.customerId) || {};
      return {
        No: i + 1,
        'Nama Pelanggan': c.name || '-',
        Periode: `${MONTH_NAMES[b.month - 1]} ${b.year}`,
        Tarif: b.tariff,
        'Nominal Bayar': b.amountPaid,
        Status: b.status,
        'Tgl Bayar': b.paymentDate,
        Metode: b.paymentMethod,
        Catatan: b.notes
      };
    });
  const wsBill = XLSX.utils.json_to_sheet(billData);
  XLSX.utils.book_append_sheet(wb, wsBill, `Tagihan ${MONTH_NAMES[state.selectedMonth - 1]}`);

  const expData = state.expenses.map((e, i) => ({
    No: i + 1,
    Kategori: e.category,
    Keterangan: e.notes,
    Bulan: MONTH_NAMES[e.month - 1],
    Tahun: e.year,
    Nominal: e.amount,
    'Tanggal Catat': e.date
  }));
  const wsExp = XLSX.utils.json_to_sheet(expData);
  XLSX.utils.book_append_sheet(wb, wsExp, 'Pengeluaran');

  XLSX.writeFile(wb, `HM_NET_Laporan_${state.selectedYear}_${state.selectedMonth}.xlsx`);
  showToast('File Excel laporan HM NET berhasil diekspor!');
}

function resetDataSample() {
  if (confirm('Yakin ingin mereset seluruh data kembali ke data contoh bawaan? Seluruh perubahan saat ini akan ditimpa.')) {
    state.customers = INITIAL_CUSTOMERS;
    state.expenses = INITIAL_EXPENSES;
    state.bills = generateSampleBills(INITIAL_CUSTOMERS);
    saveCustomers();
    saveExpenses();
    saveBills();
    initApp();
    showToast('Data berhasil di-reset ke pengaturan contoh bawaan.');
  }
}

// ==========================================
// TOAST NOTIFICATIONS & HELPERS
// ==========================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

function formatRupiah(num) {
  const n = Number(num) || 0;
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ==========================================
// USER MANAGEMENT & HAK AKSES (RBAC) LOGIC
// ==========================================
function renderTableUsers() {
  const tbody = document.getElementById('tbody-users');
  if (!tbody) return;

  const users = getUsersList();
  const searchInput = document.getElementById('search-users');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

  // Update Summary Metric Cards
  const totalEl = document.getElementById('stat-total-users');
  const activeEl = document.getElementById('stat-active-users');
  const teknisiEl = document.getElementById('stat-teknisi-users');
  const kasirEl = document.getElementById('stat-kasir-users');

  if (totalEl) totalEl.textContent = users.length;
  if (activeEl) activeEl.textContent = users.filter(u => u.status === 'AKTIF').length;
  if (teknisiEl) teknisiEl.textContent = users.filter(u => u.role === 'TEKNISI').length;
  if (kasirEl) kasirEl.textContent = users.filter(u => u.role === 'KASIR').length;

  const filtered = users.filter(u => {
    if (!query) return true;
    return (
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.roleLabel && u.roleLabel.toLowerCase().includes(query))
    );
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-8 text-center text-slate-400">
          <i data-lucide="shield-alert" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
          Tidak ada akun pengguna yang sesuai dengan pencarian.
        </td>
      </tr>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  filtered.forEach((user, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';

    // Role Badge & Colors
    let roleBadge = 'bg-slate-100 text-slate-700 border-slate-200';
    let roleIcon = 'user';
    if (user.role === 'SUPER_ADMIN') {
      roleBadge = 'bg-purple-100 text-purple-800 border-purple-200';
      roleIcon = 'crown';
    } else if (user.role === 'TEKNISI') {
      roleBadge = 'bg-blue-100 text-blue-800 border-blue-200';
      roleIcon = 'wrench';
    } else if (user.role === 'KASIR') {
      roleBadge = 'bg-amber-100 text-amber-800 border-amber-200';
      roleIcon = 'credit-card';
    }

    // Permission pills summary
    const p = user.permissions || {};
    const pillList = [];
    if (p.dashboard) pillList.push('<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">Dashboard</span>');
    if (p.pelanggan_view) {
      if (p.pelanggan_edit && p.pelanggan_delete) {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">Pelanggan (Full)</span>');
      } else if (p.pelanggan_edit) {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">Pelanggan & ONT</span>');
      } else {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Pelanggan (Lihat)</span>');
      }
    }
    if (p.tagihan_view) {
      if (p.tagihan_edit && p.tagihan_wa) {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Tagihan & WA</span>');
      } else if (p.tagihan_edit) {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">Tagihan (Bayar)</span>');
      } else {
        pillList.push('<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">Tagihan (Lihat)</span>');
      }
    }
    if (p.keuangan_view) {
      pillList.push('<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold">Keuangan & Laba</span>');
    }
    if (p.manage_users) {
      pillList.push('<span class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">Admin Hak Akses</span>');
    }

    const pillsHtml = pillList.length > 0 
      ? `<div class="flex flex-wrap gap-1">${pillList.join('')}</div>`
      : '<span class="text-[11px] text-slate-400 italic">Tidak ada izin menu</span>';

    // Status Badge
    const isActive = user.status === 'AKTIF';
    const statusBadge = isActive 
      ? '<span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span><span>Aktif</span></span>'
      : '<span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span><span>Dinonaktifkan</span></span>';

    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'US';

    const activeSuperAdmins = users.filter(u => u.status === 'AKTIF' && u.permissions?.manage_users);
    const isLastSuperAdmin = (isActive && p.manage_users && activeSuperAdmins.length <= 1);

    tr.innerHTML = `
      <td class="py-3 px-4 font-mono text-slate-400 text-center">${idx + 1}</td>
      <td class="py-3 px-4">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
            ${initials}
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="font-bold text-slate-900">${user.name}</span>
              ${user.isParent ? '<span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">Induk</span>' : ''}
            </div>
            <div class="text-[11px] font-mono text-slate-500">@${user.username}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadge}">
          <i data-lucide="${roleIcon}" class="w-3.5 h-3.5"></i>
          <span>${user.roleLabel || user.role}</span>
        </span>
      </td>
      <td class="py-3 px-4 max-w-xs">
        ${pillsHtml}
      </td>
      <td class="py-3 px-4 text-center">
        ${statusBadge}
      </td>
      <td class="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
        ${user.createdAt || '2026-01-01'}
      </td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center space-x-1">
          <!-- Edit User -->
          <button onclick="openModalUserForm('${user.id}')" title="Edit Username, Password & Hak Akses" class="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>

          <!-- Toggle Status -->
          ${isLastSuperAdmin ? `
            <button onclick="alert('Minimal harus ada 1 akun Admin Utama yang aktif! Klik ikon pensil (Edit) di samping jika ingin mengganti username/password akun ini, atau buat akun Admin baru terlebih dahulu.')" title="Admin Utama terakhir tidak dapat dinonaktifkan" class="p-1.5 rounded-lg text-slate-300 cursor-not-allowed">
              <i data-lucide="power" class="w-4 h-4"></i>
            </button>
          ` : `
            <button onclick="toggleUserStatus('${user.id}')" title="${isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}" class="p-1.5 rounded-lg ${isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'} transition">
              <i data-lucide="power" class="w-4 h-4"></i>
            </button>
          `}

          <!-- Delete User -->
          ${isLastSuperAdmin ? `
            <button onclick="alert('Minimal harus ada 1 akun Admin Utama yang aktif! Klik ikon pensil (Edit) di samping jika ingin mengganti username/password akun ini, atau buat akun Admin baru terlebih dahulu.')" title="Admin Utama terakhir tidak dapat dihapus" class="p-1.5 rounded-lg text-slate-300 cursor-not-allowed">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          ` : `
            <button onclick="deleteUserAccount('${user.id}')" title="Hapus Akun" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

function openModalUserForm(userId = null) {
  const modal = document.getElementById('modal-user-form');
  const form = document.getElementById('form-user');
  const title = document.getElementById('modal-user-title');
  const submitText = document.getElementById('btn-user-submit-text');
  const pwdHint = document.getElementById('user-form-pwd-hint');
  const pwdInput = document.getElementById('user-form-password');
  const statusSelect = document.getElementById('user-form-status');
  const usernameInput = document.getElementById('user-form-username');

  if (form) form.reset();

  if (userId) {
    const users = getUsersList();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const activeSuperAdmins = users.filter(u => u.status === 'AKTIF' && u.permissions?.manage_users);
    const isLastSuperAdmin = (user.status === 'AKTIF' && user.permissions?.manage_users && activeSuperAdmins.length <= 1);

    if (title) title.textContent = `Edit Akun: ${user.name}`;
    if (submitText) submitText.textContent = 'Simpan Perubahan';
    if (pwdHint) pwdHint.textContent = 'Kosongkan jika tidak ingin mengganti password login.';
    if (pwdInput) {
      pwdInput.required = false;
      pwdInput.placeholder = 'Ketik password baru (kosongkan jika tetap)';
    }

    document.getElementById('user-form-id').value = user.id;
    document.getElementById('user-form-name').value = user.name || '';
    if (usernameInput) {
      usernameInput.value = user.username || '';
      usernameInput.readOnly = false; // Bebas ubah username termasuk akun Induk
    }
    if (statusSelect) {
      statusSelect.value = user.status || 'AKTIF';
      statusSelect.disabled = isLastSuperAdmin;
    }

    // Set permission checkboxes
    const p = user.permissions || {};
    const permKeys = [
      'dashboard', 'pelanggan_view', 'pelanggan_edit', 'pelanggan_delete',
      'tagihan_view', 'tagihan_edit', 'tagihan_wa',
      'keuangan_view', 'keuangan_edit', 'backup_data', 'manage_users'
    ];
    permKeys.forEach(k => {
      const chk = document.getElementById(`perm_${k}`);
      if (chk) {
        chk.checked = !!p[k];
        if (isLastSuperAdmin && k === 'manage_users') {
          chk.disabled = true;
        } else {
          chk.disabled = false;
        }
      }
    });

  } else {
    // New user
    if (title) title.textContent = 'Buat Akun Anak Baru';
    if (submitText) submitText.textContent = 'Buat Akun Baru';
    if (pwdHint) pwdHint.textContent = 'Wajib diisi untuk akun baru (minimal 4 karakter).';
    if (pwdInput) {
      pwdInput.required = true;
      pwdInput.placeholder = 'Minimal 4 karakter';
    }

    document.getElementById('user-form-id').value = '';
    if (usernameInput) {
      usernameInput.value = '';
      usernameInput.readOnly = false;
    }
    if (statusSelect) {
      statusSelect.value = 'AKTIF';
      statusSelect.disabled = false;
    }

    // Re-enable all checkboxes and apply default Teknisi preset
    ['dashboard', 'pelanggan_view', 'pelanggan_edit', 'pelanggan_delete', 'tagihan_view', 'tagihan_edit', 'tagihan_wa', 'keuangan_view', 'keuangan_edit', 'backup_data', 'manage_users'].forEach(k => {
      const chk = document.getElementById(`perm_${k}`);
      if (chk) {
        chk.disabled = false;
      }
    });

    applyRolePreset('TEKNISI');
  }

  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalUserForm() {
  document.getElementById('modal-user-form')?.classList.add('hidden');
}

function applyRolePreset(role) {
  const permMap = {
    SUPER_ADMIN: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: true,
      pelanggan_delete: true,
      tagihan_view: true,
      tagihan_edit: true,
      tagihan_wa: true,
      keuangan_view: true,
      keuangan_edit: true,
      backup_data: true,
      manage_users: true
    },
    TEKNISI: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: true,
      pelanggan_delete: false,
      tagihan_view: true,
      tagihan_edit: false,
      tagihan_wa: false,
      keuangan_view: false,
      keuangan_edit: false,
      backup_data: false,
      manage_users: false
    },
    KASIR: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: false,
      pelanggan_delete: false,
      tagihan_view: true,
      tagihan_edit: true,
      tagihan_wa: true,
      keuangan_view: false,
      keuangan_edit: false,
      backup_data: false,
      manage_users: false
    },
    CUSTOM: null
  };

  if (role === 'CUSTOM') {
    showToast('Mode Kustom aktif: Silakan centang manual hak akses yang diinginkan.');
    return;
  }

  const selected = permMap[role];
  if (!selected) return;

  Object.keys(selected).forEach(k => {
    const chk = document.getElementById(`perm_${k}`);
    if (chk && !chk.disabled) {
      chk.checked = selected[k];
    }
  });

  const roleNames = {
    SUPER_ADMIN: 'Admin Penuh',
    TEKNISI: 'Teknisi Lapangan',
    KASIR: 'Kasir & Tagihan'
  };
  showToast(`Preset hak akses "${roleNames[role]}" diterapkan.`);
}

function saveUserAccount(e) {
  e.preventDefault();

  const id = document.getElementById('user-form-id').value;
  const name = document.getElementById('user-form-name').value.trim();
  const username = document.getElementById('user-form-username').value.trim().toLowerCase();
  const status = document.getElementById('user-form-status').value;
  const password = document.getElementById('user-form-password').value;

  // 1. Validasi Username
  if (!username || username.length < 3) {
    alert('Username minimal 3 karakter tanpa spasi!');
    document.getElementById('user-form-username').focus();
    return;
  }
  if (!/^[a-z0-9_.-]+$/.test(username)) {
    alert('Username hanya boleh menggunakan huruf kecil, angka, titik, atau garis bawah (_) tanpa spasi!');
    document.getElementById('user-form-username').focus();
    return;
  }

  if (username === 'admin' && password === 'admin') {
    alert('Demi keamanan sistem, kombinasi username "admin" dengan password "admin" tidak diizinkan!');
    document.getElementById('user-form-password').focus();
    return;
  }

  const users = getUsersList();

  // 2. Cek username duplikat
  const existingUser = users.find(u => u.username.toLowerCase() === username && u.id !== id);
  if (existingUser) {
    alert(`Username "${username}" sudah digunakan oleh akun lain! Gunakan username berbeda.`);
    document.getElementById('user-form-username').focus();
    return;
  }

  // 3. Validasi Password
  if (!id && (!password || password.length < 4)) {
    alert('Password wajib diisi minimal 4 karakter untuk akun baru!');
    document.getElementById('user-form-password').focus();
    return;
  }
  if (id && password && password.length < 4) {
    alert('Password baru minimal 4 karakter!');
    document.getElementById('user-form-password').focus();
    return;
  }

  // 4. Ambil Hak Akses Checkbox
  const permissions = {
    dashboard: document.getElementById('perm_dashboard')?.checked || false,
    pelanggan_view: document.getElementById('perm_pelanggan_view')?.checked || false,
    pelanggan_edit: document.getElementById('perm_pelanggan_edit')?.checked || false,
    pelanggan_delete: document.getElementById('perm_pelanggan_delete')?.checked || false,
    tagihan_view: document.getElementById('perm_tagihan_view')?.checked || false,
    tagihan_edit: document.getElementById('perm_tagihan_edit')?.checked || false,
    tagihan_wa: document.getElementById('perm_tagihan_wa')?.checked || false,
    keuangan_view: document.getElementById('perm_keuangan_view')?.checked || false,
    keuangan_edit: document.getElementById('perm_keuangan_edit')?.checked || false,
    backup_data: document.getElementById('perm_backup_data')?.checked || false,
    manage_users: document.getElementById('perm_manage_users')?.checked || false
  };

  // 5. Tentukan Role Badge & Label
  let role = 'CUSTOM';
  let roleLabel = 'Staf Kustom';

  if (permissions.manage_users && permissions.keuangan_view && permissions.pelanggan_delete) {
    role = 'SUPER_ADMIN';
    roleLabel = 'Admin Utama (Full Access)';
  } else if (permissions.pelanggan_view && permissions.pelanggan_edit && !permissions.keuangan_view && !permissions.manage_users) {
    role = 'TEKNISI';
    roleLabel = 'Teknisi Lapangan';
  } else if (permissions.tagihan_view && permissions.tagihan_edit && !permissions.keuangan_view && !permissions.manage_users) {
    role = 'KASIR';
    roleLabel = 'Kasir & Tagihan';
  }

  if (id) {
    // Update existing user
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const prev = users[idx];
      const activeSuperAdmins = users.filter(u => u.status === 'AKTIF' && u.permissions?.manage_users);
      const isLastSuperAdmin = (prev.status === 'AKTIF' && prev.permissions?.manage_users && activeSuperAdmins.length <= 1);

      users[idx] = {
        ...prev,
        name,
        username,
        status: isLastSuperAdmin ? 'AKTIF' : status,
        role: isLastSuperAdmin ? 'SUPER_ADMIN' : role,
        roleLabel: prev.isParent ? 'Admin Utama (Induk)' : roleLabel,
        permissions: isLastSuperAdmin ? { ...permissions, manage_users: true } : permissions
      };
      if (password) {
        users[idx].password = password;
      }
      saveUsersList(users);

      // If updating currently logged in user
      if (state.currentUser && (state.currentUser.id === id || state.currentUser.username?.toLowerCase() === prev.username?.toLowerCase())) {
        state.currentUser = { ...users[idx] };
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(state.currentUser));
        applyUserPermissions(state.currentUser);
      }

      showToast(`Akun "${name}" (@${username}) berhasil diperbarui!`);
    }
  } else {
    // Create new user
    const newUser = {
      id: 'u-' + Date.now(),
      name,
      username,
      password,
      role,
      roleLabel,
      isParent: permissions.manage_users,
      status,
      createdAt: new Date().toISOString().split('T')[0],
      permissions
    };
    users.push(newUser);

    // Jika membuat akun Super Admin baru dengan username selain 'admin', nonaktifkan akun default 'admin' otomatis agar aman
    if (permissions.manage_users && status === 'AKTIF' && username !== 'admin') {
      const defaultAdmin = users.find(u => u.username.toLowerCase() === 'admin' && u.id !== newUser.id);
      if (defaultAdmin && defaultAdmin.status === 'AKTIF') {
        defaultAdmin.status = 'NONAKTIF';
      }
    }

    saveUsersList(users);
    showToast(`Akun "${name}" (@${username}) berhasil dibuat!`);
  }

  closeModalUserForm();
  renderTableUsers();
}

function toggleUserStatus(userId) {
  const users = getUsersList();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const activeSuperAdmins = users.filter(u => u.status === 'AKTIF' && u.permissions?.manage_users);
  if (user.status === 'AKTIF' && user.permissions?.manage_users && activeSuperAdmins.length <= 1) {
    alert('Tidak dapat menonaktifkan satu-satunya Admin Utama yang aktif! Silakan buat akun Admin baru terlebih dahulu, atau klik tombol Edit (pensil) untuk mengubah username & password akun ini.');
    return;
  }

  user.status = user.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
  saveUsersList(users);
  renderTableUsers();

  const msg = user.status === 'AKTIF'
    ? `Akun "${user.name}" (@${user.username}) diaktifkan kembali.`
    : `Akun "${user.name}" (@${user.username}) telah dinonaktifkan (tidak bisa login).`;
  showToast(msg);
}

function deleteUserAccount(userId) {
  const users = getUsersList();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const activeSuperAdmins = users.filter(u => u.status === 'AKTIF' && u.permissions?.manage_users);
  if (user.status === 'AKTIF' && user.permissions?.manage_users && activeSuperAdmins.length <= 1) {
    alert('Tidak dapat menghapus satu-satunya Admin Utama yang aktif! Silakan buat akun Admin baru terlebih dahulu, atau klik tombol Edit (pensil) untuk mengubah username & password akun ini.');
    return;
  }

  if (confirm(`Yakin ingin menghapus akun "${user.name}" (@${user.username}) secara permanen? Akun ini tidak akan dapat login lagi.`)) {
    const updated = users.filter(u => u.id !== userId);
    saveUsersList(updated);
    renderTableUsers();
    showToast(`Akun "${user.name}" (@${user.username}) berhasil dihapus.`);
  }
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // Check auth first: if logged in, load app; if not, show login view
  const isAuthenticated = checkAuthSession();
  if (isAuthenticated) {
    initApp();
  }
});
