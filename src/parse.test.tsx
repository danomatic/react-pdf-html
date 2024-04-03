import parseHtml, {
  convertElementStyle,
  convertStylesheet,
  HtmlElement,
} from './parse.js';

describe('parse', () => {
  describe('convertStylesheet', () => {
    it('Should convert CSS into HtmlStyles', () => {
      const content = `.my-heading4, #foobar, div > li {
        background: darkgreen;
        color: white;
      }
      div {
        span {
          fontWeight: bold;
        }
      }
      pre {
        background-color: #eee;
        padding: 10px;
      }`;

      const result = convertStylesheet(content);
      const expected = {
        '.my-heading4': {
          backgroundColor: 'darkgreen',
          color: 'white',
        },
        '#foobar': {
          backgroundColor: 'darkgreen',
          color: 'white',
        },
        div: {
          // TODO: support nested styles
        },
        'div>li': {
          backgroundColor: 'darkgreen',
          color: 'white',
        },
        pre: {
          backgroundColor: '#eee',
          padding: '10px',
        },
      };

      expect(result).toEqual(expected);
    });

    it('Should handle empty', () => {
      const content = ``;

      const result = convertStylesheet(content);
      const expected = {};

      expect(result).toEqual(expected);
    });
  });

  describe('convertElementStyle', () => {
    it('Should convert element CSS into HtmlStyle', () => {
      const content = `background: darkgreen;color: white;bogus: nope`;

      const result = convertElementStyle(content, 'div');
      const expected = {
        backgroundColor: 'darkgreen',
        bogus: 'nope',
        color: 'white',
      };

      expect(result).toEqual(expected);
    });

    it('Should handle empty', () => {
      const content = ``;

      const result = convertElementStyle(content, 'div');
      const expected = {};

      expect(result).toEqual(expected);
    });
  });

  describe('parseHtml', () => {
    it('Should convert HTML into a JSON tree', () => {
      const content = `
Welcome to your <b>doom!</b>:
<p>
    <ul>
        <li>First item</li>
        <li>Second item: <a href="http://google.com">google.com</a></li>
    </ul>
</p>
      `;

      const result = parseHtml(content);
      const root = result.rootElement;
      expect(root.content[0]).toEqual('\nWelcome to your ');
      expect((root.content[1] as HtmlElement).tag).toEqual('b');
      expect((root.content[1] as HtmlElement).content).toEqual(['doom!']);
      expect(root.content[2]).toEqual(':\n');

      const paragraph = root.content[3] as HtmlElement;
      expect(paragraph.tag).toEqual('p');
      expect(paragraph.content[0]).toEqual('\n    ');

      const list = paragraph.content[1] as HtmlElement;
      expect(list.tag).toEqual('ul');

      const listItem1 = list.content[1] as HtmlElement;
      expect(listItem1.tag).toBe('li');
      expect(listItem1.content).toEqual(['First item']);
      expect(listItem1.indexOfType).toEqual(0);

      const listItem2 = list.content[3] as HtmlElement;
      expect(listItem2.tag).toBe('li');
      expect(listItem2.content[0]).toEqual('Second item: ');
      expect(listItem2.indexOfType).toEqual(1);

      const link = listItem2.content[1] as HtmlElement;
      expect(link.tag).toBe('a');
      expect(link.attributes.href).toBe('http://google.com');
      expect(link.content).toEqual(['google.com']);
    });
  });
});
