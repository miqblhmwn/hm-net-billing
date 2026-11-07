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
  USERS: 'hmnet_users_v2',
  USERS_UPDATED_AT: 'hmnet_users_updated_at_v1',
  WA_TEMPLATES: 'hmnet_wa_templates_v1',
  MODEM_TYPES: 'hmnet_modem_types_v1',
  REDAMAN_CONFIG: 'hmnet_redaman_config_v1'
};

const DEFAULT_REDAMAN_CONFIG = {
  goodLimit: -23,
  warnLimit: -26,
  badLimit: -27
};

const DEFAULT_MODEM_TYPES = [
  { name: 'GPON ZTE F6600PV9', color: 'green' },
  { name: 'GPON ZTE F670L', color: 'green' },
  { name: 'GPON Fiberhome HG6145D2', color: 'amber' },
  { name: 'GPON Fiberhome HG6145F', color: 'amber' },
  { name: 'XPON ZTE F663NV3A', color: 'fuchsia' },
  { name: 'XPON ZTE F663NV9', color: 'fuchsia' },
  { name: 'XPON GGCLink G699', color: 'cyan' },
  { name: 'GPON ZTE F609', color: 'green' },
  { name: 'GPON Huawei HG8245H5', color: 'blue' }
];

const DEFAULT_ADMIN = null;

// Default dummy account (admin/admin123) dimatikan permanen.
// Akun resmi HM NET disertakan secara bawaan & tersinkron otomatis dengan Cloud.
const DEFAULT_USERS = [
  {
    id: 'u-admin-himanet',
    username: 'himanet',
    password: '060602',
    name: 'Bos HMNET',
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
    id: 'u-sync-izza',
    username: 'izza',
    password: 'izzasayang',
    name: 'Bu Bos HMNET',
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
  },
  {
    id: 'u-sync-izzaa',
    username: 'izzaa',
    password: 'izzacantik',
    name: 'Ayang',
    role: 'CUSTOM',
    roleLabel: 'Staf Kustom',
    isParent: false,
    status: 'AKTIF',
    createdAt: '2026-11-07',
    permissions: {
      dashboard: true,
      pelanggan_view: true,
      pelanggan_edit: false,
      pelanggan_delete: false,
      tagihan_view: true,
      tagihan_edit: false,
      tagihan_wa: false,
      keuangan_view: false,
      keuangan_edit: false,
      backup_data: false,
      manage_users: false
    }
  }
];
const HMNET_CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1b61d3af25c56';
const HMNET_NTFY_TOPIC = 'hmnet_users_sync_v16_998877';

const PERM_KEYS = [
  'dashboard',
  'pelanggan_view',
  'pelanggan_edit',
  'pelanggan_delete',
  'tagihan_view',
  'tagihan_edit',
  'tagihan_wa',
  'keuangan_view',
  'keuangan_edit',
  'backup_data',
  'manage_users'
];

function isBlockedDefaultCredential(username, password, userId = '') {
  const u = String(username || '').trim().toLowerCase();
  const p = String(password || '').trim();
  // Matikan mutlak login default admin / admin123 dan admin / admin
  if (u === 'admin' && (p === 'admin123' || p === 'admin')) return true;
  // Hanya hapus akun sample bawaan lama jika ID-nya masih ID bawaan awal (bukan akun anak yang dibuat admin)
  if (userId === 'u-teknisi-1' && u === 'teknisi' && p === 'teknisi123') return true;
  if (userId === 'u-kasir-1' && u === 'kasir' && p === 'kasir123') return true;
  return false;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Initial Customer Data (48 Real HM NET Customers)
const INITIAL_CUSTOMERS = [
  { id: 'c-1', name: 'Falah', phone: '', address: '', modemType: 'GPON ZTE F6600PV9', sn: 'ZTEGd3be73c7', ontStatus: 'NEW', pon: '2', redaman: -14.8, speed: '20 Mbps', price: 150000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-2', name: 'Siril', phone: '', address: '', modemType: 'GPON ZTE F670L', sn: 'ZTEGd1dee05c', ontStatus: 'NEW', pon: '1', redaman: -16.8, speed: '10 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-3', name: 'Masyito', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc180531f', ontStatus: 'NEW', pon: '2', redaman: -20.5, speed: '1 Mbps', price: 0, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-4', name: 'Yahya', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc180613c', ontStatus: 'NEW', pon: '2', redaman: -19.4, speed: '8 Mbps', price: 50000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-5', name: 'Ratna', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc1806f83', ontStatus: 'NEW', pon: '1', redaman: -20.8, speed: '6 Mbps', price: 75000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-6', name: 'Silfia', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc1807614', ontStatus: 'NEW', pon: '1', redaman: -13.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-7', name: 'Galih', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc18058d1', ontStatus: 'NEW', pon: '1', redaman: -20.1, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-8', name: 'Zainal', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc18079ef', ontStatus: 'NEW', pon: '2', redaman: -23.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-9', name: 'Eva Toko', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc18061b7', ontStatus: 'NEW', pon: '2', redaman: -18.2, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-10', name: 'Ramadhan', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc18079f5', ontStatus: 'NEW', pon: '1', redaman: -13.9, speed: '10 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-11', name: 'Indra', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc1806f89', ontStatus: 'NEW', pon: '2', redaman: -16.4, speed: '10 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-12', name: 'Angga', phone: '', address: '', modemType: 'GPON Fiberhome HG6145D2', sn: 'FHTTc18060fe', ontStatus: 'NEW', pon: '2', redaman: -11.7, speed: '30 Mbps', price: 300000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-13', name: 'Putra', phone: '', address: '', modemType: 'GPON Fiberhome HG6145F', sn: 'FHTT999ce590', ontStatus: 'NEW', pon: '1', redaman: -22.2, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-14', name: 'Ajeng', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb6f0e0a', ontStatus: 'NEW', pon: '1', redaman: -16.6, speed: '10 Mbps', price: 120000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-15', name: 'Abdul Wahid', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb8cb24b', ontStatus: 'NEW', pon: '1', redaman: -18.4, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-16', name: 'Selvi Regita', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc088aa0', ontStatus: 'NEW', pon: '1', redaman: -19.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-17', name: 'Rifi', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcbb50685', ontStatus: 'NEW', pon: '1', redaman: -16.3, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-18', name: 'Subuh', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc10ed46', ontStatus: 'NEW', pon: '2', redaman: -19.9, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-19', name: 'Arif', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb6ef6c9', ontStatus: 'NEW', pon: '2', redaman: -20.7, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-20', name: 'Giyono', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb597668', ontStatus: 'NEW', pon: '2', redaman: -27.7, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-21', name: 'Rohman', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc10df07', ontStatus: 'NEW', pon: '2', redaman: -20.1, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-22', name: 'Imam Abu', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc146919', ontStatus: 'NEW', pon: '2', redaman: -18.7, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-23', name: 'Nasi Padang', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc68e150', ontStatus: 'NEW', pon: '2', redaman: -12.4, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-24', name: 'Syaiful Annas', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb82c403', ontStatus: 'NEW', pon: '2', redaman: -26.4, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-25', name: 'Riyan', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb46987d', ontStatus: 'NEW', pon: '2', redaman: -12.2, speed: '10 Mbps', price: 120000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-26', name: 'Yan', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc351158', ontStatus: 'NEW', pon: '2', redaman: -27.1, speed: '20 Mbps', price: 150000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-27', name: 'Yahya Mber', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc25ed24', ontStatus: 'NEW', pon: '2', redaman: -21.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-28', name: 'Aris', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGca83561d', ontStatus: 'NEW', pon: '2', redaman: -17.9, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-29', name: 'Irfan Panjul', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGca86abd9', ontStatus: 'NEW', pon: '2', redaman: -23.0, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-30', name: 'Zuhri Rentenir', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGca7af83b', ontStatus: 'NEW', pon: '2', redaman: -23.6, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-31', name: 'Seblak Cikmay', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGCA813047', ontStatus: 'NEW', pon: '2', redaman: -9.2, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-32', name: 'Eva Rumah', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGCB97DAB2', ontStatus: 'NEW', pon: '1', redaman: -16.1, speed: '6 Mbps', price: 80000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-33', name: 'Shodiqin', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGCAC44152', ontStatus: 'NEW', pon: '1', redaman: -18.5, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-34', name: 'Soka', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGCB9A7DF3', ontStatus: 'NEW', pon: '2', redaman: -16.4, speed: '10 Mbps', price: 120000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-35', name: 'Yasin', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGCB96DC31', ontStatus: 'NEW', pon: '1', redaman: -12.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-36', name: 'Kholik', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcb6a2a53', ontStatus: 'NEW', pon: '2', redaman: -18.7, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-37', name: 'Yuni', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc00073d', ontStatus: 'NEW', pon: '2', redaman: -15.9, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-38', name: 'Ismail', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZTEGcc11aa36', ontStatus: 'NEW', pon: '2', redaman: -27.1, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-39', name: 'Sakinah Madura', phone: '', address: '', modemType: 'XPON ZTE F663NV3A', sn: 'ZICG00b54d77', ontStatus: 'NEW', pon: '2', redaman: -17.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-40', name: 'Salim', phone: '', address: '', modemType: 'XPON ZTE F663NV9', sn: 'ZTEGcde60177', ontStatus: 'NEW', pon: '1', redaman: -21.8, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-41', name: 'Yudistira', phone: '', address: '', modemType: 'XPON ZTE F663NV9', sn: 'ZTEGcda472ae', ontStatus: 'NEW', pon: '1', redaman: -15.1, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-42', name: 'Desi', phone: '', address: '', modemType: 'XPON ZTE F663NV9', sn: 'ZTEGcd04c986', ontStatus: 'NEW', pon: '2', redaman: -15.4, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-43', name: 'Sari', phone: '', address: '', modemType: 'XPON ZTE F663NV9', sn: 'ZTEGcd146ca1', ontStatus: 'NEW', pon: '2', redaman: -18.1, speed: '10 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-44', name: 'Agung', phone: '', address: '', modemType: 'XPON GGCLink G699', sn: 'GGCLcb656b34', ontStatus: 'GANTI', pon: '2', redaman: -7.3, speed: '8 Mbps', price: 100000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-45', name: "Mas'ud", phone: '', address: '', modemType: 'XPON GGCLink G699', sn: 'GGCL298e3ca6', ontStatus: 'GANTI', pon: '2', redaman: -10.9, speed: '6 Mbps', price: 50000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-46', name: 'Ihsan', phone: '', address: '', modemType: 'XPON GGCLink G699', sn: 'GGCL297a3e54', ontStatus: 'SECOND', pon: '2', redaman: -18.9, speed: '7 Mbps', price: 80000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-47', name: 'Dafa', phone: '', address: '', modemType: 'XPON GGCLink G699', sn: 'GGCL2974397b', ontStatus: 'SECOND', pon: '2', redaman: -17.7, speed: '7 Mbps', price: 80000, status: 'AKTIF', installedDate: '2026-01-15' },
  { id: 'c-48', name: 'Rafiqi', phone: '', address: '', modemType: 'XPON GGCLink G699', sn: 'GGCLc913bb68', ontStatus: 'SECOND', pon: '2', redaman: -18.6, speed: '10 Mbps', price: 120000, status: 'AKTIF', installedDate: '2026-01-15' }
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
  broadcastSubtab: 'unpaid',
  unpaidBroadcastTplKey: 'tagihan',
  outageBroadcastTplKey: 'gangguan',
  masterTemplateEditingKey: 'tagihan',
  unpaidSelectedIds: new Set(),
  outageSelectedIds: new Set(),
  broadcastQueue: [],
  broadcastAutoTimer: null,
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
  let users = [];

  if (usersJson) {
    try {
      const parsed = JSON.parse(usersJson);
      if (Array.isArray(parsed)) users = parsed;
    } catch (e) {
      users = [];
    }
  }

  let modified = false;

  // Check if legacy ADMIN_ACCOUNT had a custom user that wasn't migrated yet
  const legacyAdminJson = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCOUNT);
  if (legacyAdminJson) {
    try {
      const legacyAdmin = JSON.parse(legacyAdminJson);
      if (
        legacyAdmin &&
        legacyAdmin.username &&
        legacyAdmin.password &&
        !isBlockedDefaultCredential(legacyAdmin.username, legacyAdmin.password)
      ) {
        const exists = users.some(u => u.username.toLowerCase() === legacyAdmin.username.toLowerCase());
        if (!exists) {
          users.unshift({
            id: 'u-admin-custom',
            username: legacyAdmin.username,
            password: legacyAdmin.password,
            name: legacyAdmin.name || 'Admin Utama (HM NET)',
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
          });
          modified = true;
        }
      }
    } catch (e) {}
  }

  // Hapus permanen akun default admin/admin123 dan sample bawaan lama
  const beforeCount = users.length;
  users = users.filter(u => !isBlockedDefaultCredential(u.username, u.password, u.id));
  if (users.length !== beforeCount) {
    modified = true;
  }

  // Pastikan akun resmi bawaan (DEFAULT_USERS: himanet, izza, izzaa) tersedia di HP/perangkat baru
  if (Array.isArray(DEFAULT_USERS) && DEFAULT_USERS.length > 0) {
    const alreadySeeded = localStorage.getItem('hmnet_users_seeded_v17');
    if (users.length === 0 || !alreadySeeded) {
      DEFAULT_USERS.forEach(defUser => {
        const exists = users.some(
          u => u.id === defUser.id || String(u.username || '').toLowerCase() === defUser.username.toLowerCase()
        );
        if (!exists) {
          users.push({ ...defUser, permissions: { ...defUser.permissions } });
          modified = true;
        }
      });
      localStorage.setItem('hmnet_users_seeded_v17', '1');
    }
  }

  // Pastikan jika ada akun terdaftar, minimal akun Induk pertama memiliki akses Admin Utama (manage_users)
  // tanpa mengubah hak akses Akun Anak lainnya!
  if (users.length > 0) {
    const hasActiveSuperAdmin = users.some(u => u.status === 'AKTIF' && u.permissions?.manage_users);
    if (!hasActiveSuperAdmin) {
      const parentOrFirst = users.find(u => u.isParent && u.status === 'AKTIF') || users.find(u => u.status === 'AKTIF') || users[0];
      parentOrFirst.status = 'AKTIF';
      parentOrFirst.isParent = true;
      parentOrFirst.role = 'SUPER_ADMIN';
      parentOrFirst.roleLabel = 'Admin Utama (Induk)';
      parentOrFirst.permissions = {
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
      modified = true;
    }
  }

  if (modified) {
    saveUsersList(users, false);
  }

  return users;
}

function getUsersUpdatedAt() {
  return Number(localStorage.getItem(STORAGE_KEYS.USERS_UPDATED_AT) || 0);
}

function saveUsersList(users, syncCloud = true, customUpdatedAt = null) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  if (customUpdatedAt !== null) {
    localStorage.setItem(STORAGE_KEYS.USERS_UPDATED_AT, String(customUpdatedAt));
  } else if (syncCloud) {
    localStorage.setItem(STORAGE_KEYS.USERS_UPDATED_AT, String(Date.now()));
  }

  const rootAdmin = users.find(u => u.isParent) || users[0];
  if (rootAdmin && !isBlockedDefaultCredential(rootAdmin.username, rootAdmin.password, rootAdmin.id)) {
    saveAdminAccount({
      username: rootAdmin.username,
      password: rootAdmin.password,
      name: rootAdmin.name,
      role: rootAdmin.roleLabel || 'Pengelola Utama (Full Access)'
    });
  } else {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCOUNT);
  }
  if (syncCloud) {
    pushCloudSync(true);
  }
}

// =========================================================
// CLOUD SYNC ANTAR PERANGKAT / HP LAIN (UNTUK AKUN INDUK & AKUN ANAK)
// =========================================================
let cloudSyncTimer = null;

function encodeUsersCompact(users) {
  return (users || [])
    .filter(u => u && u.username && !isBlockedDefaultCredential(u.username, u.password, u.id))
    .map(u => {
      let mask = 0;
      PERM_KEYS.forEach((k, bit) => {
        if (!u.permissions || u.permissions[k]) mask |= (1 << bit);
      });
      const clean = s => String(s || '').replace(/[\t\r\n]/g, ' ').trim();
      return [
        clean(u.username).slice(0, 20),
        String(u.password || '').replace(/[\t\r\n]/g, '').slice(0, 24),
        clean(u.name || u.username).slice(0, 22),
        clean(u.roleLabel || 'Staf').slice(0, 20),
        u.isParent ? '1' : '0',
        u.status === 'NONAKTIF' ? '0' : '1',
        mask.toString(16),
        clean(u.createdAt || '2026-01-01').slice(0, 10)
      ].join('\t');
    })
    .join('\n');
}

