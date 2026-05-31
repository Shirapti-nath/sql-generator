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
const KV_KEY = "pyforge:datastore";

function useKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function loadKv(): Promise<DataStore> {
  const { kv } = await import("@vercel/kv");
  const data = await kv.get<DataStore>(KV_KEY);
  return data ?? { users: [] };
}

async function saveKv(data: DataStore): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(KV_KEY, data);
}

function loadFile(): DataStore {
  if (!existsSync(DATA_FILE)) {
    return { users: [] };
  }
  return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as DataStore;
}

function saveFile(data: DataStore): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function load(): Promise<DataStore> {
  if (useKv()) return loadKv();
  return loadFile();
}

async function save(data: DataStore): Promise<void> {
  if (useKv()) return saveKv(data);
  saveFile(data);
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const data = await load();
  return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const data = await load();
  return data.users.find((u) => u.id === id);
}

export async function createUser(
  email: string,
  password_hash: string,
  display_name: string
): Promise<StoredUser> {
  const data = await load();
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
  await save(data);
  return user;
}
