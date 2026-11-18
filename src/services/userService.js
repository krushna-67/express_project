'use strict';

// In-memory data store for demonstration
const users = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'member' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'member' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'engineer' },
  { id: 5, name: 'Evan Wright', email: 'evan@example.com', role: 'designer' },
  { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', role: 'manager' }
];

let nextId = 7;

const userService = {
  getAll() {
    return [...users];
  },

  getById(id) {
    return users.find((u) => u.id === id) || null;
  },

  create({ name, email, role = 'member' }) {
    const newUser = {
      id: nextId++,
      name,
      email,
      role
    };
    users.push(newUser);
    return newUser;
  },

  delete(id) {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
};

module.exports = userService;
