import {
  HTMLElement,
  Node as HTMLNode,
  NodeType,
  parse,
} from 'node-html-parser';

export type TagContent = (TagElement | string)[];

export type TagElement = {
  tag: string;
  attributes: Record<string, string>;
  content: TagContent;
  parentTag?: string;
  index?: number;
  indexOfKind?: number;
};

export const fromHtmlElement = (node: HTMLNode): TagElement | string => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return node.innerText;
  }
  if (node.nodeType === NodeType.COMMENT_NODE) {
    return '';
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    throw new Error('Not sure what this is');
  }
  const html = node as HTMLElement;
  const tag = html.tagName;
  const content = html.childNodes.map(fromHtmlElement);
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
    content,
    parentTag: undefined,
    indexOfKind: 0,
  };
};

const parseHtml = (text: string): TagContent => {
  const html = parse(text);
  return html.childNodes.map(fromHtmlElement);
};

export default parseHtml;
