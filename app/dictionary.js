import _ from "lodash";
import { decodeHtml } from "~/global-helper";
import { data } from "~/dictionary-json";

export async function _dictionary__findStartWith(
  keyword,
  enableUniq = true,
  limit = 50
) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja
  const batchSize = 5000; // Ukuran batch untuk proses async
  let filteredData = [];
  let currentBatch = 0;

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = data.map((item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Decode arti
    };
  });

  // Jika enableUniq aktif, lakukan uniqBy untuk menghilangkan duplikasi berdasarkan 'word'
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Fungsi untuk memproses setiap batch secara async
  const processBatch = async (batch) => {
    for (const item of batch) {
      if (item.word.startsWith(lowerKeyword)) {
        const searchWord = keyword;
        const otherWord = item.word.slice(lowerKeyword.length);
        filteredData.push({
          ...item,
          searchWord,
          otherWord,
        });

        // Jika hasil sudah mencapai limit, hentikan
        if (filteredData.length >= limit) return;
      }
    }
  };

  // Proses data secara bertahap dalam batch untuk menjaga responsivitas
  while (
    currentBatch * batchSize < words.length &&
    filteredData.length < limit
  ) {
    const batch = words.slice(
      currentBatch * batchSize,
      (currentBatch + 1) * batchSize
    );
    await processBatch(batch);
    currentBatch++;
  }

  // Urutkan hasil berdasarkan 'word'
  return _.sortBy(filteredData, "word");
}

export async function _dictionary__find(
  keyword,
  enableUniq = true,
  limit = 50
) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja
  const batchSize = 5000; // Ukuran batch untuk proses async
  let filteredData = [];
  let currentBatch = 0;

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = data.map((item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Decode arti
    };
  });

  // Jika enableUniq aktif, lakukan uniqBy untuk menghilangkan duplikasi berdasarkan 'word'
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Fungsi untuk memproses setiap batch secara async
  const processBatch = async (batch) => {
    for (const item of batch) {
      if (item.word === lowerKeyword) {
        const searchWord = keyword;
        const otherWord = item.word.slice(keyword.length);

        filteredData.push({
          ...item,
          searchWord,
          otherWord,
        });

        // Jika hasil sudah mencapai limit, hentikan
        if (filteredData.length >= limit) return;
      }
    }
  };

  // Proses data secara bertahap dalam batch untuk menjaga responsivitas
  while (
    currentBatch * batchSize < words.length &&
    filteredData.length < limit
  ) {
    const batch = words.slice(
      currentBatch * batchSize,
      (currentBatch + 1) * batchSize
    );
    await processBatch(batch);
    currentBatch++;
  }

  // Urutkan hasil berdasarkan 'word'
  return _.sortBy(filteredData, "word");
}

/**
 * FIND OF DICTIONARY
 * @param {*} keyword
 * @param {*} enableUniq
 * @param {*} page
 * @param {*} pageSize
 * @returns []
 */

const cacheFind = new Map(); // Cache untuk menyimpan hasil pencarian pada fungsi findOfDictionary

export function findOfDictionary(
  keyword,
  enableUniq = true,
  page = 1,
  pageSize = 10
) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja

  // Cek cache untuk keyword yang sama
  if (cacheFind.has(keyword)) {
    return paginate(cacheFind.get(keyword), page, pageSize); // Ambil dari cache jika sudah ada
  }

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = _.map(data, (item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Decode HTML pada 'arti'
    };
  });

  // Jika enableUniq aktif, gunakan Lodash uniqBy untuk menghilangkan duplikasi
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Filter berdasarkan keyword yang sama persis
  const filteredData = _.filter(words, (item) => item.word === lowerKeyword);

  // Pisahkan kata menjadi 'searchWord' dan 'otherWord'
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
  const sortedResult = _.sortBy(result, "word");

  // Simpan hasil di cache
  cacheFind.set(keyword, sortedResult);

  // Kembalikan hasil dengan paginasi
  return paginate(sortedResult, page, pageSize);
}

/**
 * FINDSTARTWITH OF DICTIONARY
 * @param {*} keyword
 * @param {*} enableUniq
 * @param {*} page
 * @param {*} pageSize
 * @returns []
 */

const cache = new Map(); // Cache untuk menyimpan hasil pencarian

// Fungsi untuk paginasi
function paginate(array, page = 1, pageSize = 10) {
  return _.slice(array, (page - 1) * pageSize, page * pageSize);
}

export function findStartWithOfDictionary(
  keyword,
  enableUniq = true,
  page = 1,
  pageSize = 10
) {
  const lowerKeyword = keyword.toLowerCase().trim(); // Lowercase keyword sekali saja

  // Cek cache untuk keyword yang sama
  if (cache.has(keyword)) {
    return paginate(cache.get(keyword), page, pageSize); // Ambil hasil dari cache dan lakukan paginasi
  }

  // Map data untuk menghapus field 'type' dan menormalkan 'word'
  let words = _.map(data, (item) => {
    const { type, ...rest } = item; // Hapus field 'type'
    return {
      ...rest,
      word: rest.word.toLowerCase().trim(), // Normalize 'word'
      arti: decodeHtml(rest.arti), // Decode HTML pada 'arti'
    };
  });

  // Jika enableUniq aktif, gunakan Lodash uniqBy untuk menghilangkan duplikasi
  if (enableUniq) {
    words = _.uniqBy(words, "word");
  }

  // Filter data berdasarkan keyword
  const filteredData = _.filter(words, (item) =>
    item.word.startsWith(lowerKeyword)
  );

  // Pisahkan kata menjadi 'searchWord' dan 'otherWord'
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
  const sortedResult = _.sortBy(result, "word");

  // Simpan hasil di cache
  cache.set(keyword, sortedResult);

  // Kembalikan hasil dengan paginasi
  return paginate(sortedResult, page, pageSize);
}
