import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareResume, assertReviewEvidence } from './manual-routine-fixture-checks.mjs';

const ids = ['prepare', 'retry', 'learn'];
const initial = { lists: [] };
const report = (results) => ({ sourceHash: 'same', state: { lists: ['invalid failed mutation'] }, results, trace: ids.map(scenario => ({ scenario })) });
const passed = id => ({ id, passed: true, stateAfter: { lists: [id] } });

test('failed retained scenario reruns from the last successful checkpoint', () => {
  const resumed = prepareResume(report([passed('prepare'), { id: 'retry', passed: false }]), initial, ids, 'same');
  assert.deepEqual([...resumed.skip], ['prepare']);
  assert.deepEqual(resumed.state, { lists: ['prepare'] });
  assert.deepEqual(resumed.results.map(r => r.id), ['prepare']);
  assert.deepEqual(resumed.trace.map(t => t.scenario), ['prepare']);
});
test('missing scenarios and their dependents cannot be skipped', () => {
  const resumed = prepareResume(report([passed('prepare'), passed('learn')]), initial, ids, 'same');
  assert.deepEqual([...resumed.skip], ['prepare']);
});
test('failure of the first scenario restarts from initial state', () => {
  const resumed = prepareResume(report([{ id: 'prepare', passed: false }]), initial, ids, 'same');
  assert.deepEqual([...resumed.skip], []);
  assert.deepEqual(resumed.state, initial);
});
test('legacy success without a state checkpoint reruns safely', () => {
  assert.deepEqual([...prepareResume(report([{ id: 'prepare', passed: true }]), initial, ids, 'same').skip], []);
});
test('a full successful prefix restores its own checkpoint, not later mutated state', () => {
  const resumed = prepareResume(report(ids.map(passed)), initial, ids, 'same');
  assert.deepEqual([...resumed.skip], ids);
  assert.deepEqual(resumed.state, { lists: ['learn'] });
});
test('different source hashes are rejected', () => {
  assert.throws(() => prepareResume(report([]), initial, ids, 'different'), /different skill sources/);
});

const answers = Array.from({ length: 25 }, (_, i) => ({ relationshipId: `person-${i}`, answer: 'yes', notes: `Reason ${i}` }));
const pages = [1, 2, 3].map(page => ({ name: 'get_list_reviews', args: { list_id: 'list', page }, result: { page, pageSize: 10, hasMore: page < 3, answers: answers.slice((page - 1) * 10, page * 10) } }));
test('all three correct pages supply the complete 25-person review evidence', () => {
  assert.doesNotThrow(() => assertReviewEvidence(pages, 'list', answers));
});
test('aggregate totals on page one cannot establish complete review evidence', () => {
  assert.throws(() => assertReviewEvidence([pages[0]], 'list', answers), /page 2/);
});
test('a page read for another list cannot fill the missing page', () => {
  const wrong = structuredClone(pages); wrong[1].args.list_id = 'other';
  assert.throws(() => assertReviewEvidence(wrong, 'list', answers), /page 2/);
});
test('all page numbers with duplicate or foreign relationship IDs are rejected', () => {
  const wrong = structuredClone(pages); wrong[2].result.answers[0].relationshipId = answers[0].relationshipId;
  assert.throws(() => assertReviewEvidence(wrong, 'list', answers), /answers/);
});
test('missing reasons or altered verdicts are rejected', () => {
  const wrong = structuredClone(pages); wrong[2].result.answers[0].notes = 'invented';
  assert.throws(() => assertReviewEvidence(wrong, 'list', answers), /answers/);
});
test('a contradictory pagination envelope is rejected', () => {
  const wrong = structuredClone(pages); wrong[0].result.hasMore = false;
  assert.throws(() => assertReviewEvidence(wrong, 'list', answers), /hasMore/);
});
