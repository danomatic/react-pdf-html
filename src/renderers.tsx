import React from 'react';
import { Link, Text, View, Image } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { HtmlRenderer, HtmlRenderers } from './renderHtml';

export const renderNoop: HtmlRenderer = ({ children }) => <></>;

export const renderBlock: HtmlRenderer = ({ style, children }) => (
  <View style={style}>{children}</View>
);

export const renderInline: HtmlRenderer = ({ style, children }) => (
  <Text style={style}>{children}</Text>
);

export const renderCell: HtmlRenderer = ({
  stylesheet,
  style,
  element,
  children,
}) => {
  const tableStyles = stylesheet.TABLE || {};
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
    if (element.indexOfKind !== 0) {
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
  LI: ({ element, stylesheet, style, children }) => {
    const ordered = element.parentTag === 'OL';
    return (
      <View style={style}>
        <View style={stylesheet.LI_bullet}>
          <Text>
            {ordered && typeof element.indexOfKind === 'number'
              ? element.indexOfKind + 1 + '.'
              : '•'}
          </Text>
        </View>
        <Text style={stylesheet.LI_content}>{children}</Text>
      </View>
    );
  },
  A: ({ style, element, children }) => (
    <Link style={style} src={element.attributes.href}>
      {children}
    </Link>
  ),
  IMG: ({ style, element }) => (
    <Image style={style} src={element.attributes.src} />
  ),
  TABLE: ({ stylesheet, style, children }) => {
    const tableStyles = stylesheet.TABLE || {};
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
  TD: renderCell,
  TH: renderCell,
};

export default renderers;
