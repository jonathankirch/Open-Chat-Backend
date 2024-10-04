const User = require('../models/User')
const FriendRequest = require('../models/FriendRequest')
const jwt = require('jsonwebtoken')

exports.getAll = async (req, res) => {
  try {
    const users = await FriendRequest.find()
    res.json(users)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.sendRequest = async (req, res) => {
  const { sender, receiver } = req.body

  try {
    const senderEmail = jwt.verify(sender, process.env.JWT_SECRET).email

    const isSender = await User.findOne({ email: senderEmail })

    const isReceiver = await User.findOne({
      username: receiver,
    })

    if (!isSender || !isReceiver) {
      return res.status(400).json('Invalid user')
    }

    const contactsOfSender = await User.findOne({ email: senderEmail }).select(
      'contacts'
    )

    if (contactsOfSender.contacts.includes(isReceiver._id)) {
      return res.status(400).json('Contact already added')
    }

    const existingRequests = await FriendRequest.find({
      sender: isSender.username,
      receiver: receiver,
      status: 'pending',
    })

    if (existingRequests.length) {
      return res
        .status(400)
        .json('A request has already been sent to this user!')
    }

    let friendRequest = new FriendRequest({
      sender: isSender.username,
      receiver: receiver,
    })

    friendRequest = await friendRequest.save()

    res.status(200).json('Request sent!')
  } catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
  }
}

exports.pending = async (req, res) => {
  const user = req.params.user

  try {
    const userEmail = jwt.verify(user, process.env.JWT_SECRET).email
    const isUser = await User.findOne({ email: userEmail })

    if (!isUser) {
      return res.status(400).json('Invalid user!')
    }

    const requests = await FriendRequest.find({
      receiver: isUser.username,
      status: 'pending',
    })

    res.json(requests)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.sent = async (req, res) => {
  const user = req.params.user

  try {
    const userEmail = jwt.verify(user, process.env.JWT_SECRET).email

    const isUser = await User.findOne({ email: userEmail })

    if (!isUser) {
      return res.status(400).json('Invalid user')
    }

    const requests = await FriendRequest.find({
      sender: isUser.username,
    })

    res.status(200).json(requests)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.accept = async (req, res) => {
  const { requestId, response } = req.body
  try {
    const request = await FriendRequest.findById(requestId)

    if (!request) {
      return res.status(404).json('Friend request not found')
    }

    const sender = await User.findOne({ username: request.sender }).select(
      '_id contacts'
    )
    const receiver = await User.findOne({ username: request.receiver }).select(
      '_id contacts'
    )

    if (response === 'decline') {
      request.status = 'declined'

      await request.save()
      return res.status(200).json('Friend request declined')
    }

    if (!sender.contacts.includes(receiver._id)) {
      sender.contacts.push(receiver._id)
    }

    if (!receiver.contacts.includes(sender._id)) {
      receiver.contacts.push(sender._id)
    }

    request.status = response

    await sender.save()
    await receiver.save()

    await request.save()

    res.status(200).json('Friend request successfully updated')
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}
