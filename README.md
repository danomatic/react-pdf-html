# react-pdf-html

`<Html>` component for [react-pdf](https://github.com/diegomura/react-pdf/)

- Support for CSS via `<style>` tags and `style` attributes (limited to `Style` properties supported by `react-pdf`)
- [Browser CSS defaults](https://www.w3schools.com/cssref/css_default_values.asp) with option for [style reset](https://meyerweb.com/eric/tools/css/reset/)
- Basic `<table>`(attempted using flex layouts) `<ul>` and `<ol>` support
- Ability to provide custom renderers for any tag
- Support for inline `<style>` tags and remote stylesheets (using fetch)

## How it Works

1. Parses the HTML string into a JSON tree of nodes using [node-html-parser](https://github.com/taoqf/node-html-parser)
2. Parses any `<style>` tags in the document and `style` attributes using [css-tree](https://github.com/csstree/csstree)
3. Renders all nodes using the appropriate `react-pdf` components, applying cascading styles for each node as an array passed to the `style` prop:
   - block/container nodes using `<View>`
   - inline/text nodes using `<Text>`, with appropriate nesting and collapsing of whitepace
   - `<img>` nodes using `<Image>`
   - `<a>` nodes using `<Link>`

## Installation

```bash
npm i react-pdf-html
```

OR

```bash
yarn add react-pdf-html
```

## Usage

```tsx
import Html from 'react-pdf-html';

const html = `<html>
  <body>
    <style>
      .my-heading4 {
        background: darkgreen;
        color: white;
      }
      pre {
        background-color: #eee;
        padding: 10px;
      }
    </style>
    <h1>Heading 1</h1>
    <h2 style="background-color: pink">Heading 2</h2>
    <h3>Heading 3</h3>
    <h4 class="my-heading4">Heading 4</h4>
    <p>
      Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u>,
      <s>strikethrough</s>,
      <strong><u><s><i>and all of the above</i></s></u></strong>
    </p>
    <p>
      Paragraph with image <img src="${myFile}" /> and
      <a href="http://google.com">link</a>
    </p>
    <hr />
    <ul>
      <li>Unordered item</li>
      <li>Unordered item</li>
    </ul>
    <ol>
      <li>Ordered item</li>
      <li>Ordered item</li>
    </ol>
    <br /><br /><br /><br /><br />
    Text outside of any tags
    <table>
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Foo</td>
          <td>Bar</td>
          <td>Foobar</td>
        </tr>
        <tr>
          <td colspan="2">Foo</td>
          <td>Bar</td>
        </tr>
        <tr>
          <td>Some longer thing</td>
          <td>Even more content than before!</td>
          <td>Even more content than before!</td>
        </tr>
      </tbody>
    </table>
    <div style="width: 200px; height: 200px; background: pink"></div>
    <pre>
function myCode() {
  const foo = 'bar';
}
</pre>
  </body>
</html>
`;

return (
  <Document>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);
```

## Rendering React Components

```tsx
import ReactDOMServer from 'react-dom/server';

const element = (
  <html>
    <body>
      <style>
        {`
        .heading4 {
          background: darkgreen;
          color: white;
        }
        pre {
          background-color: #eee;
          padding: 10px;
        }`}
      </style>
      <h1>Heading 1</h1>
      <h2 style={{ backgroundColor: 'pink' }}>Heading 2</h2>
      ...
    </body>
  </html>
);

const html = ReactDOMServer.renderToStaticMarkup(element);

return (
  <Document>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);
```

## Props

```ts
type HtmlProps = {
  children: string; // the HTML
  collapse?: boolean; // Default: true. Collapse whitespace. If false, render newlines as breaks
  renderers?: HtmlRenderers; // Mapping of { tagName: HtmlRenderer }
  style?: Style | Style[]; // Html root View style
  stylesheet?: HtmlStyles | HtmlStyles[]; // Mapping of { selector: Style }
  resetStyles?: false; // If true, style/CSS reset
};
```

## Overriding Element Styles

### Provide a Stylesheet

```tsx
const stylesheet = {
  // clear margins for all <p> tags
  p: {
    margin: 0,
  },
  // add pink background color to elements with class="special"
  ['.special']: {
    backgroundColor: 'pink',
  },
};

return (
  <Document>
    <Page>
      <Html stylesheet={stylesheet}>{html}</Html>
    </Page>
  </Document>
);
```

### Inline Styles

```tsx
const html = `<div style="width: 200px; height: 200px; background-color: pink">Foobar</div>`;

return (
  <Document>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);
```

### Remote Styles

Remote styles must be resolve asynchronously, outside of the React rendering,
because react-pdf doesn't support asynchronous rendering

```tsx
import { fetchStylesheets } from 'react-pdf-html';

const html = `<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
      crossorigin="anonymous" />
  </head>

  <body>
    <div></div>
  </body>
</html>`;

const stylesheets = await fetchStylesheets(html, {
    ...fetchOptions
});

...

return (
  <Document>
    <Page>
      <Html stylesheet={stylesheets}>{html}</Html>
    </Page>
  </Document>
);
```

## Resetting Styles

Reset browser default styles (see [CSS reset](https://meyerweb.com/eric/tools/css/reset/))

```tsx
return (
  <Document>
    <Page>
      <Html resetStyles>{html}</Html>
    </Page>
  </Document>
);
```

## Font Sizes

The default styesheet roughly matches browser defaults, using a rough emulation of ems:

```tsx
const em = (em: number, relativeSize: number = fontSize) => em * relativeSize;

StyleSheet.create({
  h1: {
    fontSize: em(2),
    marginVertical: em(0.67, em(2)),
    fontWeight: 'bold',
  },
  ...
});
```

By default, the basis for the font size ems is based on the `fontSize` from `props.style`:

```tsx
return (
  <Document>
    <Page>
      <Html style={{ fontSize: 10 }}>{html}</Html>
    </Page>
  </Document>
);
```

If this is not defined, it falls back to a default of `18`

## Fonts for bold, italic, etc.

Please note that `react-pdf` has some constraints with how fonts are applied (see https://react-pdf.org/fonts). You must provide a different font file for each combination of bold, italic, etc. For example:

```ts
Font.register({
  family: 'OpenSans',
  fonts: [
    { src: fonts + '/Open_Sans/OpenSans-Regular.ttf' },
    { src: fonts + '/Open_Sans/OpenSans-Bold.ttf', fontWeight: 'bold' },
    { src: fonts + '/Open_Sans/OpenSans-Italic.ttf', fontStyle: 'italic' },
    {
      src: fonts + '/Open_Sans/OpenSans-BoldItalic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});
```
