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
   PRIMARY KEY (board_id),
   CONSTRAINT fk_board_user
       FOREIGN KEY (user_id) REFERENCES `user` (user_ai),
   CONSTRAINT fk_board_category
       FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- 4. match
CREATE TABLE `match` (
     match_id   INT NOT NULL AUTO_INCREMENT,
     user_id    INT NOT NULL,
     match_time DATETIME,
     PRIMARY KEY (match_id),
     CONSTRAINT fk_match_user
         FOREIGN KEY (user_id) REFERENCES `user` (user_ai)
);

-- 5. match_log
CREATE TABLE match_log (
   match_log_id   INT NOT NULL AUTO_INCREMENT,
   local_user_id  INT NOT NULL,
   travel_user_id INT NOT NULL,
   category_id    INT NOT NULL,
   match_log_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   board_id       INT,
   guest_user_id  INT NOT NULL,
   host_user_id   INT NOT NULL,
   PRIMARY KEY (match_log_id),
   UNIQUE (board_id),
   CONSTRAINT fk_log_local
       FOREIGN KEY (local_user_id) REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_travel
       FOREIGN KEY (travel_user_id) REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_category
       FOREIGN KEY (category_id) REFERENCES category (category_id),
   FOREIGN KEY (board_id) REFERENCES board (board_id),
   FOREIGN KEY (guest_user_id) REFERENCES `user` (user_ai),
   FOREIGN KEY (host_user_id) REFERENCES `user` (user_ai)
);

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

-- 7.
INSERT INTO category (category_name, category_text) VALUES
    ('면 요리', '라멘, 츠케멘, 우동, 소바'),
    ('해산물·스시', '스시, 카이센동, 회, 해산물 요리'),
    ('고기·구이', '야키니쿠, 야키토리, 스테이크, 호르몬'),
    ('밥·정식', '덮밥, 정식, 돈카츠, 튀김, 카레, 양식'),
    ('전골·철판', '나베, 샤브샤브, 스키야키, 오코노미야키, 몬자야키'),
    ('술·안주', '이자카야, 타치노미, 가볍게 한잔'),
    ('카페·디저트', '킷사텐, 와가시, 케이크, 파르페'),
    ('상관없음', '어떤 음식이든 괜찮아요');