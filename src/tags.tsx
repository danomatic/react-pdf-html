import React from 'react';
import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';
import { TagElement } from './parseHtml';

const emToPx = (em: string) => parseFloat(em) * 12;

export const styles = StyleSheet.create({
  h1: {
    fontSize: emToPx('2em'),
    marginVertical: emToPx('0.67em'),
    fontWeight: 'bold',
  },
  h2: {
    fontSize: emToPx('1.5em'),
    marginVertical: emToPx('0.83em'),
    fontWeight: 'bold',
  },
  h3: {
    fontSize: emToPx('1.17em'),
    marginVertical: emToPx('1em'),
    fontWeight: 'bold',
  },
  h4: {
    fontSize: emToPx('1em'),
    marginVertical: emToPx('1.33em'),
    fontWeight: 'bold',
  },
  h5: {
    fontSize: emToPx('.83em'),
    marginVertical: emToPx('1.67em'),
    fontWeight: 'bold',
  },
  h6: {
    fontSize: emToPx('.67em'),
    marginVertical: emToPx('2.33em'),
    fontWeight: 'bold',
  },
  P: {
    display: 'flex',
    flexDirection: 'column',
    marginVertical: emToPx('1em'),
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
  S: {
    textDecoration: 'line-through',
  },
  U: {
    textDecoration: 'underline',
  },
  UL: {
    display: 'flex',
    flexDirection: 'column',
    marginVertical: emToPx('1em'),
  },
  OL: {
    display: 'flex',
    flexDirection: 'column',
    marginVertical: emToPx('1em'),
  },
  LI: {
    display: 'flex',
    flexDirection: 'row',
  },
  LIBullet: {
    width: 30,
    textAlign: 'right',
    flexShrink: 0,
    flexGrow: 0,
    paddingRight: 5,
  },
  LIContent: {
    textAlign: 'left',
    flexGrow: 1,
  },
});

export type TagValue =
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5'
  | 'H6'
  | 'DIV'
  | 'P'
  | 'B'
  | 'STRONG'
  | 'I'
  | 'U'
  | 'S'
  | 'A'
  | 'UL'
  | 'OL'
  | 'LI'
  | 'TABLE'
  | 'TR'
  | 'TD';

export const isBlock: Record<TagValue, boolean> = {
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,

  DIV: true,
  P: true,

  B: false,
  STRONG: false,
  I: false,
  U: false,
  S: false,

  A: false,

  TABLE: true,
  TR: true,
  TD: true,

  UL: true,
  OL: true,
  LI: true,
};

const defaultBlock: React.FC<TagElement> = ({ tag, children }) => (
  <View style={(styles as any)[tag]}>{children}</View>
);

const defaultInline: React.FC<TagElement> = ({ tag, children }) => (
  <Text style={(styles as any)[tag]}>{children}</Text>
);

const tags: Record<TagValue, React.FC<TagElement>> = {
  H1: defaultBlock,
  H2: defaultBlock,
  H3: defaultBlock,
  H4: defaultBlock,
  H5: defaultBlock,
  H6: defaultBlock,

  DIV: defaultBlock,
  P: defaultBlock,

  B: defaultInline,
  STRONG: defaultInline,
  I: defaultInline,
  U: defaultInline,
  S: defaultInline,

  TABLE: defaultBlock,
  TR: defaultBlock,
  TD: defaultBlock,

  UL: defaultBlock,
  OL: defaultBlock,
  LI: ({ parentTag, indexOfKind, children }) => {
    const ordered = parentTag === 'OL';
    return (
      <View style={styles.LI}>
        <View style={styles.LIBullet}>
          <Text>
            {ordered && typeof indexOfKind === 'number'
              ? indexOfKind + 1 + '.'
              : '•'}
          </Text>
        </View>
        <Text style={styles.LIContent}>{children}</Text>
      </View>
    );
  },
  A: ({ content }) => (
    <Link style={styles.U} src={content[0] as string}>
      {content[0]}
    </Link>
  ),
};

export default tags;
