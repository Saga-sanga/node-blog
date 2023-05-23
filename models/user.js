const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
    }
  }
});

// Pre method called on every save operation
userSchema.pre("save", async (next) => {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// userSchema.set('toObject', {
//   transform: function(doc, ret) {
//     delete ret.password;
//     return ret;
//   }
// })

const User = mongoose.model("user", userSchema);

module.exports = User;
