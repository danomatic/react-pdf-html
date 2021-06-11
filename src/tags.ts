export type Tag =
  | 'HTML'
  | 'BODY'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5'
  | 'H6'
  | 'DIV'
  | 'P'
  | 'BLOCKQUOTE'
  | 'ARTICLE'
  | 'CAPTION'
  | 'FORM'
  | 'HR'
  | 'BR'
  | 'ADDRESS'
  | 'ASIDE'
  | 'PRE'
  | 'B'
  | 'STRONG'
  | 'I'
  | 'EM'
  | 'U'
  | 'S'
  | 'CITE'
  | 'CODE'
  | 'ABBR'
  | 'A'
  | 'IMG'
  | 'UL'
  | 'OL'
  | 'LI'
  | 'TABLE'
  | 'TR'
  | 'TD'
  | 'TH'
  | 'THEAD'
  | 'TBODY';

export const isBlock: Record<Tag, boolean> & Record<string, boolean> = {
  HTML: true,
  BODY: true,
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,

  DIV: true,
  P: true,
  BLOCKQUOTE: true,
  ARTICLE: true,
  CAPTION: true,
  FORM: true,
  HR: true,
  BR: true,
  ADDRESS: true,
  ASIDE: true,
  PRE: true,

  B: false,
  STRONG: false,
  I: false,
  EM: false,
  U: false,
  S: false,
  CITE: false,
  CODE: false,
  ABBR: false,

  A: false,
  IMG: false,

  TABLE: true,
  TR: true,
  TD: true,
  TH: true,
  THEAD: true,
  TBODY: true,

  UL: true,
  OL: true,
  LI: true,
};
