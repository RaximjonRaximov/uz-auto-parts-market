# UZ Auto Parts Marketplace

3D, zamonaviy va AI ishlatilmagan O‘zbekiston avto ehtiyot qismlari marketplace loyihasi.

## Texnologiyalar

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **3D vizualizatsiya:** `react-globe.gl` + Three.js
- **Xarita:** Leaflet + React-Leaflet
- **Grafiklar:** CSS5 bar chart

## Funksiyalar

- Avto zapchastlarini qidirish va filtrlash
- Brend, model, kategoriya, holat, yil, narx va hudud bo‘yicha filtrlar
- 3D globusda shaharlar va e'lonlar soni
- Interaktiv xarita
- Narx taqsimoti va kategoriyalar bo‘yicha statistika
- 200+ demo e'lon bilan darhol ishga tushadi
- Sotuvchilar oson e'lon qo‘sha oladigan API

## Boshlash

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend `http://localhost:8000` da ishlaydi.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` da ishga tushadi.

### Build

```bash
cd frontend
npm run build
```

Build `app/static` ichiga yoziladi va FastAPI orqali xizmat qiladi.

## Monetizatsiya g‘oyalari

- Sotuvchilar uchun premium e'lonlar
- Do‘kon va ustaxonalar uchun obuna
- Top filtrlar va reklama joylashuvi
- Sotuvchilar va xaridorlar uchun API obunasi

## Litsenziya

MIT
