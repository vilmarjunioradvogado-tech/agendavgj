/* Gera o VGJ LAW em arquivo único (vgj-law.html) — CSS e todos os módulos JS embutidos.
 * Uso: node tools/build-single-html.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');
let html = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="css\/nave\.css">/, () => {
  const css = fs.readFileSync(path.join(appDir, 'css', 'nave.css'), 'utf8');
  return '<style>\n' + css + '\n</style>';
});

html = html.replace(/<script src="js\/([\w-]+)\.js"><\/script>/g, (_m, name) => {
  let js = fs.readFileSync(path.join(appDir, 'js', name + '.js'), 'utf8');
  if (js.includes('</script>')) throw new Error(name + '.js contém "</script>" — ajuste antes de embutir.');
  return '<script>\n' + js + '\n</script>';
});

html = html.replace('</head>', '<!-- Arquivo único gerado por tools/build-single-html.js — não edite à mão; edite app/ e gere de novo. -->\n</head>');

const out = path.join(__dirname, '..', 'vgj-law.html');
fs.writeFileSync(out, html);
console.log('gerado:', out, '(' + fs.statSync(out).size + ' bytes)');
