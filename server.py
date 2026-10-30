#!/usr/bin/env python3
"""
Simple web server to serve the DevBrief application
Run: python server.py
Then open http://localhost:8080 in your browser
"""

import http.server
import socketserver
import webbrowser
import os
import socket
from pathlib import Path

PORT = 8080
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

class ReuseAddrTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def find_available_port(start_port=8080, max_attempts=10):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.bind(("", port))
                return port
        except OSError:
            continue
    raise OSError("No available ports found")

def run_server():
    port = find_available_port(PORT)
    with ReuseAddrTCPServer(("", port), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 DevBrief Server Started!")
        print(f"📍 Open http://localhost:{port} in your browser")
        print(f"📁 Serving from: {DIRECTORY}")
        print(f"\n Press Ctrl+C to stop the server\n")
        
        # Open browser automatically
        try:
            webbrowser.open(f"http://localhost:{port}")
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✓ Server stopped")

if __name__ == "__main__":
    run_server()
