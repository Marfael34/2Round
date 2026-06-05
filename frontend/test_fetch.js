const jwt = process.argv[2];
fetch("http://localhost:5179/api/notifications?order[createdAt]=desc", {
  headers: { "Authorization": "Bearer " + jwt }
}).then(r => r.json()).then(console.log).catch(console.error);
