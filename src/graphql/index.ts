import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import * as notes from '../services/notes.js';

// 1. Визначаємо тип для вашого custom context
export type GraphQLContext = YogaInitialContext & {
  userId: string;
};

// 2. Передаємо тип контексту в createSchema
const schema = createSchema<GraphQLContext>({
  typeDefs: `
    type Tag  { id: ID!  name: String! }
    type Note {
      id: ID!
      title: String!
      content: String!
      tags: [Tag!]!
      createdAt: String!
    }

    type Query {
      notes: [Note!]!      
      note(id: ID!): Note   
    }

    type Mutation {
      createNote(title: String!, content: String!, tags: [String!]): Note!
    }
  `,
  resolvers: {
    Query: {
      notes: (_parent, _args, ctx) => notes.listNotes(ctx.userId),
      note:  (_parent, args, ctx)  => notes.getNoteById(ctx.userId, args.id),
    },
    Mutation: {
      createNote: (_parent, args, ctx) => notes.createNote(ctx.userId, args),
    },
  },
});

// 3. Передаємо тип у createYoga
export const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/graphql',
  context: ({ request }) => {
    const auth = request.headers.get('authorization') ?? '';
    const token = auth.replace('Bearer ', '');
    
    // Примітка: якщо токен буде відсутній або невалідний, jwt.verify викине помилку.
    // Якщо треба обробляти неавторизовані запити, можна додати try/catch.
    const { userId } = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    
    return { userId };
  },
});