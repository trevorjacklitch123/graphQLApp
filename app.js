const express = require('express');
const bodyParser = require('body-parser');
const { buildSchema } = require('graphql');
const graphQLHttp = require('express-graphql');

const app = express();

const products = [];

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
                return products;
            },
            createProduct: (args) => {
                const product = {
                    _id: Math.random() * 100,
                    name: args.productInput.name,
                    description: args.productInput.description,
                    price: args.productInput.price,
                    quantity: args.productInput.quantity
                };
                products.push(product);
                return product;
            }
        },
        graphiql: true
    })
);

app.listen(4000);