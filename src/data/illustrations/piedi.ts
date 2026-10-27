import type { Scene } from '../../types/illustration'
import { wallX } from '../../utils/pose'

const w = (y: number, a = 0) => wallX(y, a)

export const piediScenes: Record<string, Scene> = {
  'precisione-piedi': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 60] }, { at: [72, 66] }, { at: [72, 138] }, { at: [72, 152], scale: 0.8, focus: true }],
    figures: [
      {
        pose: { hip: [96, 125], torso: -16, head: -55, handL: [72, 60], handR: [72, 66], footL: [82, 138], footR: [82, 152] },
        accent: ['legR'],
      },
    ],
    caption: 'Guarda il piede finché non è fermo sull’appoggio, poi carica il peso: niente rumore, niente aggiustamenti.',
  },

  'punta-interna': {
    view: 'front',
    holds: [
      { at: [88, 60] },
      { at: [112, 60] },
      { at: [102, 162], shape: 'bar', focus: true },
      { at: [138, 162], shape: 'bar', focus: true },
    ],
    figures: [
      {
        pose: { hip: [120, 126], torso: 0, handL: [88, 62], handR: [112, 62], footL: [108, 162], footR: [132, 162], footDir: { L: 180, R: 0 } },
        accent: ['legL', 'legR'],
      },
    ],
    caption: 'Appoggia il bordo interno della scarpetta, sotto l’alluce, con le ginocchia leggermente aperte.',
  },

  'punta-esterna': {
    view: 'front',
    holds: [
      { at: [96, 62] },
      { at: [130, 58] },
      { at: [136, 152], shape: 'bar', focus: true },
      { at: [102, 164], shape: 'bar' },
    ],
    figures: [
      {
        pose: {
          hip: [114, 126],
          torso: 6,
          turn: 0.7,
          handL: [96, 64],
          handR: [128, 62],
          footL: [104, 164],
          footR: [132, 152],
          footDir: { L: 180, R: 0 },
        },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [150, 112], to: [150, 140], curve: 14, tone: 'accent' }],
    caption: 'Il bordo esterno del piede ti fa girare il fianco verso la parete e allunga la portata dell’altro braccio.',
  },

  smearing: {
    view: 'side',
    wall: { overhang: -12 },
    holds: [{ at: [w(96, -12) + 2, 96] }, { at: [w(106, -12) + 2, 106] }],
    figures: [
      {
        pose: { hip: [94, 112], torso: -6, handL: [w(106, -12), 106], handR: [w(96, -12), 96], footL: [w(150, -12) + 10, 150], footR: [w(158, -12) + 10, 158] },
        accent: ['legR'],
      },
    ],
    arrows: [
      { from: [94, 124], to: [94, 174], dashed: true, tone: 'neutral' },
      { from: [114, 158], to: [98, 158], tone: 'accent' },
    ],
    caption: 'Sulla placca spingi la suola contro la parete, tallone basso, con il peso sopra il piede.',
  },

  'cambio-piedi': {
    view: 'front',
    holds: [
      { at: [92, 60] },
      { at: [118, 60] },
      { at: [112, 156], shape: 'bar', scale: 1.5, focus: true },
    ],
    figures: [
      {
        pose: { hip: [108, 124], torso: 0, handL: [92, 62], handR: [118, 62], footL: [104, 156], footR: [136, 146], footDir: { L: 180, R: 0 } },
        accent: ['legR'],
      },
    ],
    arrows: [
      { from: [136, 154], to: [122, 160], curve: -10, tone: 'accent' },
      { from: [98, 164], to: [84, 170], curve: 8, dashed: true, tone: 'neutral' },
    ],
    caption: 'Fai spazio sull’appoggio, avvicina l’altro piede e fallo prendere il posto del primo.',
  },

  tallonaggio: {
    view: 'side',
    wall: { overhang: 15 },
    holds: [{ at: [w(78, 15) + 2, 78] }, { at: [w(84, 15) + 2, 84] }, { at: [w(122, 15) + 2, 122], focus: true }, { at: [w(148, 15) + 2, 148] }],
    figures: [
      {
        pose: {
          hip: [110, 132],
          torso: -14,
          handL: [w(78, 15), 78],
          handR: [w(84, 15), 84],
          footL: [w(148, 15) + 10, 148],
          footR: [w(122, 15) + 3, 122],
          footDir: { R: 0 },
        },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [w(122, 15) + 14, 124], to: [100, 128], tone: 'accent' }],
    caption: 'Aggancia la presa con il tallone e tira con il retro della coscia: la gamba diventa un terzo braccio.',
  },

  'agganci-punta': {
    view: 'side',
    wall: { overhang: 25 },
    holds: [{ at: [w(70, 25) + 2, 70] }, { at: [w(64, 25) + 2, 64] }, { at: [w(120, 25) + 2, 120], focus: true }],
    figures: [
      {
        pose: {
          hip: [104, 128],
          torso: -14,
          handL: [w(64, 25), 64],
          handR: [w(70, 25), 70],
          footL: [92, 170],
          footR: [w(120, 25) + 10, 116],
          footDir: { R: 150 },
        },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [w(120, 25) + 8, 112], to: [90, 104], tone: 'accent' }],
    caption: 'Con il dorso della punta agganciato alla presa, la gamba tira e impedisce al corpo di staccarsi.',
  },

  bicicletta: {
    view: 'side',
    wall: { overhang: 35 },
    holds: [{ at: [w(70, 35) + 2, 70] }, { at: [w(64, 35) + 2, 64] }, { at: [72, 106], scale: 1.1, focus: true }],
    figures: [
      {
        pose: {
          hip: [116, 124],
          torso: -32,
          handL: [w(64, 35), 64],
          handR: [w(70, 35), 70],
          footL: [82, 114],
          footR: [82, 98],
          footDir: { L: 195, R: 165 },
        },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [
      { from: [100, 86], to: [86, 96], tone: 'accent' },
      { from: [100, 128], to: [86, 118], tone: 'accent' },
    ],
    caption: 'Un piede spinge sopra la presa e l’altro la aggancia da sotto: le gambe la stringono come una morsa.',
  },

  'piede-alto': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 64] }, { at: [72, 58] }, { at: [72, 114], focus: true }, { at: [72, 152] }],
    figures: [
      {
        pose: { hip: [92, 124], torso: -14, handL: [72, 58], handR: [72, 64], footL: [82, 152], footR: [82, 114] },
        accent: ['legR'],
      },
    ],
    arrows: [{ from: [140, 150], to: [140, 100], tone: 'accent' }],
    caption: 'Porta il piede in alto, vicino all’anca, e sali spingendo con la gamba invece di tirare con le braccia.',
  },
}
