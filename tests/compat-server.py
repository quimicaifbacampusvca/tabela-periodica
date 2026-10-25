"""Local test server: simulate a transport outage without changing the website."""

import argparse
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    blocked = False

    def do_POST(self):
        if self.path not in ("/__compat-network/offline", "/__compat-network/online"):
            self.send_error(404)
            return
        Handler.blocked = self.path.endswith("/offline")
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if Handler.blocked:
            self.connection.shutdown(socket.SHUT_RDWR)
            self.connection.close()
            return
        super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("port", type=int, nargs="?", default=8765)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()
    ThreadingHTTPServer((args.bind, args.port), Handler).serve_forever()
