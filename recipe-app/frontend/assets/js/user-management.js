document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();

    const userForm = document.getElementById('userForm');
    const cancelBtn = document.getElementById('cancelEditBtn');

    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveUser();
    });

    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    document.getElementById('searchBox').addEventListener('keyup', searchUsers);
});

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
                    <button class="edit-btn" data-id="${user.UserID}">Edit</button>
                    <button class="delete-btn" data-id="${user.UserID}">Delete</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn =>
            btn.addEventListener('click', () => editUser(btn.dataset.id))
        );

        document.querySelectorAll('.delete-btn').forEach(btn =>
            btn.addEventListener('click', () => deleteUser(btn.dataset.id))
        );
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function saveUser() {
    const userID = document.getElementById('userID').value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!name || !email || (!userID && !password)) {
        alert('Please fill in all required fields.');
        return;
    }

    try {
        const payload = { Name: name, Email: email };
        if (!userID) payload.Password = password;

        const url = userID
            ? `http://localhost:5001/api/users/${userID}`
            : 'http://localhost:5001/api/users';

        const method = userID ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`Failed to ${userID ? 'update' : 'add'} user`);

        alert(`User ${userID ? 'updated' : 'added'} successfully!`);
        resetForm();
        fetchUsers();
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

async function editUser(userID) {
    try {
        const response = await fetch(`http://localhost:5001/api/users/${userID}`);
        if (!response.ok) throw new Error('Failed to fetch user details');

        const user = await response.json();

        document.getElementById('userID').value = user.UserID;
        document.getElementById('name').value = user.Name;
        document.getElementById('email').value = user.Email;

        const passwordInput = document.getElementById('password');
        passwordInput.value = '';
        passwordInput.disabled = true;
        passwordInput.placeholder = '(unchanged)';
        passwordInput.style.backgroundColor = '#f1f1f1';

        document.querySelector('#userForm button[type="submit"]').textContent = 'Update User';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

async function deleteUser(userID) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`http://localhost:5001/api/users/${userID}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete user');

        alert('User deleted successfully!');
        fetchUsers();
    } catch (error) {
        console.error(error.message);
        alert(error.message);
    }
}

function resetForm() {
    document.getElementById('userForm').reset();
    document.getElementById('userID').value = '';

    const passwordInput = document.getElementById('password');
    passwordInput.disabled = false;
    passwordInput.placeholder = '';
    passwordInput.style.backgroundColor = '';

    document.querySelector('#userForm button[type="submit"]').textContent = 'Save User';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

function searchUsers() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const rows = document.querySelectorAll('#userTable tbody tr');

    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        row.style.display = name.includes(searchTerm) || email.includes(searchTerm) ? '' : 'none';
    });
}