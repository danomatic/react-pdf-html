import {
  HTMLElement,
  Node as HTMLNode,
  NodeType,
  parse,
  TextNode,
} from 'node-html-parser';
import { Tag } from './tags';
import cssTree, { Block, Declaration, List, Rule, StyleSheet } from 'css-tree';
import supportedStyles from './supportedStyles';
import { HtmlStyle, HtmlStyles } from './styles';
const camelize = require('camelize');

export type HtmlContent = (HtmlElement | string)[];

export type HtmlElement = HTMLElement & {
  tag: Tag | 'string';
  parentNode: HtmlElement;
  style: HtmlStyle[];
  content: HtmlContent;
  indexOfType: number;
  querySelectorAll: (selector: string) => HtmlElement[];
  querySelector: (selector: string) => HtmlElement;
};

export const convertRule = (
  rule: Block,
  source: string = 'style'
): HtmlStyle => {
  const declarations = rule.children
    .filter((declaration) => declaration.type === 'Declaration')
    .toArray() as Declaration[];

  return declarations
    .map((entry) => ({
      ...entry,
      property: camelize(entry.property as string),
    }))
    .reduce((style, { property, value }: Declaration) => {
      let valueString = cssTree.generate(value);
      if (property && value) {
        if (property === 'fontFamily') {
          valueString = valueString.replace(/["']+/g, '');
          if (valueString.includes(',')) {
            const reduced = valueString.split(',', 2)[0];
            console.warn(
              `react-pdf doesn't support fontFamily lists like "${valueString}". Reducing to "${reduced}".`
            );
            valueString = reduced;
          }
        } else if (!supportedStyles.includes(property)) {
          if (
            (property === 'background' &&
              /^#?[a-zA-Z0-9]+$/.test(valueString)) ||
            /^rgba?\([0-9, ]+\)$/i.test(valueString) ||
            /^hsla?\([0-9.%, ]+\)$/i.test(valueString)
          ) {
            property = 'backgroundColor';
          } else {
            console.warn(`${source}: Found unsupported style "${property}"`, {
              property,
              value,
            });
          }
        }

        style[property as keyof HtmlStyle] = valueString;
      }
      return style;
    }, {} as HtmlStyle);
};

export const convertStylesheet = (stylesheet: string): HtmlStyles => {
  const response = {} as HtmlStyles;
  try {
    const parsed = cssTree.parse(stylesheet) as StyleSheet;
    const rules = parsed.children.filter(
      (rule) => rule.type === 'Rule' && rule.prelude?.type === 'SelectorList'
    ) as List<Rule>;
    rules.forEach((rule) => {
      const style = convertRule(rule.block);
      if (rule.prelude.type !== 'SelectorList') {
        return;
      }
      rule.prelude.children.forEach((selector) => {
        const selectorString = cssTree.generate(selector);
        response[selectorString] = style;
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
): HtmlStyle | undefined => {
  try {
    const parsed = cssTree.parse(`${tag} { ${styleAttr} }`) as StyleSheet;
    const rules = parsed.children.filter(
      (rule) => rule.type === 'Rule' && rule.prelude?.type === 'SelectorList'
    ) as List<Rule>;
    const firstRule = rules.first();
    return firstRule ? convertRule(firstRule.block, tag) : undefined;
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

  let style: HtmlStyle | undefined;
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
