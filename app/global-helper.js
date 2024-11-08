import {
  Application,
  Dialogs,
  Connectivity,
  knownFolders,
  Folder,
  path,
} from "@nativescript/core";
import { Http } from "@klippa/nativescript-http";
import * as htmlparser2 from "htmlparser2";

import { SQL__select, SQL__insert, SQL__selectRaw } from "./sqlite-helper";

const ToastClass = com.kangcahya.ToastClass;

export function getCurrentTime() {
  var d = new Date();

  var p = d.getFullYear(),
    q = d.getMonth() + 1,
    r = d.getDate(),
    s = d.getHours(),
    t = d.getMinutes(),
    u = d.getSeconds();

  var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    monthName = months[d.getMonth()];

  // var days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var dayName = days[d.getDay()];

  var result =
    dayName +
    ", " +
    r +
    "/" +
    monthName +
    "/" +
    p +
    " " +
    s +
    ":" +
    t +
    ":" +
    u;

  return result;
}

export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function myHttpClient(_url, _method = "GET", _data = {}) {
  const END_POINT = "";

  try {
    if (_method.toUpperCase() === "GET") {
      console.log("GET >>> ", END_POINT + _url);
      const res = await Http.request({
        method: "GET",
        headers: { "Content-Type": "application/json" },
        url: END_POINT + _url,
      });
      console.log("GET <<< ", res);
      console.log("GET content <<< ", res.content);
      console.log("GET content toJSON() <<< ", res.content.toJSON());
      return res.content.toJSON();
    } else {
      const res = await Http.request({
        method: _method,
        url: _url,
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify(_data),
      });
      return res.content.toJSON();
    }
  } catch (e) {
    Dialogs.alert("Error occurred!");
  }
}

export function decodeHtml(html) {
  let decoded = "";
  const parser = new htmlparser2.Parser(
    {
      ontext(text) {
        decoded += text;
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return decoded;
}

export function internet() {
  const connectionType = Connectivity.getConnectionType();
  switch (connectionType) {
    case Connectivity.connectionType.wifi:
      return {
        connected: true,
        type: "wifi",
      };
    case Connectivity.connectionType.ethernet:
      return {
        connected: true,
        type: "wifi",
      };
    case Connectivity.connectionType.mobile:
      return {
        connected: true,
        type: "mobile",
      };
    case Connectivity.connectionType.bluetooth:
      return {
        connected: false,
        type: "none",
      };
    case Connectivity.connectionType.vpn:
      return {
        connected: false,
        type: "none",
      };
    default:
      return {
        connected: false,
        type: "none",
      };
  }
}

export function showToast(message, duration = "short") {
  const context =
    Application.android.foregroundActivity || Application.android.startActivity;
  ToastClass.showToast(context, message, duration);
}

export function __createDirectories() {
  const cacheFolderPath = path.join(
    knownFolders.temp().path,
    "WebView/Crashpad"
  );

  const cacheFolder = Folder.fromPath(cacheFolderPath);
  // console.log("Checking if Crashpad directory exists...");
  cacheFolder
    .getEntities()
    .then((entities) => {
      // console.log(
      //   "Crashpad directory exists, entities found: " + entities.length
      // );
    })
    .catch((error) => {
      // console.log("Crashpad directory does not exist, creating directory...");
      // Folder.fromPath(cacheFolderPath);
      // console.log("Crashpad directory created successfully");
    });
}

export async function KBBIDaring(_keyword) {
  const _url = "https://x-labs.my.id/api/kbbi?search=" + _keyword;

  try {
    // console.log("GET >>> ", _url);

    // Check if the word is already in the database
    const resWords = await SQL__select(
      "dictionary",
      "TRIM(word) as word, isServer",
      "WHERE LOWER(TRIM(word))='" + _keyword + "' AND isServer=1"
    );

    // console.log("resWords >>> ", resWords);

    // If word exists in the database, return immediately
    if (resWords && resWords.length) {
      return true;
    }

    // Otherwise, fetch data from the API
    // console.log("Fetching data from API...");
    const response = await Http.request({
      url: _url,
      method: "GET",
    });

    const datas = response.content.toJSON().data;
    if (datas && datas.length) {
      for (const data of datas) {
        for (const arti of data.arti) {
          // console.log("Inserting data >> ", arti);

          // Prepare data for insertion
          const dataInsert = [
            { field: "word", value: data.word },
            { field: "lema", value: data.lema },
            { field: "arti", value: arti.deskripsi },
            { field: "tesaurusLink", value: data.tesaurusLink },
            { field: "type", value: 100 },
            { field: "isServer", value: 1 },
          ];

          // Insert data into the database
          await SQL__insert("dictionary", dataInsert);
        }
      }
    }

    return true; // Resolve when API call and insertion are complete
  } catch (error) {
    console.error("Error occurred:", error);
    showToast("Tidak ada koneksi internet");
    return false; // Return false in case of an error
  }
}
