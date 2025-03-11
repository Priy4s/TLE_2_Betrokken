CREATE TABLE preferences
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    allow_choice BOOLEAN NOT NULL,
    show_all     BOOLEAN NOT NULL
);
CREATE TABLE dance_progress
(
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    dance_id INTEGER NOT NULL,
    correct  INTEGER NOT NULL,
    wrong    INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (dance_id) REFERENCES dances (id)
);
CREATE TABLE users
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT        NOT NULL,
    code          TEXT UNIQUE NOT NULL,
    preference_id INTEGER,
    role          INTEGER     NOT NULL,
    FOREIGN KEY (preference_id) REFERENCES preferences (id)
);
CREATE TABLE signs
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    video_path TEXT    NOT NULL,
    definition TEXT    NOT NULL,
    model_path TEXT,
    lesson     INTEGER NOT NULL,
    theme      TEXT    NOT NULL
);
CREATE TABLE sentence_sign
(
    sign_id           INTEGER NOT NULL,
    sentence_id       INTEGER NOT NULL,
    sequence_position INTEGER NOT NULL,
    FOREIGN KEY (sentence_id) REFERENCES sentences (id),
    FOREIGN KEY (sign_id) REFERENCES signs (id)
);
CREATE TABLE sentences
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    video_path TEXT NOT NULL,
    definition TEXT NOT NULL,
    model_path TEXT
);
CREATE TABLE conversation_sentence
(
    sentence_id       INTEGER NOT NULL,
    conversation_id   INTEGER NOT NULL,
    sequence_position INTEGER NOT NULL,
    FOREIGN KEY (sentence_id) REFERENCES sentences (id),
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
);
CREATE TABLE conversations
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    video_path TEXT NOT NULL,
    definition TEXT NOT NULL,
    model_path TEXT
);
CREATE TABLE dances
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    video_path TEXT NOT NULL,
    name       TEXT NOT NULL
);
CREATE TABLE dance_sign
(
    sign_id           INTEGER NOT NULL,
    dance_id          INTEGER NOT NULL,
    sequence_position INTEGER NOT NULL,
    FOREIGN KEY (dance_id) REFERENCES dances (id),
    FOREIGN KEY (sign_id) REFERENCES signs (id)
);
CREATE TABLE sign_progress
(
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sign_id INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    wrong   INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (sign_id) REFERENCES signs (id)
);
CREATE TABLE sentence_progress
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    sentence_id INTEGER NOT NULL,
    correct     INTEGER NOT NULL,
    wrong       INTEGER NOT NULL,
    FOREIGN KEY (sentence_id) REFERENCES sentences (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE conversation_progress
(
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,
    conversation_id INTEGER NOT NULL,
    correct         INTEGER NOT NULL,
    wrong           INTEGER NOT NULL,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
CREATE TABLE facial_expressions
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    image_path TEXT NOT NULL
);
CREATE TABLE facial_expression_sign
(
    facial_expression_id INTEGER NOT NULL,
    sign_id              INTEGER NOT NULL,
    FOREIGN KEY (facial_expression_id) REFERENCES facial_expressions (id),
    FOREIGN KEY (sign_id) REFERENCES signs (id)
);
CREATE TABLE keys
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    api_keys   TEXT UNIQUE NOT NULL,
    expires_at INTEGER     NOT NULL
);