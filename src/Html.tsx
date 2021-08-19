import React, { useMemo } from 'react';
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
  return useMemo(
    () => <>{renderHtml(props.children, props)}</>,
    [
      props.collapse,
      ...Object.values(props.renderers || {}),
      ...(Array.isArray(props.style) ? props.style : [props.style]),
      ...(Array.isArray(props.stylesheet)
        ? props.stylesheet
        : [props.stylesheet]),
      props.resetStyles,
      props.children,
    ]
  );
};

export default Html;
