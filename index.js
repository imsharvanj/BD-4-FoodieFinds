const express = require('express');
const { resolve } = require('path');
let cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());

class EntityNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EntityNotFoundError';
  }
}

let db;

(async () => {
  try {
    db = await open({
      filename: './foodie-finds/database.sqlite',
      driver: sqlite3.Database,
    });
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
  }
})();

async function fetchAllRestaurants() {
  let query = 'SELECT * FROM restaurants';
  let resp = await db.all(query, []);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Restaurants found');
  }
  return { restaurants: resp };
}

async function fetchRestaurantById(id) {
  let query = 'SELECT * FROM restaurants where id = ?';
  let resp = await db.all(query, [id]);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Restaurant found with id: ' + id);
  }
  return { restaurant: resp[0] };
}

async function fetchRestaurantsByCuisine(cuisine) {
  let query = 'SELECT * FROM restaurants where cuisine = ?';
  let resp = await db.all(query, [cuisine]);
  if (resp.length == 0) {
    throw new EntityNotFoundError(
      'No Restaurant found with cuisine: ' + cuisine
    );
  }
  return { restaurants: resp };
}

async function fetchRestaurantsByFilter(isVeg, hasOutdoorSeating, isLuxury) {
  let query =
    'SELECT * FROM restaurants where isVeg = ? and hasOutdoorSeating = ? and isLuxury = ?';
  let resp = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Restaurant found with provided filter');
  }
  return { restaurants: resp };
}

async function fetchRestaurantsSortedByRating() {
  let query = 'SELECT * FROM restaurants order by rating desc';
  let resp = await db.all(query, []);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Restaurants found');
  }
  return { restaurants: resp };
}

async function fetchAllDishes() {
  let query = 'SELECT * FROM dishes';
  let resp = await db.all(query, []);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Dishes found');
  }
  return { dishes: resp };
}

async function fetchDishById(id) {
  let query = 'SELECT * FROM dishes where id = ?';
  let resp = await db.all(query, [id]);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Dishes found with id: ' + id);
  }
  return { dish: resp[0] };
}

async function fetchDishesByFilter(isVeg) {
  let query = 'SELECT * FROM dishes where isVeg = ?';
  let resp = await db.all(query, [isVeg]);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Dishes found with provided filter');
  }
  return { dishes: resp };
}

async function fetchDishesSortedByPrice() {
  let query = 'SELECT * FROM dishes order by price';
  let resp = await db.all(query, []);
  if (resp.length == 0) {
    throw new EntityNotFoundError('No Dishes found');
  }
  return { dishes: resp };
}

// routes

app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/restaurants/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  try {
    let result = await fetchRestaurantById(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  try {
    let results = await fetchRestaurantsByCuisine(cuisine);
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;
  try {
    let results = await fetchRestaurantsByFilter(
      isVeg,
      hasOutdoorSeating,
      isLuxury
    );
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let results = await fetchRestaurantsSortedByRating();
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/dishes', async (req, res) => {
  try {
    let results = await fetchAllDishes();
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/dishes/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  try {
    let result = await fetchDishById(id);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  try {
    let results = await fetchDishesByFilter(isVeg);
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let results = await fetchDishesSortedByPrice();
    res.status(200).json(results);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
