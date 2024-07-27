const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");
const  jwt  = require("jsonwebtoken");
const { JWT_SECRET } = require("../config")
const { z } = require("zod")

const validate = z.object({
    username: z.string(),
    password: z.string().min(8)
});

// User Routes
router.post('/signup', async(req, res) => {
    // Implement user signup logic
    try {
        const { username, password } = validate.parse(req.body);

        const user = await User.create({ username, password });

        if (!user) {
            return res.status(403).json({ message: 'Authentication issue' });
        }

        const userId = user._id;
        const token = jwt.sign({ userId }, JWT_SECRET);

        return res.status(200).json({ message: "Admin created successfully", token });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signin', async(req, res) => {
    // Implement user signup logic
    try{
        const {username , password} = validate.parse(req.body);

        const signin = await User.findOne({ username , password })

    if(!signin){
        return res.status(403).json({
            message : "invalid username and password"
        })
    }

    const userId = signin._id;
    const token = jwt.sign({ userId },JWT_SECRET)
    
    return res.status(200).json({
        message : "User login successfully",
        token
    })}catch(err){
        if(err instanceof z.ZodError){
            return res.status(400).json({ message: err.errors });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    
});

router.get('/courses',userMiddleware,async (req, res) => {
    // Implement listing all courses logic
    const courses = await Course.find({});

    res.status(200).json({
        message : "Lists all the courses",
        courses
    })

});

router.post('/courses/:courseId', userMiddleware,async(req, res) => {
    // Implement course purchase logic
    const courseId = req.params.courseId;
    

    await User.updateOne({
        userId: req.userId
    }, {
        "$push": {
            purchasedCourses: courseId
        }
    })
    res.json({
        message: "Purchase complete!"
    })
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const courses = await Course.find({
            _id: {
                '$in': user.purchasedCourses
            }
        });

        return res.status(200).json({
            message: "List of courses purchased by the user",
            courses
        });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;