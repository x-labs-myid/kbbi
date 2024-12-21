import {
  Application,
  Frame,
  Observable,
  ApplicationSettings,
} from "@nativescript/core";
import { Http } from "@klippa/nativescript-http";
import { BannerAdSize } from "@nativescript/firebase-admob";
import { loadInterstisialAd } from "~/admob";

import { executeSearchFromExternal } from "~/search/search-page";
import {
  internet,
  showToast,
  __createDirectories,
  decodeHtml,
} from "~/global-helper";
import { SQL__selectRaw, SQL__select } from "~/sqlite-helper";

const context = new Observable();
let page;

export function onNavigatingTo(args) {
  page = args.object;

  __createDirectories();
  _loadDataApps();
  _loadDailyProverb();
  _loadDailyWords();
  _loadWeeklyWords();
  context.set("isWatchInterstitialAd", false);

  page.bindingContext = context;
}

export function searchTap() {
  Frame.topmost().navigate({
    moduleName: "search/search-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}
export function historyTap() {
  Frame.topmost().navigate({
    moduleName: "history/history-page",
    animated: true,
    transition: {
      name: "fade", // Tipe transisi (bisa juga pakai 'fade', 'flip', dll.)
      duration: 100, // Durasi transisi dalam milidetik
      curve: "easeIn", // Kurva animasi
    },
  });
}

export function bookmarkTap(args) {
  const mainView = args.object;

  const query =
    "SELECT d.word FROM bookmark b LEFT JOIN dictionary d ON b.dictionary_id = d.guid GROUP BY d.word ORDER BY b.id DESC LIMIT 100";
  SQL__selectRaw(query).then((res) => {
    const bsContext = {
      listViewItems: res,
    };
    const fullscreen = true;

    mainView.showBottomSheet({
      view: "~/bottom-sheet-views/bookmark/bookmark-page",
      context: bsContext,
      dismissOnBackButton: true,
      dismissOnBackgroundTap: false,
      dismissOnDraggingDownSheet: false,
      closeCallback: () => {},
      fullscreen,
    });
  });
}

export function aboutTap(args) {
  const mainView = args.object;

  const bsContext = {
    listViewHeight: context.get("listViewHeight"),
    listViewItems: context.get("listViewItems"),
  };
  const fullscreen = true;

  mainView.showBottomSheet({
    view: "~/bottom-sheet-views/about/about-page",
    context: bsContext,
    dismissOnBackButton: true,
    closeCallback: () => {},
    fullscreen,
  });
}

export function watchInterstitialAd() {
  if (internet().connected) {
    context.set("isWatchInterstitialAd", true);
    const randomNumber = Math.floor(Math.random() * 2);
    loadInterstisialAd();
    setTimeout(() => {
      context.set("isWatchInterstitialAd", false);
    }, 5000);
  } else {
    showToast("Tidak ada koneksi internet");
  }
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  // const adSize = new BannerAdSize(350, 70);
  // banner.size = adSize;
  if (!banner.size) {
    // Hanya atur ukuran jika belum diatur
    const adSize = new BannerAdSize(350, 70);
    banner.size = adSize;
  }
  banner.load();
}

export function onTapDailyProverb(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

export function onTapDailyWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

export function onTapWeeklyWord(args) {
  let itemIndex = args.index;
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;

  executeSearchFromExternal(itemTapData.word, page);
}

// async function findWord(word) {
//   const resWords = await SQL__select(
//     "dictionary",
//     "TRIM(word) as word, lema, arti, tesaurusLink, isServer",
//     "WHERE LOWER(TRIM(word))='" + word + "'"
//   );

//   if (resWords && resWords.length) {
//     // Process the results
//     const formattedWords = resWords.map((wordObj) => decodeHtml(wordObj.arti));
//     // console.log("formattedWords >> ", formattedWords);
//     return formattedWords[0];
//   }

//   return null;
// }

function _loadDataApps() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString("lastFetchDate", "");
  const cachedData = ApplicationSettings.getString("cachedData", "");

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("listViewHeight", (data.length + 1) * 80);
    context.set("listViewItems", data);
  } else {
    Http.request({
      url: "https://x-labs.my.id/api/apps",
      method: "GET",
    }).then(
      (response) => {
        // console.log(response);
        const res = response.content.toJSON();
        context.set("listViewHeight", (res.data.length + 1) * 80);
        context.set("listViewItems", res.data);
        ApplicationSettings.setString("lastFetchDate", today);
        ApplicationSettings.setString("cachedData", JSON.stringify(res.data));
      },
      (e) => {}
    );
  }
}

function _loadDailyProverb() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString(
    "lastFetchDateDailyProverb",
    ""
  );
  const cachedData = ApplicationSettings.getString(
    "cachedDataDailyProverb",
    ""
  );

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("dailyProverbItems", data);
  } else {
    SQL__select(
      "dictionary",
      "*",
      "WHERE LOWER(arti) LIKE 'peribahasa%' ORDER BY abs(random() + strftime('%j', 'now')) LIMIT 1"
    ).then((res) => {
      const dataX = res.map((entry, idx) => {
        return {
          id: idx + 1,
          word: entry.word,
          arti: decodeHtml(entry.arti),
        };
      });

      context.set("dailyProverbItems", dataX);
      ApplicationSettings.setString("lastFetchDateDailyProverb", today);
      ApplicationSettings.setString(
        "cachedDataDailyProverb",
        JSON.stringify(dataX)
      );
    });
  }
}

