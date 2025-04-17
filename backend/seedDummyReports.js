require("dotenv").config();
const pool = require("./config/db");
const { faker } = require("@faker-js/faker");

const statuses = ["Missing", "Under Investigation", "Resolved"];

const getRandomImage = () => {
  const imgId = Math.floor(Math.random() * 70) + 1;
  return `https://i.pravatar.cc/300?img=${imgId}`;
};

async function seedDummyReports(count = 50) {
  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const age = Math.floor(Math.random() * 50) + 10;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const last_seen = faker.location.city();
    const last_seen_lat = faker.location.latitude();
    const last_seen_lng = faker.location.longitude();
    const date = faker.date.past({ years: 2 }).toISOString().split("T")[0];
    const additional_info = faker.lorem.sentence();
    const image = getRandomImage();
    const reported_by = 1; 

    try {
      await pool.query(
        `INSERT INTO persons 
        (name, age, status, last_seen, last_seen_lat, last_seen_lng, date, additional_info, image, reported_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          name,
          age,
          status,
          last_seen,
          last_seen_lat,
          last_seen_lng,
          date,
          additional_info,
          image,
          reported_by,
        ]
      );
      console.log(`Inserted: ${name}`);
    } catch (err) {
      console.error(" Insert failed:", err.message);
    }
  }

  console.log("\n🎉 Done! 50 dummy reports added.");
  process.exit();
}

seedDummyReports();
