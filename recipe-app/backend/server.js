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
app.get('/api/users', (req, res) => {
  const query = 'SELECT UserID, Name, Email FROM Users';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }

    res.status(200).json(results);
  });
});
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT UserID, Name, Email FROM Users WHERE UserID = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(results[0]);
  });
});
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Users WHERE UserID = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User deleted successfully.' });
  });
});
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { Name, Email } = req.body;

  // Validate input
  if (!Name || !Email) {
    return res.status(400).json({ error: 'Name and Email are required.' });
  }

  const query = 'UPDATE Users SET Name = ?, Email = ? WHERE UserID = ?';

  db.query(query, [Name, Email, id], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully.' });
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

// Fetch a Single Recipe by ID (including ImageURL)
app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT RecipeID, Name, Cuisine, DietType, Difficulty, CookingTime, Instructions, ImageURL FROM Recipe WHERE RecipeID = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch recipe' });
    
    if (results.length === 0) return res.status(404).json({ error: 'Recipe not found' });

    // Successfully retrieved recipe, including the image URL
    res.status(200).json(results[0]);
  });
});

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

// Example Express route to fetch ingredients for a recipe
app.get('/api/recipes/:recipeID/ingredients', (req, res) => {
  const recipeID = req.params.recipeID;
  const query = `
      SELECT Ingredient.Name 
      FROM Includes
      JOIN Ingredient ON Includes.IngredientID = Ingredient.IngredientID
      WHERE Includes.RecipeID = ?
  `;
  
  db.query(query, [recipeID], (err, results) => {
      if (err) {
          console.error('Error fetching ingredients:', err);
          return res.status(500).json({ message: 'Error fetching ingredients' });
      }
      
      if (results.length === 0) {
          console.log(`No ingredients found for recipeID: ${recipeID}`);
      }
      // Log the results for debugging
      console.log("Ingredients found:", results);

      res.json(results);
  });
});
// Update a recipe by ID
app.put('/api/recipes/:id', async (req, res) => {
  const recipeID = req.params.id;
  const {
    adminID,
    name,
    cuisine,
    dietType,
    difficulty,
    cookingTime,
    instructions,
    imageURL
  } = req.body;

  try {
    const [result] = await db.promise().execute(
      `UPDATE Recipe 
       SET AdminID = ?, Name = ?, Cuisine = ?, DietType = ?, Difficulty = ?, 
           CookingTime = ?, Instructions = ?, ImageURL = ?
       WHERE RecipeID = ?`,
      [adminID, name, cuisine, dietType, difficulty, cookingTime, instructions, imageURL || null, recipeID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json({ message: "Recipe updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
;
// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Recipe WHERE RecipeID = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete recipe' });
    res.status(200).json({ message: 'Recipe deleted successfully' });
  });
});





// Add new ingredient
app.post('/api/ingredients', async (req, res) => {
  const { name, nutritionalValue } = req.body;
  try {
      const [result] = await db.promise().execute(
          "INSERT INTO Ingredient (Name, NutritionalValue) VALUES (?, ?)",
          [name, nutritionalValue]
      );
      res.status(201).json({ message: "Ingredient added", id: result.insertId });
  } catch (error) {
      console.error("Add error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all ingredients
app.get('/api/ingredients', async (req, res) => {
  try {
      const [rows] = await db.promise().query("SELECT * FROM Ingredient");
      res.json(rows);
  } catch (error) {
      console.error("Fetch error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update ingredient
app.put('/api/ingredients/:id', async (req, res) => {
  const id = req.params.id;
  const { name, nutritionalValue } = req.body;
  try {
      const [result] = await db.promise().execute(
          "UPDATE Ingredient SET Name = ?, NutritionalValue = ? WHERE IngredientID = ?",
          [name, nutritionalValue, id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: "Ingredient not found" });
      res.json({ message: "Ingredient updated" });
  } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete ingredient
app.delete('/api/ingredients/:id', async (req, res) => {
  const id = req.params.id;
  try {
      const [result] = await db.promise().execute("DELETE FROM Ingredient WHERE IngredientID = ?", [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Ingredient not found" });
      res.json({ message: "Ingredient deleted" });
  } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
//Ingredient Management

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

//favorites

// Add recipe to user's favorites
// ✅ Add to favorites
app.post('/api/favorite', (req, res) => {
  const { favoriteID, userId, recipeId } = req.body;

  if (!favoriteID || !userId || !recipeId) {
    return res.status(400).json({ error: 'FavoriteID, UserID, and RecipeID are required.' });
  }

  const query = `
    INSERT INTO Favorite (FavoriteID, UserID, RecipeID)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE FavoriteID = FavoriteID;
  `;

  db.query(query, [favoriteID, userId, recipeId], (err) => {
    if (err) {
      console.error("Add favorite error:", err);
      return res.status(500).json({ error: "Could not add favorite" });
    }
    res.status(201).json({ message: "Recipe added to favorites!" });
  });
});

// ✅ Get all favorites for user
app.get('/api/favorites/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT r.RecipeID, r.Name, r.Cuisine, r.DietType, r.Difficulty
    FROM Favorite f
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

// 🔴 Remove favorite
app.delete('/api/favorite/:userId/:recipeId', (req, res) => {
  const { userId, recipeId } = req.params;

  const query = `DELETE FROM Favorite WHERE UserID = ? AND RecipeID = ?`;

  db.query(query, [userId, recipeId], (err) => {
    if (err) {
      console.error("Remove favorite error:", err);
      return res.status(500).json({ error: "Failed to remove favorite" });
    }
    res.status(200).json({ message: "Recipe removed from favorites." });
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

//ratings
app.post('/api/ratings', (req, res) => {
  const { rating, reviewText, userID, recipeID } = req.body;

  const query = `
      INSERT INTO ratings (Rating, ReviewText, UserID, RecipeID)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE Rating = ?, ReviewText = ?;
  `;

  db.query(query, [rating, reviewText, userID, recipeID, rating, reviewText], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Rating submitted/updated successfully!" });
  });
});

app.get('/api/ratings/average/:recipeID', (req, res) => {
  const recipeID = req.params.recipeID;

  const query = `SELECT AVG(Rating) AS average FROM ratings WHERE RecipeID = ?`;
  db.query(query, [recipeID], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      const avg = results[0].average;
      res.json({ average: avg !== null ? parseFloat(avg) : 0 });
  });
});

// Get all ratings
app.get("/api/ratings", (req, res) => {
  db.query("SELECT * FROM ratings", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Delete a rating
app.delete("/api/ratings/:ratingID", (req, res) => {
  const { ratingID } = req.params;
  db.query("DELETE FROM ratings WHERE RatingID = ?", [ratingID], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Rating deleted successfully" });
  });
});

app.post('/api/favorite', (req, res) => {
  const { favoriteID, userId, recipeId } = req.body;

  if (!favoriteID || !userId || !recipeId) {
    return res.status(400).json({ error: 'FavoriteID, UserID, and RecipeID are required.' });
  }

  const query = `
    INSERT INTO Favorite (FavoriteID, UserID, RecipeID)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE FavoriteID = FavoriteID
  `;

  db.query(query, [favoriteID, userId, recipeId], (err) => {
    if (err) {
      console.error("Add favorite error:", err);
      return res.status(500).json({ error: "Could not add favorite" });
    }
    res.status(201).json({ message: "Recipe added to favorites!" });
  });
});

app.put("/api/updateProfile", async (req, res) => {
  const { userID, name, email, preferences } = req.body;

  try {
    // Update user details
    await db.query(
      "UPDATE users SET Name = ?, Email = ? WHERE UserID = ?",
      [name, email, userID]
    );

    // Update preferences in user_pref table
    await db.query(
      "INSERT INTO user_pref (UserID, Preferences) VALUES (?, ?) ON DUPLICATE KEY UPDATE Preferences = ?",
      [userID, preferences, preferences]
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.get("/api/profile/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    const result = await db.query(
      "SELECT users.Name, users.Email, user_pref.Preferences FROM users JOIN user_pref ON users.UserID = user_pref.UserID WHERE users.UserID = ?",
      [userID]
    );

    if (result.length > 0) {
      const userProfile = result[0];
      res.json({
        Name: userProfile.Name,
        Email: userProfile.Email,
        Preferences: userProfile.Preferences,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put('/api/updateProfile', async (req, res) => {
  const { userID, name, email, preferences } = req.body;

  try {
    // Update the user's profile
    await db.query('UPDATE users SET Name = ?, Email = ? WHERE UserID = ?', [name, email, userID]);

    // Update the user's preferences in the user_pref table
    const existingPref = await db.query('SELECT * FROM user_pref WHERE UserID = ?', [userID]);

    if (existingPref.length > 0) {
      // If preferences already exist, update them
      await db.query('UPDATE user_pref SET Preferences = ? WHERE UserID = ?', [preferences, userID]);
    } else {
      // If no preferences exist, insert new record
      await db.query('INSERT INTO user_pref (UserID, Preferences) VALUES (?, ?)', [userID, preferences]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
    // Fetch user profile details and preferences from the DB
    const [userProfile] = await db.query('SELECT Name, Email FROM users WHERE UserID = ?', [userID]);
    const [userPreferences] = await db.query('SELECT Preferences FROM user_pref WHERE UserID = ?', [userID]);
    
    if (userProfile.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user profile along with preferences
    res.json({
      Name: userProfile[0].Name,
      Email: userProfile[0].Email,
      Preferences: userPreferences.length > 0 ? userPreferences[0].Preferences : 'Not set'
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//recommending home page
// Route 1: Recommend Recipes Based on Ingredients (exact matches)
app.get('/api/recommendRecipes', (req, res) => {
  const { userId } = req.query;

  const ingredientQuery = 'SELECT IngredientID FROM userIngredient WHERE UserID = ?';
  db.query(ingredientQuery, [userId], (err, ingredientResults) => {
    if (err) {
      console.error('Error fetching user ingredients:', err);
      return res.status(500).json({ error: 'Failed to fetch user ingredients.' });
    }

    const ingredientIDs = ingredientResults.map(row => row.IngredientID);

    if (ingredientIDs.length === 0) {
      return res.status(404).json({ error: 'No ingredients found for the user.' });
    }

    // Dynamically prepare placeholders for IN clause
    const placeholders = ingredientIDs.map(() => '?').join(',');
    const recipeQuery = `
      SELECT DISTINCT r.RecipeID, r.Name, r.Cuisine, r.DietType, r.Difficulty, r.ImageURL
      FROM Recipe r
      JOIN Includes i ON r.RecipeID = i.RecipeID
      WHERE i.IngredientID IN (${placeholders})
    `;

    db.query(recipeQuery, ingredientIDs, (err, recipeResults) => {
      if (err) {
        console.error('Error fetching recipes:', err);
        return res.status(500).json({ error: 'Failed to fetch recipes.' });
      }

      res.status(200).json(recipeResults);
    });
  });
});


// Route 2: Smarter Recommendations (using random scoring or more advanced logic)
app.get('/api/recommendations/:userId', (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const query = `
    SELECT r.RecipeID, r.Name, r.Cuisine, r.DietType, r.Difficulty, r.ImageURL,
           ROUND((RAND() * 10), 1) AS RecommendationScore
    FROM Recipe r
    WHERE EXISTS (
      SELECT 1 FROM Includes i
      JOIN userIngredient ui ON i.IngredientID = ui.IngredientID
      WHERE ui.UserID = ?
      AND i.RecipeID = r.RecipeID
    )
    ORDER BY RecommendationScore DESC
    LIMIT 10;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching recommendations:', err);
      return res.status(500).json({ error: 'Failed to fetch recommendations.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No recommendations found.' });
    }

    res.status(200).json(results);
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  const query = 'SELECT * FROM admin WHERE Email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const admin = results[0];
    console.log("✅ Found admin:", admin); // Debug

    if (admin.Password !== password) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const adminProfile = {
      adminID: admin.AdminID,
      name: admin.Name,
      email: admin.Email,
    };

    console.log("✅ Sending to frontend:", adminProfile);
    return res.status(200).json(adminProfile);
  });
});

//  Fetch all rows from Includes table (with optional RecipeID filter)
app.get('/api/includes', (req, res) => {
  const { recipeID } = req.query; // Optional query parameter to filter by RecipeID

  let query = 'SELECT * FROM Includes';
  const params = [];

  if (recipeID) {
      query += ' WHERE RecipeID = ?';
      params.push(recipeID);
  }

  db.query(query, params, (err, results) => {
      if (err) {
          console.error('Error fetching includes data:', err);
          return res.status(500).json({ error: 'Failed to fetch includes data' });
      }
      res.status(200).json(results);
  });
});

//  Add or Update a row in Includes table
app.post('/api/includes', (req, res) => {
  const { RecipeID, IngredientID, Quantity } = req.body;
  if (!RecipeID || !IngredientID || !Quantity) {
    return res.status(400).json({ error: 'All fields are required' });
}

const query = `
    INSERT INTO Includes (RecipeID, IngredientID, Quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE Quantity = ?
`;
db.query(query, [RecipeID, IngredientID, Quantity, Quantity], (err) => {
    if (err) {
        console.error('Error saving row:', err);
        return res.status(500).json({ error: 'Failed to save row' });
    }
    res.status(201).json({ message: 'Row saved successfully!' });
});
});

//  Delete a row from Includes table
app.delete('/api/includes/:recipeID/:ingredientID', (req, res) => {
const { recipeID, ingredientID } = req.params;

const query = 'DELETE FROM Includes WHERE RecipeID = ? AND IngredientID = ?';
db.query(query, [recipeID, ingredientID], (err) => {
          if (err) {
            console.error('Error deleting row:', err);
            return res.status(500).json({ error: 'Failed to delete row' });
        }
        res.status(200).json({ message: 'Row deleted successfully!' });
    });
});

// Fetch the latest total users
// Fetch total number of users using SQL procedure
app.get('/api/total-users', (req, res) => {
  // Step 1: Call the procedure
  db.query('CALL GetTotalUsers(@totalUsers)', (err) => {
      if (err) {
          console.error('Error calling procedure:', err);
          return res.status(500).json({ error: 'Failed to call procedure' });
      }

      // Step 2: Retrieve the OUT parameter
      db.query('SELECT @totalUsers AS TotalUsers', (err, results) => {
          if (err) {
              console.error('Error fetching total users:', err);
              return res.status(500).json({ error: 'Failed to fetch total users' });
          }

          const totalUsers = results[0].TotalUsers; // Extract result from query
          res.status(200).json({ totalUsers });
      });
  });
});

app.get('/api/ingredients/search', (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).json({ error: "Missing name query parameter" });
  }

  const sql = "SELECT IngredientID, Name FROM Ingredient WHERE Name LIKE ? LIMIT 10";

  db.query(sql, [`%${name}%`], (err, results) => {
    if (err) {
      console.error("Ingredient Search DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

app.post('/api/userIngredients', (req, res) => {
  const { userId, ingredientName, quantity } = req.body;

  if (!userId || !ingredientName || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO UserIngredient (Quantity, UserID, IngredientID)
    VALUES (?, ?, (SELECT IngredientID FROM Ingredient WHERE Name = ?))
  `;

  db.query(sql, [quantity, userId, ingredientName], (err, result) => {
    if (err) {
      console.error('Error adding ingredient:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(201).json({ message: 'Ingredient added successfully', result });
  });
});


app.get('/api/userIngredients/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT ui.UserIngredientID, ui.Quantity, i.Name AS IngredientName
    FROM UserIngredient ui
    JOIN Ingredient i ON ui.IngredientID = i.IngredientID
    WHERE ui.UserID = ?
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching user ingredients:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    res.status(200).json(rows);
  });
});

app.put('/api/userIngredients/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    UPDATE UserIngredient SET Quantity = ? WHERE UserIngredientID = ?
  `;

  db.query(sql, [quantity, id], (err, result) => {
    if (err) {
      console.error('Error updating ingredient:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User Ingredient not found' });
    }

    res.status(200).json({ message: 'Ingredient updated successfully' });
  });
});

app.delete('/api/userIngredients/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM UserIngredient WHERE UserIngredientID = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting ingredient:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User Ingredient not found' });
    }

    res.status(200).json({ message: 'Ingredient deleted successfully' });
  });
});
