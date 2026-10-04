# Pokemon Explorer

Aplikacja full-stack - Przeglądarka pokemonów łącząca dane z [PokeAPI](https://pokeapi.co/) z "własnymi" pokemonami z lokalnej bazy (Laravel), z opcją filtrowania i blokowania wybranych obiektów.

Dwa katalogi:

- `backend/` — Laravel (PHP 8.2+), REST API, SQLite (zero konfiguracji bazy), integracja z [PokeAPI](https://pokeapi.co/) napisana ręcznie na HTTP klientu Laravela (celowo bez gotowych wrapperów, zgodnie z wymogiem zadania).
- `frontend/` — React 19 + TypeScript, Vite, Tailwind CSS 4, TanStack Query, Radix UI, React Router.

**Wymagania:** PHP 8.2+ (`pdo_sqlite`, Composer), Node.js 20.19+ (lub 22.12+, z npm). Baza SQLite tworzy się automatycznie.

## Uruchomienie

```bash
git clone <adres-repo> && cd Pokemon-Explorer-Page

# 1. Backend
cd backend
composer install
cp .env.example .env # Windows: copy .env.example .env
php artisan key:generate
php artisan migrate  # Potwierdź (yes) utworzenie pliku SQLite
php artisan serve    # Działa pod: http://127.0.0.1:8000

# 2. Frontend (w nowym terminalu)
cd frontend
npm install
cp .env.example .env.local # Windows: copy .env.example .env.local
npm run dev          # Działa pod: http://localhost:5173
```

Jedyna rzecz do zrobienia ręcznie: w `backend/.env` znajduje się `SUPER_SECRET_KEY` (w `.env.example` jest wartość domyślna `Haslo1!`). To klucz autoryzacji chronionych endpointów — zmień go na swój albo zostaw domyślny na czas developmentu.

Bez uruchomionego backendu aplikacja wstanie, ale lista będzie pusta i pojawi się stan błędu — szczegóły kart biorą się z `POST /api/info`.

## API

**Base URL:** `http://127.0.0.1:8000/api`
**Autoryzacja:** Każdy endpoint **z wyjątkiem** `POST /api/info` wymaga nagłówka `X-SUPER-SECRET-KEY: <wartość z .env>`.
_Błędy:_ `401` (brak/zły klucz), `422` (błąd walidacji w formacie Laravela), `404` (brak zasobu). Weryfikacja nagłówka oparta jest na `hash_equals` w celu ochrony przed timing attackami.

- **`POST /api/info` (Publiczny):** Zwraca szczegóły dla listy nazw (1-50 elementów). Automatycznie odrzuca zakazane obiekty bez zgłaszania ich, a nieistniejące zwraca w tablicy `not_found`. Dane zwracane w `data` zawierają flagę `is_custom` odróżniającą pokemony z bazy od tych z zewnętrznego API. Do PokeAPI odpytuje autorski klient HTTP (bez użycia gotowych wrapperów).
- **Zakazane pokemony (`#auth`):**
  - `GET /api/banned`: Lista zakazanych obiektów.
  - `POST /api/banned`: Dodaje na listę (walidacja: tylko litery, cyfry i myślniki `a-z0-9-`, unikalność; nazwa jest trimowana i zapisywana małymi literami).
  - `DELETE /api/banned/{id}`: Zdejmuje ban.
- **Własne pokemony (`#auth`):**
  - `GET /api/custom` (Lista) / `GET /api/custom/{id}` (Pojedynczy).
  - `POST /api/custom`: Tworzy nowy obiekt. Wymagane: `name` (unikalne lokalnie **oraz** nieistniejące w oficjalnym PokeAPI), `height` (>=0), `weight` (>=0). Opcjonalne: `base_experience` (>=0).
  - `PUT/PATCH /api/custom/{id}`: Częściowa aktualizacja. Weryfikacja kolizji nazwy z PokeAPI uruchamia się tylko, jeśli nazwa została faktycznie zmieniona.
  - `DELETE /api/custom/{id}`: Usuwa własny obiekt z bazy.

## Frontend i Storage

- **UI/UX:** Wyszukiwarka z systemem debounce (500 ms), filtry typu multi-select (pigułki typów z jasną obwódką po zaznaczeniu), paginacja "Load more" oparta na `useInfiniteQuery` (24 pozycje na stronę), okno modalne ze szczegółami (Radix Dialog: galeria sprite'ów, paski statystyk, łańcuch ewolucji i lokacje spotkań z PokeAPI).
- **Wygląd:** Responsywny design, dark mode, semantyczny HTML + ARIA, stany błędów/ładowania/pustej listy, gradientowe tła kart w zależności od typów przypisanych do pokemona (dwie barwy przy dwóch typach), odznaka "Custom" dla własnych pokemonów.
- **Storage:** Ulubione pokemony zapisywane w przeglądarkowym `localStorage` (klucz `pokemon-explorer-favorites`) — zachowują swój stan między odświeżeniami i kartami, z licznikiem w nawigacji i podstroną `/favorites`.

## Zakres zadania (etapy 1-4)

1. **Banned** — CRUD zakazanych pod `/api/banned` (`index`, `store`, `destroy`).
2. **Auth** — middleware `VerifySecretKey` weryfikuje `X-SUPER-SECRET-KEY` (`hash_equals`) z `SUPER_SECRET_KEY` z `.env`. Chroni cały `/banned` i `/custom`.
3. **Info** — `POST /api/info` pobiera dane z PokeAPI własnym klientem HTTP (bez wrapperów), filtruje zakazanych, dołącza własnych z bazy.
4. **Custom** — pełny CRUD własnych pokemonów, zabezpieczony jak etap 2. Unikalność nazwy lokalnie + weryfikacja braku kolizji z PokeAPI. Flaga `is_custom` odróżnia źródła danych w `/api/info`.

## Skrypty i Wdrożenie

- **Backend:** `php artisan test` (testy PHPUnit).
- **Frontend:** `npm run lint`, `npm run build` (produkcyjny build `tsc + vite build` do `dist/`), `npm run preview`.
- **Wdrożenie:** `npm run build` w `frontend/` generuje `dist/` z relatywnymi ścieżkami (vite `base: './'`) i routingiem hash — katalog można wrzucić na dowolny statyczny hosting bez rewrite'ów. Backend też musi być hostowany; wtedy w zmiennych środowiskowych hostingu frontendu do ustawienia są `VITE_API_URL` oraz `VITE_SUPER_SECRET_KEY`.
- _Uwaga architektoniczna:_ Ze względu na bezpośredni wymóg zadania, klucz weryfikacyjny trafia w kodzie frontendu na produkcję (widoczny w bundle'u JS). W środowisku komercyjnym ta autoryzacja odbywałaby się za pomocą ciasteczek sesyjnych lub JWT, a logika walidacji zakazanych odbywałaby się poza wzrokiem użytkownika.
