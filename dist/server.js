
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/config/env.config.ts
import dotenv from "dotenv";
import { env } from "process";
dotenv.config({ quiet: true });
var config = {
  port: env.PORT,
  connection_string: env.CONNECTION_STRING,
  jwt_secret: env.JWT_SECRET
};
var env_config_default = config;

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({ connectionString: env_config_default.connection_string });
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK (char_length(description) >= 20),
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
  } catch (error) {
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signupUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserFromDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtpayload, env_config_default.jwt_secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return { accessToken, user };
};
var authService = {
  signupUserIntoDB,
  loginUserFromDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await authService.signupUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserFromDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User logged in successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signupUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/utility/issueObjectResonse.ts
var issueObjectResponse = (issue, user) => {
  const { id, title, description, type, status, created_at, updated_at } = issue;
  const { id: userId, name, role } = user;
  const result = {
    id,
    title,
    description,
    type,
    status,
    reporter: {
      id: userId,
      name,
      role
    },
    created_at,
    updated_at
  };
  return result;
};
var issueObjectResonse_default = issueObjectResponse;

// src/modules/issue/issue.service.ts
var createIssueIntoDB = async (payload, reporterId) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,status, reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5)
        RETURNING *
        `,
    [title, description, type, status, reporterId]
  );
  return result;
};
var getAllIssueFromDB = async () => {
  const issues = await pool.query(`
    SELECT * FROM issues
    
    `);
  const users = await pool.query(`
    SELECT * FROM users
    `);
  const mapIssues = issues.rows.map((issue) => {
    const user = users.rows.find((user2) => user2.id === issue.reporter_id);
    const result = issueObjectResonse_default(issue, user);
    return result;
  });
  return mapIssues;
};
var getSingleIssueFromDB = async (id, res) => {
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  if (issue.rows.length === 0) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "Issue Not Found"
    });
  }
  const reporterId = issue.rows[0].reporter_id;
  const user = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    
    `,
    [reporterId]
  );
  const result = issueObjectResonse_default(issue.rows[0], user.rows[0]);
  return result;
};
var updateIssueIntoDB = async (payload, id, role, userId, res) => {
  const { title, description, type } = payload;
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  if (issue.rows.length === 0) {
    sendResponse_default(res, {
      statusCode: 404,
      success: false,
      message: "Issue Not Found"
    });
  }
  if (role === "contributor" && userId !== issue.rows[0].reporter_id) {
    sendResponse_default(res, {
      statusCode: 403,
      success: false,
      message: "As a contributor you are allowed to update only your own issue"
    });
  }
  if (role === "contributor" && issue.rows[0].status !== "open") {
    sendResponse_default(res, {
      statusCode: 403,
      success: false,
      message: "You are a contributor and status is also not open so you can't update the issue"
    });
  }
  const result = await pool.query(
    `
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type)

    WHERE id=$4 RETURNING *
    `,
    [title, description, type, id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1
    `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssueFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/utility/issuesSortBy.ts
var issueSortBy = async (req) => {
  const result = await issueService.getAllIssueFromDB();
  const { sort = "newest", type, status } = req.query;
  let data = [];
  if (sort === "newest") {
    data = [
      ...result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    ];
  } else if (sort === "oldest") {
    data = [
      ...result.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    ];
  }
  if (type === "bug") {
    data = [...result.filter((issue) => issue.type === "bug")];
  } else if (type === "feature_request") {
    data = [...result.filter((issue) => issue.type === "feature_request")];
  }
  if (status === "open") {
    data = [...result.filter((issue) => issue.status === "open")];
  } else if (status === "in_progress") {
    data = [...result.filter((issue) => issue.status === "in_progress")];
  } else if (status === "resolved") {
    data = [...result.filter((issue) => issue.status === "resolved")];
  }
  return data;
};
var issuesSortBy_default = issueSortBy;

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  const { id } = req.user;
  try {
    const result = await issueService.createIssueIntoDB(req.body, id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issuesSortBy_default(req);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id, res);
    if (!result) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { role, id: userId } = req.user;
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueIntoDB(
      req.body,
      id,
      role,
      userId,
      res
    );
    if (result.rows.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Update issue successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue Not found!"
      });
      return;
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Delete issue successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decoded = jwt2.verify(
        token,
        env_config_default.jwt_secret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE id=$1
        `,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User Not Found!"
        });
      }
      if (roles.length && !roles.includes(decoded.role)) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!"
        });
        return;
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/auth/user.roles.ts
var userRole = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issue/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default(userRole.contributor, userRole.maintainer),
  issueController.createIssue
);
router2.get("", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.put(
  "/:id",
  auth_default(userRole.contributor, userRole.maintainer),
  issueController.updateIssue
);
router2.delete("/:id", auth_default(userRole.maintainer), issueController.deleteIssue);
var issueRoute = router2;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
import cors from "cors";
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://localhost:3000"
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "assignment-02",
    level: "next level"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var port = env_config_default.port;
var main = async () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`The server is running on ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map