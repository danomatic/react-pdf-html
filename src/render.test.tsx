import React, { ReactElement } from 'react';
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

import {
  Text,
  View,
  Page,
  Document,
  Font,
  renderToString,
} from '@react-pdf/renderer';
import Html from './Html';
import path from 'path';

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

      const content = '<foo>Custom Content</foo>';
      const result = renderHtml(content, {
        renderers: {
          foo,
        },
      });

      /*
       * {
       *   VIEW
       *   props: {
       *    children: [
       *       {
       *         TEXT
       *         props: {
       *          children: [
       *             {
       *               FOO
       *            }
       *          ]
       *         }
       *       }
       *     ]
       *   }
       * }
       */

      expect(result.props.children[0].props.children[0].type).toBe(foo);
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
        Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u>,
        <s>strikethrough</s>,
    </p>
  </body>
</html>`;

      const document = (
        <Document>
          <Page size="LETTER">
            <>{renderHtml(html, {})}</>
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
