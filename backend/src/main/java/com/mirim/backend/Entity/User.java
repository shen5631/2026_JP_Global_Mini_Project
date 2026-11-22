package com.mirim.backend.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false,name = "user_ai")
    private Integer userAi;
    @Column(nullable = false,name = "user_id", length = 20, unique = true)
    private String userId;
    @Column(nullable = false,name = "user_pw",length = 100)
    private String userPw;
    @Column(nullable = false,name = "user_name",length = 30)
    private String userName;
    @Column(nullable = false,name = "user_nickname", length = 30)
    private String userNickname;
    @Column(nullable = false,name = "user_age")
    private int userAge;
    @Column(nullable = false,name = "user_local")
    private boolean userLocal;
    @Column(name = "user_country",length = 50)
    private String userCountry;
    @Column(name = "user_gender", length = 10, nullable = false)
    private String userGender;
    @Column(name = "category_id")
    private Integer categoryId;
    @CreationTimestamp
    @Column(name = "user_create", nullable = false)
    private LocalDateTime userCreate;

    public User(){

    }

    public User(Integer userAi, String userId, String userPw, String userName, String userNickname, int userAge, boolean userLocal, String userCountry, String userGender, Integer categoryId, LocalDateTime userCreate) {
        this.userAi = userAi;
        this.userId = userId;
        this.userPw = userPw;
        this.userName = userName;
        this.userNickname = userNickname;
        this.userAge = userAge;
        this.userLocal = userLocal;
        this.userCountry = userCountry;
        this.userGender = userGender;
        this.categoryId = categoryId;
        this.userCreate = userCreate;
    }


    public Integer getUserAi() {
        return userAi;
    }

    public void setUserAi(Integer userAi) {
        this.userAi = userAi;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserPw() {
        return userPw;
    }

    public void setUserPw(String userPw) {
        this.userPw = userPw;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserNickname() {
        return userNickname;
    }

    public void setUserNickname(String userNickname) {
        this.userNickname = userNickname;
    }

    public int getUserAge() {
        return userAge;
    }

    public void setUserAge(int userAge) {
        this.userAge = userAge;
    }

    public boolean getUserLocal() {
        return userLocal;
    }

    public void setUserLocal(boolean userLocal) {
        this.userLocal = userLocal;
    }

    public String getUserCountry() {
        return userCountry;
    }

    public void setUserCountry(String userCountry) {
        this.userCountry = userCountry;
    }

    public String getUserGender() {
        return userGender;
    }

    public void setUserGender(String userGender) {
        this.userGender = userGender;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDateTime getUserCreate() {
        return userCreate;
    }

    public void setUserCreate(LocalDateTime userCreate) {
        this.userCreate = userCreate;
    }
}
