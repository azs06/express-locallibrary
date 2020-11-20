var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 100 },
    email: { type: String, required: true, minlength: 5, maxlength: 256 },
    password: { type: String, required: true, minlength: 8 }
});

UserSchema
    .virtual('url')
    .get(function(){
        return '/user/' + this._id;
    })

module.exports = mongoose.model('User', UserSchema);