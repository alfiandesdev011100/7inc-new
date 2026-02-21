# PANDUAN INSTALASI & MENJALANKAN PROJECT TA (PORTABLE)

**PERINGATAN PENTING:**
Sebelum menjalankan project ini di komputer baru, pastikan software berikut SUDAH TERINSTALL:
1.  **XAMPP / Laragon** (Pastikan MySQL Aktif).
2.  **Node.js** (Minimal versi 16+).
3.  **Composer** (Untuk Backend Laravel).
4.  **Terminal/Command Prompt / Git Bash**.

---

## BAGIAN A: SETUP DATABASE (WAJIB PERTAMA!)

1.  **Nyalakan XAMPP/Laragon** (Start Apache & MySQL).
2.  Buka Browser, akses: `http://localhost/phpmyadmin`
3.  Buat **Database Baru** dengan nama: `sevencin_db_ta` (atau nama lain, bebas).
    *   *Catatan: Ingat nama database ini untuk langkah selanjutnya!*

---

## BAGIAN B: SETUP BACKEND (LARAVEL)

1.  Buka Terminal, masuk ke folder `backend`.
    ```bash
    cd backend
    ```
2.  **Duplikasi File Environment:**
    *   Cari file bernama `.env.example`.
    *   Copy & Paste file tersebut, lalu ubah namanya menjadi `.env`.
3.  **Edit File .env:**
    *   Buka file `.env` dengan Notepad/VSCode.
    *   Sesuaikan konfigurasi database:
        ```ini
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=sevencin_db_ta  <-- SESUAIKAN DENGAN NAMA DATABASE DI PHPMYADMIN
        DB_USERNAME=root
        DB_PASSWORD=                 <-- KOSONGKAN JIKA PAKAI XAMPP DEFAULT
        ```
4.  **Install Dependensi & Setup Project:**
    Jalankan perintah berikut DI TERMINAL BACKEND secara berurutan:
    ```bash
    composer install
    php artisan key:generate
    php artisan migrate:fresh --seed
    php artisan storage:link
    # php artisan jwt:secret  <-- (JIKA PAKE JWT, KALAU SANCTUM TIDAK PERLU)
    ```
5.  **Jalankan Server Backend:**
    ```bash
    php artisan serve
    ```
    *   *JANGAN TUTUP TERMINAL INI!* Server backend akan berjalan di `http://127.0.0.1:8000`.

---

## BAGIAN C: SETUP FRONTEND (REACT)

1.  Buka **Terminal BARU**, masuk ke folder `frontend`.
    ```bash
    cd frontend
    ```
2.  **Duplikasi File Environment:**
    *   Cari file `.env.example` (jika ada) atau buat file `.env` baru.
    *   Pastikan isinya:
        ```ini
        VITE_API_BASE_URL=http://127.0.0.1:8000/api
        ```
3.  **Install Dependensi & Jalankan:**
    Jalankan perintah berikut DI TERMINAL FRONTEND secara berurutan:
    ```bash
    npm install
    npm run dev
    ```
    *   *JANGAN TUTUP TERMINAL INI!* Aplikasi frontend akan berjalan di `http://localhost:5173`.

---

## BAGIAN D: CATATAN PENTING (DEBUGGING)

*   **Login Gagal/Eror 401/419:**
    Jika login gagal setelah pindah laptop, coba hapus *History/Cache Browser* atau buka di **Incognito Mode**. Sesi lama mungkin masih nyangkut.
*   **Gambar Tidak Muncul:**
    Pastikan sudah menjalankan `php artisan storage:link` di folder backend.
*   **Database Error:**
    Pastikan nama database di file `.env` Backend SAMA PERSIS dengan yang ada di phpMyAdmin.
*   **Role User Berantakan?**
    Jangan panik. Cek tabel `users` di phpMyAdmin. Pastikan kolom `role` untuk `admin@seveninc.com` adalah `admin`. Jika bukan, ubah manual jadi `admin`.

---

## BAGIAN E: OPSI DARURAT (PRESENTASI MENDADAK / HOSTING GAGAL)

Jika hosting bermasalah atau tidak sempat beli, gunakan **NGROK** untuk membuat laptopmu jadi server online sementara.
1.  **Download Ngrok:** Cari di Google "Download Ngrok", daftar akun gratis, lalu install.
2.  **Jalankan Backend:**
    *   Pastikan `php artisan serve` jalan di terminal (port 8000).
    *   Buka terminal baru, ketik: `ngrok http 8000`
    *   Copy link `Forwarding` (misal: `https://abcd-1234.ngrok-free.app`).
3.  **Update Frontend:**
    *   Buka file `.env` di folder `frontend`.
    *   Ubah `VITE_API_BASE_URL` menjadi link Ngrok tadi + `/api` (contoh: `https://abcd-1234.ngrok-free.app/api`).
    *   Restart terminal frontend (`Ctrl+C`, lalu `npm run dev`).
4.  **Siap Presentasi:**
    *   Dosen bisa buka website Mimin di HP/Laptop mereka via link Frontend (jika frontend juga di-ngrok) atau cukup Backend API-nya saja yang online.
    *   **TIPS:** Paling aman tetap presentasi pakai `localhost` di laptop Mimin sendiri (tanpa Ngrok), tapi colok proyektor. Ngrok cuma buat kalau DOSEN MAKSA BUKA DI HP MEREKA.
