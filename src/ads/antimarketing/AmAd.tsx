// ADS ANTIMARKETING · topo de funil (16/11/2026). Pedido do Marcos: "faz os ads... edição de baixa cognição dopaminérgica".
// 4 cortes do podcast da Kiwify (fala dele, áudio tratado "natural", montado em work/am-ads/montar.mjs a 1,1×)
// + 1 ad narrado (voz Adam, sem rosto) no palco azul-marinho do slide da VSL.
// Baixa cognição: UMA coisa por vez na tela, legenda de 1 a 3 palavras com a palavra da vez acesa, objeto literal
// entrando NA palavra. Dopamina: troca seca de plano a cada frase (aberto / médio / fechado, sempre muda na emenda),
// zoom animado entre planos + câmera chegando devagar, moldura de gravação (REC), mola no que entra, barra de progresso. Sem tremor (Marcos 16/11). Sem trilha, sem SFX (Marcos 25/09).
import React from "react";
import { getRemotionEnvironment } from "remotion";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, spring, Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { CONFIG, type AdId, type Ins } from "./config";

import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
const { fontFamily: DISP } = loadBricolage("normal", { weights: ["800"], subsets: ["latin"] });
const { fontFamily: SANS } = loadFont("normal", { weights: ["500", "700", "800", "900"], subsets: ["latin", "latin-ext"] });
export const FPS = 30;
const W = 1080, H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = { amarelo: "#FFD60A", verde: "#2BE37A", vermelho: "#FF3B3B", branco: "#FFFFFF", navy: "#060B1F", azul: "#3D7BFF", violeta: "#8B5CFF" };

export type AmAdProps = { id: AdId; conf?: boolean };
export const amDur = (id: AdId) => Math.ceil(CONFIG[id].words.duration * FPS) + 8;

type Wd = { word: string; start: number; end: number };
const useT = () => useCurrentFrame() / FPS;
const mola = (t: number, em: number, cfg = { damping: 11, stiffness: 220, mass: 0.5 }) =>
  t < em ? 0 : spring({ frame: Math.round((t - em) * FPS), fps: FPS, config: cfg });

// ── planos: troca seca na emenda e no começo de frase nova (≥ 1,4 s desde a última troca) ──
type Plano = { de: number; nivel: "A" | "M" | "F"; quem: "m" | "b" };
function planos(id: AdId): Plano[] {
  const cfg = CONFIG[id]; const ws = cfg.words.words as Wd[];
  const quemEm = (t: number) => (cfg.bruna.some(([a, b]) => t >= a - 0.05 && t < b) ? "b" : "m");
  const cortes = new Set<number>(cfg.words.emendas.map((x: number) => +x.toFixed(2)));
  const marcas: number[] = [0];
  ws.forEach((w, i) => {
    const prev = ws[i - 1];
    const fimFrase = prev && /[.?!:]$/.test(prev.word);
    const ehEmenda = [...cortes].some((c) => Math.abs(c - w.start) < 0.35);
    const trocaQuem = prev && quemEm(prev.start) !== quemEm(w.start);
    const t = Math.max(0, w.start - 0.08);
    if (ehEmenda || trocaQuem || (fimFrase && t - marcas[marcas.length - 1] >= 1.4)) if (t - marcas[marcas.length - 1] > 0.5) marcas.push(t);
  });
  const ciclo: Plano["nivel"][] = ["A", "M", "F", "M"];
  return marcas.map((de, k) => {
    const quem = quemEm(de + 0.1);
    const nivel = k === 0 ? cfg.nivel0 ?? "M" : quem === "b" ? (k % 2 ? "M" : "F") : ciclo[k % ciclo.length];
    return { de, nivel, quem };
  });
}
const ESCALA = { A: 1.28, M: 1.75, F: 2.15 };

