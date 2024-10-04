const mongoose = require('mongoose')

const groupRequestSchema = new mongoose.Schema({
  group_name: { type: String, required: true },
  sender: { type: String, required: true },
  receivers: [{ type: String, required: true }],
  status: { type: String, required: false, default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('GroupRequest', groupRequestSchema)
