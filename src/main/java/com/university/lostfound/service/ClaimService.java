package com.university.lostfound.service;

import com.university.lostfound.model.Claim;
import com.university.lostfound.model.IDCard;
import com.university.lostfound.repository.ClaimRepository;
import com.university.lostfound.repository.IDCardRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final IDCardRepository idCardRepository;
    private final NotificationService notificationService;

    public ClaimService(ClaimRepository claimRepository,
            IDCardRepository idCardRepository,
            NotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.idCardRepository = idCardRepository;
        this.notificationService = notificationService;
    }

    public Page<Claim> getClaims(int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return claimRepository.findAll(pageable);
    }

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Optional<Claim> getClaimById(Long id) {
        return claimRepository.findById(id);
    }

    public Claim createClaim(Claim claim) {
        return claimRepository.save(claim);
    }

    @Transactional
    public Claim updateClaimStatus(Long id, String status) {
        return claimRepository.findById(id).map(claim -> {
            claim.setClaimType(status);

            if ("CLAIMED".equalsIgnoreCase(status)) {
                IDCard card = claim.getIdCard();
                if (card != null) {
                    card.setStatus("CLAIMED");
                    idCardRepository.save(card);

                    // Clean up existing "found" notifications
                    if (card.getOwner() != null) {
                        notificationService.clearFoundNotifications(card.getOwner(), card.getCardNumber());

                        notificationService.createNotification(
                                "Your ID Card " + card.getCardNumber()
                                        + " has been marked as CLAIMED. Process complete.",
                                card.getOwner());
                    }
                }
            } else if ("REJECTED".equalsIgnoreCase(status)) {
                IDCard card = claim.getIdCard();
                if (card != null && card.getOwner() != null) {
                    notificationService.createNotification(
                            "The claim for your ID Card " + card.getCardNumber()
                                    + " has been REJECTED. Please contact the office.",
                            card.getOwner());
                }
            }

            return claimRepository.save(claim);
        }).orElseThrow(() -> new RuntimeException("Claim not found: " + id));
    }

    public void deleteClaim(Long id) {
        claimRepository.deleteById(id);
    }
}