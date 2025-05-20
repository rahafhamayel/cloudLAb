/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getConversationHistory = /* GraphQL */ `
  query GetConversationHistory($userId: String!) {
    getConversationHistory(userId: $userId) {
      userId
      timestamp
      message
      createdAt
      __typename
    }
  }
`;
