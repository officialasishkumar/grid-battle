import { Client, Session } from "@heroiclabs/nakama-js";
import type { Socket } from "@heroiclabs/nakama-js";

const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST || "127.0.0.1";
const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT || "7350";
const NAKAMA_KEY = import.meta.env.VITE_NAKAMA_KEY || "defaultkey";
const NAKAMA_SSL = import.meta.env.VITE_NAKAMA_SSL === "true";

class NakamaService {
  private client: Client;
  private _session: Session | null = null;
  private _socket: Socket | null = null;

  constructor() {
    this.client = new Client(NAKAMA_KEY, NAKAMA_HOST, NAKAMA_PORT, NAKAMA_SSL);
  }

  get session(): Session | null {
    return this._session;
  }

  get socket(): Socket | null {
    return this._socket;
  }

  get userId(): string | null {
    return this._session?.user_id ?? null;
  }

  get username(): string | null {
    return this._session?.username ?? null;
  }

  /** Authenticate with email + password (creates account if needed). */
  async authenticateEmail(email: string, password: string, username?: string): Promise<Session> {
    this._session = await this.client.authenticateEmail(email, password, true, username);
    await this.connectSocket();
    return this._session;
  }

  /** Authenticate as guest via device ID. */
  async authenticateDevice(username?: string): Promise<Session> {
    let deviceId = localStorage.getItem("grid_battle_device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("grid_battle_device_id", deviceId);
    }
    this._session = await this.client.authenticateDevice(deviceId, true, username);
    await this.connectSocket();
    return this._session;
  }

  /** Restore session from stored token. */
  async restoreSession(): Promise<boolean> {
    const token = localStorage.getItem("grid_battle_token");
    const refreshToken = localStorage.getItem("grid_battle_refresh_token");
    if (!token) return false;

    const session = Session.restore(token, refreshToken || "");
    if (session.isexpired(Date.now() / 1000)) {
      localStorage.removeItem("grid_battle_token");
      localStorage.removeItem("grid_battle_refresh_token");
      return false;
    }

    this._session = session;
    await this.connectSocket();
    return true;
  }

  /** Persist session tokens. */
  private persistSession() {
    if (this._session) {
      localStorage.setItem("grid_battle_token", this._session.token);
      localStorage.setItem("grid_battle_refresh_token", this._session.refresh_token);
    }
  }

  /** Connect the real-time WebSocket. */
  private async connectSocket() {
    if (!this._session) throw new Error("No session");
    this.persistSession();

    if (this._socket) {
      this._socket.disconnect(false);
    }

    this._socket = this.client.createSocket(NAKAMA_SSL, false);
    await this._socket.connect(this._session, true);
  }

  /** Update display name. */
  async updateDisplayName(displayName: string) {
    if (!this._session) throw new Error("No session");
    await this.client.updateAccount(this._session, { display_name: displayName });
  }

  /** RPC call helper. */
  async rpc<T>(id: string, payload?: object): Promise<T> {
    if (!this._session) throw new Error("No session");
    const result = await this.client.rpc(this._session, id, payload || {});
    if (typeof result.payload === "string") {
      return JSON.parse(result.payload) as T;
    }
    return result.payload as T;
  }

  /** Fetch leaderboard records. */
  async getLeaderboard(limit = 20) {
    if (!this._session) throw new Error("No session");
    return this.client.listLeaderboardRecords(this._session, "global_rankings", undefined, limit);
  }

  /** Fetch user profiles by ID. */
  async getUsers(userIds: string[]) {
    if (!this._session) throw new Error("No session");
    return this.client.getUsers(this._session, userIds);
  }

  /** Disconnect and clear session. */
  logout() {
    this._socket?.disconnect(false);
    this._socket = null;
    this._session = null;
    localStorage.removeItem("grid_battle_token");
    localStorage.removeItem("grid_battle_refresh_token");
  }
}

export const nakama = new NakamaService();
