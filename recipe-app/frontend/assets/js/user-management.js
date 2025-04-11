document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    // Form submission handler
    const userForm = document.getElementById('userForm');
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveUser();
    });

    // Search functionality
    document.getElementById('searchBox').addEventListener('keyup', searchUsers);
});

// Fetch all users from the backend
async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:5001/api/users');
        const users = await response.json();

        const userTableBody = document.querySelector('#userTable tbody');
        userTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.UserID}</td>
                <td>${user.Name}</td>
                <td>${user.Email}</td>
                <td>
                    <button onclick="editUser(${user.UserID})">Edit</button>
                    <button onclick="deleteUser(${user.UserID})">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Save (add or update) a user
async function saveUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || !password) {
        alert('Please fill all required fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Name: name, Email: email, Password: password }),
        });

        if (!response.ok) throw new Error('Failed to add user');

        alert('User added successfully!');
        document.getElementById('userForm').reset();
        fetchUsers(); // Refresh the user list
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}


// Edit a user
async function editUser(userID) {
    try {
        const response = await fetch(`http://localhost:5001/api/users/${userID}`);
        
        if (!response.ok) throw new Error('Failed to fetch user details');

        const user = await response.json();

        // Populate form with user details for editing
        document.getElementById('userID').value = user.UserID;
        document.getElementById('name').value = user.Name;
        document.getElementById('email').value = user.Email;
        
        // Hide password field for editing
        document.getElementById('password').style.display = 'none';
        
        document.querySelector('#userForm button[type="submit"]').textContent = 'Update User';
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

// Delete a user
async function deleteUser(userID) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`http://localhost:5001/api/users/${userID}`, { method: 'DELETE' });

        if (!response.ok) throw new Error('Failed to delete user');

        alert('User deleted successfully!');
        
        // Refresh users list
        fetchUsers();
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

// Search users in the table
function searchUsers() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();

    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
       const nameCellText = row.cells[1].textContent.toLowerCase();

       if (nameCellText.includes(searchTerm)) {
           row.style.display = '';
       } else {
           row.style.display = 'none';
       }
   });
}
