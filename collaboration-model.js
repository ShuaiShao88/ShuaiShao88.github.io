/* Shared by the diagram, accessible table, and model checks. */
(function (root) {
  'use strict';

  function buildNetwork(publications, people, scope = 'all') {
    const peopleById = new Map(people.map(person => [person.id, person]));
    const works = publications.filter(work => {
      const inScope = scope === 'all' || work.group === scope;
      return inScope && work.authorIds?.includes('shao');
    });
    const nodesById = new Map();
    const edgesByPair = new Map();

    works.forEach(work => {
      const ids = [...new Set(work.authorIds)].filter(id => peopleById.has(id));
      ids.forEach(id => {
        if (!nodesById.has(id)) nodesById.set(id, { ...peopleById.get(id), works: [] });
        nodesById.get(id).works.push(work);
      });
      ids.forEach((source, index) => ids.slice(index + 1).forEach(target => {
        const pair = [source, target].sort();
        const key = pair.join(':');
        if (!edgesByPair.has(key)) edgesByPair.set(key, { source: pair[0], target: pair[1], count: 0 });
        edgesByPair.get(key).count += 1;
      }));
    });

    const countStatuses = items => ({
      publishedCount: items.filter(work => work.group === 'published').length,
      underReviewCount: items.filter(work => work.group === 'review' && work.kind !== 'proposal').length,
      proposalCount: items.filter(work => work.kind === 'proposal').length
    });
    const nodes = [...nodesById.values()].map(node => ({
      ...node, sharedCount: node.works.length, ...countStatuses(node.works)
    }));
    const collaborators = nodes.filter(node => node.id !== 'shao').sort((a, b) =>
      b.sharedCount - a.sharedCount || a.name.localeCompare(b.name)
    );
    return {
      nodes, collaborators, works, edges: [...edgesByPair.values()],
      workCount: works.length, collaboratorCount: collaborators.length,
      ...countStatuses(works)
    };
  }

  if (typeof module === 'object' && module.exports) module.exports = { buildNetwork };
  else root.portfolioNetwork = { buildNetwork };
})(typeof window === 'undefined' ? {} : window);
