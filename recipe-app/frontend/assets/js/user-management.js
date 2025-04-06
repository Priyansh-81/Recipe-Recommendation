document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userTable = document.querySelector('#userTable tbody');
    const searchBox = document.getElementById('searchBox'); // Search input field

    // Fetch Users from Backend
    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:5001/api/users');
            const users = await response.json();
            renderUsers(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Render Users in the Table
    function renderUsers(users) {
        userTable.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.classList.add("user-row"); // Add class for search filtering
            row.innerHTML = `
                <td>${user.UserID}</td>
                <td>${user.Name}</td>
                <td>${user.Email}</td>
                <td>
                    <button onclick="editUser(${user.UserID})">Edit</button>
                    <button onclick="deleteUser(${user.UserID})">Delete</button>
                </td>
            `;
            userTable.appendChild(row);
        });
    }

    // Handle Form Submission (Add or Update User)
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userID = document.getElementById('userID').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const endpoint = userID ? `/api/users/${userID}` : '/api/register';
        const method = userID ? 'PUT' : 'POST';

        try {
            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            if (!response.ok) throw new Error('Error saving user');

            userForm.reset();
            document.getElementById('userID').value = '';
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    });

    // Edit User
    window.editUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:5001/api/users/${id}`);
            const user = await response.json();

            document.getElementById('userID').value = user.UserID;
            document.getElementById('name').value = user.Name;
            document.getElementById('email').value = user.Email;
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    // Delete User
    window.deleteUser = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await fetch(`http://localhost:5001/api/users/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Search Users
    function searchUsers() {
        const searchTerm = searchBox.value.toLowerCase();
        const rows = document.querySelectorAll(".user-row");

        rows.forEach((row) => {
            const userName = row.cells[1].textContent.toLowerCase();
            const userEmail = row.cells[2].textContent.toLowerCase();

            if (userName.includes(searchTerm) || userEmail.includes(searchTerm)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    // Attach search event listener
    searchBox.addEventListener("keyup", searchUsers);

    // Initial Fetch
    fetchUsers();
});