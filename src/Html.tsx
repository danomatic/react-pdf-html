import React, { useMemo } from 'react';
import renderHtml, { HtmlRenderers } from './renderHtml';
import { Style } from '@react-pdf/types';
import { HtmlStyles } from './styles';

export type HtmlProps = {
  collapse?: boolean;
  renderers?: HtmlRenderers;
  style?: Style | (Style | undefined)[];
  stylesheet?: HtmlStyles | HtmlStyles[];
  resetStyles?: boolean;
  children: string;
};

const Html: React.FC<HtmlProps> = (props) => {
  return useMemo(
    () => <>{renderHtml(props.children, props)}</>,
    Object.values(props)
  );
};

export default Html;
