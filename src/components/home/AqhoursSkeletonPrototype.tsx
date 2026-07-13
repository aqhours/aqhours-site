import styles from "./AqhoursSkeletonPrototype.module.css";

// PROTOTYPE 01 — throw away or absorb after the Aqhours letter skeleton is approved.
const AQHOURS_SKELETON_PATH = [
  "M 78 560",
  "C 138 370 208 118 300 78",
  "C 360 50 414 410 456 560",
  "C 444 480 380 332 270 320",
  "C 350 318 445 334 520 326",
  "C 532 230 600 180 676 215",
  "C 760 255 760 400 700 460",
  "C 640 515 535 485 525 395",
  "C 515 300 600 240 675 275",
  "C 735 305 730 390 700 450",
  "C 675 520 675 600 730 625",
  "C 780 645 805 520 830 400",
  "C 850 300 862 165 900 118",
  "C 938 82 920 370 920 455",
  "C 935 360 980 285 1040 300",
  "C 1100 315 1090 440 1100 455",
  "C 1120 330 1190 265 1260 300",
  "C 1330 335 1330 450 1260 485",
  "C 1190 520 1120 450 1140 370",
  "C 1160 300 1260 295 1290 360",
  "C 1305 410 1310 470 1345 480",
  "C 1370 485 1375 350 1385 310",
  "C 1370 410 1390 500 1450 490",
  "C 1510 480 1510 350 1520 310",
  "C 1515 400 1515 480 1560 480",
  "C 1590 480 1590 340 1600 310",
  "C 1605 370 1610 310 1660 315",
  "C 1690 320 1700 350 1700 380",
  "C 1705 300 1780 275 1820 315",
  "C 1855 350 1810 390 1755 408",
  "C 1705 428 1725 495 1790 510",
  "C 1855 525 1900 480 1915 430",
].join(" ");

export function AqhoursSkeletonPrototype() {
  return (
    <main className={styles.prototype}>
      <h1 className={styles.srOnly}>Aqhours</h1>

      <div className={styles.stage} aria-hidden="true">
        <svg
          className={styles.letterform}
          viewBox="0 0 1970 700"
          role="presentation"
          preserveAspectRatio="xMidYMid meet"
        >
          <path className={styles.skeletonShadow} d={AQHOURS_SKELETON_PATH} />
          <path className={styles.skeleton} d={AQHOURS_SKELETON_PATH} />
        </svg>
      </div>

      <aside className={styles.prototypeNote} aria-label="原型状态">
        <span>PROTOTYPE 01</span>
        <strong>完整连续 Aqhours 字母骨架</strong>
        <small>当前只确认轮廓、连接与可读性</small>
      </aside>
    </main>
  );
}
