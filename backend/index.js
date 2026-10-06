const express = require("express");
const cors = require("cors");
const prisma = require("./prisma/client");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.get("/", (req, res) => {
  res.send("Black-Owned & Found backend is running");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// SIGN UP
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: "Account created successfully", user });

  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already in use" });
    }

    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/businesses", async (req, res) => {

  const { name, category, address, city, state, description, website, userId, imageUrl } = req.body;

  console.log("Received body:", req.body);
  console.log("userId:", userId);
  console.log("Number(userId):", Number(userId));

  try {
    const newBusiness = await prisma.business.create({
      data: {
        name,
        category,
        address,
        city,
        state,
        description,
        website,
        userId: userId ? Number(userId) : null,
        imageUrl
      }
    });

    res.status(201).json(newBusiness);
  } catch (error) {
    console.error("Error adding business:", error);
    res.status(500).json({ error: "Failed to add business" });
  }
});

app.get("/businesses/search", async (req, res) => {
  const { q, city, state, category } = req.query;

  try {
    const filters = [];

    // search by text (name/category/etc.)
    if (q) {
      filters.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { state: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    // exact filters
    if (city) {
      filters.push({
        city: { equals: city, mode: "insensitive" },
      });
    }

    if (state) {
      filters.push({
        state: { equals: state, mode: "insensitive" },
      });
    }

    if (category) {
      filters.push({
        category: { equals: category, mode: "insensitive" },
      });
    }

    const businesses = await prisma.business.findMany({
      where: {
        AND: filters,
      },
    });

    res.json(businesses);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.put("/businesses/:id/image", async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;

  try {
    const updated = await prisma.business.update({
      where: { id: Number(id) },
      data: { imageUrl }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update image" });
  }
});

app.get("/businesses", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});