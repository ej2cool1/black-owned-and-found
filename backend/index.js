const express = require("express");
const prisma = require("./prisma/client"); // (or "./client" depending on what you choose)

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Black-Owned & Found backend is running");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(5001, () => console.log("Server running on port 5001"));