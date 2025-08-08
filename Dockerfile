# syntax=docker/dockerfile:1

########################################
# 1) Builder stage: install dependencies
########################################
FROM python:3.13-slim-bookworm AS builder

# if we have to use build-essential and libpq-dev
# then we need to delete after build is complete
# until then, we don't need them, so commented out.

RUN apt-get clean && apt-get -y update \
#    && apt-get install -y --no-install-recommends \
#    build-essential \
#    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN useradd somata

ARG APPDIR=/opt/somata-api

RUN mkdir -p $APPDIR
WORKDIR $APPDIR

COPY etc-pip.conf /etc/pip.conf
ADD requirements.txt $APPDIR
RUN python -m venv --copies $APPDIR/.venv
RUN . $APPDIR/.venv/bin/activate

RUN $APPDIR/.venv/bin/python -m pip install --no-cache-dir --upgrade pip
RUN $APPDIR/.venv/bin/pip install --no-cache-dir -r $APPDIR/requirements.txt --use-pep517

#######################################
# 2) Add environment variables
#######################################

# Remove this copy of .env if the ENV vars are being set
COPY .env $APPDIR/.env

# ENV VERSION=
# ENV DEBUG=
ENV LISTEN_PORT=8001
ENV LISTEN_IP=0.0.0.0
# Ensure logs are unbuffered
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

########################################
# 3) Final stage: copy runtime + code
########################################

ADD start.sh $APPDIR
RUN chmod 755 $APPDIR/start.sh
COPY app/ $APPDIR/app/
COPY frontend/dist $APPDIR/frontend/dist
RUN chown -R somata $APPDIR

CMD ["./start.sh"]

