import { authenticateToken } from './authMiddleware.js';
import { con } from "./db.js";
import { randomBytes } from "crypto";

function quizExpressHandler(app) {
  app.post("/api/quizzes", authenticateToken, async (req, res) => {
    const { array, code, author, visibility } = req.body;
    const isPublic = visibility === "public" ? 1 : 0;

    con.query(
      "SELECT * FROM quizzes WHERE code = ?",
      code,
      async (err, results) => {
        if (err) return res.status(500).send("Error checking quiz code");
        if (results.length > 0)
          return res.status(400).send("Quiz with this code already exists");

        try {
          await Promise.all(
            array.map((q) => {
              return new Promise((resolve, reject) => {
                const params = [
                  code,
                  author,
                  isPublic,
                  q.question,
                  q.timer,
                  JSON.stringify(q.options),
                  q.answer,
                ];
                con.query(
                  "INSERT INTO quizzes (code, author, isPublic, question, timer, options, answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  params,
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  },
                );
              });
            }),
          );
          res.status(200).send("Quiz saved successfully");
        } catch (err) {
          res.status(500).send("Error saving quiz" + err);
        }
      },
    );
  });

  app.get("/api/quizzes", authenticateToken, (req, res) => {
    const { author } = req.query;

    if (!author) {
      return res.status(400).send("Invalid input");
    }

    const query = "SELECT * FROM quizzes WHERE author = ? OR isPublic = 1";
    con.query(query, [author], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quizzes");
      }

      const quizzes = results.map((row) => ({
        code: row.code,
        author: row.author,
        visibility: row.isPublic ? "public" : "private",
        question: row.question,
        timer: row.timer,
        options: JSON.parse(row.options),
        answer: row.answer,
      }));
      return res.status(200).json({ success: true, quizzes });
    });
  });

  app.get("/api/users/:username", authenticateToken, (req, res) => {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    const userQuery = "SELECT * FROM user WHERE username = ?";
    con.query(userQuery, [username.replace(/"/g, "")], (err, userResults) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error checking user" });
      }
      if (userResults.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const user = {
        username: userResults[0].username,
        email: userResults[0].email,
      };
      return res.status(200).json({ success: true, user });
    });
  });

  app.get("/api/sessions/:url/availability", (req, res) => {
    const { url } = req.params;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
      });
    }

    const query = "SELECT * FROM active WHERE q_url = ?";
    con.query(query, [url], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error checking quiz code",
        });
      }

      return res.status(200).json({
        success: true,
        available: results.length > 0,
      });
    });
  });

  app.post("/api/sessions", authenticateToken, (req, res) => {
    const { code } = req.body;

    const url = randomBytes(3).toString("hex");

    if (!code) {
      return res.status(400).send("Invalid input");
    }

    const query = "INSERT INTO `active`(`q_code`, `q_url`) VALUES (?, ?)";
    con.query(query, [code, url], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quiz");
      }
      if (results.affectedRows === 0) {
        return res.status(404).send("Quiz not found");
      } else {
        return res.status(200).json({ success: true, url });
      }
    });
  });

  app.delete("/api/sessions/:url", authenticateToken, (req, res) => {
    const { url } = req.params;

    if (!url) {
      return res.status(400).send("Invalid input");
    }

    const activeQuery = "SELECT q_code FROM active WHERE q_url = ?";
    con.query(activeQuery, [url], (activeErr, activeResults) => {
      if (activeErr) {
        return res.status(500).send("Error retrieving quiz");
      }
      if (activeResults.length === 0) {
        return res.status(404).send("Quiz not found");
      }

      const ownershipQuery = "SELECT 1 FROM quizzes WHERE code = ? AND author = ? LIMIT 1";
      con.query(
        ownershipQuery,
        [activeResults[0].q_code, req.user.username],
        (ownerErr, ownerResults) => {
          if (ownerErr) {
            return res.status(500).send("Error retrieving quiz");
          }
          if (ownerResults.length === 0) {
            return res.status(403).json({ success: false, message: "Forbidden" });
          }

          const deleteQuery = "DELETE FROM `active` WHERE q_url = ?";
          con.query(deleteQuery, [url], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quiz");
      }
      if (results.affectedRows === 0) {
        return res.status(404).send("Quiz not found");
      } else {
        return res.status(200).json({ success: true });
      }
          });
        },
      );
    });
  });

  app.get("/api/sessions/:url/quiz", (req, res) => {
    const { url } = req.params;

    if (!url) {
      return res.status(400).send("Invalid input");
    }

    const query = "SELECT * FROM active WHERE q_url = ?";
    con.query(query, [url], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quiz");
      }
      if (results.length === 0) {
        return res.status(404).send("Quiz not found");
      }
      const quizCode = results[0].q_code;
      const query2 = "SELECT * FROM quizzes WHERE code = ?";
      con.query(query2, [quizCode], (err, results) => {
        if (err) {
          return res.status(500).send("Error retrieving quiz");
        }
        if (results.length === 0) {
          return res.status(404).send("Quiz not found");
        } else {
          const quiz = results.map((row) => ({
            question: row.question,
            timer: row.timer,
            options: JSON.parse(row.options),
            answer: row.answer,
          }));
          return res.status(200).json({ success: true, quiz });
        }
      });
    });
  });

  app.get("/api/sessions/:url/code", (req, res) => {
    const { url } = req.params;

    if (!url) {
      return res.status(400).send("Invalid input");
    }
    const query = "SELECT * FROM active WHERE q_url = ?";
    con.query(query, [url], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quiz code");
      }
      if (results.length === 0) {
        return res.status(404).json({ valid: false });
      } else {
        return res.status(200).json({ valid: true, code: results[0].q_code });
      }
    });
  });

  app.get("/api/quizzes/:code/edit", authenticateToken, (req, res) => {
    const { code } = req.params;
    const { author } = req.query;

    if (!code) {
      return res.status(400).send("Invalid input");
    }

    const query = "SELECT * FROM quizzes WHERE code = ? AND author = ?";
    con.query(query, [code, author], (err, results) => {
      if (err) {
        return res.status(500).send("Error retrieving quiz");
      }
      if (results.length === 0) {
        return res.status(404).send("Quiz not found");
      } else {
        const quiz = results.map((row) => ({
          question: row.question,
          timer: row.timer,
          options: JSON.parse(row.options),
          answer: row.answer,
        }));
        return res.status(200).json({ success: true, quiz });
      }
    });
  });

  app.patch("/api/quizzes/:code", authenticateToken, async (req, res) => {
    const { code } = req.params;
    const { array, author, visibility } = req.body;
    const isPublic = visibility === "public" ? 1 : 0;
    con.query(
      "DELETE FROM quizzes WHERE code = ? AND author = ?",
      [code, author],
      async (err) => {
        if (err) return res.status(500).send("Error deleting old quiz data");
        try {
          await Promise.all(
            array.map((q) => {
              return new Promise((resolve, reject) => {
                const params = [
                  code,
                  author,
                  isPublic,
                  q.question,
                  q.timer,
                  JSON.stringify(q.options),
                  q.answer,
                ];
                con.query(
                  "INSERT INTO quizzes (code, author, isPublic, question, timer, options, answer) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  params,
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  },
                );
              });
            }),
          );
          res.status(200).send("Quiz updated successfully");
        } catch (err) {
          res.status(500).send("Error updating quiz" + err);
        }
      },
    );
  });

  app.patch("/api/users/:oldUsername", authenticateToken, (req, res) => {
    const { oldUsername } = req.params;
    const { newUsername, newEmail } = req.body;
    con.query(
      "UPDATE user SET username = ?, email = ? WHERE username = ?",
      [newUsername, newEmail, oldUsername],
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Error updating user data" });
        res
          .status(200)
          .json({ success: true, message: "User data updated successfully" });
      },
    );
  });

  app.delete("/api/quizzes/:code", authenticateToken, (req, res) => {
    const { code } = req.params;
    const { author } = req.query;
    con.query(
      "DELETE FROM quizzes WHERE code = ? AND author = ?",
      [code, author],
      (err) => {
        if (err) return res.status(500).send("Error deleting quiz");
        res
          .status(200)
          .json({ success: true, message: "Quiz deleted successfully" });
      },
    );
  });
}

export default quizExpressHandler;