function decodeUsersCompact(compactStr) {
  if (!compactStr || typeof compactStr !== 'string') return [];
  return compactStr
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [username, password, name, roleLabel, isParentStr, statusStr, maskHex, createdAt] = line.split('\t');
      if (!username || !password) return null;
      const mask = parseInt(maskHex || '7ff', 16);
      const permissions = {};
      PERM_KEYS.forEach((k, bit) => {
        permissions[k] = Boolean(mask & (1 << bit));
      });
      const isParent = isParentStr === '1';
      let role = 'CUSTOM';
      if (isParent || (permissions.manage_users && permissions.keuangan_view)) {
        role = 'SUPER_ADMIN';
      } else if (permissions.pelanggan_view && permissions.pelanggan_edit && !permissions.keuangan_view) {
        role = 'TEKNISI';
      } else if (permissions.tagihan_view && permissions.tagihan_edit && !permissions.keuangan_view) {
        role = 'KASIR';
      }
      return {
        id: isParent ? 'u-admin-himanet' : `u-sync-${username.trim().toLowerCase()}`,
        username: username.trim(),
        password: password,
        name: name || username,
        role: role,
        roleLabel: roleLabel || (isParent ? 'Admin Utama (Induk)' : 'Akun Anak / Staf'),
        isParent: isParent,
        status: statusStr === '0' ? 'NONAKTIF' : 'AKTIF',
        createdAt: createdAt || '2026-01-01',
        permissions
      };
    })
    .filter(Boolean);
}

function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function pushCloudSync(immediate = false) {
  const doPush = async () => {
    try {
      const users = getUsersList();
      if (!users || users.length === 0) return false;
      const updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEYS.USERS_UPDATED_AT, String(updatedAt));
      const compactStr = encodeUsersCompact(users);

      const ntfyPromise = fetchWithTimeout('https://ntfy.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: HMNET_NTFY_TOPIC,
          message: JSON.stringify({ t: updatedAt, c: compactStr })
        })
      }, 4500);

      const restPromise = fetchWithTimeout(HMNET_CLOUD_SYNC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'hmnet-users-v16',
          data: { t: updatedAt, c: compactStr }
        })
      }, 4500);

      const results = await Promise.allSettled([ntfyPromise, restPromise]);
      return results.some(r => r.status === 'fulfilled' && r.value && r.value.ok);
    } catch (e) {
      return false;
    }
  };

  if (immediate) {
    return doPush();
  }
  if (cloudSyncTimer) clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(doPush, 300);
}

async function pullCloudSync() {
  try {
    const candidates = [];

    const ntfyFetch = fetchWithTimeout(
      `https://ntfy.sh/${HMNET_NTFY_TOPIC}/json?poll=1&since=all`,
      { method: 'GET', cache: 'no-store' },
      4500
    ).then(async res => {
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const evt = JSON.parse(lines[i]);
          if (evt && evt.message) {
            const parsed = JSON.parse(evt.message);
            if (parsed && parsed.c) {
              const decoded = decodeUsersCompact(parsed.c);
              if (decoded.length > 0) {
                candidates.push({ t: Number(parsed.t || 0), users: decoded });
                break;
              }
            }
          }
        } catch (e) {}
      }
    });

    const restFetch = fetchWithTimeout(
      HMNET_CLOUD_SYNC_URL,
      { method: 'GET', cache: 'no-store' },
      4500
    ).then(async res => {
      if (!res.ok) return;
      const obj = await res.json();
      const cloudData = obj && obj.data ? obj.data : null;
      if (cloudData && cloudData.c) {
        const decoded = decodeUsersCompact(cloudData.c);
        if (decoded.length > 0) {
          candidates.push({ t: Number(cloudData.t || 0), users: decoded });
        }
      }
    });

    await Promise.allSettled([ntfyFetch, restFetch]);

    if (candidates.length === 0) {
      return false;
    }

    // Pilih snapshot Cloud dengan timestamp terbaru
    candidates.sort((a, b) => b.t - a.t);
    const bestCloud = candidates[0];
    const cloudTime = bestCloud.t;
    const cloudUsers = bestCloud.users;

    if (cloudUsers.length > 0) {
      saveUsersList(cloudUsers, false, cloudTime);

      // Jika pengguna sedang login di perangkat ini, sinkronkan status & hak aksesnya secara langsung
      if (state.currentUser) {
        const updatedSelf = cloudUsers.find(
          u => u.username.toLowerCase() === String(state.currentUser.username || '').toLowerCase() || u.id === state.currentUser.id
        );
        if (!updatedSelf || updatedSelf.status !== 'AKTIF') {
          localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
          state.currentUser = null;
          showLoginView();
        } else {
          state.currentUser = { ...updatedSelf };
          localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(state.currentUser));
          applyUserPermissions(state.currentUser);
        }
      }
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

function handleUrlAccountSync() {
  try {
    const params = new URLSearchParams(window.location.search);
    const akunParam = params.get('akun');
    if (!akunParam) return;

    const jsonStr = decodeURIComponent(escape(atob(akunParam)));
    const payload = JSON.parse(jsonStr);
    const incomingUsers = Array.isArray(payload) ? payload : (payload.users || [payload]);
    const incomingTime = Number(payload.t || Date.now());

    const cleanUsers = incomingUsers.filter(
      iu => iu && iu.username && !isBlockedDefaultCredential(iu.username, iu.password, iu.id)
    );
    const targetUsername = payload.targetUsername || (cleanUsers[0] ? cleanUsers[0].username : '');

    if (cleanUsers.length > 0) {
      saveUsersList(cleanUsers, true, incomingTime);
    }

    // Bersihkan parameter URL agar rapi
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    setTimeout(() => {
      const uInput = document.getElementById('login-username');
      if (uInput && targetUsername) {
        uInput.value = targetUsername;
      }
      showToast(`Akun "${targetUsername}" berhasil disinkronkan ke perangkat ini! Silakan login.`);
    }, 300);
  } catch (e) {
    console.warn('Gagal memproses link sinkronisasi akun:', e);
  }
}

