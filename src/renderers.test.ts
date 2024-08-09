import { childElements, getMaxColumns, getRows } from './renderers';
import NodeType from 'node-html-parser/dist/nodes/type';
import { HtmlElement } from './parse';

const table = {
  nodeType: NodeType.ELEMENT_NODE,
  tagName: 'table',
  attributes: {},
  childNodes: [
    {
      nodeType: NodeType.ELEMENT_NODE,
      tagName: 'thead',
      attributes: {},
      childNodes: [
        {
          nodeType: NodeType.ELEMENT_NODE,
          tagName: 'tr',
          attributes: {},
          childNodes: [
            {
              nodeType: NodeType.ELEMENT_NODE,
              tagName: 'td',
              attributes: {},
              childNodes: [],
            },
            {
              nodeType: NodeType.ELEMENT_NODE,
              tagName: 'td',
              attributes: {},
              childNodes: [],
            },
          ],
        },
      ],
    },
    {
      nodeType: NodeType.ELEMENT_NODE,
      tagName: 'tbody',
      childNodes: [
        {
          nodeType: NodeType.ELEMENT_NODE,
          tagName: 'tr',
          attributes: {},
          childNodes: [
            {
              nodeType: NodeType.ELEMENT_NODE,
              tagName: 'td',
              attributes: {
                colspan: 2,
              },
              childNodes: [],
            },
          ],
        },
        {
          nodeType: NodeType.ELEMENT_NODE,
          tagName: 'tr',
          attributes: {},
          childNodes: [
            {
              nodeType: NodeType.ELEMENT_NODE,
              tagName: 'td',
              attributes: {},
              childNodes: [],
            },
          ],
        },
      ],
    },
  ],
} as unknown as HtmlElement;

describe('renderers', () => {
  describe('childElements', () => {
    it('Should find child elements matching specified tag names', () => {
      const result = childElements(table, ['tbody']);

      expect(result[0]).toBe(table.childNodes[1]);
    });
  });

  describe('getRows', () => {
    it('Should get all rows in a table', () => {
      expect(getRows(table).length).toBe(3);
    });
  });

  describe('getMaxColumns', () => {
    it('Should count max number of columns in a table', () => {
      expect(getMaxColumns(table)).toBe(2);
    });
  });
});
