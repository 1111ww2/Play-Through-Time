import React, { useRef, useEffect, useState } from "react";
export function Game({ year, sound, onWin, suspended = false }) {
  const canvas = useRef(),
    engine = useRef(),
    winRef = useRef(onWin),
    soundRef = useRef(sound),
    blockedRef = useRef(suspended);
  winRef.current = onWin;
  soundRef.current = sound;
  blockedRef.current = suspended;
  const [hud, H] = useState({
    coins: 0,
    time: 0,
    deaths: 0,
    status: "playing",
  });
  useEffect(() => {
    let disposed = false,
      raf,
      audio,
      last = 0,
      time = 0,
      status = "playing",
      deaths = 0,
      camera = 0,
      particles = [],
      keys = {},
      jumpQueued = false,
      shake = 0,
      targetX = null;
    const c = canvas.current,
      ctx = c.getContext("2d"),
      W = 960,
      HT = 360,
      world = 1900,
      ground = 312;
    const assets = {};
    for (const name of ["bg", "tile", "sprite", "coin", "block", "flag"]) {
      const im = new Image();
      im.src = `assets/${name === "sprite" || name === "flag" ? name : year + "-" + (name === "bg" ? "landscape" : name)}.png`;
      assets[name] = im;
    }
    const pits = [
        [605, 684],
        [1200, 1276],
      ],
      platforms = [
        { x: 345, y: 255, w: 100, h: 20 },
        { x: 815, y: 252, w: 100, h: 20 },
        { x: 1400, y: 255, w: 100, h: 20 },
      ];
    let player,
      coins,
      trail = [],
      lastHUD = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function beep(f = 600, d = 0.1) {
      if (!soundRef.current) return;
      try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        audio.resume();
        const o = audio.createOscillator(),
          g = audio.createGain();
        o.type = year === "2004" ? "triangle" : "square";
        o.frequency.setValueAtTime(f, audio.currentTime);
        o.frequency.exponentialRampToValueAtTime(
          f * 1.6,
          audio.currentTime + d,
        );
        g.gain.setValueAtTime(0.04, audio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + d);
        o.connect(g);
        g.connect(audio.destination);
        o.start();
        o.stop(audio.currentTime + d);
      } catch {}
    }
    function burst(x, y, count, color) {
      if (reduced) return;
      for (let i = 0; i < count; i++)
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 250,
          vy: -40 - Math.random() * 230,
          life: 0.4 + Math.random() * 0.6,
          color,
          size: 2 + Math.random() * 3,
        });
    }
    function reset() {
      player = {
        x: 50,
        y: ground - 42,
        w: 32,
        h: 42,
        vx: 0,
        vy: 0,
        on: true,
        face: 1,
        coyote: 0,
      };
      coins = [
        { x: 393, y: 217, got: false },
        { x: 947, y: 267, got: false },
        { x: 1448, y: 217, got: false },
      ];
      time = 0;
      camera = 0;
      particles = [];
      trail = [];
      status = "playing";
      keys = {};
      jumpQueued = false;
      targetX = null;
      updateHUD();
    }
    function updateHUD() {
      c.dataset.x = player.x.toFixed(1);
      c.dataset.y = player.y.toFixed(1);
      c.dataset.status = status;
      H({
        coins: coins.filter((x) => x.got).length,
        time: Math.floor(time),
        deaths,
        status,
      });
    }
    function pause() {
      status =
        status === "playing"
          ? "paused"
          : status === "paused"
            ? "playing"
            : status;
      keys = {};
      jumpQueued = false;
      updateHUD();
    }
    function key(e, down) {
      if (blockedRef.current) return;
      if (
        ["INPUT", "TEXTAREA", "BUTTON"].includes(e.target.tagName) &&
        e.target !== c &&
        e.key === " "
      )
        return;
      let k = e.key.toLowerCase();
      if (
        [
          "arrowleft",
          "arrowright",
          "arrowup",
          " ",
          "a",
          "d",
          "w",
          "r",
          "p",
          "escape",
        ].includes(k)
      ) {
        e.preventDefault();
        if (down && !e.repeat) {
          if (k === "r") {
            deaths = 0;
            reset();
            return;
          }
          if (k === "p" || k === "escape") {
            pause();
            return;
          }
          if ([" ", "w", "arrowup"].includes(k)) jumpQueued = true;
        }
        keys[k] = down;
      }
    }
    const kd = (e) => key(e, true),
      ku = (e) => key(e, false),
      blur = () => {
        keys = {};
        jumpQueued = false;
        if (status === "playing") {
          status = "paused";
          updateHUD();
        }
      };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    engine.current = {
      target: (x) => {
        targetX = Math.max(0, Math.min(world - 32, x + camera));
      },
      reset: () => {
        deaths = 0;
        reset();
      },
      pause,
      hold: (k, v) => {
        keys[k] = v;
        if (k === " " && v) jumpQueued = true;
      },
      getState: () => ({
        player: { ...player },
        coins: coins.map((x) => ({ ...x })),
        status,
        time,
        deaths,
        camera,
      }),
    };
    // A read-only snapshot is useful for verifying actual movement and collision states.
    window.pttGame = { getState: () => engine.current?.getState() };
    // Resolve motion and one-way platform landings using the previous frame bottom edge.
    function update(dt) {
      if (blockedRef.current) {
        if (status === "playing") {
          status = "paused";
          keys = {};
          targetX = null;
          updateHUD();
        }
        return;
      }
      if (status !== "playing") return;
      time += dt;
      const p = player,
        oldY = p.y,
        oldBottom = p.y + p.h;
      let dir =
        (keys.arrowright || keys.d ? 1 : 0) -
        (keys.arrowleft || keys.a ? 1 : 0);
      if (dir) targetX = null;
      if (targetX !== null) {
        if (Math.abs(targetX - p.x) < 5) targetX = null;
        else dir = Math.sign(targetX - p.x);
      }
      p.vx = dir * 245;
      if (dir) p.face = dir;
      p.coyote = p.on ? 0.1 : Math.max(0, p.coyote - dt);
      if (jumpQueued && p.coyote > 0) {
        p.vy = -515;
        p.on = false;
        p.coyote = 0;
        burst(p.x + 16, p.y + p.h, 12, year === "1989" ? "#d3dc99" : "#fff3af");
        beep(350, 0.15);
      }
      jumpQueued = false;
      p.vy += 1330 * dt;
      p.x = Math.max(0, Math.min(world - p.w, p.x + p.vx * dt));
      p.y += p.vy * dt;
      p.on = false;
      const overPit = pits.some(
        ([a, b]) => p.x + p.w * 0.65 > a && p.x + p.w * 0.35 < b,
      );
      if (
        !overPit &&
        oldBottom <= ground + 2 &&
        p.y + p.h >= ground &&
        p.vy >= 0
      ) {
        p.y = ground - p.h;
        p.vy = 0;
        p.on = true;
      }
      for (const pl of platforms) {
        if (
          p.x + p.w > pl.x &&
          p.x < pl.x + pl.w &&
          oldBottom <= pl.y + 1 &&
          p.y + p.h >= pl.y &&
          p.vy >= 0
        ) {
          p.y = pl.y - p.h;
          p.vy = 0;
          p.on = true;
        }
      }
      if (p.on && oldY < p.y - 3) {
        burst(p.x + 16, p.y + p.h, 7, year === "1989" ? "#899659" : "#e0bd78");
        shake = 2;
      }
      if (p.y > HT + 100) {
        deaths++;
        p.x = 50;
        p.y = ground - p.h;
        p.vy = 0;
        p.on = true;
        camera = 0;
        trail = [];
        beep(130, 0.25);
        updateHUD();
      }
      for (const coin of coins) {
        if (
          !coin.got &&
          Math.hypot(p.x + 16 - coin.x, p.y + 20 - coin.y) < 34
        ) {
          coin.got = true;
          burst(coin.x, coin.y, 25, year === "1989" ? "#dae7a1" : "#ffd85c");
          beep(850, 0.14);
          updateHUD();
        }
      }
      if (p.x > 1800 && coins.every((x) => x.got)) {
        status = "won";
        burst(p.x, 150, 100, year === "1989" ? "#d5e299" : "#ffd967");
        beep(700, 0.5);
        winRef.current();
        updateHUD();
      }
      camera = Math.max(0, Math.min(world - W, p.x - W * 0.33));
      if (!reduced && Math.abs(p.vx) > 0) {
        trail.push({ x: p.x, y: p.y, life: 0.15 });
        if (trail.length > 7) trail.shift();
      }
    }
    // Render one continuous parallax backdrop, then solid terrain and interactive objects.
    function draw(t, dt) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, HT);
      ctx.fillStyle = year === "1989" ? "#afb780" : "#59adeb";
      ctx.fillRect(0, 0, W, HT);
      if (assets.bg.complete && assets.bg.naturalWidth) {
        ctx.drawImage(
          assets.bg,
          -camera * 0.18,
          0,
          W + (world - W) * 0.18,
          ground,
        );
      }
      ctx.save();
      ctx.translate(-camera + (shake ? Math.sin(t * 0.08) * shake : 0), 0);
      shake = Math.max(0, shake - dt * 15);
      const tile = assets.tile;
      function tiles(x, y, w, h) {
        if (!tile.complete || !tile.naturalWidth) return;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        for (let ty = y; ty < y + h; ty += 24)
          for (let tx = x; tx < x + w; tx += 32)
            ctx.drawImage(tile, tx, ty, 32, 24);
        ctx.restore();
      }
      let start = 0;
      for (const [a, b] of [...pits, [world, world]]) {
        tiles(start, ground, a - start, HT - ground);
        start = b;
      }
      for (const p of platforms) tiles(p.x, p.y, p.w, p.h);
      // All scene objects and the character use crops of the supplied raster artwork.
      for (const coin of coins) {
        if (!coin.got && assets.coin.complete && assets.coin.naturalWidth) {
          let pulse = reduced ? 1 : 0.76 + Math.abs(Math.cos(t * 0.004)) * 0.24;
          ctx.save();
          ctx.translate(coin.x, coin.y + Math.sin(t * 0.003) * 3);
          ctx.scale(pulse, 1);
          ctx.drawImage(assets.coin, -10, -12, 20, 24);
          ctx.restore();
        }
      }
      if (assets.block.complete && assets.block.naturalWidth)
        ctx.drawImage(assets.block, 1030, 200, 30, 30);
      if (assets.flag.complete && assets.flag.naturalWidth) {
        ctx.drawImage(assets.flag, 1810, ground - 98, 58, 98);
      }
      if (player.x > 1640 && !coins.every((x) => x.got)) {
        ctx.fillStyle = "#eeece5";
        ctx.fillRect(1630, 170, 180, 25);
        ctx.fillStyle = "#282a20";
        ctx.font = "13px monospace";
        ctx.fillText("Collect all 3 coins", 1640, 187);
      }
      const sprite = assets.sprite,
        p = player;
      function character(x, y, alpha = 1) {
        if (!sprite.complete || !sprite.naturalWidth) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(Math.round(x + p.w / 2), Math.round(y + p.h));
        ctx.scale(p.face, 1);
        if (year === "1989")
          ctx.filter =
            "grayscale(1) sepia(1) hue-rotate(20deg) saturate(1.4) brightness(.65)";
        let bob = p.on && Math.abs(p.vx) > 0 ? Math.sin(t * 0.024) * 1.8 : 0;
        ctx.drawImage(sprite, -p.w / 2, -p.h + bob, p.w, p.h - bob);
        ctx.restore();
      }
      if (year === "2004")
        for (const q of trail) {
          q.life -= dt;
          character(q.x, q.y, Math.max(0, q.life) * 0.6);
        }
      trail = trail.filter((q) => q.life > 0);
      character(p.x, p.y);
      for (const q of particles) {
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vy += 500 * dt;
        q.life -= dt;
        ctx.globalAlpha = Math.max(0, Math.min(1, q.life * 2));
        ctx.fillStyle = q.color;
        ctx.fillRect(q.x, q.y, q.size, q.size);
      }
      particles = particles.filter((q) => q.life > 0);
      ctx.globalAlpha = 1;
      ctx.restore();
      if (year === "1989") {
        ctx.fillStyle = "#34471b13";
        for (let y = 0; y < HT; y += 4) ctx.fillRect(0, y, W, 1);
      }
      if (year === "2004" && !reduced) {
        ctx.fillStyle = "#fffaaf";
        for (let i = 0; i < 15; i++) {
          ctx.globalAlpha = 0.15 + 0.15 * Math.sin(t * 0.002 + i);
          ctx.fillRect((i * 83 + t * 0.012) % W, 65 + ((i * 57) % 200), 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    }
    // Cap the physics step after inactive tabs to avoid tunneling through platforms.
    function loop(t) {
      if (disposed) return;
      const dt = Math.min((t - last) / 1000 || 0, 1 / 30);
      last = t;
      update(dt);
      draw(t, dt);
      if (t - lastHUD > 200) {
        updateHUD();
        lastHUD = t;
      }
      raf = requestAnimationFrame(loop);
    }
    reset();
    raf = requestAnimationFrame(loop);
    // Release listeners, audio and animation frames when changing eras or pages.
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
      audio?.close();
      delete window.pttGame;
    };
  }, [year]);
  const hold = (k) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      engine.current?.hold(k, true);
    },
    onPointerUp: () => engine.current?.hold(k, false),
    onPointerCancel: () => engine.current?.hold(k, false),
    onLostPointerCapture: () => engine.current?.hold(k, false),
  });
  return (
    <div
      className="game"
      onContextMenu={(e) => {
        e.preventDefault();
        engine.current?.hold(" ", true);
        engine.current?.hold(" ", false);
      }}
    >
      <canvas
        ref={canvas}
        onPointerDown={(e) => {
          if (e.button === 0) {
            const r = e.currentTarget.getBoundingClientRect();
            engine.current?.target(((e.clientX - r.left) / r.width) * 960);
            e.currentTarget.focus();
          }
        }}
        width="960"
        height="360"
        tabIndex="0"
        aria-label="Single player platform game"
      />
      <div className="gameHud">
        <span className={"badge y" + year}>
          {year}
          <small>
            {year === "1989"
              ? "MONOCHROME ERA"
              : year === "1998"
                ? "16-BIT GENERATION"
                : "MODERN HANDHELD"}
          </small>
        </span>
        <div className="gameStats">
          COINS {hud.coins}/3 · {hud.time}s · RETRIES {hud.deaths}
          <br />
          <button
            onClick={() => engine.current?.pause()}
            aria-label="Pause game"
          >
            {hud.status === "paused" ? "Resume" : "Pause"}
          </button>{" "}
          / <button onClick={() => engine.current?.reset()}>Restart</button>
        </div>
      </div>
      <div className="touchControls">
        <button aria-label="Move left" {...hold("arrowleft")}>
          ←
        </button>
        <button aria-label="Move right" {...hold("arrowright")}>
          →
        </button>
        <button aria-label="Jump" {...hold(" ")}>
          A · Jump
        </button>
      </div>
      {hud.status !== "playing" && (
        <div className="gameOverlay">
          <div>
            <h2>{hud.status === "won" ? "ERA CLEARED!" : "PAUSED"}</h2>
            <p>
              {hud.status === "won"
                ? `3 coins collected · ${hud.time}s · ${year}`
                : "Press P or Resume to continue"}
            </p>
            <button
              onClick={() =>
                hud.status === "paused"
                  ? engine.current?.pause()
                  : engine.current?.reset()
              }
            >
              {hud.status === "paused" ? "Resume" : "Play again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
