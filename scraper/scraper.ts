import type { Page, Locator } from "npm:playwright";

const BASE_URL = "https://poe2db.tw/us/Boots_int#ModifiersCalc";

export type ModifierTier = {
  ilvl: number;
  min: number | null;
  max: number | null;
  weight: number;
};

export type Modifier = {
  id: number;
  name: string;
  tag: string;
  mod: ModifierTier[];
};

export type ModifierData = {
  prefix: { [key: string]: Modifier[] };
  suffix: { [key: string]: Modifier[] };
};

let globalId = 0;

export class Poe2DbScraper {
  constructor(private readonly page: Page) {}

  async load(): Promise<void> {
    console.log(`Opening ${BASE_URL}`);

    await this.page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    console.log("DOM loaded");

    await this.page
      .waitForLoadState("networkidle", {
        timeout: 30_000,
      })
      .catch(() => {});

    // Allow the calculator/client-side code to finish.
    await this.page.waitForTimeout(1500);

    // We now know the actual selector from your HTML.
    await this.page.locator("#canvas").waitFor({
      state: "attached",
      timeout: 15_000,
    });

    console.log("Modifier calculator loaded");
  }

  async scrape(): Promise<ModifierData> {
    const prefix = await this.scrapeModifiers("prefix");
    const suffix = await this.scrapeModifiers("suffix");

    return {
      prefix,
      suffix,
    };
  }

  private async scrapeModifiers(type: "prefix" | "suffix"): Promise<{
    [key: string]: Modifier[];
  }> {
    console.log(`\n=== ${type.toUpperCase()} ===`);

    /*
     * Every actual modifier on this page is:
     *
     * .mod-title.explicitMod
     *
     * The modifier is inside a .col-lg-6 section whose h5 is
     * either:
     *
     *   Base Prefix
     *   Base Suffix
     *   Uhtred's Sidereus Prefix
     *   Uhtred's Sidereus Suffix
     *   etc.
     *
     * This lets us distinguish prefixes and suffixes without
     * relying on P/S buttons.
     */
    const rows = this.page.locator("#canvas .mod-title.explicitMod");

    const count = await rows.count();

    console.log(`Found ${count} total modifier rows`);

    const modifiers: { [key: string]: Modifier[] } = {};

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      const section = await this.getSectionType(row);

      if (section == null || section[0] !== type) {
        continue;
      }

      const modifier = await this.scrapeModifier(row);

      if (modifier) {
        if (!modifiers[section[1]]) {
          modifiers[section[1]] = [];
        }
        modifier.id = globalId++;
        modifiers[section[1]].push(modifier);

        console.log(
          `[${modifiers.length}] ${modifier.name} ` +
            `(${modifier.tag}) - ${modifier.mod.length} tiers`,
        );
      }
    }

    console.log(`Found ${modifiers.length} ${type} modifiers`);

