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
import { SQL__query } from "~/sqlite-helper";

const ToastClass = com.kangcahya.ToastClass;

export function initTables() {
  SQL__query(`CREATE TABLE IF NOT EXISTS "words" (
    "guid"	TEXT NOT NULL,
    "word"	TEXT NOT NULL,
    "lema"	TEXT NOT NULL,
    "arti"	TEXT NOT NULL,
    "tesaurusLink"	TEXT,
    "type"	TEXT NOT NULL DEFAULT 'word',
    "created_at"	TEXT NOT NULL,
    PRIMARY KEY("guid")
  )`);

  SQL__query(`
    CREATE INDEX IF NOT EXISTS idx_words_word ON words(word);
    CREATE INDEX IF NOT EXISTS idx_words_arti ON words(arti);
  `);

  SQL__query(`CREATE TABLE IF NOT EXISTS "history" (
    "id"	INTEGER NOT NULL UNIQUE,
    "words_guid"	TEXT NOT NULL,
    "created_at"	TEXT NOT NULL,
    "updated_at"	TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  )`);

  SQL__query(`CREATE TABLE IF NOT EXISTS "bookmark" (
    "id"	INTEGER NOT NULL UNIQUE,
    "words_guid"	TEXT NOT NULL,
    "created_at"	TEXT NOT NULL,
    "updated_at"	TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
  )`);
}

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
