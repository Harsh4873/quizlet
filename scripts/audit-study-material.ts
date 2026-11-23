import { createOwnerBasilCsStatsSet } from '../src/lib/owner-set';
import { EXAM_DECKS } from '../src/lib/sample';
import { extractStudyMaterial } from '../src/lib/extract';

for (const set of [...EXAM_DECKS, createOwnerBasilCsStatsSet(0)]) {
  const material = extractStudyMaterial(set.markdown);
  console.log(`\n${set.title}: ${material.terms.length} cards, ${material.clozes.length} blanks`);
  console.log('cards:', material.terms.slice(0, 12).map((card) => ({ front: card.term, source: card.source })));
  console.log('blanks:', material.clozes.slice(0, 8).map((card) => card.answer));
}
