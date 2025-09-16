const { OpenAI } = require("openai"); // No destructuring
const db = require("../config/database"); // Your MySQL connection
require("dotenv").config();

// ✅ Set up DeepSeek here
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com", // Or leave it if using OpenAI endpoint
});

// Controller function – now only generates and returns questions
exports.generateQuestionsFromDescription = async (req, res) => {
  try {
    const { difficulty, fileIds, subjectId, description } = req.body;
console.log("Request body:", req.body);
    // const userId = req.userId; // From your authenticate middleware
    const userId = null;


    if (!description || !subjectId) {
      return res.status(400).json({
        message: "Description and subjectId are required.",
      });
    }

    // Get user info from DB
   
    const user = { id: null, role: "user", company_id: null }; // dummy user

    // Fetch file contents if fileIds provided
    // Fetch file contents if fileIds provided
    let extraContext = "";
    if (Array.isArray(fileIds) && fileIds.length > 0) {
      // Make sure all fileIds are defined and numeric
      const sanitizedIds = fileIds
        .map((id) => id ?? null) // Replace undefined with null
        .map((id) => Number(id)); // Ensure numbers for SQL

      // Only keep valid numbers for IN clause
      const validIds = sanitizedIds.filter((id) => !isNaN(id));

      if (validIds.length > 0) {
        // Replace undefined in fileIds with null
        const sanitizedIds = (fileIds || [])
          .map((id) => id ?? null)
          .filter((id) => id !== null);
        if (sanitizedIds.length > 0) {
          let query = `SELECT extracted_text FROM uploaded_files WHERE file_id IN (${sanitizedIds
            .map(() => "?")
            .join(",")})`;
          const bindParams = [...sanitizedIds];
        //   if (user.role === "company") {
        //     query += " AND company_id = ?";
        //     bindParams.push(user.company_id ?? null);
        //   } else {
        //     query += " AND user_id = ?";
        //     bindParams.push(user.id ?? null);
        //   }
          const [files] = await db.execute(query, bindParams);
          extraContext = files
            .map((f) => (f.extracted_text || "").trim())
            .filter((text) => text.length > 0)
            .join("\n\n");
        }

        
      }
    }

    // Build prompt
    // Build prompt
    const prompt = `
You are an expert HR and technical interviewer.

Generate 25 multiple-choice questions (with 4 options each), at ${
      difficulty || "medium"
    } difficulty level. The questions should cover theoretical knowledge, practical skills, and real-world applications.

Reference Content:
${description}

${
  extraContext
    ? "Additional information from uploaded files:\n" + extraContext
    : ""
}

Prioritize scenario-based, problem-solving, and applied questions over simple definitions. Avoid repetition and ensure each question is unique.

Return only the questions in a numbered list format, with options, but without answers or explanations.
`;

    // ✅ Call DeepSeek API
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert interviewer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const rawOutput = response.choices[0].message.content;
console.log("AI Raw Output:", rawOutput);
    // Parse questions
    const questions = [];
const lines = rawOutput.split("\n").map((line) => line.trim());

let currentQuestion = null;

for (let line of lines) {
  if (/^\d+[\.\)]/.test(line)) {
    // Start of a new question
    if (currentQuestion) {
      questions.push(currentQuestion);
    }
    currentQuestion = {
      id: questions.length + 1,
      question: line.replace(/^\d+[\.\)]\s*/, "").trim(),
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: "",
      difficulty: difficulty || "medium",
      subject: subjectId,
    };
  } else if (/^[a-dA-D][\)\.]/.test(line) && currentQuestion) {
    // Option line
    const match = line.match(/^([a-dA-D])[\)\.]\s*(.+)$/);
    if (match) {
      const optionIndex = match[1].toLowerCase().charCodeAt(0) - 97;
      currentQuestion.options[optionIndex] = match[2].trim();
    }
  }
}

// Push the last question if exists
if (currentQuestion) {
  questions.push(currentQuestion);
}

 if (questions.length === 0) {
  return res.status(500).json({ message: "No questions generated." });
}

// ✅ Return parsed questions to frontend
return res.json({
  message: "Questions generated successfully.",
  questions: questions,
});

  } catch (error) {
    console.error("AI error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate questions.", error: error.message });
  }
};

exports.saveQuestions = async (req, res) => {
  try {
    const { testId, questions } = req.body;
    const userId = req.userId;

    if (!testId || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Test ID and questions are required." });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const savedQuestions = [];
      for (const q of questions) {
        const [result] = await connection.execute(
          `INSERT INTO questions (test_id, subject_id, question_text, question_type, options, correct_answer, difficulty_level, created_by, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
          [
            testId,
            q.subject,
            q.question,
            q.type,
            JSON.stringify(q.options || []),
            q.correctAnswer || "",
            q.difficulty || "medium",
            userId,
          ]
        );
        savedQuestions.push({ id: result.insertId, question_text: q.question });
      }

      await connection.commit();
      return res.json({
        message: "Questions saved successfully.",
        questions: savedQuestions,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Save transaction error:", error);
      return res.status(500).json({ message: "Failed to save questions." });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
