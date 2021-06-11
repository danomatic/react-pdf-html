import { StyleSheet } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { Tag } from './tags';

export type HtmlStyles = Record<Tag | string, Style>;

export const createHtmlStylesheet = <T extends HtmlStyles>(
  fontSize: number,
  reset: boolean = false,
  overrides?: T
): HtmlStyles => {
  const em = (em: number, relativeSize: number = fontSize) => em * relativeSize;

  let base: HtmlStyles = {
    BODY: {
      margin: 8,
      fontFamily: 'Times-Roman',
    },
    H1: {
      fontSize: em(2),
      marginVertical: em(0.67, em(2)),
      fontWeight: 'bold',
    },
    H2: {
      fontSize: em(1.5),
      marginVertical: em(0.83, em(1.5)),
      fontWeight: 'bold',
    },
    H3: {
      fontSize: em(1.17),
      marginVertical: em(1, em(1.17)),
      fontWeight: 'bold',
    },
    H4: {
      fontSize: em(1),
      marginVertical: em(1.33, em(1)),
      fontWeight: 'bold',
    },
    H5: {
      fontSize: em(0.83),
      marginVertical: em(1.67, em(0.83)),
      fontWeight: 'bold',
    },
    H6: {
      fontSize: em(0.67),
      marginVertical: em(2.33, em(0.67)),
      fontWeight: 'bold',
    },
    P: {
      fontSize: em(1),
      marginVertical: em(1),
    },
    BLOCKQUOTE: {
      marginVertical: em(1),
      marginHorizontal: 30,
    },
    HR: {
      marginVertical: em(0.5),
      borderBottomWidth: 1,
      borderBottomColor: '#000',
    },
    ADDRESS: {
      fontStyle: 'italic',
    },
    PRE: {
      // fontFamily: 'monospace',
      // whiteSpace: 'pre',
      marginVertical: em(1),
    },
    B: {
      fontWeight: 'bold',
    },
    STRONG: {
      fontWeight: 'bold',
    },
    I: {
      fontStyle: 'italic',
    },
    EM: {
      fontStyle: 'italic',
    },
    S: {
      textDecoration: 'line-through',
    },
    U: {
      textDecoration: 'underline',
    },
    CODE: {
      // fontFamily: 'monospace',
    },
    A: {
      textDecoration: 'underline',
    },
    UL: {
      marginVertical: em(1),
    },
    OL: {
      marginVertical: em(1),
    },
    LI: {
      display: 'flex',
      flexDirection: 'row',
    },
    LI_bullet: {
      width: 30,
      textAlign: 'right',
      flexShrink: 0,
      flexGrow: 0,
      paddingRight: 5,
    },
    LI_content: {
      textAlign: 'left',
      flexGrow: 1,
    },
    TABLE: {
      display: 'flex',
      flexDirection: 'column',
      // borderColor: 'gray',
      // borderWidth: 1,
      flexShrink: 1,
      borderCollapse: 'collapse',
      // borderSpacing: 2,
    } as any,
    THEAD: {
      display: 'flex',
      flexDirection: 'column',
    },
    TBODY: {
      display: 'flex',
      flexDirection: 'column',
    },
    TR: {
      display: 'flex',
      flexDirection: 'row',
      flexShrink: 1,
    },
    TD: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 1,
    },
    TH: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 1,
      fontWeight: 'bold',
    },
  };

  if (reset) {
    for (const key of Object.keys(base)) {
      for (const style of Object.keys(base[key])) {
        if (
          style.startsWith('margin') ||
          style.startsWith('padding') ||
          style === 'fontSize'
        ) {
          delete (base as any)[key][style];
        }
      }
    }
    base.LI_bullet.display = 'none';
    (base.TABLE as any).borderCollapse = 'collapse';
    (base.TABLE as any).borderSpacing = 0;
  }

  if (overrides) {
    for (const key of Object.keys(overrides)) {
      // TODO: use StyleSheet.flatten, but it appears to be broken...
      base[key] = { ...base[key], ...overrides[key] };
    }
  }

  return StyleSheet.create(base);
};
