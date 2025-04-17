require("dotenv").config();
const pool = require("./config/db");
const { faker } = require("@faker-js/faker");

async function seedRandomTips() {
  try {
    // Get all person IDs from the database
    const res = await pool.query("SELECT id FROM persons");
    const allPersons = res.rows;

    if (allPersons.length === 0) {
      console.log("❌ No persons found. Seed person data first.");
      return;
    }

    for (const person of allPersons) {
      // Randomly decide whether to add tips to this person
      const shouldAddTips = Math.random() < 0.6; // 60% chance
      if (!shouldAddTips) continue;

      const tipCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 tips

      for (let i = 0; i < tipCount; i++) {
        const tipText = faker.lorem.sentence();
        const tipper = faker.person.fullName(); // always include a tipper
        const evidence_url = null; // Optional — can be extended
        const created_at = faker.date.recent({ days: 10 });

        await pool.query(
          `INSERT INTO tips (tip, tipper, person_id, created_at, evidence_url)
           VALUES ($1, $2, $3, $4, $5)`,
          [tipText, tipper, person.id, created_at, evidence_url]
        );

        console.log(`💬 Tip added to case ID ${person.id}`);
      }
    }

    console.log("✅ All random tips seeded!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding tips:", err.message);
    process.exit(1);
  }
}

seedRandomTips();
