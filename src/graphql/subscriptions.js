/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onConversationAdded = /* GraphQL */ `
  subscription OnConversationAdded($userId: String!) {
    onConversationAdded(userId: $userId) {
      userId
      timestamp
      message
      createdAt
      __typename
    }
  }
`;
