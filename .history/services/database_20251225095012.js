import * as SQLite from "expo-sqlite"; 
 
export const db = SQLite.openDatabaseSync("todos.db"); 
 
export const initDB = () => { 
 db.execSync(` 
   CREATE TABLE IF NOT EXISTS todos ( 
     id INTEGER PRIMARY KEY,