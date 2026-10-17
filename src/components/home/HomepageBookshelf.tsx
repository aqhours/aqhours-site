"use client";

import { useState } from "react";
import styles from "./HomepageBookshelf.module.css";

const BOOKS = [
  {
    id: "anne",
    title: "绿山墙的安妮",
    author: "L. M. Montgomery",
    category: "文学 · 成长",
    description:
      "红头发的安妮来到爱德华王子岛，在绿山墙的四季里，把想象变成生活的一部分。这是一个关于成长、友谊与归属的故事。",
    brief: "在爱德华王子岛，和安妮一起走过想象、友谊与成长的四季。",
    note: "一个充满想象力的世界。",
  },
  {
    id: "systems",
    title: "深入理解计算机系统",
    author: "Randal E. Bryant · David R. O’Hallaron",
    category: "计算机 · 系统",
    description:
      "从程序员的视角，沿着一个程序走进计算机：信息如何表示，指令如何执行，内存如何组织，以及软件与硬件如何协作。",
    brief: "从程序员的视角，理解信息、处理器、内存，以及软硬件之间的协作。",
    note: "理解代码背后的世界。",
  },
] as const;

type Book = (typeof BOOKS)[number];

function AnneCover() {
  return (
    <>
      <span className={styles.coverEyebrow}>L. M. MONTGOMERY</span>
      <span className={styles.anneEnglish}>Anne of<br />Green Gables</span>
      <span className={styles.anneTitle}>绿山墙的安妮</span>
      <svg className={styles.anneArtwork} viewBox="0 0 240 190" fill="none">
        <circle cx="158" cy="54" r="28" fill="#dfbb76" />
        <path d="M-20 158C37 106 74 119 119 135C166 152 203 98 260 124V206H-20Z" fill="#69856a" />
        <path d="M-12 179C54 141 102 157 147 146C193 135 233 153 255 170V206H-12Z" fill="#a4ad83" />
        <path d="M97 137V100L125 79L154 100V137Z" fill="#e9e2c9" />
        <path d="M88 101L125 72L163 101H151L125 83L101 101Z" fill="#233f34" />
        <path d="M143 84V72H150V91Z" fill="#b97f5b" />
        <path d="M120 137V116H131V137" fill="#ab7655" />
        <path d="M105 104H113V114H105ZM138 104H146V114H138Z" fill="#658375" />
        <path d="M125 138C109 151 134 155 113 171C103 179 90 185 85 190" stroke="#d5cb9f" strokeWidth="7" />
        <g stroke="#d8d6ac" strokeWidth="1.3" strokeLinecap="round">
          <path d="M30 180C44 147 34 93 51 47M40 138L21 117M43 114L62 94M44 95L31 77M47 72L65 56M206 185C190 151 201 119 186 88M198 148L216 129M198 130L180 115" />
          <path d="M21 117C17 100 9 99 10 105C10 112 17 117 21 117ZM62 94C63 78 73 77 72 83C71 89 66 93 62 94ZM31 77C18 76 17 64 24 66C29 68 31 72 31 77ZM65 56C66 44 74 42 74 48C73 52 70 55 65 56ZM216 129C218 116 225 115 225 121C224 125 220 129 216 129ZM180 115C169 113 168 104 173 106C177 108 180 111 180 115Z" fill="#d8d6ac" />
        </g>
        <g fill="#dfbb76">
          <circle cx="51" cy="46" r="3" /><circle cx="186" cy="88" r="3" />
          <circle cx="38" cy="155" r="2" /><circle cx="209" cy="167" r="2" />
        </g>
      </svg>
      <span className={styles.coverFootnote}>AN IMAGINATION WITHOUT END</span>
    </>
  );
}

