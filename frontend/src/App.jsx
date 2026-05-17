import { useState } from "react";
import "./style.css";

export default function App() {

  // =========================
  // Candidate State
  // =========================

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    skills: [],
    experience: "",
    bio: ""
  });

  // =========================
  // Match State
  // =========================

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [minExperience, setMinExperience] = useState(0);

  // =========================
  // Result State
  // =========================

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // AI Result State
  // =========================

  const [aiResult, setAIResult] = useState("");

  // =========================
  // Skills Options
  // =========================

  const skillOptions = [
    "React",
    "Node.js",
    "MongoDB",
    "Express",
    "Java",
    "Python",
    "C++",
    "Machine Learning",
    "AI",
    "AWS",
    "Docker",
    "Kubernetes",
    "SQL",
    "Frontend",
    "Backend",
    "DevOps",
    "Next.js",
    "TypeScript"
  ];

  // =========================
  // Handle Inputs
  // =========================

  const handleChange = (e) => {

    setCandidate({
      ...candidate,
      [e.target.name]: e.target.value
    });

  };

  // =========================
  // Add Candidate Skill
  // =========================

  const handleCandidateSkill = (e) => {

    const value = e.target.value;

    if (
      value &&
      !candidate.skills.includes(value)
    ) {

      setCandidate({
        ...candidate,
        skills: [...candidate.skills, value]
      });

    }

  };

  // =========================
  // Remove Candidate Skill
  // =========================

  const removeCandidateSkill = (skill) => {

    setCandidate({
      ...candidate,
      skills: candidate.skills.filter(
        (s) => s !== skill
      )
    });

  };

  // =========================
  // Add Candidate
  // =========================

  const addCandidate = async () => {

    if (
      !candidate.name ||
      !candidate.email ||
      candidate.skills.length === 0 ||
      !candidate.experience
    ) {

      alert("Please fill all fields");
      return;

    }

    try {

      const response = await fetch(
        "https://ai-candidate.onrender.com",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            ...candidate,
            experience: Number(candidate.experience)
          })

        }
      );

      if (!response.ok) {
        throw new Error("Failed");
      }

      alert("Candidate Added ✅");

      setCandidate({
        name: "",
        email: "",
        skills: [],
        experience: "",
        bio: ""
      });

    } catch (error) {

      console.log(error);
      alert("Error Adding Candidate");

    }

  };

  // =========================
  // Add Match Skill
  // =========================

  const handleMatchSkills = (e) => {

    const value = e.target.value;

    if (
      value &&
      !selectedSkills.includes(value)
    ) {

      setSelectedSkills([
        ...selectedSkills,
        value
      ]);

    }

  };

  // =========================
  // Remove Match Skill
  // =========================

  const removeMatchSkill = (skill) => {

    setSelectedSkills(
      selectedSkills.filter(
        (s) => s !== skill
      )
    );

  };

  // =========================
  // Basic Matching
  // =========================

  const runMatch = async () => {

    if (selectedSkills.length === 0) {

      alert("Select required skills");
      return;

    }

    try {

      setLoading(true);

      const response = await fetch(
        "https://ai-candidate.onrender.com",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            requiredSkills: selectedSkills,

            minExperience: Number(minExperience)

          })

        }
      );

      const data = await response.json();

      const filtered = data.filter(
        (candidate) => candidate.matchScore > 0
      );

      setResults(filtered);

    } catch (error) {

      console.log(error);
      alert("Matching Failed");

    } finally {

      setLoading(false);

    }

  };

  // =========================
  // AI Matching
  // =========================

  const runAIMatch = async () => {

    if (selectedSkills.length === 0) {

      alert("Select required skills");
      return;

    }

    try {

      const response = await fetch(
        "https://ai-candidate.onrender.com/ai/shortlist",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            requiredSkills: selectedSkills,

            minExperience: Number(minExperience)

          })

        }
      );

      const data = await response.json();

      setAIResult(
        data.choices[0].message.content
      );

    } catch (error) {

      console.log(error);

      alert("AI Matching Failed");

    }

  };

  // =========================
  // UI
  // =========================

  return (

    <div className="container">

      <h1 className="main-heading">
        AI Candidate Shortlisting System
      </h1>

      {/* ========================= */}
      {/* Add Candidate */}
      {/* ========================= */}

      <div className="card">

        <h2>Add Candidate</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          value={candidate.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={candidate.email}
          onChange={handleChange}
        />

        <select onChange={handleCandidateSkill}>

          <option value="">
            Select Skills
          </option>

          {skillOptions.map((skill, index) => (

            <option
              key={index}
              value={skill}
            >
              {skill}
            </option>

          ))}

        </select>

        <div className="selected-skills">

          {candidate.skills.map((skill, index) => (

            <div
              className="skill-chip"
              key={index}
            >

              {skill}

              <span
                onClick={() =>
                  removeCandidateSkill(skill)
                }
              >
                ✖
              </span>

            </div>

          ))}

        </div>

        <input
          type="number"
          name="experience"
          placeholder="Experience (Years)"
          value={candidate.experience}
          onChange={handleChange}
        />

        <textarea
          rows="4"
          name="bio"
          placeholder="Projects / Bio"
          value={candidate.bio}
          onChange={handleChange}
        />

        <button onClick={addCandidate}>
          Add Candidate
        </button>

      </div>

      {/* ========================= */}
      {/* Match Section */}
      {/* ========================= */}

      <div className="card">

        <h2>Shortlist Candidates</h2>

        <select onChange={handleMatchSkills}>

          <option value="">
            Select Required Skills
          </option>

          {skillOptions.map((skill, index) => (

            <option
              key={index}
              value={skill}
            >
              {skill}
            </option>

          ))}

        </select>

        <div className="selected-skills">

          {selectedSkills.map((skill, index) => (

            <div
              className="skill-chip"
              key={index}
            >

              {skill}

              <span
                onClick={() =>
                  removeMatchSkill(skill)
                }
              >
                ✖
              </span>

            </div>

          ))}

        </div>

        <input
          type="number"
          placeholder="Minimum Experience"

          value={minExperience}

          onChange={(e) =>
            setMinExperience(e.target.value)
          }
        />

        <div className="btn-group">

          <button onClick={runMatch}>

            {loading
              ? "Matching..."
              : "Run Match"}

          </button>

          <button onClick={runAIMatch}>
            AI Shortlist
          </button>

        </div>

      </div>

      {/* ========================= */}
      {/* AI RESULT */}
      {/* ========================= */}

      {
        aiResult && (

          <div className="ai-box">

            <h2>AI Recommendation</h2>

            <pre>
              {aiResult}
            </pre>

          </div>

        )
      }

      {/* ========================= */}
      {/* Results */}
      {/* ========================= */}

      <div className="results-container">

        {results.length === 0 && !loading && (

          <p className="empty-text">
            No matching candidates found
          </p>

        )}

        {results.map((candidate, index) => (

          <div
            className="result-card"
            key={index}
          >

            <div className="top-row">

              <h3>{candidate.name}</h3>

              <span className="score">
                {candidate.matchScore}%
              </span>

            </div>

            <p>
              <strong>Email:</strong>
              {" "}
              {candidate.email}
            </p>

            <p>
              <strong>Skills:</strong>
              {" "}
              {candidate.skills.join(", ")}
            </p>

            <p>
              <strong>Experience:</strong>
              {" "}
              {candidate.experience} years
            </p>

            <p>
              <strong>Bio:</strong>
              {" "}
              {candidate.bio || "No bio"}
            </p>

          </div>

        ))}

      </div>

    </div>

  );
}