import { Frame, ObservableArray } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

import { getCurrentTime, decodeHtml, KBBIDaring } from "~/global-helper";
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
  // context.set("searchText", obj.text);
  // executeSearch(obj.text);
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

export async function onTapRecentSearches(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  context.set("loadingExecute", true);
  context.set("searchTextResult", itemTapData.word);

  // Wait for KBBIDaring() to complete
  // const isDataAvailable = await KBBIDaring(itemTapData.word);

  // if (isDataAvailable) {
  // Now that KBBIDaring is complete, retrieve the data from the database
  const resWords = await SQL__select(
    "dictionary",
    "TRIM(word) as word, lema, arti, tesaurusLink, isServer",
    "WHERE LOWER(TRIM(word))='" + itemTapData.word + "'"
  );

  // console.log("Data fetched >> ", resWords, " >> ", resWords.length);

  if (resWords && resWords.length) {
    // Process the results
    const formattedWords = resWords.map((wordObj) => ({
      ...wordObj,
      arti: decodeHtml(wordObj.arti),
    }));

    context.set("loadingExecute", false);
    directToResult(itemTapData.word, formattedWords);
  }
  // } else {
  //   console.log("Error: Data could not be retrieved.");
  //   context.set("loadingExecute", false);
  // }
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

export function executeSearchFromExternal(_keyword, _page) {
  executeSearch(_keyword, _page);
}

function loadRecentSearches() {
  const query = `SELECT word FROM history ORDER BY id DESC LIMIT 100`;
  SQL__selectRaw(query).then((res) => {
    context.set("viewMode", "SEARCH");
    context.set("recentSearches", res);
    context.set("autoComplete", []);
  });
}

async function loadAutoComplete(keyword) {
  dictionary = [];
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();

    try {
      const resWords = await SQL__selectRaw(
        `SELECT word FROM dictionary WHERE LOWER(TRIM(word)) LIKE '${lowerKeyword}%' GROUP BY TRIM(word) ORDER BY word ASC`
      );

      // Format results
      const formattedResults = resWords.map((wordObj) => {
        const word = wordObj.word.toLowerCase();
        let _searchWord = "";
        let _otherWord = "";

        // Separate _searchWord and _otherWord
        if (word.startsWith(lowerKeyword)) {
          _searchWord = lowerKeyword; // Ensure search word is lowercased
          _otherWord = word.slice(lowerKeyword.length);
        }

        return {
          ...wordObj,
          searchWord: _searchWord,
          otherWord: _otherWord,
          word: word,
        };
      });

      // Combine formatted results into the dictionary
      dictionary.push(...formattedResults);
      context.set("autoComplete", dictionary);
    } catch (error) {
      console.error("Error loading autocomplete: ", error);
    }
  }

  // Set the context for view mode and recent searches
  context.set("viewMode", "SEARCH");
  context.set("recentSearches", []);
}

async function executeSearch(_keyword, _page = page) {
  if (!_keyword) return;

  context.set("viewMode", "RESULT");
  const keyword = _keyword.toLowerCase().trim();

  context.set("loadingExecute", true);

  // Wait for KBBIDaring to complete
  // await KBBIDaring(_keyword);

  // After KBBIDaring is complete, proceed with the database query
  const resWords = await SQL__select(
    "dictionary",
    "TRIM(word) as word, lema, arti, tesaurusLink, isServer",
    "WHERE LOWER(TRIM(word))='" + keyword + "'"
  );

  if (resWords && resWords.length) {
    // Format the results
    const formattedResults = resWords.map((wordObj) => ({
      ...wordObj,
      arti: decodeHtml(wordObj.arti),
    }));

    // Update context and execute further actions
    context.set("loadingExecute", false);
    directToResult(keyword, formattedResults, _page);
    saveToHistory(formattedResults[0]);
  } else {
    context.set("loadingExecute", false);
    console.log("No results found in the dictionary.");
  }
}

// function executeSearch(_keyword) {
//   if (!_keyword) return;

//   context.set("viewMode", "RESULT");
//   const keyword = _keyword.toLowerCase().trim();

//   context.set("loadingExecute", true);
//   KBBIDaring(_keyword).then(() => {
//     SQL__select(
//       "dictionary",
//       "TRIM(word) as word, lema, arti, tesaurusLink, isServer",
//       "WHERE LOWER(TRIM(word))='" + keyword + "'"
//     ).then((resWords) => {
//       if (resWords && resWords.length) {
//         const formattedResults = resWords.map((wordObj) => {
//           return {
//             ...wordObj,
//             arti: decodeHtml(wordObj.arti),
//           };
//         });
//         // context.set("localResultOfSearch", resWords);
//         context.set("loadingExecute", false);
//         directToResult(keyword, formattedResults);
//         saveToHistory(formattedResults[0]);
//       }
//     });
//   });
// }

function saveToHistory(_data) {
  const _word = _data.word.toLowerCase().trim();
  SQL__select("history", "word", "WHERE word='" + _word + "'").then(
    (resHistories) => {
      if (!resHistories || !resHistories.length) {
        const dataInsert = [
          { field: "word", value: _word },
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

function directToResult(_keyword, _data, _page) {
  const _dataLuring = _data
    .filter((e) => e.isServer === 0)
    .map((item, index) => {
      item.index = index;

      return item;
    });
  const _dataDaring = _data
    .filter((e) => e.isServer === 1)
    .map((item, index) => {
      item.index = index;

      return item;
    });

  const mainView = _page;
  const bsContext = {
    keyword: _keyword,
    data: _dataLuring,
    dataDaring: _dataDaring,
  };

  // console.log("bsContext >> ", bsContext);

  const fullscreen = true;

  mainView.showBottomSheet({
    view: "~/bottom-sheet-views/result/result-page",
    context: bsContext,
    dismissOnBackButton: true,
    dismissOnBackgroundTap: false,
    dismissOnDraggingDownSheet: false,
    closeCallback: (data) => {
      // console.log("closeCallback >>> ", data);
    },
    fullscreen,
  });
}
