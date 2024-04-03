import { fetchStylesheets } from './remoteCss.js';

describe('fetchStylesheets', () => {
  it('Should resolve remote stylesheets', async () => {
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

    const stylesheets = await fetchStylesheets(html);
    expect(stylesheets[0][':root']).toEqual({
      '-BsBreakpointXs': '0',
      '-BsBreakpointSm': '576px',
      '-BsBreakpointMd': '768px',
      '-BsBreakpointLg': '992px',
      '-BsBreakpointXl': '1200px',
      '-BsBreakpointXxl': '1400px',
    });
  });
});
