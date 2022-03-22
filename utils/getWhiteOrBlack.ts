export default function getWhiteOrBlack() {
  const rdm = Math.random();
  return rdm >= 0.5 ? 'white' : 'black';
}
