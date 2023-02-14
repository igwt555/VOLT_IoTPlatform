FROM postgres:13.9

LABEL MAINTAINER Najee McGreen <najee.mcgreen@sunalgo.com>

COPY db.schema.sql /docker-entrypoint-initdb.d

EXPOSE 5432
