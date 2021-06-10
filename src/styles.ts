import { StyleSheet } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { Tag } from './renderHtml';

export type HtmlStyles = Record<string, Style> & Partial<Record<Tag, Style>>;

export const createHtmlStylesheet = <T extends HtmlStyles>(
  fontSize: number,
  overrides?: T
): HtmlStyles => {
  const em = (em: number, relativeSize: number = fontSize) => em * relativeSize;

  return StyleSheet.create({
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
    ...overrides,
  });
};
