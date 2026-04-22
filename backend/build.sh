#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

export PLAYWRIGHT_BROWSERS_PATH=/opt/render/project/.playwright
playwright install chromium

python manage.py collectstatic --noinput
python manage.py migrate --noinput