async function shareChildAccountLink(userId) {
  const users = getUsersList();
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) return;

  localStorage.setItem(STORAGE_KEYS.USERS_UPDATED_AT, String(Date.now()));
  await pushCloudSync(true);

  const payload = {
    t: getUsersUpdatedAt(),
    targetUsername: targetUser.username,
    users: users
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?akun=${encoded}`;

  try {
    await navigator.clipboard.writeText(shareUrl);
    showToast(`Link login untuk @${targetUser.username} berhasil disalin & disinkronkan ke Cloud!`);
  } catch (e) {
    prompt(`Salin link berikut dan kirim ke pengguna @${targetUser.username} agar langsung bisa login di HP/perangkatnya:`, shareUrl);
  }
}

async function syncUsersToCloudManual() {
  const users = getUsersList();
  localStorage.setItem(STORAGE_KEYS.USERS_UPDATED_AT, String(Date.now()));
  const ok = await pushCloudSync(true);
  renderTableUsers();
  const usernames = users.map(u => '@' + u.username).join(', ');
  if (ok) {
    showToast(`Berhasil! ${users.length} Akun (${usernames}) telah aktif & tersinkron ke semua HP/perangkat!`);
  } else {
    showToast(`Data akun (${usernames}) disimpan. Pastikan koneksi internet aktif.`);
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
  return { username: '', password: '', name: 'Admin HM NET', role: 'Pengelola Utama' };
}

function saveAdminAccount(account) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCOUNT, JSON.stringify(account));
}

function checkAuthSession() {
  const sessionJson = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (sessionJson) {
    try {
      const savedUser = JSON.parse(sessionJson);
      if (isBlockedDefaultCredential(savedUser.username, savedUser.password)) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        state.currentUser = null;
        showLoginView();
        return false;
      }
      const users = getUsersList();
      const current = users.find(
        u => u.username.toLowerCase() === String(savedUser.username || '').toLowerCase() &&
             u.password === savedUser.password
      );
      if (current && current.status === 'AKTIF') {
        state.currentUser = current;
        showAppView();
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
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

  const sideBroadcast = document.getElementById('side-broadcast');
  if (sideBroadcast) {
    sideBroadcast.style.display = (perms.tagihan_wa || perms.tagihan_view || perms.pelanggan_view) ? 'flex' : 'none';
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

  // Pastikan jika login menggunakan Akun Anak, tab aktif otomatis diarahkan ke menu yang diizinkan
  const perms = state.currentUser?.permissions || {};
  const currentTabAllowed =
    (state.currentTab === 'dashboard' && perms.dashboard !== false) ||
    (state.currentTab === 'pelanggan' && perms.pelanggan_view) ||
    (state.currentTab === 'tagihan' && perms.tagihan_view) ||
    (state.currentTab === 'broadcast' && (perms.tagihan_wa || perms.tagihan_view || perms.pelanggan_view)) ||
    (state.currentTab === 'keuangan' && perms.keuangan_view) ||
    (state.currentTab === 'users' && perms.manage_users);

  if (!currentTabAllowed) {
    if (perms.dashboard !== false) switchTab('dashboard');
    else if (perms.pelanggan_view) switchTab('pelanggan');
    else if (perms.tagihan_view) switchTab('tagihan');
    else if (perms.keuangan_view) switchTab('keuangan');
  }

  if (window.lucide) lucide.createIcons();
}

async function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value.trim().toLowerCase();
  const passwordInput = document.getElementById('login-password').value;
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');

  // Tolak mutlak akun default admin / admin123 dan admin / admin
  if (isBlockedDefaultCredential(usernameInput, passwordInput)) {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Akses Ditolak! Akun default (admin / admin123) telah dimatikan permanen. Hanya akun resmi yang terdaftar yang dapat login!';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Tarik pembaruan akun terbaru dari Cloud Sync sebelum memverifikasi login,
  // sehingga akun baru maupun akun yang baru diubah password/username/hak aksesnya langsung sinkron di semua HP!
  await pullCloudSync();

  let users = getUsersList();
  let user = users.find(
    u => u.username.toLowerCase() === usernameInput &&
         (u.password === passwordInput || u.password === passwordInput.trim())
  );

  if (!user) {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Akses Ditolak! Akun tidak terdaftar atau Username/Password salah.';
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (user.status !== 'AKTIF') {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      errorText.textContent = 'Akun ini telah dinonaktifkan. Hanya akun terdaftar yang aktif yang dapat login.';
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

  // One-time upgrade for legacy short modem names to full brand names (e.g. GPON Fiberhome HG6145D2)
  if (!localStorage.getItem('hmnet_modem_types_migrated_v9')) {
    const legacyMap = {
      'Fiberhome': 'GPON Fiberhome HG6145D2',
      'GPON ZTE': 'GPON ZTE F6600PV9',
      'GGCLink': 'GPON ZTE F670L',
      'XPON ZTE': 'XPON ZTE F663NV3A',
      'Huawei': 'GPON Fiberhome HG6145F'
    };
    let changed = false;
    state.customers.forEach(c => {
      if (legacyMap[c.modemType]) {
        c.modemType = legacyMap[c.modemType];
        changed = true;
      }
    });
    if (changed) saveCustomers();
    localStorage.setItem('hmnet_modem_types_migrated_v9', '1');
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

  // Safe non-destructive merge of the 48 real HM NET customers:
  // Preserves 100% of any customers, edits, phone numbers, modem types, and bill payments already created by the user!
  if (!localStorage.getItem('hmnet_real_48_customers_merged_v11')) {
    const fakeSampleSns = new Set(['fhbb883921aa', 'zteg778844ff', 'hwtc11223344']);
    const prevCustomers = (Array.isArray(state.customers) ? state.customers : []).filter(
      c => !fakeSampleSns.has(String(c.sn || '').toLowerCase())
    );

    const mergedCustomers = [...prevCustomers];
    INITIAL_CUSTOMERS.forEach(realCust => {
      const existingIdx = mergedCustomers.findIndex(
        p => (p.sn && p.sn.toLowerCase() === realCust.sn.toLowerCase()) ||
             (p.name && p.name.toLowerCase() === realCust.name.toLowerCase())
      );
      if (existingIdx === -1) {
        mergedCustomers.push({ ...realCust });
      }
    });

    state.customers = mergedCustomers;
    saveCustomers();

    // Ensure modem types list includes all customer modem types without deleting user's custom modem types
    getModemTypesList();

    // Only add missing bills for customers that don't have a bill yet (never overwrite existing bill payments!)
    let billsModified = false;
    state.customers.forEach(c => {
      const hasBill = state.bills.some(b => b.customerId === c.id && b.year === 2026 && b.month === 11);
      if (!hasBill) {
        const isFree = Number(c.price) === 0;
        state.bills.push({
          id: `bill-${c.id}-2026-11`,
          customerId: c.id,
          year: 2026,
          month: 11,
          tariff: c.price,
          amountPaid: 0,
          status: isFree ? 'LUNAS' : 'BELUM',
          paymentDate: isFree ? '2026-11-01' : '',
          paymentMethod: isFree ? 'Gratis / Free' : '',
          notes: isFree ? 'Langganan 1 Mbps (-)' : ''
        });
        billsModified = true;
      }
    });
    if (billsModified) saveBills();

    localStorage.setItem('hmnet_real_48_customers_merged_v11', '1');
  }
}

function generateSampleBills(customers) {
  const bills = [];
  customers.forEach(c => {
    const isFree = Number(c.price) === 0;
    bills.push({
      id: `bill-${c.id}-2026-11`,
      customerId: c.id,
      year: 2026,
      month: 11,
      tariff: c.price,
      amountPaid: 0,
      status: isFree ? 'LUNAS' : 'BELUM',
      paymentDate: isFree ? '2026-11-01' : '',
      paymentMethod: isFree ? 'Gratis / Free' : '',
      notes: isFree ? 'Langganan 1 Mbps (-)' : ''
    });
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

  const bcastYear = document.getElementById('bcast-unpaid-year');
  const bcastMonth = document.getElementById('bcast-unpaid-month');
  populate(bcastYear, yearItems, state.selectedYear);
  populate(bcastMonth, monthItems, state.selectedMonth);

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
    broadcast: 'Broadcast & Template WA',
    keuangan: 'Pengeluaran & Laba',
    users: 'Kelola Akun Anak & Hak Akses'
  };

  const badge = document.getElementById('current-page-badge');
  if (badge) {
    badge.textContent = tabLabels[tabId] || 'Dashboard';
  }

  // Toggle Sections & Sidebar items
  ['dashboard', 'pelanggan', 'tagihan', 'broadcast', 'keuangan', 'users'].forEach(id => {
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
  } else if (tabId === 'broadcast') {
    initBroadcastTab();
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
// REDAMAN HELPER & CONFIGURABLE THRESHOLDS
// Default:
// Hijau (Bagus): >= -23 dB
// Kuning (Waspada): -24 s.d -26 dB
// Merah (Kritis): < -27 dB
// ==========================================
function getRedamanConfig() {
  const raw = localStorage.getItem(STORAGE_KEYS.REDAMAN_CONFIG);
  if (!raw) return { ...DEFAULT_REDAMAN_CONFIG };
  try {
    const parsed = JSON.parse(raw);
    const goodLimit = parseFloat(parsed.goodLimit);
    const warnLimit = parseFloat(parsed.warnLimit);
    const badLimit = parseFloat(parsed.badLimit);
    if (!isNaN(goodLimit) && !isNaN(warnLimit) && !isNaN(badLimit)) {
      return { goodLimit, warnLimit, badLimit };
    }
  } catch (e) {
    // ignore
  }
  return { ...DEFAULT_REDAMAN_CONFIG };
}

function saveRedamanConfig(cfg) {
  localStorage.setItem(STORAGE_KEYS.REDAMAN_CONFIG, JSON.stringify(cfg));
}

function getRedamanClassification(val, customCfg = null) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    return {
      category: 'UNKNOWN',
      label: 'Unknown',
      colorClass: 'bg-slate-100 text-slate-600 border-slate-300',
      badgeClass: 'bg-slate-400'
    };
  }

  const cfg = customCfg || getRedamanConfig();
  const goodLimit = Number(cfg.goodLimit);
  const warnLimit = Number(cfg.warnLimit);
  const badLimit = Number(cfg.badLimit);

  // Cutoff between Waspada (Kuning) and Kritis (Merah):
  // If badLimit < warnLimit (e.g. warnLimit = -26, badLimit = -27), any value <= -27.0 is Kritis and > -27.0 is Waspada
  const isWarning = badLimit < warnLimit ? (num > badLimit) : (num >= warnLimit);

  if (num >= goodLimit) {
    return {
      category: 'GOOD',
      label: 'Bagus / Normal',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      badgeClass: 'bg-emerald-500'
    };
  } else if (isWarning) {
    return {
      category: 'WARNING',
      label: 'Waspada',
      colorClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      badgeClass: 'bg-amber-500'
    };
  } else {
    return {
      category: 'BAD',
      label: 'Kritis',
      colorClass: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
      badgeClass: 'bg-rose-500'
    };
  }
}

function formatWarnRangeText(cfg) {
  const startWarn = Number.isInteger(Number(cfg.goodLimit))
    ? Number(cfg.goodLimit) - 1
    : Number((Number(cfg.goodLimit) - 0.1).toFixed(1));
  return `${startWarn} s.d ${cfg.warnLimit} dB`;
}

function updateRedamanReferenceLabels() {
  const cfg = getRedamanConfig();
  const warnRange = formatWarnRangeText(cfg);

  // 1. Dashboard Card Labels
  const dashGood = document.getElementById('lbl-dash-redaman-good');
  const dashGoodSub = document.getElementById('sub-dash-redaman-good');
  const dashWarn = document.getElementById('lbl-dash-redaman-warn');
  const dashBad = document.getElementById('lbl-dash-redaman-bad');

  if (dashGood) dashGood.innerHTML = `Normal / Bagus (&ge; ${cfg.goodLimit} dB)`;
  if (dashGoodSub) dashGoodSub.textContent = `Contoh: -14.8 s.d ${Number(cfg.goodLimit).toFixed(1)} dB`;
  if (dashWarn) dashWarn.textContent = `Waspada (${warnRange})`;
  if (dashBad) dashBad.innerHTML = `Kritis (&lt; ${cfg.badLimit} dB)`;

  // 2. Master Pelanggan Footer Legend
  const footGood = document.getElementById('lbl-footer-redaman-good');
  const footWarn = document.getElementById('lbl-footer-redaman-warn');
  const footBad = document.getElementById('lbl-footer-redaman-bad');

  if (footGood) footGood.innerHTML = `&ge; ${cfg.goodLimit} dB (Bagus)`;
  if (footWarn) footWarn.textContent = `${warnRange} (Waspada)`;
  if (footBad) footBad.innerHTML = `&lt; ${cfg.badLimit} dB (Kritis)`;

  // 3. Modal Pelanggan Criteria Text
  const modalCrit = document.getElementById('lbl-modal-redaman-criteria');
  if (modalCrit) {
    modalCrit.innerHTML = `
      Kriteria: <span class="text-emerald-600 font-semibold">&ge; ${cfg.goodLimit} dB (Bagus)</span> | 
      <span class="text-amber-600 font-semibold">${warnRange} (Waspada)</span> | 
      <span class="text-rose-600 font-semibold">&lt; ${cfg.badLimit} dB (Kritis)</span>
    `;
  }
}

function openModalRedamanConfig() {
  const cfg = getRedamanConfig();
  const gInput = document.getElementById('cfg-redaman-good');
  const wInput = document.getElementById('cfg-redaman-warn');
  const bInput = document.getElementById('cfg-redaman-bad');

  if (gInput) gInput.value = cfg.goodLimit;
  if (wInput) wInput.value = cfg.warnLimit;
  if (bInput) bInput.value = cfg.badLimit;

  updateRedamanConfigLivePreview();
  document.getElementById('modal-redaman-config')?.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalRedamanConfig() {
  document.getElementById('modal-redaman-config')?.classList.add('hidden');
}

function updateRedamanConfigLivePreview() {
  const gVal = parseFloat(document.getElementById('cfg-redaman-good')?.value);
  const wVal = parseFloat(document.getElementById('cfg-redaman-warn')?.value);
  const bVal = parseFloat(document.getElementById('cfg-redaman-bad')?.value);

  const currentCfg = getRedamanConfig();
  const tempCfg = {
    goodLimit: !isNaN(gVal) ? gVal : currentCfg.goodLimit,
    warnLimit: !isNaN(wVal) ? wVal : currentCfg.warnLimit,
    badLimit: !isNaN(bVal) ? bVal : currentCfg.badLimit
  };

  const warnRange = formatWarnRangeText(tempCfg);
  const gDesc = document.getElementById('preview-cfg-good-desc');
  const wDesc = document.getElementById('preview-cfg-warn-desc');
  const bDesc = document.getElementById('preview-cfg-bad-desc');

  if (gDesc) gDesc.innerHTML = `&ge; ${tempCfg.goodLimit} dB`;
  if (wDesc) wDesc.textContent = warnRange;
  if (bDesc) bDesc.innerHTML = `&lt; ${tempCfg.badLimit} dB`;

  let cGood = 0, cWarn = 0, cBad = 0;
  (state.customers || []).forEach(c => {
    const cat = getRedamanClassification(c.redaman, tempCfg).category;
    if (cat === 'GOOD') cGood++;
    else if (cat === 'WARNING') cWarn++;
    else if (cat === 'BAD') cBad++;
  });

  const gCountEl = document.getElementById('preview-cfg-good-count');
  const wCountEl = document.getElementById('preview-cfg-warn-count');
  const bCountEl = document.getElementById('preview-cfg-bad-count');

  if (gCountEl) gCountEl.textContent = `${cGood} Pelanggan`;
  if (wCountEl) wCountEl.textContent = `${cWarn} Pelanggan`;
  if (bCountEl) bCountEl.textContent = `${cBad} Pelanggan`;
}

function saveRedamanConfigForm(e) {
  e.preventDefault();
  const goodLimit = parseFloat(document.getElementById('cfg-redaman-good')?.value);
  const warnLimit = parseFloat(document.getElementById('cfg-redaman-warn')?.value);
  const badLimit = parseFloat(document.getElementById('cfg-redaman-bad')?.value);

  if (isNaN(goodLimit) || isNaN(warnLimit) || isNaN(badLimit)) {
    alert('Mohon isi ketiga angka batas redaman dengan benar.');
    return;
  }

  if (goodLimit <= warnLimit) {
    alert(`Batas Normal/Bagus (${goodLimit} dB) harus lebih besar dari Batas Waspada (${warnLimit} dB).\nContoh: Normal -23 dB, Waspada -26 dB.`);
    return;
  }

  if (warnLimit < badLimit) {
    alert(`Batas Waspada (${warnLimit} dB) tidak boleh lebih kecil dari Batas Kritis (${badLimit} dB).\nContoh: Waspada -26 dB, Kritis -27 dB.`);
    return;
  }

  saveRedamanConfig({ goodLimit, warnLimit, badLimit });
  updateRedamanReferenceLabels();
  renderDashboard();
  renderTablePelanggan();
  previewRedamanColor();
  closeModalRedamanConfig();
  showToast(`Batas referensi redaman berhasil diperbarui (>= ${goodLimit} dB | s.d ${warnLimit} dB | < ${badLimit} dB)!`);
}

function resetRedamanConfigDefault() {
  document.getElementById('cfg-redaman-good').value = DEFAULT_REDAMAN_CONFIG.goodLimit;
  document.getElementById('cfg-redaman-warn').value = DEFAULT_REDAMAN_CONFIG.warnLimit;
  document.getElementById('cfg-redaman-bad').value = DEFAULT_REDAMAN_CONFIG.badLimit;
  updateRedamanConfigLivePreview();
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
  updateRedamanReferenceLabels();
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

  updateRedamanReferenceLabels();

  const searchQuery = (document.getElementById('search-pelanggan')?.value || '').toLowerCase().trim();
  const filterPon = document.getElementById('filter-pon')?.value || 'ALL';
  const filterStatusOnt = document.getElementById('filter-status-ont')?.value || 'ALL';
  const filterRedaman = document.getElementById('filter-redaman')?.value || 'ALL';

  const filtered = state.customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery) ||
                          c.sn.toLowerCase().includes(searchQuery) ||
                          c.modemType.toLowerCase().includes(searchQuery) ||
                          (c.address && c.address.toLowerCase().includes(searchQuery));
    const matchesPon = filterPon === 'ALL' || String(c.pon) === String(filterPon);
    const matchesOnt = filterStatusOnt === 'ALL' || c.ontStatus === filterStatusOnt;
    const matchesRedaman = filterRedaman === 'ALL' || getRedamanClassification(c.redaman).category === filterRedaman;
    return matchesSearch && matchesPon && matchesOnt && matchesRedaman;
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
        <div>${getModemTypeBadgeHtml(c.modemType)}</div>
        <div class="text-[11px] font-mono text-slate-500 mt-1">SN: ${c.sn}</div>
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
      populateModemTypeSelect(cust.modemType);
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
    populateModemTypeSelect('GPON Fiberhome HG6145D2');
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

// =========================================================
// MANAJEMEN DAFTAR MERK & TYPE MODEM ONT (TAMBAH / EDIT SENDIRI)
// =========================================================
function getModemTypesList() {
  const raw = localStorage.getItem(STORAGE_KEYS.MODEM_TYPES);
  let list = [];
  if (!raw) {
    list = JSON.parse(JSON.stringify(DEFAULT_MODEM_TYPES));
    saveModemTypesList(list);
  } else {
    try {
      list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        list = JSON.parse(JSON.stringify(DEFAULT_MODEM_TYPES));
      }
    } catch (e) {
      list = JSON.parse(JSON.stringify(DEFAULT_MODEM_TYPES));
    }
  }

  // Ensure any modem type used by existing customers is also present in the list
  let added = false;
  (state.customers || []).forEach(c => {
    if (c.modemType && !list.some(m => m.name.toLowerCase() === c.modemType.toLowerCase())) {
      list.push({
        name: c.modemType,
        color: inferModemColor(c.modemType)
      });
      added = true;
    }
  });
  if (added) saveModemTypesList(list);
  return list;
}

function saveModemTypesList(list) {
  localStorage.setItem(STORAGE_KEYS.MODEM_TYPES, JSON.stringify(list));
}

function inferModemColor(nameStr) {
  const s = String(nameStr || '').toUpperCase();
  if (s.includes('FIBERHOME')) return 'amber';
  if (s.includes('XPON') && s.includes('ZTE')) return 'fuchsia';
  if (s.includes('GPON') && s.includes('ZTE')) return 'green';
  if (s.includes('HUAWEI')) return 'blue';
  if (s.includes('GGCLINK')) return 'cyan';
  return 'amber';
}

function getModemBadgeColorClass(colorKey) {
  switch (colorKey) {
    case 'green':
      return 'bg-[#22c55e] text-slate-950 border-emerald-600';
    case 'amber':
      return 'bg-[#f59e0b] text-slate-950 border-amber-600';
    case 'fuchsia':
      return 'bg-[#e879f9] text-slate-950 border-fuchsia-600';
    case 'blue':
      return 'bg-sky-200 text-sky-950 border-sky-400';
    case 'cyan':
      return 'bg-cyan-200 text-cyan-950 border-cyan-400';
    default:
      return 'bg-slate-200 text-slate-900 border-slate-400';
  }
}

function getModemTypeBadgeHtml(modemName) {
  const list = getModemTypesList();
  const found = list.find(m => m.name.toLowerCase() === String(modemName || '').toLowerCase());
  const colorKey = found ? found.color : inferModemColor(modemName);
  const cls = getModemBadgeColorClass(colorKey);
  return `<span class="inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold border shadow-2xs ${cls}">${modemName || '-'}</span>`;
}

function populateModemTypeSelect(selectedValue = '') {
  const selectEl = document.getElementById('cust-modem-type');
  if (!selectEl) return;

  const list = getModemTypesList();
  selectEl.innerHTML = '';

  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.name;
    opt.textContent = item.name;
    if (selectedValue && item.name.toLowerCase() === selectedValue.toLowerCase()) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });

  if (selectedValue && !list.some(m => m.name.toLowerCase() === selectedValue.toLowerCase())) {
    const opt = document.createElement('option');
    opt.value = selectedValue;
    opt.textContent = selectedValue;
    opt.selected = true;
    selectEl.appendChild(opt);
  }
}

function openModalModemTypes() {
  cancelEditModemType();
  renderModemTypesList();
  document.getElementById('modal-modem-types')?.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalModemTypes() {
  document.getElementById('modal-modem-types')?.classList.add('hidden');
}

function renderModemTypesList() {
  const container = document.getElementById('modem-types-list-container');
  if (!container) return;

  const list = getModemTypesList();
  container.innerHTML = '';

  list.forEach((item, idx) => {
    const usageCount = state.customers.filter(c => (c.modemType || '').toLowerCase() === item.name.toLowerCase()).length;
    const badgeCls = getModemBadgeColorClass(item.color);

    const row = document.createElement('div');
    row.className = 'p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-50 transition';
    row.innerHTML = `
      <div class="flex items-center space-x-2.5 min-w-0">
        <span class="px-2.5 py-1 rounded-md text-xs font-extrabold border ${badgeCls} truncate">${item.name}</span>
        <span class="text-[10px] font-semibold text-slate-400 shrink-0">(${usageCount} pelanggan)</span>
      </div>
      <div class="flex items-center space-x-1 shrink-0">
        <button type="button" onclick="startEditModemType(${idx})" class="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 rounded-lg text-[11px] font-bold transition flex items-center space-x-1">
          <i data-lucide="edit-3" class="w-3 h-3"></i>
          <span>Edit</span>
        </button>
        <button type="button" onclick="deleteModemTypeItem(${idx})" class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus merk modem">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
}

function startEditModemType(idx) {
  const list = getModemTypesList();
  const item = list[idx];
  if (!item) return;

  document.getElementById('modem-type-edit-old-name').value = item.name;
  const nameInput = document.getElementById('modem-type-input-name');
  const colorSelect = document.getElementById('modem-type-input-color');
  const lbl = document.getElementById('lbl-modem-type-form');
  const submitLbl = document.getElementById('btn-submit-modem-type-label');
  const cancelBtn = document.getElementById('btn-cancel-edit-modem');

  if (nameInput) {
    nameInput.value = item.name;
    nameInput.focus();
  }
  if (colorSelect) colorSelect.value = item.color || 'amber';
  if (lbl) lbl.textContent = `Edit Nama Merk / Type Modem ("${item.name}"):`;
  if (submitLbl) submitLbl.textContent = 'Simpan Perubahan Merk';
  if (cancelBtn) cancelBtn.classList.remove('hidden');
}

function cancelEditModemType() {
  const oldEl = document.getElementById('modem-type-edit-old-name');
  const nameInput = document.getElementById('modem-type-input-name');
  const colorSelect = document.getElementById('modem-type-input-color');
  const lbl = document.getElementById('lbl-modem-type-form');
  const submitLbl = document.getElementById('btn-submit-modem-type-label');
  const cancelBtn = document.getElementById('btn-cancel-edit-modem');

  if (oldEl) oldEl.value = '';
  if (nameInput) nameInput.value = '';
  if (colorSelect) colorSelect.value = 'amber';
  if (lbl) lbl.textContent = 'Tambah Merk / Type Modem Baru:';
  if (submitLbl) submitLbl.textContent = 'Tambah Merk Modem';
  if (cancelBtn) cancelBtn.classList.add('hidden');
}

