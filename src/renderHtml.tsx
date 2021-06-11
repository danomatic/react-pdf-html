import React, { ReactElement } from 'react';
import renderers, { renderBlock, renderInline, renderNoop } from './renderers';
import { Text, View } from '@react-pdf/renderer';
import parseHtml, { HtmlContent, HtmlElement } from './parseHtml';
import { createHtmlStylesheet, HtmlStyles } from './styles';
import { Style } from '@react-pdf/types';
import { isBlock, Tag } from './tags';

type ContentBucket = {
  hasBlock: boolean;
  content: HtmlContent;
};

export const hasBlockContent = (element: HtmlElement | string): boolean => {
  if (typeof element === 'string') {
    return false;
  }
  if (isBlock[element.tag]) {
    return true;
  }
  if (element.content) {
    return !!element.content.find(hasBlockContent);
  }
  return false;
};

const ltrim = (text: string): string => text.replace(/^\s+/, '');
const rtrim = (text: string): string => text.replace(/\s+$/, '');

/**
 * Groups all blocka and non-block elements into buckets so that all non-block elements can be rendered in a parent Text element
 * @param elements Elements to place in buckets of block and non-block content
 * @param parentTag
 */
export const bucketElements = (
  elements: HtmlContent,
  parentTag?: Tag | string
): ContentBucket[] => {
  let bucket: ContentBucket;
  let hasBlock: boolean;
  const buckets: ContentBucket[] = [];
  elements.forEach((element, index) => {
    // clear empty strings between block elements
    if (typeof element === 'string') {
      if (parentTag === 'PRE') {
        if (element[0] === '\n') {
          element = element.substr(1);
        }
        if (element[element.length - 1] === '\n') {
          element = element.substr(0, element.length - 1);
        }
      } else {
        if (hasBlock || hasBlock === undefined) {
          element = ltrim(element);
        }
        const next = elements[index + 1];
        if (next && hasBlockContent(next)) {
          element = rtrim(element);
        }
      }
      if (element === '') {
        return;
      }
    }
    const block = hasBlockContent(element);
    if (block !== hasBlock) {
      hasBlock = block;
      bucket = {
        hasBlock,
        content: [],
      };
      buckets.push(bucket);
    }
    bucket.content.push(element);
  });

  return buckets;
};

export const getClassStyles = (classNames: string[], stylesheet: HtmlStyles) =>
  classNames
    .filter((className) => className in stylesheet)
    .map((className) => stylesheet[className]);

export const defaultRenderer: HtmlContentRenderer = (
  element: HtmlElement | string,
  stylesheet: HtmlStyles,
  renderers: HtmlRenderers,
  children?: any,
  index?: number
): ReactElement | string => {
  if (typeof element === 'string') {
    return element;
  }
  let Element: HtmlRenderer | undefined = renderers[element.tag];
  if (!Element) {
    if (!(element.tag in isBlock)) {
      // Unknown element, do nothing
      Element = renderNoop;
    }
    Element = hasBlockContent(element) ? renderBlock : renderInline;
  }
  const style = [
    stylesheet[element.tag],
    ...getClassStyles(element.classNames, stylesheet),
  ];
  return (
    <Element
      key={index}
      style={style}
      children={children}
      element={element}
      stylesheet={stylesheet}
    />
  );
};

const collapseWhitespace = (string: any): string =>
  string.replace(/(\s+)/g, ' ');

export const renderElements = (
  elements: HtmlContent,
  options: HtmlRenderOptions,
  parentTag?: Tag | string
): ReactElement[] => {
  const buckets = bucketElements(elements, parentTag);
  return buckets.map((bucket, bucketIndex) => {
    const rendered = bucket.content.map((element, index) => {
      if (typeof element === 'string') {
        if (options.collapse) {
          element = collapseWhitespace(element);
        }
        return options.renderer(
          element,
          options.stylesheet,
          options.renderers,
          undefined,
          index
        );
      }
      return options.renderer(
        element,
        options.stylesheet,
        options.renderers,
        renderElements(
          element.content,
          element.tag === 'PRE' ? { ...options, collapse: false } : options,
          element.tag
        ),
        index
      );
    });
    const parentIsBlock = parentTag && isBlock[parentTag] === false;
    return bucket.hasBlock || parentIsBlock ? (
      <React.Fragment key={bucketIndex}>{rendered}</React.Fragment>
    ) : (
      <Text key={bucketIndex}>{rendered}</Text>
    );
  });
};

export type HtmlRenderer = React.FC<{
  element: HtmlElement;
  style: Style[];
  stylesheet: HtmlStyles;
}>;

export type HtmlRenderers = Record<Tag | string, HtmlRenderer>;

export type HtmlContentRenderer = (
  element: HtmlElement | string,
  stylesheet: HtmlStyles,
  renderers: HtmlRenderers,
  children?: any,
  index?: number
) => ReactElement | string;

export type HtmlRenderOptions = {
  collapse: boolean;
  renderer: HtmlContentRenderer;
  renderers: HtmlRenderers;
  style: Style;
  stylesheet: HtmlStyles;
  resetStyles: boolean;
};

const renderHtml = (
  text: string,
  options: Partial<HtmlRenderOptions> = {}
): ReactElement => {
  const defaultFontSize = 18;
  const fontSize =
    typeof options.style?.fontSize === 'number'
      ? options.style.fontSize
      : defaultFontSize;
  const defaults: HtmlRenderOptions = {
    collapse: true,
    renderer: defaultRenderer,
    renderers,
    style: {},
    stylesheet: {},
    resetStyles: false,
  };
  const opts = {
    ...defaults,
    ...options,
    renderers: { ...options.renderers, ...defaults.renderers },
    stylesheet: createHtmlStylesheet(
      fontSize,
      options.resetStyles,
      options.stylesheet
    ),
  };
  const parsed = parseHtml(text);

  return (
    <View style={{ ...options.style, fontSize }}>
      {renderElements(parsed, opts)}
    </View>
  );
};

export default renderHtml;
