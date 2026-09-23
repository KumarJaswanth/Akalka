/* Central photography map — verified Unsplash CDN URLs (all free to use
   under the Unsplash License). Alt text describes the photograph itself,
   never as an AKALKA product. Every <img> hides gracefully on error. */

const U = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

/* Reframings of the verified pool for carousel depth — same photographs,
   new crops. Params only; no new sources to verify. */
export const V = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&h=${h}&fit=crop&crop=entropy&auto=format`;

export const IMG = {
  heroBg: {
    src: U('1749467140438-feda1a2bbbd8', 2000),
    alt: 'Steel roof structure with skylights in a dark industrial hall',
  },
  doorSingle: {
    src: U('1652175628203-33139d1a598a', 1000),
    alt: 'Grey coated metal door with linear panel joints',
  },
  doorDouble: {
    src: U('1572512605819-8f88baee16e5', 1200),
    alt: 'Wide industrial metal door in a grey facade',
  },
  sandwich: {
    src: U('1759310347407-b0dbfeb8745d', 1800),
    alt: 'Corrugated metal cladding on industrial buildings',
  },
  cleanroom: {
    src: U('1748000970909-845f4aa144d2', 1400),
    alt: 'Operators working inside a production clean room',
  },
  cleanroomAlt: {
    src: U('1584677123573-7446380b6d69', 1400),
    alt: 'White technical room with controlled-environment equipment',
  },
  flushWalls: {
    src: U('1762928289094-197055a5d5c3', 1400),
    alt: 'Minimal white hallway with flush wall surfaces',
  },
  partition: {
    src: U('1765371513492-264506c3ad09', 1200),
    alt: 'Modern office space divided by glass partitions',
  },
  partitionAlt: {
    src: U('1746021375306-9dec0f637732', 1200),
    alt: 'Glass-walled offices along a bright hallway',
  },
  profiles: {
    corner: {
      src: U('1756758932992-3cac25c395f7', 900),
      alt: 'Brushed metal surface with subtle texture',
    },
    formed3d: {
      src: U('1773695801784-01f9ff80865b', 900),
      alt: 'Brushed metal with fine horizontal lines',
    },
    formed2d: {
      src: U('1709244596182-a7c6542be59c', 900),
      alt: 'Steel pipes stacked in a yard',
    },
    track: {
      src: U('1671022442106-c787685d9fed', 900),
      alt: 'Steel beams stored in a warehouse',
    },
    channel: {
      src: U('1764835746713-34a671e73569', 900),
      alt: 'Metal pipes on a factory production line',
    },
    angle: {
      src: U('1709244596176-0e14b3b8a517', 900),
      alt: 'Stacked metal sections at a construction site',
    },
    box: {
      src: U('1759310347407-b0dbfeb8745d', 900),
      alt: 'Profiled metal cladding sheets, close view',
    },
    alucoat: {
      src: U('1749467140438-feda1a2bbbd8', 900),
      alt: 'Steel structure under industrial skylights',
    },
  },
};
