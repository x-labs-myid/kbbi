import _ from "lodash";
import { decodeHtml } from "~/global-helper";
import { data } from "~/dictionary-json";

export function _dictionary__findStartWith(keyword, enableUniq = true) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = _.map(data, (item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Normalize 'word'
    };
  });

  // Jika enableUniq aktif, lakukan uniqBy untuk menghilangkan duplikasi berdasarkan 'word'
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Filter berdasarkan keyword
  const filteredData = _.filter(words, (item) =>
    item.word.startsWith(lowerKeyword)
  );

  // Pisahkan kata menjadi 'searchWord' dan 'otherWord' untuk hasil filter
  const result = _.map(filteredData, (item) => {
    const searchWord = keyword;
    const otherWord = item.word.slice(lowerKeyword.length);

    return {
      ...item,
      searchWord,
      otherWord,
    };
  });

  // Urutkan hasil berdasarkan 'word'
  return _.sortBy(result, "word");
}

export function _dictionary__find(keyword, enableUniq = true) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = _.map(data, (item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Normalize 'word'
    };
  });

  // Jika enableUniq aktif, lakukan uniqBy untuk menghilangkan duplikasi berdasarkan 'word'
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Filter berdasarkan keyword
  const filteredData = _.filter(words, (item) => item.word === lowerKeyword);

  // Pisahkan kata menjadi 'searchWord' dan 'otherWord' untuk hasil filter
  const result = _.map(filteredData, (item) => {
    const searchWord = keyword;
    const otherWord = item.word.slice(keyword.length);

    return {
      ...item,
      searchWord,
      otherWord,
    };
  });

  // Urutkan hasil berdasarkan 'word'
  return _.sortBy(result, "word");
}

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
export function dictionary__findStartWith(keyword, enableUniq = true) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja
  const uniqueWordsMap = new Map();

  // Jika enableUniq aktif, simpan kata unik ke dalam Map
  if (enableUniq) {
    for (const item of data) {
      const word = item.word.toLowerCase().trim(); // Pastikan word konsisten dalam case dan spasi

      // Hanya tambahkan jika kata belum ada di map
      if (!uniqueWordsMap.has(word)) {
        uniqueWordsMap.set(word, { ...item, word }); // Simpan item ke Map
      }
    }
  } else {
    // Jika tidak menghapus duplikat, langsung proses seluruh data
    for (const item of data) {
      const word = item.word.toLowerCase().trim(); // Normalize word
      const arti = decodeHtml(item.arti); // Normalize word
      uniqueWordsMap.set(word + uniqueWordsMap.size, { ...item, word, arti }); // Gunakan key yang unik
    }
  }

  const filteredData = [];

  // Filter data yang dimulai dengan keyword
  for (const item of uniqueWordsMap.values()) {
    if (item.word.startsWith(lowerKeyword)) {
      const searchWord = keyword;
      const otherWord = item.word.slice(lowerKeyword.length);

      // Tambahkan ke hasil filter
      filteredData.push({
        ...item,
        searchWord,
        otherWord,
      });
    }
  }

  // Urutkan hasil berdasarkan 'word' dari A sampai Z
  filteredData.sort((a, b) => a.word.localeCompare(b.word));

  return filteredData;
}
/* export function dictionary__findStartWith(keyword) {
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
} */

/**
 * Mencari kata yang dimulai dengan keyword
 * @param {string} keyword
 * @returns {Array} Array of object
 */
export function dictionary__find(keyword, enableUniq = true) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Konversi keyword sekali saja
  const uniqueWordsMap = new Map();

  // Jika enableUniq aktif, simpan kata unik ke dalam Map
  if (enableUniq) {
    for (const item of data) {
      const word = item.word.toLowerCase().trim(); // Normalize word

      // Hanya tambahkan jika kata belum ada di map
      if (!uniqueWordsMap.has(word)) {
        uniqueWordsMap.set(word, { ...item, word });
      }
    }
  } else {
    // Jika tidak menghapus duplikat, langsung proses seluruh data
    for (const item of data) {
      const word = item.word.toLowerCase().trim(); // Normalize word
      const arti = decodeHtml(item.arti); // Normalize word
      uniqueWordsMap.set(word + uniqueWordsMap.size, { ...item, word, arti }); // Gunakan key unik untuk memastikan semua data disimpan
    }
  }

  const filteredData = [];

  // Filter data yang cocok dengan keyword
  for (const item of uniqueWordsMap.values()) {
    if (item.word === lowerKeyword) {
      const searchWord = keyword;
      const otherWord = item.word.slice(keyword.length);

      filteredData.push({
        ...item,
        searchWord,
        otherWord,
      });
    }
  }

  // Urutkan hasil berdasarkan 'word' dari A sampai Z
  filteredData.sort((a, b) => a.word.localeCompare(b.word));

  return filteredData;
}
/* export function dictionary__find(keyword) {
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
    .filter((item) => item.word === keyword.toLowerCase().trim()) // Sesuaikan keyword dengan case dan spasi
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
} */
