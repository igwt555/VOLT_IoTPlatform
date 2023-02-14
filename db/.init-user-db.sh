#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE postgres WITH LOGIN PASSWORD 'volt' VALID UNTIL 'infinity';
  CREATE DATABASE postgres WITH ENCODING='UTF8' OWNER=postgres CONNECTION LIMIT=-1;
EOSQL