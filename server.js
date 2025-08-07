const express = require('express')
const http = require('http')
require('dotenv').config()

const port = process.env.PORT || 3000;

try {
    const app = require('./app')
    
    const server = http.createServer(app).listen(port, () => {
        console.log(`🚀 Server is running on http://localhost:${port}`)
        console.log(`🔍 API Health Check: http://localhost:${port}/`)
    })
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully')
        server.close(() => {
            console.log('Process terminated')
        })
    })
    
} catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
}