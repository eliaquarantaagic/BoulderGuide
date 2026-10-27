import type { Scene } from '../../types/illustration'
import { wallX } from '../../utils/pose'

const w = (y: number, a = 0) => wallX(y, a)

export const sicurezzaScenes: Record<string, Scene> = {
  'caduta-controllata': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 40] }, { at: [72, 62] }],
    figures: [
      {
        tone: 'ghost',
        pose: { hip: [98, 98], torso: -12, handL: [72, 62], handR: [72, 40], footL: [81, 130], footR: [82, 118] },
      },
      {
        pose: {
          hip: [128, 146],
          torso: 22,
          head: -10,
          handL: [131, 110],
          handR: [133, 114],
          footL: [114, 178],
          footR: [127, 178],
          bend: { armL: -1, armR: -1 },
        },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [{ from: [112, 56], to: [168, 92], curve: -22, dashed: true, tone: 'neutral' }],
    caption: 'Atterra sui piedi a ginocchia piegate, braccia raccolte al petto, poi rotola all’indietro.',
  },

  discesa: {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 78] }, { at: [72, 92] }, { at: [72, 150] }, { at: [72, 160], focus: true }],
    figures: [
      {
        pose: { hip: [98, 128], torso: -12, handL: [72, 78], handR: [72, 92], footL: [82, 160], footR: [82, 150] },
        accent: ['legL', 'legR'],
      },
    ],
    arrows: [{ from: [140, 90], to: [140, 140], tone: 'accent' }],
    caption: 'Scendi arrampicando finché sei vicino al materasso, poi salta piegando le gambe.',
  },

  'zona-caduta': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 70] }, { at: [72, 82] }, { at: [72, 140] }, { at: [72, 150] }],
    figures: [
      {
        pose: { hip: [96, 125], torso: -16, handL: [72, 70], handR: [72, 82], footL: [82, 150], footR: [82, 140] },
      },
      {
        tone: 'other',
        pose: { hip: [200, 131], torso: 0, handL: [196, 128], handR: [204, 128], footL: [195, 178], footR: [205, 178], bend: { armL: -1, armR: -1 } },
      },
    ],
    arrows: [
      { from: [92, 142], to: [92, 174], dashed: true, tone: 'danger' },
      { from: [118, 142], to: [118, 174], dashed: true, tone: 'danger' },
    ],
    caption: 'Controlla la zona di caduta: sotto di te niente e nessuno, gli altri restano fuori dalla traiettoria.',
  },

  parata: {
    view: 'side',
    wall: { overhang: 15 },
    holds: [{ at: [w(68, 15) + 2, 68] }, { at: [w(76, 15) + 2, 76] }, { at: [w(148, 15) + 2, 148] }, { at: [w(136, 15) + 2, 136] }],
    figures: [
      {
        pose: { hip: [104, 132], torso: -19, handL: [w(76, 15), 76], handR: [w(68, 15), 68], footL: [w(148, 15) + 10, 148], footR: [w(136, 15) + 10, 136] },
      },
      {
        tone: 'other',
        pose: { hip: [152, 134], torso: -8, handL: [126, 114], handR: [128, 124], footL: [140, 178], footR: [165, 178], bend: { armL: -1, armR: -1 } },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [{ from: [118, 112], to: [122, 168], curve: 12, dashed: true, tone: 'neutral' }],
    caption: 'Chi pàra tiene le mani alzate vicino al bacino e accompagna la caduta verso il materasso, senza afferrare.',
  },

  'braccia-raccolte': {
    view: 'side',
    wall: { overhang: 0 },
    holds: [{ at: [72, 40] }, { at: [72, 62] }],
    figures: [
      {
        pose: {
          hip: [130, 112],
          torso: 35,
          head: -10,
          handL: [138, 86],
          handR: [140, 90],
          footL: [112, 142],
          footR: [124, 148],
          bend: { armL: -1, armR: -1 },
        },
        accent: ['armL', 'armR'],
      },
    ],
    arrows: [{ from: [190, 60], to: [190, 130], tone: 'neutral' }],
    caption: 'Durante la caduta tieni le braccia raccolte al petto, mai tese verso il materasso.',
  },
}
