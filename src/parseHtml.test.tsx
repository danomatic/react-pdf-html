import parseHtml from './parseHtml';

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
        hasBlockContent: false,
        indexOfKind: 0,
        parentTag: undefined,
        content: ['doom!'],
      },
      ':\n',
      {
        tag: 'P',
        attributes: {},
        hasBlockContent: true,
        indexOfKind: 0,
        parentTag: undefined,
        content: [
          '\n    ',
          {
            tag: 'UL',
            attributes: {},
            hasBlockContent: true,
            parentTag: 'P',
            index: 1,
            indexOfKind: 0,
            content: [
              '\n        ',
              {
                tag: 'LI',
                attributes: {},
                hasBlockContent: true,
                parentTag: 'UL',
                index: 1,
                indexOfKind: 0,
                content: ['First item'],
              },
              '\n        ',
              {
                tag: 'LI',
                attributes: {},
                hasBlockContent: true,
                parentTag: 'UL',
                index: 3,
                indexOfKind: 1,
                content: [
                  'Second item: ',
                  {
                    tag: 'A',
                    attributes: {
                      href: 'http://google.com',
                    },
                    hasBlockContent: false,
                    parentTag: 'LI',
                    index: 1,
                    indexOfKind: 0,
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
