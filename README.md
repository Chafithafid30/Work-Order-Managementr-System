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
