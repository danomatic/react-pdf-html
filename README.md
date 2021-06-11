# react-pdf-html

Render HTML in react-pdf. It's never going to do everything a browser does, but it's inteded to be extensible.

Hopefully the author of `react-pdf` will simply incorpoerate it so that the community can continue to extend it.

## How it Works

1. Uses `node-html-parser` (see https://github.com/taoqf/node-html-parser) to parse the HTML into a JSON tree.
2. Converts the tree into a simplified, printable JSON structure (see [`HtmlElement`](https://github.com/danomatic/react-pdf-html/blob/589f4d02dcfefd9279535d6c1db0319f42c845b2/src/parseHtml.ts#L11))
3. Renders the tree with `renderHtml`, which has a mapping of render functions and styles. This can be overrideen using the `renderer` prop.

## Usage

```tsx
import { Html } from 'react-pdf-html'; // not yet available as an NPM package, so just download the files

const html = `<html>
  <body>
    <h1>Heading 1</h1>
    <h2 class="special">Heading 2</h2>
    <h3>Heading 3</h3>
    <h4>Heading 4</h4>
    <h5>Heading 5</h5>
    <h6>Heading 6</h6>
    <p>
      Paragraph with <strong>bold</strong>, <i>italic</i>, <u>underline</u>,
      <s>strikethrough</s>,
      <strong><u><s><i>and all of the above</i></s></u></strong>
    </p>
    <p>
      Paragraph with image <img src="${myImageFile}" /> and <a href="http://google.com/">link</a>
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
  </body>
</html>`;

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
  renderers: HtmlRenderers; // Mapping of { TAGNAME: renderComponent }
  style: Style; // Html root View style
  stylesheet: HtmlStyles; // Mapping of { TAGNAME: Style, className: Style }
};
```

## Overriding Element Styles

```tsx
const stylesheet = {
  P: {
    margin: 0, // clears margins for all <p> tags
  },
  special: {
    backgroundColor: 'pink', // adds pink background color to elements with class="special"
  },
};

return (
  <Document stylesheet={stylesheet}>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);
```

## Font Sizes

The default styesheet roughly matches browser defaults, using a rough emulation of ems:

```tsx
const em = (em: number, relativeSize: number = fontSize) => em * relativeSize;

StyleSheet.create({
  H1: {
    fontSize: em(2),
    marginVertical: em(0.67, em(2)),
    fontWeight: 'bold',
  },
  ...
});
```

By default, the basis for the font size ems is based on `props.style.fontSize`:

```tsx
return (
  <Document style={{ fontSize: 10 }}>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);
```

If this is not defined, it falls back to a default of `18`
