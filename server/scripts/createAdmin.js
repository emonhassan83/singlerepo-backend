const path = require('path');
const readline = require('readline');

const bcrypt = require('bcrypt');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED'],
      default: 'ACTIVE',
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
    provider: {
      type: String,
      default: 'MANUAL',
    },
  },
  { timestamps: true }
);

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    countryVisited: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Profile =
  mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const questionPassword = (query) => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(query);

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (char) => {
      char = char.toString('utf8');

      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f':
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.clearLine(0);
            stdout.cursorTo(0);
            stdout.write(query + '*'.repeat(password.length));
          }
          break;
        default:
          password += char;
          stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing Environment Variable: MONGODB_URI');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');
    console.log('Creating Admin User');
    console.log('-------------------\n');

    let name = '';
    while (!name || name.length < 4) {
      name = await question('Name: ');
      if (!name) {
        console.log('⚠ Name cannot be empty!');
      } else if (name.length < 4) {
        console.log('⚠ Name must be at least 4 characters long!');
        name = '';
      }
    }

    let email = '';
    while (!email || !isValidEmail(email)) {
      email = await question('Email: ');
      if (!email) {
        console.log('⚠ Email cannot be empty!');
      } else if (!isValidEmail(email)) {
        console.log('⚠ Please enter a valid email address!');
        email = '';
      } else {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          console.log('⚠ A user with this email already exists!');
          email = '';
        }
      }
    }

    let password = '';
    let confirmPassword = '';
    while (!password || password !== confirmPassword || password.length < 8) {
      password = await questionPassword('Password: ');
      if (!password) {
        console.log('⚠ Password cannot be empty!');
        continue;
      }
      if (password.length < 8) {
        console.log('⚠ Password must be at least 8 characters long!');
        password = '';
        continue;
      }
      confirmPassword = await questionPassword('Confirm Password: ');
      if (password !== confirmPassword) {
        console.log('⚠ Passwords do not match!');
        password = '';
        confirmPassword = '';
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const session = await mongoose.startSession();
    let result;

    await session.withTransaction(async () => {
      const [user] = await User.create(
        [
          {
            email,
            password: hashedPassword,
            isVerified: true,
            accountStatus: 'ACTIVE',
            role: 'ADMIN',
            provider: 'MANUAL',
            expireAt: null, // Admin users don't expire
          },
        ],
        { session }
      );

      const [profile] = await Profile.create(
        [
          {
            userId: user._id.toString(),
            name,
          },
        ],
        { session }
      );

      result = { user, profile };
    });

    await session.endSession();

    console.log('\n✓ Admin user created successfully!');
    console.log(`Email:    ${email}`);
    console.log(`Name:     ${name}`);
    console.log(`Role:     ADMIN`);
    console.log(`Verified: Yes`);
    console.log(`ID:       ${result.user._id.toString()}`);

    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error creating admin:', error.message);
    rl.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
