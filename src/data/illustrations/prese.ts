import type { Pose, Scene } from '../../types/illustration'

// Front view: climber centred around x=100, hanging with the hips at y~130.
const hang = (over: Partial<Pose> = {}): Pose => ({
  hip: [100, 130],
  torso: 0,
  handL: [88, 60],
  handR: [112, 60],
  footL: [94, 172],
  footR: [106, 172],
  ...over,
})

export const preseScenes: Record<string, Scene> = {
  tacca: {
    view: 'front',
    holds: [{ at: [88, 60], shape: 'bar', focus: true }, { at: [112, 60], shape: 'bar' }],
    figures: [{ pose: hang(), accent: ['armL'] }],
    inset: { hold: { shape: 'bar' }, arrows: [{ from: [0, 6], to: [0, 30] }] },
    caption: 'Tacca: bordo sottile tenuto con la punta delle dita. Meglio aperta o semiarcuata che arcuata a freddo.',
  },

  svaso: {
    view: 'front',
    holds: [{ at: [88, 62], shape: 'dome', scale: 1.3, focus: true }, { at: [112, 60], shape: 'bar' }],
    figures: [{ pose: hang({ handL: [88, 58] }), accent: ['armL'] }],
    inset: { hold: { shape: 'dome' }, arrows: [{ from: [0, -32], to: [0, -9] }] },
    caption: 'Svaso: nessun bordo da agganciare. Mano aperta, tanta pelle a contatto, corpo basso e braccia tese.',
  },

  pinza: {
    view: 'front',
    holds: [{ at: [100, 62], shape: 'block', scale: 1.2, focus: true }, { at: [116, 62] }],
    figures: [{ pose: hang({ handL: [100, 62], handR: [116, 62] }), accent: ['armL'] }],
    inset: {
      hold: { shape: 'block' },
      arrows: [
        { from: [-32, 0], to: [-14, 0] },
        { from: [32, 0], to: [14, 0] },
      ],
    },
    caption: 'Pinza: stringi la presa tra pollice e dita. Il pollice aggiunge la forza opposta che la tiene.',
  },

  buco: {
    view: 'front',
    holds: [{ at: [88, 60], shape: 'pocket', scale: 1.2, focus: true }, { at: [112, 60] }],
    figures: [{ pose: hang(), accent: ['armL'] }],
    inset: { hold: { shape: 'pocket' }, arrows: [{ from: [0, 8], to: [0, 30] }] },
    caption: 'Buco: poche dita nella presa. Usa le più forti (medio e anulare) e non ruotare il corpo con le dita dentro.',
  },

  rovescio: {
    view: 'front',
    holds: [{ at: [84, 96], shape: 'bar', scale: 1.4, focus: true }, { at: [116, 76], shape: 'bar' }],
    figures: [
      {
        pose: { hip: [104, 140], torso: 10, handL: [84, 102], handR: [116, 76], footL: [96, 164], footR: [114, 160] },
        accent: ['armL'],
      },
    ],
    arrows: [{ from: [84, 120], to: [84, 108] }],
    inset: { hold: { shape: 'bar' }, arrows: [{ from: [0, 30], to: [0, 10] }] },
    caption: 'Rovescio: palmo verso l’alto, tiri la presa verso l’alto. Funziona solo con i piedi alti che spingono.',
  },

  laterale: {
    view: 'front',
    holds: [{ at: [84, 72], shape: 'vbar', focus: true }, { at: [124, 64] }],
    figures: [
      {
        pose: { hip: [110, 130], torso: 12, handL: [84, 72], handR: [124, 64], footL: [100, 164], footR: [120, 164] },
        accent: ['armL'],
      },
    ],
    inset: { hold: { shape: 'vbar' }, arrows: [{ from: [8, 0], to: [30, 0] }] },
    caption: 'Presa laterale: bordo verticale. Sposta il corpo dal lato opposto e tira di lato, in opposizione.',
  },

  gaston: {
    view: 'front',
    holds: [{ at: [82, 84], shape: 'vbar', focus: true }, { at: [118, 60] }],
    figures: [
      {
        pose: { hip: [112, 130], torso: -2, handL: [82, 84], handR: [118, 60], footL: [102, 164], footR: [122, 164], bend: { armL: 1 } },
        accent: ['armL'],
      },
    ],
    inset: { hold: { shape: 'vbar' }, arrows: [{ from: [10, 0], to: [-26, 0] }] },
    caption: 'Gaston: spingi la presa verso l’esterno, come aprire una porta scorrevole, con il gomito alto.',
  },

  palming: {
    view: 'front',
    holds: [{ at: [134, 112], shape: 'ledge', scale: 1.2, focus: true }, { at: [88, 56] }],
    figures: [
      {
        pose: { hip: [100, 118], torso: 0, handL: [88, 56], handR: [134, 110], footL: [94, 164], footR: [106, 164] },
        accent: ['armR'],
      },
    ],
    arrows: [{ from: [156, 80], to: [156, 106] }],
    inset: { hold: { shape: 'ledge' }, arrows: [{ from: [0, -32], to: [0, -8] }] },
    caption: 'Spinta col palmo: premi verso il basso su un volume o un bordo, con il gomito sopra il polso.',
  },

  abbinare: {
    view: 'front',
    holds: [{ at: [100, 60], shape: 'bar', scale: 1.8, focus: true }],
    figures: [{ pose: hang({ handL: [92, 62], handR: [108, 62] }), accent: ['armL', 'armR'] }],
    caption: 'Abbinare: entrambe le mani sulla stessa presa. Lascia spazio con la prima mano per inserire la seconda.',
  },

  incrocio: {
    view: 'front',
    holds: [{ at: [102, 62], focus: true }, { at: [92, 66], focus: true }],
    figures: [{ pose: hang({ handL: [102, 62], handR: [92, 66] }), accent: ['armR'] }],
    arrows: [{ from: [126, 74], to: [96, 56], curve: -16 }],
    caption: 'Incrocio: una mano passa sopra l’altra per raggiungere la presa, senza abbinare.',
  },
}
