// Registro dos 5 ads Antimarketing. Tempos em segundos do áudio FINAL (já a 1,1×), tirados de <id>.words.json.
// Cada objeto entra NA palavra (de = início da palavra) e sai seco (ate). Um objeto por vez em cima.
import crossfit from "./crossfit.words.json";
import besteira from "./besteira.words.json";
import cheiro from "./cheiro.words.json";
import inexplorado from "./inexplorado.words.json";
import teste from "./teste.words.json";

export type AdId = "crossfit" | "besteira" | "cheiro" | "inexplorado" | "teste";
export type Ins =
  | { k: "adesivo"; de: number; ate: number; p: { txt: string; cor?: string; fundo?: string; rot?: number; size?: number; y?: number; risca?: number } }
  | { k: "slam"; de: number; ate: number; p: { txt: string; cor?: string; y?: number; size?: number } }
  | { k: "relogio"; de: number; ate: number }
  | { k: "fruta"; de: number; ate: number; p: { tipo: "banana" | "maca" | "limao"; x: number; mesmo?: number } }
  | { k: "fim"; de: number; ate: number }
  | { k: "logo"; de: number; ate: number; p: { y?: number; size?: number; mudo?: boolean } };

type Cfg = {
  words: { duration: number; emendas: number[]; words: { word: string; start: number; end: number }[] };
  foco: { m: { x: number; y: number }; b: { x: number; y: number } };
  focoApos?: { de: number; m: { x: number; y: number }; b: { x: number; y: number } }; // trecho de OUTRO clipe no fim (CTA)
  bruna: [number, number][];            // trechos em que a Bruna fala (o plano vai pra ela)
  nivel0?: "A" | "M" | "F";
  cores: Record<string, string>;        // palavra da legenda (MAIÚSCULA, sem pontuação) → cor fixa
  inserts: Ins[];
  marcas?: any;
};
const AM = "#FFD60A", VD = "#2BE37A", VM = "#FF3B3B", BR = "#FFFFFF";
const ad = (de: number, ate: number, txt: string, o: Partial<{ cor: string; fundo: string; rot: number; size: number; y: number; risca: number }> = {}): Ins => ({ k: "adesivo", de, ate, p: { txt, ...o } });
const slam = (de: number, ate: number, txt: string, o: Partial<{ cor: string; y: number; size: number }> = {}): Ins => ({ k: "slam", de, ate, p: { txt, ...o } });

