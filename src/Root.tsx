import "./index.css";
import { Composition } from "remotion";
import { AmAd, amDur } from "./ads/antimarketing/AmAd";

export const RemotionRoot: React.FC = () => (
  <>
    {(["crossfit", "besteira", "cheiro", "inexplorado", "teste"] as const).map((id) => (
      <Composition key={id} id={`am-${id}`} component={AmAd} durationInFrames={amDur(id)} fps={30} width={1080} height={1920} defaultProps={{ id }} />
    ))}
  </>
);
