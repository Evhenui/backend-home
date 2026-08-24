import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { notesService } from '../services/notes.js';

export type GraphQLContext = YogaInitialContext & {
  userId: string;
};

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
      notes: async (_parent, _args, ctx) => {
        const result = await notesService.list(ctx.userId, { 
          page: 1, 
          limit: 100, 
          sort: 'createdAt', 
          order: 'desc' 
        });
        return result.data;
      },
      note: (_parent, args, ctx) => notesService.getById(args.id, ctx.userId),
    },
    Mutation: {
      createNote: (_parent, args, ctx) => notesService.create(args, ctx.userId),
    },
  },
});

export const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/graphql',
  context: ({ request }) => {
    const auth = request.headers.get('authorization') ?? '';
    const token = auth.replace('Bearer ', '');
    const { userId } = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    return { userId };
  },
});