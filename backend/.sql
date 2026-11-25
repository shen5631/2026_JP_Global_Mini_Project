-- 0. DB 생성 및 선택
CREATE DATABASE japan_mini_project;
USE japan_mini_project;

-- 1. category
CREATE TABLE category (
  category_id   INT NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(30) NOT NULL,
  category_text TEXT,
  PRIMARY KEY (category_id)
);

-- 2. user
CREATE TABLE `user` (
    user_ai       INT NOT NULL AUTO_INCREMENT,
    user_id       VARCHAR(20) NOT NULL,
    user_pw       VARCHAR(100) NOT NULL,
    user_name     VARCHAR(30) NOT NULL,
    user_nickname VARCHAR(30) NOT NULL,
    user_country  VARCHAR(50),
    user_age      INT NOT NULL,
    user_create   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_local    TINYINT(1) NOT NULL COMMENT 'true: 현지인 / false: 여행자',
    category_id   INT,
    user_gender   VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_ai),
    UNIQUE KEY uq_user_id (user_id),
    CONSTRAINT fk_user_category
        FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- 3. board
CREATE TABLE board (
   board_id    INT NOT NULL AUTO_INCREMENT,
   user_id     INT NOT NULL,
   category_id INT NOT NULL,
   board_time  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   board_text  TEXT,
   board_head  VARCHAR(100) NOT NULL,
   board_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
   locked_by_match_log_id INT,
   locked_by_quick_match_id INT,
   PRIMARY KEY (board_id),
   CONSTRAINT fk_board_user
       FOREIGN KEY (user_id) REFERENCES `user` (user_ai),
   CONSTRAINT fk_board_category
       FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- 4. match_log (매칭 기록: host = 현지인/모집글 작성자, guest = 여행자/참여자)
CREATE TABLE match_log (
   match_log_id   INT NOT NULL AUTO_INCREMENT,
   category_id    INT NOT NULL,
   match_log_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   board_id       INT,
   guest_user_id  INT NOT NULL,
   host_user_id   INT NOT NULL,
   match_status   VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
   canceled_by_user_id INT,
   canceled_at    DATETIME,
   PRIMARY KEY (match_log_id),
   CONSTRAINT fk_log_category
       FOREIGN KEY (category_id) REFERENCES category (category_id),
   FOREIGN KEY (board_id) REFERENCES board (board_id),
   FOREIGN KEY (guest_user_id) REFERENCES `user` (user_ai),
   FOREIGN KEY (host_user_id) REFERENCES `user` (user_ai),
   FOREIGN KEY (canceled_by_user_id) REFERENCES `user` (user_ai)
);

ALTER TABLE board
    ADD CONSTRAINT fk_board_locked_match
        FOREIGN KEY (locked_by_match_log_id) REFERENCES match_log (match_log_id);

-- 매칭 취소 알림: recipient_user_id 기준으로 다음 접속 시 미확인 알림 조회
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

-- 5. match (빠른 매칭 대기열) - match_log 참조
--    match_status: WAITING(대기) / MATCHED(매칭 확정) / CANCELED(취소)
CREATE TABLE `match` (
     match_id     INT NOT NULL AUTO_INCREMENT,
     user_id      INT NOT NULL,
     category_id  INT,
     match_status VARCHAR(10),
     match_log_id INT,
     match_time   DATETIME,
     PRIMARY KEY (match_id),
     CONSTRAINT fk_match_user
         FOREIGN KEY (user_id) REFERENCES `user` (user_ai),
     FOREIGN KEY (category_id) REFERENCES category (category_id),
     FOREIGN KEY (match_log_id) REFERENCES match_log (match_log_id)
);

ALTER TABLE board
    ADD CONSTRAINT fk_board_locked_quick_match
        FOREIGN KEY (locked_by_quick_match_id) REFERENCES `match` (match_id);

-- 6. chat_room
CREATE TABLE chat_room (
   chat_room_id     INT NOT NULL AUTO_INCREMENT,
   chat_room_active BIT(1) NOT NULL,
   chat_room_create DATETIME(6) NOT NULL,
   match_log_id     INT NOT NULL,
   PRIMARY KEY (chat_room_id),
   UNIQUE (match_log_id),
   FOREIGN KEY (match_log_id) REFERENCES match_log (match_log_id)
);

-- 7. chat_message (채팅 메시지, 한 줄 = 메시지 하나)
CREATE TABLE chat_message (
  chat_message_id      INT NOT NULL AUTO_INCREMENT,
  chat_room_id         INT NOT NULL,
  sender_user_id       INT NOT NULL,
  chat_message_content TEXT NOT NULL,
  chat_message_time    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_message_id),
  FOREIGN KEY (chat_room_id) REFERENCES chat_room (chat_room_id),
  FOREIGN KEY (sender_user_id) REFERENCES `user` (user_ai)
);

-- 8. chat_appointment (채팅방별 공유 약속)
CREATE TABLE chat_appointment (
  appointment_id   INT NOT NULL AUTO_INCREMENT,
  chat_room_id     INT NOT NULL,
  appointment_place VARCHAR(50) NOT NULL,
  appointment_at   DATETIME NOT NULL,
  PRIMARY KEY (appointment_id),
  UNIQUE KEY uq_appointment_chat_room (chat_room_id),
  FOREIGN KEY (chat_room_id) REFERENCES chat_room (chat_room_id)
);

-- 9.
INSERT INTO category (category_name, category_text) VALUES
    ('면 요리', '라멘, 츠케멘, 우동, 소바'),
    ('해산물·스시', '스시, 카이센동, 회, 해산물 요리'),
    ('고기·구이', '야키니쿠, 야키토리, 스테이크, 호르몬'),
    ('밥·정식', '덮밥, 정식, 돈카츠, 튀김, 카레, 양식'),
    ('전골·철판', '나베, 샤브샤브, 스키야키, 오코노미야키, 몬자야키'),
    ('술·안주', '이자카야, 타치노미, 가볍게 한잔'),
    ('카페·디저트', '킷사텐, 와가시, 케이크, 파르페'),
    ('상관없음', '어떤 음식이든 괜찮아요');