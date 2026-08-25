const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const fail = msg => { throw new Error(msg); };

const spec = read('docs/ops/MASTER_SPEC_V2.md');
const matrix = read('docs/ops/REQUIREMENTS_MATRIX.md');
const control = read('app/js/control-plane.js');
const html = read('app/index.html');

for (const token of ['SPEC_FROZEN: true','IMPLEMENTATION + CONTRACT + INTEGRATION + TEST + EVIDENCE','OPERATIONAL','PARTIAL','BLOCKED']) {
  if (!spec.includes(token)) fail(`MASTER_SPEC missing required token: ${token}`);
}
for (const id of ['R-001','R-002','R-004','R-006','R-008','R-020','R-024']) {
  if (!matrix.includes(id)) fail(`requirements matrix missing ${id}`);
}
for (const token of ['STATES','MODES','transition','evidence','change','classify']) {
  if (!control.includes(token)) fail(`control plane missing ${token}`);
}
if (!html.includes('js/control-plane.js')) fail('control plane is not loaded by application shell');

const forbidden = /\b(?:TODO|FIXME|COMING SOON|PLACEHOLDER|TEMPORARY IMPLEMENTATION)\b/;
const files = ['app/js/control-plane.js'];
for (const file of files) if (forbidden.test(read(file))) fail(`forbidden placeholder token in ${file}`);

console.log('Governance contract checks: PASS');
