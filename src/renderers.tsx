import React from 'react';
import { Link, Text, View } from '@react-pdf/renderer';
import {HtmlRenderer, HtmlRenderers, Tag} from './renderHtml';

export const renderNoop: HtmlRenderer = ({ children }) => <></>;

export const renderBlock: HtmlRenderer = ({
  element,
  stylesheet,
  children,
}) => (
  <View style={(stylesheet as any)[element.tag]}>
    {children}
  </View>
);

export const renderInline: HtmlRenderer = ({
  element,
  stylesheet,
  children,
}) => <Text style={(stylesheet as any)[element.tag]}>{children}</Text>;

const renderers: HtmlRenderers = {
  HTML: renderNoop,
  HEAD: renderNoop,
  TITLE: renderNoop,
  LI: ({ element, stylesheet, children }) => {
    const ordered = element.parentTag === 'OL';
    return (
      <View style={stylesheet.LI}>
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
  A: ({ stylesheet, element, children }) => (
    <Link style={stylesheet.U} src={(element.content as unknown) as string}>
      {element.content}
    </Link>
  ),
};

export default renderers;
