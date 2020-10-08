module.exports = PushServer;
const socket = require('socket.io')

function PushServer(server) {
  this.server = socket(server)
  this.onlineClients = {}
  this.server.on('connection', (socket) => {
    socket.on('account', (data) => {
      console.log(data + ' connected.')
      socket.clientId = data
      this.onlineClients[data] = socket
    })

    socket.on('disconnect', () => {
      console.log(socket.clientId + ' disconnect.')
      this.onlineClients[socket.clientId] = undefined
    })
  })
}

PushServer.prototype.printOnlineClient = function(account, msg) {
  console.log(this.onlineClients)
}

PushServer.prototype.broadcastMsg = function(topic, msg) {
  for (const key in this.onlineClients) {
    try {
      this.onlineClients[key].emit(topic, msg)
    } catch (e) {
      console.error(e)
    }
  }
}

PushServer.prototype.sendMsg = function(account, topic, msg) {
  try {
    if (this.onlineClients[account] !== undefined) {
      this.onlineClients[account].emit(topic, msg)
      return true
    }
    return false
  } catch (e) {
    console.error(e)
    return false
  }
}