function saveModemTypeItem(e) {
  e.preventDefault();
  const oldName = (document.getElementById('modem-type-edit-old-name')?.value || '').trim();
  const newName = (document.getElementById('modem-type-input-name')?.value || '').trim();
  const color = document.getElementById('modem-type-input-color')?.value || 'amber';

  if (!newName) return;

  const list = getModemTypesList();

  if (oldName) {
    // Editing existing modem brand
    const idx = list.findIndex(m => m.name.toLowerCase() === oldName.toLowerCase());
    if (idx !== -1) {
      list[idx] = { name: newName, color };
    } else {
      list.push({ name: newName, color });
    }

    // Also update all customers currently using oldName
    let updatedCustCount = 0;
    state.customers.forEach(c => {
      if ((c.modemType || '').toLowerCase() === oldName.toLowerCase()) {
        c.modemType = newName;
        updatedCustCount++;
      }
    });
    if (updatedCustCount > 0) saveCustomers();

    saveModemTypesList(list);
    populateModemTypeSelect(newName);
    renderTablePelanggan();
    cancelEditModemType();
    renderModemTypesList();
    showToast(`Merk modem berhasil diubah menjadi "${newName}"! ✅`);
  } else {
    // Adding new modem brand
    const existingIdx = list.findIndex(m => m.name.toLowerCase() === newName.toLowerCase());
    if (existingIdx !== -1) {
      list[existingIdx].color = color;
      showToast(`Warna label untuk "${newName}" berhasil diperbarui!`);
    } else {
      list.unshift({ name: newName, color });
      showToast(`Merk modem "${newName}" berhasil ditambahkan! ✅`);
    }

    saveModemTypesList(list);
    populateModemTypeSelect(newName);
    renderTablePelanggan();
    cancelEditModemType();
    renderModemTypesList();
  }
}

function deleteModemTypeItem(idx) {
  const list = getModemTypesList();
  const item = list[idx];
  if (!item) return;

  if (list.length <= 1) {
    alert('Minimal harus ada 1 merk modem di dalam daftar.');
    return;
  }

  if (confirm(`Hapus merk modem "${item.name}" dari daftar pilihan?`)) {
    list.splice(idx, 1);
    saveModemTypesList(list);
    populateModemTypeSelect();
    renderModemTypesList();
    showToast(`Merk modem "${item.name}" telah dihapus dari daftar.`);
  }
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

  // Update dynamic payment info box in modal
  const tpls = getWaTemplates();
  const payInfoBox = document.getElementById('wa-modal-payment-info-content');
  if (payInfoBox && tpls.paymentInfo) {
    payInfoBox.textContent = tpls.paymentInfo;
  }

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
  ['tagihan', 'peringatan', 'lunas', 'gangguan'].forEach(k => {
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
    paymentMethod: '',
    notes: ''
  };

  const tpls = getWaTemplates();
  const rawTpl = tpls[tplKey] || tpls.tagihan;
  const message = compileWaTemplate(rawTpl, cust, bill, { year: y, month: m });

  document.getElementById('wa-message-text').value = message;

  const clickableLinkEl = document.getElementById('wa-clickable-pay-link');
  if (clickableLinkEl) {
    const payUrl = getCustomerPayUrl(cust.id, y, m, cust, bill);
    clickableLinkEl.textContent = payUrl;
    clickableLinkEl.href = payUrl;
  }
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
    version: '1.2',
    exportedAt: new Date().toISOString(),
    customers: state.customers,
    bills: state.bills,
    expenses: state.expenses,
    waTemplates: getWaTemplates(),
    modemTypes: getModemTypesList(),
    redamanConfig: getRedamanConfig(),
    users: getUsersList()
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
        if (data.waTemplates) {
          saveWaTemplates(data.waTemplates);
        }
        if (Array.isArray(data.modemTypes) && data.modemTypes.length > 0) {
          saveModemTypesList(data.modemTypes);
        }
        if (data.redamanConfig) {
          saveRedamanConfig(data.redamanConfig);
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          saveUsersList(data.users.filter(u => !isBlockedDefaultCredential(u.username, u.password)));
        }
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
          <!-- Bagikan Link Login untuk HP / Perangkat Lain -->
          <button onclick="shareChildAccountLink('${user.id}')" title="Salin Link Login untuk HP / Browser Lain" class="px-2 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-[10px] font-bold transition flex items-center space-x-1">
            <i data-lucide="share-2" class="w-3 h-3"></i>
            <span>Link HP Lain</span>
          </button>

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

  if (isBlockedDefaultCredential(username, password)) {
    alert('Demi keamanan sistem, kombinasi akun default (admin/admin123, teknisi/teknisi123, kasir/kasir123) telah dimatikan dan tidak diizinkan!');
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

// =========================================================
// WHATSAPP TEMPLATES & BULK BROADCAST SYSTEM (TAGIHAN & GANGGUAN)
// =========================================================
const DEFAULT_WA_TEMPLATES = {
  bankBca: '1840005969488 a.n HM NET',
  bankBri: '592801012731509 a.n HM NET',
  ewalletInfo: 'DANA: 085691693286 | LinkAja: 085691693286',
  adminWa: '085691693286',
  publicDomain: '',
  qrisImageDataUrl: '',
  useUniqueCode: false,
  paymentInfo:
`🏦 *Mandiri*: 1840005969488 (a.n HM NET)
🏦 *BRI*: 592801012731509 (a.n HM NET)
👛 *DANA*: 085691693286 (a.n HM NET)
👛 *LinkAja*: 085691693286 (a.n HM NET)
💵 *Bayar Manual / Tunai*: Ke kantor atau teknisi HM NET saat kunjungan`,
  dueDateDay: 'Tanggal 10',
  fonnteToken: '',
  tagihan:
`*PEMBERITAHUAN TAGIHAN INTERNET HM NET*
=================================
Halo Kak *{nama}*,

Berikut adalah rincian tagihan internet Wi-Fi Anda untuk periode *{periode}*:
• Paket: {paket}
• Nominal Tagihan: *{tagihan}*
• Status: *{status}*
• Jatuh Tempo: {jatuh_tempo}

💳 *Informasi Pembayaran Resmi HM NET:*
{rekening}

Konfirmasi Bukti Pembayaran (WA Admin): *085691693286*
Terima kasih atas kerjasamanya! 🙏
*HM NET - Akses Internet Rumahan*`,

  peringatan:
`*PERINGATAN JATUH TEMPO & ISOLIR - HM NET*
=================================
Penting! Yth. Kak *{nama}*,

Tagihan internet Wi-Fi Anda periode *{periode}* sebesar *{tagihan}* telah melewati batas jatuh tempo ({jatuh_tempo}).

Untuk menjaga kelancaran koneksi internet Anda dan menghindari isolir (pemutusan sementara), mohon untuk segera menyelesaikan pembayaran tagihan Anda melalui:

{rekening}

Konfirmasi Bukti Pembayaran (WA Admin): *085691693286*
*Abaikan pesan ini bila sudah melakukan pembayaran*. Terima kasih atas perhatiannya! 🙏
*HM NET - Akses Internet Rumahan*`,

  lunas:
`*KUITANSI RESMI PEMBAYARAN HM NET*
=================================
Terima kasih Kak *{nama}*!

Pembayaran internet Wi-Fi Anda telah berhasil kami terima dan dinyatakan *LUNAS*:
• Periode: *{periode}*
• Paket: {paket}
• Total Bayar: *{dibayar}* (LUNAS)
• Tanggal Bayar: {tgl_bayar}
• Metode Bayar: {metode_bayar}
{catatan}=================================
Layanan internet Anda aktif dengan lancar. Jika ada kendala teknis jaringan, silakan hubungi kami. Salam hormat, *HM NET*! 🚀`,

  gangguan:
`*PEMBERITAHUAN GANGGUAN JARINGAN - HM NET*
=================================
Yth. Pelanggan HM NET Kak *{nama}*,

Kami menginformasikan bahwa saat ini sedang terjadi kendala / gangguan jaringan internet dengan rincian:
• Area Terdampak: *{area_gangguan}* (Jalur PON {pon})
• Kendala: {penyebab_gangguan}
• Estimasi Perbaikan: *{estimasi_gangguan}*

Tim teknisi lapangan kami sedang bekerja maksimal agar koneksi internet kembali normal secepatnya. Kami mohon maaf atas ketidaknyamanan ini. 🙏
*HM NET - Akses Internet Rumahan*`,

  maintenance:
`*INFORMASI PEMELIHARAAN (MAINTENANCE) - HM NET*
=================================
Yth. Pelanggan HM NET Kak *{nama}*,

Demi meningkatkan kualitas dan kestabilan layanan internet, kami akan melakukan pemeliharaan jaringan pada:
• Area / Jalur: *{area_gangguan}* (Jalur PON {pon})
• Pekerjaan: {penyebab_gangguan}
• Estimasi Durasi: *{estimasi_gangguan}*

Selama proses berlangsung, koneksi internet mungkin akan mengalami putus sementara. Mohon maaf atas ketidaknyamanan ini dan terima kasih atas pengertiannya. 🙏
*HM NET - Akses Internet Rumahan*`,

  normal:
`*INFORMASI JARINGAN NORMAL KEMBALI - HM NET*
=================================
Halo Kak *{nama}*,

Kabar baik! Proses perbaikan jaringan pada *{area_gangguan}* (Jalur PON {pon}) terkait *{penyebab_gangguan}* telah *SELESAI* dilaksanakan.

Saat ini koneksi internet Wi-Fi HM NET sudah kembali *NORMAL* dan stabil. Jika koneksi di rumah Anda belum tersambung, silakan matikan lalu nyalakan ulang (restart) modem ONT Anda selama 10 detik.

Terima kasih atas kesabaran dan kesetiaan Anda bersama *HM NET*! 🚀🙏`
};

// Temporary draft store when editing templates in Sub-tab 3
let draftWaTemplates = null;

function getWaTemplates() {
  const raw = localStorage.getItem(STORAGE_KEYS.WA_TEMPLATES);
  if (!raw) {
    return JSON.parse(JSON.stringify(DEFAULT_WA_TEMPLATES));
  }
  try {
    const parsed = JSON.parse(raw);
    const merged = {
      ...DEFAULT_WA_TEMPLATES,
      ...parsed
    };
    // Auto-upgrade template to remove link pembayaran and keep Mandiri/BRI/DANA/LinkAja
    if (!localStorage.getItem('hmnet_wa_tpl_nolink_v8')) {
      merged.bankBca = DEFAULT_WA_TEMPLATES.bankBca;
      merged.bankBri = DEFAULT_WA_TEMPLATES.bankBri;
      merged.ewalletInfo = DEFAULT_WA_TEMPLATES.ewalletInfo;
      merged.adminWa = DEFAULT_WA_TEMPLATES.adminWa;
      merged.paymentInfo = DEFAULT_WA_TEMPLATES.paymentInfo;
      merged.tagihan = DEFAULT_WA_TEMPLATES.tagihan;
      merged.peringatan = DEFAULT_WA_TEMPLATES.peringatan;
      localStorage.setItem('hmnet_wa_tpl_nolink_v8', '1');
      saveWaTemplates(merged);
    }
    return merged;
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_WA_TEMPLATES));
  }
}

function saveWaTemplates(tpls) {
  localStorage.setItem(STORAGE_KEYS.WA_TEMPLATES, JSON.stringify(tpls));
}

function getCustomerUniqueCode(custId) {
  const idx = state.customers.findIndex(c => c.id === custId);
  return idx !== -1 ? (idx + 1) : 1;
}

function getCustomerPayUrl(custId, year, month, custObj = null, billObj = null) {
  const tpls = getWaTemplates();
  let baseUrl = '';

  if (tpls.publicDomain && tpls.publicDomain.trim().startsWith('http')) {
    baseUrl = tpls.publicDomain.trim().replace(/\/+$/, '') + '/';
  } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Use localtest.me (which resolves to 127.0.0.1 and has a .me TLD) so WhatsApp ALWAYS turns the URL into a clickable blue link!
    const portPart = window.location.port ? `:${window.location.port}` : '';
    baseUrl = `${window.location.protocol}//localtest.me${portPart}${window.location.pathname}`;
  } else {
    baseUrl = window.location.origin + window.location.pathname;
  }

  const cid = encodeURIComponent(custId || 'c-1');
  const y = year || state.selectedYear;
  const m = month || state.selectedMonth;
  const cust = custObj || state.customers.find(c => c.id === custId);
  if (cust) {
    const amt = billObj && billObj.status === 'SEBAGIAN'
      ? Math.max(0, (Number(billObj.tariff) || cust.price) - (Number(billObj.amountPaid) || 0))
      : (Number(billObj?.tariff) || cust.price || 150000);
    return `${baseUrl}?pay=${cid}&y=${y}&m=${m}&name=${encodeURIComponent(cust.name)}&amt=${amt}&pkg=${encodeURIComponent(cust.speed || '10 Mbps')}&pon=${encodeURIComponent(cust.pon || '1')}`;
  }
  return `${baseUrl}?pay=${cid}&y=${y}&m=${m}`;
}

function compileWaTemplate(templateText, cust, bill, extra = {}) {
  const tpls = extra.templatesOverride || getWaTemplates();
  const y = extra.year || bill?.year || state.selectedYear;
  const m = extra.month || bill?.month || state.selectedMonth;
  const periodStr = `${MONTH_NAMES[(m || 1) - 1]} ${y}`;

  const tariffNum = bill ? Number(bill.tariff) || Number(cust?.price) || 0 : Number(cust?.price) || 0;
  const paidNum = bill ? Number(bill.amountPaid) || 0 : 0;
  let remainingNum = (bill && bill.status === 'SEBAGIAN') ? Math.max(0, tariffNum - paidNum) : tariffNum;

  const useUnique = extra.useUniqueCode !== undefined ? extra.useUniqueCode : tpls.useUniqueCode;
  if (useUnique && cust?.id && (!bill || bill.status !== 'LUNAS')) {
    remainingNum += getCustomerUniqueCode(cust.id);
  }

  const statusText = !bill || bill.status === 'BELUM'
    ? 'BELUM DIBAYAR'
    : bill.status === 'SEBAGIAN'
      ? `BAYAR SEBAGIAN (Sisa ${formatRupiah(remainingNum)})`
      : 'LUNAS';

  const dueDay = (extra.dueDateDay !== undefined ? extra.dueDateDay : tpls.dueDateDay) || 'Tanggal 10';
  const dueDateStr = `${dueDay} ${periodStr}`;
  const rekeningStr = (extra.paymentInfo !== undefined ? extra.paymentInfo : tpls.paymentInfo) || DEFAULT_WA_TEMPLATES.paymentInfo;
  const linkBayarStr = getCustomerPayUrl(cust?.id || 'c-1', y, m, cust, bill);

  const areaGangguan = extra.areaGangguan || document.getElementById('outage-area-text')?.value || 'Seluruh Jalur Layanan HM NET';
  const penyebabGangguan = extra.penyebabGangguan || document.getElementById('outage-cause-text')?.value || 'Perbaikan jalur kabel Fiber Optik';
  const estimasiGangguan = extra.estimasiGangguan || document.getElementById('outage-eta-text')?.value || '1 - 2 Jam ke depan';

  const catatanLine = bill?.notes ? `• Catatan: "${bill.notes}"\n` : '';

  return String(templateText || '')
    .replace(/\{nama\}/g, cust?.name || 'Pelanggan')
    .replace(/\{periode\}/g, periodStr)
    .replace(/\{paket\}/g, cust?.speed || '10 Mbps')
    .replace(/\{tagihan\}/g, formatRupiah(remainingNum || tariffNum))
    .replace(/\{dibayar\}/g, formatRupiah(paidNum || tariffNum))
    .replace(/\{status\}/g, statusText)
    .replace(/\{jatuh_tempo\}/g, dueDateStr)
    .replace(/\{link_bayar\}/g, linkBayarStr)
    .replace(/\{rekening\}/g, rekeningStr)
    .replace(/\{tgl_bayar\}/g, bill?.paymentDate || new Date().toISOString().split('T')[0])
    .replace(/\{metode_bayar\}/g, bill?.paymentMethod || 'Cash / Tunai')
    .replace(/\{catatan\}/g, catatanLine)
    .replace(/\{pon\}/g, cust?.pon || '1')
    .replace(/\{sn\}/g, cust?.sn || '-')
    .replace(/\{alamat\}/g, cust?.address || '-')
    .replace(/\{area_gangguan\}/g, areaGangguan)
    .replace(/\{penyebab_gangguan\}/g, penyebabGangguan)
    .replace(/\{estimasi_gangguan\}/g, estimasiGangguan);
}