function _loadDailyWords() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString(
    "lastFetchDateDailyWord",
    ""
  );
  const cachedData = ApplicationSettings.getString("cachedDataDailyWord", "");

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("dailyWordItems", data);
  } else {
    Http.request({
      url: "https://x-labs.my.id/api/kbbi/top-entries/daily/all/5",
      method: "GET",
    }).then(
      (response) => {
        const res = response.content.toJSON();
        if (res.data.length === 0) {
          context.set("dailyWordItems", []);
          return;
        }

        const dataX = res.data.map((entry, idx) => {
          let arti = "";

          if (entry.arti) {
            // Parse JSON
            const parsedArti = JSON.parse(entry.arti);
            let currentArti = parsedArti
              .slice(0, 2)
              .map((item) => item.deskripsi)
              .join("; "); // Awalnya ambil 2 item

            // Tambah elemen jika panjang kurang dari 230 karakter
            let i = 2;
            while (currentArti.length < 200 && i < parsedArti.length) {
              currentArti = parsedArti
                .slice(0, i + 1) // Ambil hingga elemen ke-(i+1)
                .map((item) => item.deskripsi)
                .join("; ");
              i++;
            }

            arti = currentArti; // Set hasil akhir
          }

          return {
            ...entry,
            id: idx + 1,
            artiFontSize: entry.arti.length > 100 ? 11 : 16,
            arti,
          };
        });

        context.set("dailyWordItems", dataX);
        ApplicationSettings.setString("lastFetchDateDailyWord", today);
        ApplicationSettings.setString(
          "cachedDataDailyWord",
          JSON.stringify(dataX)
        );
      },
      (e) => {}
    );
  }
}

function _loadWeeklyWords() {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const lastFetchDate = ApplicationSettings.getString(
    "lastFetchDateWeeklyWord",
    ""
  );
  const cachedData = ApplicationSettings.getString("cachedDataWeeklyWord", "");

  if (lastFetchDate === today && cachedData) {
    const data = JSON.parse(cachedData);
    context.set("weeklyWordItems", data);
  } else {
    Http.request({
      url: "https://x-labs.my.id/api/kbbi/top-entries/weekly/all/10",
      method: "GET",
    }).then(
      (response) => {
        const res = response.content.toJSON();
        if (res.data.length === 0) {
          context.set("weeklyWordItems", []);
          return;
        }

        const dataX = res.data.map((entry, idx) => ({
          ...entry,
          id: idx + 1,
        }));
        context.set("weeklyWordItems", dataX);
        ApplicationSettings.setString("lastFetchDateWeeklyWord", today);
        ApplicationSettings.setString(
          "cachedDataWeeklyWord",
          JSON.stringify(dataX)
        );
      },
      (e) => {}
    );
  }
}
