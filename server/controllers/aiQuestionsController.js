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
    const { difficulty, fileIds, subjectId, description, numberOfQuestions } =
      req.body;

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
    const numQ = Math.min(parseInt(numberOfQuestions) || 25, 150); // enforce max 150

    const prompt = `
You are an expert HR and technical interviewer.

Generate ${numQ} multiple-choice questions (with 4 options each), at ${
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

Return only the questions in a numbered list format, with options.  
After the options, clearly specify the correct answer${
  extraContext
    ? " and the page number (based on the reference content) in this format: Correct Answer: A (Page X)."
    : " in this format: Correct Answer: A."
}
.

`;

    // ✅ Call DeepSeek API
    // ✅ Parallel batch requests to DeepSeek
    const batchSize = 20; // number of questions per API call
    const tasks = [];

    for (let i = 0; i < numQ; i += batchSize) {
      const thisBatchSize = Math.min(batchSize, numQ - i);

      const batchPrompt = `
You are an expert HR and technical interviewer.

Generate ${thisBatchSize} multiple-choice questions (with 4 options each), at ${
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

Return only the questions in a numbered list format, with options.  
After the options, clearly specify the correct answer${
  extraContext
    ? " and the page number (based on the reference content) in this format: Correct Answer: A (Page X)."
    : " in this format: Correct Answer: A."
}


`;

      tasks.push(
        deepseek.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are an expert interviewer." },
            { role: "user", content: batchPrompt },
          ],
          temperature: 0.4,
          max_tokens: 8000,
        })
      );
    }

    const responses = await Promise.all(tasks);
    const mergedOutput = responses
      .map((r) => r.choices[0].message.content)
      .join("\n");

    console.log("AI Raw Output:", mergedOutput);

    // Parse questions
    const questions = [];
    const lines = mergedOutput.split("\n").map((line) => line.trim());

    let currentQuestion = null;

    for (let line of lines) {
      if (/^\d+[\.\)]/.test(line)) {
        if (currentQuestion) {
          // put page number into explanation if available
          if (currentQuestion.page) {
            currentQuestion.explanation = `Page ${currentQuestion.page}`;
          }
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
      } else if (/^[A-D][\.\)]\s+/i.test(line) && currentQuestion) {
        // Matches options like "A. text" or "B) text"
        const optMatch = line.match(/^([A-D])[\.\)]\s+(.*)/i);
        if (optMatch) {
          const idx = optMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
          currentQuestion.options[idx] = optMatch[2].trim().replace(/`/g, "");

        }
      } else if (/^Correct Answer[:\-]/i.test(line) && currentQuestion) {
        const match = line.match(
          /^Correct Answer[:\-]\s*([A-D])(?:.*Page\s+(\d+))?/i
        );
        if (match) {
          const answerLetter = match[1].toUpperCase();
          const idx = answerLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
          currentQuestion.correctAnswer =
            currentQuestion.options[idx] || answerLetter;
          if (match[2]) {
            currentQuestion.page = parseInt(match[2], 10);
          }
        }
      }
    }

    if (currentQuestion) {
  if (currentQuestion.page) {
    currentQuestion.explanation = `Page ${currentQuestion.page}`;
  }
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
    const {
      title,
      description,
      subjectId,
      companyId,
      timeLimit,
      passingScore,
      difficulty,
      maxAttempts,
      questions,
    } = req.body;
    const userId = req.userId;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Title and questions are required.",
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // ✅ 1. Insert into quizzes table
      const usedFileIdsJson = JSON.stringify(req.body.fileIds || []); // add this

const [quizResult] = await connection.execute(
  `INSERT INTO quizzes 
   (title, description, subject_id, company_id, time_limit, passing_score, max_attempts, difficulty_level, used_file_ids, is_active, created_by, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
  [
    title,
    description || "",
    subjectId || null,
    companyId || null,
    timeLimit || 60,
    passingScore || 70,
    maxAttempts || 3,
    difficulty || "medium", 
    usedFileIdsJson, // ✅ save fileIds
    userId,
  ]
);


      const quizId = quizResult.insertId;

      // ✅ 1. Auto-create first session for this quiz
const sessionName = `${title} 1`; // first session named same as quiz with "-1"
const [sessionResult] = await connection.execute(
  `INSERT INTO quiz_sessions 
   (quiz_id, session_name, time_limit, passing_score, max_attempts, max_questions, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
  [
    quizId,
    sessionName,
    timeLimit || 60,
    passingScore || 70,
    maxAttempts || 3,
    questions.length, // max_questions
  ]
);

const sessionId = sessionResult.insertId;

      // ✅ 2. Insert each question into questions table
      const savedQuestions = [];
      for (const q of questions) {
        const [result] = await connection.execute(
          `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, is_active, created_by, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())

`,
          [
            quizId, // ✅ use the quiz ID here
            q.question ?? "",
            q.type ?? "multiple_choice",
            JSON.stringify(Array.isArray(q.options) ? q.options : []),
            q.correctAnswer ?? "",
            q.explanation ?? (q.page ? `Page ${q.page}` : ""),

            q.difficulty ?? "medium",
            userId,
          ]
        );
        savedQuestions.push({ id: result.insertId, question_text: q.question });
      }

      // ✅ 3. Commit transaction
      await connection.commit();

      return res.json({
        message: "Assessment and questions saved successfully.",
        quizId,
        questions: savedQuestions,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Transaction error:", error);
      return res.status(500).json({
        message: "Failed to save Assessment and questions.",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