// =========================================================
// NAVIGATION & SUB-TABS FOR BROADCAST & TEMPLATE WA
// =========================================================
function openBroadcastSubtab(subtab) {
  state.broadcastSubtab = subtab || 'unpaid';
  if (state.currentTab !== 'broadcast') {
    switchTab('broadcast');
  } else {
    initBroadcastTab();
  }
}

function initBroadcastTab() {
  const subtab = state.broadcastSubtab || 'unpaid';

  const subIds = ['unpaid', 'outage', 'templates'];
  subIds.forEach(k => {
    const panel = document.getElementById(`subtab-broadcast-${k}`);
    const btn = document.getElementById(`btn-bcast-sub-${k}`);
    if (panel) {
      if (k === subtab) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
    if (btn) {
      if (k === subtab) {
        if (k === 'outage') {
          btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 bg-rose-600 text-white shadow-xs';
        } else if (k === 'templates') {
          btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 bg-brand-600 text-white shadow-xs';
        } else {
          btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 bg-emerald-600 text-white shadow-xs';
        }
      } else {
        btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 hover:bg-white/60';
      }
    }
  });

  if (subtab === 'unpaid') {
    setUnpaidBroadcastTemplate(state.unpaidBroadcastTplKey || 'tagihan');
    renderBroadcastUnpaidTable(true);
  } else if (subtab === 'outage') {
    setOutageBroadcastType(state.outageBroadcastTplKey || 'gangguan');
    if (state.outageSelectedIds.size === 0) {
      state.customers.filter(c => c.status !== 'BERHENTI').forEach(c => state.outageSelectedIds.add(c.id));
    }
    renderBroadcastOutageTable();
  } else if (subtab === 'templates') {
    initMasterTemplateEditor();
  }

  if (window.lucide) lucide.createIcons();
}

// =========================================================
// SUB-TAB 1: BROADCAST PESAN SERENTAK PELANGGAN BELUM BAYAR
// =========================================================
function setUnpaidBroadcastTemplate(tplKey) {
  state.unpaidBroadcastTplKey = tplKey;
  const tpls = getWaTemplates();

  const btnTagihan = document.getElementById('btn-unpaid-tpl-tagihan');
  const btnPeringatan = document.getElementById('btn-unpaid-tpl-peringatan');

  if (btnTagihan && btnPeringatan) {
    if (tplKey === 'tagihan') {
      btnTagihan.className = 'p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center space-x-2 bg-emerald-50 text-emerald-900 border-emerald-400 shadow-2xs';
      btnPeringatan.className = 'p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center space-x-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
    } else {
      btnPeringatan.className = 'p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center space-x-2 bg-amber-50 text-amber-900 border-amber-400 shadow-2xs';
      btnTagihan.className = 'p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center space-x-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
    }
  }

  const txtEl = document.getElementById('bcast-unpaid-template-text');
  if (txtEl) {
    txtEl.value = tpls[tplKey] || tpls.tagihan;
  }

  const sampleLinkEl = document.getElementById('bcast-unpaid-sample-link');
  if (sampleLinkEl) {
    const firstCust = state.customers[0];
    const sampleUrl = getCustomerPayUrl(firstCust?.id || 'c-1', state.selectedYear, state.selectedMonth, firstCust);
    sampleLinkEl.textContent = sampleUrl;
    sampleLinkEl.href = sampleUrl;
  }
}

function getUnpaidBroadcastPeriod() {
  const yEl = document.getElementById('bcast-unpaid-year');
  const mEl = document.getElementById('bcast-unpaid-month');
  const y = yEl && yEl.value ? parseInt(yEl.value) : state.selectedYear;
  const m = mEl && mEl.value ? parseInt(mEl.value) : state.selectedMonth;
  return { y, m };
}

function getUnpaidCustomerRows() {
  const { y, m } = getUnpaidBroadcastPeriod();
  const statusFilter = document.getElementById('bcast-unpaid-status-filter')?.value || 'ALL_UNPAID';
  const ponFilter = document.getElementById('bcast-unpaid-pon-filter')?.value || 'ALL';
  const searchVal = (document.getElementById('bcast-unpaid-search')?.value || '').trim().toLowerCase();

  const rows = [];
  state.customers.forEach(cust => {
    if (cust.status === 'BERHENTI') return;

    const bill = state.bills.find(b => b.customerId === cust.id && b.year === y && b.month === m) || {
      id: `bill-${cust.id}-${y}-${m}`,
      customerId: cust.id,
      year: y,
      month: m,
      tariff: cust.price,
      amountPaid: 0,
      status: 'BELUM',
      paymentDate: '',
      paymentMethod: '',
      notes: ''
    };

    if (bill.status === 'LUNAS') return;
    if (statusFilter === 'BELUM' && bill.status !== 'BELUM') return;
    if (statusFilter === 'SEBAGIAN' && bill.status !== 'SEBAGIAN') return;
    if (ponFilter !== 'ALL' && String(cust.pon) !== String(ponFilter)) return;

    if (searchVal) {
      const matchName = (cust.name || '').toLowerCase().includes(searchVal);
      const matchPhone = (cust.phone || '').toLowerCase().includes(searchVal);
      const matchAddr = (cust.address || '').toLowerCase().includes(searchVal);
      if (!matchName && !matchPhone && !matchAddr) return;
    }

    const remaining = Math.max(0, (Number(bill.tariff) || Number(cust.price) || 0) - (Number(bill.amountPaid) || 0));
    rows.push({ cust, bill, remaining, year: y, month: m });
  });

  return rows;
}

function renderBroadcastUnpaidTable(autoSelectInitial = false) {
  const tbody = document.getElementById('tbody-bcast-unpaid');
  if (!tbody) return;

  const rows = getUnpaidCustomerRows();

  // If initial open and nothing selected yet, auto-check all unpaid customers that have a phone number
  if (autoSelectInitial && state.unpaidSelectedIds.size === 0) {
    rows.forEach(r => {
      if (r.cust.phone && r.cust.phone.trim().length >= 8) {
        state.unpaidSelectedIds.add(r.cust.id);
      }
    });
  }

  tbody.innerHTML = '';

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-10 text-center text-slate-400">
          <i data-lucide="check-circle-2" class="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-70"></i>
          <div class="font-bold text-slate-700">Semua Pelanggan Sudah Lunas / Tidak Ada Data!</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Tidak ditemukan pelanggan yang belum bayar pada filter periode ini.</div>
        </td>
      </tr>
    `;
    updateUnpaidSelectedSummary(rows);
    if (window.lucide) lucide.createIcons();
    return;
  }

  rows.forEach(({ cust, bill, remaining, year, month }) => {
    const isChecked = state.unpaidSelectedIds.has(cust.id);
    const tr = document.createElement('tr');
    tr.className = isChecked ? 'bg-emerald-50/40 hover:bg-emerald-50/70 transition' : 'hover:bg-slate-50 transition';

    const statusBadge = bill.status === 'SEBAGIAN'
      ? '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">CICIL / SEBAGIAN</span>'
      : '<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">BELUM BAYAR</span>';

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleUnpaidCustomerCheck('${cust.id}', this.checked)" class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer">
      </td>
      <td class="py-2.5 px-3">
        <div class="font-bold text-slate-900">${cust.name}</div>
        <div class="text-[11px] text-slate-500">${cust.speed} • ${cust.address || '-'}</div>
      </td>
      <td class="py-2.5 px-2 text-center">
        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">PON ${cust.pon}</span>
      </td>
      <td class="py-2.5 px-3 text-right">
        <div class="font-black text-rose-600">${formatRupiah(remaining)}</div>
        <div class="mt-0.5">${statusBadge}</div>
      </td>
      <td class="py-2.5 px-3">
        <input type="text" value="${cust.phone || ''}" onchange="updateCustomerPhoneInline('${cust.id}', this.value)" placeholder="Isi No WA (08...)" class="w-36 text-xs px-2.5 py-1.5 bg-white border ${cust.phone ? 'border-slate-300' : 'border-rose-400 bg-rose-50/30'} rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none">
      </td>
      <td class="py-2.5 px-3 text-center">
        <button type="button" onclick="openModalWhatsApp('${cust.id}', ${year}, ${month})" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1" title="Kirim satuan / preview pesan">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>Satuan</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateUnpaidSelectedSummary(rows);
  if (window.lucide) lucide.createIcons();
}

function toggleUnpaidCustomerCheck(custId, isChecked) {
  if (isChecked) {
    state.unpaidSelectedIds.add(custId);
  } else {
    state.unpaidSelectedIds.delete(custId);
  }
  renderBroadcastUnpaidTable(false);
}

function toggleSelectAllUnpaid(isChecked) {
  const rows = getUnpaidCustomerRows();
  rows.forEach(r => {
    if (isChecked) state.unpaidSelectedIds.add(r.cust.id);
    else state.unpaidSelectedIds.delete(r.cust.id);
  });
  renderBroadcastUnpaidTable(false);
}

function updateUnpaidSelectedSummary(rows) {
  const currentRows = rows || getUnpaidCustomerRows();
  let selectedCount = 0;
  let selectedAmount = 0;

  currentRows.forEach(r => {
    if (state.unpaidSelectedIds.has(r.cust.id)) {
      selectedCount++;
      selectedAmount += r.remaining;
    }
  });

  const countEl = document.getElementById('bcast-unpaid-selected-count');
  const amountEl = document.getElementById('bcast-unpaid-selected-amount');
  const btnCountEl = document.getElementById('btn-bcast-unpaid-count');
  const headerChk = document.getElementById('chk-header-unpaid');

  if (countEl) countEl.textContent = selectedCount;
  if (amountEl) amountEl.textContent = formatRupiah(selectedAmount);
  if (btnCountEl) btnCountEl.textContent = selectedCount;
  if (headerChk) {
    headerChk.checked = currentRows.length > 0 && selectedCount === currentRows.length;
  }
}

function updateCustomerPhoneInline(custId, newPhone) {
  const idx = state.customers.findIndex(c => c.id === custId);
  if (idx !== -1) {
    state.customers[idx].phone = (newPhone || '').trim();
    saveCustomers();
    renderTablePelanggan();
    showToast(`Nomor WA ${state.customers[idx].name} disimpan!`);
  }
}

function launchUnpaidBroadcastQueue() {
  const rows = getUnpaidCustomerRows();
  const selectedRows = rows.filter(r => state.unpaidSelectedIds.has(r.cust.id));

  if (selectedRows.length === 0) {
    alert('Silakan ceklis (centang) minimal 1 pelanggan yang belum bayar terlebih dahulu!');
    return;
  }

  const missingPhone = selectedRows.filter(r => !r.cust.phone || r.cust.phone.replace(/[^0-9]/g, '').length < 8);
  if (missingPhone.length > 0) {
    const names = missingPhone.map(r => r.cust.name).join(', ');
    if (selectedRows.length === missingPhone.length) {
      alert(`Pelanggan yang Anda pilih (${names}) belum memiliki nomor WhatsApp! Silakan isi nomor WA pada kolom tabel terlebih dahulu.`);
      return;
    }
    if (!confirm(`Terdapat ${missingPhone.length} pelanggan terpilih yang belum memiliki nomor WA (${names}) dan akan dilewati. Lanjutkan kirim ke ${selectedRows.length - missingPhone.length} pelanggan lainnya?`)) {
      return;
    }
  }

  const rawTpl = document.getElementById('bcast-unpaid-template-text')?.value || getWaTemplates()[state.unpaidBroadcastTplKey || 'tagihan'];
  const queueItems = [];

  selectedRows.forEach(({ cust, bill, remaining, year, month }) => {
    const cleanPhone = formatCleanWaPhone(cust.phone);
    if (!cleanPhone) return;

    const msg = compileWaTemplate(rawTpl, cust, bill, { year, month });
    queueItems.push({
      custId: cust.id,
      name: cust.name,
      phoneRaw: cust.phone,
      cleanPhone,
      pon: cust.pon,
      badgeText: `Tagihan: ${formatRupiah(remaining)}`,
      message: msg,
      status: 'PENDING'
    });
  });

  const { y, m } = getUnpaidBroadcastPeriod();
  openModalBroadcastQueue(
    queueItems,
    `Broadcast Tagihan Belum Bayar (${MONTH_NAMES[m - 1]} ${y})`,
    `${queueItems.length} Pelanggan Terpilih Siap Dikirimi Pesan Tagihan`,
    'emerald'
  );
}

// =========================================================
// SUB-TAB 2: BROADCAST PESAN SERENTAK INFORMASI GANGGUAN
// =========================================================
function setOutageBroadcastType(tplKey) {
  state.outageBroadcastTplKey = tplKey;

  ['gangguan', 'maintenance', 'normal'].forEach(k => {
    const btn = document.getElementById(`btn-outage-tpl-${k}`);
    if (!btn) return;
    if (k === tplKey) {
      if (k === 'normal') {
        btn.className = 'p-2 rounded-xl border text-xs font-bold transition text-center bg-emerald-50 text-emerald-900 border-emerald-400 shadow-2xs';
      } else if (k === 'maintenance') {
        btn.className = 'p-2 rounded-xl border text-xs font-bold transition text-center bg-amber-50 text-amber-900 border-amber-400 shadow-2xs';
      } else {
        btn.className = 'p-2 rounded-xl border text-xs font-bold transition text-center bg-rose-50 text-rose-900 border-rose-400 shadow-2xs';
      }
    } else {
      btn.className = 'p-2 rounded-xl border text-xs font-semibold transition text-center bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
    }
  });

  refreshOutageTemplateText();
}

function onOutageScopeChange() {
  const scope = document.getElementById('outage-target-scope')?.value || 'ALL';
  const areaInput = document.getElementById('outage-area-text');
  const ponFilter = document.getElementById('bcast-outage-pon-filter');

  state.outageSelectedIds.clear();

  if (scope === 'ALL') {
    if (areaInput) areaInput.value = 'Seluruh Jalur Layanan HM NET';
    if (ponFilter) ponFilter.value = 'ALL';
    state.customers.filter(c => c.status !== 'BERHENTI').forEach(c => state.outageSelectedIds.add(c.id));
  } else if (scope.startsWith('PON_')) {
    const ponNum = scope.replace('PON_', '');
    if (areaInput) areaInput.value = `Jalur Distribusi PON ${ponNum}`;
    if (ponFilter) ponFilter.value = ponNum;
    state.customers.filter(c => c.status !== 'BERHENTI' && String(c.pon) === String(ponNum)).forEach(c => state.outageSelectedIds.add(c.id));
  } else if (scope === 'REDAMAN_KRITIS') {
    if (areaInput) areaInput.value = 'Jalur Kabel Dropcore / Redaman Optik Kritis';
    if (ponFilter) ponFilter.value = 'ALL';
    state.customers.filter(c => c.status !== 'BERHENTI' && parseFloat(c.redaman) < -27).forEach(c => state.outageSelectedIds.add(c.id));
  }

  refreshOutageTemplateText();
  renderBroadcastOutageTable();
}

function setOutageQuickCause(text) {
  const el = document.getElementById('outage-cause-text');
  if (el) {
    el.value = text;
    refreshOutageTemplateText();
  }
}

function setOutageQuickEta(text) {
  const el = document.getElementById('outage-eta-text');
  if (el) {
    el.value = text;
    refreshOutageTemplateText();
  }
}

function refreshOutageTemplateText() {
  const tplKey = state.outageBroadcastTplKey || 'gangguan';
  const tpls = getWaTemplates();
  const txtEl = document.getElementById('bcast-outage-template-text');
  if (txtEl) {
    txtEl.value = tpls[tplKey] || DEFAULT_WA_TEMPLATES[tplKey];
  }
}

function getOutageFilteredCustomers() {
  const ponFilter = document.getElementById('bcast-outage-pon-filter')?.value || 'ALL';
  const searchVal = (document.getElementById('bcast-outage-search')?.value || '').trim().toLowerCase();

  return state.customers.filter(cust => {
    if (cust.status === 'BERHENTI') return false;
    if (ponFilter !== 'ALL' && String(cust.pon) !== String(ponFilter)) return false;
    if (searchVal) {
      const mName = (cust.name || '').toLowerCase().includes(searchVal);
      const mAddr = (cust.address || '').toLowerCase().includes(searchVal);
      const mSn = (cust.sn || '').toLowerCase().includes(searchVal);
      const mPhone = (cust.phone || '').toLowerCase().includes(searchVal);
      if (!mName && !mAddr && !mSn && !mPhone) return false;
    }
    return true;
  });
}

function renderBroadcastOutageTable() {
  const tbody = document.getElementById('tbody-bcast-outage');
  if (!tbody) return;

  const list = getOutageFilteredCustomers();
  tbody.innerHTML = '';

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400">
          Tidak ada pelanggan yang sesuai dengan filter pencarian.
        </td>
      </tr>
    `;
    updateOutageSelectedSummary(list);
    return;
  }

  list.forEach(cust => {
    const isChecked = state.outageSelectedIds.has(cust.id);
    const redamanInfo = getRedamanClassification(cust.redaman);
    const tr = document.createElement('tr');
    tr.className = isChecked ? 'bg-rose-50/40 hover:bg-rose-50/70 transition' : 'hover:bg-slate-50 transition';

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-center">
        <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleOutageCustomerCheck('${cust.id}', this.checked)" class="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer">
      </td>
      <td class="py-2.5 px-3">
        <div class="font-bold text-slate-900">${cust.name}</div>
        <div class="text-[11px] text-slate-500">${cust.address || '-'} • SN: <span class="font-mono">${cust.sn || '-'}</span></div>
      </td>
      <td class="py-2.5 px-2 text-center">
        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">PON ${cust.pon}</span>
      </td>
      <td class="py-2.5 px-3 text-center">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${redamanInfo.badgeClass}">${cust.redaman} dB (${redamanInfo.label})</span>
      </td>
      <td class="py-2.5 px-3">
        <input type="text" value="${cust.phone || ''}" onchange="updateCustomerPhoneInline('${cust.id}', this.value)" placeholder="Isi No WA (08...)" class="w-36 text-xs px-2.5 py-1.5 bg-white border ${cust.phone ? 'border-slate-300' : 'border-rose-400 bg-rose-50/30'} rounded-lg font-mono font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none">
      </td>
      <td class="py-2.5 px-3 text-center">
        <button type="button" onclick="sendSingleOutageWa('${cust.id}')" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1" title="Kirim info gangguan ke pelanggan ini saja">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          <span>Satuan</span>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateOutageSelectedSummary(list);
  if (window.lucide) lucide.createIcons();
}

function toggleOutageCustomerCheck(custId, isChecked) {
  if (isChecked) state.outageSelectedIds.add(custId);
  else state.outageSelectedIds.delete(custId);
  renderBroadcastOutageTable();
}

function toggleSelectAllOutage(isChecked) {
  const list = getOutageFilteredCustomers();
  list.forEach(c => {
    if (isChecked) state.outageSelectedIds.add(c.id);
    else state.outageSelectedIds.delete(c.id);
  });
  renderBroadcastOutageTable();
}

function selectOutageCriticalOnly() {
  state.outageSelectedIds.clear();
  state.customers.forEach(c => {
    if (c.status !== 'BERHENTI' && parseFloat(c.redaman) < -27) {
      state.outageSelectedIds.add(c.id);
    }
  });
  renderBroadcastOutageTable();
  showToast('Pelanggan dengan redaman kritis (< -27 dB) telah diceklis!');
}

function updateOutageSelectedSummary(list) {
  const currentList = list || getOutageFilteredCustomers();
  const totalSelected = state.customers.filter(c => c.status !== 'BERHENTI' && state.outageSelectedIds.has(c.id)).length;
  const visibleSelected = currentList.filter(c => state.outageSelectedIds.has(c.id)).length;

  const countEl = document.getElementById('bcast-outage-selected-count');
  const btnCountEl = document.getElementById('btn-bcast-outage-count');
  const headerChk = document.getElementById('chk-header-outage');

  if (countEl) countEl.textContent = totalSelected;
  if (btnCountEl) btnCountEl.textContent = totalSelected;
  if (headerChk) {
    headerChk.checked = currentList.length > 0 && visibleSelected === currentList.length;
  }
}

function sendSingleOutageWa(custId) {
  const cust = state.customers.find(c => c.id === custId);
  if (!cust) return;

  const cleanPhone = formatCleanWaPhone(cust.phone);
  if (!cleanPhone) {
    alert(`Pelanggan "${cust.name}" belum memiliki nomor WhatsApp yang valid! Silakan ketik nomor WA pada kolom tabel terlebih dahulu.`);
    return;
  }

  const rawTpl = document.getElementById('bcast-outage-template-text')?.value || getWaTemplates()[state.outageBroadcastTplKey || 'gangguan'];
  const areaGangguan = document.getElementById('outage-area-text')?.value || 'Seluruh Jalur Layanan HM NET';
  const penyebabGangguan = document.getElementById('outage-cause-text')?.value || 'Perbaikan jaringan Fiber Optik';
  const estimasiGangguan = document.getElementById('outage-eta-text')?.value || '1 - 2 Jam ke depan';

  const msg = compileWaTemplate(rawTpl, cust, null, {
    areaGangguan,
    penyebabGangguan,
    estimasiGangguan
  });

  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  showToast(`Membuka WhatsApp info gangguan ke ${cust.name}...`);
}

function launchOutageBroadcastQueue() {
  const selectedCustomers = state.customers.filter(c => c.status !== 'BERHENTI' && state.outageSelectedIds.has(c.id));

  if (selectedCustomers.length === 0) {
    alert('Silakan ceklis (centang) minimal 1 pelanggan yang akan dikirimi informasi gangguan!');
    return;
  }

  const rawTpl = document.getElementById('bcast-outage-template-text')?.value || getWaTemplates()[state.outageBroadcastTplKey || 'gangguan'];
  const areaGangguan = document.getElementById('outage-area-text')?.value || 'Seluruh Jalur Layanan HM NET';
  const penyebabGangguan = document.getElementById('outage-cause-text')?.value || 'Perbaikan jaringan Fiber Optik';
  const estimasiGangguan = document.getElementById('outage-eta-text')?.value || '1 - 2 Jam ke depan';

  const queueItems = [];
  selectedCustomers.forEach(cust => {
    const cleanPhone = formatCleanWaPhone(cust.phone);
    if (!cleanPhone) return;

    const msg = compileWaTemplate(rawTpl, cust, null, {
      areaGangguan,
      penyebabGangguan,
      estimasiGangguan
    });

    queueItems.push({
      custId: cust.id,
      name: cust.name,
      phoneRaw: cust.phone,
      cleanPhone,
      pon: cust.pon,
      badgeText: `PON ${cust.pon} • ${cust.redaman} dB`,
      message: msg,
      status: 'PENDING'
    });
  });

  if (queueItems.length === 0) {
    alert('Pelanggan yang diceklis belum memiliki nomor WhatsApp! Silakan isi nomor WA pada kolom tabel terlebih dahulu.');
    return;
  }

  const titleLabels = {
    gangguan: 'Broadcast Informasi Gangguan Jaringan',
    maintenance: 'Broadcast Informasi Maintenance Jaringan',
    normal: 'Broadcast Informasi Jaringan Normal Kembali'
  };

  openModalBroadcastQueue(
    queueItems,
    titleLabels[state.outageBroadcastTplKey || 'gangguan'],
    `Area: ${areaGangguan} • ${queueItems.length} Pelanggan Terpilih`,
    'rose'
  );
}

// =========================================================
// SUB-TAB 3: MENU KHUSUS UBAH TEMPLATE PESAN & REKENING WA
// =========================================================
function initMasterTemplateEditor() {
  draftWaTemplates = getWaTemplates();

  const payInfoEl = document.getElementById('tpl-payment-info');
  const dueDayEl = document.getElementById('tpl-due-date-day');
  const fonnteEl = document.getElementById('tpl-fonnte-token');
  const bcaEl = document.getElementById('tpl-bank-bca');
  const briEl = document.getElementById('tpl-bank-bri');
  const ewalletEl = document.getElementById('tpl-ewallet-info');
  const adminWaEl = document.getElementById('tpl-admin-wa');
  const publicDomEl = document.getElementById('tpl-public-domain');
  const uniqueChk = document.getElementById('tpl-use-unique-code');
  const qrisHint = document.getElementById('tpl-qris-status-hint');

  if (payInfoEl) payInfoEl.value = draftWaTemplates.paymentInfo || '';
  if (dueDayEl) dueDayEl.value = draftWaTemplates.dueDateDay || 'Tanggal 10';
  if (fonnteEl) fonnteEl.value = draftWaTemplates.fonnteToken || '';
  if (bcaEl) bcaEl.value = draftWaTemplates.bankBca || DEFAULT_WA_TEMPLATES.bankBca;
  if (briEl) briEl.value = draftWaTemplates.bankBri || DEFAULT_WA_TEMPLATES.bankBri;
  if (ewalletEl) ewalletEl.value = draftWaTemplates.ewalletInfo || DEFAULT_WA_TEMPLATES.ewalletInfo;
  if (adminWaEl) adminWaEl.value = draftWaTemplates.adminWa || DEFAULT_WA_TEMPLATES.adminWa;
  if (publicDomEl) publicDomEl.value = draftWaTemplates.publicDomain || '';
  if (uniqueChk) uniqueChk.checked = !!draftWaTemplates.useUniqueCode;
  if (qrisHint) {
    qrisHint.textContent = draftWaTemplates.qrisImageDataUrl
      ? '✅ Gambar QRIS kustom HM NET sudah terpasang dan siap ditampilkan ke pelanggan.'
      : 'Jika belum di-upload, halaman link bayar otomatis menampilkan QRIS interaktif HM NET.';
  }

  selectMasterTemplateEditor(state.masterTemplateEditingKey || 'tagihan');
}

function handleUploadQrisImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    if (!draftWaTemplates) draftWaTemplates = getWaTemplates();
    draftWaTemplates.qrisImageDataUrl = e.target.result;
    saveWaTemplates(draftWaTemplates);
    const qrisHint = document.getElementById('tpl-qris-status-hint');
    if (qrisHint) {
      qrisHint.textContent = '✅ Gambar QRIS kustom HM NET berhasil di-upload dan disimpan!';
    }
    showToast('Gambar Barcode QRIS HM NET berhasil disimpan!');
  };
  reader.readAsDataURL(file);
}

