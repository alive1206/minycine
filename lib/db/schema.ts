import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  real,
  unique,
} from "drizzle-orm/pg-core";

// ─── Users ────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 500 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Refresh Tokens ───────────────────────────────────────────
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Favorites ────────────────────────────────────────────────
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    name: varchar("name", { length: 500 }).notNull(),
    originName: varchar("origin_name", { length: 500 }),
    posterUrl: varchar("poster_url", { length: 1000 }),
    thumbUrl: varchar("thumb_url", { length: 1000 }),
    year: integer("year"),
    quality: varchar("quality", { length: 50 }),
    episodeCurrent: varchar("episode_current", { length: 100 }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (t) => [unique("favorites_user_slug").on(t.userId, t.slug)],
);

// ─── Watch History ────────────────────────────────────────────
export const watchHistory = pgTable(
  "watch_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    movieSlug: varchar("movie_slug", { length: 255 }).notNull(),
    movieName: varchar("movie_name", { length: 500 }).notNull(),
    posterUrl: varchar("poster_url", { length: 1000 }),
    episodeSlug: varchar("episode_slug", { length: 255 }).notNull(),
    episodeName: varchar("episode_name", { length: 255 }),
    currentTime: real("current_time").notNull().default(0),
    duration: real("duration").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    unique("watch_history_user_movie_episode").on(
      t.userId,
      t.movieSlug,
      t.episodeSlug,
    ),
  ],
);

// ─── Types ────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type WatchHistoryEntry = typeof watchHistory.$inferSelect;
export type NewWatchHistoryEntry = typeof watchHistory.$inferInsert;
