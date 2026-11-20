export function staticPaths(html, root) {
  return html.replace(/(\s(?:href|src|poster|action|data-src)=")\/(?!\/)([^"]*)"/g, (_, attribute, value) => {
    const [path] = value.split(/[?#]/, 1);
    const directory = path && !path.startsWith('assets/') ? path + '/' : path;
    return attribute + root + directory + value.slice(path.length) + '"';
  });
}
