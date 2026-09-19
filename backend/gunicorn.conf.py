import os
import subprocess
import sys

# The demo keeps its data in a SQLite file inside the instance, and an instance
# that restarts (a free one does, after sleeping) loses whatever it wrote since
# the deploy. Migrate and seed before serving, so the demo login always works.
# An explicit DATABASE_ENGINE on the host still wins.
os.environ.setdefault("DATABASE_ENGINE", "sqlite")


def on_starting(server):
    for command in (["migrate", "--noinput"], ["seed_demo"]):
        subprocess.run([sys.executable, "manage.py", *command], check=True)
