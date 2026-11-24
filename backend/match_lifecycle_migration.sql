USE itadakko;

-- Run once on an existing database before restarting the updated backend.
ALTER TABLE board
    ADD COLUMN board_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN locked_by_match_log_id INT,
    ADD COLUMN locked_by_quick_match_id INT;

SET @board_unique_index = (
    SELECT INDEX_NAME
    FROM information_schema.statistics
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'match_log'
      AND COLUMN_NAME = 'board_id'
      AND NON_UNIQUE = 0
    LIMIT 1
);
SET @drop_board_unique = IF(
    @board_unique_index IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE match_log DROP INDEX `', @board_unique_index, '`')
);
PREPARE drop_board_unique_stmt FROM @drop_board_unique;
EXECUTE drop_board_unique_stmt;
DEALLOCATE PREPARE drop_board_unique_stmt;

ALTER TABLE match_log
    ADD COLUMN match_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN canceled_by_user_id INT,
    ADD COLUMN canceled_at DATETIME,
    ADD CONSTRAINT fk_match_canceled_by
        FOREIGN KEY (canceled_by_user_id) REFERENCES `user` (user_ai);

ALTER TABLE board
    ADD CONSTRAINT fk_board_locked_match
        FOREIGN KEY (locked_by_match_log_id) REFERENCES match_log (match_log_id);

UPDATE match_log m
JOIN chat_room c ON c.match_log_id = m.match_log_id
SET m.match_status = CASE
    WHEN c.chat_room_active = 1 THEN 'ACTIVE'
    ELSE 'COMPLETED'
END;

UPDATE board b
SET b.board_status = CASE
    WHEN EXISTS (
        SELECT 1
        FROM match_log m
        JOIN chat_room c ON c.match_log_id = m.match_log_id
        WHERE m.board_id = b.board_id
          AND m.match_status = 'ACTIVE'
          AND c.chat_room_active = 1
    ) THEN 'MATCHED'
    WHEN EXISTS (
        SELECT 1 FROM match_log m WHERE m.board_id = b.board_id
    ) THEN 'CLOSED'
    ELSE 'OPEN'
END,
b.locked_by_match_log_id = (
    SELECT m.match_log_id
    FROM match_log m
    JOIN chat_room c ON c.match_log_id = m.match_log_id
    WHERE m.board_id = b.board_id
      AND m.match_status = 'ACTIVE'
      AND c.chat_room_active = 1
    ORDER BY m.match_log_id DESC
    LIMIT 1
);

UPDATE `match` q
JOIN match_log m ON m.match_log_id = q.match_log_id
SET q.match_status = 'CANCELED'
WHERE q.match_status = 'MATCHED'
  AND m.match_status <> 'ACTIVE';

UPDATE board b
JOIN `user` u ON u.user_ai = b.user_id
JOIN `match` q ON q.user_id = u.user_ai AND q.match_status = 'MATCHED'
JOIN match_log m ON m.match_log_id = q.match_log_id AND m.match_status = 'ACTIVE'
JOIN chat_room c ON c.match_log_id = m.match_log_id AND c.chat_room_active = 1
SET b.board_status = 'MATCHED',
    b.locked_by_match_log_id = m.match_log_id,
    b.locked_by_quick_match_id = NULL
WHERE u.user_local = 1
  AND b.board_status = 'OPEN';

UPDATE board b
JOIN `user` u ON u.user_ai = b.user_id AND u.user_local = 1
JOIN (
    SELECT user_id, MAX(match_id) AS match_id
    FROM `match`
    WHERE match_status = 'WAITING'
    GROUP BY user_id
) latest ON latest.user_id = u.user_ai
JOIN `match` q ON q.match_id = latest.match_id
SET b.board_status = 'QUICK_WAITING',
    b.locked_by_quick_match_id = q.match_id
WHERE b.board_status = 'OPEN';

ALTER TABLE board
    ADD CONSTRAINT fk_board_locked_quick_match
        FOREIGN KEY (locked_by_quick_match_id) REFERENCES `match` (match_id);

CREATE TABLE match_notification (
    notification_id INT NOT NULL AUTO_INCREMENT,
    recipient_user_id INT NOT NULL,
    match_log_id INT NOT NULL,
    notification_message VARCHAR(200) NOT NULL,
    notification_read TINYINT(1) NOT NULL DEFAULT 0,
    notification_created DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (notification_id),
    FOREIGN KEY (recipient_user_id) REFERENCES `user` (user_ai),
    FOREIGN KEY (match_log_id) REFERENCES match_log (match_log_id)
);
