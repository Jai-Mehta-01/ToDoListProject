

module.exports.allTasksPage = async (req, res, next) => {
    try {
        const user = req.user;
        res.render('tasks', { user });
    } catch (e) {
        next(e);
    }

}

module.exports.addNewTask = async (req, res, next) => {
    try {
        const user = req.user;
        console.log(req.body);
        user.remainingTasks.push({
            task:req.body.task,
            from:req.body.from,
            to:req.body.to,
            reminder:req.body.reminder
        })
        user.newAddedTask.task = req.body.task;
        user.newAddedTask.reminder = req.body.reminder;
        user.newAddedTask.from = req.body.from;
        console.log(user);
        await user.save();
        
        
        res.redirect('/tasks');
    } catch (e) {
        next(e);
    }

}


module.exports.editTaskForm = async(req,res,next) =>
{
    try {
        const {id} = req.params;
        const user = req.user;
        const task = user.remainingTasks.find(task => task._id.toString() == id);
        res.render('edit',{task});
    } catch (e) {
        next(e);
    }
}
module.exports.editTask = async(req,res,next) =>
{
    try {
        const {id} = req.params;
        const user = req.user;
        const editTask = user.remainingTasks.find(task => task._id.toString() == id);
        editTask.task = req.body.task;
        editTask.from = req.body.from;
        editTask.to = req.body.to;
        editTask.reminder = req.body.reminder;
        if(req.body.reminder)
        {
            user.newAddedTask.reminder = req.body.reminder;
        }
        await user.save();
        console.log(user);
        res.redirect('/tasks');
    } catch (e) {
        next(e);
    }
}
module.exports.deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const donetask = user.remainingTasks.find(task => task._id.toString() == id);
        await user.updateOne({ $pull: {remainingTasks:{ _id: id } } });
        console.log(donetask.task);
        user.doneTasks.push({task:donetask.task});
        await user.save();
        res.redirect('/tasks');
    } catch (e) {
        next(e);
    }

}
module.exports.removeTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        await user.updateOne({ $pull: {remainingTasks:{ _id: id } } });
        req.flash('success',"Successfully removed a task!")
        res.redirect('/tasks');
    } catch (e) {
        next(e);
    }

}

module.exports.deleteAllTasks = async(req,res,next) =>
{
    try {
        const user = req.user;
        user.remainingTasks = [];
        user.newAddedTask = null;
        user.doneTasks = [];
        await user.save();
        console.log(user);
        res.redirect('/tasks');
    } catch (e) {
        next(e);
        
    }
}