function selectMasterTemplateEditor(tplKey) {
  if (!draftWaTemplates) draftWaTemplates = getWaTemplates();
  state.masterTemplateEditingKey = tplKey;

  const keys = ['tagihan', 'peringatan', 'lunas', 'gangguan', 'maintenance', 'normal'];
  const titles = {
    tagihan: 'Isi Template: 📢 1. Tagihan Baru',
    peringatan: 'Isi Template: ⚠️ 2. Pengingat Jatuh Tempo & Isolir',
    lunas: 'Isi Template: 🧾 3. Kuitansi Pembayaran Lunas',
    gangguan: 'Isi Template: 🚨 4. Informasi Gangguan Jaringan',
    maintenance: 'Isi Template: 🔧 5. Informasi Maintenance Terjadwal',
    normal: 'Isi Template: ✅ 6. Informasi Jaringan Normal Kembali'
  };

  keys.forEach(k => {
    const btn = document.getElementById(`btn-master-tpl-${k}`);
    if (!btn) return;
    if (k === tplKey) {
      btn.className = 'p-2.5 rounded-xl border text-xs font-bold transition text-left bg-brand-50 text-brand-900 border-brand-400 shadow-2xs';
    } else {
      btn.className = 'p-2.5 rounded-xl border text-xs font-semibold transition text-left bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
    }
  });

  const lbl = document.getElementById('lbl-master-tpl-active');
  if (lbl) lbl.textContent = titles[tplKey] || 'Isi Template';

  const editor = document.getElementById('tpl-master-editor');
  if (editor) {
    editor.value = draftWaTemplates[tplKey] || DEFAULT_WA_TEMPLATES[tplKey] || '';
  }

  updateMasterTemplateLivePreview();
}

function onMasterTemplateInput() {
  if (!draftWaTemplates) draftWaTemplates = getWaTemplates();
  const key = state.masterTemplateEditingKey || 'tagihan';
  const editor = document.getElementById('tpl-master-editor');
  const payInfoEl = document.getElementById('tpl-payment-info');
  const dueDayEl = document.getElementById('tpl-due-date-day');
  const bcaEl = document.getElementById('tpl-bank-bca');
  const briEl = document.getElementById('tpl-bank-bri');
  const ewalletEl = document.getElementById('tpl-ewallet-info');
  const adminWaEl = document.getElementById('tpl-admin-wa');
  const publicDomEl = document.getElementById('tpl-public-domain');
  const uniqueChk = document.getElementById('tpl-use-unique-code');

  if (editor) draftWaTemplates[key] = editor.value;
  if (payInfoEl) draftWaTemplates.paymentInfo = payInfoEl.value;
  if (dueDayEl) draftWaTemplates.dueDateDay = dueDayEl.value;
  if (bcaEl) draftWaTemplates.bankBca = bcaEl.value;
  if (briEl) draftWaTemplates.bankBri = briEl.value;
  if (ewalletEl) draftWaTemplates.ewalletInfo = ewalletEl.value;
  if (adminWaEl) draftWaTemplates.adminWa = adminWaEl.value;
  if (publicDomEl) draftWaTemplates.publicDomain = publicDomEl.value;
  if (uniqueChk) draftWaTemplates.useUniqueCode = uniqueChk.checked;

  updateMasterTemplateLivePreview();
}

function insertTemplateVar(token) {
  const editor = document.getElementById('tpl-master-editor');
  if (!editor) return;

  const start = editor.selectionStart || 0;
  const end = editor.selectionEnd || 0;
  const val = editor.value;

  editor.value = val.substring(0, start) + token + val.substring(end);
  editor.focus();
  editor.selectionStart = editor.selectionEnd = start + token.length;

  onMasterTemplateInput();
}

