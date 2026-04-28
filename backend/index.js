const express = require("express");
const cors = require("cors");
const prisma = require("./prisma/client");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Black-Owned & Found backend is running");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/businesses", async (req, res) => {
  console.log("Received body:", req.body);

  const { name, category, address, city, state, description, website } = req.body;

  try {
    const newBusiness = await prisma.business.create({
      data: {
        name,
        category,
        address,
        city,
        state,
        description,
        website
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