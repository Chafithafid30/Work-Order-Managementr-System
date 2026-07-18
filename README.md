# Work-Order-Management-System

# Cara Menjalankan Project Mock-Up-Application-Test

 ## 1. Clone repository
git clone git@github.com:Chafithafid30/Mock-Up-Application-Test.git

 ## 2. Menyiapkan environment
 ubah penamaan file .env.example menjadi .env

 ## 3. Menjalankan seluruh aplikasi
 docker compose up --build

## 4. Memeriksa status container
docker compose ps

## 5. Kemudian buka link dibawah ini
- Aplikasi: (http://localhost:5173)
- Swagger API: (http://localhost:3000/api/docs)
- Health check: (http://localhost:3000/api/health)

## 6. Menghubungkan dengan DBeaver

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
