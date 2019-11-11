const express = require('express');
const bodyParser = require('body-parser');
const { buildSchema } = require('graphql');
const graphQLHttp = require('express-graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Product = require('./models/product');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphQLHttp({
        schema: buildSchema(`
            type Product {
                _id: ID!
                name: String!
                description: String!
                price: Float!
                quantity: Int!
            }

            input ProductInput {
                name: String!
                description: String!
                price: Float!
                quantity: Int!
            }

            type User{
                _id: ID!
                email: String!
                password: String
            }

            input UserInput{
                email: String!
                password: String!
            }
            
            type RootQuery {
                products: [Product!]!
            }

            type RootMutation {
                createProduct(productInput: ProductInput): Product
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            products: () => {
                return Product.find()
                    .then(products => {
                        return products.map(product => {
                            return {...product._doc, _id: product.id}
                        });
                    })
                    .catch((err) => {
                        throw err;
                        console.log(err);
                    });
            },
            createProduct: (args) => {
                const product = new Product({
                    name: args.productInput.name,
                    description: args.productInput.description,
                    price: +args.productInput.price,
                    quantity: args.productInput.quantity,
                    creator: "5c6b33743029a00610b7968e"
                });
                let createdProduct;
                return product
                    .save()
                    .then(result => {
                        createdProduct = {...result._doc, _id: result._doc._id.toString()};
                        return User.findById('5c6b33743029a00610b7968e');
                    })
                    .then(user => {
                        if(!user){
                            throw new Error('User with specified ID not found');
                        }
                        user.createdProducts.push(product);
                        return user.save();
                    })
                    .then(result => {
                        return createdProduct;
                    })
                    .catch(err => {
                        throw err;
                        console.log(err);
                    });
            },
            createUser: (args) => {
                return User.findOne({email: args.userInput.email})
                    .then(user => {
                        if(user){
                            throw new Error('Email is already in use.');
                        }
                        return bcrypt.hash(args.userInput.password, 12);
                    })
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save();
                    })
                    .then(result => {
                        return {...result._doc, password: null, _id: result.id};
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        },
        graphiql: true
    })
);
//mongodb+srv://trevorjacklitch123:<password>@rest-api-cluster-3goja.mongodb.net/test?retryWrites=true&w=majority
const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@rest-api-cluster-3goja.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose
    .connect(connectionString, { useNewUrlParser: true })
    .then(() => {
        app.listen(4000);
    })
    .catch((err) => {
        console.log(err);
    });