    return modifiers;
  }

  private async getSectionType(
    row: Locator,
  ): Promise<["prefix" | "suffix", string] | null> {
    /*
     * Walk up to the column containing the modifier.
     *
     * The actual HTML is approximately:
     *
     * <div class="col-lg-6 p-2">
     *   <h5 class="identify-title">Base Prefix</h5>
     *   <div class="filters ...">
     *     <div class="mod-title explicitMod">
     */
    const column = row.locator(
      "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' col-lg-6 ')][1]",
    );

    const heading = column.locator("h5.identify-title");

    if ((await heading.count()) === 0) {
      return null;
    }

    const text = normalize(await heading.first().innerText()).toLowerCase();

    if (
      [
        "augment",
        "bonded modifiers",
        "corrupted",
        "orbs of sacrifice",
      ].includes(text)
    ) {
      return null;
    }

    if (text.endsWith("prefix")) {
      return ["prefix", text];
    }

    if (text.endsWith("suffix")) {
      return ["suffix", text];
    }

    return null;
  }

  private async scrapeModifier(row: Locator): Promise<Modifier | null> {
    const target = await row.getAttribute("data-bs-target");

    if (!target) {
      console.warn("Modifier has no data-bs-target:", await row.innerText());

      return null;
    }

    /*
     * Example:
     *
     * data-bs-target="#collapseOnenormal1IncreasedLife"
     *
     * This points directly to the modal containing all tiers.
     */
    const modal = this.page.locator(target);

    if ((await modal.count()) === 0) {
      console.warn(`Could not find modal ${target}`);

      return null;
    }

    /*
     * Extract these BEFORE clicking.
     *
     * The modifier row itself already contains:
     *
     * - modifier name
     * - crafting tags
     */
    const name = await this.extractName(row);
    const tag = await this.extractTag(row);

    console.log(`  Clicking: ${name}`);

    /*
     * IMPORTANT:
     *
     * We explicitly click the modifier as requested.
     */
    await row.click();

    /*
     * Wait for Bootstrap to show the modal.
     */
    await modal.waitFor({
      state: "visible",
      timeout: 5_000,
    });

    /*
     * Find the tier table inside THIS modal.
     *
     * The captured HTML shows:
     *
     * <table class="table ... orig ...">
     *
     * with:
     *
     * Item Level | Local/Global | Weight
     */
    const table = modal.locator("table.orig").first();

    await table.waitFor({
      state: "visible",
      timeout: 5_000,
    });

    const tiers = await this.extractTiers(table);

    /*
     * Close the modal.
     */
    await this.closeModal(modal);

    return {
      name,
      tag,
      mod: tiers,
    };
  }

  private async extractName(row: Locator): Promise<string> {
    /*
     * Clone the modifier DOM and remove the UI-only pieces:
     *
     *   - weight badge
     *   - ilvl badge
     *   - tier badge
     *   - crafting tag badges
     *
     * This leaves something like:
     *
     *   "# to maximum Life"
     */
    return await row.evaluate((element) => {
      const clone = element.cloneNode(true) as HTMLElement;

      clone.querySelectorAll(".badge, .float-end").forEach((el) => el.remove());

      return clone.textContent?.replace(/\s+/g, " ").trim() ?? "";
    });
  }

  private async extractTag(row: Locator): Promise<string> {
    /*
     * The actual HTML uses:
     *
     * <span data-tag="life">
     *
     * so use that rather than parsing the displayed text.
     */
    const tags = row.locator("[data-tag]");

    const count = await tags.count();

    if (count === 0) {
      return "";
    }

    /*
     * There can actually be multiple tags:
     *
     * Elemental
     * Fire
     * Resistance
     *
     * Your current type only allows one string, so join them.
     */
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
      const value = await tags.nth(i).getAttribute("data-tag");

      if (value) {
        values.push(value);
      }
    }

    return values.join(" ");
  }

  private async extractTiers(table: Locator): Promise<ModifierTier[]> {
    const rows = table.locator("tbody tr");

    const count = await rows.count();

    const tiers: ModifierTier[] = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);

      const cells = row.locator("td");

      const cellCount = await cells.count();

      /*
       * Expected:
       *
       * 2 = Item Level
       * 3 = Local / Global modifier text
       * 4 = Weight
       */
      if (cellCount < 3) {
        continue;
      }

      const ilvlText = normalize(await cells.nth(2).innerText());

      const modifierText = normalize(await cells.nth(3).innerText());

      const weightText = normalize(
        await cells.nth(3).locator("div>.float-end2").innerText(),
      );

      const ilvl = parseNumber(ilvlText);
      const weight = parseNumber(weightText);

      console.log(ilvlText);
      console.log(weightText);
      console.log(modifierText);

      if (ilvl === null || weight === null) {
        continue;
      }

      const range = parseRange(modifierText);

      tiers.push({
        ilvl,
        min: range?.min ?? null,
        max: range?.max ?? null,
        weight,
      });
    }

    return tiers;
  }

  private async closeModal(modal: Locator): Promise<void> {
    const closeButton = modal.locator('[data-bs-dismiss="modal"]');

    if ((await closeButton.count()) > 0) {
      await closeButton.last().click();
    } else {
      await this.page.keyboard.press("Escape");
    }

    /*
     * Make sure Bootstrap actually hid it before continuing.
     */
    await modal
      .waitFor({
        state: "hidden",
        timeout: 3_000,
      })
      .catch(() => {});

    await this.page.waitForTimeout(50);
  }
}

function normalize(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value: string): number | null {
  const match = value.match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  return Number(match[0]);
}

function parseRange(value: string): {
  min: number;
  max: number;
} | null {
  /*
   * Handles:
   *
   * (10—20)
   * (10–20)
   * (10-20)
   * (-10—-5)
   *
   * PoE2DB actually gives us an HTML `.ndash`, but innerText()
   * converts it to the dash character.
   */
  const match = value.match(
    /\(\s*(-?\d+(?:\.\d+)?)\s*[—–-]\s*(-?\d+(?:\.\d+)?)\s*\)/,
  );

  if (!match) {
    return null;
  }

  return {
    min: Number(match[1]),
    max: Number(match[2]),
  };
}
