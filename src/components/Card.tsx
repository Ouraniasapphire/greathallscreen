import { JSX } from "solid-js";
import styles from "../App.module.css";

export default function Card(props: { children: any }) {
  return <div class={styles.card}>{props.children}</div>;
}
