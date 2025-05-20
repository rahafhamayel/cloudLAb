/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const logConversation = /* GraphQL */ `
  mutation LogConversation($userId: String!, $message: String!) {
    logConversation(userId: $userId, message: $message) {
      userId
      timestamp
      message
      createdAt
      __typename
    }
  }
`;
