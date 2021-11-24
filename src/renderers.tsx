import React from 'react';
import { Link, Text, View, Image } from '@react-pdf/renderer';
import { HtmlRenderer, HtmlRenderers } from './render';
import { HtmlElement } from './parse';
import { HtmlStyle } from './styles';

export const renderNoop: HtmlRenderer = ({ children }) => <></>;

export const renderPassThrough: HtmlRenderer = ({ children }) => (
  <>{children}</>
);

export const renderBlock: HtmlRenderer = ({ style, children }) => (
  <View style={style}>{children}</View>
);

export const renderInline: HtmlRenderer = ({ style, children }) => (
  <Text style={style}>{children}</Text>
);

export const renderCell: HtmlRenderer = ({ style, element, children }) => {
  const table = element.closest('table') as HtmlElement | undefined;
  if (!table) {
    throw new Error('td element rendered outside of a table');
  }
  const tableStyles = table.style.reduce(
    (combined, tableStyle) => Object.assign(combined, tableStyle),
    {} as HtmlStyle
  );
  const baseStyles: HtmlStyle = {
    border: tableStyles.border,
    borderColor: tableStyles.borderColor,
    borderWidth: tableStyles.borderWidth,
    borderStyle: tableStyles.borderStyle,
  };
  if (
    (tableStyles as any).borderSpacing &&
    (tableStyles as any).borderCollapse !== 'collapse'
  ) {
    baseStyles.width = tableStyles.borderWidth;
    baseStyles.margin = (tableStyles as any).borderSpacing;
  } else {
    baseStyles.borderRightWidth = 0;
    baseStyles.borderBottomWidth = 0;
    if (element.indexOfType !== 0) {
      baseStyles.borderLeftWidth = tableStyles.borderWidth;
      baseStyles.borderTopWidth = tableStyles.borderWidth;
    }
  }

  const overrides: HtmlStyle = {};
  if (element.attributes && element.attributes.colspan) {
    const colspan = parseInt(element.attributes.colspan, 10);
    if (!isNaN(colspan)) {
      overrides.flexBasis = colspan;
    }
  }

  return <View style={[baseStyles, ...style, overrides]}>{children}</View>;
};

const renderers: HtmlRenderers = {
  style: renderNoop,
  script: renderNoop,
  html: renderPassThrough,
  li: ({ element, stylesheets, style, children }) => {
    const bulletStyles = stylesheets.map((stylesheet) => stylesheet.li_bullet);
    const contentStyles = stylesheets.map(
      (stylesheet) => stylesheet.li_content
    );
    const list: HtmlElement = element.closest('ol, ul') as HtmlElement;
    const ordered = list?.tag === 'ol' || element.parentNode.tag === 'ol';
    const listStyle =
      list?.style?.reduce(
        (combined, listStyle) => Object.assign(combined, listStyle),
        {} as HtmlStyle
      ) || {};
    const itemStyle = element.style.reduce(
      (combined, itemStyle) => Object.assign(combined, itemStyle),
      {} as HtmlStyle
    );
    const listStyleType =
      itemStyle.listStyleType ||
      itemStyle.listStyle ||
      listStyle.listStyleType ||
      listStyle.listStyle ||
      '';

    let bullet;
    if (listStyleType.includes('none')) {
      bullet = false;
    } else if (listStyleType.includes('url(')) {
      bullet = (
        <Image
          src={listStyleType.match(/\((.*?)\)/)[1].replace(/(['"])/g, '')}
        />
      );
    } else if (ordered) {
      bullet = <Text>{element.indexOfType + 1}.</Text>;
    } else {
      // if (listStyleType.includes('square')) {
      //   bullet = <Text>■</Text>;
      // } else {
      bullet = <Text>•</Text>;
      // }
    }

    return (
      <View style={style}>
        {bullet && <View style={bulletStyles}>{bullet}</View>}
        <Text style={contentStyles}>{children}</Text>
      </View>
    );
  },
  a: ({ style, element, children }) => (
    <Link style={style} src={element.attributes.href}>
      {children}
    </Link>
  ),
  img: ({ style, element }) => (
    <Image style={style} src={element.attributes.src} />
  ),
  table: ({ element, style, children }) => {
    const tableStyles = element.style.reduce(
      (combined, tableStyle) => Object.assign(combined, tableStyle),
      {} as HtmlStyle
    );
    const overrides: HtmlStyle = {};
    if (
      !(tableStyles as any).borderSpacing ||
      (tableStyles as any).borderCollapse === 'collapse'
    ) {
      overrides.borderLeftWidth = 0;
      overrides.borderTopWidth = 0;
    }

    return <View style={[...style, overrides]}>{children}</View>;
  },
  tr: ({ style, children }) => (
    <View wrap={false} style={style}>
      {children}
    </View>
  ),
  br: ({ style }) => (
    <Text wrap={false} style={style}>
      {'\n'}
    </Text>
  ),
  td: renderCell,
  th: renderCell,
};

export default renderers;
