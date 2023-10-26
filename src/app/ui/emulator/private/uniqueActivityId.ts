import mathRandom from 'math-random';

export default function uniqueActivityId(): string {
  return `a-${mathRandom().toString(36).substring(2, 7)}`;
}
