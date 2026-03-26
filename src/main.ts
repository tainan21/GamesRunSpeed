import "./styles.css";
import Phaser from "phaser";
import { VIEW_HEIGHT, VIEW_WIDTH } from "./game/config";
import { GameScene } from "./game/GameScene";

const container = document.querySelector<HTMLDivElement>("#app");

if (!container) {
  throw new Error("App container not found.");
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: container,
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  backgroundColor: "#52635e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [GameScene]
});

(window as Window & { __ROGUELITE_GAME__?: Phaser.Game }).__ROGUELITE_GAME__ = game;

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
