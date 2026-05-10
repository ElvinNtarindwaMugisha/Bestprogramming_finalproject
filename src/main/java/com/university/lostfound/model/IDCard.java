package com.university.lostfound.model;

import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "id_cards")
public class IDCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCardId;

    @Column(unique = true)
    private String cardNumber;

    private String status;

    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference // Prevents infinite recursion during Jackson JSON serialization when fetching

    private User owner;

    @OneToMany(mappedBy = "idCard", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnore // Omits claims from standard API payloads to reduce JSON size and avoid

    private List<Claim> claims;

    public Long getIdCardId() {
        return idCardId;
    }

    public void setIdCardId(Long idCardId) {
        this.idCardId = idCardId;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public List<Claim> getClaims() {
        return claims;
    }

    public void setClaims(List<Claim> claims) {
        this.claims = claims;
    }
}