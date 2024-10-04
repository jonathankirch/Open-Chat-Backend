const User = require('../models/User')
const GroupRequest = require('../models/GroupRequest')

exports.getAll = async (req, res) => {
  try {
    const requests = await GroupRequest.find()
    res.json(requests)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

exports.send = async (req, res) => {
  const { name, sender, receivers } = req.body

  try {
    const isSender = await User.findOne({ username: sender })

    if (!isSender) {
      return res.status(400).json('Invalid user')
    }

    const isReceivers = await User.find({
      username: { $in: receivers },
    })

    if (!receivers) {
      return res.status(400).json('No users provided')
    }

    if (isReceivers.length != receivers.length) {
      return res.status(400).json('One or more users not found')
    }

    if (!name) {
      return res.status(400).json('Group name required')
    }

    const newRequest = await GroupRequest.find({
      group_name: name,
      sender,
      receivers: { $in: receivers },
    })

    if (newRequest.length > 0) {
      return res.status(400).json('Request already sent')
    }

    const receiverUsernames = isReceivers.map((user) => user.username)

    let groupRequest = new GroupRequest({
      group_name: name,
      sender,
      receivers: receiverUsernames,
    })

    groupRequest = await groupRequest.save()

    res.status(200).json('Request sent!')
  } catch (error) {
    console.log(error)
    res.status(500).send('Server Error')
  }
}

exports.pending = async (req, res) => {
  const user = req.params.user

  try {
    const isUser = await User.findOne({ username: user })

    if (!isUser) {
      return res.status(400).json('Invalid user')
    }

    const requests = await GroupRequest.find({
      receivers: user,
      status: 'pending',
    })

    if (requests.length === 0) {
      return res.status(400).json('No pending requests')
    }

    res.status(200).json(requests)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Server Error')
  }
}

exports.sent = async (req, res) => {
  const user = req.params.user

  try {
    const isUser = await User.findOne({ username: user })

    if (!isUser) {
      return res.status(400).json('Invalid user')
    }

    const requests = await GroupRequest.find({
      sender: user,
    })

    if (requests.length === 0) {
      return res.status(400).json('No requests sent')
    }

    res.status(200).json(requests)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}
