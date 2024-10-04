const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema({
  message_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true,
  },
  file_url: { type: String, required: true },
  file_type: { type: String, enum: ['image', 'video'], required: true },
  created_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Attachment', attachmentSchema)