// Marcos 16/11: "tira essa vibração da tela... coloca zoom in chegando e out". Sem tranco: a troca de plano vira um
// ZOOM animado (0,45 s, entra e sai suave) e, dentro do plano, a câmera vai chegando devagar (+5 %).
const TRANS = 0.45, CHEGA = 0.05;
// render no GitHub Actions: o vídeo-base vem da VPS (não vai pro git)
const REMOTO = "https://media.srv1198551.hstgr.cloud/am-ads-render/";
type Pose = { s: number; ox: number; oy: number };
function pose(p: Plano, cfg: (typeof CONFIG)[AdId], chega: number): Pose {
  const s = ESCALA[p.nivel] * (1 + CHEGA * chega);
  const fc = cfg.focoApos && p.de >= cfg.focoApos.de - 0.3 ? cfg.focoApos : cfg.foco;
  const f = p.nivel === "A" ? { x: 0.5, y: 0.43 } : p.quem === "b" ? fc.b : fc.m;
  const alvo = p.nivel === "A" ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 0.37 };
  let ox = alvo.x * W - f.x * W * s, oy = alvo.y * H - f.y * H * s;
  ox = Math.min(0, Math.max(W - W * s, ox)); oy = Math.min(0, Math.max(H - H * s, oy));
  return { s, ox, oy };
}
const Video: React.FC<{ id: AdId; conf?: boolean }> = ({ id, conf }) => {
  const t = useT(); const cfg = CONFIG[id]; const dur = cfg.words.duration;
  const ps = React.useMemo(() => planos(id), [id]);
  const k = Math.max(0, ps.findIndex((x, i) => t >= x.de && (i === ps.length - 1 || t < ps[i + 1].de)));
  const p = ps[k], fim = k < ps.length - 1 ? ps[k + 1].de : dur;
  const chegaEm = (pl: Plano, a: number, b: number, tt: number) => Math.min(1, Math.max(0, (tt - a) / Math.max(0.5, b - a)));
  let cur = pose(p, cfg, chegaEm(p, p.de, fim, t));
  if (k > 0 && t < p.de + TRANS) {
    const ant = ps[k - 1]; const de = pose(ant, cfg, 1);
    const e = Easing.inOut(Easing.cubic)(Math.min(1, (t - p.de) / TRANS));
    cur = { s: de.s + (cur.s - de.s) * e, ox: de.ox + (cur.ox - de.ox) * e, oy: de.oy + (cur.oy - de.oy) * e };
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={conf ? staticFile(`am-ads/${id}-conf.mp4`) : getRemotionEnvironment().isStudio ? staticFile(`am-ads/${id}.mp4`) : `${REMOTO}${id}.mp4`}
        style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${cur.ox}px, ${cur.oy}px) scale(${cur.s})` }} />
      {/* escurece de leve a faixa da legenda pra ler em cima do verde */}
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.52, height: H * 0.3, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.42) 45%, rgba(0,0,0,0) 100%)" }} />
    </AbsoluteFill>
  );
};

// Moldura de GRAVAÇÃO (pedido 16/11): cantos de visor, REC piscando, contador de tempo e bateria.
const Rec: React.FC = () => {
  const t = useT(); const fr = Math.floor(t * 30) % 30, sec = Math.floor(t);
  const tc = `00:00:${String(sec).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
  const L = "7px solid #fff";
  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 40, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.7)", letterSpacing: 2 };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {[{ left: 56, top: 150, borderTop: L, borderLeft: L }, { right: 56, top: 150, borderTop: L, borderRight: L }, { left: 56, bottom: 150, borderBottom: L, borderLeft: L }, { right: 56, bottom: 150, borderBottom: L, borderRight: L }].map((c, i) =>
        <div key={i} style={{ position: "absolute", width: 96, height: 96, borderRadius: 4, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))", ...c }} />)}
      <div style={{ position: "absolute", left: 92, top: 186, display: "flex", alignItems: "center", gap: 14, ...mono }}>
        <div style={{ width: 30, height: 30, borderRadius: 15, background: C.vermelho, opacity: Math.floor(t * 1.6) % 2 === 0 ? 1 : 0.15, boxShadow: "0 0 14px rgba(255,59,59,.9)" }} />REC
      </div>
      <div style={{ position: "absolute", right: 92, top: 186, ...mono }}>{tc}</div>
      <div style={{ position: "absolute", left: 92, bottom: 184, ...mono, fontSize: 34 }}>4K · 30FPS</div>
      <div style={{ position: "absolute", right: 92, bottom: 186, display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 70, height: 34, border: "5px solid #fff", borderRadius: 6, padding: 4, display: "flex", gap: 4, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, background: "#fff" }} />)}
        </div>
        <div style={{ width: 7, height: 14, background: "#fff", borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

// ── legenda: blocos de 1 a 3 palavras, quebra em pontuação ou pausa; a palavra da vez acende ──
function blocos(ws: Wd[]) {
  const out: Wd[][] = []; let cur: Wd[] = [];
  ws.forEach((w, i) => {
    cur.push(w); const nx = ws[i + 1];
    // negação nunca fica separada do verbo (Marcos 16/11: "GASTAR DINHEIRO" sozinho virou afirmação)
    const neg = cur.some((x) => /^(não|nao|nem|nunca)$/i.test(x.word.replace(/[.,;:!?]/g, "")));
    const preso = /^(não|nao|nem|nunca|vou|vai|tá|sem)$/i.test(w.word);
    const cheio = cur.length >= (neg ? 4 : 3) || cur.map((x) => x.word).join(" ").length > (neg ? 26 : 16);
    const quebra = !nx || (!preso && (/[.?!:,;]$/.test(w.word) || cheio || nx.start - w.end > 0.28));
    if (quebra) { out.push(cur); cur = []; }
  });
  return out;
}
const limpa = (w: string) => w.replace(/[.,;:!?"“”]/g, "").toUpperCase();
const Legenda: React.FC<{ id: AdId; y?: number }> = ({ id, y = 0.665 }) => {
  const t = useT(); const cfg = CONFIG[id]; const ws = cfg.words.words as Wd[];
  const bs = React.useMemo(() => blocos(ws), [ws]);
  const k = bs.findIndex((b, i) => t >= b[0].start - 0.04 && (i === bs.length - 1 ? t < b[b.length - 1].end + 0.6 : t < bs[i + 1][0].start - 0.04));
  if (k < 0) return null;
  const b = bs[k]; const s = mola(t, b[0].start - 0.04, { damping: 12, stiffness: 260, mass: 0.45 });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: H * y, transform: `translateY(-50%) scale(${interpolate(s, [0, 1], [0.78, 1])})`, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 106, lineHeight: 1.04, letterSpacing: -1, color: C.branco, WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textShadow: "0 10px 30px rgba(0,0,0,.55)" }}>
      {b.map((w, i) => {
        const ativa = t >= w.start - 0.04;
        const chave = cfg.cores[limpa(w.word)];
        const cor = chave ?? (ativa ? C.amarelo : C.branco);
        return <span key={i} style={{ color: ativa || chave ? cor : C.branco, opacity: ativa ? 1 : 0.92 }}>{limpa(w.word)}{i < b.length - 1 ? " " : ""}</span>;
      })}
    </div>
  );
};

const Barra: React.FC<{ id: AdId }> = ({ id }) => {
  const t = useT(); const d = CONFIG[id].words.duration;
  return <div style={{ position: "absolute", left: 0, top: 0, height: 12, width: `${Math.min(1, t / d) * 100}%`, background: C.amarelo, boxShadow: "0 0 18px rgba(255,214,10,.7)" }} />;
};

// ── objetos que entram NA palavra ──
const Adesivo: React.FC<{ t: number; em: number; txt: string; cor?: string; fundo?: string; rot?: number; size?: number; y?: number; risca?: number }> = ({ t, em, txt, cor = "#111", fundo = "#fff", rot = -3, size = 64, y = 330, risca }) => {
  const s = mola(t, em <= 0 ? -0.12 : em);
  const r = risca != null ? interpolate(t, [risca, risca + 0.22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", background: fundo, color: cor, fontFamily: SANS, fontWeight: 900, fontSize: size * 1.25, lineHeight: 1.05, padding: "20px 38px", borderRadius: 20, textAlign: "center", maxWidth: 960,
        boxShadow: "0 22px 50px rgba(0,0,0,.45), 0 4px 0 rgba(0,0,0,.25)", transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [1.7, 1])})`, opacity: Math.min(1, s * 2.5) }}>
        {txt}
        {risca != null && <div style={{ position: "absolute", left: 18, top: "50%", height: 14, width: `calc(${r * 100}% - ${r * 36}px)`, background: C.vermelho, borderRadius: 7, transform: "rotate(-4deg)", boxShadow: "0 2px 8px rgba(0,0,0,.3)" }} />}
      </div>
    </div>
  );
};
const Slam: React.FC<{ t: number; em: number; txt: string; cor?: string; y?: number; size?: number }> = ({ t, em, txt, cor = C.amarelo, y = 300, size = 170 }) => {
  const s = mola(t, em, { damping: 9, stiffness: 260, mass: 0.6 });
  const flash = em <= 0.1 ? 0 : interpolate(t, [em, em + 0.12], [0.35, 0], clamp); // frame 0 sem flash (lava o quadro que segura o scroll)
  return (
    <>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: -2, lineHeight: 1, color: cor, padding: "0 30px", WebkitTextStroke: "16px #000", paintOrder: "stroke fill",
        transform: `scale(${Math.max(0.94, interpolate(s, [0, 1], [2.4, 1]))}) rotate(-4deg)`, opacity: Math.min(1, s * 3), textShadow: "0 18px 40px rgba(0,0,0,.5)" }}>{txt}</div>
    </>
  );
};
// O LOGO do site (sociedadeantimarketing.vercel.app, .logo): "ANTI" branco no bloco preto + "MARKETING" preto na moldura.
// Marcos 16/11: "o antimarketing verdinho n ficou legal, faz ele usando a mesma pegada de logo da headline do nosso site".
const Logo: React.FC<{ t: number; em: number; y?: number; size?: number }> = ({ t, em, y = 330, size = 118 }) => {
  const s = mola(t, em <= 0 ? -0.12 : em, { damping: 12, stiffness: 200, mass: 0.6 });
  const INK = "#0B0D12";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", opacity: Math.min(1, s * 2.5), transform: `scale(${Math.max(0.94, interpolate(s, [0, 1], [1.6, 1]))})` }}>
      <div style={{ display: "inline-flex", alignItems: "stretch", fontFamily: DISP, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.035em", filter: "drop-shadow(0 18px 40px rgba(0,0,0,.45))" }}>
        <span style={{ background: INK, color: "#fff", padding: ".14em .2em .16em .22em", borderRadius: ".16em 0 0 .16em" }}>ANTI</span>
        <span style={{ background: "#fff", color: INK, padding: ".14em .22em .16em .16em", border: `${Math.round(size * 0.05)}px solid ${INK}`, borderLeft: 0, borderRadius: "0 .16em .16em 0" }}>MARKETING</span>
      </div>
    </div>
  );
};
const Relogio: React.FC<{ t: number; em: number }> = ({ t, em }) => {
  const s = mola(t, em); const pisca = Math.floor((t - em) * 3) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#0B0B0D", borderRadius: 36, padding: "26px 56px", border: "6px solid #2A2A2E", boxShadow: "0 24px 60px rgba(0,0,0,.6)", transform: `rotate(3deg) scale(${interpolate(s, [0, 1], [1.8, 1])})`, opacity: Math.min(1, s * 2.5), textAlign: "center" }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 700, fontSize: 170, color: C.vermelho, letterSpacing: 6, textShadow: "0 0 28px rgba(255,59,59,.8)", opacity: pisca ? 1 : 0.35 }}>05:00</div>
      </div>
    </div>
  );
};
const Fruta: React.FC<{ t: number; em: number; tipo: "banana" | "maca" | "limao"; x: number; mesmo?: number }> = ({ t, em, tipo, x, mesmo }) => {
  const s = mola(t, em);
  const nome = { banana: "BANANA", maca: "MAÇÃ", limao: "LIMÃO" }[tipo];
  const cor = { banana: "#FFD23F", maca: "#E8323C", limao: "#58C93A" }[tipo];
  const fedor = mesmo != null ? interpolate(t, [mesmo, mesmo + 0.3], [0, 1], clamp) : 0;
  const desenho = tipo === "banana"
    ? <path d="M30 120 C 60 150, 150 150, 190 70 C 196 56, 186 50, 178 62 C 140 118, 80 122, 40 104 C 28 100, 22 112, 30 120 Z" fill={cor} stroke="#5A4300" strokeWidth="6" />
    : tipo === "maca"
      ? <><circle cx="110" cy="110" r="70" fill={cor} stroke="#6B0B10" strokeWidth="6" /><path d="M110 42 C 112 26, 120 16, 132 12" stroke="#4A2B10" strokeWidth="8" fill="none" /><ellipse cx="140" cy="30" rx="20" ry="10" fill="#3FA34D" transform="rotate(-25 140 30)" /></>
      : <><ellipse cx="110" cy="105" rx="78" ry="58" fill={cor} stroke="#1F5A12" strokeWidth="6" /><ellipse cx="185" cy="105" rx="10" ry="8" fill={cor} stroke="#1F5A12" strokeWidth="5" /></>;
  return (
    <div style={{ position: "absolute", left: x - 150, top: 230, width: 300, textAlign: "center", transform: `scale(${interpolate(s, [0, 1], [0.2, 1])}) rotate(${(x % 7) - 3}deg)`, opacity: Math.min(1, s * 2.5) }}>
      <div style={{ background: "#fff", borderRadius: 34, padding: "18px 10px 14px", boxShadow: "0 20px 44px rgba(0,0,0,.45)" }}>
        <svg width="220" height="190" viewBox="0 0 220 190">{desenho}</svg>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 50, color: "#111" }}>{nome}</div>
      </div>
      {/* o MESMO cheiro: as três ganham a mesma nuvem por cima */}
      {fedor > 0 && <svg width="300" height="160" viewBox="0 0 300 160" style={{ position: "absolute", left: 0, top: -120, opacity: fedor }}>
        {[60, 150, 240].map((cx, i) => <path key={i} d={`M${cx} 150 C ${cx - 30} 120, ${cx + 30} 95, ${cx} 65 C ${cx - 30} 40, ${cx + 25} 20, ${cx} 0`} stroke="#9BE15D" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray="200" strokeDashoffset={200 * (1 - fedor)} />)}
      </svg>}
    </div>
  );
};
const Fim: React.FC<{ t: number; em: number }> = ({ t, em }) => {
  const s = mola(t, em); const b = Math.sin((t - em) * 9) * 12;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, s * 2.5), transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})` }}>
      <div style={{ background: C.amarelo, color: "#111", fontFamily: SANS, fontWeight: 900, fontSize: 54, padding: "16px 34px", borderRadius: 18, boxShadow: "0 18px 40px rgba(0,0,0,.45)" }}>ASSISTA A AULA COMPLETA</div>
      <svg width="90" height="80" viewBox="0 0 90 80" style={{ marginTop: 6 + b }}><path d="M10 10 L45 60 L80 10" stroke={C.amarelo} strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
};