export const CONFIG: Record<AdId, Cfg> = {
  crossfit: {
    words: crossfit, foco: { m: { x: 0.2, y: 0.4 }, b: { x: 0.76, y: 0.4 } }, bruna: [], nivel0: "M",
    focoApos: { de: 38.41, m: { x: 0.29, y: 0.31 }, b: { x: 0.8, y: 0.29 } },
    cores: { BALELA: VM, FUNCIONA: VD, CROSSFIT: VD, SIM: VD, NADA: VM, LOUCO: VM, VOMITAR: VM, MILAGROSA: VM, PAGAR: AM },
    inserts: [
      ad(0, 2.4, "OFERTA DE EMAGRECIMENTO", { fundo: AM, rot: -3, size: 70 }),
      ad(3.45, 5.55, "TREINO PESADO", { rot: 3 }),
      ad(6.35, 7.9, "ATÉ QUASE VOMITAR", { fundo: VM, cor: BR, rot: -3 }),
      ad(8.45, 9.65, "DIETA", { rot: 2, size: 90 }),
      { k: "relogio", de: 10.55, ate: 12.55 },
      ad(16.55, 18.95, "PROMESSA: NENHUMA", { fundo: VM, cor: BR, rot: -2 }),
      ad(24.95, 26.9, "DAVA PRA FAZER EM CASA", { rot: 3, size: 60 }),
      ad(27.05, 28.1, "E VOCÊ PAGA", { fundo: AM, rot: -3, size: 76 }),
      slam(28.15, 30.7, "?", { cor: BR, size: 360, y: 180 }),
      slam(30.75, 32.45, "CROSSFIT", { cor: AM, size: 190 }),
      ad(32.5, 36.9, "VENDE TODO DIA", { fundo: VD, rot: -2, size: 74 }),
      ad(36.95, 38.5, "PROMESSA MILAGROSA", { rot: 2, size: 66, risca: 37.95 }),
      // CTA na voz dele (6735 0:43), igual ao am-cheiro (16/11)
      ad(38.56, 40.31, "O MERCADO TÁ RIDÍCULO", { fundo: VM, cor: BR, rot: -2, size: 62 }),
      ad(41.76, 43.96, "CANSOU DE BALELA?", { rot: 3, size: 72 }),
      ad(46.41, 48.49, "ALGUÉM FALANDO A VERDADE", { fundo: VD, rot: -2, size: 60 }),
      { k: "logo", de: 48.51, ate: 99, p: {} },
      { k: "fim", de: 48.51, ate: 99 },
    ],
  },
  besteira: {
    words: besteira, foco: { m: { x: 0.24, y: 0.4 }, b: { x: 0.74, y: 0.43 } }, bruna: [], nivel0: "M",
    focoApos: { de: 22.82, m: { x: 0.29, y: 0.31 }, b: { x: 0.8, y: 0.29 } },
    cores: { BALELA: VM, FUNCIONA: VD, VSL: AM, BESTEIRA: VM, VERDADE: VD, CONTRÁRIO: VD, FIZ: VD },
    inserts: [
      ad(0, 5.1, "VENDER SEM FALAR BESTEIRA?", { fundo: AM, rot: -3, size: 70 }),
      ad(5.6, 9.2, "fluente em 3 meses", { rot: 2, size: 74, risca: 8.65 }),
      ad(12.6, 13.85, "OS COMPRADORES SABEM?", { rot: -2, size: 62 }),
      ad(16.85, 18.35, "QUERO VENDER", { fundo: VD, rot: 3, size: 78 }),
      ad(18.4, 19.8, "SEM FALAR BESTEIRA", { fundo: VM, cor: BR, rot: -3, size: 68 }),
      ad(20.4, 21.9, "UMA VSL", { fundo: "#fff", rot: 2, size: 84 }),
      slam(21.95, 22.85, "AO CONTRÁRIO", { cor: AM, size: 108 }),
      // CTA na voz dele (6735 0:43), igual ao am-cheiro (16/11)
      ad(22.97, 24.72, "O MERCADO TÁ RIDÍCULO", { fundo: VM, cor: BR, rot: -2, size: 62 }),
      ad(26.17, 28.37, "CANSOU DE BALELA?", { rot: 3, size: 72 }),
      ad(30.82, 32.9, "ALGUÉM FALANDO A VERDADE", { fundo: VD, rot: -2, size: 60 }),
      { k: "logo", de: 32.92, ate: 99, p: {} },
      { k: "fim", de: 32.92, ate: 99 },
    ],
  },
  cheiro: {
    words: cheiro, foco: { m: { x: 0.16, y: 0.35 }, b: { x: 0.8, y: 0.37 } }, bruna: [[30.05, 32.5]], nivel0: "M",
    focoApos: { de: 34.8, m: { x: 0.29, y: 0.31 }, b: { x: 0.8, y: 0.29 } },
    cores: { BANANA: AM, MAÇÃ: VM, LIMÃO: VD, CONFIO: VM, MESMO: VM, BALELA: VM, VERDADE: VD, FUNCIONA: VD },
    inserts: [
      ad(0, 5.1, "TODA VSL TEM O MESMO CHEIRO", { fundo: AM, rot: -3, size: 68 }),
      { k: "fruta", de: 5.4, ate: 10.35, p: { tipo: "banana", x: 220, mesmo: 9.55 } },
      { k: "fruta", de: 6.45, ate: 10.35, p: { tipo: "maca", x: 540, mesmo: 9.55 } },
      { k: "fruta", de: 7.4, ate: 10.35, p: { tipo: "limao", x: 860, mesmo: 9.55 } },
      ad(12.25, 15.6, "A MESMA COISA DE NOVO", { rot: 2, size: 64 }),
      ad(15.65, 16.75, "NÃO CONFIO", { fundo: VM, cor: BR, rot: -3, size: 84 }),
      slam(20.55, 21.85, "PSICOLOGIA REVERSA", { cor: AM, size: 104 }),
      ad(22.45, 24.5, "“isso é sem graça”", { rot: -2, size: 74 }),
      ad(24.85, 27.3, "PARECE SÉRIO", { fundo: VD, rot: 3, size: 76 }),
      ad(27.75, 30.0, "A CONFIANÇA SOBE", { fundo: AM, rot: -2, size: 66 }),
      { k: "logo", de: 31.25, ate: 34.85, p: { mudo: true } },
      // CTA na voz dele (6735 0:43), 16/11
      ad(34.95, 36.7, "O MERCADO TÁ RIDÍCULO", { fundo: VM, cor: BR, rot: -2, size: 62 }),
      ad(38.15, 40.35, "CANSOU DE BALELA?", { rot: 3, size: 72 }),
      ad(42.8, 44.88, "ALGUÉM FALANDO A VERDADE", { fundo: VD, rot: -2, size: 60 }),
      { k: "logo", de: 44.9, ate: 99, p: {} },
      { k: "fim", de: 44.9, ate: 99 },
    ],
  },
  inexplorado: {
    words: inexplorado, foco: { m: { x: 0.24, y: 0.41 }, b: { x: 0.78, y: 0.46 } }, bruna: [[0, 2.2]], nivel0: "M",
    focoApos: { de: 14.34, m: { x: 0.29, y: 0.31 }, b: { x: 0.8, y: 0.29 } },
    cores: { FUNCIONA: VD, INEXPLORADO: VD, BALELAS: VM, BALELA: VM, DESESPERADA: VM, VERDADE: VD, OUVIR: VD },
    inserts: [
      ad(0, 2.2, "COMPRADOR INEXPLORADO", { fundo: AM, rot: -3, size: 66 }),
      ad(5.75, 7.85, "NÃO ACREDITA EM BALELA", { rot: 2, size: 62 }),
      ad(12.45, 14.38, "NÃO TEM ONDE GASTAR", { fundo: VD, rot: -2, size: 66 }),
      // CTA na voz dele (6735 0:43), igual ao am-cheiro (16/11)
      ad(14.49, 16.24, "O MERCADO TÁ RIDÍCULO", { fundo: VM, cor: BR, rot: -2, size: 62 }),
      ad(17.69, 19.89, "CANSOU DE BALELA?", { rot: 3, size: 72 }),
      ad(22.34, 24.42, "ALGUÉM FALANDO A VERDADE", { fundo: VD, rot: -2, size: 60 }),
      { k: "logo", de: 24.44, ate: 99, p: {} },
      { k: "fim", de: 24.44, ate: 99 },
    ],
  },
  teste: {
    words: teste, foco: { m: { x: 0.5, y: 0.5 }, b: { x: 0.5, y: 0.5 } }, bruna: [],
    cores: { CHATO: VD, MILHÃO: VD },
    inserts: [],
    marcas: { milhao: 2.74, primeira: 5.24, segunda: 9.11, qual: 11.34, revela: 13.5, prometia: 17.0, print: 17.8, chato: 20.38, acreditar: 23.41, nome: 25.1, aula: 26.28 },
  },
};
