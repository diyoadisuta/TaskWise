import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 p-6">
      <div className="max-w-xl w-full bg-white/90 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-blue-100">
        <Image
          src="/icons/logo.png"
          alt="Taskwise Logo"
          width={96}
          height={96}
          className="mb-2"
        />
        <h1 className="text-4xl font-extrabold text-blue-700 text-center mb-2 tracking-tight">
          Selamat Datang di Taskwise
        </h1>
        <p className="text-lg text-gray-700 text-center mb-4">
          Kelola tugas harian Anda dengan mudah, cepat, dan terorganisir. Tambah,
          edit, filter, dan dapatkan notifikasi tugas penting langsung di perangkat
          Anda!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/register"
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg shadow text-center transition"
          >
            Daftar Akun
          </Link>
          <Link
            href="/login"
            className="flex-1 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold py-3 rounded-lg shadow text-center transition"
          >
            Login
          </Link>
        </div>
        <div className="mt-6 text-sm text-gray-500 text-center">
          <span>
            Taskwise adalah aplikasi manajemen tugas modern berbasis web, mendukung
            PWA &amp; notifikasi push.
          </span>
        </div>
      </div>
    </div>
  );
}
