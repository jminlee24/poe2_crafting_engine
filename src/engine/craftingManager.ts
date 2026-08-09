import Engine from "./engine.ts";

export default class CraftingManager {
  engine: Engine;

  constructor() {
    this.engine = new Engine();
  }
}
