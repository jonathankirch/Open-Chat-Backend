const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  conversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  groupConversation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupConversation',
  },
  sender: {
    type: String,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true },
  message_type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text',
  },
  attachments: [
    {
      file_url: String,
      file_type: { type: String, enum: ['image', 'video'] },
    },
  ],
  created_at: { type: Date, default: Date.now },
})

// Custom validator to ensure at least one of conversation_id or groupConversation_id is provided
messageSchema.pre('validate', function (next) {
  if (!this.conversation_id && !this.groupConversation_id) {
    next(
      new Error('Either conversation_id or groupConversation_id is required')
    )
  } else if (this.conversation_id && this.groupConversation_id) {
    next(
      new Error(
        'Only one of conversation_id or groupConversation_id should be provided'
      )
    )
  } else {
    next()
  }
})

module.exports = mongoose.model('Message', messageSchema)
