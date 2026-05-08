# Event Manager App

Egyszerű eseménykezelő webalkalmazás, amelyben a felhasználók eseményeket böngészhetnek, jelentkezhetnek rájuk, illetve saját eseményt is létrehozhatnak.

## Funkciók

### Kötelező
- Események böngészése
- Esemény részleteinek megtekintése
- Jelentkezés eseményre

### Opcionális
- Saját esemény létrehozása és szerkesztése
- Jelentkezések kezelése szervezőként
- Admin felület események jóváhagyására és törlésére

### Választott kiegészítő funkciók
- **JWT autentikáció** – bejelentkezés és védett API végpontok
- **Docker kontenérizáció** – teljes stack docker-compose-szal

## Technológiák

| Réteg | Technológia |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Adatbázis | MySQL 8.0 |
| Autentikáció | JWT (jsonwebtoken, bcryptjs) |
| Kontenérizáció | Docker, Docker Compose |
| Webszerver | nginx |
| Tesztelés | Jest, Supertest |

## Mappastruktúra

```
event-manager-app/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app belépési pont
│   │   ├── db.js             # MySQL kapcsolat pool
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT middleware
│   │   └── routes/
│   │       ├── auth.js        # /api/auth
│   │       ├── events.js      # /api/events
│   │       ├── registrations.js # /api/registrations
│   │       └── admin.js       # /api/admin
│   ├── tests/
│   │   └── app.test.js       # Integrációs tesztek
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── css/
│   │   └── style.css         # Reszponzív stílusok
│   ├── js/
│   │   ├── api.js            # API hívások
│   │   ├── auth.js           # Autentikációs segédfv.
│   │   ├── main.js           # Főoldal
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── event-detail.js
│   │   ├── create-event.js
│   │   ├── my-events.js
│   │   └── admin.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── event-detail.html
│   ├── create-event.html
│   ├── my-events.html
│   └── admin.html
├── database/
│   └── schema.sql            # Adatbázis séma + seed adatok
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Telepítés és futtatás

### Docker Compose (ajánlott)

```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend API: [http://localhost:3000](http://localhost:3000)

Az adatbázis automatikusan inicializálódik a `database/schema.sql` alapján.

### Lokális fejlesztés (Docker nélkül)

```bash
# 1. MySQL adatbázis létrehozása
mysql -u root -p < database/schema.sql

# 2. Backend indítása
cd backend
npm install
cp .env.example .env
# Szerkeszd a .env fájlt az adatbázis adatokkal
npm run dev

# 3. Frontend megnyitása
# Nyisd meg a frontend/index.html fájlt böngészőben, vagy indíts egy HTTP szervert:
npx serve frontend
```

### Környezeti változók

Hozz létre `backend/.env` fájlt a `.env.example` alapján:

| Változó | Leírás | Alapértelmék |
|---|---|---|
| `PORT` | Backend port | `3000` |
| `DB_HOST` | MySQL host | `db` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL felhasználó | `eventuser` |
| `DB_PASSWORD` | MySQL jelszó | `eventpassword` |
| `DB_NAME` | Adatbázis neve | `event_manager` |
| `JWT_SECRET` | JWT titkoskód | — |

## API végpontok

### Hitelesítés

| Módszer | Végpont | Leírás | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Regisztráció | Nem |
| POST | `/api/auth/login` | Bejelentkezés | Nem |

**Regisztráció kérés:**
```json
{ "username": "pelda", "email": "pelda@email.hu", "password": "Titok123" }
```
**Válasz:**
```json
{ "token": "<JWT>", "user": { "id": 1, "username": "pelda", "role": "user" } }
```

### Események

| Módszer | Végpont | Leírás | Auth |
|---|---|---|---|
| GET | `/api/events` | Jóváhagyott események listája | Nem |
| GET | `/api/events/:id` | Esemény részletei | Nem |
| POST | `/api/events` | Új esemény létrehozása | Igen |
| PUT | `/api/events/:id` | Esemény szerkesztése | Igen |
| GET | `/api/events/my/events` | Saját események | Igen |

### Jelentkezések

| Módszer | Végpont | Leírás | Auth |
|---|---|---|---|
| POST | `/api/registrations` | Eseményre való jelentkezés | Igen |
| DELETE | `/api/registrations/:id` | Jelentkezés lemondsa | Igen |
| GET | `/api/registrations/my` | Saját jelentkezések | Igen |
| GET | `/api/registrations/event/:eventId` | Esemény jelentkezői | Igen |

### Admin

| Módszer | Végpont | Leírás | Szerep |
|---|---|---|---|
| GET | `/api/admin/events` | Összes esemény | admin |
| PATCH | `/api/admin/events/:id/status` | Jóváhagyás / elutasítás | admin |
| DELETE | `/api/admin/events/:id` | Esemény törlése | admin |
| GET | `/api/admin/users` | Felhasználók listája | admin |

## Jogosultságok

| Szerep | Események böngészése | Jelentkezés | Esemény létrehozása | Admin |
|---|---|---|---|---|
| Vendég | Igen | Nem | Nem | Nem |
| Felhasználó | Igen | Igen | Igen | Nem |
| Admin | Igen | Igen | Igen | Igen |

## Demo felhasználók

Az adatbázis seed-elés után (és csak abban a környezetben):

| Email | Jelszó | Szerep |
|---|---|---|
| admin@eventmanager.local | Admin1234! | admin |
| organizer@eventmanager.local | Demo1234! | organizer |

## Tesztek futtatása

```bash
cd backend
npm install
npm test
```

6 integrációs teszt fut:
- Health endpoint ellenőrzése
- Hiányzó mezők kezelése regisztrációnál
- Hiányzó mezők kezelése bejelentkezésnél
- Adatbázis hiba kezlése
- Hitelesítés nélküli hozzáférés tesztelése (jelentkezés)
- Hitelesítés nélküli hozzáférés tesztelése (admin)

## Adatbázis séma

Harom tábla:
- **users** – felhasználók (id, username, email, password_hash, role)
- **events** – események (id, title, description, event_date, location, max_participants, organizer_id, status)
- **registrations** – jelentkezések (id, user_id, event_id, registered_at)
