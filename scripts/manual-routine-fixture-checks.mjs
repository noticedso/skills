import assert from 'node:assert/strict';

// Restore only a contiguous successful prefix. A later failed scenario may have
// mutated report.state, so resume from the last retained scenario's checkpoint.
export function prepareResume(previous, initialState, retainedIds, sourceHash) {
  const resumed = { state: structuredClone(initialState), results: [], trace: [], skip: new Set() };
  if (!previous) return resumed;
  assert.equal(previous.sourceHash, sourceHash, 'Cannot retain traces from different skill sources');
  for (const id of retainedIds) {
    const matches = previous.results.filter(result => result.id === id);
    const result = matches[0];
    if (matches.length !== 1 || result.passed !== true || !result.stateAfter) break;
    resumed.results.push(structuredClone(result));
    resumed.state = structuredClone(result.stateAfter);
    resumed.skip.add(id);
  }
  resumed.trace = structuredClone(previous.trace.filter(call => resumed.skip.has(call.scenario)));
  return resumed;
}

// Check individual answers/reasons, not aggregate counters. Callers pass only
// reads before the completion write so a later fetch cannot justify early learning.
export function assertReviewEvidence(calls, listId, expectedAnswers) {
  const pageSize = 10;
  const pages = Math.ceil(expectedAnswers.length / pageSize);
  const reads = calls.filter(call => call.name === 'get_list_reviews' && call.args.list_id === listId);
  for (let page = 1; page <= pages; page++) {
    const read = reads.findLast(call => (call.args.page ?? 1) === page);
    assert.ok(read, `${listId}: missing review page ${page}`);
    assert.equal(read.result.page, page, `${listId}: response page`);
    assert.equal(read.result.pageSize, pageSize, `${listId}: pageSize`);
    assert.equal(read.result.hasMore, page < pages, `${listId}: hasMore on page ${page}`);
    assert.deepEqual(read.result.answers, expectedAnswers.slice((page - 1) * pageSize, page * pageSize), `${listId}: answers on page ${page}`);
  }
}
