import React, { useState, useEffect, useRef } from "react";
import { Game } from "./Game.jsx";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, X } from "lucide-react";
const years = ["1989", "1998", "2004"];
const eras = ["MONOCHROME ERA", "16-BIT GENERATION", "MODERN HANDHELD"];
const names = [
  "Welcome",
  "Choose a year",
  "Timeline explorer",
  "Single player",
  "Compare across generations",
  "Detail viewer",
  "Observation",
  "Review & preference",
];
const A = "assets/";
const img = (y) => A + y + ".png";
// Storage is optional: private browsing must never prevent the game from starting.
function read() {
  try {
    return JSON.parse(localStorage.getItem("play-through-time-v1")) || {};
  } catch {
    return {};
  }
}
export function App() {
  const saved = useRef(read()).current;
  const [page, P] = useState(0),
    [menu, Menu] = useState(false),
    [year, Y] = useState(saved.year || "1989"),
    [sound, S] = useState(false),
    [split, B] = useState(37),
    [detailEra, D] = useState("2004"),
    [zoom, Z] = useState(null),
    [scale, Q] = useState(1),
    [checks, C] = useState(saved.checks || []),
    [notes, N] = useState(saved.notes || ""),
    [pref, F] = useState(saved.pref || "Before / After"),
    [finished, V] = useState(false),
    [magnify, M] = useState({ x: 29, y: 88 }),
    [wins, W] = useState(saved.wins || []);
  const wrap = useRef(),
    audio = useRef(),
    menuToggle = useRef();
  function tone(f = 500) {
    if (!sound) return;
    try {
      audio.current ||= new (
        window.AudioContext || window.webkitAudioContext
      )();
      audio.current.resume();
      let o = audio.current.createOscillator(),
        g = audio.current.createGain();
      o.type = "square";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.035, audio.current.currentTime);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        audio.current.currentTime + 0.12,
      );
      o.connect(g);
      g.connect(audio.current.destination);
      o.start();
      o.stop(audio.current.currentTime + 0.12);
    } catch {}
  }
  // Navigation closes transient UI while keeping the selected era and saved feedback.
  function go(n) {
    P(n);
    Menu(false);
    tone();
    V(false);
  }
  function change(y) {
    Y(y);
    tone(330 + years.indexOf(y) * 170);
  }
  function nextYear(d) {
    change(years[(years.indexOf(year) + d + 3) % 3]);
  }
  // Preload local artwork to avoid blank scenes when switching pages quickly.
  useEffect(() => {
    const files = [
      "museum-hd.png",
      "decoration-hd.png",
      "avatar-hd.png",
      "sprite.png",
      "flag.png",
      "icon-pixels.png",
      "icon-colours.png",
      "icon-details.png",
      "dpad.png",
      ...years.flatMap((y) => [
        y + ".png",
        y + "-landscape.png",
        y + "-tile.png",
        y + "-coin.png",
        y + "-block.png",
      ]),
    ];
    for (const file of files) {
      const image = new Image();
      image.src = A + file;
      image.decode?.().catch(() => {});
    }
  }, []);
  // Scale the original 570 × 370 composition without changing its layout.
  useEffect(() => {
    let r = new ResizeObserver(([e]) => Q(e.contentRect.width / 570));
    r.observe(wrap.current);
    return () => r.disconnect();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "play-through-time-v1",
        JSON.stringify({ year, checks, notes, pref, wins }),
      );
    } catch {}
  }, [year, checks, notes, pref, wins]);
  useEffect(() => {
    function key(e) {
      if (menu) {
        if (e.key === "Escape") {
          e.preventDefault();
          Menu(false);
        }
        return;
      }
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName) || zoom)
        return;
      if (page === 1 || page === 2) {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          nextYear(e.key === "ArrowLeft" ? -1 : 1);
        }
        if (e.key === "Enter" || e.key.toLowerCase() === "a") {
          e.preventDefault();
          go(page === 1 ? 2 : 3);
        }
      }
      if (e.key === "Escape" && page !== 3) go(Math.max(0, page - 1));
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [page, year, zoom, menu]);
  const Thumb = ({ y, ...props }) => (
    <button className="thumb" {...props}>
      <img src={img(y)} alt={`${y} game scene`} />
      <span className={"badge y" + y}>{y}</span>
    </button>
  );
  const Tabs = () => (
    <div className="tabs">
      <button className={page === 2 ? "on" : ""} onClick={() => go(2)}>
        ◷ &nbsp; Timeline
      </button>
      <button className={page === 4 ? "on" : ""} onClick={() => go(4)}>
        ⊞ &nbsp; Side by Side
      </button>
      <button className={page === 5 ? "on" : ""} onClick={() => go(5)}>
        ▥ &nbsp; Differences
      </button>
    </div>
  );
  return (
    <main>
      <div className="stage" ref={wrap}>
        <article
          className={"panel page" + page}
          style={{ transform: `scale(${scale})` }}
        >
          <header>
            <button
              className="menuToggle"
              ref={menuToggle}
              onClick={() => Menu(!menu)}
              aria-label="Open navigation"
              aria-expanded={menu}
              aria-controls="page-navigation"
            >
              <img src={A + "mark.png"} alt="" />{" "}
              <b>{page < 4 ? "PLAY THROUGH TIME" : "POCKET PORTFOLIO"}</b>
            </button>
            <span className="pageLabel">{names[page].toUpperCase()}</span>
            <button
              className="soundToggle"
              onClick={() => S(!sound)}
              aria-label={sound ? "Turn sound off" : "Turn sound on"}
              aria-pressed={sound}
            >
              {sound ? <Volume2 /> : <VolumeX />}
              <small>{sound ? "ON" : "OFF"}</small>
            </button>
            <b>{String(page + 1).padStart(2, "0")}</b>
          </header>
          <div className="content" key={page}>
            {page === 0 && (
              <div className="welcome">
                <img
                  src={A + "museum-hd.png"}
                  alt="Play Through Time museum with a giant handheld console"
                />
                <button className="primary start" onClick={() => go(1)}>
                  Start Experience <span>→</span>
                </button>
              </div>
            )}
            {page === 1 && (
              <>
                <h2 className="chooseTitle">Select a year to explore:</h2>
                <div className="yearCards">
                  {years.map((y, i) => (
                    <button
                      key={y}
                      className={"yearCard " + (year === y ? "selected" : "")}
                      onClick={() => change(y)}
                      onDoubleClick={() => go(2)}
                    >
                      <div>
                        <b className={"badge y" + y}>{y}</b>
                        <small>{eras[i]}</small>
                      </div>
                      <img src={img(y)} alt={`${y} game artwork`} />
                    </button>
                  ))}
                </div>
                <button
                  className="round left"
                  onClick={() => nextYear(-1)}
                  aria-label="Previous year"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="round right"
                  onClick={() => nextYear(1)}
                  aria-label="Next year"
                >
                  <ChevronRight />
                </button>
                <div className="chooseFoot">
                  <button className="controlHint" onClick={() => nextYear(1)}>
                    <img className="dpad" src={A + "dpad.png"} alt="" />
                    <span>
                      Use D-pad
                      <br />
                      to navigate
                    </span>
                  </button>
                  <button className="controlHint" onClick={() => go(2)}>
                    <b className="aKey">A</b>
                    <span>
                      <strong>Continue →</strong>
                      <br />
                      <small>Press A / Enter</small>
                    </span>
                  </button>
                  <img
                    className="miniSprite"
                    src={A + "decoration-hd.png"}
                    alt=""
                  />
                </div>
              </>
            )}
            {page === 2 && (
              <>
                <Tabs />
                <div className="timelineScene">
                  <Landscape year={year} />
                  <span className={"badge y" + year}>
                    {year}
                    <small>{eras[years.indexOf(year)]}</small>
                  </span>
                  <button className="scenePlay" onClick={() => go(3)}>
                    Play this era →
                  </button>
                </div>
                <button
                  className="round left"
                  onClick={() => nextYear(-1)}
                  aria-label="Previous era"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="round right"
                  onClick={() => nextYear(1)}
                  aria-label="Next era"
                >
                  <ChevronRight />
                </button>
                <div className="timeline">
                  <input
                    aria-label="Timeline year"
                    type="range"
                    min="0"
                    max="2"
                    value={years.indexOf(year)}
                    onChange={(e) => change(years[e.target.value])}
                  />
                  <div>
                    {years.map((y) => (
                      <button
                        key={y}
                        className={year === y ? "active" : ""}
                        onClick={() => change(y)}
                      >
                        {y}
                        <img src={img(y)} alt={y} />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {page === 3 && (
              <>
                <Game
                  year={year}
                  sound={sound}
                  suspended={menu || !!zoom || finished}
                  onWin={() => {
                    W((w) => [...new Set([...w, year])]);
                    tone(900);
                  }}
                />
                <div className="gameBottom">
                  <img
                    className="portrait"
                    src={A + "avatar-hd.png"}
                    alt="Player"
                  />
                  <div className="playerInstructions">
                    <b>Player 1 · Solo adventure</b>
                    <span>← → / A D move · Space / W jump</span>
                    <small>
                      3 coins → flag · R restart · P pause · Mouse: click move,
                      right-click jump
                    </small>
                    <div className="eraSwitch">
                      {years.map((y) => (
                        <button
                          key={y}
                          className={year === y ? "active" : ""}
                          onClick={() => change(y)}
                        >
                          {y}
                          {wins.includes(y) ? " ✓" : ""}
                        </button>
                      ))}
                      <button onClick={() => go(4)}>Compare →</button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {page === 4 && (
              <>
                <div className="compareGrid">
                  {years.map((y, i) => (
                    <div key={y}>
                      <button className="comparePicture" onClick={() => Z(y)}>
                        <img src={img(y)} alt={`${y} comparison`} />
                        <span className={"badge y" + y}>
                          {y}
                          <small>
                            {
                              [
                                "8-BIT\nMONOCHROME",
                                "16-BIT\nCOLOUR",
                                "ADVANCED",
                              ][i]
                            }
                          </small>
                        </span>
                      </button>
                      <button
                        className="caption"
                        onClick={() => {
                          D("2004");
                          go(5);
                        }}
                      >
                        <img
                          src={
                            A +
                            "icon-" +
                            ["pixels", "colours", "details"][i] +
                            ".png"
                          }
                          alt=""
                        />
                        <span>
                          <b>{["Pixels", "Colours", "Details"][i]}</b>
                          <small>
                            {
                              [
                                "More pixels over time",
                                "Richer colour palette",
                                "More detail and depth",
                              ][i]
                            }
                          </small>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="smallFooter">
                  <button onClick={() => go(2)}>← Timeline</button>
                  <button onClick={() => go(5)}>Explore the details →</button>
                </div>
              </>
            )}
            {page === 5 && (
              <>
                <div className="detailTabs">
                  <button
                    className={detailEra === "1989" ? "on" : ""}
                    onClick={() => D("1989")}
                  >
                    1989
                  </button>
                  <button
                    className={detailEra === "2004" ? "on" : ""}
                    onClick={() => D("2004")}
                  >
                    2004
                  </button>
                </div>
                <div className="detailLayout">
                  <div
                    className="wipe"
                    onPointerMove={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      M({
                        x: ((e.clientX - r.left) / r.width) * 100,
                        y: ((e.clientY - r.top) / r.height) * 100,
                      });
                    }}
                  >
                    <img src={img("1989")} alt="1989 before" />
                    <img
                      className="after"
                      style={{ clipPath: `inset(0 0 0 ${split}%)` }}
                      src={img("2004")}
                      alt="2004 after"
                    />
                    <div className="divider" style={{ left: split + "%" }}>
                      <span>
                        <ChevronLeft />
                        <ChevronRight />
                      </span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="97"
                      value={split}
                      aria-label="Before and after comparison"
                      onChange={(e) => B(+e.target.value)}
                    />
                    <button
                      className="magnifier"
                      onClick={() => Z(detailEra)}
                      aria-label="Open zoom viewer"
                      style={{
                        backgroundImage: `url(${img(detailEra)})`,
                        backgroundPosition: `${magnify.x}% ${magnify.y}%`,
                      }}
                    >
                      <span>＋</span>
                    </button>
                  </div>
                  <aside>
                    <b>DETAILS COMPARED</b>
                    {[
                      ["Pixel detail", "(8 × 8 → 32 × 32+)"],
                      ["Colour palette", "(4 colours → 256+)"],
                      ["Screen clarity", "(sharper, cleaner)"],
                      ["Visual detail", "(more expressive)"],
                    ].map(([a, b]) => (
                      <p key={a}>
                        <i />
                        {a}
                        <small>{b}</small>
                      </p>
                    ))}
                    <button className="textNext" onClick={() => go(6)}>
                      Continue →
                    </button>
                  </aside>
                </div>
              </>
            )}
            {page === 6 && (
              <>
                <div className="observeLayout">
                  <div className="observeImages">
                    {years.map((y) => (
                      <Thumb key={y} y={y} onClick={() => Z(y)} />
                    ))}
                  </div>
                  <div className="observation">
                    <b>Select all the differences you noticed:</b>
                    {[
                      "Graphics quality (sharper, more detailed)",
                      "Colour palette (more colours, brighter)",
                      "Background / environment (more complex)",
                      "Character design (more detailed)",
                      "Animation (smoother movement)",
                      "Visual effects (lighting, shadows, etc.)",
                      "Other (please specify)",
                    ].map((x, i) => (
                      <label key={x}>
                        <input
                          type="checkbox"
                          checked={checks.includes(i)}
                          onChange={() =>
                            C(
                              checks.includes(i)
                                ? checks.filter((c) => c !== i)
                                : [...checks, i],
                            )
                          }
                        />
                        {x}
                      </label>
                    ))}
                    <label className="thoughts" htmlFor="notes">
                      Additional thoughts (optional):
                    </label>
                    <textarea
                      id="notes"
                      placeholder="Share what you noticed…"
                      maxLength="300"
                      value={notes}
                      onChange={(e) => N(e.target.value)}
                    />
                    <small className="count">{notes.length} / 300</small>
                  </div>
                </div>
                <footer>
                  <button className="secondary" onClick={() => go(5)}>
                    ← &nbsp; Back
                  </button>
                  <button className="primary" onClick={() => go(7)}>
                    Continue &nbsp; →
                  </button>
                </footer>
              </>
            )}
            {page === 7 && (
              <>
                <h3>Key Changes Over Time</h3>
                <div className="reviewGrid">
                  {years.map((y, i) => (
                    <div key={y}>
                      <Thumb y={y} onClick={() => Z(y)} />
                      <b>
                        {
                          [
                            "Simple Beginnings",
                            "More Colour",
                            "Richer Experience",
                          ][i]
                        }
                      </b>
                      <ul>
                        {[
                          [
                            "Fewer pixels",
                            "Limited colours",
                            "Simple backgrounds",
                            "Creative gameplay",
                          ],
                          [
                            "More colours",
                            "Richer environments",
                            "More detailed sprites",
                            "Smoother animation",
                          ],
                          [
                            "Higher resolution",
                            "Greater visual detail",
                            "More immersive worlds",
                            "Same core game, evolved",
                          ],
                        ][i].map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <h3 className="question">
                  Which comparison method helped you most?
                </h3>
                <div className="preferences">
                  {["Side by side", "Timeline", "Before / After"].map(
                    (p, i) => (
                      <label key={p} className={pref === p ? "selected" : ""}>
                        <img src={img(years[i])} alt="" />
                        <span>
                          <b>{p}</b>
                          <small>
                            {
                              [
                                "View two or more versions at the same time.",
                                "Slide through different years.",
                                "Drag to compare the same scene.",
                              ][i]
                            }
                          </small>
                        </span>
                        <input
                          name="preference"
                          type="radio"
                          checked={pref === p}
                          onChange={() => F(p)}
                        />
                      </label>
                    ),
                  )}
                </div>
                <div className="reviewFooter">
                  <button onClick={() => go(6)}>← Back</button>
                  <button
                    onClick={() => {
                      V(true);
                      tone(1000);
                    }}
                  >
                    Finish experience →
                  </button>
                </div>
              </>
            )}
          </div>
          {finished && (
            <div className="complete">
              <div>
                <p className="eyebrow">ONE TIMELINE. THREE WORLDS.</p>
                <h2>Thanks for playing.</h2>
                <p>
                  {wins.length} / 3 eras completed · {checks.length}{" "}
                  observations saved
                </p>
                <p>
                  Your preference: <b>{pref}</b>
                </p>
                <button className="primary" onClick={() => go(1)}>
                  Play again →
                </button>
                <button className="secondary" onClick={() => V(false)}>
                  Back to review
                </button>
              </div>
            </div>
          )}

          {menu && (
            <div className="drawerScrim" onClick={() => Menu(false)}>
              <nav
                className="drawer"
                id="page-navigation"
                aria-label="Experience pages"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    Menu(false);
                    menuToggle.current?.focus();
                  }
                  if (e.key === "Tab") {
                    const buttons = [
                      ...e.currentTarget.querySelectorAll("button"),
                    ];
                    const first = buttons[0],
                      last = buttons.at(-1);
                    if (e.shiftKey && document.activeElement === first) {
                      e.preventDefault();
                      last.focus();
                    } else if (!e.shiftKey && document.activeElement === last) {
                      e.preventDefault();
                      first.focus();
                    }
                  }
                }}
              >
                <div className="drawerTitle">
                  <span>EXPLORE THE EXPERIENCE</span>
                  <button
                    autoFocus
                    aria-label="Close navigation"
                    onClick={() => {
                      Menu(false);
                      menuToggle.current?.focus();
                    }}
                  >
                    <X />
                  </button>
                </div>
                {names.map((n, i) => (
                  <button
                    key={n}
                    className={page === i ? "active" : ""}
                    onClick={() => go(i)}
                    aria-label={`${i + 1} ${n}`}
                    aria-current={page === i ? "page" : undefined}
                  >
                    <small>{String(i + 1).padStart(2, "0")}</small>
                    <span>{n}</span>
                    <ChevronRight />
                  </button>
                ))}
                <p>ONE GAME. THREE GENERATIONS.</p>
              </nav>
            </div>
          )}
          {zoom && <Zoom year={zoom} close={() => Z(null)} />}
        </article>
      </div>
    </main>
  );
}
function Zoom({ year, close }) {
  const [z, Z] = useState(3),
    [pos, P] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Pixel detail viewer"
      onClick={close}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <header>
          <b>{year} · PIXEL DETAIL</b>
          <button autoFocus onClick={close} aria-label="Close detail viewer">
            Close ×
          </button>
        </header>
        <div
          className="zoomImage"
          style={{
            backgroundImage: `url(${img(year)})`,
            backgroundSize: `${z * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
          }}
          onPointerMove={(e) => {
            let r = e.currentTarget.getBoundingClientRect();
            P({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }}
        />
        <label>
          Zoom {z}×{" "}
          <input
            type="range"
            min="1"
            max="8"
            step=".5"
            value={z}
            onChange={(e) => Z(+e.target.value)}
          />
        </label>
        <p>Move the mouse to inspect the pixels. Escape to close.</p>
      </div>
    </div>
  );
}

function Landscape({ year }) {
  return (
    <div
      className={"landscape landscape" + year}
      role="img"
      aria-label={`${year} seamless game scene`}
    >
      <img className="landscapeBg" src={A + year + "-landscape.png"} alt="" />
      <div
        className="landscapeFloor"
        style={{ backgroundImage: `url(${A + year + "-tile.png"})` }}
      />
      <img className="landscapeHero" src={A + "sprite.png"} alt="" />
      <img className="landscapeCoin" src={A + year + "-coin.png"} alt="" />
      <img className="landscapeBlock" src={A + year + "-block.png"} alt="" />
    </div>
  );
}
