const { Client } = require('pg');
// No, I don't have pg. I'll use the prisma binary directly to test.
// Actually I can just try prisma db push with specific URL
const url = "postgresql://postgres:Tomandjerry2y@[2406:da1a:6b0:f610:8a4d:e925:17c9:a41b]:5432/postgres";
console.log("Testing URL:", url);