function SystemsCover() {
  return (
    <>
      <span className={styles.coverEyebrow}>BRYANT / O’HALLARON</span>
      <span className={styles.systemsMonogram}>CS<span>:</span>APP</span>
      <span className={styles.systemsTitle}>深入理解<br />计算机系统</span>
      <span className={styles.systemsEnglish}>Computer Systems<br />A Programmer’s Perspective</span>
      <svg className={styles.systemsArtwork} viewBox="0 0 240 120" fill="none">
        <g stroke="#d6b5a3" strokeOpacity=".55" strokeWidth="1">
          <path d="M28 41H79M111 41H160M192 41H224M63 41V84H176V57M128 84V108M0 84H46M193 84H240" />
          <path d="M79 25H111V57H79ZM160 25H192V57H160ZM46 76H63V93H46ZM176 76H193V93H176Z" />
          <path d="M87 33H103V49H87Z" fill="#d6b5a3" fillOpacity=".12" />
          <path d="M83 19V25M91 19V25M99 19V25M107 19V25M83 57V63M91 57V63M99 57V63M107 57V63" />
          <circle cx="28" cy="41" r="3" /><circle cx="224" cy="41" r="3" />
          <circle cx="128" cy="108" r="3" />
        </g>
        <g fill="#d6b5a3" fontFamily="monospace" fontSize="6" letterSpacing="1">
          <text x="23" y="28">INPUT</text><text x="163" y="15">MEMORY</text>
          <text x="202" y="28">OUTPUT</text><text x="85" y="78">PROCESS</text>
        </g>
      </svg>
      <span className={styles.coverFootnote}>A LOOK BENEATH THE SURFACE</span>
    </>
  );
}

function ShelfBook({ book, index }: { book: Book; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const descriptionId = `bookshelf-${book.id}-description`;

  return (
    <li className={styles.volume} data-book={book.id}>
      <button
        type="button"
        className={styles.bookButton}
        data-flipped={flipped}
        aria-pressed={flipped}
        aria-label={`${flipped ? "翻回封面" : "查看背面简介"}：《${book.title}》`}
        aria-describedby={flipped ? descriptionId : undefined}
        onClick={() => setFlipped((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setFlipped(false);
        }}
      >
        <span className={styles.bookShadow} aria-hidden="true" />
        <span className={styles.bookObject} aria-hidden="true">
          <span className={styles.bookFront}>
            {book.id === "anne" ? <AnneCover /> : <SystemsCover />}
          </span>
          <span className={styles.bookBack}>
            <span className={styles.backCategory}>{book.category}</span>
            <span className={styles.backTitle}>{book.title}</span>
            <span className={styles.backDescription}>{book.description}</span>
            <span className={styles.backBrief}>{book.brief}</span>
            <span className={styles.backNote}>{book.note}</span>
            <span className={styles.backSignature}>ON AQHOURS’ BOOKSHELF</span>
          </span>
          <span className={styles.bookSpine}>
            <span>{book.title}</span>
            <span className={styles.spineNumber}>0{index + 1}</span>
          </span>
          <span className={styles.bookPages} />
          <span className={styles.bookTop} />
          <span className={styles.bookBottom} />
        </span>
        <span id={descriptionId} className={styles.srOnly} aria-hidden={!flipped}>
          {book.description}
        </span>
      </button>
      <div className={styles.bookMeta}>
        <span className={styles.bookCategory}>{book.category}</span>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
      </div>
    </li>
  );
}

export function HomepageBookshelf() {
  return (
    <section
      id="homepage-bookshelf"
      className={styles.bookshelf}
      aria-labelledby="homepage-bookshelf-title"
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>MY BOOKSHELF</span>
          <h2 id="homepage-bookshelf-title">Books I keep close.</h2>
          <p>书页之间，另一个世界。</p>
        </header>
        <div className={styles.shelfStage}>
          <ol className={styles.books} aria-label="喜欢的书" data-native-wheel="true">
            {BOOKS.map((book, index) => <ShelfBook key={book.id} book={book} index={index} />)}
          </ol>
          <div className={styles.shelf} aria-hidden="true">
            <span className={styles.shelfEdge} />
          </div>
        </div>
        <div className={styles.caption}>
          <span>{String(BOOKS.length).padStart(2, "0")} BOOKS & COUNTING</span>
          <span className={styles.interactionHint}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12.5 5A5 5 0 1 0 13 10M12.5 5H9M12.5 5V1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.defaultHint}>点击书封，翻到背面</span>
            <span className={styles.swipeHint}>左右滑动 · 点击翻面</span>
          </span>
        </div>
      </div>
    </section>
  );
}
