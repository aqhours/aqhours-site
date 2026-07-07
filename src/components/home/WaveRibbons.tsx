const wavePaths = [
  "M0 94 C80 52 134 144 222 98 C314 49 375 130 458 86 C548 39 621 117 710 76 C800 33 891 104 980 72 C1082 34 1144 104 1230 71 C1300 45 1369 54 1440 88 V220 H0 Z",
  "M0 130 C90 83 156 171 251 128 C340 88 411 151 499 112 C601 66 672 145 764 108 C853 73 930 138 1022 102 C1136 57 1225 124 1323 92 C1366 78 1405 84 1440 101 V220 H0 Z",
  "M0 152 C97 112 181 182 279 150 C381 117 442 172 548 138 C654 104 738 171 842 138 C956 101 1016 166 1127 133 C1230 103 1329 129 1440 118 V220 H0 Z",
];

export function WaveRibbons() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[34vh] min-h-[210px] overflow-hidden" aria-hidden="true">
      <svg
        className="wave-layer wave-layer-a absolute bottom-[-35px] left-[-8%] h-full w-[116%]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path d={wavePaths[0]} fill="#12C7FF" opacity="0.22" />
      </svg>
      <svg
        className="wave-layer wave-layer-b absolute bottom-[-20px] left-[-10%] h-[82%] w-[120%]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path d={wavePaths[1]} fill="#009DFF" opacity="0.34" />
        <path
          d="M73 122 C138 96 185 144 250 119 C318 93 362 135 421 115 C483 92 538 128 606 106 C676 83 732 125 802 103 C878 79 940 121 1014 99 C1098 74 1166 112 1240 94 C1302 79 1364 84 1412 101"
          fill="none"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeWidth="7"
          opacity="0.44"
        />
      </svg>
      <svg
        className="wave-layer wave-layer-c absolute bottom-[-8px] left-[-7%] h-[66%] w-[114%]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <path d={wavePaths[2]} fill="#5EEAD4" opacity="0.4" />
        <path
          d="M185 147 C237 130 282 157 335 142 C404 123 468 151 538 133 C606 116 668 144 734 127 C797 111 862 141 928 123 C1018 100 1087 129 1162 113 C1227 100 1295 108 1356 123"
          fill="none"
          stroke="#EFFFFF"
          strokeLinecap="round"
          strokeWidth="5"
          opacity="0.5"
        />
      </svg>
      <svg className="absolute bottom-0 left-0 h-[38%] w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          d="M0 70 C106 36 172 96 286 68 C386 43 480 89 584 62 C704 31 792 86 906 58 C1021 29 1133 70 1244 49 C1325 34 1385 43 1440 58 V120 H0 Z"
          fill="#FFFFFF"
          opacity="0.82"
        />
        <circle className="hero-foam-sparkle" cx="188" cy="57" r="4" fill="#AEE4F8" opacity="0.52" />
        <circle className="hero-foam-sparkle" cx="1040" cy="50" r="3" fill="#AEE4F8" opacity="0.58" />
        <circle className="hero-foam-sparkle" cx="1216" cy="42" r="5" fill="#AEE4F8" opacity="0.5" />
      </svg>
    </div>
  );
}
