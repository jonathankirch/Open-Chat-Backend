const User = require('../models/User')
const Message = require('../models/Message')
const Conversation = require('../models/Conversation')
const GroupConversation = require('../models/GroupConversation')
const jwt = require('jsonwebtoken')

exports.allMessages = async (req, res) => {
  try {
    const messages = await Message.find()
    res.json(messages)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.createMessage = async (req, res) => {
  const { sender, receiver, content, isGroup } = req.body

  try {
    const senderEmail = jwt.verify(sender, process.env.JWT_SECRET).email
    
    const senderId = await User.findOne({ email: senderEmail })
    const receiverId = await User.findOne({ username: receiver }).select('_id')

    let mensage

    if (isGroup === false) {
      if (!senderId._id || !receiverId) {
        return res.status(400).json('Usuário(s) não encontrado(s)')
      }

      const conversationId = await Conversation.findOne({
        participants: { $all: [senderId._id, receiverId] },
      }).select('_id')

      if (!conversationId) {
        return res.status(400).json('Conversa inexistente')
      }

      // Criar a mensagem para uma conversa normal
      mensage = new Message({
        conversation_id: conversationId,
        sender: senderId.username,
        content: content,
      })
    } else if (isGroup === true) {
      const groupConversationId = await GroupConversation.findOne({
        name: receiver,
        participants: { $in: senderId },
      }).select('_id')

      if (!groupConversationId) {
        return res.status(400).json('Conversa inexistente')
      }

      // Criar a mensagem para um grupo
      mensage = new Message({
        groupConversation_id: groupConversationId,
        sender: sender,
        content: content,
      })
    }

    if (!mensage) {
      return res.status(400).json('Falha ao criar mensagem')
    }

    await mensage.save()

    // req.app.get('io').emit('receiveMessage', { sender, receiver, content, isGroup });
    res.status(201).json('Mensagem criada com sucesso')
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Erro no servidor')
  }
}

exports.findMessages = async (req, res) => {
  const conversationName = req.params.conversation

  try {
    const conversationId = await Conversation.findOne({
      name: conversationName,
    }).select('_id')

    if (!conversationId) {
      return res.status(400).json('Conversa Inválida')
    }

    const conversation = await Message.find({
      conversation_id: conversationId,
    })

    res.json(conversation)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
}

exports.findByUsers = async (req, res) => {
  const { user1, user2 } = req.body

  console.log('user1: ', user1)
  console.log('user2: ', user2)

  if (!user1 || !user2) {
    return res.status(400).json('Parametros inválidos')
  }

  try {
    const user1Email = jwt.verify(user1, process.env.JWT_SECRET).email

    const isUser1 = await User.findOne({ email: user1Email })
    const isUser2 = await User.findOne({ username: user2 })

    if( !isUser1 || !isUser2 ) {
      return res.status(400).json('Usuário(s) inexistente(s)')
    }

    const users = [isUser1.username, isUser2.username]

    const usersId = await User.find({ username: { $in: users } }).select('_id')

    const conversationId = await Conversation.findOne({
      participants: { $all: usersId },
    }).select('_id')

    if (!conversationId) {
      return res.status(400).json('Conversa inexistente ou vazia')
    }

    const conversation = await Message.find({
      conversation_id: conversationId,
    })

    res.json(conversation)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
}

exports.groupMessages = async (req, res) => {
  const { groupName, user } = req.body

  try {
    const userId = await User.findOne({ username: user }).select('_id')

    const group = await GroupConversation.findOne({
      name: groupName,
      participants: { $in: userId },
    })

    if (!group) {
      return res.status(400).json('Grupo inexistente ou participante inválido')
    }

    const conversation = await Message.find({
      groupConversation_id: group._id,
    })

    res.json(conversation)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server error')
  }
}
