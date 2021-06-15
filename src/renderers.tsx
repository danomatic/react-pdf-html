import React from 'react';
import { Link, Text, View, Image } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { HtmlRenderer, HtmlRenderers } from './renderHtml';
import { HtmlElement } from './parseHtml';

export const renderNoop: HtmlRenderer = ({ children }) => <></>;

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
    {} as Style
  );
  const baseStyles: Style = {
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

  const overrides: Style = {};
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
  li: ({ element, stylesheets, style, children }) => {
    const bulletStyles = stylesheets.map((stylesheet) => stylesheet.li_bullet);
    const contentStyles = stylesheets.map(
      (stylesheet) => stylesheet.li_content
    );
    const ordered = element.parentNode.tag === 'ol';
    return (
      <View style={style}>
        <View style={bulletStyles}>
          <Text>{ordered ? element.indexOfType + 1 + '.' : '•'}</Text>
        </View>
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
      {} as Style
    );
    const overrides: Style = {};
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
    <View wrap={false} style={style}>
      <Text> </Text>
    </View>
  ),
  td: renderCell,
  th: renderCell,
};

export default renderers;
