const fs = require("fs");
const { Client } = require("pg");
const jsonObject = require("./atheletes.json");

const atheletesGroups = jsonObject.atheletes;

const atheletesNumber = atheletesGroups.reduce((total, obj) => {
  return total + obj.attr.length;
}, 0);

console.log(atheletesNumber);
// sum1 = 0;
// sum2 = 0;

// for (const group of atheletesGroups) {
//   const { _, target, attr } = group;
//   const countryCode = target;
//   for (const atheleteDetail of attr) {
//     const { year, event, sport, athlete, city, medal } = atheleteDetail;
//     const { name, sex, born, height, weight } = athlete;
//     // if ([name, sex, born, height, weight, sport, event, year, city, medal, countryCode].every(item => item !== undefined)) {
//     //     sum = sum+1;
//     // } else {
//     //     console.log(atheleteDetail)
//     // };
//     // const bornUpdate = (born == "na") ? "1000-01-01" : born;
//     // if (bornUpdate == "na") {
//     //     sum1 = sum1+1;
//     //     console.log(atheleteDetail)
//     // }
//     // if (born == "na") {
//     //     sum2 = sum2+1;
//     //     console.log(atheleteDetail)
//     // }
//     // if (weight.includes("-") || weight.includes(",")) {
//     //   sum1 = sum1 + 1;
//       // }
//       function isValidDateFormat(dateString) {
//   const regex = /^\d{4}-\d{2}-\d{2}$/;
//   return regex.test(dateString);
// }
//     if (isValidDateFormat(born)) {
//       sum1 = sum1 + 1;
//     } else {
//         console.log(born);
//       sum2 = sum2 + 1;
//     }
//     // function findAverage(str, spliter) {
//     //   const [start, end] = str.split(spliter).map(Number);
//     //   const avg = Math.floor((start + end) / 2);
//     //   avg;
//     // }
//     // const update = weight.includes("-")
//     //   ? findAverage(weight, "-")
//     //   : weight.includes(",")
//     //   ? findAverage(weight, ",")
//     //         : weight;
      
//   }
// }
// console.log(sum1);
// console.log(sum2);

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "data",
  port: 5432,
});

async function connectAndInsert() {
  try {
    await client.connect();
    console.log("Connected to the database.");

    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS athletes (
                id SERIAL PRIMARY KEY,        -- Auto-incrementing primary key for athletes
                name VARCHAR(255),            -- Athlete's name
                sex VARCHAR(10),              -- Athlete's sex
                born DATE,                    -- Date of birth
                height DECIMAL(5, 2),         -- Athlete's height
                weight DECIMAL(5, 2),         -- Athlete's weight
                sport VARCHAR(255),           -- Sport
                event VARCHAR(255),           -- Event
                year INT,                     -- Year of participation
                city VARCHAR(255),            -- City where the event took place
                medal VARCHAR(50),            -- Medal type (Gold, Silver, Bronze, etc.)
                countryCode VARCHAR(3),       -- Country code (foreign key)
                FOREIGN KEY (countryCode) REFERENCES countries(id) -- Foreign key linking to countries table
            );
        `;
    await client.query(createTableQuery);
    console.log('Table "athletes" created or already exists.');

    const insertAthleteQuery = `
            INSERT INTO athletes (name, sex, born, height, weight, sport, event, year, city, medal, countryCode)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
        `;

    for (const group of atheletesGroups) {
      const { _, target, attr } = group;
      const countryCode = target;
      for (const atheleteDetail of attr) {
        const { year, event, sport, athlete, city, medal } = atheleteDetail;
        const { name, sex, born, height, weight } = athlete;
        function isValidDateFormat(dateString) {
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            return regex.test(dateString);
        }
        const bornUpdate = isValidDateFormat(born) ? born : "1000-01-01";
        const heightUpdate = height == "na" ? "-1" : height;
        function findAverage(str, spliter) {
            const [start, end] = str.split(spliter).map(Number);
            Math.floor((start + end) / 2);
        }
        const weightUpdate =
          weight == "na"
            ? "-1"
            : weight.includes("-")
            ? findAverage(weight,"-")
            : weight.includes(",")
            ? findAverage(weight,",")
            : weight;
        await client.query(insertAthleteQuery, [
          name,
          sex,
          bornUpdate,
          heightUpdate,
          weightUpdate,
          sport,
          event,
          year,
          city,
          medal,
          countryCode,
        ]);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
    console.log("Connection closed.");
  }
}

connectAndInsert();
