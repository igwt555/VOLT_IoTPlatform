# Volt Reloaded

## Project Summary / Goal

This is an [IoT](https://aws.amazon.com/what-is/iot/) device management platform. It allows businesses (selling to consumers), educational institutions (working with students), and makers/hobbyists to quickly get their `device` working with a cloud backend that can help them store/record events from their device, and perform advance analytics. Businesses can whitelabel the site, customizing dashboards, logos, and other sections for resale to their customers.

The APIs on the platform are exposed for the device SDKs to be able to send and retrieve data to facilitate device operation. Users can use the Volt backend to facilitate device auth workflows, save/retrieve configuration data, or otherwise leverage the platform for alerting.

More to come - we're just getting started!

## Local development
- Node Version: **16**
- Install dependecies: `yarn install`

1. Run frontend: `yarn run start:ui` (runs on port 5173) via [Vite](https://vitejs.dev/)
2. Run backend: `yarn run start:api` (runs on port 5000) via [Express.js](http://expressjs.com/)
3. (When needed) Run [docusaurus](https://docusaurus.io/): `yarn run start:docs`

### Some project opinionated decisions:
1. We use JWTs for user auth. Express middleware provides a req.user object with user (role/org, etc) information
2. We try to align with classical/traditional MVC as much as possible - using "service" classes only when we need code re-use (as opposed to pre-emptively), otherwise backend Controllers call Models directly. Front-end components directly make http (axios) calls, rather than routing through the store or a service, unless we need re-use.
3. This is a monorepo: back-end Express.js app in `./packages/api`, and front-end Vue.js app in `./packages/ui`.  
3a. At deploy-time, front end gets compiled to static html ([SSG](https://vuejs.org/guide/extras/ways-of-using-vue.html#jamstack-ssg)) and served out of the express.js `public` folder

## Project management
Project tasks/priorities are tracked in [JIRA](https://sunalgo.atlassian.net/jira/software/c/projects/VOLT/boards/3)

### Link the JIRA ticket to your pull request
1. (**preferred**) prefix the JIRA ticket in your PR title like so: `[VOLT-33] Transition front-end to Vite`, or
2. You can use JIRA to create a branch name for your task/project right from the ticket, or
3. You can create your own custom branch names - just make sure to prefix it wit the ticket name like so `VOLT-9-transition-to-Vite`

## Contributing
1. Please review your pull request to see if the build passes and resolve any lint or logic issues before leaving for that day. As a result, do not request peer review when you have newly introduced build issues to resolve.
2. Please avoid adding *merge commits* to your pull request. We try to keep a [linear git history](https://dev.to/bladesensei/avoid-messy-git-history-3g26). Before pushing your code, grab the latest copy of master (`git fetch origin master`), and rebase your changes ontop of that fresh copy of master `git rebase origin/master`
3. If you have multiple fixup/bugfix commits, [squash](https://www.git-tower.com/learn/git/faq/git-squash/) your commits. As code is merged to master, each commit should represent an **atomic** feature in its entirety, and that commit should be something that builds and runs without depending on the next commit, such that it is a valid rollback target
4. With the above said, squash only related commits. Independent features deserve their own commit, and potentially could have been put on a seperate PR
5. Do not push directly to master
