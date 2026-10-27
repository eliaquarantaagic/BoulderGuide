import type { Scene } from '../../types/illustration'
import { wallX } from '../../utils/pose'

const w = (y: number, a = 0) => wallX(y, a)

export const movimentoScenes: Record<string, Scene> = {
  'braccia-tese': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 52] }, { at: [72, 56] }, { at: [72, 150] }, { at: [72, 138] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [84, 100], torso: -4, handL: [72, 52], handR: [72, 56], footL: [82, 140], footR: [82, 128] },
      },
      {
        pose: { hip: [93, 118], torso: -8, handL: [72, 52], handR: [72, 56], footL: [82, 150], footR: [82, 138] },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [{ from: [132, 60], to: [132, 112] }],
    caption: 'Resta appeso a braccia tese: il peso è retto dalle ossa e non dai bicipiti. L’omino sbiadito è l’errore (braccia piegate).',
  },

  'spinta-gambe': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 52] }, { at: [72, 60] }, { at: [72, 142] }, { at: [72, 152] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [96, 126], torso: -16, handL: [72, 60], handR: [72, 60], footL: [82, 152], footR: [82, 142] },
      },
      {
        pose: { hip: [92, 112], torso: -14, handL: [72, 52], handR: [72, 60], footL: [82, 156], footR: [82, 146] },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [{ from: [118, 150], to: [118, 102] }],
    caption: 'Il movimento verso l’alto nasce dalle gambe: distendile come per salire una scala.',
  },

  'anche-parete': {
    view: 'side',
    wall: { overhang: 10 },
    holds: [{ at: [w(60, 10) + 2, 60] }, { at: [w(64, 10) + 2, 64] }, { at: [w(70, 10) + 2, 70] }, { at: [w(150, 10) + 2, 150] }, { at: [w(140, 10) + 2, 140] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [106, 122], torso: -6, handL: [w(64, 10), 64], handR: [w(70, 10), 70], footL: [w(140, 10) + 10, 140], footR: [w(150, 10) + 10, 150] },
      },
      {
        pose: { hip: [92, 124], torso: -12, handL: [w(60, 10), 60], handR: [w(64, 10), 64], footL: [w(140, 10) + 10, 140], footR: [w(150, 10) + 10, 150] },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [{ from: [124, 116], to: [100, 116], curve: -8 }],
    caption: 'Porta il bacino vicino alla parete: il peso passa sui piedi e le braccia lavorano meno (sbiadito: bacino lontano).',
  },

  flag: {
    view: 'front',
    holds: [{ at: [94, 62] }, { at: [116, 60] }, { at: [118, 168], shape: 'bar', focus: true }],
    figures: [
      {
        pose: { hip: [106, 126], torso: 5, handL: [94, 62], handR: [116, 60], footL: [64, 152], footR: [118, 166], footDir: { L: 200, R: 0 } },
        accent: ['legL'],
      },
    ],
    arrows: [{ from: [58, 136], to: [48, 124], curve: -6 }],
    caption: 'Bandiera: la gamba libera si distende di lato sulla parete e fa da contrappeso, così il corpo non ruota.',
  },

  porta: {
    view: 'front',
    holds: [{ at: [88, 64] }, { at: [86, 152], shape: 'bar', focus: true }],
    figures: [
      {
        pose: { hip: [110, 128], torso: 16, handL: [88, 64], handR: [142, 104], footL: [86, 152], footR: [142, 152] },
        accent: ['armL', 'legL'],
      },
    ],
    arrows: [{ from: [152, 82], to: [156, 124], curve: -22, tone: 'danger' }],
    caption: 'Effetto porta: con mano e piede sullo stesso lato il corpo ruota verso l’esterno, come un’anta che si apre.',
  },

  lolotte: {
    view: 'front',
    holds: [{ at: [96, 60] }, { at: [138, 60] }, { at: [80, 152], shape: 'bar' }, { at: [128, 142], shape: 'bar', focus: true }],
    figures: [
      {
        pose: { hip: [108, 124], torso: 8, turn: 0.5, handL: [96, 60], handR: [138, 60], footL: [80, 150], footR: [128, 140], bend: { legR: 1 }, footDir: { L: 180, R: 0 } },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [122, 118], to: [108, 136], curve: 10 }],
    caption: 'Lolotte: il ginocchio ruota verso il basso e l’interno, con il piede in punta esterna: l’anca si avvicina alla parete.',
  },

  twist: {
    view: 'front',
    holds: [{ at: [98, 72] }, { at: [132, 60], focus: true }, { at: [126, 152], shape: 'bar', focus: true }, { at: [96, 164], shape: 'bar' }],
    figures: [
      {
        pose: { hip: [112, 126], torso: 4, turn: 0.8, handL: [98, 72], handR: [132, 60], footL: [96, 162], footR: [126, 150], footDir: { L: 180, R: 0 } },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [138, 98], to: [138, 124], curve: -10 }],
    caption: 'Torsione: gira il fianco verso la parete con il piede in punta esterna: la spalla vicina guadagna centimetri.',
  },

  dinamico: {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 36], focus: true }, { at: [72, 60] }, { at: [72, 66] }, { at: [72, 140] }, { at: [72, 152] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [97, 126], torso: -16, handL: [72, 66], handR: [72, 60], footL: [82, 152], footR: [82, 142] },
      },
      {
        pose: { hip: [88, 102], torso: -6, handL: [82, 92], handR: [72, 36], footL: [90, 136], footR: [w(140) + 10, 140] },
        accent: ['legR', 'armR'],
      },
    ],
    arrows: [{ from: [118, 122], to: [112, 70], curve: -24 }],
    caption: 'Dinamico: carica le gambe e prendi la presa nel punto morto, quando il corpo si ferma per un istante.',
  },

  lancio: {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 30], focus: true }, { at: [72, 70] }, { at: [72, 74] }, { at: [72, 152] }, { at: [72, 144] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [98, 128], torso: -18, handL: [72, 74], handR: [72, 70], footL: [82, 152], footR: [82, 146] },
      },
      {
        pose: { hip: [92, 96], torso: -6, handL: [72, 34], handR: [72, 30], footL: [100, 128], footR: [108, 122] },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [{ from: [120, 120], to: [116, 62], curve: -26, dashed: true }],
    caption: 'Lancio: un salto in cui le mani (e i piedi) lasciano la parete. Guarda la presa e afferrala con decisione.',
  },

  mantle: {
    view: 'side',
    wall: { overhang: 0, top: 100 },
    decor: [{ x: 0, y: 94, w: 74, h: 6, fill: 'platform', rx: 2 }],
    holds: [{ at: [72, 124] }, { at: [72, 148] }],
    figures: [
      {
        pose: { hip: [92, 107], torso: -30, head: -15, handL: [68, 90], handR: [60, 90], footL: [81, 146], footR: [81, 122] },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [{ from: [46, 66], to: [46, 86] }],
    caption: 'Ristabilimento: spingi verso il basso con i palmi come per uscire da una piscina, poi porta un piede sul bordo.',
  },

  compressione: {
    view: 'front',
    decor: [{ x: 96, y: 36, w: 48, h: 90, fill: 'volume', rx: 14 }],
    holds: [{ at: [104, 166], shape: 'bar' }, { at: [136, 166], shape: 'bar' }],
    figures: [
      {
        pose: { hip: [120, 136], torso: 0, handL: [97, 84], handR: [143, 84], footL: [104, 166], footR: [136, 166], footDir: { L: 180, R: 0 } },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [
      { from: [74, 84], to: [92, 84] },
      { from: [166, 84], to: [148, 84] },
    ],
    caption: 'Compressione: stringi un volume tra le mani spingendo verso l’interno, con addome e piedi in tensione.',
  },

  opposizione: {
    view: 'front',
    decor: [
      { x: 0, y: 0, w: 84, h: 178, fill: 'volume' },
      { x: 156, y: 0, w: 84, h: 178, fill: 'volume' },
    ],
    figures: [
      {
        pose: { hip: [120, 122], torso: 0, handL: [84, 84], handR: [156, 84], footL: [84, 138], footR: [156, 138], footDir: { L: 180, R: 0 } },
        accent: ['armL', 'armR', 'legL', 'legR'],
      },
    ],
    arrows: [
      { from: [104, 62], to: [90, 62] },
      { from: [136, 62], to: [150, 62] },
      { from: [104, 152], to: [90, 152] },
      { from: [136, 152], to: [150, 152] },
    ],
    caption: 'Opposizione: spingi in direzioni opposte con mani e piedi: la tensione tra i due punti ti tiene in parete.',
  },

  placca: {
    view: 'side',
    wall: { overhang: -15 },
    holds: [{ at: [w(96, -15) + 2, 96] }, { at: [w(104, -15) + 2, 104] }],
    figures: [
      {
        pose: { hip: [94, 112], torso: -5, handL: [w(104, -15), 104], handR: [w(96, -15), 96], footL: [w(142, -15) + 10, 142], footR: [w(150, -15) + 10, 150] },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [{ from: [94, 126], to: [94, 174], dashed: true, tone: 'neutral' }],
    caption: 'Placca: peso sopra i piedi, bacino in fuori e passi piccoli. Le mani servono solo per bilanciarti.',
  },
}
