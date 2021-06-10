import React from 'react';
import { Link, Text, View, Image } from '@react-pdf/renderer';
import { HtmlRenderer, HtmlRenderers, Tag } from './renderHtml';
import { HtmlStyles } from './styles';

export const renderNoop: HtmlRenderer = ({ children }) => <></>;

export const getClassStyles = (classNames: string[], stylesheet: HtmlStyles) =>
  classNames
    .filter((className) => className in stylesheet)
    .map((className) => stylesheet[className]);

export const renderBlock: HtmlRenderer = ({
  element,
  stylesheet,
  children,
}) => (
  <View
    style={[
      (stylesheet as any)[element.tag],
      ...getClassStyles(element.classNames, stylesheet),
    ]}
  >
    {children}
  </View>
);

export const renderInline: HtmlRenderer = ({
  element,
  stylesheet,
  children,
}) => (
  <Text
    style={[
      (stylesheet as any)[element.tag],
      ...getClassStyles(element.classNames, stylesheet),
    ]}
  >
    {children}
  </Text>
);

const renderers: HtmlRenderers = {
  LI: ({ element, stylesheet, children }) => {
    const ordered = element.parentTag === 'OL';
    return (
      <View
        style={[
          (stylesheet as any)[element.tag],
          ...getClassStyles(element.classNames, stylesheet),
        ]}
      >
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
    <Link style={stylesheet.U} src={element.attributes.href}>
      {children}
    </Link>
  ),
  IMG: ({ stylesheet, element }) => (
    <Image style={stylesheet.IMAGE} src={element.attributes.src} />
  ),
};

export default renderers;
