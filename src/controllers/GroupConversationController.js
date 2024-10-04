const User = require('../models/User')
const GroupConversation = require('../models/GroupConversation')
const jwt = require('jsonwebtoken')

exports.allGroupConversations = async (req, res) => {
  try {
    const groupConversations = await GroupConversation.find()
    res.json(groupConversations)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.createGroupConversation = async (req, res) => {
  const { creator, participantNames, groupConversationName } = req.body

  try {
    const creatorEmail = jwt.verify(creator, process.env.JWT_SECRET).email

    const isUserCreator = await User.findOne({ email: creatorEmail })

    if (!isUserCreator) {
      return res.status(400).json('Group creator not found')
    }

    const participants = await User.find({
      username: { $in: participantNames },
    }).select('_id')

    if (participants.length !== participantNames.length) {
      return res.status(400).json('One or more participants not found')
    }

    const participantIds = participants.map((user) => user._id)
    participantIds.push(isUserCreator._id)

    const existingGroupConversation = await GroupConversation.findOne({
      name: groupConversationName,
      participants: { $all: participantIds },
    })

    if (existingGroupConversation) {
      return res.status(400).json('An identical group already exists')
    }

    let groupConversation = new GroupConversation({
      name: groupConversationName,
      creator: isUserCreator._id,
      participants: participantIds,
    })

    groupConversation = await groupConversation.save()

    res.status(201).json('Group created')
  } catch (err) {
    console.error('Server Error: ', err)
    res.status(500).send('Server Error')
  }
}
