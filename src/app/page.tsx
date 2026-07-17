import { GlassStrokePrototype } from "@/components/home/GlassStrokePrototype";
import { HomepageFavorites } from "@/components/home/HomepageFavorites";
import { HomepageInterlude } from "@/components/home/HomepageInterlude";
import { HomepageEnding } from "@/components/home/OceanEnding";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.sky} aria-hidden="true" />
      <div className={styles.content}>
        <GlassStrokePrototype />
        <HomepageFavorites />
        <HomepageInterlude />
        <HomepageEnding />
      </div>
    </div>
  );
}
