const User = require('../models/User')
const Conversation = require('../models/Conversation')
const jwt = require('jsonwebtoken')

exports.allConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
    res.json(conversations)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.createConversation = async (req, res) => {
  const { user, otherParticipants, conversationName, is_group } = req.body

  try {
    const userEmail = jwt.verify(user, process.env.JWT_SECRET).email

    const isUser = await User.findOne({ email: userEmail })

    if (!isUser) {
      return res.status(400).json('Invalid user')
    }

    const participants = await User.find({
      username: { $in: otherParticipants },
    }).select('_id')

    if (participants.length !== otherParticipants.length) {
      return res.status(400).json('One or more participants not found')
    }

    participants.push(isUser)

    const participantIds = participants.map((user) => user._id)

    if (!is_group) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: participantIds },
      })

      if (existingConversation) {
        return res.status(400).json('This conversation already exists')
      }
    }

    let conversation = new Conversation({
      name: conversationName,
      participants: participants.map((user) => user.id),
      is_group: is_group,
    })

    conversation = await conversation.save()

    res.status(201).json('Conversation created')
  } catch (err) {
    console.error('Server Error: ', err)
    res.status(500).send('Server Error')
  }
}
