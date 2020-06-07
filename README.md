![NodeJS](https://img.shields.io/badge/node-12.16.1-green.svg)
![NPM](https://img.shields.io/badge/npm-6.13.2-blue.svg)
![MongoDB](https://img.shields.io/badge/mongo-4.2.0-green.svg)

# REST API Server

## Table of Contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Configuration](#configuration) 
- [Quick start](#quick-start)

# Dependencies

- [ ] NodeJS - >= 12.16.1
- [ ] NPM - >= 6.13.2
- [ ] MongoDB - 4.2 ( otherwise provide atlas url in .env with key MONGODB_CONNECTION_STRING ) 

# Installation

```bash
$ npm install
```

# Commit
1- run `git add .` and then run `npm run commit`

2- if you want to do it manually, please write commit in this way

- list: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

`<item from above list>(name of files changed): your proper commit message`


# Configuration

add config folder and .env in your code manually

# Quick Start
- `npm run start`
- `npm run start-dev` (to run app with nodemon)
- `envoinment variables`
- MONGODB_CONNECTION_STRING
- LOGGER_LEVEL
- HASH_SALT
- PORT

# Architectural Overview
I have used a 3 layer architecture `controller/router,service,models with a pub/sub`.

 ![Architecture Diagram](static/archi_diagram.png?raw=true "Title")

## Folder Structure  
``` 
Dlack-POC
  │   app.js          # App entry point
  └───api             # Express route controllers for all the endpoints of the app
  └───core            # contains core file like server, database, logger, apierror, response and utils.
  └───config          # contains a default config application configuration
  └───models          # Database models
  └───services        # All the business logic is here
  └───subscribers     # Event handlers for async task
  ```
## Adding new routes
I have made things more generic so developer doesn't face any issue related to writing routes adding service and other dependency using dependency injection principle.
##### Note: (Dependency injection is not fully implemented, as its a poc so just add it on main files also doesnt use any DI container but made a common file to made that container which will simply return services instances.)

- To add a new routes open `api/controllers` folder, create a file with name `<your-name>Contoller.js`
Controller word is a must at the end of file in this way loader can easily load controller file.
 
- extend your controller with base controller like shown in below example

```` 
const BaseController = require("../../BaseController")

class TestController extends BaseController {
    constructor(TestService, APIError, Response) { //TestService is an instance of TestService 
        super(TestService, APIError, Response);
        this.itemService = TestService
        this.ApiError = APIError
        this.Response = Response
        this.resource = "test" // Role resource
    }
}

module.exports = (ItemService, APIError, Response) => new ItemController(ItemService, APIError, Response)
    .getRouter({
        controller: this,
        path: "/v1/item"
    })
````  

- `ApiError` -> Generic error handler class, `ResPonse` ->  Generic response class

Now the lets add new route by default your controller has below routes with there default `contorller methods`  and `service methods` configured as i have implemented common logic to reuse common crud api endpoints. Look at Base controller code.

````
const HttpStatusCodes = require("http-status-codes")
const Router = require("../core/Router")
const {authorize, authenticate} = require("../middlewares/authorization")

class BaseController {

    constructor(service, APIError, Response) {
        if(!service)
            throw new APIError({
                message: "Service instance required",
                status: HttpStatusCodes.INTERNAL_SERVER_ERROR
            })
        this.service = service;
        this.APIError = APIError;
        this.Response = Response;
        this.create = this.create.bind(this);
        this.readOne = this.readOne.bind(this);
        this.readMany = this.readMany.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req, res, next) {
        try {
            let result = await this.service.create(req.body)
            return new this.Response({
                status: HttpStatusCodes.CREATED,
                data: result,
                meta: {
                    message: "Record created"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async readOne(req, res, next) {
        try {
            let result = await this.service.readOne(req.params.id)
            return new this.Response({
                status: result ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result ? "Record found" : "Record not found"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }


    async readMany(req,res, next) {
        try {
            let result = await this.service.readMany()
            return new this.Response({
                status: result.length ? HttpStatusCodes.OK : HttpStatusCodes.NOT_FOUND,
                data: result,
                meta: {
                    message: result.length ? "Record found" : "No record found"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    async update(req, res, next) {
        try {
            const changedEntry = req.body;
            let result = await this.service.update(id, changedEntry);

            return new this.Response({
                status: result.nModified ? HttpStatusCodes.OK : HttpStatusCodes.BAD_REQUEST,
                meta: {
                    message: result.nModified ? "Record update" : "Record not updated"
                }
            })
        }catch (err) {
            return this.APIError.normalize(err)
        }
    }

    async delete(req, res, next) {
        try {
            await this.service.delete(id);
            return new this.Response({
                meta: {
                    message: "Record deleted"
                }
            })
        }catch(err) {
            return this.APIError.normalize(err)
        }
    }

    getRouter({
                  path,
                  routes = {},
                  controllerMiddleware = []
              }) {
        let routerMeta = {
            path,
            controller: this,
            routes: {
                GET: {
                    "/": [...controllerMiddleware, authenticate, authorize("read", this.resource), "readMany"],
                    "/:id": [...controllerMiddleware, authenticate, authorize("read", this.resource), "readOne"]

                },
                POST: {
                    "/": [...controllerMiddleware, authenticate, authorize("create", this.resource) ,"create"]
                },
                PUT: {
                    "/:id": [...controllerMiddleware, authenticate, authorize("update", this.resource),  "update"]
                },
                DELETE: {
                    "/:id": [...controllerMiddleware, authenticate, authorize("delete", this.resource), "delete"]
                }
            }
        }

        Object.keys(routes).forEach((action) => {
            if(routerMeta.routes[action]) {
                routerMeta.routes[action] = {...routerMeta.routes[action], ...routes[action]}
            }else {
                routerMeta.routes[action] = routes[action]
            }
        })

        return new Router(routerMeta).registerRoutes()

    }

}

module.exports = BaseController

````

If you want add a new route you can see below example.
````
In getRouter method of our controller. This method has following parameter

@param contoller:  Object // your controllers this
@param path: String // Your controllers base path,
@params controllerMiddleware: Array // of middleware methods, this could be usefull if u want some specific middleware only for your controller otherwise leave this empty.
@params route: Object // to define your routes
Let me elobarate route param more 
routes: {
            POST: { 
                "/login": ["login"]
            }
        }
In route object define Http verb as key then in that object your path as key and on right side array of middlewares for specific routes with controller method name at the end.
Lets suppose i want to add GET /XYZ route with a middleware XYZ and and controller method XYZ

Then your .getRoutes method would be like this.
getRouter({
        controller: this,
        path: "/v1/dummy",
        route: {
            GET: {
                "/XYZ":[XYZ, "XYZ"] //first element is middleware func and second is string which is the name of controller method and it shoudl on last.
            }
        }
    })
````

## Add Service
You have to create a service in services folder and extend that from base Service and your service will have 4 basic crud operations.
You can override them also in your service.
Import your service in index file and return an instances from index.
Name of controller and service should be same to support automation.

## Add Model
Add a model in models folder.

## Naming Convention for service, model and controller
<Your-FileName><Service | Model | Controller>.js
example
Suppose i want to write endpoints for users, then file names should be.

- UserController.js
- UserService.js
- UserModel.js


## Note: 
Please create an issues and improvements u found, i will fix them or if u have any query.
