# SevenINC Project - Backend & Frontend Setup

Proyek ini adalah sistem CMS dan SPK (Metode SAW) yang dibangun menggunakan Laravel 12 (Backend) dan React (Frontend).

## Panduan Penginstalan Cepat

### Prasyarat
- PHP 8.2+
- Composer
- Node.js & NPM
- MySQL (XAMPP / Laragon)

---

### Langkah 1: Pengaturan Backend
1. Masuk ke folder `backend`:
   ```bash
   cd backend
   ```
2. Instal dependensi:
   ```bash
   composer install
   ```
3. Atur file environment:
   - Salin `.env.example` menjadi `.env`
   - Sesuaikan `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di `.env`
4. Jalankan perintah database:
   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   ```
5. Jalankan server:
   ```bash
   php artisan serve
   ```

---

### Langkah 2: Pengaturan Frontend
1. Masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Atur file environment:
   - Salin `.env.example` ke `.env` (isi `VITE_API_URL=http://127.0.0.1:8000/api`)
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

---

## Catatan Keamanan & Fungsi
- **Autentikasi**: Menggunakan Laravel Sanctum Stateless (Bearer Token).
- **Role**: Admin, Writer, Public.
- **Audit Log**: Seluruh aktivitas CRUD dan Auth dicatat secara otomatis.
- **Portabilitas**: Seluruh konfigurasi API dipusatkan pada file `.env`.
