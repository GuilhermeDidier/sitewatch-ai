#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
# No migrate here: the build must not touch the database. It used to, against
# the free Postgres Render has since deleted, and the build failed outright.
# gunicorn.conf.py migrates and seeds SQLite when the server starts.
