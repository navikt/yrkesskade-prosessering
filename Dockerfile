FROM navikt/node-express:14-alpine

ADD ./ /var/server/

RUN yarn
RUN yarn build:prod

EXPOSE 8000
CMD ["yarn", "start"]