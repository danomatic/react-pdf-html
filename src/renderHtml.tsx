import React, { ReactElement } from 'react';
import renderers, { renderBlock, renderInline, renderNoop } from './renderers';
import { Text, View } from '@react-pdf/renderer';
import parseHtml, { HtmlContent, HtmlElement } from './parseHtml';
import { createHtmlStylesheet, HtmlStyles } from './styles';
import { Style } from '@react-pdf/types';

export type Tag =
  | 'HTML'
  | 'BODY'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5'
  | 'H6'
  | 'DIV'
  | 'P'
  | 'BLOCKQUOTE'
  | 'ARTICLE'
  | 'CAPTION'
  | 'FORM'
  | 'HR'
  | 'BR'
  | 'ADDRESS'
  | 'ASIDE'
  | 'PRE'
  | 'B'
  | 'STRONG'
  | 'I'
  | 'EM'
  | 'U'
  | 'S'
  | 'CITE'
  | 'CODE'
  | 'ABBR'
  | 'A'
  | 'IMG'
  | 'UL'
  | 'OL'
  | 'LI'
  | 'TABLE'
  | 'TR'
  | 'TD'
  | 'TH'
  | 'THEAD'
  | 'TBODY';

export const isBlock: Record<Tag, boolean> = {
  HTML: true,
  BODY: true,
  H1: true,
  H2: true,
  H3: true,
  H4: true,
  H5: true,
  H6: true,

  DIV: true,
  P: true,
  BLOCKQUOTE: true,
  ARTICLE: true,
  CAPTION: true,
  FORM: true,
  HR: true,
  BR: true,
  ADDRESS: true,
  ASIDE: true,
  PRE: true,

  B: false,
  STRONG: false,
  I: false,
  EM: false,
  U: false,
  S: false,
  CITE: false,
  CODE: false,
  ABBR: false,

  A: false,
  IMG: false,

  TABLE: true,
  TR: true,
  TD: true,
  TH: true,
  THEAD: true,
  TBODY: true,

  UL: true,
  OL: true,
  LI: true,
};

type ContentBucket = {
  hasBlock: boolean;
  content: HtmlContent;
};

export const hasBlockContent = (element: HtmlElement | string): boolean => {
  if (typeof element === 'string') {
    return false;
  }
  if (isBlock[element.tag as Tag]) {
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
 */
export const bucketElements = (elements: HtmlContent): ContentBucket[] => {
  let bucket: ContentBucket;
  let hasBlock: boolean;
  const buckets: ContentBucket[] = [];
  elements.forEach((element, index) => {
    // clear empty strings between block elements
    if (typeof element === 'string') {
      if (hasBlock || hasBlock === undefined) {
        element = ltrim(element);
      }
      const next = elements[index + 1];
      if (next && hasBlockContent(next)) {
        element = rtrim(element);
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
  let Element: HtmlRenderer | undefined = renderers[element.tag as Tag];
  if (!Element) {
    if (!((element.tag as Tag) in isBlock)) {
      // Unknown element, do nothing
      Element = renderNoop;
    }
    Element = hasBlockContent(element) ? renderBlock : renderInline;
  }
  return (
    <Element
      key={index}
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
  parentIsBlock?: boolean
): ReactElement[] => {
  const buckets = bucketElements(elements);
  return buckets.map((bucket, bucketIndex) => {
    const rendered = bucket.content.map((element, index) => {
      const isString = typeof element === 'string';
      if (isString && options.collapse) {
        element = collapseWhitespace(element);
      }
      return options.renderer(
        element,
        options.stylesheet,
        options.renderers,
        isString
          ? undefined
          : renderElements(
              (element as HtmlElement).content,
              options,
              isBlock[(element as HtmlElement).tag as Tag]
            ),
        index
      );
    });
    return bucket.hasBlock || parentIsBlock === false ? (
      <React.Fragment key={bucketIndex}>{rendered}</React.Fragment>
    ) : (
      <Text key={bucketIndex}>{rendered}</Text>
    );
  });
};

export type HtmlRenderer = React.FC<{
  element: HtmlElement;
  stylesheet: HtmlStyles;
}>;

export type HtmlRenderers = Partial<Record<Tag, HtmlRenderer>>;

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
    resetStyles: false
  };
  const opts = {
    ...defaults,
    ...options,
    renderers: { ...options.renderers, ...defaults.renderers },
    stylesheet: createHtmlStylesheet(fontSize, options.resetStyles, options.stylesheet),
  };
  const parsed = parseHtml(text);

  return (
    <View style={{ ...options.style, fontSize }}>
      {renderElements(parsed, opts)}
    </View>
  );
};

export default renderHtml;
