import { Frame, ObservableArray } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

import { getCurrentTime, decodeHtml } from "~/global-helper";
import { SQL__select, SQL__insert, SQL__selectRaw } from "~/sqlite-helper";

const context = new ObservableArray();
let page;

let dictionary = [];
let debounceSearchTimeout;

export function onNavigatingTo(args) {
  page = args.object;

  context.set("viewMode", "SEARCH");
  context.set("searchText", "");
  context.set("searchTextResult", "");
  context.set("localResultOfSearch", "");

  context.set("recentSearches", []);
  context.set("autoComplete", []);
  context.set("loadingExecute", false);

  loadRecentSearches();

  page.bindingContext = context;
}

export function goBack() {
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

  // context.set("viewMode", "RESULT");
  context.set("loadingExecute", true);

  context.set("searchTextResult", itemTapData.word);

  SQL__select("dictionary", "*", "WHERE word='" + itemTapData.word + "'").then(
    (resWords) => {
      if (resWords && resWords.length) {
        const formattedResults = resWords.map((wordObj) => {
          return {
            ...wordObj,
            arti: decodeHtml(wordObj.arti),
          };
        });

        context.set("loadingExecute", false);
        directToResult(itemTapData.word, formattedResults);
      }
    }
  );
}

export function onTapAutoComplete(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  context.set("searchTextResult", itemTapData.word);

  executeSearch(itemTapData.word);
}

export function TextFieldLoaded(args) {
  const textField = args.object;
  textField.focus();
  textField.selectAll();
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}

export function openBottomSheet(args) {
  const mainView = args.object;
  const bsContext = {
    keyword: context.searchText,
    data: context.localResultOfSearch,
  };
  const fullscreen = true;
  mainView.showBottomSheet({
    view: "~/result/result-page",
    bsContext,
    closeCallback: () => {},
    fullscreen,
  });
}

function loadRecentSearches() {
  const query = "SELECT word FROM history ORDER BY created_at DESC LIMIT 15";
  SQL__selectRaw(query).then((res) => {
    context.set("viewMode", "SEARCH");
    context.set("recentSearches", res);
    context.set("autoComplete", []);
  });
}

async function loadAutoComplete(keyword) {
  dictionary = [];
  if (keyword) {
    // Menunggu hasil dari SQL__select
    const resWords = await SQL__select(
      "dictionary",
      "*",
      "WHERE word LIKE '" + keyword + "%'"
    );
    const formattedResults = resWords.map((wordObj) => {
      const word = wordObj.word;
      let _searchWord = "";
      let _otherWord = "";

      // Memisahkan _searchWord dan _otherWord
      if (word.startsWith(keyword)) {
        _searchWord = keyword;
        _otherWord = word.slice(keyword.length);
      }

      return {
        searchWord: _searchWord,
        otherWord: _otherWord,
        word: word,
      };
    });

    // Menggabungkan hasil yang sudah diformat ke dalam array dictionary
    dictionary.push(...formattedResults);
  }

  context.set("viewMode", "SEARCH");
  context.set("autoComplete", dictionary);
  context.set("recentSearches", []);
}

function executeSearch(_keyword) {
  if (!_keyword) return;

  context.set("viewMode", "RESULT");
  const keyword = _keyword.toLowerCase();

  context.set("loadingExecute", true);

  SQL__select("dictionary", "*", "WHERE word='" + keyword + "'").then(
    (resWords) => {
      if (resWords && resWords.length) {
        const formattedResults = resWords.map((wordObj) => {
          return {
            ...wordObj,
            arti: decodeHtml(wordObj.arti),
          };
        });
        // context.set("localResultOfSearch", resWords);
        context.set("loadingExecute", false);
        directToResult(keyword, formattedResults);
        saveToHistory(formattedResults[0]);
      }
    }
  );
}

function saveToHistory(_data) {
  SQL__select("history", "word", "WHERE word='" + _data.word + "'").then(
    (resHistories) => {
      if (!resHistories || !resHistories.length) {
        const dataInsert = [
          { field: "word", value: _data.word },
          { field: "created_at", value: getCurrentTime() },
          { field: "updated_at", value: getCurrentTime() },
        ];
        SQL__insert("history", dataInsert);
      } else {
        SQL__update(
          "history",
          [{ field: "updated_at", value: getCurrentTime() }],
          null,
          "WHERE id='" + resHistories[0].id + "'"
        );
      }
    }
  );
}

function directToResult(_keyword, _data) {
  const dataWithIndex = _data.map((item, index) => {
    item.index = index;

    return item;
  });
  const mainView = page;
  const bsContext = {
    keyword: _keyword,
    data: dataWithIndex,
  };
  const fullscreen = false;

  mainView.showBottomSheet({
    view: "~/bottom-sheet-views/result/result-page",
    context: bsContext,
    dismissOnBackButton: false,
    dismissOnBackgroundTap: false,
    dismissOnDraggingDownSheet: false,
    closeCallback: (data) => {
      // console.log("closeCallback >>> ", data);
    },
    fullscreen,
  });
}
