# react-pdf-html
Render HTML in react-pdf. It's never going to do everything a browser does, but it's inteded to be extensible.

Hopefully the author of `react-pdf` will simply incorpoerate it so that the community can continue to extend it.

## How it Works
1. Use `node-html-parser` (see https://github.com/taoqf/node-html-parser) to parse the HTML into a JSON tree.
2. Convert the tree into a simplified, printable JSON structure (see `TagElement` below)
3. Render the tree with `renderHtml`, which has a mapping of render functions and styles. This can be overrideen using the `renderer` prop.

## Props
```ts
type HtmlProps = {
  children: string; // the HTML
  collapse: boolean;
  renderer: ElementRenderer;
};

type ElementRenderer = (
  element: TagElement | string,
  children?: any,
  index?: number
) => ReactElement | string;

type TagElement = {
  tag: string;
  attributes: Record<string, string>;
  content: TagContent;
  parentTag?: string;
  index?: number;
  indexOfKind?: number;
};

type TagContent = (TagElement | string)[];
```

## Usage
```jsx
<Html collapse={false}>{htmlText}</Html>
```
