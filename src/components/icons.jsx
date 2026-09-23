/* Drawn icon set — one stroke (1.5px), optical 14px box.
   Replaces all text-glyph arrows/dots/plus signs. */
function base(props) {
  return {
    width: 14,
    height: 14,
    viewBox: '0 0 14 14',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  };
}

export function ArrowRight(props) {
  return (
    <svg {...base(props)}>
      <path d="M1.5 7h10M8 3.5 11.5 7 8 10.5" />
    </svg>
  );
}

export function ArrowLeft(props) {
  return (
    <svg {...base(props)}>
      <path d="M12.5 7h-10M6 3.5 2.5 7 6 10.5" />
    </svg>
  );
}

export function ArrowUpRight(props) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" />
    </svg>
  );
}

export function Plus(props) {
  return (
    <svg {...base(props)}>
      <path d="M7 2.5v9M2.5 7h9" />
    </svg>
  );
}
