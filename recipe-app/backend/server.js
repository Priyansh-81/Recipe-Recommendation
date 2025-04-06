const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'rubal123',
  database: 'Recipe_Recommendation'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const query = 'SELECT * FROM Admin WHERE Email = ? AND Password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error fetching admin: ', err);
      return res.status(500).json({ error: 'Login failed.' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful!', admin: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  });
});

app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const query = 'SELECT * FROM Users WHERE Email = ? AND Password = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Error fetching admin: ', err);
      return res.status(500).json({ error: 'Login failed.' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful!', admin: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  });
});



const getNextUserID = (callback) => {
  db.query('SELECT MAX(UserID) AS maxId FROM Users', (err, result) => {
    if (err) return callback(err, null);
    const nextUserID = (result[0].maxId || 0) + 1;
    callback(null, nextUserID);
  });
};

// 🟢 Get All Users
app.get('/api/users', (req, res) => {
  db.query('SELECT UserID, Name, Email FROM Users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }
    res.status(200).json(results);
  });
});

// 🟢 Get a Single User by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT UserID, Name, Email FROM Users WHERE UserID = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user.' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json(results[0]);
  });
});

// 🟢 Register a New User
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  getNextUserID((err, nextUserID) => {
    if (err) {
      console.error('Error fetching next UserID:', err);
      return res.status(500).json({ error: 'Registration failed.' });
    }

    const query = 'INSERT INTO Users (UserID, Name, Email, Password) VALUES (?, ?, ?, ?)';
    db.query(query, [nextUserID, name, email, password], (err) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Registration failed.' });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  });
});

// 🟢 Recipe Management

// Fetch all recipes
app.get('/api/recipes', (req, res) => {
  const query = 'SELECT * FROM Recipe';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch recipes' });
    res.status(200).json(results);
  });
});

app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Recipe WHERE RecipeID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch recipe' });
    if (results.length === 0) return res.status(404).json({ error: 'Recipe not found' });
    res.status(200).json(results[0]);
  });
}
);
// Fetch recipes by filter.

// Add new recipe
app.post('/api/recipes', async (req, res) => {
  try {
      console.log("Request body:", req.body); // Log incoming data

      const { adminID, name, cuisine, dietType, difficulty, cookingTime, instructions } = req.body;

      // Ensure all required fields are present
      if (!adminID || !name || !cuisine || !dietType || !difficulty || !cookingTime || !instructions) {
          console.error("Missing fields:", req.body);
          return res.status(400).json({ error: "All fields are required" });
      }

      const query = `
          INSERT INTO Recipe (AdminID, Name, Cuisine, DietType, Difficulty, CookingTime, Instructions) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [adminID, name, cuisine, dietType, difficulty, cookingTime, instructions]);

      console.log("Insert result:", result);

      res.status(201).json({ message: "Recipe added successfully", recipeID: result.insertId });
  } catch (error) {
      console.error("Error adding recipe:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Recipe WHERE RecipeID = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete recipe' });
    res.status(200).json({ message: 'Recipe deleted successfully' });
  });
});





app.get('/api/ingredients', (req, res) => {
  const query = 'SELECT * FROM Ingredient';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch recipes' });
    res.status(200).json(results);
  });
});


// Add new ingredient
app.post('/api/ingredients', (req, res) => {
  const { name, nutritionalValue } = req.body;

  if (!name || !nutritionalValue) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const query = 'INSERT INTO Ingredients (Name, NutritionalValue) VALUES (?, ?)';
  db.query(query, [name, nutritionalValue], (err) => {
    if (err) {
      console.error('Error inserting ingredient:', err);
      return res.status(500).json({ error: 'Failed to add ingredient.' });
    }
    res.status(201).json({ message: 'Ingredient added successfully!' });
  });
});
// Update an ingredient
app.put('/api/ingredients/:id', (req, res) => {
  const { id } = req.params;
  const { name, nutritionalValue } = req.body;

  if (!name || !nutritionalValue) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const query = 'UPDATE Ingredients SET Name = ?, NutritionalValue = ? WHERE IngredientID = ?';
  db.query(query, [name, nutritionalValue, id], (err) => {
    if (err) {
      console.error('Error updating ingredient:', err);
      return res.status(500).json({ error: 'Failed to update ingredient.' });
    }
    res.status(200).json({ message: 'Ingredient updated successfully!' });
  });
});

//Ingredient Management

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
