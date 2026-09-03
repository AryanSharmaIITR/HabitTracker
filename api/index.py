import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from main import app as fastapi_app


async def app(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith("/api"):
            scope["path"] = path[4:] or "/"
            if scope.get("root_path", "").startswith("/api"):
                scope["root_path"] = scope["root_path"][4:]
    return await fastapi_app(scope, receive, send)
