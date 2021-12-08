import { HtmlContent, HtmlElement } from './parse';
import { bucketElements, hasBlockContent } from './render';

const inlineElement: HtmlElement = {
  tag: 'span',
} as HtmlElement;

const blockElement: HtmlElement = {
  tag: 'div',
} as HtmlElement;

describe('render', () => {
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
});
