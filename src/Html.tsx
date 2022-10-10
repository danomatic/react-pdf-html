import React from 'react';
import renderHtml, { HtmlRenderers } from './render';
import { HtmlStyle, HtmlStyles } from './styles';

export type HtmlProps = {
  collapse?: boolean;
  renderers?: HtmlRenderers;
  style?: HtmlStyle | (HtmlStyle | undefined)[];
  stylesheet?: HtmlStyles | HtmlStyles[];
  resetStyles?: boolean;
  children: string;
};

const Html: React.FC<HtmlProps> = (props) => {
  return <>{renderHtml(props.children, props)}</>;
};

export default Html;
