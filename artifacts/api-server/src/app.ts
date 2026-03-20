import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";

function resolveRepoRoot() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, "artifacts"))) {
    return cwd;
  }

  if (
    path.basename(cwd) === "api-server" &&
    path.basename(path.dirname(cwd)) === "artifacts"
  ) {
    return path.dirname(path.dirname(cwd));
  }

  return path.resolve(cwd, "..", "..");
}

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.resolve(resolveRepoRoot(), "artifacts", "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use("/api", router);

export default app;
