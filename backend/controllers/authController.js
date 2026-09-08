const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function tokenFor(user) { return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function safeUser(user) { return { id: user._id, name: user.name, username: user.username, email: user.email, createdAt: user.createdAt }; }

async function signup(req, res, next) {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'Name, username, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, username, email, passwordHash });
    res.status(201).json({ user: safeUser(user), token: tokenFor(user) });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Username or email and password are required.' });
    const user = await User.findOne({ $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }] }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid username/email or password.' });
    res.json({ user: safeUser(user), token: tokenFor(user) });
  } catch (error) { next(error); }
}

function me(req, res) { res.json({ user: safeUser(req.user) }); }
function logout(req, res) { res.json({ message: 'Signed out.' }); }
module.exports = { signup, login, me, logout };
