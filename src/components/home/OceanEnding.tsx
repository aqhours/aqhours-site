import styles from "./OceanEnding.module.css";

const PUBLIC_SECURITY_RECORD_URL =
  "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=2022005856号";
const PUBLIC_SECURITY_ICON_URL =
  "https://jgox-image-1316409677.cos.ap-guangzhou.myqcloud.com/blog/beian.png";
const ICP_RECORD_URL = "https://beian.miit.gov.cn/";

function DesignCredit() {
  return (
    <div className={styles.credit} aria-label="Co-created with Sol, GPT-5 Codex">
      <span className={styles.creditLabel}>Co-created with</span>
      <span className={styles.creditSignature} aria-hidden="true">
        <span className={styles.solMark} />
        <span className={styles.creditName}>Sol</span>
        <span className={styles.creditSlash}>/</span>
        <span className={styles.creditModel}>GPT-5.6</span>
      </span>
    </div>
  );
}

export function HomepageEnding() {
  return (
    <section
      id="homepage-ending"
      className={styles.ending}
      aria-labelledby="homepage-ending-title"
    >
      <h2 id="homepage-ending-title" className={styles.srOnly}>
        Homepage ending
      </h2>

      <footer className={styles.footer} aria-label="网站备案与版权信息">
        <div className={styles.legal}>
          <span>© 2026 aqhours</span>
          <span className={styles.separator} aria-hidden="true">|</span>
          <a
            className={styles.publicSecurityLink}
            href={PUBLIC_SECURITY_RECORD_URL}
            target="_blank"
            rel="noreferrer"
          >
            <img
              className={styles.publicSecurityIcon}
              src={PUBLIC_SECURITY_ICON_URL}
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            赣ICP备2022005856号
          </a>
          <span className={styles.separator} aria-hidden="true">|</span>
          <a href={ICP_RECORD_URL} target="_blank" rel="noreferrer">
            赣ICP备2022005856号-2
          </a>
        </div>

        <DesignCredit />
      </footer>
    </section>
  );
}
