import { chromium } from "npm:playwright";
import { Poe2DbScraper, type ModifierData } from "./scraper.ts";

const browser = await chromium.launch({
  headless: false,
});

try {
  const page = await browser.newPage({
    viewport: {
      width: 1920,
      height: 1080,
    },
  });

  page.setDefaultTimeout(10_000);

  const scraper = new Poe2DbScraper(page);

  await scraper.load();

  const data: ModifierData = await scraper.scrape();

  await Deno.mkdir("./data", {
    recursive: true,
  });

  await Deno.writeTextFile(
    "./data/boots_int.json",
    JSON.stringify(data, null, 2),
  );

  console.log("\n============================");
  console.log("Scraping complete");
  console.log("============================");
  console.log(`Prefixes: ${data.prefix.length}`);
  console.log(`Suffixes: ${data.suffix.length}`);
  console.log(`Total:    ${data.prefix.length + data.suffix.length}`);
  console.log("\nSaved to ./data/boots_int.json");
} finally {
  await browser.close();
}
