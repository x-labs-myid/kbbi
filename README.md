<img src="https://raw.githubusercontent.com/x-labs-86/hosting-assets/refs/heads/main/kbbi/icon.png" width="150" />

# MyKBBI: Kamus Bahasa Indonesia

Kamus Besar Bahasa Indonesia (KBBI) lengkap dalam genggaman Anda. Kamus luring kami berisi sekitar 100.000 data, baik kata maupun peribahasa.

MyKBBI adalah aplikasi Kamus Besar Bahasa Indonesia yang mudah diakses secara daring ataupun luring, memberikan kemudahan bagi Anda untuk mencari arti kata di mana saja dan kapan saja.

Aplikasi ini menyediakan ribuan kata beserta definisinya dalam genggaman Anda. Aplikasi ini dapat digunakan secara luring, memungkinkan Anda mengakses kamus kapan saja tanpa koneksi internet.

Fungsi utama aplikasi ini sangat relevan untuk keperluan pendidikan, baik bagi siswa maupun mahasiswa. MyKBBI dapat membantu proses belajar Bahasa Indonesia, memperkaya kosakata, serta menjadi alat bantu yang penting dalam menyelesaikan tugas atau penelitian.

Fitur yang akan datang termasuk integrasi daring untuk memperbarui data kamus secara real-time dari server, memberikan Anda akses ke kata-kata dan definisi terbaru.

Perlu diketahui bahwa MyKBBI adalah aplikasi pihak ketiga, namun sumber data yang digunakan tetap berasal dari situs resmi Kamus Besar Bahasa Indonesia, yaitu https://kbbi.kemdikbud.go.id untuk data daring, dan https://github.com/bachors/KBBI.sql untuk data luring.

Dengan antarmuka yang mudah digunakan, MyKBBI menjadi solusi sempurna bagi siapa saja yang membutuhkan akses cepat dan akurat ke arti kata dalam Bahasa Indonesia, baik untuk keperluan sehari-hari, pendidikan, maupun profesional.

```sql
-- ==================================================
-- init table (dictionary, history, bookmark)
-- ==================================================

CREATE TABLE "dictionary" (
  "_id"	INTEGER,
  "word"	TEXT NOT NULL,
  "lema"	TEXT DEFAULT NULL,
  "arti"	TEXT NOT NULL,
  "tesaurusLink"	TEXT DEFAULT NULL,
  "type"	INTEGER NOT NULL,
  "isServer"	INTEGER DEFAULT 0,
  PRIMARY KEY("_id" AUTOINCREMENT)
);

CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word);
CREATE INDEX IF NOT EXISTS idx_dictionary_arti ON dictionary(arti);


CREATE TABLE "history" (
  "id"	INTEGER NOT NULL UNIQUE,
  "word"	TEXT NOT NULL,
  "created_at"	TEXT NOT NULL,
  "updated_at"	TEXT NOT NULL,
  PRIMARY KEY("id" AUTOINCREMENT)
);


CREATE TABLE "bookmark" (
  "id"	INTEGER NOT NULL UNIQUE,
  "dictionary_id"	INTEGER NOT NULL,
  "created_at"	TEXT NOT NULL,
  "updated_at"	TEXT NOT NULL,
  PRIMARY KEY("id" AUTOINCREMENT)
);
```
