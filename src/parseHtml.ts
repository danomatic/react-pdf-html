import {
  HTMLElement,
  Node as HTMLNode,
  NodeType,
  parse,
  TextNode,
} from 'node-html-parser';
import { Style } from '@react-pdf/types';
import { Tag } from './tags';
import css, { Declaration, Rule } from 'css';
import supportedStyles from './supportedStyles';
const camelize = require('camelize');

export type HtmlContent = (HtmlElement | string)[];

export type HtmlElement = {
  tag: Tag | string;
  attributes: Record<string, string>;
  style?: Style;
  classNames: string[];
  content: HtmlContent;
  parentTag?: string;
  index?: number;
  indexOfKind?: number;
};

export const convertStyle = (
  styleAttr: string,
  tag: string
): Style | undefined => {
  try {
    const parsed = css.parse(`${tag} { ${styleAttr} }`, {
      source: tag,
    });
    const rules: Rule[] =
      parsed.stylesheet?.rules?.filter((rule) => rule.type === 'rule') || [];
    const declarations: Declaration[] =
      rules
        .shift()
        ?.declarations?.filter(
          (declaration) => declaration.type === 'declaration'
        ) || [];
    return declarations
      .map((entry) => ({
        ...entry,
        property: camelize(entry.property as string),
      }))
      .reduce((style, { property, value }) => {
        if (property && value) {
          if (!property || !supportedStyles.includes(property)) {
            if (property === 'background' && /^(#|)[a-zA-Z0-9]+$/.test(value)) {
              property = 'backgroundColor';
            } else {
              console.warn(
                `${tag}: Found unsupported style "${property}"`,
                { property, value }
              );
            }
          }

          style[property as keyof Style] = value;
        }
        return style;
      }, {} as Style);
  } catch (e) {
    console.error(
      `Error parsing style attribute "${styleAttr}" for tag: ${tag}`,
      e
    );
  }
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

  let style: Style | undefined;
  if (html.attributes.style && html.attributes.style.trim()) {
    style = convertStyle(html.attributes.style, tag);
    console.log(tag, style);
  }

  return {
    tag,
    attributes: html.attributes,
    style,
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
