const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');// for google auth as findOrCreate is not a mongo function
                                                    // so npm package

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    googleId:String,
    remainingTasks:[
        {
            task:{
                type:String,
                required:true
            },
            from:String,
            to:String,
            reminder:String
        }
    ],
    newAddedTask:{
        task:String,
        reminder:String,
        from:String
    },
    doneTasks:[
        {
            task:{
                type:String,
            }
        }
    ]
    
})
userSchema.plugin(passportLocalMongoose);   //this will have a authenticate method which is used in 
                                            //localstrategy in app.js
userSchema.plugin(findOrCreate);// for google auth
module.exports = mongoose.model('User',userSchema);