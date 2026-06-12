// Root index page: renders the prototype catalog from the manifest
// (the same manifest that drives the Vite build entries — ADR-0004).

import { prototypes } from './prototypes-manifest';

const list = document.querySelector('#prototype-list');
if (list) {
  if (prototypes.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent =
      'No prototypes yet — add one under src/prototypes/ and register it in src/prototypes-manifest.ts.';
    list.appendChild(li);
  }
  for (const proto of prototypes) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `./src/prototypes/${proto.id}/index.html`;
    a.textContent = proto.title;
    const p = document.createElement('p');
    p.textContent = proto.description;
    li.appendChild(a);
    li.appendChild(p);
    list.appendChild(li);
  }
}
