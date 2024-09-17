import { data } from "~/dictionary-json";

/**
 * Mendapatkan daftar kata
 * @param {number} limit Jumlah kata yang ingin diambil
 * @returns {Array} Array of object
 */
export function dictionary__get(limit = 10) {
  return data.slice(0, limit);
}

/**
 * Mencari kata yang dimulai dengan keyword
 * @param {string} keyword
 * @returns {Array} Array of object
 */
export function dictionary__find(keyword) {
  // Filter data untuk kata yang dimulai dengan keyword
  const filteredData = Array.from(
    data
      // Hapus field 'arti' dan 'type' dari setiap item
      .map((item) => {
        const { type, ...rest } = item; // Hapus 'arti' dan 'type'
        return {
          ...rest,
          word: rest.word.toLowerCase().trim(), // Pastikan 'word' konsisten dalam case dan spasi
        };
      })
      // Grouping data untuk menghapus duplikasi berdasarkan 'word'
      .reduce((map, item) => {
        if (!map.has(item.word)) {
          map.set(item.word, item); // Simpan item ke dalam Map berdasarkan kata
        }
        return map;
      }, new Map())
      .values() // Ambil nilai unik dari Map
  )
    // Filter item yang dimulai dengan 'keyword'
    .filter((item) => item.word.startsWith(keyword.toLowerCase().trim())) // Sesuaikan keyword dengan case dan spasi
    .map((item) => {
      // Pisahkan kata menjadi 'searchWord' dan 'otherWord'
      const searchWord = keyword; // Bagian awal yang cocok dengan keyword
      const otherWord = item.word.slice(keyword.length); // Sisa kata setelah keyword

      // Tambahkan 'searchWord' dan 'otherWord' ke dalam objek hasil
      return {
        ...item,
        searchWord,
        otherWord,
      };
    })
    // Urutkan berdasarkan 'word' dari A sampai Z
    .sort((a, b) => a.word.localeCompare(b.word));

  return filteredData;
}
