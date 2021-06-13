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

export const getClassStyles = (classNames: string, stylesheet: HtmlStyles) =>
  classNames
    .split(/(\s+)/g)
    .filter((className) => className !== '' && className in stylesheet)
    .map((className) => stylesheet[className]);

export const defaultRenderer: HtmlContentRenderer = (
  element: HtmlElement | string,
  stylesheets: HtmlStyles[],
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
      console.warn(`Excluding "${element.tag}" because it has no renderer`);
      Element = renderNoop;
    } else {
      Element = hasBlockContent(element) ? renderBlock : renderInline;
    }
  }
  return (
    <Element
      key={index}
      style={element.style}
      children={children}
      element={element}
      stylesheets={stylesheets}
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
          options.stylesheets,
          options.renderers,
          undefined,
          index
        );
      }
      return options.renderer(
        element,
        options.stylesheets,
        options.renderers,
        renderElements(
          element.content,
          element.tag === 'pre' ? { ...options, collapse: false } : options,
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

export const applyStylesheets = (
  stylesheets: HtmlStyles[],
  rootElement: HtmlElement
) => {
  stylesheets.forEach((stylesheet) => {
    for (const selector of Object.keys(stylesheet)) {
      const elements = rootElement.querySelectorAll(selector) as HtmlElement[];
      elements.forEach((element) => {
        element.style.unshift(stylesheet[selector]);
      });
    }
  });
};

export type HtmlRenderer = React.FC<{
  element: HtmlElement;
  style: Style[];
  stylesheets: HtmlStyles[];
}>;

export type HtmlRenderers = Record<Tag | string, HtmlRenderer>;

export type HtmlContentRenderer = (
  element: HtmlElement | string,
  stylesheets: HtmlStyles[],
  renderers: HtmlRenderers,
  children?: any,
  index?: number
) => ReactElement | string;

export type HtmlRenderOptions = {
  collapse: boolean;
  renderer: HtmlContentRenderer;
  renderers: HtmlRenderers;
  style: (Style | undefined)[];
  stylesheets: HtmlStyles[];
  resetStyles: boolean;
};

const renderHtml = (
  text: string,
  options: Partial<HtmlRenderOptions> = {}
): ReactElement => {
  const defaultFontSize = 18;
  const fontSizeStyle = { fontSize: defaultFontSize };
  if (options.style) {
    options.style.forEach((style) => {
      if (!style) {
        return;
      }
      if (style.fontSize === 'number') {
        fontSizeStyle.fontSize = (style.fontSize as unknown) as number;
      }
      if (style.fontSize === 'string' && style.fontSize.endsWith('px')) {
        fontSizeStyle.fontSize = parseInt(style.fontSize, 10);
      }
    });
  }
  const defaults: HtmlRenderOptions = {
    collapse: true,
    renderer: defaultRenderer,
    renderers,
    style: [],
    stylesheets: [],
    resetStyles: false,
  };
  const baseStyles = createHtmlStylesheet(
    fontSizeStyle.fontSize,
    options.resetStyles
  );
  const parsed = parseHtml(text);

  const opts = {
    ...defaults,
    ...options,
    renderers: { ...options.renderers, ...defaults.renderers },
    stylesheets: [
      baseStyles,
      ...(options.stylesheets || []),
      ...parsed.stylesheets,
    ],
  };

  applyStylesheets(opts.stylesheets, parsed.rootElement);

  return (
    <View style={{ ...options.style, ...fontSizeStyle }}>
      {renderElements(parsed.rootElement.content, opts)}
    </View>
  );
};

export default renderHtml;
