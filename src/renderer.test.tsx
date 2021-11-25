import renderHtml, { HtmlRenderers } from './render';
import { HtmlStyles } from './styles';

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
});
