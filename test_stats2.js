async function testStats() {
  const res = await fetch("http://localhost:3000/api/stats");
  const data = await res.json();
  console.log("Stats:", data);
}

testStats();
