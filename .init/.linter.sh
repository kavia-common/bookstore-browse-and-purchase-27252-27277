#!/bin/bash
cd /home/kavia/workspace/code-generation/bookstore-browse-and-purchase-27252-27277/backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