function updateMasterTemplateLivePreview() {
  const previewEl = document.getElementById('tpl-master-live-preview');
  if (!previewEl) return;

  const sampleCust = state.customers[0] || {
    id: 'c-1',
    name: 'Falah',
    speed: '20 Mbps',
    price: 150000,
    pon: '2',
    sn: 'ZTEGd3be73c7',
    address: 'Jl. Utama RT 01 RW 01'
  };

  const sampleBill = {
    year: state.selectedYear,
    month: state.selectedMonth,
    tariff: sampleCust.price || 150000,
    amountPaid: state.masterTemplateEditingKey === 'lunas' ? (sampleCust.price || 150000) : 0,
    status: state.masterTemplateEditingKey === 'lunas' ? 'LUNAS' : 'BELUM',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transfer BCA',
    notes: ''
  };

  const key = state.masterTemplateEditingKey || 'tagihan';
  const rawTpl = draftWaTemplates?.[key] || '';

  const compiled = compileWaTemplate(rawTpl, sampleCust, sampleBill, {
    year: state.selectedYear,
    month: state.selectedMonth,
    templatesOverride: draftWaTemplates,
    areaGangguan: 'Jalur Distribusi PON 2',
    penyebabGangguan: 'Putus kabel Fiber Optik jalur distribusi',
    estimasiGangguan: '1 - 2 Jam ke depan'
  });

  // Render any URL inside live preview as a real clickable blue link
  const escaped = compiled
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  previewEl.innerHTML = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a href="$1" onclick="openCustomerPayPortal('${sampleCust.id}', ${state.selectedYear}, ${state.selectedMonth}); return false;" class="text-blue-600 hover:text-blue-800 underline font-extrabold cursor-pointer" title="Klik untuk membuka Halaman Link Pembayaran Pelanggan">$1</a>`
  );
}

function saveAllWaTemplates() {
  if (!draftWaTemplates) draftWaTemplates = getWaTemplates();

  const key = state.masterTemplateEditingKey || 'tagihan';
  const editor = document.getElementById('tpl-master-editor');
  const payInfoEl = document.getElementById('tpl-payment-info');
  const dueDayEl = document.getElementById('tpl-due-date-day');
  const fonnteEl = document.getElementById('tpl-fonnte-token');
  const bcaEl = document.getElementById('tpl-bank-bca');
  const briEl = document.getElementById('tpl-bank-bri');
  const ewalletEl = document.getElementById('tpl-ewallet-info');
  const adminWaEl = document.getElementById('tpl-admin-wa');
  const publicDomEl = document.getElementById('tpl-public-domain');
  const uniqueChk = document.getElementById('tpl-use-unique-code');

  if (editor) draftWaTemplates[key] = editor.value;
  if (payInfoEl) draftWaTemplates.paymentInfo = payInfoEl.value.trim();
  if (dueDayEl) draftWaTemplates.dueDateDay = dueDayEl.value.trim() || 'Tanggal 10';
  if (fonnteEl) draftWaTemplates.fonnteToken = fonnteEl.value.trim();
  if (bcaEl) draftWaTemplates.bankBca = bcaEl.value.trim();
  if (briEl) draftWaTemplates.bankBri = briEl.value.trim();
  if (ewalletEl) draftWaTemplates.ewalletInfo = ewalletEl.value.trim();
  if (adminWaEl) draftWaTemplates.adminWa = adminWaEl.value.trim();
  if (publicDomEl) draftWaTemplates.publicDomain = publicDomEl.value.trim();
  if (uniqueChk) draftWaTemplates.useUniqueCode = uniqueChk.checked;

  saveWaTemplates(draftWaTemplates);

  // Sync payment info box inside single WA modal as well
  const payInfoBox = document.getElementById('wa-modal-payment-info-content');
  if (payInfoBox && draftWaTemplates.paymentInfo) {
    payInfoBox.textContent = draftWaTemplates.paymentInfo;
  }

  showToast('Semua pengaturan template, rekening & link pembayaran berhasil disimpan! ✅');
}

function resetWaTemplatesToDefault() {
  if (confirm('Yakin ingin mengembalikan seluruh template pesan WhatsApp dan info rekening ke format bawaan HM NET?')) {
    draftWaTemplates = JSON.parse(JSON.stringify(DEFAULT_WA_TEMPLATES));
    saveWaTemplates(draftWaTemplates);
    initMasterTemplateEditor();
    showToast('Template pesan WhatsApp berhasil di-reset ke bawaan awal.');
  }
}

// =========================================================
// PORTAL PEMBAYARAN MANDIRI PELANGGAN (KLIK LINK & CATAT OTOMATIS)
// =========================================================
let cpayState = {
  custId: null,
  year: 2026,
  month: 11,
  selectedMethod: 'QRIS',
  computedAmount: 0
};

function openCustomerPayPortalFromWaModal() {
  const custId = document.getElementById('wa-customer-id')?.value;
  const y = parseInt(document.getElementById('wa-year')?.value) || state.selectedYear;
  const m = parseInt(document.getElementById('wa-month')?.value) || state.selectedMonth;
  closeModalWhatsApp();
  openCustomerPayPortal(custId, y, m);
}

function openCustomerPayPortal(custId = null, year = null, month = null) {
  if (!state.customers || state.customers.length === 0) {
    loadData();
  }

  const targetYear = year ? parseInt(year) : state.selectedYear;
  const targetMonth = month ? parseInt(month) : state.selectedMonth;
  let targetCust = custId ? state.customers.find(c => c.id === custId) : null;
  if (!targetCust) {
    targetCust = state.customers[0];
  }

  cpayState.custId = targetCust ? targetCust.id : null;
  cpayState.year = targetYear;
  cpayState.month = targetMonth;
  cpayState.selectedMethod = cpayState.selectedMethod || 'QRIS';

  // Populate dropdowns in portal
  const custSelect = document.getElementById('cpay-select-customer');
  const monthSelect = document.getElementById('cpay-select-month');
  const yearSelect = document.getElementById('cpay-select-year');

  if (custSelect) {
    custSelect.innerHTML = '';
    state.customers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} — Paket ${c.speed} (PON ${c.pon})`;
      if (c.id === cpayState.custId) opt.selected = true;
      custSelect.appendChild(opt);
    });
  }

  if (monthSelect) {
    monthSelect.innerHTML = '';
    MONTH_NAMES.forEach((mName, idx) => {
      const opt = document.createElement('option');
      opt.value = idx + 1;
      opt.textContent = mName;
      if (idx + 1 === cpayState.month) opt.selected = true;
      monthSelect.appendChild(opt);
    });
  }

  if (yearSelect) {
    yearSelect.innerHTML = '';
    [2025, 2026, 2027].forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr;
      opt.textContent = `Tahun ${yr}`;
      if (yr === cpayState.year) opt.selected = true;
      yearSelect.appendChild(opt);
    });
  }

  // Hide login & app views, show customer payment portal
  document.getElementById('view-login')?.classList.add('hidden');
  document.getElementById('view-app')?.classList.add('hidden');
  document.getElementById('view-customer-pay')?.classList.remove('hidden');

  const backLabel = document.getElementById('btn-cpay-back-label');
  if (backLabel) {
    backLabel.textContent = state.currentUser ? 'Kembali ke Dashboard Admin' : 'Halaman Login';
  }

  renderCustomerPayPortal();
}

function closeCustomerPayPortal() {
  document.getElementById('view-customer-pay')?.classList.add('hidden');
  // Clear ?pay= query param cleanly without reloading
  if (window.location.search) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  if (state.currentUser) {
    document.getElementById('view-app')?.classList.remove('hidden');
    renderDashboard();
    renderGridTagihan();
    if (state.currentTab === 'broadcast') renderBroadcastUnpaidTable();
  } else {
    document.getElementById('view-login')?.classList.remove('hidden');
  }
  if (window.lucide) lucide.createIcons();
}

function onCustomerPaySelectChange() {
  const cid = document.getElementById('cpay-select-customer')?.value;
  const m = parseInt(document.getElementById('cpay-select-month')?.value) || state.selectedMonth;
  const y = parseInt(document.getElementById('cpay-select-year')?.value) || state.selectedYear;
  cpayState.custId = cid;
  cpayState.month = m;
  cpayState.year = y;
  renderCustomerPayPortal();
}

function renderCustomerPayPortal() {
  const cust = state.customers.find(c => c.id === cpayState.custId) || state.customers[0];
  if (!cust) return;

  const y = cpayState.year;
  const m = cpayState.month;
  const periodStr = `${MONTH_NAMES[m - 1]} ${y}`;

  let bill = state.bills.find(b => b.customerId === cust.id && b.year === y && b.month === m);
  if (!bill) {
    bill = {
      id: `bill-${cust.id}-${y}-${m}`,
      customerId: cust.id,
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

  const tpls = getWaTemplates();
  const baseRemaining = bill.status === 'SEBAGIAN'
    ? Math.max(0, (Number(bill.tariff) || cust.price) - (Number(bill.amountPaid) || 0))
    : (Number(bill.tariff) || cust.price);

  const uniqueAdd = (tpls.useUniqueCode && bill.status !== 'LUNAS') ? getCustomerUniqueCode(cust.id) : 0;
  cpayState.computedAmount = baseRemaining + uniqueAdd;

  // Populate Header Info
  document.getElementById('cpay-cust-name').textContent = cust.name;
  document.getElementById('cpay-cust-meta').textContent = `Paket ${cust.speed} • Jalur PON ${cust.pon} • Periode ${periodStr}`;
  document.getElementById('cpay-total-amount').textContent = formatRupiah(bill.status === 'LUNAS' ? (bill.amountPaid || bill.tariff) : cpayState.computedAmount);

  const hintEl = document.getElementById('cpay-unique-code-hint');
  if (hintEl) {
    hintEl.textContent = uniqueAdd > 0
      ? `Termasuk kode unik pelanggan (+Rp ${uniqueAdd}) agar verifikasi otomatis`
      : `Tagihan resmi internet Wi-Fi HM NET periode ${periodStr}`;
  }

  const statusBadge = document.getElementById('cpay-status-badge');
  const unpaidSec = document.getElementById('cpay-unpaid-section');
  const paidSec = document.getElementById('cpay-paid-section');

  if (bill.status === 'LUNAS') {
    if (statusBadge) {
      statusBadge.textContent = 'SUDAH LUNAS ✅';
      statusBadge.className = 'px-3 py-1 rounded-xl text-xs font-black uppercase bg-white text-emerald-800 shadow-sm';
    }
    unpaidSec?.classList.add('hidden');
    paidSec?.classList.remove('hidden');

    document.getElementById('cpay-receipt-name').textContent = `${cust.name} (PON ${cust.pon})`;
    document.getElementById('cpay-receipt-period').textContent = `${periodStr} (${cust.speed})`;
    document.getElementById('cpay-receipt-amount').textContent = formatRupiah(bill.amountPaid || bill.tariff);
    document.getElementById('cpay-receipt-method').textContent = bill.paymentMethod || 'Transfer / Online';
    document.getElementById('cpay-receipt-date').textContent = bill.paymentDate || new Date().toISOString().split('T')[0];
  } else {
    if (statusBadge) {
      statusBadge.textContent = bill.status === 'SEBAGIAN' ? 'BAYAR SEBAGIAN' : 'BELUM LUNAS';
      statusBadge.className = 'px-3 py-1 rounded-xl text-xs font-black uppercase bg-rose-500 text-white shadow-sm';
    }
    unpaidSec?.classList.remove('hidden');
    paidSec?.classList.add('hidden');
    selectCustomerPayMethod(cpayState.selectedMethod || 'QRIS');
  }

  if (window.lucide) lucide.createIcons();
}

function selectCustomerPayMethod(method) {
  cpayState.selectedMethod = method;

  const mapBtn = {
    'QRIS': 'btn-cpay-method-qris',
    'Transfer Mandiri': 'btn-cpay-method-bca',
    'Transfer BRI': 'btn-cpay-method-bri',
    'DANA / LinkAja': 'btn-cpay-method-ewallet',
    'Cash / Tunai': 'btn-cpay-method-cash'
  };

  Object.entries(mapBtn).forEach(([mKey, btnId]) => {
    const el = document.getElementById(btnId);
    if (!el) return;
    const isCash = mKey === 'Cash / Tunai';
    const colSpanClass = isCash ? ' col-span-2 sm:col-span-2' : '';
    if (mKey === method) {
      el.className = `p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs${colSpanClass}`;
    } else {
      el.className = `p-3 rounded-2xl border text-left transition flex flex-col justify-between bg-white border-slate-200 hover:bg-slate-50 text-slate-800${colSpanClass}`;
    }
  });

  const box = document.getElementById('cpay-method-instruction-box');
  if (!box) return;

  const tpls = getWaTemplates();
  const mandiriStr = tpls.bankBca || DEFAULT_WA_TEMPLATES.bankBca;
  const briStr = tpls.bankBri || DEFAULT_WA_TEMPLATES.bankBri;
  const ewalletStr = tpls.ewalletInfo || DEFAULT_WA_TEMPLATES.ewalletInfo;
  const amountFormatted = formatRupiah(cpayState.computedAmount);

  if (method === 'QRIS') {
    const qrImgHtml = tpls.qrisImageDataUrl
      ? `<img src="${tpls.qrisImageDataUrl}" alt="QRIS HM NET" class="w-48 h-48 object-contain mx-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xs">`
      : `<div class="w-48 h-48 mx-auto rounded-2xl border-2 border-slate-800 bg-white p-3 flex flex-col items-center justify-between shadow-xs">
           <div class="w-full flex items-center justify-between border-b border-slate-200 pb-1">
             <span class="text-[10px] font-black tracking-tighter text-slate-900">QRIS</span>
             <span class="text-[9px] font-bold text-emerald-700">HM NET OFFICIAL</span>
           </div>
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`HMNET-PAY-${cpayState.custId}-${cpayState.computedAmount}`)}" alt="QRIS Code" class="w-28 h-28 object-contain">
           <div class="text-[9px] font-bold text-slate-500">NMID: ID2026HMNET001</div>
         </div>`;

    box.innerHTML = `
      <div class="text-center space-y-2">
        <div class="text-xs font-black text-slate-900">Scan Barcode QRIS Resmi HM NET</div>
        ${qrImgHtml}
        <div class="text-[11px] text-slate-600">
          Buka aplikasi <strong>Livin' Mandiri, BRImo, DANA, LinkAja, BCA Mobile, GoPay, atau OVO</strong> lalu scan QRIS di atas sebesar <strong class="text-emerald-700">${amountFormatted}</strong>.
        </div>
        <div class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-lg inline-block border border-emerald-200">
          Uang langsung masuk ke rekening resmi HM NET
        </div>
      </div>
    `;
  } else if (method === 'Transfer Mandiri' || method === 'Transfer BCA') {
    const accDigits = mandiriStr.replace(/[^0-9]/g, '') || '1840005969488';
    box.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-bold uppercase text-slate-500">Rekening Tujuan Transfer Bank Mandiri:</div>
          <div class="text-sm font-black text-slate-900 font-mono mt-0.5">${mandiriStr}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Transfer tepat sebesar <strong class="text-emerald-700">${amountFormatted}</strong></div>
        </div>
        <button type="button" onclick="copyTextToClipboard('${accDigits}', 'Nomor Rekening Mandiri (${accDigits}) disalin!')" class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shrink-0">
          📋 Salin No. Rek Mandiri
        </button>
      </div>
    `;
  } else if (method === 'Transfer BRI') {
    const accDigits = briStr.replace(/[^0-9]/g, '') || '592801012731509';
    box.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-bold uppercase text-slate-500">Rekening Tujuan Transfer Bank BRI:</div>
          <div class="text-sm font-black text-slate-900 font-mono mt-0.5">${briStr}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Transfer tepat sebesar <strong class="text-emerald-700">${amountFormatted}</strong></div>
        </div>
        <button type="button" onclick="copyTextToClipboard('${accDigits}', 'Nomor Rekening BRI (${accDigits}) disalin!')" class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shrink-0">
          📋 Salin No. Rek BRI
        </button>
      </div>
    `;
  } else if (method === 'DANA / LinkAja' || method === 'DANA / GoPay / OVO') {
    const matchPhone = ewalletStr.match(/08[0-9]{8,12}/);
    const accDigits = matchPhone ? matchPhone[0] : '085691693286';
    box.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="text-[10px] font-bold uppercase text-slate-500">Nomor E-Wallet Resmi HM NET (DANA & LinkAja):</div>
          <div class="text-sm font-black text-slate-900 font-mono mt-0.5">${ewalletStr}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">Kirim saldo DANA / LinkAja sebesar <strong class="text-emerald-700">${amountFormatted}</strong></div>
        </div>
        <button type="button" onclick="copyTextToClipboard('${accDigits}', 'Nomor DANA / LinkAja (${accDigits}) disalin!')" class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shrink-0">
          📋 Salin No. DANA / LinkAja
        </button>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="space-y-1 text-xs text-slate-700">
        <div class="font-black text-slate-900">💵 Pembayaran Manual / Tunai (Cash)</div>
        <p class="text-[11px] text-slate-600 leading-relaxed">
          Anda dapat membayar tunai sebesar <strong>${amountFormatted}</strong> langsung ke kantor layanan <strong>HM NET</strong> atau menitipkan kepada petugas teknisi/kolektor kami saat kunjungan lapangan (WA Admin: <strong>085691693286</strong>). Jika sudah menyerahkan uang tunai, silakan klik tombol konfirmasi di bawah agar tercatat otomatis di sistem.
        </p>
      </div>
    `;
  }
}

function copyCustomerPayAmount() {
  copyTextToClipboard(String(cpayState.computedAmount || 0), `Nominal ${formatRupiah(cpayState.computedAmount)} berhasil disalin!`);
}

function copyTextToClipboard(text, toastMessage) {
  navigator.clipboard.writeText(String(text)).then(() => {
    showToast(toastMessage || 'Berhasil disalin!');
  }).catch(() => {
    showToast(toastMessage || 'Berhasil disalin!');
  });
}

function submitCustomerPortalPayment() {
  const cust = state.customers.find(c => c.id === cpayState.custId);
  if (!cust) return;

  const y = cpayState.year;
  const m = cpayState.month;
  const method = cpayState.selectedMethod || 'QRIS';
  const senderNote = (document.getElementById('cpay-sender-note')?.value || '').trim();
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  let billIdx = state.bills.findIndex(b => b.customerId === cust.id && b.year === y && b.month === m);
  const paidAmount = cpayState.computedAmount || cust.price;
  const autoNote = senderNote
    ? `${senderNote} (Tercatat Otomatis ${timeStr})`
    : `Bayar via Link Online (${method} - ${timeStr})`;

  if (billIdx !== -1) {
    state.bills[billIdx] = {
      ...state.bills[billIdx],
      status: 'LUNAS',
      amountPaid: paidAmount,
      paymentDate: todayStr,
      paymentMethod: method,
      notes: autoNote
    };
  } else {
    state.bills.push({
      id: `bill-${cust.id}-${y}-${m}`,
      customerId: cust.id,
      year: y,
      month: m,
      tariff: cust.price,
      amountPaid: paidAmount,
      status: 'LUNAS',
      paymentDate: todayStr,
      paymentMethod: method,
      notes: autoNote
    });
  }

  saveBills();

  // Broadcast real-time event across browser tabs so Admin Dashboard updates immediately
  try {
    localStorage.setItem('hmnet_last_auto_payment', JSON.stringify({
      custId: cust.id,
      custName: cust.name,
      amount: paidAmount,
      method,
      year: y,
      month: m,
      timestamp: Date.now()
    }));
  } catch (e) {}

  renderCustomerPayPortal();
  showToast(`Pembayaran ${cust.name} (${formatRupiah(paidAmount)}) otomatis tercatat LUNAS di sistem! 🎉`);
}

function sendCustomerPaidNoticeToAdminWa() {
  const cust = state.customers.find(c => c.id === cpayState.custId);
  if (!cust) return;

  const y = cpayState.year;
  const m = cpayState.month;
  const bill = state.bills.find(b => b.customerId === cust.id && b.year === y && b.month === m);
  const tpls = getWaTemplates();
  const cleanAdminWa = formatCleanWaPhone(tpls.adminWa || DEFAULT_WA_TEMPLATES.adminWa);

  const baseUrl = window.location.origin + window.location.pathname;
  const autoSyncLink = `${baseUrl}?autoconfirm=1&cid=${encodeURIComponent(cust.id)}&y=${y}&m=${m}&amt=${bill?.amountPaid || cust.price}&method=${encodeURIComponent(bill?.paymentMethod || 'QRIS')}`;

  const text =
`*KONFIRMASI PEMBAYARAN OTOMATIS - HM NET*
=================================
Halo Admin HM NET, saya sudah melakukan pembayaran tagihan Wi-Fi melalui Link Pembayaran:
• Nama Pelanggan: *${cust.name}* (PON ${cust.pon})
• Periode: *${MONTH_NAMES[m - 1]} ${y}*
• Nominal Dibayar: *${formatRupiah(bill?.amountPaid || cust.price)}*
• Metode Pembayaran: *${bill?.paymentMethod || cpayState.selectedMethod}*
• Status: *LUNAS*

🔗 *Klik Link Sinkronisasi Otomatis Admin:*
${autoSyncLink}`;

  const waUrl = cleanAdminWa
    ? `https://wa.me/${cleanAdminWa}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

function handleUrlPaymentRouting() {
  // If opened via localtest.me or nip.io on the local computer, redirect to localhost so it shares the same localStorage
  if (window.location.hostname === 'localtest.me' || window.location.hostname === '127.0.0.1.nip.io') {
    const portPart = window.location.port ? `:${window.location.port}` : '';
    window.location.replace(`${window.location.protocol}//localhost${portPart}${window.location.pathname}${window.location.search}`);
    return true;
  }

  const params = new URLSearchParams(window.location.search);

  // 1) Auto-Confirm Link clicked by Admin from WA (?autoconfirm=1&cid=...)
  if (params.get('autoconfirm') === '1' && params.get('cid')) {
    loadData();
    const cid = params.get('cid');
    const y = parseInt(params.get('y')) || state.selectedYear;
    const m = parseInt(params.get('m')) || state.selectedMonth;
    const amt = parseInt(params.get('amt')) || 0;
    const method = params.get('method') || 'Transfer / Link Online';
    const cust = state.customers.find(c => c.id === cid);

    if (cust) {
      const todayStr = new Date().toISOString().split('T')[0];
      const idx = state.bills.findIndex(b => b.customerId === cid && b.year === y && b.month === m);
      if (idx !== -1) {
        state.bills[idx].status = 'LUNAS';
        state.bills[idx].amountPaid = amt || state.bills[idx].tariff || cust.price;
        state.bills[idx].paymentDate = todayStr;
        state.bills[idx].paymentMethod = method;
        state.bills[idx].notes = `Tercatat Otomatis via Link Bayar (${method})`;
      } else {
        state.bills.push({
          id: `bill-${cid}-${y}-${m}`,
          customerId: cid,
          year: y,
          month: m,
          tariff: cust.price,
          amountPaid: amt || cust.price,
          status: 'LUNAS',
          paymentDate: todayStr,
          paymentMethod: method,
          notes: `Tercatat Otomatis via Link Bayar (${method})`
        });
      }
      saveBills();
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        showToast(`✅ Pembayaran otomatis dari ${cust.name} (${formatRupiah(amt || cust.price)}) berhasil dicatat LUNAS!`);
      }, 400);
    }
    return false;
  }

  // 2) Direct Customer Payment Link (?pay=c-1&y=2026&m=11&name=...)
  if (params.get('pay')) {
    loadData();
    const cid = params.get('pay');
    const y = parseInt(params.get('y')) || state.selectedYear;
    const m = parseInt(params.get('m')) || state.selectedMonth;
    const urlName = params.get('name');
    const urlAmt = parseInt(params.get('amt')) || 0;
    const urlPkg = params.get('pkg') || '10 Mbps';
    const urlPon = params.get('pon') || '1';

    let existingCust = state.customers.find(c => c.id === cid);
    if (!existingCust && urlName) {
      existingCust = {
        id: cid,
        name: urlName,
        phone: '',
        address: '-',
        modemType: 'ONU',
        sn: '-',
        ontStatus: 'Up',
        pon: urlPon,
        redaman: -20,
        speed: urlPkg,
        price: urlAmt || 150000,
        status: 'AKTIF',
        installedDate: new Date().toISOString().split('T')[0]
      };
      state.customers.push(existingCust);
    }

    if (urlAmt > 0) {
      const existingBill = state.bills.find(b => b.customerId === cid && b.year === y && b.month === m);
      if (!existingBill) {
        state.bills.push({
          id: `bill-${cid}-${y}-${m}`,
          customerId: cid,
          year: y,
          month: m,
          tariff: urlAmt,
          amountPaid: 0,
          status: 'BELUM',
          paymentDate: '',
          paymentMethod: '',
          notes: ''
        });
      }
    }

    openCustomerPayPortal(cid, y, m);
    return true;
  }

  return false;
}

// Listen for real-time automatic payments across tabs
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.BILLS || e.key === 'hmnet_last_auto_payment') {
    loadData();
    renderDashboard();
    renderGridTagihan();
    renderExpenses();
    if (state.currentTab === 'broadcast') {
      renderBroadcastUnpaidTable();
    }
    if (e.key === 'hmnet_last_auto_payment' && e.newValue) {
      try {
        const info = JSON.parse(e.newValue);
        showToast(`💰 Pembayaran Masuk Otomatis: ${info.custName} (${formatRupiah(info.amount)}) via ${info.method} — LUNAS!`);
      } catch (err) {}
    }
  }
});

