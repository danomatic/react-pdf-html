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
import { HtmlStyles } from './styles';
const camelize = require('camelize');

export type HtmlContent = (HtmlElement | string)[];

export type HtmlElement = HTMLElement & {
  tag: Tag | 'string';
  parentNode: HtmlElement;
  style: Style[];
  content: HtmlContent;
  indexOfType: number;
  querySelectorAll: (selector: string) => HtmlElement[];
  querySelector: (selector: string) => HtmlElement;
};

export const convertRule = (rule: Rule, source: string = 'style'): Style => {
  const declarations: Declaration[] =
    rule.declarations?.filter(
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
          if (
            (property === 'background' && /^#?[a-zA-Z0-9]+$/.test(value)) ||
            /^rgba?\([0-9, ]+\)$/i.test(value) ||
            /^hsla?\([0-9.%, ]+\)$/i.test(value)
          ) {
            property = 'backgroundColor';
          } else {
            console.warn(`${source}: Found unsupported style "${property}"`, {
              property,
              value,
            });
          }
        }

        style[property as keyof Style] = value;
      }
      return style;
    }, {} as Style);
};

export const convertStylesheet = (stylesheet: string): HtmlStyles => {
  const response = {} as HtmlStyles;
  try {
    const parsed = css.parse(stylesheet);
    const rules: Rule[] =
      parsed.stylesheet?.rules?.filter((rule) => rule.type === 'rule') || [];
    rules.forEach((rule) => {
      const style = convertRule(rule);
      rule.selectors?.forEach((selector) => {
        response[selector] = style;
      });
    });
  } catch (e) {
    console.error(`Error parsing stylesheet: "${stylesheet}"`, e);
  }
  return response;
};

export const convertElementStyle = (
  styleAttr: string,
  tag: string
): Style | undefined => {
  try {
    const parsed = css.parse(`${tag} { ${styleAttr} }`, {
      source: tag,
    });
    const rules: Rule[] =
      parsed.stylesheet?.rules?.filter((rule) => rule.type === 'rule') || [];
    const firstRule = rules.shift();
    return firstRule ? convertRule(firstRule, tag) : undefined;
  } catch (e) {
    console.error(
      `Error parsing style attribute "${styleAttr}" for tag: ${tag}`,
      e
    );
  }
};

export const convertNode = (node: HTMLNode): HtmlElement | string => {
  if (node.nodeType === NodeType.TEXT_NODE) {
    return (node as TextNode).rawText;
  }
  if (node.nodeType === NodeType.COMMENT_NODE) {
    return '';
  }
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    throw new Error('Not sure what this is');
  }
  const html = node as HTMLElement;
  const content = html.childNodes.map(convertNode);
  const kindCounters: Record<string, number> = {};
  content.forEach((child) => {
    if (typeof child !== 'string') {
      child.indexOfType =
        child.tag in kindCounters
          ? (kindCounters[child.tag] = kindCounters[child.tag] + 1)
          : (kindCounters[child.tag] = 0);
    }
  });

  let style: Style | undefined;
  if (html.attributes.style && html.attributes.style.trim()) {
    style = convertElementStyle(html.attributes.style, html.tagName);
  }

  return Object.assign(html, {
    tag: (html.tagName || '').toLowerCase() as Tag | string,
    style: style ? [style] : [],
    content,
    indexOfType: 0,
  }) as HtmlElement;
};

const parseHtml = (
  text: string
): { stylesheets: HtmlStyles[]; rootElement: HtmlElement } => {
  const html = parse(text, { comment: false });
  const stylesheets = html
    .querySelectorAll('style')
    .map((styleNode) =>
      styleNode.childNodes.map((textNode) => textNode.rawText.trim()).join('\n')
    )
    .filter((styleText) => !!styleText)
    .map(convertStylesheet);
  return {
    stylesheets,
    rootElement: convertNode(html) as HtmlElement,
  };
};

export default parseHtml;