const Objeto: React.FC<{ ins: Ins; t: number }> = ({ ins, t }) => {
  switch (ins.k) {
    case "adesivo": return <Adesivo t={t} em={ins.de} {...ins.p} />;
    case "slam": return <Slam t={t} em={ins.de} {...ins.p} />;
    case "relogio": return <Relogio t={t} em={ins.de} />;
    case "logo": return <Logo t={t} em={ins.de} {...ins.p} />;
    case "fruta": return <Fruta t={t} em={ins.de} {...ins.p} />;
    case "fim": return <Fim t={t} em={ins.de} />;
    default: return null;
  }
};

export const AmAd: React.FC<AmAdProps> = ({ id, conf }) => {
  const t = useT(); const cfg = CONFIG[id];
  if (id === "teste") return <AmTeste conf={conf} />;
  const ativos = cfg.inserts.filter((i) => t >= i.de && t < i.ate);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Video id={id} conf={conf} />
      <Rec />
      {ativos.map((i, k) => <Objeto key={k} ins={i} t={t} />)}
      {/* palavra gigante JÁ é a legenda: as duas juntas = a mesma coisa duas vezes */}
      {!ativos.some((i) => (i.k === "slam" && i.p.txt !== "?") || (i.k === "logo" && i.p.mudo)) && <Legenda id={id} />}
      <Barra id={id} />
    </AbsoluteFill>
  );
};

