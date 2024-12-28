const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
const cors = require('cors');

// Allow requests from specific origin
app.use(cors({ origin: 'http://localhost:5173' }));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/courses', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

const User = mongoose.model('User', UserSchema);

// Middleware for verifying JWT and roles
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('12345678', 10); // Predefined password for admin
      const adminUser = new User({ username: 'admin', password: hashedPassword, role: 'admin' });
      await adminUser.save();
      console.log('Admin user created with username: admin');
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
});
// Contact us route to handle POST request
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // You can send this data to your email or store it in a database
  console.log('Contact Request Received:', { name, email, message });

  // Simulating sending an email or saving to the database
  res.status(200).send({ message: 'Message sent successfully' });
});
app.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
})
// Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to the filename
  },
});

const upload = multer({ storage });

// API to add a course (Admin Only)
app.post('/api/courses', authenticateJWT, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newCourse = new Course({ title, price, image });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ error: 'Error saving course' });
  }
});

// API to get all courses
app.get('/api/courses', authenticateJWT, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

// API to update a course (Admin Only)
app.put('/api/courses/:id', authenticateJWT, authorizeAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, price } = req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : null;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    if (!image) image = course.image;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, price, image },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: 'Error updating course' });
  }
});

// API to delete a course (Admin Only)
app.delete('/api/courses/:id', authenticateJWT, authorizeAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting course' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Course Schema
const CourseSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String, // Image file path
});

const Course = mongoose.model('Course', CourseSchema);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
