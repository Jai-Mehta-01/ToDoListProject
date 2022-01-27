const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const tasks = require('../controllers/tasks');



router.route('/')
    .get(isLoggedIn, tasks.allTasksPage);

// router.get('/addTask', (req, res) => {
// })
router.route('/addTask')
    .get((req, res) => {
        res.render('addTasks');
    })
    .post(isLoggedIn, tasks.addNewTask)


router.route('/deleteAllTasks')
    .delete(isLoggedIn, tasks.deleteAllTasks);

router.route('/:id/removeTask')
    .delete(isLoggedIn, tasks.removeTask)

router.route('/:id/deleteTask')
    .delete(isLoggedIn, tasks.deleteTask);

router.route('/:id')
    .get(isLoggedIn, tasks.editTaskForm)
    .post(isLoggedIn, tasks.editTask)


module.exports = router;
