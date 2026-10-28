(function () {
  'use strict';
  const root = document.querySelector('#collaborations');
  if (!root || root.hidden || !window.portfolioNetwork) return;

  const escape = value => String(value).replace(/[&<>"']/g, character =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])
  );
  const plural = (count, singular, multiple = `${singular}s`) => `${count} ${count === 1 ? singular : multiple}`;
  const canvas = root.querySelector('.network-canvas');
  const stage = root.querySelector('#network-stage');
  const tableBody = root.querySelector('#network-table-body');
  const detail = root.querySelector('#network-detail');
  const scope = root.querySelector('#network-scope');
  const summary = root.querySelector('#network-summary');
  const viewButtons = root.querySelectorAll('[data-network-view]');
  let network;
  let selectedId = 'shao';

  function statusText(node) {
    return [
      node.publishedCount && `${node.publishedCount} published / in press`,
      node.underReviewCount && `${node.underReviewCount} under review`,
      node.proposalCount && `${node.proposalCount} proposal under review`
    ].filter(Boolean).join(' · ');
  }

  function renderDiagram() {
    const positions = new Map([['shao', { x: 380, y: 270 }]]);
    network.collaborators.forEach((node, index, nodes) => {
      const angle = (-145 + index * 360 / nodes.length) * Math.PI / 180;
      positions.set(node.id, { x: 380 + 240 * Math.cos(angle), y: 270 + 180 * Math.sin(angle) });
    });
    const edges = network.edges.map(edge => {
      const source = positions.get(edge.source);
      const target = positions.get(edge.target);
      return `<line data-source="${escape(edge.source)}" data-target="${escape(edge.target)}" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke-width="${1 + edge.count * 0.7}"/>`;
    }).join('');
    const nodes = network.nodes.map(node => {
      const position = positions.get(node.id);
      const isSelf = node.id === 'shao';
      const diameter = isSelf ? 106 : 54 + Math.min(node.sharedCount - 1, 5) * 8;
      const classes = `network-node${isSelf ? ' network-self' : ''}${!isSelf && !node.publishedCount ? ' network-review' : ''}`;
      const label = isSelf ? `Shuai Shao, overview of ${plural(network.workCount, 'listed work')}` : `${node.name}, ${plural(node.sharedCount, 'shared work')}. ${statusText(node)}`;
      return `<button type="button" class="${classes}" data-person="${escape(node.id)}" aria-pressed="${node.id === selectedId}" aria-label="${escape(label)}" style="left:${position.x / 7.6}%;top:${position.y / 5.6}%;width:${diameter}px;height:${diameter}px"><span class="network-node-value" aria-hidden="true">${isSelf ? 'SS' : node.sharedCount}</span><span class="network-node-label" aria-hidden="true">${escape(node.name)}${isSelf ? `<small>${plural(network.workCount, 'listed work')}</small>` : ''}</span></button>`;
    }).join('');
    stage.innerHTML = `<svg viewBox="0 0 760 560" preserveAspectRatio="none" aria-hidden="true" focusable="false">${edges}</svg>${nodes}`;
  }

  function renderTable() {
    tableBody.innerHTML = network.collaborators.map(node =>
      `<tr data-network-row="${escape(node.id)}"><th scope="row"><button type="button" data-person="${escape(node.id)}" aria-pressed="${node.id === selectedId}" aria-label="${escape(`View shared work with ${node.name}`)}">${escape(node.name)}</button><span class="network-table-status">${escape(statusText(node))}</span></th><td>${node.sharedCount}</td></tr>`
    ).join('');
  }

  function renderDetail() {
    const person = network.nodes.find(node => node.id === selectedId);
    if (!person || selectedId === 'shao') {
      detail.innerHTML = `<p class="eyebrow">THE PEOPLE BEHIND THE WORK</p><h4 id="network-detail-title">Explore the connections.</h4><p>Select a coauthor to see our shared work and its publication status.</p><dl class="network-status-counts"><div><dt>Published &amp; in press</dt><dd>${network.publishedCount}</dd></div><div><dt>Manuscripts under review</dt><dd>${network.underReviewCount}</dd></div><div><dt>Proposals under review</dt><dd>${network.proposalCount}</dd></div></dl>`;
      return;
    }
    const works = person.works.map(work => {
      const title = escape(work.title);
      const safeURL = work.url && /^https:\/\//.test(work.url);
      return `<li><span class="network-work-status${work.group === 'review' ? ' network-work-review' : ''}">${escape(work.status)}</span><p>${safeURL ? `<a href="${escape(work.url)}" target="_blank" rel="noopener noreferrer">${title} <span aria-hidden="true">↗</span></a>` : title}</p><span class="network-work-venue">${escape(work.venue)}</span></li>`;
    }).join('');
    detail.innerHTML = `<p class="eyebrow">SHARED WORK WITH</p><h4 id="network-detail-title">${escape(person.name)}</h4><p class="network-person-summary">${plural(person.sharedCount, 'shared work')} · ${escape(statusText(person))}</p><ol class="network-work-list">${works}</ol><button type="button" class="network-reset" data-person="shao">Back to overview <span aria-hidden="true">↗</span></button>`;
  }

  function updateSelection() {
    root.querySelectorAll('[data-person]').forEach(button => {
      if (button.classList.contains('network-reset')) return;
      button.setAttribute('aria-pressed', String(button.dataset.person === selectedId));
    });
    root.querySelectorAll('[data-network-row]').forEach(row =>
      row.classList.toggle('network-row-selected', row.dataset.networkRow === selectedId)
    );
    stage.querySelectorAll('line').forEach(line => {
      const connected = line.dataset.source === selectedId || line.dataset.target === selectedId;
      line.classList.toggle('network-edge-selected', connected);
    });
    renderDetail();
    detail.scrollTop = 0;
  }

  function renderNetwork() {
    network = window.portfolioNetwork.buildNetwork(window.portfolioPublications || [], window.portfolioPeople || [], scope.value);
    if (!network.nodes.some(node => node.id === selectedId)) selectedId = 'shao';
    summary.textContent = `${plural(network.collaboratorCount, 'coauthor')} across ${plural(network.workCount, 'listed work')}`;
    renderDiagram();
    renderTable();
    updateSelection();
  }

  scope.addEventListener('change', () => {
    renderNetwork();
    scope.scrollIntoView({ block: 'nearest' });
  });
  viewButtons.forEach(button => button.addEventListener('click', () => {
    viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    root.querySelector('#network-diagram-view').hidden = button.dataset.networkView !== 'diagram';
    root.querySelector('#network-table-view').hidden = button.dataset.networkView !== 'table';
    button.scrollIntoView({ block: 'nearest' });
  }));
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-person]');
    if (!button) return;
    selectedId = button.dataset.person;
    updateSelection();
    const person = network.nodes.find(node => node.id === selectedId);
    root.querySelector('#network-announcement').textContent = selectedId === 'shao' ? 'Showing collaboration overview.' : `Showing ${plural(person.sharedCount, 'shared work')} with ${person.name}.`;
    // Keep the selected work visible when a phone stacks the detail panel below the map.
    if (window.matchMedia('(max-width: 850px)').matches) detail.scrollIntoView({ block: 'nearest' });
  });

  root.classList.add('network-ready');
  renderNetwork();
  // Center the diagram initially on narrow screens; the canvas remains scrollable.
  canvas.scrollLeft = Math.max(0, (stage.offsetWidth - canvas.clientWidth) / 2);
})();
