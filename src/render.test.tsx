import React, { ReactElement, ReactNode } from 'react';
const stringify = require('json-stringify-safe');
import { HtmlContent, HtmlElement } from './parse';
import renderHtml, {
  bucketElements,
  collapseWhitespace,
  hasBlockContent,
} from './render';

const scrub = (object: any) => {
  if (Array.isArray(object)) {
    object.forEach(scrub);
  } else if (object && typeof object === 'object') {
    if (object.parentNode) {
      delete object.parentNode;
    }
    if (object.childNodes) {
      delete object.childNodes;
    }
    Object.keys(object).forEach((key) => scrub(object[key]));
  }
};

import ReactPDF, {
  Text,
  View,
  Page,
  Document,
  Font,
  renderToString,
} from '@react-pdf/renderer';
import path from 'path';
import renderers, { renderBlock, renderPassThrough } from './renderers';

const inlineElement: HtmlElement = {
  tag: 'span',
} as HtmlElement;

const blockElement: HtmlElement = {
  tag: 'div',
} as HtmlElement;

describe('render', () => {
  describe('collapseWhitespace', () => {
    it('Should reduce all continuous whitespace to a single space', () => {
      expect(collapseWhitespace('\n\n foo  \t  bar  ')).toBe(' foo bar ');
    });
  });

  describe('bucketElements', () => {
    it('Should bucket elements and trim strings correctly with collapse: true', () => {
      const stringContent = `  foo
      bar
      
      `;

      const elements: HtmlContent = [
        blockElement,
        blockElement,
        inlineElement,
        stringContent,
        blockElement,
      ];

      const bucketed = bucketElements(elements, true);

      expect(bucketed).toEqual([
        { hasBlock: true, content: [blockElement, blockElement] },
        { hasBlock: false, content: [inlineElement, '  foo\n      bar'] },
        { hasBlock: true, content: [blockElement] },
      ]);
    });

    it('Should bucket elements and not trim strings with collapse: false', () => {
      const stringContent = `  foo
      bar
      
      `;

      const elements: HtmlContent = [
        blockElement,
        blockElement,
        inlineElement,
        stringContent,
        blockElement,
      ];

      const bucketed = bucketElements(elements, false);

      expect(bucketed).toEqual([
        { hasBlock: true, content: [blockElement, blockElement] },
        { hasBlock: false, content: [inlineElement, stringContent] },
        { hasBlock: true, content: [blockElement] },
      ]);
    });
  });

  describe('hasBlockContent', () => {
    it('Should return false for string elements', () => {
      expect(hasBlockContent('')).toBe(false);
    });

    it('Should return false for inline elements', () => {
      expect(hasBlockContent(inlineElement)).toBe(false);
    });

    it('Should return true for block elements', () => {
      expect(hasBlockContent(blockElement)).toBe(true);
    });

    it('Should return true if any children of element are block level', () => {
      const mysteryElementWithBlockContent: HtmlElement = {
        tag: 'foo' as any,
        content: [blockElement],
      } as HtmlElement;
      expect(hasBlockContent(mysteryElementWithBlockContent)).toBe(true);
    });

    it('Should return false if not block element and no children are block level', () => {
      const mysteryElement: HtmlElement = {
        tag: 'foo' as any,
      } as HtmlElement;
      expect(hasBlockContent(mysteryElement)).toBe(false);

      const mysteryElementWithInlineContent: HtmlElement = {
        tag: 'foo' as any,
        content: [inlineElement],
      } as HtmlElement;
      expect(hasBlockContent(mysteryElementWithInlineContent)).toBe(false);
    });
  });

  describe('renderHtml', () => {
    it('Should use a custom renderer', () => {
      const foo = jest.fn();

      const html = '<foo>Custom Content</foo>';
      const result = renderHtml(html, {
        renderers: {
          foo,
        },
      });

      const rootView = result;
      expect(result.type).toBe(View);

      const rootFragment = rootView.props.children[0];
      expect(rootFragment.type).toBe(React.Fragment);

      expect(rootFragment.props.children.length).toBe(1);

      const firstChild = rootFragment.props.children[0];
      expect(firstChild.type).toBe(foo);
    });

    it('Should render a link with text inside it', () => {
      const html = '<a href="http://google.com">link text</a>';
      const result = renderHtml(html);

      const rootView = result;
      expect(result.type).toBe(View);

      const rootFragment = rootView.props.children[0];
      expect(rootFragment.type).toBe(React.Fragment);

      expect(rootFragment.props.children.length).toBe(1);

      const a = rootFragment.props.children[0];
      expect(a.type).toBe(renderers.a);
      expect(a.props.element.tag).toBe('a');

      const aText = a.props.children[0];
      expect(aText.type).toBe(Text);
      expect(aText.props.children).toEqual(['link text']);
    });

    it('Should render inline elements with proper text wrapper', () => {
      const html = `<p>Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u> and <s>strikethrough</s></p>`;
      const result = renderHtml(html);

      const rootView = result;
      expect(result.type).toBe(View);

      const rootFragment = rootView.props.children[0];
      expect(rootFragment.type).toBe(React.Fragment);

      expect(rootFragment.props.children.length).toBe(1);

      const p = rootFragment.props.children[0];
      expect(p.props.element.tag).toBe('p');
      expect(p.type).toBe(renderBlock);

      const pText = p.props.children[0];
      expect(pText.type).toBe(Text);
      expect(pText.props.children.length).toBe(8);
    });

    it('Should render a PDF with custom font without errors', async () => {
      const fonts = path.resolve(__dirname, 'fonts');

      Font.clear();
      Font.register({
        family: 'Open Sans',
        fonts: [
          { src: fonts + '/Open_Sans/OpenSans-Regular.ttf' },
          { src: fonts + '/Open_Sans/OpenSans-Bold.ttf', fontWeight: 'bold' },
          {
            src: fonts + '/Open_Sans/OpenSans-Italic.ttf',
            fontStyle: 'italic',
          },
          {
            src: fonts + '/Open_Sans/OpenSans-BoldItalic.ttf',
            fontWeight: 'bold',
            fontStyle: 'italic',
          },
        ],
      });

      await Font.load({ fontFamily: 'Open Sans' });

      const html = `<html>
  <style>
    body {
      font-family: 'Open Sans';
    }
  </style>
  <body>
    <p>
        Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u> and <s>strikethrough</s>
        <img src="https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80" />
    </p>
  </body>
</html>`;

      const result = renderHtml(html);

      const rootView = result;
      expect(result.type).toBe(View);

      const rootFragment = rootView.props.children[0];
      expect(rootFragment.type).toBe(React.Fragment);
      expect(rootFragment.props.children.length).toBe(1);

      const firstChild = rootFragment.props.children[0];
      expect(firstChild.type).toBe(renderPassThrough); // html
      expect(firstChild.props.children.length).toBe(1);

      const htmlChildrenFragment = firstChild.props.children[0];
      expect(htmlChildrenFragment.type).toBe(React.Fragment);

      const body = htmlChildrenFragment.props.children[1];
      expect(body.type).toBe(renderBlock);
      expect(body.props.element.tag).toBe('body');
      expect(body.props.children.length).toBe(1);

      const bodyChildrenFragment = body.props.children[0];
      expect(bodyChildrenFragment.type).toBe(React.Fragment);
      expect(bodyChildrenFragment.props.children.length).toBe(1);

      const p = bodyChildrenFragment.props.children[0];
      expect(p.props.element.tag).toBe('p');
      expect(p.type).toBe(renderBlock);
      expect(p.props.children.length).toBe(2);

      const pText = p.props.children[0];
      expect(pText.type).toBe(Text);
      expect(pText.props.children.length).toBe(9);

      const image = p.props.children[1];
      expect(image.element.tag).toBe('img');
      expect(image.type).toBe(renderers.img);

      // pText.props.children.forEach((child: any) => {
      //   if (typeof child === 'string') {
      //     console.log(`"${child}"`);
      //   } else {
      //     console.log(child.props?.element?.tag, child.type);
      //   }
      // });

      const document = (
        <Document>
          <Page size="LETTER">
            <>{result}</>
          </Page>
        </Document>
      );

      try {
        const pdfString = await renderToString(document);
        // console.log(pdfString);
      } catch (e) {
        fail(e);
      }
    });
  });
});
