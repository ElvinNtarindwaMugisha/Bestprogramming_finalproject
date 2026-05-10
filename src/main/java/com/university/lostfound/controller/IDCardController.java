package com.university.lostfound.controller;

import com.university.lostfound.model.IDCard;
import com.university.lostfound.service.IDCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/idcards")
public class IDCardController {

    private final IDCardService idCardService;

    public IDCardController(IDCardService idCardService) {
        this.idCardService = idCardService;
    }

    @GetMapping
    public List<IDCard> getAllIDCards() {
        return idCardService.getAllIDCards();
    }

    @GetMapping("/search")
    public ResponseEntity<IDCard> searchByCardNumber(@RequestParam String cardNumber) {
        return idCardService.findByCardNumber(cardNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IDCard> getIDCardById(@PathVariable Long id) {
        return idCardService.getIDCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<IDCard> createIDCard(@RequestBody IDCard idCard) {
        try {
            return ResponseEntity.ok(idCardService.createIDCard(idCard));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<IDCard> updateIDCard(@PathVariable Long id, @RequestBody IDCard idCard) {
        try {
            return ResponseEntity.ok(idCardService.updateIDCard(id, idCard));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IDCard> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            return ResponseEntity.ok(idCardService.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIDCard(@PathVariable Long id) {
        idCardService.deleteIDCard(id);
        return ResponseEntity.noContent().build();
    }
}