import { Http, Dialogs, Connectivity } from "@nativescript/core";
import * as htmlparser2 from "htmlparser2";
import { SQL__query } from "~/sqlite-helper";

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

  SQL__query(`CREATE TABLE IF NOT EXISTS "history" (
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
  const END_POINT = "https://x-labs.my.id/api/kbbi";
  try {
    if (_method.toUpperCase() === "GET") {
      console.log("GET >>> ", END_POINT + _url);
      const res = await Http.request({
        method: "GET",
        headers: { "Content-Type": "application/json" },
        url: END_POINT + _url,
      });
      console.log("GET <<< ", res);
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
