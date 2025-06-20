"use client";
import { Dialog } from '@headlessui/react';
import { FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Head from 'next/head';

const PRIORITIES = [
  { value: 'RENDAH', label: 'Rendah' },
  { value: 'SEDANG', label: 'Sedang' },
  { value: 'TINGGI', label: 'Tinggi' },
];
const STATUSES = [
  { value: 'BELUM_SELESAI', label: 'Belum Selesai' },
  { value: 'SELESAI', label: 'Selesai' },
];

type Task = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'RENDAH' | 'SEDANG' | 'TINGGI';
  status: 'BELUM_SELESAI' | 'SELESAI';
};

function CustomAlert({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white font-semibold transition-all animate-fade-in ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">×</button>
    </div>
  );
}

// View Transition API helper
function startViewTransition(callback: () => void) {
  // @ts-ignore
  if (typeof document !== 'undefined' && document.startViewTransition) {
    // @ts-ignore
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', due_date: '', priority: 'SEDANG' });
  const [editing, setEditing] = useState<Task | null>(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });
  const [alert, setAlert] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const router = useRouter();

  async function fetchTasks() {
    setLoading(true);
    let url = `/api/tasks?sort=${sort.field}&order=${sort.order}`;
    if (filter.status) url += `&status=${filter.status}`;
    if (filter.priority) url += `&priority=${filter.priority}`;
    const res = await fetch(url);
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  useEffect(() => { fetchTasks(); }, [filter, sort]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/tasks/${editing.id}` : '/api/tasks';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: '', description: '', due_date: '', priority: 'SEDANG' });
      setEditing(null);
      startViewTransition(() => fetchTasks());
      setAlert({ message: editing ? 'Tugas berhasil diupdate!' : 'Tugas berhasil ditambahkan!', type: 'success' });
    } else {
      const data = await res.json();
      setError(data.error || 'Gagal menyimpan tugas');
      setAlert({ message: data.error || 'Gagal menyimpan tugas', type: 'error' });
    }
  }

  function handleEdit(task: Task) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
      priority: task.priority,
    });
  }

  function openDeleteModal(task: Task) {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  }
  function closeDeleteModal() {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  }
  async function confirmDelete() {
    if (taskToDelete) {
      await handleDelete(taskToDelete.id);
      closeDeleteModal();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus tugas ini?')) return;
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    startViewTransition(() => fetchTasks());
    if (res.ok) {
      setAlert({ message: 'Tugas berhasil dihapus!', type: 'success' });
    } else {
      setAlert({ message: 'Gagal menghapus tugas', type: 'error' });
    }
  }

  async function handleStatusToggle(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: task.status === 'SELESAI' ? 'BELUM_SELESAI' : 'SELESAI' }),
    });
    startViewTransition(() => fetchTasks());
    if (res.ok) {
      setAlert({ message: 'Status tugas diperbarui!', type: 'success' });
    } else {
      setAlert({ message: 'Gagal memperbarui status tugas', type: 'error' });
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  // Push Notification Subscribe
  async function subscribePush() {
    if (!('serviceWorker' in navigator)) {
      setAlert({ message: 'Service Worker tidak didukung di browser ini.', type: 'error' });
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setAlert({ message: 'Izin notifikasi ditolak.', type: 'error' });
      return;
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    console.log('VAPID KEY:', vapidKey);
    if (!vapidKey) {
      setAlert({ message: 'VAPID public key tidak ditemukan di environment.', type: 'error' });
      return;
    }
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      setAlert({ message: 'Berhasil subscribe notifikasi!', type: 'success' });
    } catch (err) {
      setAlert({ message: 'Gagal subscribe push: ' + ((err instanceof Error ? err.message : String(err))), type: 'error' });
      console.error('Push subscribe error:', err);
    }
  }
  // Helper untuk VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/vercel.svg" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-8 px-2 flex flex-col items-center">
        {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        <Dialog open={showDeleteModal} onClose={closeDeleteModal} className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white rounded-xl shadow-xl p-8 max-w-sm mx-auto flex flex-col items-center">
            <FiTrash2 className="text-red-500 text-4xl mb-2" />
            <Dialog.Title className="text-lg font-bold mb-2">Konfirmasi Hapus</Dialog.Title>
            <Dialog.Description className="mb-4 text-gray-600 text-center">Yakin ingin menghapus tugas <span className="font-semibold">{taskToDelete?.title}</span>?</Dialog.Description>
            <div className="flex gap-2 w-full">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold">Hapus</button>
              <button onClick={closeDeleteModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold">Batal</button>
            </div>
          </Dialog.Panel>
        </Dialog>
        <div className="w-full max-w-2xl p-6 md:p-10 bg-white/90 rounded-2xl shadow-xl border border-blue-100">
          <div className="flex justify-between items-center mb-8 gap-2 flex-wrap">
            <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Taskwise</h1>
            <div className="flex gap-2">
              <button
                onClick={subscribePush}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Subscribe Notifikasi
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-5 py-2 rounded-lg shadow transition font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input
                  type="text"
                  placeholder="Judul"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition"
                >
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo</label>
                <DatePicker
                  selected={form.due_date ? new Date(form.due_date) : null}
                  onChange={date => setForm(f => ({ ...f, due_date: date ? date.toISOString().slice(0, 10) : '' }))}
                  dateFormat="yyyy-MM-dd"
                  className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition"
                  placeholderText="Pilih tanggal"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  placeholder="Deskripsi (opsional)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition min-h-[40px]"
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg shadow transition">
                {editing ? 'Update' : 'Tambah'} Tugas
              </button>
              {editing && (
                <button type="button" className="flex-1 bg-gray-400 text-white py-2 rounded-lg shadow transition" onClick={() => { setEditing(null); setForm({ title: '', description: '', due_date: '', priority: 'SEDANG' }); }}>
                  Batal Edit
                </button>
              )}
            </div>
          </form>
          <div className="flex flex-wrap gap-2 mb-6">
            <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-1 rounded-lg outline-none transition">
              <option value="">Semua Status</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={filter.priority} onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))} className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-1 rounded-lg outline-none transition">
              <option value="">Semua Prioritas</option>
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <select value={sort.field} onChange={e => setSort(s => ({ ...s, field: e.target.value }))} className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-1 rounded-lg outline-none transition">
              <option value="created_at">Terbaru</option>
              <option value="due_date">Jatuh Tempo</option>
            </select>
            <select value={sort.order} onChange={e => setSort(s => ({ ...s, order: e.target.value }))} className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-3 py-1 rounded-lg outline-none transition">
              <option value="desc">↓</option>
              <option value="asc">↑</option>
            </select>
          </div>
          {loading ? <div className="text-center text-blue-600 font-semibold">Memuat...</div> : (
            <ul className="space-y-4">
              {tasks.length === 0 && <li className="text-center text-gray-500">Belum ada tugas.</li>}
              {tasks.map(task => (
                <li key={task.id} className={`border-2 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm transition bg-gradient-to-r ${task.status === 'SELESAI' ? 'from-green-100 to-green-50 border-green-300' : 'from-yellow-50 to-white border-yellow-200'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${task.priority === 'TINGGI' ? 'bg-red-500' : task.priority === 'SEDANG' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                      <span className={`font-bold text-lg ${task.status === 'SELESAI' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{task.description}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 rounded flex items-center gap-1"><FiCheckCircle className="inline text-blue-400" />Prioritas: {PRIORITIES.find(p => p.value === task.priority)?.label}</span>
                      <span className="px-2 py-1 bg-indigo-100 rounded flex items-center gap-1"><FiCheckCircle className="inline text-indigo-400" />Status: {STATUSES.find(s => s.value === task.status)?.label}</span>
                      {task.due_date && <span className="px-2 py-1 bg-pink-100 rounded">Jatuh tempo: {task.due_date.slice(0,10)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button onClick={() => handleStatusToggle(task)} className={`px-3 py-1 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1 ${task.status === 'SELESAI' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'}`}>{task.status === 'SELESAI' ? <FiCheckCircle className="inline" /> : <FiCheckCircle className="inline rotate-180" />} {task.status === 'SELESAI' ? 'Tandai Belum' : 'Tandai Selesai'}</button>
                    <button onClick={() => handleEdit(task)} className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow transition flex items-center gap-1"><FiEdit />Edit</button>
                    <button onClick={() => openDeleteModal(task)} className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow transition flex items-center gap-1"><FiTrash2 />Hapus</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
