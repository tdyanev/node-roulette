#!/bin/bash

npm install

mysql -u root -p < schema.sql

cp .env.example .env