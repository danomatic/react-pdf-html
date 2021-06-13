# react-pdf Html Component

Render HTML in [react-pdf](https://github.com/diegomura/react-pdf/)

- Support for CSS using in-document `<style>` tags and element `style` attributes (but only style properties supported by `react-pdf`)
- Browser style defaults with option for style reset
- Basic `<ul>`, `<ol>` and `<table>`(attempted using flex) support
- Ability to provide custom renderers for any tag

## How it Works

1. Uses [node-html-parser](https://github.com/taoqf/node-html-parser) to parse the HTML into a JSON tree.
2. Parses any `<style>` tags in the document and `style` attributes
3. Renders the tree, applying all the styles and has a mapping of render functions. These can be overridden on a per tag basis using the `renderers` prop.

## Usage

```tsx
import { Html } from 'react-pdf-html'; // not yet available as an NPM package, so just download the files

const html = `<html>
  <body>
    <style>
      .my-heading4 {
        background: darkgreen;
        color: white;
      }
    </style>
    <h1>Heading 1</h1>
    <h2 style="background-color: pink">Heading 2</h2>
    <h3>Heading 3</h3>
    <h4 class="my-heading4">Heading 4</h4>
    <h5>Heading 5</h5>
    <h6>Heading 6</h6>
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
    const foo = 'bar';
    </pre>
    <code>const foo = 'bar';</code>
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

## Props

```ts
type HtmlProps = {
  children: string; // the HTML
  collapse: boolean; // Default: true. Collapse whitespace. If false, render newlines as breaks
  renderers: HtmlRenderers; // Mapping of { tagName: HtmlRenderer }
  style: Style[]; // Html root View style
  stylesheets: HtmlStyles[]; // Mapping of { selector: Style }
  resetStyles: false; // If true, style/CSS reset
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

## Resetting Styles

Reset styles (similar to [CSS reset](https://meyerweb.com/eric/tools/css/reset/))

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
