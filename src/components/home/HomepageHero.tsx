import { LiquidIdentity } from "./LiquidIdentity";
import { ThemeToggle } from "./ThemeToggle";

const artists = [
  { name: "Taylor Swift", note: "喜欢的歌手", tone: "swift" },
  { name: "Aqours", note: "喜欢的歌手", tone: "aqours" },
  { name: "徐佳莹", note: "喜欢的歌手", tone: "lala" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M8.1 10.6c0-3 2.3-5.1 5-5.1 3.7 0 5.7 4.3 7.4 7.4 1.3 2.3 2.4 4.2 4 4.2 1.2 0 2.2-1 2.2-2.4s-.9-2.4-2.2-2.4c-1.5 0-2.7 1.6-4 3.8-1.8 3.1-3.8 7.4-7.4 7.4-2.8 0-5-2.1-5-5.1 0-2.9 2.2-5.1 5-5.1 1.3 0 2.4.5 3.4 1.4" />
      </svg>
    </span>
  );
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <p>{children}</p>
    </div>
  );
}

export function HomepageHero() {
  return (
    <main className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />

      <header className="site-header liquid-glass">
        <a className="site-brand" href="#top" aria-label="aqhours 首页">
          <BrandMark />
          <span>aqhours</span>
        </a>

        <nav className="site-nav" aria-label="主导航">
          <a href="#about">关于</a>
          <a href="#create">创造</a>
          <a href="#music">音乐</a>
          <a href="#play">游玩</a>
          <a href="#site">本站</a>
        </nav>

        <div className="header-actions">
          <span className="location-status"><i /> Nanchang</span>
          <ThemeToggle />
        </div>
      </header>

      <section id="top" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy intro-reveal">
          <p className="hero-kicker">Hello from Nanchang · Personal homepage</p>
          <h1 id="hero-title">
            你好，
            <br />
            我是 <span>aqhours</span>。
          </h1>
          <p className="hero-lead">
            一个生活在江西南昌，
            <strong>有力气、爱创造、按专辑听歌</strong>
            的青春男大。
          </p>
          <p className="hero-description">
            我在计算机科学与技术的世界里继续读书，也喜欢把突然出现的想法做成网站。
            这里介绍我，也记录那些让我感到快乐、获得成就感的事情。
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#about">
              认识我
              <ArrowIcon />
            </a>
            <a className="quiet-link" href="#site">关于这个网站</a>
          </div>

          <div className="identity-pills" aria-label="个人关键词">
            <span className="liquid-chip">江西 · 南昌</span>
            <span className="liquid-chip">CS Master</span>
            <span className="liquid-chip">100,000 min / year</span>
          </div>
        </div>

        <div className="hero-art intro-reveal intro-delay-one">
          <LiquidIdentity />
        </div>
      </section>

      <section id="about" className="content-section about-section">
        <SectionLabel number="01">About me</SectionLabel>
        <div className="about-layout">
          <div className="section-copy">
            <p className="section-kicker">现在的我</p>
            <h2>有力气的青春，<br />正在南昌发生。</h2>
            <p>
              现在我的日常位于江西南昌。我喜欢计算机，也仍然对许多新东西保持好奇。
              学习、创造、听歌和游戏，共同组成了我正在经历的生活。
            </p>
          </div>

          <div className="study-path liquid-glass">
            <div className="study-path-head">
              <span>LEARNING PATH</span>
              <i>2 stages</i>
            </div>
            <div className="study-stage">
              <span className="stage-dot stage-dot-done" />
              <div>
                <small>本科 · Bachelor&apos;s degree</small>
                <strong>计算机科学与技术</strong>
              </div>
              <span className="stage-status">COMPLETED</span>
            </div>
            <div className="study-connector" aria-hidden="true"><span /></div>
            <div className="study-stage">
              <span className="stage-dot stage-dot-now" />
              <div>
                <small>现在 · Master&apos;s student</small>
                <strong>计算机科学与技术 · 硕士在读</strong>
              </div>
              <span className="stage-status stage-status-now">NOW</span>
            </div>
          </div>
        </div>
      </section>

      <section id="create" className="content-section create-section">
        <SectionLabel number="02">Create</SectionLabel>
        <div className="create-panel feature-panel">
          <div className="create-copy">
            <p className="section-kicker">Create something</p>
            <h2>把脑海里的想法，<br />做成一个网站。</h2>
            <p>
              我喜欢做具有创造性的事情。开发网站时，想法会逐渐变成结构、颜色、交互和真实可用的页面。
              这个过程给我带来快乐，也给我实实在在的成就感。
            </p>
            <div className="create-formula" aria-label="创作过程">
              <span>IDEA</span><i>→</i><span>DESIGN</span><i>→</i><span>CODE</span><i>→</i><strong>JOY</strong>
            </div>
          </div>

          <div className="browser-art liquid-glass" aria-label="一个正在生成的个人网站界面示意图">
            <div className="browser-bar">
              <div><i /><i /><i /></div>
              <span>aqhours.cn</span>
              <em>↗</em>
            </div>
            <div className="browser-canvas">
              <div className="browser-sidebar">
                <BrandMark />
                <span className="sidebar-line sidebar-line-active" />
                <span className="sidebar-line" />
                <span className="sidebar-line sidebar-line-short" />
              </div>
              <div className="browser-page">
                <span className="page-label">BUILDING SOMETHING I LIKE</span>
                <div className="page-title-line" />
                <div className="page-title-line page-title-line-short" />
                <div className="page-grid">
                  <span /><span /><span />
                </div>
                <div className="cursor-badge">CREATE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="music" className="content-section music-section">
        <SectionLabel number="03">Music</SectionLabel>
        <div className="music-panel feature-panel">
          <div className="music-stat">
            <p className="section-kicker">Listening time / year</p>
            <div className="music-number">100,000</div>
            <div className="music-unit">MINUTES <span>≈ 1,667 HOURS</span></div>
            <p className="music-statement">
              我喜欢按照专辑 💽 听音乐。让一首歌自然地走向下一首，完整进入一段声音创造的世界。
            </p>
          </div>

          <div className="album-shelf" aria-label="喜欢的歌手">
            <div className="shelf-title"><span>FAVORITE ARTISTS</span><i>03</i></div>
            {artists.map((artist, index) => (
              <article className={`artist-card artist-${artist.tone}`} key={artist.name}>
                <div className="album-sleeve">
                  <span className="album-index">0{index + 1}</span>
                  <strong>{artist.name}</strong>
                  <small>{artist.note}</small>
                </div>
                <div className="vinyl" aria-hidden="true"><span /></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="play" className="content-section play-section">
        <SectionLabel number="04">Play</SectionLabel>
        <div className="play-panel feature-panel">
          <div className="nikki-world" aria-hidden="true">
            <span className="world-moon" />
            <span className="world-cloud world-cloud-one" />
            <span className="world-cloud world-cloud-two" />
            <span className="world-island world-island-back" />
            <span className="world-island world-island-front" />
            <span className="world-path" />
            <div className="wardrobe-card liquid-glass">
              <span>LOOK 07</span>
              <div><i /><i /><i /><i /></div>
              <small>自由搭配中</small>
            </div>
          </div>

          <div className="play-copy">
            <p className="section-kicker">Infinity Nikki</p>
            <h2>自由搭配，<br />跳向更远的世界。</h2>
            <p>
              我喜欢玩《无限暖暖》。自由搭配带来表达的乐趣，跳跳乐让探索有了节奏，
              而开放世界里总有新的角落值得走过去看看。
            </p>
            <div className="play-tags">
              <span>自由搭配</span>
              <span>跳跳乐</span>
              <span>探索大世界</span>
            </div>
          </div>
        </div>
      </section>

      <section id="site" className="content-section site-section">
        <SectionLabel number="05">About this site</SectionLabel>
        <div className="site-intro">
          <div>
            <p className="section-kicker">aqhours.cn</p>
            <h2>
              <span>这是我的个人主页，</span>
              <span>也是一处数字住处。</span>
            </h2>
          </div>
          <p>
            这里介绍我自己，也会慢慢装下我的想法、创造、音乐与游戏体验。
            我希望它一直保留个人的温度，并随着我正在经历的生活继续生长。
          </p>
        </div>

        <blockquote className="quote-panel liquid-glass">
          <BrandMark />
          <p className="hero-serif">
            <span>“与你相伴的时光，如此珍贵，如此难忘。”</span>
            <span>“想要紧紧抱着，不愿放手。”</span>
          </p>
          <footer>THE FEELING I WANT TO KEEP</footer>
        </blockquote>
      </section>

      <footer className="site-footer">
        <a className="site-brand" href="#top">
          <BrandMark />
          <span>aqhours</span>
        </a>
        <p>生活在南昌 · 学习计算机 · 保持创造</p>
        <span>© 2026 aqhours.cn</span>
      </footer>
    </main>
  );
}
