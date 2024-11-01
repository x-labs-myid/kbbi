import { fromObject, Observable } from "@nativescript/core";
import { BannerAdSize } from "@nativescript/firebase-admob";

import { showToast, getCurrentTime } from "~/global-helper";
import { speak, speakWithSSML } from "~/tts-helper";
import { SQL__select, SQL__delete, SQL__insert } from "~/sqlite-helper";

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
      console.log("checked >> ", args.object.checked);
      bindingContext.set("switchChecked", args.object.checked);
    },
    // other properties and method
  });
}

export function close(args) {
  const button = args.object;
  button.closeBottomSheet({ action: "close" });
}

export function saveToBookmark(args) {
  const obj = args.object;
  console.log("bindingContext >> ", bindingContext);
  console.log("masuk 1");
  // if (obj && obj.paramKeyword) {
  //   console.log("masuk 2 >> ", obj.paramKeyword);
  //   SQL__select(
  //     "words",
  //     "guid, word",
  //     "WHERE word='" + obj.paramKeyword + "' LIMIT 1"
  //   ).then((resWords) => {
  //     console.log("masuk 3 >> ", resWords, " >> ", resWords.length);
  //     if (resWords.length > 0) {
  //       console.log("masuk 4");
  //       SQL__select(
  //         "bookmark",
  //         "id, words_guid",
  //         "WHERE words_guid='" + resWords[0].guid + "' LIMIT 1"
  //       ).then((resBookmark) => {
  //         console.log("masuk 5 >> ", resBookmark, " >> ", resBookmark.length);
  //         if (resBookmark.length > 0) {
  //           console.log("masuk 7");
  //           SQL__delete("bookmark", resBookmark[0].id);
  //           showToast(obj.paramKeyword + " dihapus dari penanda buku.");
  //         } else {
  //           console.log("masuk 6");
  //           SQL__insert("bookmark", [
  //             { field: "words_guid", value: resWords[0].guid },
  //             { field: "created_at", value: getCurrentTime() },
  //             { field: "updated_at", value: getCurrentTime() },
  //           ]);
  //           showToast(obj.paramKeyword + " ditambahkan ke penanda buku.");
  //         }
  //       });
  //     }
  //   });
  // }
}

export function onItemTap(args) {
  let itemTap = args.view;
  let itemTapData = itemTap.bindingContext;
  // console.log("tapped >> ", itemTapData);
  // console.log("tapped word >> ", itemTapData.word);
  // console.log("tapped isMark >> ", itemTapData.isMark);

  /* SQL__select(
    "words",
    "guid, word",
    "WHERE word='" + itemTapData.word + "' LIMIT 1"
  ).then((resWords) => {
    console.log("masuk 3 >> ", resWords, " >> ", resWords.length);
    if (resWords.length > 0) {
      SQL__select(
        "bookmark",
        "id, words_guid",
        "WHERE words_guid='" + resWords[0].guid + "'"
      ).then((resBookmark) => {
        console.log("masuk 5 >> ", resBookmark, " >> ", resBookmark.length);
        if (resBookmark.length > 0) {
          console.log("masuk 7");
          SQL__delete("bookmark", resBookmark[0].id);
          showToast(itemTapData.word + " dihapus dari penanda buku.");
        } else {
          console.log("masuk 6");
          SQL__insert("bookmark", [
            { field: "words_guid", value: resWords[0].guid },
            { field: "created_at", value: getCurrentTime() },
            { field: "updated_at", value: getCurrentTime() },
          ]);
          showToast(itemTapData.word + " ditambahkan ke penanda buku.");
        }
      });
    }
  }); */
}

export function bannerAdLoaded(args) {
  const banner = args.object;
  const adSize = new BannerAdSize(350, 70);
  banner.size = adSize;
  banner.load();
}
