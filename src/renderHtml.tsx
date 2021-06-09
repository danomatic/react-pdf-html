import React, { ReactElement } from 'react';
import tags, { isBlock, TagValue } from './tags';
import { Text } from '@react-pdf/renderer';
import parseHtml, { TagContent, TagElement } from './parseHtml';

type ContentBucket = {
  hasBlock: boolean;
  content: TagContent;
};

export const hasBlockContent = (element: TagElement | string): boolean => {
  if (typeof element === 'string') {
    return false;
  }
  if (isBlock[element.tag as TagValue]) {
    return true;
  }
  if (element.content) {
    return !!element.content.find(hasBlockContent);
  }
  return false;
};

/**
 * Groups all blocka and non-block elements into buckets so that all non-block elements can be rendered in a parent Text element
 * @param elements
 */
export const bucketElements = (elements: TagContent): ContentBucket[] => {
  let bucket: ContentBucket;
  let hasBlock: boolean;
  const buckets: ContentBucket[] = [];
  elements.forEach((element) => {
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

export const renderer = (
  element: TagElement | string,
  children?: any,
  index?: number
): ReactElement | string => {
  if (typeof element === 'string') {
    return element;
  }
  const Element = tags[element.tag as TagValue];
  if (!Element) {
    throw new Error(`Tag ${element.tag} not yet supported`);
  }
  return children?.length > 0 ? (
    <Element key={index} {...element}>
      {children}
    </Element>
  ) : (
    <Element key={index} {...element} />
  );
};

const collapseWhitespace = (string: any): string =>
  string.replace(/(\s+)/g, ' ');

export const renderElements = (
  elements: TagContent,
  options: HtmlRenderOptions
): ReactElement[] => {
  const buckets = bucketElements(elements);
  return buckets.map((bucket, bucketIndex) => {
    const rendered = bucket.content.map((element, index) => {
      const isString = typeof element === 'string';
      return options.renderer(
        isString && options.collapse ? collapseWhitespace(element) : element,
        isString
          ? []
          : renderElements((element as TagElement).content, options),
        index
      );
    });
    return bucket.hasBlock ? (
      <React.Fragment key={bucketIndex}>{rendered}</React.Fragment>
    ) : (
      <Text key={bucketIndex}>{rendered}</Text>
    );
  });
};

export type ElementRenderer = (
  element: TagElement | string,
  children?: any,
  index?: number
) => ReactElement | string;

export type HtmlRenderOptions = {
  collapse: boolean;
  renderer: ElementRenderer;
};

const defaults: HtmlRenderOptions = {
  collapse: false,
  renderer,
};

const renderHtml = (
  text: string,
  options: Partial<HtmlRenderOptions> = {}
): ReactElement[] => {
  return renderElements(parseHtml(text), { ...defaults, ...options });
};

export default renderHtml;
