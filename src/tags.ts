export type Tag =
  | 'html'
  | 'body'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'div'
  | 'p'
  | 'blockquote'
  | 'article'
  | 'caption'
  | 'form'
  | 'hr'
  | 'br'
  | 'address'
  | 'aside'
  | 'pre'
  | 'b'
  | 'strong'
  | 'i'
  | 'em'
  | 'u'
  | 's'
  | 'cite'
  | 'code'
  | 'abbr'
  | 'a'
  | 'img'
  | 'ul'
  | 'ol'
  | 'li'
  | 'table'
  | 'tr'
  | 'td'
  | 'th'
  | 'thead'
  | 'tbody';

export const isBlock: Record<Tag, boolean> & Record<string, boolean> = {
  html: true,
  body: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,

  div: true,
  p: true,
  blockquote: true,
  article: true,
  caption: true,
  form: true,
  hr: true,
  br: true,
  address: true,
  aside: true,
  pre: true,

  b: false,
  strong: false,
  i: false,
  em: false,
  u: false,
  s: false,
  cite: false,
  code: false,
  abbr: false,

  a: false,
  img: false,

  table: true,
  tr: true,
  td: true,
  th: true,
  thead: true,
  tbody: true,

  ul: true,
  ol: true,
  li: true,
};
