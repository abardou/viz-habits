export default [
  { target: 'screenoff', source: 'youtube', strength: 0.1 },
  { target: 'screenonunlocked', source: 'screenoff', strength: 0.1 },
  { target: 'appusage', source: 'screenonunlocked', strength: 0.2 },
  { target: 'screenoff', source: 'appusage', strength: 0.1 },
  { target: 'screenonlocked', source: 'screenoff', strength: 0.1 },
  { target: 'screenonunlocked', source: 'screenonlocked', strength: 0.1 }
];
