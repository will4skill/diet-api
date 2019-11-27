# Store API

## Project Description
This is a simple API for a diet tracking application. I based the folder structure, authentication and authorization on what I learned in the following course: https://codewithmosh.com/p/the-complete-node-js-course

The basic technology stack is:
* Sequelize + PostgreSQL/SQLite (database)
* Express (web server)
* Jest (testing framework)
* Node.js (run-time environment)

## Project Setup
1. Install Node.js: https://nodejs.org/
2. Download project files
3. ``` $ cd diet-api ``` # navigate to project's root directory
4. ``` $ npm i ``` # install the packages listed in package.json
5. From the command line, set the value of the following environment variables:
    * jwt_private_key: used to create the JSON Web tokens that allow users to securely log in to the application.
        * Example (Mac): ``` $ export diet_api_jwt_private_key=your_private_key ```
    * bcrypt_salt: specifiy the number of rounds used to create the salt used in the hashing algorithm.
        * Example (Mac): ``` $ export diet_api_bcrypt_salt=5 ```
6. ``` $ node sequelize.js ``` # Create development database
7. ``` $ node seed_db ``` # seed the database with quizzes
8. ``` $ NODE_ENV=test node sequelize.js ``` # Create test database
9. ``` $ npm test ``` # Run tests
10. ``` $ npm start ``` # start server
11. Done. You can now use a command line tool like ``` $ curl ```, or an application like Postman to test the API endpoints.
12. ``` $ npm outdated ``` # check for outdated packages
13. ``` $ npm update ``` # update packages

Additional resources that helped me:
* Sequelize Setup:
  * http://docs.sequelizejs.com
  * https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz
  * https://arjunphp.com/restful-api-using-async-await-node-express-sequelize/
  * https://www.youtube.com/watch?v=6NKNfXtKk0c
  * https://stackoverflow.com/questions/23929098/is-multiple-delete-available-in-sequelize
* Sequelize Transactions:
  * https://stackoverflow.com/questions/31095674/create-sequelize-transaction-inside-express-router
  * http://docs.sequelizejs.com/manual/tutorial/transactions.html
  * https://stackoverflow.com/questions/45690000/sequelize-transaction-error?rq=1
* Sequelize Deployement to Heroku:
  * http://docs.sequelizejs.com/manual/installation/usage.html
  * https://sequelize.readthedocs.io/en/1.7.0/articles/heroku/
* Jest Options:
  * https://stackoverflow.com/questions/50171932/run-jest-test-suites-in-groups
* Node Environment Variables:
  * https://stackoverflow.com/questions/9198310/how-to-set-node-env-to-production-development-in-os-x

## App Structure
<p align="center">
  <img alt="Image of App Structure" src="https://raw.github.com/jtimwill/diet-api/master/images/diet-api-diagram.png" />
</p>

## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.github.com/jtimwill/diet-api/master/images/node-diet-erd.png"/>
</p>

## Routes and Resources
### Users Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/users|POST|create a new user|No|No|
/api/users|GET|return all users|Yes|Yes|
/api/users/me|GET|return current user|Yes|No|
/api/users/me|PUT|update current user|Yes|No|
/api/users/:id|DELETE|delete a user|Yes|Yes|

### Login Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/login|POST|return a new JSON web token that can be used to identify the current user|No|No|
