import React, { useMemo } from 'react';
import renderHtml, { HtmlRenderOptions } from './renderHtml';

export type HtmlProps = Partial<HtmlRenderOptions> & {
  children: string;
};

const Html: React.FC<HtmlProps> = (props) => {
  return useMemo(
    () => <>{renderHtml(props.children, props)}</>,
    Object.values(props)
  );
};

export default Html;
