# Tepih servis Super Clean

Nova aplikacija napravljena od nule za GitHub repozitorij `mirkotrkulja2402-creator/Tepih-servis-Super-Clean`.

## Arhitektura

- `client/` — React + Vite, responzivan telefon/računar
- `server/` — Node + Express, spreman za Railway
- `db/schema.sql` — PostgreSQL centralna baza
- `client/public/assets/logo.png` — ugrađeni Super Clean logo
- `railway.toml` — Railway start + health check

## Lokalni razvoj

```bash
npm install
npm run dev
```

Za produkciju:

```bash
npm run build
npm start
```

## Railway

1. GitHub repo mora sadržati ove fajlove.
2. Railway se povezuje na `Tepih-servis-Super-Clean`.
3. Dodaje se PostgreSQL servis i `DATABASE_URL`.
4. Railway health check je `/api/health`.

## Napomena

Trenutni UI ima lokalni prototip podataka u browseru radi sigurnog početka. PostgreSQL schema i server su pripremljeni za prelazak na centralnu bazu bez miješanja sa starim projektima.
