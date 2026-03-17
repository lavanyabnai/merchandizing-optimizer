// 'server-only';

// import { currentUser } from '@clerk/nextjs/server';
// import { desc, eq } from 'drizzle-orm';
// import { drizzle } from 'drizzle-orm/postgres-js';
// import postgres from 'postgres';

// import { chat as chatTable } from './schema';

// let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
// let db = drizzle(client);

// export async function getUser() {
//   try {
//     const user = await currentUser();
//     if (!user) {
//       return null;
//     }

//     // const user = await clerkClient.users.getUser(userId);
//     return {
//       id: user.id,
//       email: user.emailAddresses[0].emailAddress
//     };
//   } catch (error) {
//     console.error('Failed to get user from Clerk');
//     throw error;
//   }
// }

// // export async function createUser(email: string, password: string) {
// //   let salt = genSaltSync(10);
// //   let hash = hashSync(password, salt);

// //   try {
// //     return await db.insert(user).values({ email, password: hash });
// //   } catch (error) {
// //     console.error('Failed to create user in database');
// //     throw error;
// //   }
// // }

// export async function saveChat({
//   id,
//   messages,
//   userId
// }: {
//   id: string;
//   messages: any;
//   userId: string;
// }) {
//   try {
//     const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

//     if (selectedChats.length > 0) {
//       return await db
//         .update(chat)
//         .set({
//           messages: JSON.stringify(messages)
//         })
//         .where(eq(chat.id, id));
//     }

//     return await db.insert(chat).values({
//       id,
//       createdAt: new Date(),
//       messages: JSON.stringify(messages),
//       userId
//     });
//   } catch (error) {
//     console.error('Failed to save chat in database');
//     throw error;
//   }
// }

// export async function deleteChatById({ id }: { id: string }) {
//   try {
//     return await db.delete(chat).where(eq(chat.id, id));
//   } catch (error) {
//     console.error('Failed to delete chat by id from database');
//     throw error;
//   }
// }

// export async function getChatsByUserId({ id }: { id: string }) {
//   try {
//     return await db
//       .select()
//       .from(chat)
//       .where(eq(chat.userId, id))
//       .orderBy(desc(chat.createdAt));
//   } catch (error) {
//     console.error('Failed to get chats by user from database');
//     throw error;
//   }
// }

// export async function getChatById({ id }: { id: string }) {
//   try {
//     const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
//     return selectedChat;
//   } catch (error) {
//     console.error('Failed to get chat by id from database');
//     throw error;
//   }
// }
