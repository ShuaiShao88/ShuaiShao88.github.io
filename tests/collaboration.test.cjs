const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildNetwork } = require('../collaboration-model.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8'), context);
const publications = JSON.parse(JSON.stringify(context.window.portfolioPublications));
const people = JSON.parse(JSON.stringify(context.window.portfolioPeople));

test('all listed work connects seven coauthors and counts each shared work once', () => {
  const network = buildNetwork(publications, people);
  assert.equal(network.workCount, 6);
  assert.equal(network.collaboratorCount, 7);
  assert.equal(network.nodes.find(node => node.id === 'zhang').sharedCount, 4);
  assert.equal(network.nodes.find(node => node.id === 'qian').sharedCount, 1);
  assert.equal(network.edges.find(edge => edge.source === 'shah' && edge.target === 'zhang').count, 4);
  assert.equal(network.edges.some(edge => edge.source === edge.target), false);
});

test('published filter excludes every submission and proposal-only coauthor', () => {
  const network = buildNetwork(publications, people, 'published');
  assert.equal(network.workCount, 3);
  assert.deepEqual(network.collaborators.map(node => node.id).sort(), ['shah', 'zhang', 'zhou']);
  assert.equal(network.underReviewCount, 0);
  assert.equal(network.proposalCount, 0);
  assert.ok(network.edges.every(edge => edge.count === 3));
});

test('proposals remain separate from manuscripts under review', () => {
  const network = buildNetwork(publications, people, 'review');
  assert.equal(network.workCount, 3);
  assert.equal(network.publishedCount, 0);
  assert.equal(network.underReviewCount, 2);
  assert.equal(network.proposalCount, 1);
  const wang = network.nodes.find(node => node.id === 'wang');
  assert.equal(wang.proposalCount, 1);
  assert.equal(wang.underReviewCount, 0);
  assert.equal(wang.works[0].status, 'Proposal under review');
});

test('every listed publication has mapped coauthors', () => {
  const ids = new Set(people.map(person => person.id));
  for (const work of publications) {
    assert.ok(work.authorIds.includes('shao'), work.title);
    assert.equal(work.authorIds.length, new Set(work.authorIds).size, work.title);
    assert.ok(work.authorIds.every(id => ids.has(id)), work.title);
  }
});

test('duplicate credits do not inflate ties and unrelated work is excluded', () => {
  const work = { group: 'published', authorIds: ['shao', 'shah', 'shah'] };
  const unrelated = { group: 'published', authorIds: ['wang', 'shah'] };
  const network = buildNetwork([work, unrelated], people);
  assert.equal(network.workCount, 1);
  assert.equal(network.collaboratorCount, 1);
  assert.equal(network.nodes.find(node => node.id === 'shah').sharedCount, 1);
  assert.equal(network.edges.length, 1);
  assert.equal(network.edges[0].count, 1);
});

test('an empty publication group has no fabricated people or relationships', () => {
  const network = buildNetwork([], people);
  assert.equal(network.workCount, 0);
  assert.equal(network.collaboratorCount, 0);
  assert.deepEqual(network.nodes, []);
  assert.deepEqual(network.edges, []);
});
