#!/usr/bin/env bash

cd $(dirname $0)

[ -d 'venv' ] && venvfolder='venv' || venvfolder='.venv'
if [ -d ${venvfolder} ]
then
  . ${venvfolder}/bin/activate
  cd app
  python main.py
  deactivate
else
  echo "venv folder ${venvfolder} doesn't exist."
fi
