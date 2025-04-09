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

// Get recipes by diet type
app.get('/api/recipes/diet/:dietType', (req, res) => {
  const { dietType } = req.params;

  const query = 'SELECT * FROM Recipe WHERE LOWER(DietType) = LOWER(?)';
  db.query(query, [dietType], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch recipes' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this diet type' });
    }

    res.status(200).json(results);
  });
});
// Fetch recipes by filter.

// Add new recipe
app.post('/api/recipes', async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log incoming data

    const {
      adminID,
      name,
      cuisine,
      dietType,
      difficulty,
      cookingTime,
      instructions,
      imageURL // Optional
    } = req.body;

    // Ensure all required fields are present
    if (!adminID || !name || !cuisine || !dietType || !difficulty || !cookingTime || !instructions) {
      console.error("Missing fields:", req.body);
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
      INSERT INTO Recipe (AdminID, Name, Cuisine, DietType, Difficulty, CookingTime, Instructions, ImageURL)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().execute(query, [
      adminID,
      name,
      cuisine,
      dietType,
      difficulty,
      cookingTime,
      instructions,
      imageURL || null
    ]);

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

// Recommendations
// Get recommended recipes for a user
app.get('/api/recommendations/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT r.RecipeID, r.Name, r.Cuisine, r.DietType, r.Difficulty, rr.RecommendationScore
    FROM Recommendation rr
    JOIN Recipe r ON rr.RecipeID = r.RecipeID
    WHERE rr.UserID = ?
    ORDER BY rr.RecommendationScore DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching recommendations:', err);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
    res.status(200).json(results);
  });
});

//favorites

// Add recipe to user's favorites
app.post('/api/favorite', (req, res) => {
  const { userId, recipeId } = req.body;

  if (!userId || !recipeId) {
    return res.status(400).json({ error: 'UserID and RecipeID are required.' });
  }

  // Prevent duplicates
  const checkQuery = 'SELECT * FROM Favorite WHERE UserID = ? AND RecipeID = ?';
  db.query(checkQuery, [userId, recipeId], (err, results) => {
    if (err) {
      console.error('Error checking favorite:', err);
      return res.status(500).json({ error: 'Database error.' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'Already added to favorites.' });
    }

    const insertQuery = 'INSERT INTO Favorites (UserID, RecipeID) VALUES (?, ?)';
    db.query(insertQuery, [userId, recipeId], (err) => {
      if (err) {
        console.error('Error inserting favorite:', err);
        return res.status(500).json({ error: 'Failed to add favorite.' });
      }

      res.status(201).json({ message: 'Recipe added to favorites!' });
    });
  });
});

app.get('/api/favorites/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT r.RecipeID, r.Name, r.Cuisine, r.DietType, r.Difficulty
    FROM Favorited_by f
    JOIN Recipe r ON f.RecipeID = r.RecipeID
    WHERE f.UserID = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }
    res.json(results);
  });
});

app.delete('/api/favorite/:userId/:recipeId', (req, res) => {
  const { userId, recipeId } = req.params;

  const query = 'DELETE FROM Favorite WHERE UserID = ? AND RecipeID = ?';
  db.query(query, [userId, recipeId], (err) => {
      if (err) {
          console.error('Error removing favorite:', err);
          return res.status(500).json({ error: 'Failed to remove favorite.' });
      }
      res.status(200).json({ message: 'Recipe removed from favorites.' });
  });
});

//profile


app.get('/api/profile/:userID', (req, res) => {
  const userID = req.params.userID;
  const sql = 'SELECT Name, Email FROM Users WHERE UserID = ?';

  db.query(sql, [userID], (err, result) => {
    if (err) {
      console.error("Error fetching profile:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result[0]);
  });
});

app.delete('/api/deleteAccount', (req, res) => {
  const { userID } = req.body;

  if (!userID) return res.status(400).json({ error: "UserID required" });

  const sql = 'DELETE FROM Users WHERE UserID = ?';
  db.query(sql, [userID], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Could not delete account" });
    }
    res.status(200).json({ message: "Account deleted." });
  });
});
app.put('/api/updateProfile', (req, res) => {
  const { userID, name, email } = req.body;

  if (!userID || !name || !email) {
    return res.status(400).json({ error: 'Missing fields.' });
  }

  const updateQuery = 'UPDATE Users SET Name = ?, Email = ? WHERE UserID = ?';

  db.query(updateQuery, [name, email, userID], (err, result) => {
    if (err) {
      console.error("Error updating user profile:", err);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully!' });
  });
});

//home page search 
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const sql = `
    SELECT Name FROM Recipe WHERE Name LIKE ?
    UNION
    SELECT Name FROM Ingredient WHERE Name LIKE ?
  `;

  const searchTerm = `%${query}%`;

  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error("Search error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(results);
  });
});
app.put('/api/changePassword', (req, res) => {
  const { userID, oldPassword, newPassword } = req.body;

  if (!userID || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const checkQuery = 'SELECT Password FROM Users WHERE UserID = ?';
  db.query(checkQuery, [userID], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });

    const currentPassword = results[0].Password;

    if (currentPassword !== oldPassword) {
      return res.status(403).json({ error: 'Incorrect current password' });
    }

    const updateQuery = 'UPDATE Users SET Password = ? WHERE UserID = ?';
    db.query(updateQuery, [newPassword, userID], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update password' });
      res.status(200).json({ message: 'Password updated' });
    });
  });
});