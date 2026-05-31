import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

interface DataStore {
  users: StoredUser[];
}

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "pyforge.json");

function load(): DataStore {
  if (!existsSync(DATA_FILE)) {
    return { users: [] };
  }
  return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as DataStore;
}

function save(data: DataStore): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return load().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  return load().users.find((u) => u.id === id);
}

export function createUser(email: string, password_hash: string, display_name: string): StoredUser {
  const data = load();
  if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const user: StoredUser = {
    id: randomUUID(),
    email: email.toLowerCase(),
    password_hash,
    display_name,
    created_at: new Date().toISOString(),
  };
  data.users.push(user);
  save(data);
  return user;
}
