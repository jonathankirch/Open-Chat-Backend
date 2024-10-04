const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
  name: { type: String },
  is_group: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Conversation', conversationSchema)
