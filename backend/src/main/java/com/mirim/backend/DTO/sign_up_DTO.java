package com.mirim.backend.DTO;

import java.time.LocalDateTime;

public class sign_up_DTO {
    private int userId;
    private String userPw;
    private String userName;
    private String userNickname;
    private int userAge;
    private boolean userLocal;
    private String userCountry;
    private String userGender;
    private int categoryId;

    public int getUserId() {
        return userId;
    }

    public String getUserPw() {
        return userPw;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserNickname() {
        return userNickname;
    }

    public int getUserAge() {
        return userAge;
    }

    public boolean isUserLocal() {
        return userLocal;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public void setUserPw(String userPw) {
        this.userPw = userPw;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserNickname(String userNickname) {
        this.userNickname = userNickname;
    }

    public void setUserAge(int userAge) {
        this.userAge = userAge;
    }

    public void setUserLocal(boolean userLocal) {
        this.userLocal = userLocal;
    }

    public void setUserCountry(String userCountry) {
        this.userCountry = userCountry;
    }

    public void setUserGender(String userGender) {
        this.userGender = userGender;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public String getUserCountry() {
        return userCountry;
    }

    public String getUserGender() {
        return userGender;
    }

    public int getCategoryId() {
        return categoryId;
    }
}
