import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

app.use(express.json());

app.post("/users", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: await bcrypt.hash(password, 10)
      }
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.send("Logged in successfully");
    } else {
      res.status(400).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})