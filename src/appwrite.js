import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID    = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID   = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

/**
 * Increment the search count for a given term, or insert it if new.
 * Caches the fighter's name and image URL on the document so the
 * trending section can render without a second API roundtrip.
 */
export const updateFighterSearchCount = async (searchTerm, fighter) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        fighter_id:        fighter.id || fighter.slug || '',
        fighter_name:      fighter.name,
        fighter_image_url: fighter.imgUrl || '',
        weight_class:      fighter.category || '',
      });
    }
  } catch (error) {
    // Failing to log a search shouldn't crash the user-facing flow.
    console.error('Appwrite updateFighterSearchCount error:', error);
  }
};

/**
 * Returns the top 5 most-searched fighters, ordered by count descending.
 */
export const getTrendingFighters = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc('count'),
      Query.limit(5),
    ]);
    return result.documents;
  } catch (error) {
    console.error('Appwrite getTrendingFighters error:', error);
    return [];
  }
};
