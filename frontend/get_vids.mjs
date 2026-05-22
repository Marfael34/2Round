import https from 'https';

https.get('https://lite.duckduckgo.com/lite/?q=youtube+boxing+stance+tutorial', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/youtube\.com%2Fwatch%3Fv%3D([^&]+)/g);
    if(matches) {
      console.log('Posture:', matches.map(m => m.replace('youtube.com%2Fwatch%3Fv%3D', '')).slice(0, 3));
    } else {
      console.log('No posture matches');
    }
  });
});

https.get('https://lite.duckduckgo.com/lite/?q=youtube+boxing+how+to+wrap+hands', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/youtube\.com%2Fwatch%3Fv%3D([^&]+)/g);
    if(matches) {
      console.log('Wrap:', matches.map(m => m.replace('youtube.com%2Fwatch%3Fv%3D', '')).slice(0, 3));
    }
  });
});

https.get('https://lite.duckduckgo.com/lite/?q=youtube+boxing+defense+tutorial', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/youtube\.com%2Fwatch%3Fv%3D([^&]+)/g);
    if(matches) {
      console.log('Defense:', matches.map(m => m.replace('youtube.com%2Fwatch%3Fv%3D', '')).slice(0, 3));
    }
  });
});