// =========================================================
// SMART BROADCAST QUEUE RUNNER MODAL (ANTI POP-UP BLOCKER)
// =========================================================
function formatCleanWaPhone(phoneRaw) {
  let clean = String(phoneRaw || '').replace(/[^0-9]/g, '');
  if (!clean || clean.length < 8) return '';
  if (clean.startsWith('0')) clean = '62' + clean.substring(1);
  return clean;
}

function openModalBroadcastQueue(queueItems, title, subtitle, themeColor = 'emerald') {
  stopBroadcastAutoSend();
  state.broadcastQueue = queueItems;

  const modal = document.getElementById('modal-broadcast-queue');
  const header = document.getElementById('bcast-queue-header');
  const titleEl = document.getElementById('bcast-queue-title');
  const subEl = document.getElementById('bcast-queue-subtitle');
  const apiBtn = document.getElementById('btn-bcast-api-all');

  if (header) {
    header.className = themeColor === 'rose'
      ? 'px-6 py-4 bg-rose-700 text-white flex items-center justify-between shrink-0'
      : 'px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0';
  }
  if (titleEl) titleEl.textContent = title || 'Pengiriman Pesan WhatsApp Serentak';
  if (subEl) subEl.textContent = subtitle || '';

  const tpls = getWaTemplates();
  if (apiBtn) {
    if (tpls.fonnteToken && tpls.fonnteToken.length > 5) {
      apiBtn.classList.remove('hidden');
    } else {
      apiBtn.classList.add('hidden');
    }
  }

  renderBroadcastQueueModal();
  if (modal) modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeModalBroadcastQueue() {
  stopBroadcastAutoSend();
  document.getElementById('modal-broadcast-queue')?.classList.add('hidden');
}

function renderBroadcastQueueModal() {
  const queue = state.broadcastQueue || [];
  const total = queue.length;
  const sentCount = queue.filter(q => q.status === 'SENT').length;
  const pct = total > 0 ? Math.round((sentCount / total) * 100) : 0;

  const progText = document.getElementById('bcast-queue-progress-text');
  const progBar = document.getElementById('bcast-queue-progress-bar');
  if (progText) progText.textContent = `${sentCount} / ${total} Terkirim (${pct}%)`;
  if (progBar) progBar.style.width = `${pct}%`;

  const nextIdx = queue.findIndex(q => q.status === 'PENDING');
  const nextLabel = document.getElementById('bcast-next-customer-label');
  const nextSub = document.getElementById('bcast-next-customer-sub');
  const nextBtn = document.getElementById('btn-bcast-send-next');
  const nextBtnLabel = document.getElementById('btn-bcast-send-next-label');

  if (nextIdx !== -1) {
    const nextItem = queue[nextIdx];
    if (nextLabel) nextLabel.textContent = `${nextIdx + 1}. ${nextItem.name} (+${nextItem.cleanPhone}) — ${nextItem.badgeText}`;
    if (nextSub) nextSub.textContent = 'Klik tombol hijau di samping untuk membuka WA pelanggan ini & lanjut otomatis ke antrean berikutnya.';
    if (nextBtn) nextBtn.disabled = false;
    if (nextBtnLabel) nextBtnLabel.textContent = `Kirim ke ${nextItem.name} (${nextIdx + 1}/${total})`;
  } else {
    if (nextLabel) nextLabel.textContent = '🎉 Seluruh Antrean Pesan Serentak Selesai Dikirim!';
    if (nextSub) nextSub.textContent = `Semua ${total} pelanggan terpilih telah berhasil diproses.`;
    if (nextBtn) nextBtn.disabled = true;
    if (nextBtnLabel) nextBtnLabel.textContent = 'Selesai Terkirim Semua ✅';
    stopBroadcastAutoSend();
  }

  const listEl = document.getElementById('bcast-queue-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  queue.forEach((item, idx) => {
    const isSent = item.status === 'SENT';
    const isNext = idx === nextIdx;

    const row = document.createElement('div');
    row.className = `p-3 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
      isSent
        ? 'bg-emerald-50/60 border-emerald-200 text-slate-600'
        : isNext
          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
          : 'bg-white border-slate-200'
    }`;

    row.innerHTML = `
      <div class="flex items-start space-x-2.5">
        <div class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 ${
          isSent ? 'bg-emerald-600 text-white' : isNext ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
        }">
          ${isSent ? '✓' : idx + 1}
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="font-bold text-slate-900">${item.name}</span>
            <span class="font-mono text-[11px] text-slate-500">+${item.cleanPhone}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">${item.badgeText}</span>
          </div>
          <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-mono">${item.message.replace(/\n/g, ' ')}</div>
        </div>
      </div>
      <div class="flex items-center space-x-2 shrink-0 self-end sm:self-center">
        ${
          isSent
            ? `<span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">Terkirim ✅</span>
               <button type="button" onclick="sendBroadcastQueueItem(${idx})" class="px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline">Kirim Ulang</button>`
            : `<button type="button" onclick="sendBroadcastQueueItem(${idx})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition flex items-center space-x-1">
                 <i data-lucide="send" class="w-3 h-3"></i>
                 <span>Kirim WA</span>
               </button>`
        }
      </div>
    `;
    listEl.appendChild(row);
  });

  if (window.lucide) lucide.createIcons();
}

function sendBroadcastQueueItem(index) {
  const item = state.broadcastQueue[index];
  if (!item) return;

  const waUrl = `https://wa.me/${item.cleanPhone}?text=${encodeURIComponent(item.message)}`;
  window.open(waUrl, '_blank');

  item.status = 'SENT';
  renderBroadcastQueueModal();
}

function sendNextInBroadcastQueue() {
  const nextIdx = (state.broadcastQueue || []).findIndex(q => q.status === 'PENDING');
  if (nextIdx === -1) {
    showToast('Semua antrean pelanggan sudah terkirim!');
    stopBroadcastAutoSend();
    return;
  }
  sendBroadcastQueueItem(nextIdx);
}

function toggleBroadcastAutoSend() {
  if (state.broadcastAutoTimer) {
    stopBroadcastAutoSend();
    showToast('Pengiriman otomatis beruntun dijeda.');
    return;
  }

  const nextIdx = (state.broadcastQueue || []).findIndex(q => q.status === 'PENDING');
  if (nextIdx === -1) {
    showToast('Semua pelanggan dalam antrean sudah terkirim!');
    return;
  }

  const btnLabel = document.getElementById('btn-bcast-auto-label');
  if (btnLabel) btnLabel.textContent = 'Jeda Otomatis (Aktif...)';

  // Immediately send the first pending one
  sendNextInBroadcastQueue();

  state.broadcastAutoTimer = setInterval(() => {
    const pendingIdx = (state.broadcastQueue || []).findIndex(q => q.status === 'PENDING');
    if (pendingIdx === -1) {
      stopBroadcastAutoSend();
      showToast('Seluruh pesan serentak selesai dikirim! 🎉');
      return;
    }
    sendBroadcastQueueItem(pendingIdx);
  }, 2800);
}

function stopBroadcastAutoSend() {
  if (state.broadcastAutoTimer) {
    clearInterval(state.broadcastAutoTimer);
    state.broadcastAutoTimer = null;
  }
  const btnLabel = document.getElementById('btn-bcast-auto-label');
  if (btnLabel) btnLabel.textContent = 'Kirim Otomatis Beruntun';
}

async function sendBroadcastViaFonnteApi() {
  const tpls = getWaTemplates();
  const token = (tpls.fonnteToken || '').trim();
  if (!token) {
    alert('Token API Fonnte belum diisi! Silakan isi di menu Ubah Template Pesan atau gunakan tombol Kirim Berikutnya (WA Web).');
    return;
  }

  const pendingItems = (state.broadcastQueue || []).filter(q => q.status === 'PENDING');
  if (pendingItems.length === 0) {
    showToast('Semua antrean sudah terkirim!');
    return;
  }

  if (!confirm(`Kirim pesan langsung di background ke ${pendingItems.length} pelanggan menggunakan API Fonnte?`)) {
    return;
  }

  for (let i = 0; i < state.broadcastQueue.length; i++) {
    const item = state.broadcastQueue[i];
    if (item.status === 'SENT') continue;
    try {
      const formData = new FormData();
      formData.append('target', item.cleanPhone);
      formData.append('message', item.message);
      const res = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: token },
        body: formData
      });
      if (res.ok) {
        item.status = 'SENT';
        renderBroadcastQueueModal();
      }
    } catch (err) {
      console.error('Fonnte send error:', err);
    }
  }

  showToast('Pengiriman serentak via API Fonnte selesai!');
}

// ==========================================
// APPLICATION ENTRY POINT
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  // Check if customer opened direct payment link (?pay=...)
  if (handleUrlPaymentRouting()) {
    return;
  }

  // Tangani jika pengguna membuka Link Sinkronisasi Akun (?akun=...) di HP / browser lain
  handleUrlAccountSync();

  // Check auth first: if logged in, load app; if not, show login view
  const isAuthenticated = checkAuthSession();
  if (isAuthenticated) {
    initApp();
  }

  // Sinkronisasi otomatis daftar Akun Induk & Akun Anak dengan Cloud (dua arah berbasis timestamp terbaru)
  pullCloudSync().then((updated) => {
    if (updated && state.currentUser) {
      renderDashboard();
      renderTablePelanggan();
      renderGridTagihan();
      if (state.currentUser?.permissions?.manage_users) {
        renderTableUsers();
      }
    }
  });
});
