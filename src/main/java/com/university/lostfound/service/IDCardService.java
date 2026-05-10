package com.university.lostfound.service;

import com.university.lostfound.model.IDCard;
import com.university.lostfound.repository.IDCardRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class IDCardService {

    private final IDCardRepository idCardRepository;

    public IDCardService(IDCardRepository idCardRepository) {
        this.idCardRepository = idCardRepository;
    }

    public List<IDCard> getAllIDCards() {
        return idCardRepository.findAll();
    }

    public Optional<IDCard> getIDCardById(Long id) {
        return idCardRepository.findById(id);
    }

    public IDCard createIDCard(IDCard idCard) {
        if (idCardRepository.existsByCardNumber(idCard.getCardNumber())) {
            throw new RuntimeException("Card number already exists: " + idCard.getCardNumber());
        }
        return idCardRepository.save(idCard);
    }

    public IDCard updateIDCard(Long id, IDCard updated) {
        return idCardRepository.findById(id).map(card -> {
            card.setCardNumber(updated.getCardNumber());
            card.setStatus(updated.getStatus());
            return idCardRepository.save(card);
        }).orElseThrow(() -> new RuntimeException("IDCard not found with id: " + id));
    }

    public Optional<IDCard> findByCardNumber(String cardNumber) {
        return idCardRepository.findByCardNumber(cardNumber);
    }

    public IDCard updateStatus(Long id, String status) {
        return idCardRepository.findById(id).map(card -> {
            card.setStatus(status);
            return idCardRepository.save(card);
        }).orElseThrow(() -> new RuntimeException("IDCard not found: " + id));
    }

    public void deleteIDCard(Long id) {
        idCardRepository.deleteById(id);
    }
}