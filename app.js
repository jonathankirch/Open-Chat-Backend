const express = require('express')
const connectDB = require('./src/db/database')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

const User = require('./src/models/User')

const jwt = require('jsonwebtoken')

require('dotenv').config()

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://open-chat-v1.vercel.app',
      'https://open-chat-backend-production.up.railway.app',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'bypass-tunnel-reminder'],  
  },
})

app.set('io', io)

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://open-chat-v1.vercel.app',
      'https://open-chat-backend-production.up.railway.app/',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type', 'bypass-tunnel-reminder'],
  })
)
app.use(express.json())

connectDB()

// Rotas
const authRoutes = require('./src/routes/auth')
const userRoutes = require('./src/routes/users')
const conversationRoutes = require('./src/routes/conversations')
const groupConversationRoutes = require('./src/routes/groupConversation')
const messageRoutes = require('./src/routes/messages')
const attachmentRoutes = require('./src/routes/attachments')
const friendRequestRoutes = require('./src/routes/friendRequests')
const groupRequestRoutes = require('./src/routes/groupRequests')

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/group-conversations', groupConversationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/attachments', attachmentRoutes)
app.use('/api/friend-request', friendRequestRoutes)
app.use('/api/group-request', groupRequestRoutes)

const PORT = process.env.PORT || 5000

let connectedUsers = []

const mongoose = require('mongoose')
const GroupConversation = require('./src/models/GroupConversation') // Importa o modelo de grupo

io.on('connection', (socket) => {
  const token = socket.handshake.auth.token

  if (token) {
    try {
      // Verifica o JWT
      const userToken = jwt.verify(token, process.env.JWT_SECRET)

      if (userToken.email) {
        // Verificar se o usuário já está conectado e remover o antigo socketId
        const existingUser = connectedUsers.find(
          (user) => user.email === userToken.email
        )

        if (existingUser) {
          // Substituir o socketId do usuário já existente
          existingUser.socketId = socket.id
        } else {
          // Adicionar novo usuário
          connectedUsers.push({ email: userToken.email, socketId: socket.id })
        }

        console.log('Usuário conectado:', {
          email: userToken.email,
          socketId: socket.id,
        })

        // Enviar a lista atualizada de usuários conectados para todos
        io.emit('updateUserList', connectedUsers)
      }
    } catch (error) {
      // Captura e loga o erro do JWT
      console.error('Erro de autenticação JWT:', error.message)
      return socket.disconnect() // Desconecta o socket em caso de erro na verificação do token
    }
  } else {
    console.error('Token JWT não fornecido. Desconectando o socket...')
    return socket.disconnect()
  }

  // Escutar quando o cliente envia uma mensagem
  socket.on('sendMessage', async (data) => {
    const { sender, receiver, content, isGroup } = data

    try {
      const SenderToken = jwt.verify(sender, process.env.JWT_SECRET)
      // console.log('SenderToken: ', SenderToken)
      const Sender = await User.findOne({ email: SenderToken.email })
      // console.log('Sender: ', Sender)
      const Receiver = await User.findOne({ username: receiver })
      // console.log('Receiver: ', Receiver)

      const senderObj = connectedUsers.find(
        (user) => user.email === Sender.email
      )
      const receiverObj = connectedUsers.find(
        (user) => user.email === Receiver.email
      )

      if (receiverObj) {
        io.to(receiverObj.socketId).emit('receiveMessage', {
          sender: Sender.username,
          receiver: Receiver.username,
          content: content,
          isGroup: isGroup,
        })
      }

      io.to(senderObj.socketId).emit('receiveMessage', {
        sender: Sender.username,
        receiver: Receiver.username,
        content: content,
        isGroup: isGroup,
      })

      console.log(
        `Mensagem enviada de ${Sender.username} para ${Receiver.username}`
      )
    } catch (error) {
      console.error(
        'Erro ao verificar ou processar JWT na mensagem:',
        error.message
      )
    }
  })

  // Quando um usuário desconecta
  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter(
      (user) => user.socketId !== socket.id
    )
    console.log('Usuário desconectado:', socket.id)

    io.emit('updateUserList', connectedUsers)
  })
})

server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
