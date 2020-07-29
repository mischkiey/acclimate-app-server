const express = require('express');
const path = require('path')
const UserService = require('./user-services');

const UserRoute = express.Router();

UserRoute
    .route('/')
    .post(express.json(), (req, res, next) => {
        const {user_name, user_password } = req.body;

        for(const field of ['user_name', 'user_password', 'user_full_name'])
            if(!req.body[field])
                return res.status(400).json({error: `Missing '${field}' in body`})

        const passwordError = UserService.validateUserPassword(user_password);

        if(passwordError)
            return res.status(400).json({error: passwordError})
        
        return UserService.hasUserWithUserName(req.app.get('db'), user_name)
            .then(hasUserWithUserName => {
                if(hasUserWithUserName) {
                    return res.status(400).json({error: 'Username not available'})
                }

                return UserService.hashUserPassword(user_password)
                    .then(hashedUserPassword => {

                        const newUser = {
                            ...req.body,
                            user_password: hashedUserPassword,
                        }
        
                        return UserService.insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                        
                                return res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.user_id}`))
                                .json(UserService.serializeUser(user))
                            })
                            .catch(next)
                    })
            })
            .catch(next)
    });

module.exports = UserRoute;