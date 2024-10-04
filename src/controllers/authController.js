const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secretKey = process.env.JWT_SECRET

exports.register = async (req, res) => {
  const { username, email, password } = req.body

  try {
    let user = await User.findOne({ username })
    if (user) {
      return res.status(400).json('User already exists')
    }

    user = new User({
      username,
      email,
      password,
    })

    // Hashear a senha antes de salvar no banco de dados
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    await user.save()

    const jwtToken = jwt.sign(
      {
        email: email,
        password: user.password,
      },
      secretKey,
      { expiresIn: '30d' }
    )

    res
      .status(201)
      .json({ msg: 'User successfully authenticated', token: jwtToken })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if the user exists
    let user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json('User does not exist')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json('Incorrect password')
    }

    const jwtToken = jwt.sign(
      {
        email: email,
        password: user.password,
      },
      secretKey,
      { expiresIn: '30d' }
    )

    res
      .status(200)
      .json({ msg: 'User successfully authenticated', token: jwtToken })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
}

exports.verify = async (req, res) => {
  const { token } = req.body
  try {
    const isValid = jwt.verify(token, secretKey)

    if (!isValid) {
      res.status(400).json({ msg: 'Invalid token' })
    }

    const user = await User.findOne({ email: isValid.email })
    
    res.status(200).json({ msg: 'Valid token', user: user.username })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
}