// ═════════════ AD 5 · "O TESTE" · narrado, palco azul-marinho do slide da VSL ═════════════
const Palco: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 30%, #12204a 0%, ${C.navy} 55%, #02040c 100%)` }}>
    <div style={{ position: "absolute", inset: 26, borderRadius: 46, border: "2px solid rgba(110,140,255,.35)", boxShadow: "inset 0 0 90px rgba(61,123,255,.18), 0 0 60px rgba(139,92,255,.18)" }} />
  </AbsoluteFill>
);
const Cartao: React.FC<{ t: number; em: number; rot: string; txt: string; y: number; estado?: "ganhou" | "perdeu"; estadoEm?: number }> = ({ t, em, rot, txt, y, estado, estadoEm = 1e9 }) => {
  const s = mola(t, em); const e = t >= estadoEm ? mola(t, estadoEm) : 0;
  const ganhou = estado === "ganhou" && e > 0, perdeu = estado === "perdeu" && e > 0;
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: y, opacity: Math.min(1, s * 2.5) * (perdeu ? interpolate(e, [0, 1], [1, 0.38]) : 1),
      transform: `scale(${interpolate(s, [0, 1], [1.5, 1]) * (ganhou ? interpolate(e, [0, 1], [1, 1.06]) : 1)})` }}>
      <div style={{ display: "flex", gap: 28, alignItems: "center", background: "#fff", borderRadius: 30, padding: "30px 36px", boxShadow: ganhou ? `0 0 0 10px ${C.verde}, 0 0 70px rgba(43,227,122,.6)` : "0 24px 60px rgba(0,0,0,.5)" }}>
        <div style={{ flex: "0 0 auto", width: 96, height: 96, borderRadius: 24, background: ganhou ? C.verde : perdeu ? C.vermelho : "#111", color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>{ganhou ? "✓" : perdeu ? "✕" : rot}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: 1.1, color: "#111" }}>{txt}</div>
      </div>
    </div>
  );
};
const AmTeste: React.FC<{ conf?: boolean }> = () => {
  const t = useT(); const cfg = CONFIG.teste; const T = cfg.marcas;
  const conta = interpolate(t, [T.milhao - 0.5, T.milhao + 0.35], [0, 1000000], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cont = t >= T.qual + 0.3 && t < T.revela ? 3 - Math.floor(((t - (T.qual + 0.3)) / (T.revela - T.qual - 0.3)) * 3) : 0;
  const fase = t < T.primeira ? 0 : t < T.revela + 1.4 ? 1 : t < T.print ? 2 : t < T.nome ? 3 : 4;
  const zoomPrint = interpolate(t, [T.print, T.acreditar + 1.5], [1, 1.12], clamp);
  return (
    <AbsoluteFill>
      <Palco />
      <Audio src={staticFile("am-ads/teste.m4a")} />
      {fase === 0 && <>
        <Slam t={t} em={-0.15} txt="DUAS FRASES" cor={C.branco} y={360} size={150} />
        {t >= T.milhao - 0.5 && <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 112, color: C.verde, WebkitTextStroke: "10px #000", paintOrder: "stroke fill", transform: `scale(${interpolate(mola(t, T.milhao - 0.5), [0, 1], [1.6, 1])})` }}>
          R$ {Math.round(conta).toLocaleString("pt-BR")}</div>}
      </>}
      {fase === 1 && <>
        <Cartao t={t} em={T.primeira} rot="A" txt="A descoberta do milênio que Harvard vazou sem querer" y={340} estado="perdeu" estadoEm={T.revela} />
        {t >= T.segunda && <Cartao t={t} em={T.segunda} rot="B" txt="Isso é sem graça." y={800} estado="ganhou" estadoEm={T.revela} />}
        {t >= T.qual && t < T.revela && <Adesivo t={t} em={T.qual} txt="QUAL VENDEU MAIS?" fundo={C.amarelo} rot={-3} size={70} y={1010} />}
        {cont > 0 && <div key={cont} style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 220, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill" }}>{cont}</div>}
      </>}
      {fase === 2 && <>
        <Adesivo t={t} em={T.revela + 1.4} txt="fluente em 3 meses" fundo="#fff" rot={-4} size={66} y={330} risca={T.prometia + 0.3} />
      </>}
      {fase >= 3 && <div style={{ position: "absolute", left: 230, right: 230, top: 150, borderRadius: 34, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.6), 0 0 0 3px rgba(110,140,255,.5)", opacity: Math.min(1, mola(t, T.print) * 2.5),
        transform: `scale(${interpolate(mola(t, T.print), [0, 1], [1.25, 1]) * zoomPrint})`, transformOrigin: "50% 30%" }}>
        <Sequence from={Math.round(T.print * FPS)} layout="none"><OffthreadVideo src={staticFile("am-ads/vsl-abertura.mp4")} muted style={{ width: "100%", display: "block" }} /></Sequence>
        {/* a legenda REAL da VSL antiga: "fluente do jeito mais sem graça que você pode imaginar" */}
        {t >= T.print + 0.35 && t < T.print + 2.6 && <div style={{ position: "absolute", left: "3%", top: "72%", width: "94%", height: "11%", border: `8px solid ${C.verde}`, borderRadius: 14, boxShadow: `0 0 40px ${C.verde}`, opacity: mola(t, T.print + 0.35) }} />}
        <div style={{ position: "absolute", left: 22, top: 22, background: "rgba(0,0,0,.72)", color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: "8px 16px", borderRadius: 10 }}>A VSL DE VERDADE</div>
      </div>}
      {fase === 4 && <Logo t={t} em={T.nome} y={1290} size={104} />}
      {t >= T.aula && <Fim t={t} em={T.aula} />}
      {!(t < 1.0) && !(fase === 4 && t < T.nome + 1.1) && <Legenda id="teste" y={fase >= 3 ? 0.78 : 0.8} />}
      <Barra id="teste" />
    </AbsoluteFill>
  );
};
