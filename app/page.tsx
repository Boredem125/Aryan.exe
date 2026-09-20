import { catalogue } from "@/lib/game/nodes";
import { Landing } from "@/components/terminal/Landing";

/* Server component. catalogue() is public by design, but lib/game/nodes
   must never be imported from a client component — it pulls in the tactic
   patterns, which would hand every visitor the answer key. Only the
   serialised rows cross to the browser. */
export default function Home() {
  return <Landing rows={catalogue()} />;
}
