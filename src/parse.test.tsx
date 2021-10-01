import parseHtml, { convertElementStyle, convertStylesheet } from './parse';

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
    const expected = [
      '\nWelcome to your ',
      {
        tag: 'B',
        attributes: {},
        classNames: [],
        indexOfType: 0,
        parentTag: undefined,
        content: ['doom!'],
      },
      ':\n',
      {
        tag: 'P',
        attributes: {},
        classNames: [],
        indexOfType: 0,
        parentTag: undefined,
        content: [
          '\n    ',
          {
            tag: 'UL',
            attributes: {},
            classNames: [],
            parentTag: 'P',
            index: 1,
            indexOfType: 0,
            content: [
              '\n        ',
              {
                tag: 'LI',
                attributes: {},
                classNames: [],
                parentTag: 'UL',
                index: 1,
                indexOfType: 0,
                content: ['First item'],
              },
              '\n        ',
              {
                tag: 'LI',
                attributes: {},
                classNames: [],
                parentTag: 'UL',
                index: 3,
                indexOfType: 1,
                content: [
                  'Second item: ',
                  {
                    tag: 'A',
                    attributes: {
                      href: 'http://google.com',
                    },
                    classNames: [],
                    parentTag: 'LI',
                    index: 1,
                    indexOfType: 0,
                    content: ['google.com'],
                  },
                ],
              },
              '\n    ',
            ],
          },
          '\n',
        ],
      },
      '\n      ',
    ];

    expect(result).toEqual(expected);
  });
});
