import { Frame, ObservableArray } from "@nativescript/core";
import { findOfDictionary, findStartWithOfDictionary } from "~/dictionary";
import {
  getCurrentTime,
  initTables,
  generateUUID,
  myHttpClient,
  decodeHtml,
} from "~/global-helper";
import {
  SQL__select,
  SQL__insert,
  SQL__truncate,
  SQL__dropTable,
  SQL__selectRaw,
} from "~/sqlite-helper";

const context = new ObservableArray();

let dictionary = [];
let debounceSearchTimeout;

export function onNavigatingTo(args) {
  const page = args.object;
  context.set("viewMode", "SEARCH");
  context.set("searchText", "");
  context.set("searchTextResult", "");
  context.set("localResultOfSearch", "");

  context.set("recentSearches", []);
  context.set("autoComplete", []);
  context.set("loadingExecute", false);

  // SQL__select("words").then((res) => {
  //   console.log("words data >>> ", res);
  // });

  // SQL__select("history").then((res) => {
  //   console.log("history data >>> ", res);
  // });

  loadRecentSearches();

  page.bindingContext = context;
}

export function goBack() {
  // Frame.topmost().goBack();
  Frame.topmost().navigate({
    moduleName: "home/home-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}

export function onTextChangeSearch(args) {
  // Bersihkan timeout sebelumnya agar tidak terjadi multiple execution
  if (debounceSearchTimeout) {
    clearTimeout(debounceSearchTimeout);
  }

  context.set("loadingExecute", true);

  // Atur debounce dengan timeout 300ms (misal)
  debounceSearchTimeout = setTimeout(() => {
    const searchTerm = args.value;

    // Jalankan pencarian jika ada nilai input
    if (searchTerm) {
      loadAutoComplete(searchTerm);
    } else {
      loadRecentSearches();
    }

    context.set("loadingExecute", false);
  }, 700); // Waktu tunggu setelah pengguna berhenti mengetik
}

export function onSubmitSearch(args) {
  const obj = args.object;
  context.set("searchText", obj.text);
  executeSearch(obj.text);
}

export function onClearSearch() {
  context.set("searchText", "");
  context.set("viewMode", "SEARCH");
  context.set("localResultOfSearch", []);
  // SQL__truncate("words");
  // SQL__truncate("history");
  loadRecentSearches();
}

export function onTapHomeAndStartSearch() {
  if (context.get("viewMode") === "RESULT") {
    context.set("viewMode", "SEARCH");
    // context.set("searchText", context.get("searchTextResult"));
    context.set("searchText", "");
    context.set("searchTextResult", "");
  } else {
    goBack();
  }
}

export function onTapRecentSearches(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  context.set("viewMode", "RESULT");
  context.set("loadingExecute", true);

  context.set("searchTextResult", itemTapData.word);

  const query =
    "SELECT w.word, w.arti FROM history h LEFT JOIN words w ON h.words_guid = w.guid WHERE w.word='" +
    itemTapData.word +
    "'";
  SQL__selectRaw(query).then((res) => {
    context.set("localResultOfSearch", res);
    context.set("loadingExecute", false);
  });

  // executeSearch(itemTapData.word);
}

export function onTapAutoComplete(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  context.set("searchTextResult", itemTapData.word);

  executeSearch(itemTapData.word);
}

function loadRecentSearches() {
  const query =
    "SELECT w.word, w.type FROM history h LEFT JOIN words w ON h.words_guid = w.guid GROUP BY w.word, w.type ORDER BY h.id DESC LIMIT 10";
  SQL__selectRaw(query).then((res) => {
    context.set("viewMode", "SEARCH");
    context.set("recentSearches", res);
    context.set("autoComplete", []);
  });
}

function loadAutoComplete(keyword) {
  dictionary = [];
  if (keyword) {
    const dictionaryFiltered = findStartWithOfDictionary(keyword);
    dictionary.push(...dictionaryFiltered);
  }

  context.set("viewMode", "SEARCH");
  context.set("autoComplete", dictionary);
  context.set("recentSearches", []);
}

function executeSearch(_keyword) {
  if (!_keyword) return;

  const searchCache = new Map(); // Cache untuk hasil pencarian
  context.set("viewMode", "RESULT");
  const keyword = _keyword.toLowerCase();

  context.set("loadingExecute", true);

  SQL__select("words", "*", "WHERE word='" + keyword + "'").then((resWords) => {
    if (resWords && resWords.length) {
      context.set("localResultOfSearch", resWords);
      context.set("loadingExecute", false);
    } else {
      // Cek cache untuk melihat apakah hasil pencarian sudah ada
      if (searchCache.has(keyword)) {
        context.set("localResultOfSearch", searchCache.get(keyword));
        return; // Kembali jika hasil sudah ada di cache
      }

      // Eksekusi pencarian dan simpan hasil ke dalam cache
      const localDictionary = findOfDictionary(keyword, false);

      // Simpan hasil pencarian di cache
      searchCache.set(keyword, localDictionary);

      // Gunakan setTimeout untuk memberikan sedikit waktu sebelum memperbarui hasil
      // setTimeout(() => {
      context.set("localResultOfSearch", localDictionary);
      context.set("loadingExecute", false);

      // Simpan ke database
      saveToDB(localDictionary, "LOCAL");
      // }, 100); // Waktu delay dapat disesuaikan
    }
  });
}

function saveToDB(_data, _type = "SERVER") {
  initTables();

  _data.forEach((item) => {
    SQL__select("words", "word", "WHERE word='" + item.word + "'").then(
      (resWords) => {
        if (resWords && resWords.length) {
          SQL__select(
            "history",
            "words_guid",
            "WHERE words_guid='" + resWords.guid + "'"
          ).then((resHistories) => {
            if (!resHistories || !resHistories.length) {
              SQL__insert("history", [
                { field: "words_guid", value: resHistories[0].guid },
                { field: "created_at", value: getCurrentTime() },
                { field: "updated_at", value: getCurrentTime() },
              ]);
            } else {
              SQL__update(
                "history",
                [{ field: "updated_at", value: getCurrentTime() }],
                null,
                "WHERE id='" + resHistories[0].id + "'"
              );
            }
          });
        } else {
          const guid = generateUUID();

          if (_type == "SERVER") {
            SQL__insert("words", [
              { field: "guid", value: guid },
              { field: "word", value: item.word },
              { field: "lema", value: item.lema },
              { field: "arti", value: JSON.stringify(item.arti) },
              { field: "tesaurusLink", value: item.tesaurusLink },
              { field: "type", value: item.type },
              { field: "created_at", value: getCurrentTime() },
            ]);
          } else {
            SQL__insert("words", [
              { field: "guid", value: guid },
              { field: "word", value: item.word },
              { field: "lema", value: "x00000" },
              { field: "arti", value: decodeHtml(item.arti) },
              { field: "tesaurusLink", value: "x00000" },
              { field: "type", value: "word" },
              { field: "created_at", value: getCurrentTime() },
            ]);
          }
          SQL__insert("history", [
            { field: "words_guid", value: guid },
            { field: "created_at", value: getCurrentTime() },
            { field: "updated_at", value: getCurrentTime() },
          ]);
        }
      }
    );
  });
}
