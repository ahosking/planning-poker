import { Before, After } from "@cucumber/cucumber";
import { RoomManager } from "../../server/room-manager.js";
import type { PlanningPokerWorld } from "./world.js";

Before(function (this: PlanningPokerWorld) {
  this.roomManager = new RoomManager();
  this.participants = new Map();
  this.history = [];
  this.uiState = {
    historyPanelVisible: false,
    expandedEntries: new Set(),
  };
  this.lastError = null;
});

After(function (this: PlanningPokerWorld) {
  this.roomManager.destroy();
});
