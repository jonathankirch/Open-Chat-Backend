const GroupConversation = require('../models/GroupConversation')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const secretKey = process.env.JWT_SECRET

// Função para criar um novo usuário
exports.allUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.findUser = async (req, res) => {
  const userName = req.body.user

  try {
    // Verificar se o usuário existe
    let user = await User.findOne({
      username: userName,
    })

    if (!user) {
      return res.status(400).json('Usuário inexistente')
    }

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no servidor')
  }
}

exports.findContacts = async (req, res) => {
  const { token } = req.body

  try {
    const email = jwt.verify(token, secretKey).email

    let user = await User.findOne({
      email
    })

    if (!user) {
      return res.status(400).json('Usuário inexistente')
    }

    const contacts = await User.find({ _id: { $in: user.contacts } }).select(
      'username'
    )

    res.json(contacts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no servidor')
  }
}

exports.findGroups = async (req, res) => {
  const { token } = req.body

  try {
    const email = jwt.verify(token, secretKey).email

    let user = await User.findOne({
      email
    })

    if (!user) {
      return res.status(400).json('Usuário inexistente.')
    }

    const groups = await GroupConversation.find({
      participants: { $in: user._id },
    }).select('name')

    res.json.status(200).json(groups)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no servidor')
  }
}

exports.editUser = async (req, res) => {
  const { email, password, newName, newEmail, newPassword } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json('Usuário não existe!')
    }

    const isPassword = await bcrypt.compare(password, user.password)

    if (!isPassword) {
      return res.status(400).json('Senha incorreta!')
    }

    if (newName) user.username = newName
    if (newEmail) user.email = newEmail
    if (newPassword) {
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    await user.save()
    res.status(200).json('Usuário editado com sucesso!')
  } catch (err) {
    console.error('[Error]', err)
    res.status(500).send('Erro no servidor')
  }
}
