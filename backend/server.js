const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// MongoDB Connection
// =========================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log(err);
});


// =========================
// Schema
// =========================

const CandidateSchema = new mongoose.Schema({

  name: String,

  email: String,

  skills: [String],

  experience: Number,

  bio: String

});

const Candidate = mongoose.model(
  "Candidate",
  CandidateSchema
);


// =========================
// Add Candidate API
// =========================

app.post("/api/candidates", async (req, res) => {

  try {

    const candidate = await Candidate.create(
      req.body
    );

    res.json(candidate);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Failed to add candidate"
    });

  }

});


// =========================
// Get Candidates API
// =========================

app.get("/api/candidates", async (req, res) => {

  try {

    const data = await Candidate.find();

    res.json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Failed to fetch candidates"
    });

  }

});


// =========================
// Basic Match API
// =========================

app.post("/api/match", async (req, res) => {

  try {

    const {
      requiredSkills,
      minExperience
    } = req.body;

    const candidates = await Candidate.find();

    const result = candidates.map(candidate => {

      const matchedSkills =
        candidate.skills.filter(skill =>

          requiredSkills
            .map(s => s.toLowerCase())
            .includes(skill.toLowerCase())

        );

      const score = Math.round(
        (matchedSkills.length /
          requiredSkills.length) * 100
      );

      return {

        ...candidate._doc,

        matchedSkills,

        matchScore: score

      };

    })

    .filter(candidate =>
      candidate.experience >= minExperience
    )

    .sort((a, b) =>
      b.matchScore - a.matchScore
    );

    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Matching Failed"
    });

  }

});


// =========================
// AI Shortlist API
// =========================

app.post("/api/ai/shortlist", async (req, res) => {

  try {

    const {
      requiredSkills,
      minExperience
    } = req.body;

    const candidates = await Candidate.find();

    const prompt = `

You are an AI recruiter.

Job Requirements:
Skills: ${requiredSkills.join(", ")}
Minimum Experience: ${minExperience} years

Candidates:
${candidates.map(c => `

Name: ${c.name}
Skills: ${c.skills.join(", ")}
Experience: ${c.experience}
Bio: ${c.bio}

`).join("\n")}

Rank the best candidates and explain why.

`;

    const response = await fetch(

      "https://openrouter.ai/api/v1/chat/completions",

      {

        method: "POST",

        headers: {

          "Authorization":
            `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          model: "openai/gpt-4o-mini",

          messages: [

            {
              role: "user",
              content: prompt
            }

          ]

        })

      }

    );

    const data = await response.json();

    res.json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "AI Shortlisting Failed"
    });

  }

});


// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});