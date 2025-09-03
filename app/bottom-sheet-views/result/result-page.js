import { fromObject, Observable, ObservableArray } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/google-mobile-ads";

import { decodeHtml, KBBIDaring, showToast } from "~/global-helper";
import { SQL__select } from "~/sqlite-helper";

export function onLoaded(args) {
  const page = args.object;

  page.on("shownInBottomSheet", (args) => {
    setupContext(args.context);

    page.bindingContext = bindingContext;
  });
}

let bindingContext;
function setupContext(openContext) {
  bindingContext = fromObject({
    ...openContext,
    onTapBookmark() {
      console.log("tapped bookmark");
    },
    switchChecked: false,
    switchChanges(args) {
      // console.log("switch changes");
      // console.log("switch changes >> ", args.object.checked);
      // console.log("switch changes value >> ", args.value);
      bindingContext.set("switchChecked", args.value);
    },
    switchToggle(args) {
      // console.log("checked >> ", args.object.checked);
      bindingContext.set("switchChecked", args.object.checked);
    },
    showListKBBIDaring:
      openContext.dataDaring && openContext.dataDaring.length > 0
        ? true
        : false,
    loadingRequestKBBIDaring: false,
    failRequestKBBIDARING: false,
    async requestKBBIDaring(args) {
      const page = args.object.page;
      const daringList = page.getViewById("daring-list");
      this.set("loadingRequestKBBIDaring", true);

      await KBBIDaring(bindingContext.keyword);

      // After KBBIDaring is complete, proceed with the database query
      const resWords = await SQL__select(
        "dictionary",
        "TRIM(word) as word, lema, arti, tesaurusLink, isServer",
        "WHERE LOWER(TRIM(word))='" +
          bindingContext.keyword +
          "' AND isServer=1",
      );

      if (resWords && resWords.length) {
        this.set("failRequestKBBIDARING", false);
        this.set("showListKBBIDaring", true);

        const formattedResults = resWords.map((wordObj, index) => ({
          ...wordObj,
          index: index,
          arti: decodeHtml(wordObj.arti),
        }));

        this.set("dataDaring", formattedResults);
        this.set("loadingRequestKBBIDaring", false);
        daringList.refresh();
        showToast("Berhasil mendapatkan hasil dari KBBI Daring.");
      } else {
        this.set("failRequestKBBIDARING", true);
        this.set("showListKBBIDaring", false);
        this.set("loadingRequestKBBIDaring", false);
      }
    },
    bannerAdLoaded(args) {
      const banner = args.object;
      if (!banner.size) {
        // Hanya atur ukuran jika belum diatur
        const adSize = new BannerAdSize(350, 70);
        banner.size = adSize;
      }
      banner.load();
    },
    close(args) {
      const button = args.object;
      button.closeBottomSheet({ action: "close" });
    },
    // other properties and method
  });
}
