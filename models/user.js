const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail, isStrongPassword } = require("validator");
const Schema = mongoose.Schema;

const validatePassword = {
  validator: function (value) {
    return isStrongPassword(value, {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1
    });
  },
  message: "Password is not strong enough",
};

const userSchema = new Schema(
  {
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
      lowercase: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      validate: [validatePassword],
    },
  }
);

// Pre method called on every save operation
userSchema.pre("save", async function(next) {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Fires after every find operation
userSchema.post(/find$/, function(doc, next) {
  doc.forEach((doc) => {
    doc.password = undefined;
  });
  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
