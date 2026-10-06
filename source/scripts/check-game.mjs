import { transform } from "esbuild";
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
let raw = fs
  .readFileSync("src/Game.jsx", "utf8")
  .replace(/import React[^;]+;/, "")
  .replace("export function Game", "function Game");
const { code } = await transform(raw + "\nwindow.mountGame=Game;", {
  loader: "jsx",
  format: "iife",
  jsxFactory: "React.createElement",
});
for (const year of ["1989", "1998", "2004"]) {
  let effect,
    raf,
    clock = 0,
    hud,
    wins = 0,
    nodes = [];
  let listeners = {};
  let engine;
  const ctx = new Proxy({}, { get: (_, k) => () => {}, set: () => true });
  const canvas = { getContext: () => ctx, dataset: {} };
  let refIndex = 0,
    refs = [];
  const window = {
    addEventListener: (n, f) => (listeners[n] = f),
    removeEventListener: () => {},
  };
  const sandbox = {
    React: {
      createElement: (type, props, ...children) => {
        const n = { type, props: props || {}, children };
        nodes.push(n);
        return n;
      },
    },
    useRef: (v) => {
      const ref = { current: refIndex++ === 0 ? canvas : v };
      refs.push(ref);
      return ref;
    },
    useState: () => [{}, (v) => (hud = v)],
    useEffect: (f) => (effect = f),
    Image: class {
      complete = false;
    },
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (f) => {
      raf = f;
      return 1;
    },
    cancelAnimationFrame: () => {},
    window,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(
    code +
      '\nwindow.mountGame({year: "' +
      year +
      '",sound:false,onWin:()=>{window.win=true}});',
    sandbox,
  );
  effect();
  const state = () => window.pttGame.getState();
  const key = (k, down = true) =>
    listeners[down ? "keydown" : "keyup"]({
      key: k,
      repeat: false,
      target: { tagName: "CANVAS" },
      preventDefault() {},
    });
  function frames(n) {
    for (let i = 0; i < n; i++) {
      clock += 1000 / 60;
      raf(clock);
    }
  }
  function moveTo(x) {
    let n = 0;
    key("ArrowRight");
    while (state().player.x < x && n++ < 600) frames(1);
    key("ArrowRight", false);
    assert.ok(n < 600, "Movement stalled");
  }
  function jumpTo(x) {
    key(" ");
    key("ArrowRight");
    let n = 0;
    while (state().player.x < x && n++ < 180) frames(1);
    key(" ", false);
    key("ArrowRight", false);
    frames(48);
    assert.ok(n < 180, "Jump stalled");
  }
  frames(2);
  let start = state().player.x;
  moveTo(100);
  assert.ok(state().player.x > start, "Keyboard movement");
  key("p");
  let paused = state().time;
  frames(30);
  assert.equal(state().time, paused, "Pause freezes time");
  key("p");
  key("r");
  assert.equal(state().player.x, 50, "Restart resets player");
  moveTo(290);
  jumpTo(380);
  assert.ok(state().coins[0].got, "First coin collected");
  assert.equal(state().player.y, 213, "Platform landing");
  moveTo(550);
  jumpTo(730);
  assert.equal(state().deaths, 0, "First pit cleared");
  moveTo(950);
  assert.ok(state().coins[1].got, "Second coin collected");
  moveTo(1145);
  jumpTo(1320);
  assert.equal(state().deaths, 0, "Second pit cleared");
  moveTo(1340);
  jumpTo(1440);
  assert.ok(state().coins[2].got, "Third coin collected");
  moveTo(1801);
  assert.equal(state().status, "won", "Reach flag to win");
  assert.ok(window.win, "Win callback");
  key("r");
  moveTo(620);
  frames(100);
  assert.ok(state().deaths > 0, "Falling respawns");
  key("r");
  const right = nodes.find((n) => n.props["aria-label"] === "Move right");
  const ev = {
    preventDefault() {},
    pointerId: 1,
    currentTarget: { setPointerCapture() {} },
  };
  right.props.onPointerDown(ev);
  frames(12);
  assert.ok(state().player.x > 90, "Mouse hold movement");
  right.props.onPointerUp();
  let stop = state().player.x;
  frames(12);
  assert.equal(state().player.x, stop, "Mouse release stops");
  const cv = nodes.find((n) => n.type === "canvas");
  cv.props.onPointerDown({
    button: 0,
    clientX: 210,
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, width: 960 }),
      focus() {},
    },
  });
  frames(45);
  assert.ok(Math.abs(state().player.x - 210) < 6, "Mouse click destination");
  const gameRoot = nodes.find((n) => n.props.className === "game");
  gameRoot.props.onContextMenu({ preventDefault() {} });
  frames(5);
  assert.ok(state().player.y < 240, "Mouse right-click jump");
  refs[4].current = true;
  frames(2);
  assert.equal(state().status, "paused", "Sidebar suspends the game");
  const frozen = state().time;
  key("p");
  frames(12);
  assert.equal(state().time, frozen, "Sidebar blocks game hotkeys");
  refs[4].current = false;
  key("p");
  frames(2);
  assert.equal(state().status, "playing", "Resume works after sidebar closes");
  console.log(
    `${year}: keyboard move/jump, collisions, 3 coins, 2 pits, flag win, pause, restart, fall respawn, mouse hold/release, click-to-move, right-click jump, sidebar suspend/resume passed`,
  );
}
