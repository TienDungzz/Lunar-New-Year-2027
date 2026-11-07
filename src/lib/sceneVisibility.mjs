export function isFireworksSky(phase) {
  return ['COUNTDOWN_PREPARE', 'MIDNIGHT_REVEAL', 'FIREWORKS', 'FIREWORKS_TRANSITION', 'TREE_TRANSITION'].includes(phase);
}
