#!/usr/bin/env bash

request="$(node bin/generateTestHeapHeaders.js "$@")"

eval "$request"