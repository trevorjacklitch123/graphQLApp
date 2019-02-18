const express = require('express');
const bodyParser = require('body-parser');
const { buildSchema } = require('graphql');
const graphQLHttp = require('express-graphql');
const mongoose = require('mongoose');

const Product = require('./models/product');

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
            
            type RootQuery {
                products: [Product!]!
            }

            type RootMutation {
                createProduct(productInput: ProductInput): Product
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
                        return products;
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
                    quantity: args.productInput.quantity
                });
                return product
                    .save()
                    .then(result => {
                        return result;
                    })
                    .catch(err => {
                        throw err;
                        console.log(err);
                    });
            }
        },
        graphiql: true
    })
);

const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@rest-api-cluster-3goja.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`;

console.log(connectionString);

mongoose
    .connect(connectionString)
    .then(() => {
        app.listen(4000);
    })
    .catch((err) => {
        console.log(err);
    });