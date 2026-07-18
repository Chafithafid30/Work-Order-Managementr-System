# Work-Order-Management-System

# Cara Menjalankan Project Work Order Management System

 ## 1. Clone repository
git clone git@github.com:Chafithafid30/Work-Order-Managementr-System.git

 ## 2. Menyiapkan environment
 ubah penamaan file .env.example menjadi .env

 ## 3. Menghubungkan dengan DBeaver

1. Buka DBeaver.
2. Pilih **Database → New Database Connection**.
3. Pilih **PostgreSQL**.
4. Isi Host `localhost`.
5. Isi Port `5432`, atau port yang diubah di `.env`.
6. Isi Database `work_order_db`.
7. Isi Username `work_order_user`.
8. Isi Password `work_order_password`.
9. Klik **Test Connection**.
10. Klik **Finish**.
11. Buka `Schemas → public → Tables`. 
 
## 4. Menjalankan seluruh aplikasi
docker compose up --build

## 5. Memeriksa status container
docker compose ps

## 6. Kemudian buka link dibawah ini
- Aplikasi: (http://localhost:5173)
- Swagger API: (http://localhost:3000/api/docs)
- Health check: (http://localhost:3000/api/health)

# Tech stack yang digunakan
- Frontend: React.js and Typescript
- Backend: Nest.js, Typescript, and REST API
- Database: PostgreSQL
- API Documentation: Swagger
- Container: Docker, Docker Compose
- Database Management System: DBeaver

# Asumsi yang Digunakan
- PostgreSQL menjadi satu-satunya sumber data utama. Perubahan struktur database dikelola melalui migration, sedangkan DBeaver hanya digunakan untuk pemeriksaan data dan bukan untuk pemeliharaan struktur database secara manual.
- Sistem digunakan untuk satu organisasi dengan tiga peran operasional tetap, yaitu ADMIN, SPV, dan MECHANIC.
- Autentikasi menggunakan token akses JWT yang berlaku selama satu jam. Fitur refresh token, pengaturan ulang kata sandi, verifikasi email, dan penguncian akun berada di luar cakupan minimum tes teknis.
- Hanya Admin yang dapat membuat, mengajukan, menilai, dan menyelesaikan work order. SPV bertugas menugaskan mekanik dan menyetujui permintaan suku cadang, sedangkan mekanik yang ditugaskan bertugas memulai pekerjaan.
- Satu work order hanya dapat ditugaskan kepada maksimal satu mekanik dan hanya dapat memiliki satu permintaan suku cadang berstatus menunggu dalam satu waktu. Permintaan yang telah disetujui tetap disimpan sebagai riwayat.
- Server mencatat start_date untuk mencegah manipulasi waktu dari sisi klien. Admin mengisi end_date, yang tidak boleh lebih awal daripada waktu mulai.
- Endpoint yang mengubah data menerima Idempotency-Key secara opsional. Frontend selalu mengirimkan nilai tersebut. Klien yang tidak mengirimkannya tetap mendapatkan keamanan transaksi ACID, tetapi tidak memperoleh deduplikasi otomatis ketika melakukan percobaan ulang.
- Data pada tes teknis diperkirakan berjumlah kecil. Oleh karena itu, fitur pagination, pembatalan, penolakan, penghapusan, lampiran berkas, dan notifikasi tidak disertakan (karena disesuaikan dengan brief information yang diberikan).
- Kredensial demo dan penyimpanan token menggunakan localStorage hanya digunakan untuk kebutuhan pengujian lokal. Pada lingkungan produksi, kredensial harus dikelola berdasarkan environment serta mempertimbangkan penggunaan cookie HttpOnly dan SameSite yang aman dengan perlindungan CSRF (Cross-Site Request Forgery).

# Penjelasan Singkat Struktur Project
![](https://github.com/Chafithafid30/Work-Order-Managementr-System/blob/master/Folder%20Structure.png)

- Backend memisahkan penanganan permintaan HTTP di dalam controller, pengaturan alur kerja di dalam service, proses penyimpanan data melalui repository interface, serta pengelolaan struktur database melalui migration.

- Frontend memusatkan pengelolaan status sesi JWT dan komunikasi HTTP. Setiap halaman hanya menampilkan tindakan yang diizinkan berdasarkan peran pengguna dan status work order saat ini.

- Docker Compose menghubungkan seluruh service dan hanya menjalankan frontend setelah pemeriksaan kesehatan backend berhasil.
