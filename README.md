# Play Through Time

一个可以离线游玩的单人网页小游戏与游戏画面演进展览，包含 1989、1998、2004 三个年代和八个互动页面。界面采用 HTML、CSS、React 和 **JavaScript**；不需要 Java 运行环境。

## 打开最终压缩包

1. 完整解压压缩包。
2. 打开根目录的 `index.html`。请保留同目录的 `app.js`、`app.css` 与 `assets` 文件夹。
3. 点击 **Start Experience**。框内左上角四方块标志可打开全部页面的侧边导航；声音开关在框内顶部。

推荐使用现代 Chrome、Edge 或 Safari。如果浏览器限制本地文件，请使用下方的开发预览方式。交付前已测试 localhost 预览和离线包资源完整性；当前测试浏览器限制 file://，因此未声称完成双击文件的浏览器实测。

## 游戏操作

| 操作           | 键盘 / 鼠标                              |
| -------------- | ---------------------------------------- |
| 移动           | ← → 或 A / D；也可长按画面上的箭头       |
| 跳跃           | 空格、W、↑；鼠标右键或 A · Jump 按钮     |
| 移动到指定位置 | 鼠标左键点击游戏画面                     |
| 暂停 / 继续    | P、Esc 或 Pause / Resume                 |
| 重新开始       | R 或 Restart                             |
| 选择年代       | 年代页、时间轴页使用 ← →；Enter / A 继续 |

收集 **3 枚金币**，越过两个坑洞，到最右侧旗帜处通关。掉落后回到起点，已收集金币保留。打开侧边栏会暂停游戏；关闭后点击 Resume 继续。三个年代共用关卡规则，画面风格与特效有所区别。

## 八个页面

1. Welcome：进入展览。
2. Choose a year：点击卡片或方向按钮选择年代。
3. Timeline explorer：拖动时间轴、切换年代，进入游戏。
4. Single player：真实移动、跳跃、碰撞、金币收集、通关与重玩。
5. Compare across generations：并排对比，点击图片放大。
6. Detail viewer：拖动前后对比滑杆，点击放大镜查看细节。
7. Observation：多选观察结果，可输入最多 300 字的补充意见。
8. Review & preference：选择偏好、完成体验或重玩。

年代、反馈、偏好及通关记录保存在当前浏览器本地，不上传到服务器。禁用本地存储时仍可游玩，但记录不会保留。音效默认关闭，由浏览器本地合成。系统的“减少动态效果”设置会减少粒子与动画。

## Development

The `source/` directory in the delivered ZIP contains the editable project. Node.js 20.19+ or 22.12+ is recommended.

```sh
cd source
npm ci
npm run dev -- --host 127.0.0.1 --port 4173
```

Open `http://localhost:4173/`.

```sh
npm run test:game   # Exercise the actual game component with deterministic input
npm run build       # Create the production and preserved Sites-compatible outputs
npm run test:sites  # Check the preserved hosting worker
npm run offline     # Create a clean standalone offline/ folder
npm run format      # Format editable application code
```

### Source layout

- `src/App.jsx`: page routing, navigation, comparison tools and local persistence.
- `src/Game.jsx`: canvas rendering, controls, physics, collisions and game lifecycle.
- `src/styles.css`: frame layout, page styles, responsive scaling and motion preferences.
- `public/assets/`: local artwork used by the application; no network dependency.
- `scripts/check-game.mjs`: gameplay regression checks for all three eras.
- `scripts/build-offline.mjs`: clean offline bundle and editable source packaging.
- `worker/`, `.openai/`, `scripts/prepare-sites-build.mjs`, `tests/`: preserved hosting support.

English comments explain lifecycle, persistence, physics and packaging decisions. The read-only `window.pttGame.getState()` snapshot is a deliberate verification aid, not a gameplay cheat or required external dependency.

## Artwork and validation

Original supplied pixel artwork is used for characters, game objects and comparison images. Continuous landscapes, the museum, a gender-neutral robot avatar, decorative cutout and the four transparent UI icons were redrawn with the built-in image generation tool. Pixel art intentionally retains hard pixel edges; the UI icons use high-resolution PNGs with alpha transparency. Prompts and asset provenance are recorded in `asset-generation.md`.

The museum illustration contains small AI-rendered wall lettering that is not guaranteed to be exact. Interactive controls and interface text are rendered as real HTML. Game-history labels are illustrative exhibit copy rather than technical hardware specifications.

Validation covers keyboard and mouse controls, platform landings, pits, all three coins, winning, pause/restart, navigation suspension, page navigation and production packaging. See `design-qa.md` for the validation record. No external analytics, account login or paid service is required to run the delivered app.
