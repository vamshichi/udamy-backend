const { z } = require("zod");
const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const { Admin, Course } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const router = Router();

const validate = z.object({
    username: z.string(),
    password: z.string().min(8)
});

router.post('/signup', async (req, res) => {
    try {
        const { username, password } = validate.parse(req.body);

        const admin = await Admin.create({ username, password });

        if (!admin) {
            return res.status(403).json({ message: 'Authentication issue' });
        }

        const adminId = admin._id;
        const token = jwt.sign({ adminId }, JWT_SECRET);

        return res.status(200).json({ message: "Admin created successfully", token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signin', async (req, res) => {
    try {
        const { username, password } = validate.parse(req.body);

        const admin = await Admin.findOne({ username, password });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const adminId = admin._id;
        const token = jwt.sign({ adminId }, JWT_SECRET);

        return res.status(200).json({ message: 'Admin logged in successfully', token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/courses', adminMiddleware, async (req, res) => {
    try {
        const newCourse = await Course.create({
            title: req.body.title,
            description: req.body.description,
            imageLink: req.body.imageLink,
            price: req.body.price
        });

        return res.status(200).json({ message: "Course created successfully", id: newCourse._id });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/courses', adminMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({});
        return res.status(200).json({ courses });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
