-- 0. DB 생성 및 선택
CREATE DATABASE japan_mini_project
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE japan_mini_project;

-- ------------------------------------------------------------
-- 1. category (음식 카테고리) - 다른 테이블이 참조하므로 가장 먼저
-- ------------------------------------------------------------
CREATE TABLE category (
    category_id   INT          NOT NULL AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL,
    category_text VARCHAR(255) NOT NULL,
    PRIMARY KEY (category_id)
);

-- ------------------------------------------------------------
-- 2. user (회원) - category 참조
-- ------------------------------------------------------------
CREATE TABLE `user` (
    user_ai       INT          NOT NULL AUTO_INCREMENT,
    user_id       VARCHAR(20)  NOT NULL,
    user_pw       VARCHAR(100) NOT NULL,
    user_name     VARCHAR(30)  NOT NULL,
    user_nickname VARCHAR(30)  NOT NULL,
    user_country  VARCHAR(50),
    user_age      INT          NOT NULL,
    user_create   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_local    TINYINT(1)   NOT NULL COMMENT 'true: 현지인 / false: 여행자',
    category_id   INT,
    user_gender   VARCHAR(10)  NOT NULL,
    PRIMARY KEY (user_ai),
    UNIQUE KEY uq_user_id (user_id),
    CONSTRAINT fk_user_category
        FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- ------------------------------------------------------------
-- 3. board (모집 게시글) - user, category 참조
-- ------------------------------------------------------------
CREATE TABLE board (
    board_id    INT         NOT NULL AUTO_INCREMENT,
    user_id     INT         NOT NULL,
    category_id INT         NOT NULL,
    board_time  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    board_text  VARCHAR(255),
    board_head  VARCHAR(40) NOT NULL,
    PRIMARY KEY (board_id),
    CONSTRAINT fk_board_user
        FOREIGN KEY (user_id) REFERENCES `user` (user_ai),
    CONSTRAINT fk_board_category
        FOREIGN KEY (category_id) REFERENCES category (category_id)
);

-- ------------------------------------------------------------
-- 4. match (빠른 매칭 요청) - user 참조
--    match는 MySQL 예약어라 백틱(`) 필수
-- ------------------------------------------------------------
CREATE TABLE `match` (
 match_id   INT NOT NULL AUTO_INCREMENT,
 user_id    INT NOT NULL,
 match_time DATETIME,
 PRIMARY KEY (match_id),
 CONSTRAINT fk_match_user
     FOREIGN KEY (user_id) REFERENCES `user` (user_ai)
);

-- ------------------------------------------------------------
-- 5. match_log (매칭 기록) - user, category, board 참조
-- ------------------------------------------------------------
CREATE TABLE match_log (
   match_log_id   INT      NOT NULL AUTO_INCREMENT,
   local_user_id  INT      NOT NULL,
   travel_user_id INT      NOT NULL,
   category_id    INT      NOT NULL,
   match_log_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   board_id       INT,
   guest_user_id  INT      NOT NULL,
   host_user_id   INT      NOT NULL,
   PRIMARY KEY (match_log_id),
   UNIQUE KEY uq_log_board (board_id),
   CONSTRAINT fk_log_local
       FOREIGN KEY (local_user_id)  REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_travel
       FOREIGN KEY (travel_user_id) REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_guest
       FOREIGN KEY (guest_user_id)  REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_host
       FOREIGN KEY (host_user_id)   REFERENCES `user` (user_ai),
   CONSTRAINT fk_log_category
       FOREIGN KEY (category_id)    REFERENCES category (category_id),
   CONSTRAINT fk_log_board
       FOREIGN KEY (board_id)       REFERENCES board (board_id)
);

-- ------------------------------------------------------------
-- 6. chat_room (채팅방) - match_log 참조, 가장 마지막
-- ------------------------------------------------------------
CREATE TABLE chat_room (
   chat_room_id     INT         NOT NULL AUTO_INCREMENT,
   chat_room_active BIT(1)      NOT NULL,
   chat_room_create DATETIME(6) NOT NULL,
   match_log_id     INT         NOT NULL,
   PRIMARY KEY (chat_room_id),
   UNIQUE KEY uq_chat_match_log (match_log_id),
   CONSTRAINT fk_chat_match_log
       FOREIGN KEY (match_log_id) REFERENCES match_log (match_log_id)
);

-- ------------------------------------------------------------
-- 7. 카테고리 초기 데이터 (ID는 1부터 순서대로 들어감)
-- ------------------------------------------------------------
INSERT INTO category (category_name, category_text) VALUES
    ('면 요리',      '라멘, 츠케멘, 우동, 소바'),
    ('해산물·스시',  '스시, 카이센동, 회, 해산물 요리'),
    ('고기·구이',    '야키니쿠, 야키토리, 스테이크, 호르몬'),
    ('밥·정식',      '덮밥, 정식, 돈카츠, 튀김, 카레, 양식'),
    ('전골·철판',    '나베, 샤브샤브, 스키야키, 오코노미야키, 몬자야키'),
    ('술·안주',      '이자카야, 타치노미, 가볍게 한잔'),
    ('카페·디저트',  '킷사텐, 와가시, 케이크, 파르페'),
    ('상관없음',     '어떤 음식이든 괜찮아요');

-- ------------------------------------------------------------
-- 8. 확인용 (결과에 테이블 6개, 카테고리 8개가 나오면 성공)
-- ------------------------------------------------------------
SHOW TABLES;
SELECT * FROM category;
