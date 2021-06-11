import {
  HTMLElement,
  Node as HTMLNode,
  NodeType,
  parse,
  TextNode,
} from 'node-html-parser';
import { Tag } from './tags';

export type HtmlContent = (HtmlElement | string)[];

export type HtmlElement = {
  tag: Tag | string;
  attributes: Record<string, string>;
  classNames: string[];
  content: HtmlContent;
  parentTag?: string;
  index?: number;
  indexOfKind?: number;
};

export const convertNode = (node: HTMLNode): HtmlElement | string => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return (node as TextNode).innerText;
  }
  if (node.nodeType === NodeType.COMMENT_NODE) {
    return '';
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    throw new Error('Not sure what this is');
  }
  const html = node as HTMLElement;
  const tag = html.tagName;
  const content = html.childNodes.map(convertNode);
  const kindCounters: Record<string, number> = {};
  content.forEach((child, index) => {
    if (typeof child !== 'string') {
      child.parentTag = tag;
      child.index = index;
      child.indexOfKind =
        child.tag in kindCounters
          ? (kindCounters[child.tag] = kindCounters[child.tag] + 1)
          : (kindCounters[child.tag] = 0);
    }
  });

  return {
    tag,
    attributes: html.attributes,
    classNames: html.classNames.split(/(\s+)/g).filter((value) => value !== ''),
    content,
    parentTag: undefined,
    indexOfKind: 0,
  };
};

const parseHtml = (text: string): HtmlContent => {
  const html = parse(text);
  return html.childNodes.map(convertNode);
};

export default parseHtml;
