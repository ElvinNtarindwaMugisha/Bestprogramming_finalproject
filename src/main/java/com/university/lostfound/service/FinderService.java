package com.university.lostfound.service;

import com.university.lostfound.model.*;
import com.university.lostfound.repository.*;
import com.university.lostfound.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FinderService {

    private final FinderRepository finderRepository;
    private final IDCardRepository idCardRepository;
    private final ClaimRepository claimRepository;
    private final NotificationService notificationService;
    private final LocationRepository locationRepository;

    public FinderService(FinderRepository finderRepository,
            IDCardRepository idCardRepository,
            ClaimRepository claimRepository,
            NotificationService notificationService,
            LocationRepository locationRepository) {
        this.finderRepository = finderRepository;
        this.idCardRepository = idCardRepository;
        this.claimRepository = claimRepository;
        this.notificationService = notificationService;
        this.locationRepository = locationRepository;
    }

    public List<Finder> getAllFinders() {
        return finderRepository.findAll();
    }

    public Optional<Finder> getFinderById(Long id) {
        return finderRepository.findById(id);
    }

    @Transactional
    public Finder createFinder(Finder finder) {

        if (finder.getLocation() != null && finder.getLocation().getCode() != null) {
            String villageCode = finder.getLocation().getCode();
            Location location = locationRepository.findByCode(villageCode)
                    .orElseThrow(() -> new RuntimeException("Village not found with code: " + villageCode));
            finder.setLocation(location);
        }

        IDCard idCard = idCardRepository.findByCardNumber(finder.getCardNumber())
                .orElseThrow(() -> new RuntimeException("IDCard not found with cardNumber: " + finder.getCardNumber()));

        idCard.setStatus("FOUND");
        idCardRepository.save(idCard);

        Finder savedFinder = finderRepository.save(finder);

        List<Claim> claims = idCard.getClaims();
        if (claims != null && !claims.isEmpty()) {
            Claim claim = claims.get(0);
            claim.setClaimType("FOUND");
            claim.setFoundLocation(finder.getFoundLocation());
            claim.setFinder(savedFinder);
            claimRepository.save(claim);
        } else {

            Claim claim = new Claim();
            claim.setClaimType("FOUND");
            claim.setFoundLocation(finder.getFoundLocation());
            claim.setIdCard(idCard);
            claim.setFinder(savedFinder);
            claimRepository.save(claim);
        }

        User user = idCard.getOwner();
        if (user != null) {
            notificationService.createNotification(
                    "Your ID card " + idCard.getCardNumber()
                            + " has been found at " + finder.getFoundLocation()
                            + ". Please collect it from the Lost & Found Office.",
                    user);
        }

        return savedFinder;
    }

    public Finder updateFinder(Long id, Finder updated) {
        return finderRepository.findById(id).map(f -> {
            f.setFullName(updated.getFullName());
            f.setPhoneNumber(updated.getPhoneNumber());
            return finderRepository.save(f);
        }).orElseThrow(() -> new RuntimeException("Finder not found with id: " + id));
    }

    public void deleteFinder(Long id) {
        finderRepository.deleteById(id);
    }
}