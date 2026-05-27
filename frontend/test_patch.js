const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:8000/api/users/1', {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify({ birthday_at: '1990-01-01', birthdayAt: '1990-01-01' })
    });
    
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}
test();
