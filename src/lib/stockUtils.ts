import zlib from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

export async function compressStock(stockData: any) {
  if (!Array.isArray(stockData)) return stockData;
  if (stockData.length >= 250) {
    const buffer = await gzipAsync(JSON.stringify(stockData));
    return [{ __compressed: buffer.toString("base64") }];
  }
  const str = JSON.stringify(stockData);
  if (str.length > 5e4) {
    const buffer = await gzipAsync(str);
    return [{ __compressed: buffer.toString("base64") }];
  }
  return stockData;
}

export async function decompressStock(data: any): Promise<any[]> {
  let compData = data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      compData = data;
    } catch (e) {
      console.error("Caught error:", e);
    }
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data["0"]) {
      const arr = [];
      for (let i = 0; i < Object.keys(data).length; i++) {
        if (data[i] !== void 0) arr.push(data[i]);
      }
      data = arr;
      compData = data;
    }
  }
  if (
    Array.isArray(data) &&
    data.length === 1 &&
    data[0] &&
    typeof data[0] === "object" &&
    data[0].__compressed
  ) {
    compData = data[0];
  }
  if (compData && typeof compData === "object" && compData.__compressed) {
    try {
      const buffer = await gunzipAsync(
        Buffer.from(compData.__compressed, "base64"),
      );
      return JSON.parse(buffer.toString("utf-8"));
    } catch (e) {
      console.error("decompressStock error:", e);
      return [];
    }
  }
  return data;
}
