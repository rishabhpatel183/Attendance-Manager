"""
Local Mobile Web Server for Attendance Manager
Serves the PWA so you can open it on your iPhone or Android phone over Wi-Fi.
"""

import http.server
import socketserver
import socket
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

def main():
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    local_ip = get_local_ip()
    url = f"http://{local_ip}:{PORT}"

    print("=" * 64)
    print("ATTENDANCE MANAGER - MOBILE PWA SERVER")
    print("=" * 64)
    print("\nOPEN THIS URL ON YOUR PHONE (Same Wi-Fi network):")
    print(f"\n-->  {url}")
    print(f"-->  http://localhost:{PORT}  (on this computer)")
    print("\n" + "-" * 64)
    print("HOW TO INSTALL ON YOUR PHONE:")
    print("-" * 64)
    print("[1] APPLE / iPHONE:")
    print("    - Open Safari and visit the URL above")
    print("    - Tap the 'Share' icon (square with arrow at the bottom)")
    print("    - Scroll down and tap 'Add to Home Screen' (+)")
    print("    -> It will open full-screen just like a native iOS app!")
    print("\n[2] ANDROID:")
    print("    - Open Chrome and visit the URL above")
    print("    - Tap the three dots (menu) in top-right")
    print("    - Tap 'Install app' or 'Add to Home screen'")
    print("    -> It will open full-screen with native notification support!")
    print("=" * 64)
    print("Press Ctrl+C to stop the server.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main()
