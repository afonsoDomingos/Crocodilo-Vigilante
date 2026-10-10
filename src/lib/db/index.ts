/**
 * DB index — re-exporta os utilitários de conexão Mongoose.
 * O motor de ficheiros JSON foi substituído por MongoDB (Mongoose).
 */
export { connectToDatabase } from './mongoose';
export { seedDatabaseIfEmpty } from './repository';
