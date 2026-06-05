import fetch from "node-fetch";

async function test() {
  try {
    const response = await fetch("http://localhost:5179/api/notifications", {
      headers: { "Accept": "application/ld+json" },
      cache: "no-store"
    });
    console.log("OK", response.status);
  } catch (e) {
    console.error("ERROR", e);
  }
}
test();
