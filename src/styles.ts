import { StyleSheet } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { Tag } from './tags.js';

export type HtmlStyle =
  | (Style & {
      listStyle?: string;
      listStyleType?: string;
      borderSpacing?: number | string;
      borderCollapse?: string;
    })
  | any;

export type HtmlStyles = Record<Tag | string, HtmlStyle>;

export const createHtmlStylesheet = <T extends HtmlStyles>(
  fontSize: number,
  reset: boolean = false
): HtmlStyles => {
  const em = (em: number, relativeSize: number = fontSize) => em * relativeSize;

  let base: HtmlStyles = {
    body: {
      margin: 8,
      fontFamily: 'Times-Roman',
    },
    h1: {
      fontSize: em(2),
      marginVertical: em(0.67, em(2)),
      fontWeight: 'bold',
    },
    h2: {
      fontSize: em(1.5),
      marginVertical: em(0.83, em(1.5)),
      fontWeight: 'bold',
    },
    h3: {
      fontSize: em(1.17),
      marginVertical: em(1, em(1.17)),
      fontWeight: 'bold',
    },
    h4: {
      fontSize: em(1),
      marginVertical: em(1.33, em(1)),
      fontWeight: 'bold',
    },
    h5: {
      fontSize: em(0.83),
      marginVertical: em(1.67, em(0.83)),
      fontWeight: 'bold',
    },
    h6: {
      fontSize: em(0.67),
      marginVertical: em(2.33, em(0.67)),
      fontWeight: 'bold',
    },
    p: {
      fontSize: em(1),
      marginVertical: em(1),
    },
    blockquote: {
      marginVertical: em(1),
      marginHorizontal: 30,
    },
    hr: {
      marginVertical: em(0.5),
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    address: {
      fontStyle: 'italic',
    },
    pre: {
      // fontFamily: 'monospace',
      // whiteSpace: 'pre',
      marginVertical: em(1),
    },
    b: {
      fontWeight: 'bold',
    },
    strong: {
      fontWeight: 'bold',
    },
    i: {
      fontStyle: 'italic',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecoration: 'line-through',
    },
    u: {
      textDecoration: 'underline',
    },
    cite: {
      fontStyle: 'italic',
    },
    code: {
      // fontFamily: 'monospace',
    },
    a: {
      textDecoration: 'underline',
    },
    ul: {
      marginVertical: em(1),
    },
    ol: {
      marginVertical: em(1),
    },
    li: {
      display: 'flex',
      flexDirection: 'row',
    },
    li_bullet: {
      width: 30,
      textAlign: 'right',
      flexShrink: 0,
      flexGrow: 0,
      paddingRight: 5,
    },
    li_content: {
      textAlign: 'left',
      flexGrow: 1,
      flexBasis: 1,
    },
    table: {
      display: 'flex',
      flexDirection: 'column',
      // borderColor: 'gray',
      // borderWidth: 1,
      flexShrink: 1,
      borderCollapse: 'collapse',
      // borderSpacing: 2,
    },
    thead: {
      display: 'flex',
      flexDirection: 'column',
    },
    tbody: {
      display: 'flex',
      flexDirection: 'column',
    },
    tr: {
      display: 'flex',
      flexDirection: 'row',
      flexShrink: 1,
    },
    td: {
      flexGrow: 1,
      flexShrink: 1,
      width: '100%',
    },
    th: {
      flexGrow: 1,
      flexShrink: 1,
      width: '100%',
      fontWeight: 'bold',
    },
  };

  if (reset) {
    for (const key of Object.keys(base)) {
      for (const style of Object.keys(base[key])) {
        if (
          !key.startsWith('li_') &&
          (style.startsWith('margin') ||
            style.startsWith('padding') ||
            style === 'fontSize')
        ) {
          delete (base as any)[key][style];
        }
      }
    }
    base.li_bullet.display = 'none';
    base.table.borderCollapse = 'collapse';
    base.table.borderSpacing = 0;
  }

  return StyleSheet.create(base);
};
